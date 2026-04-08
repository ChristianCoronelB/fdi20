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
  
  // Ensure uniqueness
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

// Points configuration for QR scanning
const QR_POINTS = {
  ACTIVITY_CHECKIN: 10,
  ACTIVITY_CHECKOUT: 15,
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
    user?: { id: string; name: string };
    pointsEarned?: number;
    attendanceComplete?: boolean;
  };
  message: string;
}> {
  try {
    // First, try to parse as structured QR format (ROOM:id:..., ACTIVITY:id:..., PROJECT:id:...)
    if (code && code.includes(':')) {
      const parts = code.split(':');
      const qrType = parts[0];

      if (qrType === 'ROOM' && parts[1]) {
        const roomId = parts[1];

        try {
          // Get room from database
          const room = await db.room.findUnique({
            where: { id: roomId },
            select: { id: true, name: true, building: true, floor: true }
          });

          if (room) {
            // Award points for room check-in
            await db.user.update({
              where: { id: userId },
              data: { points: { increment: QR_POINTS.ROOM_CHECKIN } }
            });

            return {
              success: true,
              type: 'ROOM',
              data: {
                room: { id: room.id, name: room.name },
                pointsEarned: QR_POINTS.ROOM_CHECKIN,
              },
              message: `Sala "${room.name}" encontrada. ¡+${QR_POINTS.ROOM_CHECKIN} puntos!`,
            };
          }
        } catch (error) {
          console.error('Error processing ROOM QR:', error);
        }
      }

      if (qrType === 'ACTIVITY' && parts[1]) {
        const activityId = parts[1];

        try {
          // Get activity from database
          const activity = await db.activity.findUnique({
            where: { id: activityId },
            select: { id: true, title: true, type: true, status: true }
          });

          if (activity) {
            const now = new Date();

            // Check if user is registered for this activity
            const registration = await db.activityRegistration.findUnique({
              where: {
                userId_activityId: {
                  userId: userId,
                  activityId: activityId
                }
              }
            });

            if (!registration) {
              return {
                success: false,
                type: 'ACTIVITY',
                message: `No estás registrado en "${activity.title}". Debes registrarte primero en la agenda para poder registrar tu asistencia.`,
              };
            }

            // Check existing attendance
            const existingAttendance = await db.attendance.findUnique({
              where: {
                userId_activityId: {
                  userId: userId,
                  activityId: activityId
                }
              }
            });

            let pointsEarned = 0;
            let message = '';
            let attendanceComplete = false;

            if (!existingAttendance) {
              // Create new attendance with check-in
              await db.attendance.create({
                data: {
                  userId: userId,
                  activityId: activityId,
                  checkInTime: now,
                  points: QR_POINTS.ACTIVITY_CHECKIN,
                }
              });
              
              pointsEarned = QR_POINTS.ACTIVITY_CHECKIN;
              message = `Check-in registrado en "${activity.title}". ¡+${pointsEarned} puntos!`;

              // Update activity attendance count
              await db.activity.update({
                where: { id: activityId },
                data: { currentAttendance: { increment: 1 } }
              });
            } else if (existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
              // Do check-out with bonus
              const totalPointsForCheckout = QR_POINTS.ACTIVITY_CHECKOUT + 5;
              
              await db.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                  checkOutTime: now,
                  points: { increment: totalPointsForCheckout }
                }
              });
              
              pointsEarned = totalPointsForCheckout;
              attendanceComplete = true;
              message = `Check-out registrado en "${activity.title}". ¡+${pointsEarned} puntos! Asistencia completa.`;
            } else if (existingAttendance.checkInTime && existingAttendance.checkOutTime) {
              return {
                success: true,
                type: 'ACTIVITY',
                data: {
                  activity: { id: activity.id, title: activity.title },
                  attendanceComplete: true,
                },
                message: 'Ya completaste la asistencia a esta actividad',
              };
            }

            // Award points to user
            if (pointsEarned > 0) {
              await db.user.update({
                where: { id: userId },
                data: { points: { increment: pointsEarned } }
              });
            }

            return {
              success: true,
              type: 'ACTIVITY',
              data: {
                activity: { id: activity.id, title: activity.title },
                pointsEarned,
                attendanceComplete,
              },
              message,
            };
          }
        } catch (error) {
          console.error('Error processing ACTIVITY QR:', error);
        }
      }

      if (qrType === 'PROJECT' && parts[1]) {
        const projectId = parts[1];

        try {
          const project = await db.project.findUnique({
            where: { id: projectId },
            select: { id: true, name: true, team: true }
          });

          if (project) {
            await db.user.update({
              where: { id: userId },
              data: { points: { increment: QR_POINTS.PROJECT_VIEW } }
            });

            return {
              success: true,
              type: 'PROJECT',
              data: {
                project: { id: project.id, name: project.name },
                pointsEarned: QR_POINTS.PROJECT_VIEW,
              },
              message: `Proyecto "${project.name}" encontrado. ¡+${QR_POINTS.PROJECT_VIEW} puntos!`,
            };
          }
        } catch (error) {
          console.error('Error processing PROJECT QR:', error);
        }
      }
    }

    // If not a structured format, look up in database
    const qrCode = await db.qRCode.findUnique({
      where: { code },
      include: {
        room: true,
        activity: true,
        project: true,
        user: true,
      },
    });

    if (!qrCode) {
      return { success: false, type: 'ROOM', message: 'Código QR no válido. El código no está registrado en el sistema.' };
    }

    if (!qrCode.isActive) {
      return { success: false, type: qrCode.type, message: 'Código QR desactivado' };
    }

    if (qrCode.expiresAt && qrCode.expiresAt < new Date()) {
      return { success: false, type: qrCode.type, message: 'Código QR expirado' };
    }

    // Increment scan count
    await db.qRCode.update({
      where: { id: qrCode.id },
      data: { scanCount: { increment: 1 } },
    });

    // Handle different QR types
    switch (qrCode.type) {
      case 'ACTIVITY':
        if (qrCode.activityId && qrCode.activity) {
          const now = new Date();

          // Check if user is registered for this activity
          const registration = await db.activityRegistration.findUnique({
            where: {
              userId_activityId: {
                userId: userId,
                activityId: qrCode.activityId
              }
            }
          });

          if (!registration) {
            return {
              success: false,
              type: qrCode.type,
              message: `No estás registrado en "${qrCode.activity.title}". Debes registrarte primero en la agenda para poder registrar tu asistencia.`,
            };
          }

          // Check if already has attendance record
          const existingAttendance = await db.attendance.findUnique({
            where: {
              userId_activityId: {
                userId: userId,
                activityId: qrCode.activityId
              }
            }
          });

          let pointsEarned = 0;
          let message = '';
          let attendanceComplete = false;

          if (!existingAttendance) {
            // Create new attendance with check-in
            await db.attendance.create({
              data: {
                userId: userId,
                activityId: qrCode.activityId,
                checkInTime: now,
                points: QR_POINTS.ACTIVITY_CHECKIN,
              }
            });
            
            pointsEarned = QR_POINTS.ACTIVITY_CHECKIN;
            message = `Check-in registrado en "${qrCode.activity.title}". ¡+${pointsEarned} puntos!`;

            // Update activity attendance count
            await db.activity.update({
              where: { id: qrCode.activityId },
              data: { currentAttendance: { increment: 1 } }
            });
          } else if (existingAttendance.checkInTime && !existingAttendance.checkOutTime) {
            // Do check-out with bonus for complete attendance
            const totalPointsForCheckout = QR_POINTS.ACTIVITY_CHECKOUT + 5;
            
            await db.attendance.update({
              where: { id: existingAttendance.id },
              data: {
                checkOutTime: now,
                points: { increment: totalPointsForCheckout }
              }
            });
            
            pointsEarned = totalPointsForCheckout;
            attendanceComplete = true;
            message = `Check-out registrado en "${qrCode.activity.title}". ¡+${pointsEarned} puntos! Asistencia completa.`;
          } else if (existingAttendance.checkInTime && existingAttendance.checkOutTime) {
            return {
              success: true,
              type: qrCode.type,
              data: {
                activity: {
                  id: qrCode.activity.id,
                  title: qrCode.activity.title,
                },
                attendanceComplete: true,
              },
              message: 'Ya completaste la asistencia a esta actividad',
            };
          }

          // Award points to user
          if (pointsEarned > 0) {
            await db.user.update({
              where: { id: userId },
              data: { points: { increment: pointsEarned } }
            });
          }

          return {
            success: true,
            type: qrCode.type,
            data: {
              activity: {
                id: qrCode.activity.id,
                title: qrCode.activity.title,
              },
              pointsEarned,
              attendanceComplete,
            },
            message,
          };
        }
        break;

      case 'PROJECT':
        // Award points for viewing project
        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.PROJECT_VIEW } }
        });

        return {
          success: true,
          type: qrCode.type,
          data: {
            project: qrCode.project ? { id: qrCode.project.id, name: qrCode.project.name } : undefined,
            pointsEarned: QR_POINTS.PROJECT_VIEW,
          },
          message: `Proyecto "${qrCode.project?.name}" encontrado. ¡+${QR_POINTS.PROJECT_VIEW} puntos!`,
        };

      case 'ROOM':
        // Award points for room check-in
        await db.user.update({
          where: { id: userId },
          data: { points: { increment: QR_POINTS.ROOM_CHECKIN } }
        });

        return {
          success: true,
          type: qrCode.type,
          data: {
            room: qrCode.room ? { id: qrCode.room.id, name: qrCode.room.name } : undefined,
            pointsEarned: QR_POINTS.ROOM_CHECKIN,
          },
          message: `Sala "${qrCode.room?.name}" encontrada. ¡+${QR_POINTS.ROOM_CHECKIN} puntos!`,
        };

      case 'USER':
        return {
          success: true,
          type: qrCode.type,
          data: qrCode.user ? {
            user: { id: qrCode.user.id, name: qrCode.user.name },
          } : undefined,
          message: 'Usuario encontrado',
        };
    }

    return { success: false, type: qrCode.type, message: 'Tipo de QR no soportado' };
  } catch (error) {
    console.error('Error in scanQRCode:', error);
    return { 
      success: false, 
      type: 'ROOM', 
      message: 'Error al procesar el código QR. Por favor intenta de nuevo.' 
    };
  }
}
