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
  console.log('[QR] Starting scan for code:', code, 'userId:', userId);
  
  try {
    // Validate input
    if (!code || typeof code !== 'string') {
      console.log('[QR] Invalid code: empty or not string');
      return { success: false, type: 'ROOM', message: 'Código QR inválido' };
    }

    const trimmedCode = code.trim();
    
    if (!trimmedCode.includes(':')) {
      console.log('[QR] Invalid code format: no colon found');
      return { success: false, type: 'ROOM', message: 'Formato de código inválido' };
    }

    const parts = trimmedCode.split(':');
    const qrType = parts[0];
    const entityId = parts[1];

    console.log('[QR] Parsed - Type:', qrType, 'EntityId:', entityId);

    if (!entityId) {
      console.log('[QR] No entity ID found');
      return { success: false, type: 'ROOM', message: 'Código QR incompleto' };
    }

    // ============ ACTIVITY QR CODES ============
    if (qrType === 'ACTIVITY') {
      console.log('[QR] Processing ACTIVITY code');
      
      try {
        const activity = await db.activity.findUnique({
          where: { id: entityId },
          select: { id: true, title: true }
        });

        if (!activity) {
          console.log('[QR] Activity not found:', entityId);
          return { success: false, type: 'ACTIVITY', message: 'Actividad no encontrada' };
        }

        // Check registration
        const registration = await db.activityRegistration.findUnique({
          where: { userId_activityId: { userId, activityId: entityId } }
        });

        if (!registration) {
          console.log('[QR] User not registered for activity');
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
          console.log('[QR] Creating check-in');
          
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
          console.log('[QR] Creating check-out');
          
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

        // Already completed
        console.log('[QR] Attendance already complete');
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
      } catch (activityError) {
        console.error('[QR] Error processing activity:', activityError);
        return { success: false, type: 'ACTIVITY', message: 'Error al procesar actividad' };
      }
    }

    // ============ ROOM QR CODES ============
    if (qrType === 'ROOM') {
      console.log('[QR] Processing ROOM code');
      
      try {
        const room = await db.room.findUnique({
          where: { id: entityId },
          select: { id: true, name: true }
        });

        if (!room) {
          console.log('[QR] Room not found:', entityId);
          return { success: false, type: 'ROOM', message: 'Sala no encontrada' };
        }

        // Check if already scanned (using findFirst for safety)
        const existingScan = await db.qRScan.findFirst({
          where: { code: trimmedCode, userId }
        });

        if (existingScan) {
          console.log('[QR] Room already scanned');
          return {
            success: true,
            type: 'ROOM',
            data: { 
              room: { id: room.id, name: room.name },
              alreadyScanned: true 
            },
            message: `Ya has escaneado el código de la sala "${room.name}".`
          };
        }

        // Record scan
        await db.qRScan.create({
          data: { code: trimmedCode, userId }
        });

        // Award points
        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.ROOM_CHECKIN } }
        });

        console.log('[QR] Room scan successful');
        return {
          success: true,
          type: 'ROOM',
          data: { 
            room: { id: room.id, name: room.name },
            pointsEarned: QR_POINTS.ROOM_CHECKIN 
          },
          message: `Sala "${room.name}". ¡+${QR_POINTS.ROOM_CHECKIN} puntos!`
        };
      } catch (roomError) {
        console.error('[QR] Error processing room:', roomError);
        return { success: false, type: 'ROOM', message: 'Error al procesar sala' };
      }
    }

    // ============ PROJECT QR CODES ============
    if (qrType === 'PROJECT') {
      console.log('[QR] Processing PROJECT code');
      
      try {
        const project = await db.project.findUnique({
          where: { id: entityId },
          select: { id: true, name: true }
        });

        if (!project) {
          console.log('[QR] Project not found:', entityId);
          return { success: false, type: 'PROJECT', message: 'Proyecto no encontrado' };
        }

        // Check if already scanned
        const existingScan = await db.qRScan.findFirst({
          where: { code: trimmedCode, userId }
        });

        if (existingScan) {
          console.log('[QR] Project already scanned');
          return {
            success: true,
            type: 'PROJECT',
            data: { 
              project: { id: project.id, name: project.name },
              alreadyScanned: true 
            },
            message: `Ya has escaneado el código del proyecto "${project.name}".`
          };
        }

        // Record scan
        await db.qRScan.create({
          data: { code: trimmedCode, userId }
        });

        // Award points
        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.PROJECT_VIEW } }
        });

        console.log('[QR] Project scan successful');
        return {
          success: true,
          type: 'PROJECT',
          data: { 
            project: { id: project.id, name: project.name },
            pointsEarned: QR_POINTS.PROJECT_VIEW 
          },
          message: `Proyecto "${project.name}". ¡+${QR_POINTS.PROJECT_VIEW} puntos!`
        };
      } catch (projectError) {
        console.error('[QR] Error processing project:', projectError);
        return { success: false, type: 'PROJECT', message: 'Error al procesar proyecto' };
      }
    }

    console.log('[QR] Unknown QR type:', qrType);
    return { success: false, type: 'ROOM', message: 'Tipo de código no reconocido' };

  } catch (error) {
    console.error('[QR] Unexpected error:', error);
    return { success: false, type: 'ROOM', message: 'Error al procesar el código QR' };
  }
}
