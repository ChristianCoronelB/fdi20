import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET: List all events with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const eventId = searchParams.get('id');
    
    // If specific event ID is requested
    if (eventId) {
      const event = await db.event.findUnique({
        where: { id: eventId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              rooms: true,
              activities: true,
              projects: true,
              speakers: true,
            },
          },
        },
      });
      
      if (!event) {
        return NextResponse.json(
          { success: false, error: 'Evento no encontrado' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: event,
      });
    }
    
    const skip = (page - 1) * limit;
    
    const where: Record<string, unknown> = {};
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }
    
    const [events, total] = await Promise.all([
      db.event.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              rooms: true,
              activities: true,
              projects: true,
              speakers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.event.count({ where }),
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener eventos' },
      { status: 500 }
    );
  }
}

// POST: Create new event (requires ADMIN/ORGANIZER role)
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
        { success: false, error: 'No tienes permisos para crear eventos' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      name,
      slug,
      description,
      logo,
      image,
      startDate,
      endDate,
      location,
      address,
      latitude,
      longitude,
      website,
      isActive,
      votingEnabled,
      qrEnabled,
      mapsEnabled,
      gamificationEnabled,
    } = body;
    
    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Nombre, fecha de inicio y fecha de fin son requeridos' },
        { status: 400 }
      );
    }
    
    // Generate slug if not provided
    const eventSlug = slug || name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug is unique
    const existingEvent = await db.event.findUnique({
      where: { slug: eventSlug },
    });
    
    if (existingEvent) {
      return NextResponse.json(
        { success: false, error: 'El slug ya está en uso' },
        { status: 400 }
      );
    }
    
    const event = await db.event.create({
      data: {
        name,
        slug: eventSlug,
        description,
        logo,
        image,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        website,
        isActive: isActive ?? true,
        votingEnabled: votingEnabled ?? true,
        qrEnabled: qrEnabled ?? true,
        mapsEnabled: mapsEnabled ?? true,
        gamificationEnabled: gamificationEnabled ?? true,
        creatorId: session.userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: event,
      message: 'Evento creado exitosamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear evento' },
      { status: 500 }
    );
  }
}

// PUT: Update event (requires ADMIN/ORGANIZER role)
export async function PUT(request: NextRequest) {
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
        { success: false, error: 'No tienes permisos para editar eventos' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const {
      id,
      name,
      slug,
      description,
      logo,
      image,
      startDate,
      endDate,
      location,
      address,
      latitude,
      longitude,
      website,
      isActive,
      votingEnabled,
      qrEnabled,
      mapsEnabled,
      gamificationEnabled,
    } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de evento requerido' },
        { status: 400 }
      );
    }
    
    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id },
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }
    
    // If slug is being changed, check uniqueness
    if (slug && slug !== existingEvent.slug) {
      const slugExists = await db.event.findUnique({
        where: { slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'El slug ya está en uso' },
          { status: 400 }
        );
      }
    }
    
    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (image !== undefined) updateData.image = image;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (location !== undefined) updateData.location = location;
    if (address !== undefined) updateData.address = address;
    if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
    if (website !== undefined) updateData.website = website;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (votingEnabled !== undefined) updateData.votingEnabled = votingEnabled;
    if (qrEnabled !== undefined) updateData.qrEnabled = qrEnabled;
    if (mapsEnabled !== undefined) updateData.mapsEnabled = mapsEnabled;
    if (gamificationEnabled !== undefined) updateData.gamificationEnabled = gamificationEnabled;
    
    const event = await db.event.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      data: event,
      message: 'Evento actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar evento' },
      { status: 500 }
    );
  }
}

// DELETE: Delete event (requires ADMIN role)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!hasRole(session.role as UserRole, ['ADMIN'])) {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden eliminar eventos' },
        { status: 403 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de evento requerido' },
        { status: 400 }
      );
    }
    
    // Check if event exists
    const existingEvent = await db.event.findUnique({
      where: { id },
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Evento no encontrado' },
        { status: 404 }
      );
    }
    
    // Delete event (cascade will delete related records)
    await db.event.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Evento eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}
