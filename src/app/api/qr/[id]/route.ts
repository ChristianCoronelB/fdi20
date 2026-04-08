import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { generateQRCode } from '@/lib/qr';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get QR code details with QR image
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const qrCode = await db.qRCode.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startTime: true,
            endTime: true,
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'Código QR no encontrado' },
        { status: 404 }
      );
    }

    // Generate QR image
    const qrImage = await generateQRCode(qrCode.code);

    return NextResponse.json({
      success: true,
      data: {
        ...qrCode,
        qrImage,
      },
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate QR code
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Only admins and organizers can deactivate QR codes
    if (!hasRole(session.role, ['ADMIN', 'ORGANIZER'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para desactivar códigos QR' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const qrCode = await db.qRCode.findUnique({
      where: { id },
    });

    if (!qrCode) {
      return NextResponse.json(
        { success: false, error: 'Código QR no encontrado' },
        { status: 404 }
      );
    }

    // Deactivate instead of deleting
    const updatedQR = await db.qRCode.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      data: updatedQR,
      message: 'Código QR desactivado',
    });
  } catch (error) {
    console.error('Deactivate QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
