import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';

// GET /api/speakers - List speakers (filter by eventId)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const speakers = await db.speaker.findMany({
      where,
      include: {
        activities: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            startTime: true,
            endTime: true,
          },
          orderBy: { startTime: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: speakers,
    });
  } catch (error) {
    console.error('Error fetching speakers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch speakers' },
      { status: 500 }
    );
  }
}

// POST /api/speakers - Create speaker (requires ADMIN/ORGANIZER role)
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
      name,
      photo,
      bio,
      title,
      company,
      email,
      twitter,
      linkedin,
      website,
    } = body;

    if (!eventId || !name) {
      return NextResponse.json(
        { success: false, error: 'Event ID and name are required' },
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

    const speaker = await db.speaker.create({
      data: {
        eventId,
        name,
        photo,
        bio,
        title,
        company,
        email,
        twitter,
        linkedin,
        website,
      },
      include: {
        activities: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: speaker,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating speaker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create speaker' },
      { status: 500 }
    );
  }
}
