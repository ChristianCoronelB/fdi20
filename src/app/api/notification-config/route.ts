import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';

// GET /api/notification-config - Get notification config for event
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    let config = await db.notificationConfig.findFirst({
      where: { eventId },
    });

    // Create default config if not exists
    if (!config) {
      config = await db.notificationConfig.create({
        data: {
          eventId,
          activityStartEnabled: true,
          activityReminderEnabled: true,
          activityReminderMinutes: 15,
          voteConfirmationEnabled: true,
          voteReminderEnabled: true,
          pointsEarnedEnabled: true,
          achievementEnabled: true,
          certificateReadyEnabled: true,
          announcementsEnabled: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching notification config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification config' },
      { status: 500 }
    );
  }
}

// POST /api/notification-config - Create or update config (admin/organizer only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !isOrganizer(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Organizer access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      eventId,
      activityStartEnabled,
      activityReminderEnabled,
      activityReminderMinutes,
      voteConfirmationEnabled,
      voteReminderEnabled,
      pointsEarnedEnabled,
      achievementEnabled,
      certificateReadyEnabled,
      announcementsEnabled,
    } = body;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Check if config exists
    const existingConfig = await db.notificationConfig.findFirst({
      where: { eventId },
    });

    let config;

    if (existingConfig) {
      // Update existing config
      config = await db.notificationConfig.update({
        where: { id: existingConfig.id },
        data: {
          activityStartEnabled: activityStartEnabled ?? existingConfig.activityStartEnabled,
          activityReminderEnabled: activityReminderEnabled ?? existingConfig.activityReminderEnabled,
          activityReminderMinutes: activityReminderMinutes ?? existingConfig.activityReminderMinutes,
          voteConfirmationEnabled: voteConfirmationEnabled ?? existingConfig.voteConfirmationEnabled,
          voteReminderEnabled: voteReminderEnabled ?? existingConfig.voteReminderEnabled,
          pointsEarnedEnabled: pointsEarnedEnabled ?? existingConfig.pointsEarnedEnabled,
          achievementEnabled: achievementEnabled ?? existingConfig.achievementEnabled,
          certificateReadyEnabled: certificateReadyEnabled ?? existingConfig.certificateReadyEnabled,
          announcementsEnabled: announcementsEnabled ?? existingConfig.announcementsEnabled,
        },
      });
    } else {
      // Create new config
      config = await db.notificationConfig.create({
        data: {
          eventId,
          activityStartEnabled: activityStartEnabled ?? true,
          activityReminderEnabled: activityReminderEnabled ?? true,
          activityReminderMinutes: activityReminderMinutes ?? 15,
          voteConfirmationEnabled: voteConfirmationEnabled ?? true,
          voteReminderEnabled: voteReminderEnabled ?? true,
          pointsEarnedEnabled: pointsEarnedEnabled ?? true,
          achievementEnabled: achievementEnabled ?? true,
          certificateReadyEnabled: certificateReadyEnabled ?? true,
          announcementsEnabled: announcementsEnabled ?? true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error saving notification config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save notification config' },
      { status: 500 }
    );
  }
}
