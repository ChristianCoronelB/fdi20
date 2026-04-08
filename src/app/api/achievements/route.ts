import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: Get user achievements and available achievements
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Get all active achievements
    const availableAchievements = await db.achievement.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { points: 'asc' },
      ],
    });

    // Get user's earned achievements with raw query
    const earnedAchievements = await db.$queryRaw`
      SELECT 
        ua.id,
        ua.userId,
        ua.achievementId,
        ua.earnedAt,
        a.name,
        a.description,
        a.icon,
        a.points,
        a.category
      FROM user_achievements ua
      JOIN achievements a ON ua.achievementId = a.id
      WHERE ua.userId = ${session.userId}
      ORDER BY ua.earnedAt DESC
    `;

    // Get user stats
    const attendanceCount = await db.attendance.count({
      where: { userId: session.userId },
    });

    const voteCount = await db.vote.count({
      where: { userId: session.userId },
    });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { points: true, level: true },
    });

    // Get IDs of earned achievements
    const earnedIds = new Set((earnedAchievements as any[]).map((ea: any) => ea.achievementId));

    // Filter available achievements (not earned yet)
    const notEarnedAchievements = availableAchievements.filter(
      (a) => !earnedIds.has(a.id)
    );

    return NextResponse.json({
      success: true,
      data: {
        earned: (earnedAchievements as any[]).map((ea: any) => ({
          id: ea.id,
          achievementId: ea.achievementId,
          earnedAt: ea.earnedAt,
          achievement: {
            id: ea.achievementId,
            name: ea.name,
            description: ea.description,
            icon: ea.icon,
            points: ea.points,
            category: ea.category,
          },
        })),
        available: notEarnedAchievements.map((a) => ({
          id: a.id,
          name: a.name,
          description: a.description,
          icon: a.icon,
          points: a.points,
          category: a.category,
        })),
        stats: {
          attendanceCount,
          voteCount,
          points: user?.points || 0,
          level: user?.level || 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener logros' },
      { status: 500 }
    );
  }
}
