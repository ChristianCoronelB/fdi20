import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/certificates/[id] - Get certificate by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    const { id } = await params;
    
    const certificate = await db.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: { name: true, startDate: true, endDate: true, location: true },
        },
      },
    });
    
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificado no encontrado' },
        { status: 404 }
      );
    }
    
    // Check authorization
    if (session && certificate.userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener certificado' },
      { status: 500 }
    );
  }
}

// DELETE /api/certificates/[id] - Delete certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    
    const certificate = await db.certificate.findUnique({
      where: { id },
    });
    
    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificado no encontrado' },
        { status: 404 }
      );
    }
    
    // Only admins can delete certificates
    if (session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    await db.certificate.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Certificado eliminado',
    });
  } catch (error) {
    console.error('Delete certificate error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar certificado' },
      { status: 500 }
    );
  }
}
