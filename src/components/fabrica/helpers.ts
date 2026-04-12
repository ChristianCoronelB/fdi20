// Helper functions for Fábrica de Ideas

export const getInitials = (name: string) => 
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    IN_PROGRESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    FINALIST: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    WINNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    SUBMITTED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getActivityTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    KEYNOTE: 'bg-purple-500',
    WORKSHOP: 'bg-blue-500',
    PANEL: 'bg-green-500',
    PRESENTATION: 'bg-orange-500',
    NETWORKING: 'bg-pink-500',
    BREAK: 'bg-gray-500',
    OTHER: 'bg-gray-500',
  };
  return colors[type] || 'bg-gray-500';
};

export const getTypeLabel = (type: string) => {
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
};

export const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZER: 'Organizador',
    MODERATOR: 'Moderador',
    EVALUATOR: 'Evaluador',
    PARTICIPANT: 'Participante',
  };
  return labels[role] || role;
};

export const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    ORGANIZER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    MODERATOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    EVALUATOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    PARTICIPANT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

export const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    SCHEDULED: 'Programado',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    APPROVED: 'Aprobado',
    DRAFT: 'Borrador',
    FINALIST: 'Finalista',
    WINNER: 'Ganador',
    SUBMITTED: 'Enviado',
  };
  return labels[status] || status;
};
