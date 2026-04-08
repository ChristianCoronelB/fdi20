import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/voting-configs/active - Get active voting config for an event
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const config = await db.votingConfig.findFirst({
      where: {
        eventId,
        isActive: true,
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

    if (!config) {
      // Return default config if none exists
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          eventId,
          name: 'Configuración por defecto',
          voteType: 'LIKE',
          maxVotesPerUser: 3,
          startDate: null,
          endDate: null,
          isActive: true,
          showResults: false,
          isDefault: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching active voting config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch active voting config' },
      { status: 500 }
    );
  }
}
