import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Points configuration
const POINTS = {
  CHECK_IN: 10,   // Points for checking in
  CHECK_OUT: 10,  // Points for checking out
  FULL_ATTENDANCE_BONUS: 5, // Bonus points for completing full attendance
};

// GET: List attendance records (filter by userId, activityId, eventId)
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
    const userId = searchParams.get('userId');
    const activityId = searchParams.get('activityId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Use authenticated user's ID if not admin requesting another user
    const targetUserId = userId || session.userId;
    
    // Only admins can view other users' attendance
    if (targetUserId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Build query with optional activityId filter
    let query = `
      SELECT 
        a.id,
        a.userId,
        a.activityId,
        a.checkInTime,
        a.checkOutTime,
        a.points,
        a.notes,
        a.createdAt,
        act.id as activity_id,
        act.title as activity_title,
        act.type as activity_type,
        act.startTime as activity_startTime,
        act.endTime as activity_endTime,
        r.id as room_id,
        r.name as room_name
      FROM attendances a
      JOIN activities act ON a.activityId = act.id
      LEFT JOIN rooms r ON act.roomId = r.id
      WHERE a.userId = ?
    `;
    const params: any[] = [targetUserId];

    if (activityId) {
      query += ` AND a.activityId = ?`;
      params.push(activityId);
    }

    query += ` ORDER BY a.checkInTime DESC LIMIT ? OFFSET ?`;
    params.push(limit, skip);

    const attendances = await db.$queryRawUnsafe(query, ...params);

    // Get total count
    let countQuery = `SELECT COUNT(*) as count FROM attendances WHERE userId = ?`;
    const countParams: any[] = [targetUserId];
    
    if (activityId) {
      countQuery += ` AND activityId = ?`;
      countParams.push(activityId);
    }

    const countResult = await db.$queryRawUnsafe(countQuery, ...countParams);
    const total = (countResult as any[])[0]?.count || 0;

    // Format the results
    const formattedAttendances = (attendances as any[]).map((a: any) => ({
      id: a.id,
      userId: a.userId,
      activityId: a.activityId,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      points: a.points,
      notes: a.notes,
      createdAt: a.createdAt,
      activity: {
        id: a.activity_id,
        title: a.activity_title,
        type: a.activity_type,
        startTime: a.activity_startTime,
        endTime: a.activity_endTime,
        room: a.room_id ? {
          id: a.room_id,
          name: a.room_name,
        } : null,
      },
      isComplete: a.checkInTime && a.checkOutTime,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAttendances,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Check-in or Check-out for an activity
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
    const { activityId, action } = body; // action: 'check-in' or 'check-out'

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    if (!action || !['check-in', 'check-out'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Acción inválida. Use "check-in" o "check-out"' },
        { status: 400 }
      );
    }

    // Check if activity exists
    const activity = await db.$queryRaw`
      SELECT id, title, status FROM activities WHERE id = ${activityId}
    `;

    if ((activity as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    const activityData = (activity as any[])[0];

    // Check if user is registered for this activity
    const registration = await db.$queryRaw`
      SELECT id FROM activity_registrations WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    // Require prior registration - do NOT auto-register
    if ((registration as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: `No estás registrado en "${activityData.title}". Debes registrarte primero en la agenda para poder registrar tu asistencia.` },
        { status: 400 }
      );
    }

    // Check existing attendance record
    const existingAttendance = await db.$queryRaw`
      SELECT * FROM attendances WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    const existing = (existingAttendance as any[])[0];
    const now = new Date();
    let pointsEarned = 0;
    let message = '';
    let attendanceId = existing?.id;

    if (action === 'check-in') {
      if (existing && existing.checkInTime) {
        return NextResponse.json(
          { success: false, error: 'Ya has hecho check-in para esta actividad' },
          { status: 400 }
        );
      }

      if (existing) {
        // Update existing record with check-in
        await db.$executeRaw`
          UPDATE attendances SET checkInTime = ${now}, points = points + ${POINTS.CHECK_IN} WHERE id = ${existing.id}
        `;
        pointsEarned = POINTS.CHECK_IN;
      } else {
        // Create new attendance record with check-in
        attendanceId = `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.$executeRaw`
          INSERT INTO attendances (id, userId, activityId, checkInTime, points, createdAt)
          VALUES (${attendanceId}, ${session.userId}, ${activityId}, ${now}, ${POINTS.CHECK_IN}, ${now})
        `;
        pointsEarned = POINTS.CHECK_IN;
      }

      // Update activity attendance count
      await db.$executeRaw`
        UPDATE activities SET currentAttendance = currentAttendance + 1 WHERE id = ${activityId}
      `;

      message = `Check-in registrado en "${activityData.title}". ¡+${pointsEarned} puntos!`;
    } else if (action === 'check-out') {
      if (!existing || !existing.checkInTime) {
        return NextResponse.json(
          { success: false, error: 'Debes hacer check-in primero antes de hacer check-out' },
          { status: 400 }
        );
      }

      if (existing.checkOutTime) {
        return NextResponse.json(
          { success: false, error: 'Ya has hecho check-out para esta actividad' },
          { status: 400 }
        );
      }

      // Update with check-out
      await db.$executeRaw`
        UPDATE attendances SET checkOutTime = ${now}, points = points + ${POINTS.CHECK_OUT + POINTS.FULL_ATTENDANCE_BONUS} WHERE id = ${existing.id}
      `;
      pointsEarned = POINTS.CHECK_OUT + POINTS.FULL_ATTENDANCE_BONUS;

      message = `Check-out registrado en "${activityData.title}". ¡+${pointsEarned} puntos! (incluye bono por asistencia completa)`;
    }

    // Award points to user
    await db.$executeRaw`
      UPDATE users SET points = points + ${pointsEarned} WHERE id = ${session.userId}
    `;

    // Get updated user data
    const updatedUser = await db.$queryRaw`
      SELECT points, level FROM users WHERE id = ${session.userId}
    `;
    const userData = (updatedUser as any[])[0];

    // Count complete attendances for certificate eligibility
    const completeAttendances = await db.$queryRaw`
      SELECT COUNT(*) as count FROM attendances 
      WHERE userId = ${session.userId} AND checkInTime IS NOT NULL AND checkOutTime IS NOT NULL
    `;
    const completeCount = (completeAttendances as any[])[0]?.count || 0;

    // Get the updated attendance record
    const updatedAttendance = await db.$queryRaw`
      SELECT * FROM attendances WHERE id = ${attendanceId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        attendance: (updatedAttendance as any[])[0],
        pointsEarned,
        totalPoints: userData?.points || 0,
        level: userData?.level || 1,
        completeAttendances: Number(completeCount),
        canGenerateCertificate: Number(completeCount) >= 3,
      },
      message,
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Update attendance record (for notes)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { attendanceId, notes } = body;

    if (!attendanceId) {
      return NextResponse.json(
        { success: false, error: 'ID de asistencia requerido' },
        { status: 400 }
      );
    }

    // Check if attendance belongs to user
    const existing = await db.$queryRaw`
      SELECT * FROM attendances WHERE id = ${attendanceId} AND userId = ${session.userId}
    `;

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registro de asistencia no encontrado' },
        { status: 404 }
      );
    }

    await db.$executeRaw`
      UPDATE attendances SET notes = ${notes || null} WHERE id = ${attendanceId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Notas actualizadas',
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
