import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get room with activities
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const room = await db.room.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        activities: {
          where: { isActive: true },
          include: {
            speaker: {
              select: {
                id: true,
                name: true,
                photo: true,
                title: true,
                company: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
        _count: {
          select: {
            activities: true,
            projects: true,
          },
        },
      },
    });
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Sala no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener sala' },
      { status: 500 }
    );
  }
}

// PUT: Update room
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!hasRole(session.role as UserRole, ['ADMIN', 'ORGANIZER'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para actualizar salas' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
    });
    
    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Sala no encontrada' },
        { status: 404 }
      );
    }
    
    // Check name uniqueness within event if name is being changed
    if (body.name && body.name !== existingRoom.name) {
      const nameExists = await db.room.findFirst({
        where: {
          eventId: existingRoom.eventId,
          name: body.name,
          id: { not: id },
        },
      });
      
      if (nameExists) {
        return NextResponse.json(
          { success: false, error: 'Ya existe una sala con ese nombre en este evento' },
          { status: 400 }
        );
      }
    }
    
    const updateData: Record<string, unknown> = {};
    
    const allowedFields = [
      'name', 'description', 'capacity', 'building', 'floor',
      'latitude', 'longitude', 'color', 'icon', 'isActive',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    const room = await db.room.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar sala' },
      { status: 500 }
    );
  }
}

// DELETE: Delete room
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!hasRole(session.role as UserRole, ['ADMIN', 'ORGANIZER'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar salas' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    // Check if room exists
    const existingRoom = await db.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    });
    
    if (!existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Sala no encontrada' },
        { status: 404 }
      );
    }
    
    // Check if room has activities
    if (existingRoom._count.activities > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una sala con actividades asociadas' },
        { status: 400 }
      );
    }
    
    await db.room.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      data: { message: 'Sala eliminada correctamente' },
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar sala' },
      { status: 500 }
    );
  }
}
