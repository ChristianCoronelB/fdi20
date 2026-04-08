import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { scanQRCode } from '@/lib/qr';

// POST: Scan and process QR code
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado. Por favor inicia sesión.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Código QR requerido' },
        { status: 400 }
      );
    }

    // Process QR code scan
    const result = await scanQRCode(code.trim(), session.userId);

    // Get updated user points
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { points: true, level: true }
    });

    // Get additional details based on type
    let additionalData: any = {
      totalPoints: user?.points || 0,
      level: user?.level || 1,
    };

    if (result.success && result.type === 'ACTIVITY' && result.data?.activity) {
      try {
        // Get activity details
        const activity = await db.activity.findUnique({
          where: { id: result.data.activity.id },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            startTime: true,
            endTime: true,
            room: {
              select: {
                id: true,
                name: true,
                building: true
              }
            }
          }
        });

        // Count complete attendances for certificate eligibility
        const completeAttendancesCount = await db.attendance.count({
          where: {
            userId: session.userId,
            checkInTime: { not: null },
            checkOutTime: { not: null }
          }
        });

        additionalData = {
          ...additionalData,
          activityDetails: activity ? {
            id: activity.id,
            title: activity.title,
            type: activity.type,
            status: activity.status,
            startTime: activity.startTime,
            endTime: activity.endTime,
            room: activity.room ? {
              id: activity.room.id,
              name: activity.room.name,
              building: activity.room.building,
            } : null,
          } : null,
          completeAttendances: completeAttendancesCount,
          canGenerateCertificate: completeAttendancesCount >= 3,
        };
      } catch (error) {
        console.error('Error getting activity details:', error);
      }
    }

    if (result.success && result.type === 'PROJECT' && result.data?.project) {
      try {
        const project = await db.project.findUnique({
          where: { id: result.data.project.id },
          select: {
            id: true,
            name: true,
            team: true,
            category: true,
            description: true,
            totalVotes: true,
            averageScore: true
          }
        });

        additionalData = {
          ...additionalData,
          projectDetails: project,
        };
      } catch (error) {
        console.error('Error getting project details:', error);
      }
    }

    if (result.success && result.type === 'ROOM' && result.data?.room) {
      try {
        const room = await db.room.findUnique({
          where: { id: result.data.room.id },
          select: {
            id: true,
            name: true,
            building: true,
            floor: true,
            capacity: true,
            _count: {
              select: { activities: true }
            }
          }
        });

        additionalData = {
          ...additionalData,
          roomDetails: room ? {
            ...room,
            activityCount: room._count?.activities || 0
          } : null,
        };
      } catch (error) {
        console.error('Error getting room details:', error);
      }
    }

    if (result.success && result.type === 'USER' && result.data?.user) {
      try {
        const userDetails = await db.user.findUnique({
          where: { id: result.data.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            points: true,
            level: true
          }
        });

        additionalData = {
          ...additionalData,
          userDetails: userDetails,
        };
      } catch (error) {
        console.error('Error getting user details:', error);
      }
    }

    return NextResponse.json({
      success: result.success,
      data: {
        type: result.type,
        message: result.message,
        ...result.data,
        ...additionalData,
      },
    });
  } catch (error) {
    console.error('Scan QR code error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor. Por favor intenta de nuevo.' },
      { status: 500 }
    );
  }
}
