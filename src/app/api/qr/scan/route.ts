import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { scanQRCode } from '@/lib/qr';

// POST: Scan and process QR code
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Código QR requerido' },
        { status: 400 }
      );
    }

    console.log('[API] Processing QR scan for user:', session.userId, 'code:', code);

    // Process QR code scan
    const result = await scanQRCode(code.trim(), session.userId);

    console.log('[API] Scan result:', result);

    // Get updated user points
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { points: true, level: true }
    });

    // Build response data
    const responseData: any = {
      type: result.type,
      message: result.message,
      ...result.data,
      totalPoints: user?.points || 0,
      level: user?.level || 1,
    };

    // Return the result with the message
    return NextResponse.json({
      success: result.success,
      data: responseData,
      // Also include error at top level for easier frontend handling
      error: result.success ? undefined : result.message,
    });

  } catch (error) {
    console.error('[API] Scan QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
