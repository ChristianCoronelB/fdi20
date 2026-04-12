// Types for Fábrica de Ideas

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ORGANIZER' | 'MODERATOR' | 'EVALUATOR' | 'PARTICIPANT';
  avatar?: string;
  points: number;
  level: number;
}

export interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  address?: string;
  isActive: boolean;
  _count?: { rooms: number; activities: number; projects: number };
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  building?: string;
  floor?: string;
  latitude?: number;
  longitude?: number;
  color?: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  room?: Room;
  speaker?: { name: string; photo?: string };
  currentAttendance: number;
  _count?: { attendances: number };
}

export interface Project {
  id: string;
  name: string;
  team: string;
  category?: string;
  description?: string;
  image?: string;
  totalVotes: number;
  averageScore?: number;
  averageEvaluation?: number;
  evaluationCount?: number;
  status: string;
  rank?: number;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  institution?: string;
  course?: string;
  tutorName?: string;
  area?: string;
  projectCategory?: string;
}

export interface Evaluation {
  id: string;
  userId: string;
  projectId: string;
  innovation: number;
  innovationComment?: string;
  viability: number;
  viabilityComment?: string;
  impact: number;
  impactComment?: string;
  presentation: number;
  presentationComment?: string;
  scalability: number;
  scalabilityComment?: string;
  execution: number;
  executionComment?: string;
  totalScore: number;
  generalComment?: string;
  status: string;
  submittedAt?: string;
  createdAt: string;
  project?: Project;
  user?: { id: string; name: string; email: string };
}

export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalActivities: number;
  totalProjects: number;
  totalVotes: number;
  totalAttendance: number;
  upcomingActivities: number;
}

export const EVALUATION_CRITERIA = [
  { key: 'innovation', label: 'Innovación y Creatividad', description: 'Originalidad y creatividad de la idea' },
  { key: 'viability', label: 'Viabilidad del Negocio', description: 'Factibilidad de implementación' },
  { key: 'impact', label: 'Impacto Social/Ambiental', description: 'Contribución positiva a la sociedad' },
  { key: 'presentation', label: 'Presentación y Comunicación', description: 'Calidad de la presentación' },
  { key: 'scalability', label: 'Potencial de Escalamiento', description: 'Capacidad de crecimiento' },
  { key: 'execution', label: 'Equipo y Ejecución', description: 'Capacidad del equipo' },
] as const;

export type EvaluationCriteriaKey = typeof EVALUATION_CRITERIA[number]['key'];
