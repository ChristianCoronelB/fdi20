import { NextRequest, NextResponse } from 'next/server';
import { register, setSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, acceptedTerms } = body;
    
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }
    
    // Validar aceptación de términos y condiciones
    if (!acceptedTerms) {
      return NextResponse.json(
        { success: false, error: 'Debes aceptar los términos y condiciones para registrarte' },
        { status: 400 }
      );
    }
    
    try {
      const result = await register({
        email,
        password,
        name,
        role,
        acceptedTerms: true, // Pasar la aceptación de términos
      });
      
      await setSession(result.token);
      
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
            avatar: result.user.avatar,
            points: result.user.points,
            level: result.user.level,
          },
          token: result.token,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Email already registered') {
        return NextResponse.json(
          { success: false, error: 'El email ya está registrado' },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
