import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import { randomBytes } from 'crypto';

// POST - Solicitar recuperación de contraseña
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json({
        success: false,
        error: 'El correo electrónico es requerido',
      }, { status: 400 });
    }

    // Normalizar email
    const normalizedEmail = email.toLowerCase().trim();

    // Buscar usuario por email
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Por seguridad, siempre respondemos lo mismo aunque el usuario no exista
    // Esto previene ataques de enumeración de usuarios
    const successMessage = 'Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña.';

    if (!user) {
      // No revelar que el usuario no existe
      console.log(`📧 Intento de recuperación para email no registrado: ${normalizedEmail}`);
      return NextResponse.json({
        success: true,
        message: successMessage,
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      console.log(`📧 Intento de recuperación para usuario inactivo: ${normalizedEmail}`);
      return NextResponse.json({
        success: true,
        message: successMessage,
      });
    }

    // Eliminar tokens anteriores no usados para este usuario
    await db.passwordReset.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generar token único
    const token = randomBytes(32).toString('hex');
    
    // Token expira en 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar token en la base de datos
    await db.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Construir URL de restablecimiento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : request.headers.get('origin') || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password`;

    // Enviar email
    const emailResult = await sendPasswordResetEmail(user.email, token, resetUrl);

    if (!emailResult.success) {
      console.error('Error enviando email de recuperación:', emailResult.error);
      // No revelar el error de email al usuario por seguridad
    }

    console.log(`📧 Email de recuperación enviado a: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: successMessage,
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al procesar la solicitud. Por favor, intenta de nuevo más tarde.',
    }, { status: 500 });
  }
}
