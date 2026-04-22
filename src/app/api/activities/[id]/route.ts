import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get activity with room, speaker, attendance count
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const activity = await db.activity.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            description: true,
            building: true,
            floor: true,
            capacity: true,
            color: true,
            icon: true,
          },
        },
        speaker: {
          select: {
            id: true,
            name: true,
            photo: true,
            bio: true,
            title: true,
            company: true,
            twitter: true,
            linkedin: true,
          },
        },
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    
    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividad' },
      { status: 500 }
    );
  }
}

// PUT: Update activity
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!hasRole(session.role as UserRole, ['ADMIN', 'ORGANIZER', 'MODERATOR'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para actualizar actividades' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Check if activity exists
    const existingActivity = await db.activity.findUnique({
      where: { id },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }
    
    // If roomId is being changed, verify it belongs to the same event
    if (body.roomId && body.roomId !== existingActivity.roomId) {
      const room = await db.room.findFirst({
        where: { id: body.roomId, eventId: existingActivity.eventId },
      });
      
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Sala no encontrada o no pertenece al evento' },
          { status: 400 }
        );
      }
    }
    
    // If speakerId is being changed, verify it belongs to the same event
    if (body.speakerId !== undefined && body.speakerId !== existingActivity.speakerId) {
      if (body.speakerId !== null) {
        const speaker = await db.speaker.findFirst({
          where: { id: body.speakerId, eventId: existingActivity.eventId },
        });
        
        if (!speaker) {
          return NextResponse.json(
            { success: false, error: 'Speaker no encontrado o no pertenece al evento' },
            { status: 400 }
          );
        }
      }
    }
    
    const updateData: Record<string, unknown> = {};
    
    const allowedFields = [
      'roomId', 'speakerId', 'title', 'description', 'type',
      'status', 'theme', 'tags', 'startTime', 'endTime',
      'maxCapacity', 'currentAttendance', 'color', 'isActive',
      'expositorName',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'startTime' || field === 'endTime') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
    const activity = await db.activity.update({
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
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true,
            color: true,
          },
        },
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
    });
    
    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar actividad' },
      { status: 500 }
    );
  }
}

// DELETE: Delete activity
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!hasRole(session.role as UserRole, ['ADMIN', 'ORGANIZER', 'MODERATOR'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar actividades' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    // Check if activity exists
    const existingActivity = await db.activity.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });
    
    if (!existingActivity) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }
    
    // Check if activity has attendances
    if (existingActivity._count.attendances > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una actividad con asistencias registradas' },
        { status: 400 }
      );
    }
    
    await db.activity.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      data: { message: 'Actividad eliminada correctamente' },
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar actividad' },
      { status: 500 }
    );
  }
}
