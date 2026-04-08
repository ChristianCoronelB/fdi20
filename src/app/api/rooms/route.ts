import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: List rooms with filtering by eventId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    const [rooms, total] = await Promise.all([
      db.room.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              activities: true,
              projects: true,
            },
          },
        },
        orderBy: [{ eventId: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      db.room.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        rooms,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener salas' },
      { status: 500 }
    );
  }
}

// POST: Create room (requires ADMIN/ORGANIZER role)
export async function POST(request: NextRequest) {
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
        { success: false, error: 'No tienes permisos para crear salas' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      eventId,
      name,
      description,
      capacity,
      building,
      floor,
      latitude,
      longitude,
      color,
      icon,
      isActive,
    } = body;
    
    if (!eventId || !name) {
      return NextResponse.json(
        { success: false, error: 'EventId y nombre son requeridos' },
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
    
    // Check if room name is unique within event
    const existingRoom = await db.room.findFirst({
      where: { eventId, name },
    });
    
    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: 'Ya existe una sala con ese nombre en este evento' },
        { status: 400 }
      );
    }
    
    const room = await db.room.create({
      data: {
        eventId,
        name,
        description,
        capacity: capacity ?? 100,
        building,
        floor,
        latitude,
        longitude,
        color: color ?? '#3B82F6',
        icon: icon ?? 'map-pin',
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
      },
    });
    
    return NextResponse.json({
      success: true,
      data: room,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear sala' },
      { status: 500 }
    );
  }
}
