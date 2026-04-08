import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get attendance details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const attendance = await db.attendance.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            points: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startTime: true,
            endTime: true,
            room: {
              select: {
                id: true,
                name: true,
                building: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        { success: false, error: 'Registro de asistencia no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Update attendance (check-out time)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { checkOutTime, notes, points } = body;

    const existingAttendance = await db.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Registro de asistencia no encontrado' },
        { status: 404 }
      );
    }

    // Check if user owns the attendance or is admin/moderator
    const isOwner = existingAttendance.userId === session.userId;
    const canModify = isOwner || hasRole(session.role, ['ADMIN', 'ORGANIZER', 'MODERATOR']);

    if (!canModify) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para modificar este registro' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (checkOutTime !== undefined) {
      updateData.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    // Only admins can modify points
    if (points !== undefined && hasRole(session.role, ['ADMIN', 'ORGANIZER'])) {
      const pointsDiff = points - existingAttendance.points;
      updateData.points = points;

      // Update user points accordingly
      if (pointsDiff !== 0) {
        await db.user.update({
          where: { id: existingAttendance.userId },
          data: { points: { increment: pointsDiff } },
        });
      }
    }

    const attendance = await db.attendance.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Delete attendance record
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingAttendance = await db.attendance.findUnique({
      where: { id },
    });

    if (!existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Registro de asistencia no encontrado' },
        { status: 404 }
      );
    }

    // Only admins and organizers can delete attendance
    if (!hasRole(session.role, ['ADMIN', 'ORGANIZER'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar este registro' },
        { status: 403 }
      );
    }

    // Delete attendance
    await db.attendance.delete({
      where: { id },
    });

    // Update user points (remove points from attendance)
    await db.user.update({
      where: { id: existingAttendance.userId },
      data: { points: { decrement: existingAttendance.points } },
    });

    // Update activity attendance count
    await db.activity.update({
      where: { id: existingAttendance.activityId },
      data: { currentAttendance: { decrement: 1 } },
    });

    return NextResponse.json({
      success: true,
      message: 'Registro de asistencia eliminado',
    });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
