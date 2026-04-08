import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, formatStr: string = 'PPP', locale: string = 'es'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: locale === 'es' ? es : enUS });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm');
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'PPP HH:mm', { locale: es });
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function getSmartDateLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(d)) return 'Hoy';
  if (isTomorrow(d)) return 'Mañana';
  if (isYesterday(d)) return 'Ayer';
  
  return format(d, 'EEEE d MMM', { locale: es });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    DRAFT: 'bg-gray-100 text-gray-600',
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    FINALIST: 'bg-purple-100 text-purple-800',
    WINNER: 'bg-amber-100 text-amber-800',
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getActivityTypeColor(type: string): string {
  const colors: Record<string, string> = {
    KEYNOTE: 'bg-purple-500',
    WORKSHOP: 'bg-blue-500',
    PANEL: 'bg-green-500',
    PRESENTATION: 'bg-orange-500',
    NETWORKING: 'bg-pink-500',
    BREAK: 'bg-gray-500',
    OTHER: 'bg-indigo-500',
  };
  
  return colors[type] || 'bg-gray-500';
}

export function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    KEYNOTE: 'Conferencia',
    WORKSHOP: 'Taller',
    PANEL: 'Panel',
    PRESENTATION: 'Presentación',
    NETWORKING: 'Networking',
    BREAK: 'Descanso',
    OTHER: 'Otro',
  };
  
  return labels[type] || type;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SCHEDULED: 'Programado',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado',
    DRAFT: 'Borrador',
    SUBMITTED: 'Enviado',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    FINALIST: 'Finalista',
    WINNER: 'Ganador',
  };
  
  return labels[status] || status;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZER: 'Organizador',
    MODERATOR: 'Moderador',
    PARTICIPANT: 'Participante',
  };
  
  return labels[role] || role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800',
    ORGANIZER: 'bg-purple-100 text-purple-800',
    MODERATOR: 'bg-blue-100 text-blue-800',
    PARTICIPANT: 'bg-green-100 text-green-800',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
}

export function calculateLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}

export function getProgressToNextLevel(points: number): number {
  const currentLevel = calculateLevel(points);
  const pointsForCurrentLevel = (currentLevel - 1) * 100;
  const pointsForNextLevel = currentLevel * 100;
  const progress = points - pointsForCurrentLevel;
  const needed = pointsForNextLevel - pointsForCurrentLevel;
  return Math.min(100, Math.max(0, (progress / needed) * 100));
}

export function downloadFile(data: string, filename: string, type: string = 'application/json') {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
