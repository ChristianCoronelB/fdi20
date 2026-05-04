import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordChangedEmail } from '@/lib/email';
import * as bcrypt from 'bcryptjs';

// GET - Validar token de restablecimiento
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token no proporcionado',
      }, { status: 400 });
    }

    // Buscar token en la base de datos
    const passwordReset = await db.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido o ya utilizado',
      }, { status: 400 });
    }

    // Verificar si ya fue usado
    if (passwordReset.usedAt) {
      return NextResponse.json({
        success: false,
        error: 'Este enlace ya fue utilizado. Solicita uno nuevo si necesitas cambiar tu contraseña.',
      }, { status: 400 });
    }

    // Verificar si ha expirado
    if (passwordReset.expiresAt < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'El enlace ha expirado. Solicita uno nuevo para restablecer tu contraseña.',
      }, { status: 400 });
    }

    // Token válido
    return NextResponse.json({
      success: true,
      email: passwordReset.user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Email ofuscado
      name: passwordReset.user.name,
    });

  } catch (error) {
    console.error('Error validando token:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al validar el token',
    }, { status: 500 });
  }
}

// POST - Restablecer contraseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validaciones
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token no proporcionado',
      }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        error: 'Las contraseñas no coinciden',
      }, { status: 400 });
    }

    // Buscar token en la base de datos
    const passwordReset = await db.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido',
      }, { status: 400 });
    }

    // Verificar si ya fue usado
    if (passwordReset.usedAt) {
      return NextResponse.json({
        success: false,
        error: 'Este enlace ya fue utilizado',
      }, { status: 400 });
    }

    // Verificar si ha expirado
    if (passwordReset.expiresAt < new Date()) {
      return NextResponse.json({
        success: false,
        error: 'El enlace ha expirado',
      }, { status: 400 });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar contraseña y marcar token como usado en una transacción
    await db.$transaction([
      db.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
      }),
      db.passwordReset.update({
        where: { id: passwordReset.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Eliminar sesiones existentes para forzar nuevo login
    await db.session.deleteMany({
      where: { userId: passwordReset.userId },
    });

    // Enviar email de confirmación
    await sendPasswordChangedEmail(passwordReset.user.email);

    console.log(`✅ Contraseña actualizada para: ${passwordReset.user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    });

  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al restablecer la contraseña',
    }, { status: 500 });
  }
}
