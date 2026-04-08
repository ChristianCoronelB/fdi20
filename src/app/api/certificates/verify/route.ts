import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/certificates/verify - Verify certificate by code
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Código de certificado requerido' },
        { status: 400 }
      );
    }
    
    const certificate = await db.certificate.findUnique({
      where: { code },
      include: {
        user: {
          select: { name: true, email: true },
        },
        event: {
          select: { name: true, startDate: true, endDate: true },
        },
      },
    });
    
    if (!certificate) {
      return NextResponse.json({
        success: false,
        error: 'Certificado no encontrado o código inválido',
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        certificate: {
          code: certificate.code,
          title: certificate.title,
          type: certificate.type,
          issueDate: certificate.issueDate,
          userName: certificate.user.name,
          eventName: certificate.event?.name,
        },
        valid: true,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar certificado' },
      { status: 500 }
    );
  }
}
