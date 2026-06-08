import QRCode from 'qrcode';
import { db } from './db';
import type { QRType } from '@prisma/client';

export async function generateQRCode(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    width: 400,
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff',
    },
  });
}

export async function generateUniqueCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const existing = await db.qRCode.findUnique({ where: { code } });
  if (existing) {
    return generateUniqueCode();
  }
  
  return code;
}

export async function createQRCode(params: {
  type: QRType;
  userId?: string;
  roomId?: string;
  activityId?: string;
  projectId?: string;
  eventId?: string;
  expiresAt?: Date;
}): Promise<{ id: string; code: string; qrImage: string }> {
  const code = await generateUniqueCode();
  
  const qrCode = await db.qRCode.create({
    data: {
      code,
      type: params.type,
      userId: params.userId,
      roomId: params.roomId,
      activityId: params.activityId,
      projectId: params.projectId,
      eventId: params.eventId,
      expiresAt: params.expiresAt,
    },
  });
  
  const qrImage = await generateQRCode(code);
  
  return { id: qrCode.id, code, qrImage };
}

// Points configuration
const QR_POINTS = {
  ACTIVITY_CHECKIN: 10,
  ACTIVITY_CHECKOUT: 20,
  PROJECT_VIEW: 5,
  ROOM_CHECKIN: 5,
};

// Check if user already scanned this code
async function hasScanned(code: string, userId: string): Promise<boolean> {
  const scan = await db.qRScan.findUnique({
    where: { code_userId: { code, userId } }
  });
  return !!scan;
}

// Record a scan
async function recordScan(code: string, userId: string): Promise<void> {
  await db.qRScan.create({
    data: { code, userId }
  });
}

export async function scanQRCode(code: string, userId: string): Promise<{
  success: boolean;
  type: QRType;
  data?: {
    room?: { id: string; name: string };
    activity?: { id: string; title: string };
    project?: { id: string; name: string };
    pointsEarned?: number;
    attendanceComplete?: boolean;
    alreadyScanned?: boolean;
  };
  message: string;
}> {
  try {
    // Validate format
    if (!code || !code.includes(':')) {
      return { success: false, type: 'ROOM', message: 'Código QR inválido' };
    }

    const parts = code.split(':');
    const qrType = parts[0];
    const entityId = parts[1];

    // Handle ACTIVITY QR codes (special logic for check-in/check-out)
    if (qrType === 'ACTIVITY' && entityId) {
      const activity = await db.activity.findUnique({
        where: { id: entityId },
        select: { id: true, title: true }
      });

      if (!activity) {
        return { success: false, type: 'ACTIVITY', message: 'Actividad no encontrada' };
      }

      // Check registration
      const registration = await db.activityRegistration.findUnique({
        where: { userId_activityId: { userId, activityId: entityId } }
      });

      if (!registration) {
        return {
          success: false,
          type: 'ACTIVITY',
          message: `No estás registrado en "${activity.title}". Regístrate primero en la agenda.`
        };
      }

      // Check existing attendance
      const existing = await db.attendance.findUnique({
        where: { userId_activityId: { userId, activityId: entityId } }
      });

      const now = new Date();

      // No attendance = Check-in
      if (!existing) {
        await db.attendance.create({
          data: {
            userId,
            activityId: entityId,
            checkInTime: now,
            points: QR_POINTS.ACTIVITY_CHECKIN,
          }
        });

        await db.activity.update({
          where: { id: entityId },
          data: { currentAttendance: { increment: 1 } }
        });

        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.ACTIVITY_CHECKIN } }
        });

        return {
          success: true,
          type: 'ACTIVITY',
          data: { 
            activity: { id: activity.id, title: activity.title },
            pointsEarned: QR_POINTS.ACTIVITY_CHECKIN 
          },
          message: `Check-in en "${activity.title}". ¡+${QR_POINTS.ACTIVITY_CHECKIN} puntos!`
        };
      }

      // Has check-in but no check-out = Check-out
      if (existing.checkInTime && !existing.checkOutTime) {
        await db.attendance.update({
          where: { id: existing.id },
          data: { 
            checkOutTime: now,
            points: { increment: QR_POINTS.ACTIVITY_CHECKOUT }
          }
        });

        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.ACTIVITY_CHECKOUT } }
        });

        return {
          success: true,
          type: 'ACTIVITY',
          data: { 
            activity: { id: activity.id, title: activity.title },
            pointsEarned: QR_POINTS.ACTIVITY_CHECKOUT,
            attendanceComplete: true
          },
          message: `Check-out en "${activity.title}". ¡+${QR_POINTS.ACTIVITY_CHECKOUT} puntos!`
        };
      }

      // Already completed both
      return {
        success: true,
        type: 'ACTIVITY',
        data: { 
          activity: { id: activity.id, title: activity.title },
          attendanceComplete: true,
          alreadyScanned: true
        },
        message: `Ya completaste la asistencia en "${activity.title}"`
      };
    }

    // For ROOM and PROJECT - check if already scanned
    const alreadyScanned = await hasScanned(code, userId);
    
    if (alreadyScanned) {
      // Get entity name for message
      let entityName = 'este código';
      
      if (qrType === 'ROOM' && entityId) {
        const room = await db.room.findUnique({ where: { id: entityId }, select: { name: true } });
        if (room) entityName = `la sala "${room.name}"`;
      } else if (qrType === 'PROJECT' && entityId) {
        const project = await db.project.findUnique({ where: { id: entityId }, select: { name: true } });
        if (project) entityName = `el proyecto "${project.name}"`;
      }
      
      return {
        success: true,
        type: qrType as QRType,
        data: { alreadyScanned: true },
        message: `Ya has escaneado el código QR de ${entityName}.`
      };
    }

    // Handle ROOM QR codes
    if (qrType === 'ROOM' && entityId) {
      const room = await db.room.findUnique({
        where: { id: entityId },
        select: { id: true, name: true }
      });

      if (!room) {
        return { success: false, type: 'ROOM', message: 'Sala no encontrada' };
      }

      // Record scan
      await recordScan(code, userId);

      // Award points
      await db.user.update({
        where: { id: userId },
        data: { points: { increment: QR_POINTS.ROOM_CHECKIN } }
      });

      return {
        success: true,
        type: 'ROOM',
        data: { 
          room: { id: room.id, name: room.name },
          pointsEarned: QR_POINTS.ROOM_CHECKIN 
        },
        message: `Sala "${room.name}". ¡+${QR_POINTS.ROOM_CHECKIN} puntos!`
      };
    }

    // Handle PROJECT QR codes
    if (qrType === 'PROJECT' && entityId) {
      const project = await db.project.findUnique({
        where: { id: entityId },
        select: { id: true, name: true }
      });

      if (!project) {
        return { success: false, type: 'PROJECT', message: 'Proyecto no encontrado' };
      }

      // Record scan
      await recordScan(code, userId);

      // Award points
      await db.user.update({
        where: { id: userId },
        data: { points: { increment: QR_POINTS.PROJECT_VIEW } }
      });

      return {
        success: true,
        type: 'PROJECT',
        data: { 
          project: { id: project.id, name: project.name },
          pointsEarned: QR_POINTS.PROJECT_VIEW 
        },
        message: `Proyecto "${project.name}". ¡+${QR_POINTS.PROJECT_VIEW} puntos!`
      };
    }

    return { success: false, type: 'ROOM', message: 'Tipo de código no reconocido' };

  } catch (error) {
    console.error('Error scanning QR:', error);
    return { success: false, type: 'ROOM', message: 'Error al procesar el código QR' };
  }
}
