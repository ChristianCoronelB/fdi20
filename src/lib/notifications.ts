import { db } from '@/lib/db';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId?: string;
  eventId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  isGlobal?: boolean;
  actionUrl?: string;
}

// Create a notification
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.isGlobal ? null : params.userId,
        eventId: params.eventId,
        title: params.title,
        message: params.message,
        type: params.type || 'INFO',
        isGlobal: params.isGlobal ?? false,
        actionUrl: params.actionUrl,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Notification helper functions for common events

export async function notifyVoteConfirmation(
  userId: string,
  eventId: string,
  projectName: string,
  votesRemaining: number
) {
  // Check if vote notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.voteConfirmationEnabled) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: '¡Voto Registrado!',
    message: `Has votado por "${projectName}". Te quedan ${votesRemaining} votos disponibles.`,
    type: 'VOTE_CONFIRMATION',
    actionUrl: '/projects-view',
  });
}

export async function notifyPointsEarned(
  userId: string,
  eventId: string,
  points: number,
  reason: string
) {
  // Check if points notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.pointsEarnedEnabled) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: '¡Puntos Ganados!',
    message: `Has ganado ${points} puntos: ${reason}`,
    type: 'POINTS_EARNED',
  });
}

export async function notifyAchievement(
  userId: string,
  eventId: string,
  achievementName: string,
  achievementDescription: string
) {
  // Check if achievement notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.achievementEnabled) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: `🏆 Logro Desbloqueado: ${achievementName}`,
    message: achievementDescription,
    type: 'ACHIEVEMENT',
  });
}

export async function notifyActivityReminder(
  userId: string,
  eventId: string,
  activityTitle: string,
  activityId: string,
  minutesBefore: number
) {
  // Check if activity reminders are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.activityReminderEnabled) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: `⏰ Recordatorio: ${activityTitle}`,
    message: `La actividad comienza en ${minutesBefore} minutos. ¡No olvides registrarte!`,
    type: 'ACTIVITY_REMINDER',
    actionUrl: `/agenda?activity=${activityId}`,
  });
}

export async function notifyActivityStarting(
  eventId: string,
  activityTitle: string,
  roomName: string
) {
  // Check if activity start notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.activityStartEnabled) {
    return null;
  }

  return createNotification({
    eventId,
    title: `🎬 ¡Comenzando: ${activityTitle}!`,
    message: `La actividad está por comenzar en ${roomName}. ¡Únete ahora!`,
    type: 'ACTIVITY_START',
    isGlobal: true,
  });
}

export async function notifyCertificateReady(
  userId: string,
  eventId: string,
  certificateTitle: string
) {
  // Check if certificate notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.certificateReadyEnabled) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: '🎓 ¡Certificado Listo!',
    message: `Tu certificado "${certificateTitle}" está disponible para descargar.`,
    type: 'CERTIFICATE_READY',
    actionUrl: '/certificates',
  });
}

export async function notifyVoteReminder(
  userId: string,
  eventId: string,
  totalProjects: number,
  votesUsed: number,
  maxVotes: number
) {
  // Check if vote reminder notifications are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.voteReminderEnabled) {
    return null;
  }

  const votesRemaining = maxVotes - votesUsed;
  
  if (votesRemaining <= 0) {
    return null;
  }

  return createNotification({
    userId,
    eventId,
    title: '🗳️ ¡Aún puedes votar!',
    message: `Tienes ${votesRemaining} votos disponibles de ${maxVotes}. ¡Vota por tus proyectos favoritos!`,
    type: 'VOTE_REMINDER',
    actionUrl: '/projects-view',
  });
}

export async function notifyAnnouncement(
  eventId: string,
  title: string,
  message: string
) {
  // Check if announcements are enabled
  const config = await db.notificationConfig.findFirst({
    where: { eventId },
  });

  if (config && !config.announcementsEnabled) {
    return null;
  }

  return createNotification({
    eventId,
    title: `📢 ${title}`,
    message,
    type: 'ANNOUNCEMENT',
    isGlobal: true,
  });
}
