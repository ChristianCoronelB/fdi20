import type { 
  User, Event, Room, Activity, Speaker, Project, Vote, 
  Attendance, QRCode, Notification, Achievement, UserAchievement,
  UserRole, ActivityStatus, ActivityType, ProjectStatus, VoteType, QRType, NotificationType
} from '@prisma/client';

// Re-export Prisma types
export type {
  User, Event, Room, Activity, Speaker, Project, Vote,
  Attendance, QRCode, Notification, Achievement, UserAchievement,
  UserRole, ActivityStatus, ActivityType, ProjectStatus, VoteType, QRType, NotificationType
};

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  points: number;
  level: number;
}

// Event types
export interface EventWithStats extends Event {
  _count?: {
    rooms: number;
    activities: number;
    projects: number;
    speakers: number;
  };
}

// Activity types
export interface ActivityWithDetails extends Activity {
  room: Room;
  speaker?: Speaker | null;
  _count?: {
    attendances: number;
  };
}

// Project types
export interface ProjectWithDetails extends Project {
  _count?: {
    votes: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalActivities: number;
  totalProjects: number;
  totalVotes: number;
  totalAttendance: number;
  activeUsers: number;
  upcomingActivities: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ActivityByHour {
  hour: number;
  count: number;
}

// Voting types
export interface VotingResult {
  projectId: string;
  projectName: string;
  team: string;
  category: string;
  totalVotes: number;
  averageScore: number;
  rank: number;
}

// Gamification types
export interface UserStats {
  points: number;
  level: number;
  rank: number;
  activitiesAttended: number;
  projectsVoted: number;
  achievements: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  points: number;
  level: number;
  rank: number;
}

// Notification types
export interface NotificationWithUser extends Notification {
  user?: User | null;
}

// Map types
export interface MapMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'room' | 'activity' | 'project';
  color: string;
  description?: string;
}

// QR Scanner types
export interface QRScanResult {
  success: boolean;
  type: QRType;
  data?: {
    room?: { id: string; name: string };
    activity?: { id: string; name: string };
    project?: { id: string; name: string };
    user?: { id: string; name: string };
  };
  message: string;
}
