import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET: Get user's activity registrations
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
    const activityId = searchParams.get('activityId');

    // Use raw query as a workaround
    const whereClause = activityId 
      ? Prisma.sql`AND ar.activityId = ${activityId}`
      : Prisma.empty;

    const registrations = await db.$queryRaw`
      SELECT 
        ar.id,
        ar.userId,
        ar.activityId,
        ar.reminderSet,
        ar.reminderMinutes,
        ar.registeredAt,
        ar.createdAt,
        a.id as activity_id,
        a.title as activity_title,
        a.description as activity_description,
        a.type as activity_type,
        a.status as activity_status,
        a.startTime as activity_startTime,
        a.endTime as activity_endTime,
        a.maxCapacity as activity_maxCapacity,
        a.currentAttendance as activity_currentAttendance,
        r.id as room_id,
        r.name as room_name,
        r.building as room_building,
        r.floor as room_floor,
        r.capacity as room_capacity
      FROM activity_registrations ar
      JOIN activities a ON ar.activityId = a.id
      LEFT JOIN rooms r ON a.roomId = r.id
      WHERE ar.userId = ${session.userId}
      ${whereClause}
      ORDER BY ar.registeredAt DESC
    `;

    // Transform the raw results into the expected format
    const formattedRegistrations = (registrations as any[]).map((reg: any) => ({
      id: reg.id,
      userId: reg.userId,
      activityId: reg.activityId,
      reminderSet: reg.reminderSet === 1 || reg.reminderSet === true,
      reminderMinutes: reg.reminderMinutes,
      registeredAt: reg.registeredAt,
      createdAt: reg.createdAt,
      activity: {
        id: reg.activity_id,
        title: reg.activity_title,
        description: reg.activity_description,
        type: reg.activity_type,
        status: reg.activity_status,
        startTime: reg.activity_startTime,
        endTime: reg.activity_endTime,
        maxCapacity: reg.activity_maxCapacity,
        currentAttendance: reg.activity_currentAttendance,
        room: reg.room_id ? {
          id: reg.room_id,
          name: reg.room_name,
          building: reg.room_building,
          floor: reg.room_floor,
          capacity: reg.room_capacity,
        } : null,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedRegistrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener registros' },
      { status: 500 }
    );
  }
}

// POST: Register for an activity
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
    const { activityId, reminderMinutes } = body;

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    // Check if activity exists
    const activity = await db.activity.findUnique({
      where: { id: activityId },
      include: {
        room: { select: { id: true, name: true, capacity: true } },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    // Check if already registered using raw query
    const existingRegs = await db.$queryRaw`
      SELECT * FROM activity_registrations 
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    if ((existingRegs as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'Ya estás registrado en esta actividad' },
        { status: 400 }
      );
    }

    // Check capacity limit using raw query
    // Use activity maxCapacity or room capacity as fallback
    const effectiveCapacity = activity.maxCapacity && activity.maxCapacity > 0
      ? activity.maxCapacity
      : activity.room?.capacity || 0;

    if (effectiveCapacity > 0) {
      const countResult = await db.$queryRaw`
        SELECT COUNT(*) as count FROM activity_registrations WHERE activityId = ${activityId}
      `;
      const currentCount = (countResult as any[])[0]?.count || 0;

      if (Number(currentCount) >= effectiveCapacity) {
        return NextResponse.json(
          { success: false, error: 'Esta actividad ha alcanzado su capacidad máxima. No es posible registrarse.' },
          { status: 400 }
        );
      }
    }

    // Create registration using raw query
    const id = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    await db.$executeRaw`
      INSERT INTO activity_registrations (id, userId, activityId, reminderSet, reminderMinutes, registeredAt, createdAt)
      VALUES (${id}, ${session.userId}, ${activityId}, ${reminderMinutes ? 1 : 0}, ${reminderMinutes || null}, ${now}, ${now})
    `;

    // Award points for registration (5 points)
    const registrationPoints = 5;
    await db.$executeRaw`
      UPDATE users SET points = points + ${registrationPoints} WHERE id = ${session.userId}
    `;

    // Get updated user points
    const updatedUser = await db.$queryRaw`
      SELECT points FROM users WHERE id = ${session.userId}
    `;
    const newPoints = (updatedUser as any[])[0]?.points || 0;

    return NextResponse.json({
      success: true,
      data: {
        id,
        userId: session.userId,
        activityId,
        reminderSet: !!reminderMinutes,
        reminderMinutes: reminderMinutes || null,
        registeredAt: now,
        activity: {
          id: activity.id,
          title: activity.title,
          room: activity.room,
        },
        pointsEarned: registrationPoints,
        totalPoints: newPoints,
      },
      message: `Te has registrado en "${activity.title}". ¡+${registrationPoints} puntos!`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar en actividad' },
      { status: 500 }
    );
  }
}

// DELETE: Unregister from an activity
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    // Check if registration exists using raw query
    const existingRegs = await db.$queryRaw`
      SELECT * FROM activity_registrations 
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    if ((existingRegs as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No estás registrado en esta actividad' },
        { status: 404 }
      );
    }

    // Check if attendance already recorded
    const attendanceResult = await db.$queryRaw`
      SELECT * FROM attendances 
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    if ((attendanceResult as any[]).length > 0) {
      return NextResponse.json(
        { success: false, error: 'No puedes cancelar el registro de una actividad a la que ya asististe' },
        { status: 400 }
      );
    }

    // Delete registration using raw query
    await db.$executeRaw`
      DELETE FROM activity_registrations 
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Registro cancelado correctamente',
    });
  } catch (error) {
    console.error('Error deleting registration:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cancelar registro' },
      { status: 500 }
    );
  }
}

// PUT: Update registration (e.g., set reminder)
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
    const { activityId, reminderMinutes, reminderSet } = body;

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    // Check if registration exists using raw query
    const existingRegs = await db.$queryRaw`
      SELECT * FROM activity_registrations 
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    if ((existingRegs as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No estás registrado en esta actividad' },
        { status: 404 }
      );
    }

    const existing = (existingRegs as any[])[0];

    // Update registration using raw query
    const newReminderMinutes = reminderMinutes ?? existing.reminderMinutes;
    const newReminderSet = reminderSet !== undefined ? (reminderSet ? 1 : 0) : existing.reminderSet;

    await db.$executeRaw`
      UPDATE activity_registrations 
      SET reminderMinutes = ${newReminderMinutes}, reminderSet = ${newReminderSet}
      WHERE userId = ${session.userId} AND activityId = ${activityId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        userId: session.userId,
        activityId,
        reminderMinutes: newReminderMinutes,
        reminderSet: newReminderSet === 1,
      },
      message: 'Registro actualizado correctamente',
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar registro' },
      { status: 500 }
    );
  }
}
