import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: List available QR codes for activities, rooms, projects
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
    const type = searchParams.get('type'); // ACTIVITY, ROOM, PROJECT
    const eventId = searchParams.get('eventId');

    const qrList: Array<{
      id: string;
      type: string;
      name: string;
      qrData: string;
      qrUrl: string;
    }> = [];

    // Get activities with QR data
    if (!type || type === 'ACTIVITY') {
      const activities = await db.activity.findMany({
        where: eventId ? { eventId } : undefined,
        include: {
          room: {
            select: { name: true, building: true, floor: true },
          },
          event: {
            select: { name: true },
          },
        },
        take: 50,
      });

      for (const activity of activities) {
        const qrData = JSON.stringify({
          type: 'ACTIVITY',
          id: activity.id,
          title: activity.title,
          room: activity.room?.name,
          event: activity.event?.name,
        });
        
        qrList.push({
          id: activity.id,
          type: 'ACTIVITY',
          name: activity.title,
          qrData,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`,
        });
      }
    }

    // Get rooms with QR data
    if (!type || type === 'ROOM') {
      const rooms = await db.room.findMany({
        where: eventId ? { eventId } : undefined,
        take: 50,
      });

      for (const room of rooms) {
        const qrData = JSON.stringify({
          type: 'ROOM',
          id: room.id,
          name: room.name,
          building: room.building,
          floor: room.floor,
        });
        
        qrList.push({
          id: room.id,
          type: 'ROOM',
          name: room.name,
          qrData,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`,
        });
      }
    }

    // Get projects with QR data
    if (!type || type === 'PROJECT') {
      const projects = await db.project.findMany({
        where: {
          eventId: eventId || undefined,
          status: { in: ['APPROVED', 'FINALIST', 'WINNER'] },
        },
        take: 50,
      });

      for (const project of projects) {
        const qrData = JSON.stringify({
          type: 'PROJECT',
          id: project.id,
          name: project.name,
          category: project.category,
        });
        
        qrList.push({
          id: project.id,
          type: 'PROJECT',
          name: project.name,
          qrData,
          qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: qrList,
      total: qrList.length,
    });
  } catch (error) {
    console.error('Get QR list error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
