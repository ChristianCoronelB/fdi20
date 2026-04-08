import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';

// GET /api/speakers/[id] - Get speaker with activities
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const speaker = await db.speaker.findUnique({
      where: { id },
      include: {
        activities: {
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
              },
            },
          },
          orderBy: { startTime: 'asc' },
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!speaker) {
      return NextResponse.json(
        { success: false, error: 'Speaker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: speaker,
    });
  } catch (error) {
    console.error('Error fetching speaker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch speaker' },
      { status: 500 }
    );
  }
}

// PUT /api/speakers/[id] - Update speaker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();

    // Check if speaker exists
    const existingSpeaker = await db.speaker.findUnique({
      where: { id },
    });

    if (!existingSpeaker) {
      return NextResponse.json(
        { success: false, error: 'Speaker not found' },
        { status: 404 }
      );
    }

    const {
      name,
      photo,
      bio,
      title,
      company,
      email,
      twitter,
      linkedin,
      website,
      isActive,
    } = body;

    const speaker = await db.speaker.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(photo !== undefined && { photo }),
        ...(bio !== undefined && { bio }),
        ...(title !== undefined && { title }),
        ...(company !== undefined && { company }),
        ...(email !== undefined && { email }),
        ...(twitter !== undefined && { twitter }),
        ...(linkedin !== undefined && { linkedin }),
        ...(website !== undefined && { website }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        activities: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: speaker,
    });
  } catch (error) {
    console.error('Error updating speaker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update speaker' },
      { status: 500 }
    );
  }
}

// DELETE /api/speakers/[id] - Delete speaker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Check if speaker exists
    const existingSpeaker = await db.speaker.findUnique({
      where: { id },
      include: {
        _count: {
          select: { activities: true },
        },
      },
    });

    if (!existingSpeaker) {
      return NextResponse.json(
        { success: false, error: 'Speaker not found' },
        { status: 404 }
      );
    }

    // Check if speaker has activities
    if (existingSpeaker._count.activities > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete speaker with associated activities. Remove activities first or set speaker as inactive.' },
        { status: 400 }
      );
    }

    await db.speaker.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Speaker deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting speaker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete speaker' },
      { status: 500 }
    );
  }
}
