import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    // Build filter for event-specific data
    const eventFilter = eventId ? { eventId } : {};

    // Get total counts in parallel
    const [
      totalUsers,
      totalEvents,
      totalActivities,
      totalProjects,
      totalVotes,
      totalAttendance,
    ] = await Promise.all([
      db.user.count({ where: { isActive: true } }),
      db.event.count({ where: { isActive: true } }),
      db.activity.count({ where: { isActive: true, ...eventFilter } }),
      db.project.count({ where: { isActive: true, ...eventFilter } }),
      db.vote.count(eventId ? { where: { project: { eventId } } } : {}),
      db.attendance.count(eventId ? { where: { activity: { eventId } } } : {}),
    ]);

    // Get activities with attendance counts for chart
    const activitiesWithAttendance = await db.activity.findMany({
      where: {
        isActive: true,
        ...eventFilter,
      },
      select: {
        id: true,
        title: true,
        type: true,
        currentAttendance: true,
        startTime: true,
      },
      orderBy: {
        currentAttendance: 'desc',
      },
      take: 10,
    });

    // Get recent activities (activity feed)
    const recentAttendance = await db.attendance.findMany({
      where: eventId ? { activity: { eventId } } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentVotes = await db.vote.findMany({
      where: eventId ? { project: { eventId } } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Combine and sort activity feed
    const activityFeed = [
      ...recentAttendance.map((a) => ({
        type: 'attendance' as const,
        id: a.id,
        user: a.user,
        details: {
          activityTitle: a.activity.title,
          activityType: a.activity.type,
        },
        createdAt: a.createdAt,
      })),
      ...recentVotes.map((v) => ({
        type: 'vote' as const,
        id: v.id,
        user: v.user,
        details: {
          projectName: v.project.name,
          score: v.score,
        },
        createdAt: v.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 15);

    // Get leaderboard (users with most points)
    const leaderboard = await db.user.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        points: true,
        level: true,
        _count: {
          select: {
            attendances: true,
            votes: true,
          },
        },
      },
      orderBy: {
        points: 'desc',
      },
      take: 10,
    });

    // Get upcoming activities
    const upcomingActivities = await db.activity.findMany({
      where: {
        isActive: true,
        startTime: {
          gte: new Date(),
        },
        ...eventFilter,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        speaker: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
      take: 5,
    });

    // Get active events
    const activeEvents = await db.event.findMany({
      where: {
        isActive: true,
        endDate: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        startDate: true,
        endDate: true,
        location: true,
        _count: {
          select: {
            activities: true,
            projects: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    });

    // Attendance by type
    const attendanceByType = await db.activity.groupBy({
      by: ['type'],
      where: {
        isActive: true,
        ...eventFilter,
      },
      _sum: {
        currentAttendance: true,
      },
    });

    // Projects by status
    const projectsByStatus = await db.project.groupBy({
      by: ['status'],
      where: {
        isActive: true,
        ...eventFilter,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalEvents,
          totalActivities,
          totalProjects,
          totalVotes,
          totalAttendance,
        },
        charts: {
          activitiesAttendance: activitiesWithAttendance,
          attendanceByType: attendanceByType.map((a) => ({
            type: a.type,
            attendance: a._sum.currentAttendance || 0,
          })),
          projectsByStatus: projectsByStatus.map((p) => ({
            status: p.status,
            count: p._count.id,
          })),
        },
        activityFeed,
        leaderboard,
        upcomingActivities,
        activeEvents,
      },
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
