import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';
import { ProjectStatus } from '@prisma/client';

// GET /api/projects - List projects (filter by eventId, status, category)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const isActive = searchParams.get('isActive');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: Record<string, unknown> = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (status && Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      where.status = status;
    }
    
    if (category) {
      where.category = category;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const projects = await db.project.findMany({
      where,
      include: {
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: [
        { totalVotes: 'desc' },
        { createdAt: 'desc' },
      ],
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    // Get total count for pagination
    const total = await db.project.count({ where });

    return NextResponse.json({
      success: true,
      data: projects,
      meta: {
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null,
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create project (requires ADMIN/ORGANIZER role)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!isOrganizer(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Organizer role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      eventId,
      roomId,
      name,
      team,
      category,
      description,
      image,
      videoUrl,
      githubUrl,
      websiteUrl,
      status,
    } = body;

    if (!eventId || !name || !team) {
      return NextResponse.json(
        { success: false, error: 'Event ID, name, and team are required' },
        { status: 400 }
      );
    }

    // Verify event exists
    const event = await db.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Verify room exists if provided
    if (roomId) {
      const room = await db.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        );
      }
    }

    const project = await db.project.create({
      data: {
        eventId,
        roomId,
        name,
        team: typeof team === 'object' ? JSON.stringify(team) : team,
        category,
        description,
        image,
        videoUrl,
        githubUrl,
        websiteUrl,
        status: status || 'DRAFT',
      },
      include: {
        room: true,
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
