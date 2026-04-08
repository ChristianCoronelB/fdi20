import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { UserRole, ActivityStatus, ActivityType } from '@prisma/client';

// GET: List activities with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status') as ActivityStatus | null;
    const type = searchParams.get('type') as ActivityType | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (roomId) {
      where.roomId = roomId;
    }
    
    if (status && Object.values(ActivityStatus).includes(status)) {
      where.status = status;
    }
    
    if (type && Object.values(ActivityType).includes(type)) {
      where.type = type;
    }
    
    const [activities, total] = await Promise.all([
      db.activity.findMany({
        where,
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
          _count: {
            select: {
              attendances: true,
            },
          },
        },
        orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
        skip,
        take: limit,
      }),
      db.activity.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}

// POST: Create activity (requires ADMIN/ORGANIZER/MODERATOR role)
export async function POST(request: NextRequest) {
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
        { success: false, error: 'No tienes permisos para crear actividades' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      eventId,
      roomId,
      speakerId,
      title,
      description,
      type,
      status,
      theme,
      tags,
      startTime,
      endTime,
      maxCapacity,
      color,
      isActive,
    } = body;
    
    if (!eventId || !roomId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'EventId, roomId, título, fecha de inicio y fecha de fin son requeridos' },
        { status: 400 }
      );
    }
    
    // Check if event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });
    
    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }
    
    // Check if room exists and belongs to event
    const room = await db.room.findFirst({
      where: { id: roomId, eventId },
    });
    
    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Sala no encontrada o no pertenece al evento' },
        { status: 404 }
      );
    }
    
    // Check if speaker exists (if provided)
    if (speakerId) {
      const speaker = await db.speaker.findFirst({
        where: { id: speakerId, eventId },
      });
      
      if (!speaker) {
        return NextResponse.json(
          { success: false, error: 'Speaker no encontrado o no pertenece al evento' },
          { status: 404 }
        );
      }
    }
    
    const activity = await db.activity.create({
      data: {
        eventId,
        roomId,
        speakerId,
        title,
        description,
        type: type ?? 'PRESENTATION',
        status: status ?? 'SCHEDULED',
        theme,
        tags,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxCapacity,
        color: color ?? '#10B981',
        isActive: isActive ?? true,
      },
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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear actividad' },
      { status: 500 }
    );
  }
}
