import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { createQRCode } from '@/lib/qr';
import type { QRType } from '@prisma/client';

// GET: List QR codes (filter by type, include relations)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as QRType | null;
    const activityId = searchParams.get('activityId');
    const roomId = searchParams.get('roomId');
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');
    const includeRelations = searchParams.get('include') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (activityId) {
      where.activityId = activityId;
    }

    if (roomId) {
      where.roomId = roomId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const include: any = {};

    if (includeRelations) {
      include.room = {
        select: {
          id: true,
          name: true,
          building: true,
        },
      };
      include.activity = {
        select: {
          id: true,
          title: true,
          type: true,
          startTime: true,
        },
      };
      include.project = {
        select: {
          id: true,
          name: true,
          category: true,
        },
      };
      include.user = {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      };
    }

    const [qrCodes, total] = await Promise.all([
      db.qRCode.findMany({
        where,
        include,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.qRCode.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: qrCodes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Generate new QR code (requires ADMIN/ORGANIZER role)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Check if user has permission to create QR codes
    if (!hasRole(session.role, ['ADMIN', 'ORGANIZER'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para crear códigos QR' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, userId, roomId, activityId, projectId, eventId, expiresAt } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Tipo de QR requerido' },
        { status: 400 }
      );
    }

    // Validate that the related entity exists based on type
    if (type === 'ACTIVITY' && activityId) {
      const activity = await db.activity.findUnique({
        where: { id: activityId },
      });
      if (!activity) {
        return NextResponse.json(
          { success: false, error: 'Actividad no encontrada' },
          { status: 404 }
        );
      }
    }

    if (type === 'ROOM' && roomId) {
      const room = await db.room.findUnique({
        where: { id: roomId },
      });
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Sala no encontrada' },
          { status: 404 }
        );
      }
    }

    if (type === 'PROJECT' && projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        return NextResponse.json(
          { success: false, error: 'Proyecto no encontrado' },
          { status: 404 }
        );
      }
    }

    if (type === 'USER' && userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado' },
          { status: 404 }
        );
      }
    }

    // Create QR code
    const qrCode = await createQRCode({
      type: type as QRType,
      userId: type === 'USER' ? userId : undefined,
      roomId: type === 'ROOM' ? roomId : undefined,
      activityId: type === 'ACTIVITY' ? activityId : undefined,
      projectId: type === 'PROJECT' ? projectId : undefined,
      eventId: type === 'EVENT' ? eventId : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: qrCode.id,
        code: qrCode.code,
        qrImage: qrCode.qrImage,
        type,
      },
    });
  } catch (error) {
    console.error('Create QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
