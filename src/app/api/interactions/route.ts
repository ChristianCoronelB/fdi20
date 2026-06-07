import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST - Registrar una interacción de usuario
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      type, 
      entityId, 
      entityType, 
      action, 
      metadata 
    } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: 'Tipo de interacción requerido' },
        { status: 400 }
      );
    }

    // Crear evento de analytics
    const analyticsEvent = await db.analyticsEvent.create({
      data: {
        eventType: type,
        userId: session.userId,
        eventId: entityId,
        entityId: entityId,
        entityType: entityType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Actualizar puntos según el tipo de interacción
    const pointsMap: Record<string, number> = {
      'PAGE_VIEW': 0,
      'ACTIVITY_REGISTER': 5,
      'ACTIVITY_UNREGISTER': 0,
      'VOTE': 3,
      'EVALUATION_SUBMIT': 10,
      'QR_SCAN': 5,
      'PROFILE_UPDATE': 2,
      'PROJECT_VIEW': 1,
      'SHARE': 5,
    };

    const pointsEarned = pointsMap[type] || 0;

    if (pointsEarned > 0) {
      await db.user.update({
        where: { id: session.userId },
        data: { 
          points: { increment: pointsEarned },
        },
      });

      // Actualizar nivel del usuario (cada 100 puntos sube de nivel)
      const user = await db.user.findUnique({
        where: { id: session.userId },
        select: { points: true, level: true },
      });

      if (user) {
        const newLevel = Math.floor(user.points / 100) + 1;
        if (newLevel > user.level) {
          await db.user.update({
            where: { id: session.userId },
            data: { level: newLevel },
          });
        }
      }
    }

    // Verificar logros
    await checkAchievements(session.userId);

    return NextResponse.json({
      success: true,
      data: {
        eventId: analyticsEvent.id,
        pointsEarned,
      },
    });
  } catch (error) {
    console.error('Error registrando interacción:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar interacción' },
      { status: 500 }
    );
  }
}

// Función para verificar y otorgar logros
async function checkAchievements(userId: string) {
  try {
    // Obtener estadísticas del usuario
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { points: true, level: true },
    });

    const attendanceCount = await db.attendance.count({
      where: { userId, checkInTime: { not: null }, checkOutTime: { not: null } },
    });

    const voteCount = await db.vote.count({
      where: { userId },
    });

    const evaluationCount = await db.evaluation.count({
      where: { userId, status: 'SUBMITTED' },
    });

    // Obtener todos los logros activos
    const achievements = await db.achievement.findMany({
      where: { isActive: true },
    });

    // Obtener logros ya obtenidos
    const earnedAchievementIds = (await db.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    })).map(ua => ua.achievementId);

    // Verificar cada logro
    for (const achievement of achievements) {
      if (earnedAchievementIds.includes(achievement.id)) continue;

      let earned = false;
      const req = achievement.requirement ? JSON.parse(achievement.requirement) : null;

      switch (achievement.category) {
        case 'ATTENDANCE':
          earned = attendanceCount >= (req?.count || 1);
          break;
        case 'VOTING':
          earned = voteCount >= (req?.count || 1);
          break;
        case 'EVALUATION':
          earned = evaluationCount >= (req?.count || 1);
          break;
        case 'POINTS':
          earned = (user?.points || 0) >= (req?.points || 100);
          break;
        case 'LEVEL':
          earned = (user?.level || 1) >= (req?.level || 2);
          break;
      }

      if (earned) {
        await db.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        });

        // Otorgar puntos del logro
        if (achievement.points > 0) {
          await db.user.update({
            where: { id: userId },
            data: { points: { increment: achievement.points } },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// GET - Obtener estadísticas de interacciones
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
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const whereClause: any = { userId: session.userId };
    if (type) {
      whereClause.eventType = type;
    }

    const interactions = await db.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error('Error obteniendo interacciones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener interacciones' },
      { status: 500 }
    );
  }
}
