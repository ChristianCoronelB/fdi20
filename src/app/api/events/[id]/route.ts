import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole, isAdmin } from '@/lib/auth';
import { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get single event with relations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const event = await db.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        rooms: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        _count: {
          select: {
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
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener evento' },
      { status: 500 }
    );
  }
}

// PUT: Update event (requires ADMIN/ORGANIZER role)
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
        { success: false, error: 'No tienes permisos para actualizar eventos' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
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
    
    // Check slug uniqueness if slug is being updated
    if (body.slug && body.slug !== existingEvent.slug) {
      const slugExists = await db.event.findUnique({
        where: { slug: body.slug },
      });
      
      if (slugExists) {
        return NextResponse.json(
          { success: false, error: 'El slug ya está en uso' },
          { status: 400 }
        );
      }
    }
    
    const updateData: Record<string, unknown> = {};
    
    const allowedFields = [
      'name', 'slug', 'description', 'logo', 'image',
      'startDate', 'endDate', 'location', 'address',
      'latitude', 'longitude', 'website', 'isActive',
      'votingEnabled', 'qrEnabled', 'mapsEnabled', 'gamificationEnabled',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (field === 'startDate' || field === 'endDate') {
          updateData[field] = new Date(body[field]);
        } else {
          updateData[field] = body[field];
        }
      }
    }
    
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    if (!isAdmin(session.role as UserRole)) {
      return NextResponse.json(
        { success: false, error: 'Solo los administradores pueden eliminar eventos' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
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
    
    await db.event.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      data: { message: 'Evento eliminado correctamente' },
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar evento' },
      { status: 500 }
    );
  }
}
