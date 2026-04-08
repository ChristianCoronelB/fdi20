import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';
import { VoteType } from '@prisma/client';

// GET /api/voting-configs - List voting configs
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

    const configs = await db.votingConfig.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('Error fetching voting configs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voting configs' },
      { status: 500 }
    );
  }
}

// POST /api/voting-configs - Create voting config
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
      voteType,
      maxVotesPerUser,
      startDate,
      endDate,
      isActive,
      showResults,
    } = body;

    if (!eventId || !name) {
      return NextResponse.json(
        { success: false, error: 'Event ID and name are required' },
        { status: 400 }
      );
    }

    // Validate voteType
    if (voteType && !Object.values(VoteType).includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Validate maxVotesPerUser
    const maxVotes = maxVotesPerUser || 3;
    if (maxVotes < 1 || maxVotes > 100) {
      return NextResponse.json(
        { success: false, error: 'Max votes per user must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Deactivate other configs for this event if this one is active
    if (isActive) {
      await db.votingConfig.updateMany({
        where: { eventId, isActive: true },
        data: { isActive: false },
      });
    }

    const config = await db.votingConfig.create({
      data: {
        eventId,
        name,
        voteType: voteType || 'STARS',
        maxVotesPerUser: maxVotes,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isActive: isActive !== undefined ? isActive : true,
        showResults: showResults || false,
      },
      include: {
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
      data: config,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating voting config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create voting config' },
      { status: 500 }
    );
  }
}
