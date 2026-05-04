'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, MapPin, Award, QrCode, Settings,
  Bell, LogOut, Menu, X, ChevronRight, Plus, Minus, Edit, Trash2, Eye,
  Search, Filter, Download, Upload, Check, Clock, Star, Heart,
  Trophy, Target, Zap, TrendingUp, BarChart3, PieChart, Activity,
  User, Mail, Phone, Globe, Instagram, Twitter, Linkedin, Github,
  Camera, FileText, Medal, Gift, Sparkles, Timer, Play, Pause,
  RefreshCw, Send, MessageSquare, MoreVertical, Copy, Share2,
  Home, Building, Presentation, Lightbulb, Vote, Shield, Moon, Sun, Lock,
  CheckCircle, Navigation, Crosshair, AlertTriangle
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { cn } from '@/lib/utils-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'ORGANIZER' | 'MODERATOR' | 'EVALUATOR' | 'PARTICIPANT';
  avatar?: string;
  points: number;
  level: number;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
  _count?: { rooms: number; activities: number; projects: number };
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  building?: string;
  floor?: string;
  latitude?: number;
  longitude?: number;
  color?: string;
}

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  room?: Room;
  speaker?: { name: string; photo?: string };
  expositorName?: string;
  currentAttendance: number;
  _count?: { attendances: number };
}

interface Project {
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
}

interface Evaluation {
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

interface DashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalActivities: number;
  totalProjects: number;
  totalVotes: number;
  totalAttendance: number;
  upcomingActivities: number;
}

// Mock data
const mockUser: User = {
  id: '1',
  email: 'admin@fabricadeideas.com',
  name: 'Carlos García',
  role: 'ADMIN',
  avatar: undefined,
  points: 2450,
  level: 25,
};

const mockEvents: Event[] = [
  {
    id: '1',
    name: 'Fábrica de Ideas 2024',
    description: 'El evento de innovación más grande del año. Tres días de conferencias, talleres y competencias.',
    startDate: '2024-03-15T09:00:00',
    endDate: '2024-03-17T18:00:00',
    location: 'Centro de Convenciones',
    isActive: true,
    _count: { rooms: 8, activities: 45, projects: 32 },
  },
  {
    id: '2',
    name: 'Hackathon de IA',
    description: '48 horas de desarrollo con inteligencia artificial.',
    startDate: '2024-04-20T00:00:00',
    endDate: '2024-04-22T00:00:00',
    location: 'Virtual',
    isActive: true,
    _count: { rooms: 3, activities: 12, projects: 18 },
  },
];

const mockRooms: Room[] = [
  { id: '1', name: 'Auditorio Principal', capacity: 500, building: 'Edificio A', floor: 'Planta Baja', color: '#3B82F6' },
  { id: '2', name: 'Sala Innovación', capacity: 150, building: 'Edificio B', floor: 'Piso 2', color: '#10B981' },
  { id: '3', name: 'Workshop Lab 1', capacity: 50, building: 'Edificio C', floor: 'Piso 1', color: '#F59E0B' },
  { id: '4', name: 'Workshop Lab 2', capacity: 50, building: 'Edificio C', floor: 'Piso 1', color: '#8B5CF6' },
  { id: '5', name: 'Sala de Exposiciones', capacity: 200, building: 'Edificio A', floor: 'Piso 1', color: '#EF4444' },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Inauguración del Evento',
    description: 'Ceremonia de apertura con keynote principal sobre el futuro de la innovación.',
    type: 'KEYNOTE',
    status: 'SCHEDULED',
    startTime: '2024-03-15T09:00:00',
    endTime: '2024-03-15T10:30:00',
    room: mockRooms[0],
    speaker: { name: 'Dra. María López', photo: undefined },
    currentAttendance: 0,
  },
  {
    id: '2',
    title: 'Taller de Design Thinking',
    description: 'Aprende metodologías de diseño centrado en el usuario.',
    type: 'WORKSHOP',
    status: 'SCHEDULED',
    startTime: '2024-03-15T11:00:00',
    endTime: '2024-03-15T13:00:00',
    room: mockRooms[2],
    speaker: { name: 'Juan Martínez' },
    currentAttendance: 35,
  },
  {
    id: '3',
    title: 'Panel: Startups que transforman',
    description: 'Fundadores comparten sus experiencias y lecciones aprendidas.',
    type: 'PANEL',
    status: 'IN_PROGRESS',
    startTime: '2024-03-15T14:00:00',
    endTime: '2024-03-15T15:30:00',
    room: mockRooms[0],
    currentAttendance: 280,
  },
  {
    id: '4',
    title: 'Networking Session',
    description: 'Conecta con otros participantes y crea alianzas.',
    type: 'NETWORKING',
    status: 'SCHEDULED',
    startTime: '2024-03-15T16:00:00',
    endTime: '2024-03-15T17:30:00',
    room: mockRooms[4],
    currentAttendance: 0,
  },
  {
    id: '5',
    title: 'Pitch Competition',
    description: 'Los mejores proyectos presentan sus propuestas.',
    type: 'PRESENTATION',
    status: 'SCHEDULED',
    startTime: '2024-03-16T10:00:00',
    endTime: '2024-03-16T12:00:00',
    room: mockRooms[0],
    currentAttendance: 0,
  },
];

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'EcoTrack',
    team: 'Green Solutions',
    category: 'Sostenibilidad',
    description: 'App para monitorear y reducir tu huella de carbono personal.',
    totalVotes: 156,
    averageScore: 4.7,
    status: 'APPROVED',
    rank: 1,
  },
  {
    id: '2',
    name: 'MediConnect',
    team: 'HealthTech Pro',
    category: 'Salud',
    description: 'Plataforma de telemedicina con IA para diagnóstico preventivo.',
    totalVotes: 142,
    averageScore: 4.5,
    status: 'APPROVED',
    rank: 2,
  },
  {
    id: '3',
    name: 'LearnPath',
    team: 'EduInnovators',
    category: 'Educación',
    description: 'Sistema de aprendizaje adaptativo basado en el estilo cognitivo del estudiante.',
    totalVotes: 128,
    averageScore: 4.4,
    status: 'APPROVED',
    rank: 3,
  },
  {
    id: '4',
    name: 'SmartCity Hub',
    team: 'Urban Tech',
    category: 'Smart Cities',
    description: 'Plataforma IoT para gestión urbana inteligente.',
    totalVotes: 98,
    averageScore: 4.2,
    status: 'APPROVED',
    rank: 4,
  },
  {
    id: '5',
    name: 'FinBot',
    team: 'FinTech Dreams',
    category: 'Finanzas',
    description: 'Asistente financiero personal impulsado por IA.',
    totalVotes: 87,
    averageScore: 4.0,
    status: 'APPROVED',
    rank: 5,
  },
];

const mockDashboardStats: DashboardStats = {
  totalUsers: 1250,
  totalEvents: 2,
  totalActivities: 45,
  totalProjects: 32,
  totalVotes: 1847,
  totalAttendance: 3560,
  upcomingActivities: 12,
};

const mockLeaderboard = [
  { rank: 1, name: 'Ana Rodríguez', points: 3250, level: 33, avatar: undefined },
  { rank: 2, name: 'Pedro Sánchez', points: 2980, level: 30, avatar: undefined },
  { rank: 3, name: 'Carlos García', points: 2450, level: 25, avatar: undefined },
  { rank: 4, name: 'María Fernández', points: 2100, level: 21, avatar: undefined },
  { rank: 5, name: 'Luis Torres', points: 1890, level: 19, avatar: undefined },
];

// Helper functions
const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    IN_PROGRESS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    FINALIST: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    WINNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getActivityTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    KEYNOTE: 'bg-purple-500',
    KEYNOTE_SPEECH: 'bg-violet-600',
    WORKSHOP: 'bg-blue-500',
    PANEL: 'bg-green-500',
    PRESENTATION: 'bg-orange-500',
    NETWORKING: 'bg-pink-500',
    BREAK: 'bg-gray-500',
    OTHER: 'bg-indigo-500',
  };
  return colors[type] || 'bg-indigo-500';
};

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    KEYNOTE: 'Conferencia',
    KEYNOTE_SPEECH: 'Charla Magistral',
    WORKSHOP: 'Taller',
    PANEL: 'Panel',
    PRESENTATION: 'Presentación',
    NETWORKING: 'Networking',
    BREAK: 'Descanso',
    OTHER: 'Otro',
  };
  return labels[type] || type;
};

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrador',
    ORGANIZER: 'Organizador',
    MODERATOR: 'Moderador',
    EVALUATOR: 'Evaluador',
    PARTICIPANT: 'Participante',
  };
  return labels[role] || role;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    ORGANIZER: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    MODERATOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    EVALUATOR: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    PARTICIPANT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  };
  return colors[role] || 'bg-gray-100 text-gray-800';
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Main App Component
export default function FabricaDeIdeasApp() {
  const { theme, setTheme } = useTheme();
  const [currentView, setCurrentView] = useState<'admin' | 'user'>('user');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showLogin, setShowLogin] = useState(true);
  
  // Términos y condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  
  // Recuperación de contraseña
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [sendingResetEmail, setSendingResetEmail] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Restablecer contraseña
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  // User profile states
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Data states
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>(mockDashboardStats);
  const [leaderboard, setLeaderboard] = useState<{ rank: number; name: string; points: number; level: number; avatar?: string }[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Agenda filter states
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('all');
  const [activityStatusFilter, setActivityStatusFilter] = useState<string>('all');
  const [activityDateFilter, setActivityDateFilter] = useState<string>('all');

  // User attendance and registration states (must be before getFilteredActivities)
  const [userAttendance, setUserAttendance] = useState<Record<string, { checkedIn: boolean; checkedOut: boolean; checkInTime?: Date; checkOutTime?: Date }>>({});
  const [userRegistrations, setUserRegistrations] = useState<Record<string, { registered: boolean; reminderMinutes?: number }>>({});

  // Filter activities function for agenda
  const getFilteredActivities = useCallback(() => {
    let filtered = [...activities];

    // Filter by type
    if (activityTypeFilter !== 'all') {
      filtered = filtered.filter(a => a.type === activityTypeFilter);
    }

    // Filter by status
    if (activityStatusFilter !== 'all') {
      if (activityStatusFilter === 'registered') {
        filtered = filtered.filter(a => userRegistrations[a.id]?.registered);
      } else if (activityStatusFilter === 'not_registered') {
        filtered = filtered.filter(a => !userRegistrations[a.id]?.registered);
      } else if (activityStatusFilter === 'completed') {
        filtered = filtered.filter(a => userAttendance[a.id]?.checkedIn && userAttendance[a.id]?.checkedOut);
      } else {
        filtered = filtered.filter(a => a.status === activityStatusFilter);
      }
    }

    // Filter by date
    if (activityDateFilter !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      if (activityDateFilter === 'today') {
        filtered = filtered.filter(a => {
          const activityDateStr = new Date(a.startTime).toISOString().split('T')[0];
          return activityDateStr === todayStr;
        });
      } else if (activityDateFilter === 'tomorrow') {
        filtered = filtered.filter(a => {
          const activityDateStr = new Date(a.startTime).toISOString().split('T')[0];
          return activityDateStr === tomorrowStr;
        });
      } else if (activityDateFilter === 'this_week') {
        const weekEnd = new Date(today);
        weekEnd.setDate(weekEnd.getDate() + 7);
        weekEnd.setHours(23, 59, 59, 999);
        filtered = filtered.filter(a => {
          const activityDate = new Date(a.startTime);
          return activityDate >= today && activityDate <= weekEnd;
        });
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.room?.name?.toLowerCase().includes(query) ||
        a.speaker?.name?.toLowerCase().includes(query)
      );
    }

    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return filtered;
  }, [activities, activityTypeFilter, activityStatusFilter, activityDateFilter, searchQuery, userRegistrations, userAttendance]);

  // Certificate states
  const [certificates, setCertificates] = useState<any[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [canGenerateCertificate, setCanGenerateCertificate] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);

  // Certificate template states
  const [certificateTemplates, setCertificateTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: 'Plantilla por Defecto',
    type: 'attendance',
    headerText: 'CERTIFICADO DE PARTICIPACIÓN',
    bodyText: 'Se certifica que',
    organizationName: 'Fábrica de Ideas',
    primaryColor: '#059669',
    secondaryColor: '#0d9488',
    borderColor: '#059669',
    borderWidth: '4',
    showQrCode: true,
    showCode: true,
    showDate: true,
    showActivities: true,
  });
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  // Achievement states
  const [earnedAchievements, setEarnedAchievements] = useState<any[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<any[]>([]);
  const [achievementStats, setAchievementStats] = useState({
    attendanceCount: 0,
    voteCount: 0,
    points: 0,
    level: 1,
  });

  // Event management states
  const [editEventDialogOpen, setEditEventDialogOpen] = useState(false);
  const [deleteEventDialogOpen, setDeleteEventDialogOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '18:00',
    location: '',
    address: '',
    website: '',
    isActive: true,
  });
  const [savingEvent, setSavingEvent] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);

  // Activity form states
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityForm, setActivityForm] = useState({
    title: '',
    description: '',
    type: 'PRESENTATION',
    roomId: '',
    startTime: '',
    endTime: '',
    date: '',
    maxCapacity: '',
    theme: '',
    speakerId: '',
    expositorName: '',
    generateQr: true,
  });
  const [savingActivity, setSavingActivity] = useState(false);

  // Activity management states
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);
  const [viewActivityDialogOpen, setViewActivityDialogOpen] = useState(false);
  const [deleteActivityDialogOpen, setDeleteActivityDialogOpen] = useState(false);
  const [qrActivityDialogOpen, setQrActivityDialogOpen] = useState(false);
  const [selectedActivityForEdit, setSelectedActivityForEdit] = useState<Activity | null>(null);
  const [activityQrCode, setActivityQrCode] = useState<string>('');
  const [deletingActivity, setDeletingActivity] = useState(false);

  // Load all data from APIs
  const loadAllData = async () => {
    setLoadingData(true);
    try {
      // Load events
      const eventsRes = await fetch('/api/events?limit=100');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          const loadedEvents = eventsData.data.events || eventsData.data || [];
          setEventsList(loadedEvents);
          setEvents(loadedEvents);
          if (loadedEvents.length > 0 && !selectedEvent) {
            setSelectedEvent(loadedEvents[0]);
          }
        }
      }

      // Load rooms
      const roomsRes = await fetch('/api/rooms?limit=100');
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        if (roomsData.success) {
          const loadedRooms = roomsData.data.rooms || roomsData.data || [];
          setRooms(loadedRooms);
          setRoomsList(loadedRooms);
        }
      }

      // Load activities
      const activitiesRes = await fetch('/api/activities?limit=100');
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        if (activitiesData.success) {
          // Transform activities to include currentAttendance from _count.attendances
          const loadedActivities = (activitiesData.data.activities || activitiesData.data || []).map((a: Activity) => ({
            ...a,
            currentAttendance: a.currentAttendance ?? a._count?.attendances ?? 0,
          }));
          setActivities(loadedActivities);
        }
      }

      // Load projects
      const projectsRes = await fetch('/api/projects?limit=100');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        if (projectsData.success) {
          setProjects(projectsData.data || []);
        }
      }

      // Load dashboard stats
      const dashboardRes = await fetch('/api/dashboard');
      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        if (dashboardData.success && dashboardData.data) {
          setDashboardStats({
            totalUsers: dashboardData.data.stats?.totalUsers || 0,
            totalEvents: dashboardData.data.stats?.totalEvents || 0,
            totalActivities: dashboardData.data.stats?.totalActivities || 0,
            totalProjects: dashboardData.data.stats?.totalProjects || 0,
            totalVotes: dashboardData.data.stats?.totalVotes || 0,
            totalAttendance: dashboardData.data.stats?.totalAttendance || 0,
            upcomingActivities: dashboardData.data.upcomingActivities?.length || 0,
          });
          if (dashboardData.data.leaderboard && dashboardData.data.leaderboard.length > 0) {
            setLeaderboard(dashboardData.data.leaderboard.map((u: any, i: number) => ({
              rank: i + 1,
              name: u.name,
              points: u.points,
              level: u.level,
              avatar: u.avatar,
            })));
          }
        }
      }

      // Load user-specific data
      await loadUserData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoadingData(false);
  };

  // Load user-specific data (certificates, achievements, registrations, attendance)
  const loadUserData = async () => {
    try {
      // Load attendance for certificate eligibility
      const attendanceRes = await fetch('/api/attendance');
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        if (attendanceData.success) {
          const attendances = attendanceData.data || [];
          // Count complete attendances (with check-in AND check-out)
          const completeAttendances = attendances.filter((a: any) => a.checkInTime && a.checkOutTime);
          setAttendanceCount(completeAttendances.length);
          setCanGenerateCertificate(completeAttendances.length >= 3);

          // Set user attendance status for each activity with check-in/check-out info
          const attendanceStatus: Record<string, { checkedIn: boolean; checkedOut: boolean; checkInTime?: Date; checkOutTime?: Date }> = {};
          attendances.forEach((a: { activityId: string; checkInTime?: Date; checkOutTime?: Date }) => {
            attendanceStatus[a.activityId] = {
              checkedIn: !!a.checkInTime,
              checkedOut: !!a.checkOutTime,
              checkInTime: a.checkInTime ? new Date(a.checkInTime) : undefined,
              checkOutTime: a.checkOutTime ? new Date(a.checkOutTime) : undefined,
            };
          });
          setUserAttendance(attendanceStatus);
        }
      }

      // Load certificates
      await loadCertificates();

      // Load certificate templates (for admin)
      if (user?.role === 'ADMIN' || user?.role === 'ORGANIZER') {
        await loadCertificateTemplates();
      }

      // Load achievements
      await loadAchievements();

      // Load user registrations
      const regRes = await fetch('/api/registrations');
      if (regRes.ok) {
        const regData = await regRes.json();
        if (regData.success && regData.data) {
          const registrations: Record<string, { registered: boolean; reminderMinutes?: number }> = {};
          regData.data.forEach((reg: { activityId: string; reminderMinutes?: number }) => {
            registrations[reg.activityId] = {
              registered: true,
              reminderMinutes: reg.reminderMinutes || undefined,
            };
          });
          setUserRegistrations(registrations);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.data);
            setIsLoggedIn(true);
            // Load data after successful login
            loadAllData();
          }
        }
      } catch {
        // Not logged in
      }
    };
    checkSession();
    // Load app configuration on mount
    loadAppConfig();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setIsLoggedIn(true);
        toast.success('¡Bienvenido de vuelta!');
        // Load all data after login
        loadAllData();
      } else {
        toast.error(data.error || 'Error al iniciar sesión');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar aceptación de términos
    if (!acceptedTerms) {
      toast.error('Debes aceptar los términos y condiciones para registrarte');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registerEmail, 
          password: registerPassword, 
          name: registerName,
          acceptedTerms: true
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        setIsLoggedIn(true);
        toast.success('¡Cuenta creada exitosamente!');
      } else {
        toast.error(data.error || 'Error al crear cuenta');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsLoggedIn(false);
    toast.success('Sesión cerrada');
  };

  // Función para solicitar recuperación de contraseña
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    setSendingResetEmail(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });
      const data = await res.json();
      
      if (data.success) {
        setResetEmailSent(true);
        toast.success(data.message || 'Si el correo está registrado, recibirás un email con instrucciones');
      } else {
        toast.error(data.error || 'Error al procesar la solicitud');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setSendingResetEmail(false);
  };

  // Función para restablecer contraseña
  const handleResetPassword = async () => {
    if (!newResetPassword || newResetPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setResettingPassword(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: resetToken, 
          password: newResetPassword,
          confirmPassword: confirmResetPassword
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || 'Contraseña actualizada exitosamente');
        setShowResetPasswordDialog(false);
        setResetToken('');
        setNewResetPassword('');
        setConfirmResetPassword('');
        setShowLogin(true);
      } else {
        toast.error(data.error || 'Error al restablecer la contraseña');
      }
    } catch {
      toast.error('Error de conexión');
    }
    setResettingPassword(false);
  };

  // Verificar si hay token de reset en URL al cargar
  useEffect(() => {
    const checkResetToken = () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        setResetToken(token);
        setShowResetPasswordDialog(true);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    checkResetToken();
  }, []);

  // Create activity function
  const handleCreateActivity = async () => {
    // Validate required fields
    if (!activityForm.title.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (!activityForm.startTime) {
      toast.error('La hora de inicio es requerida');
      return;
    }
    if (!activityForm.endTime) {
      toast.error('La hora de fin es requerida');
      return;
    }
    if (!activityForm.date) {
      toast.error('La fecha es requerida');
      return;
    }

    setSavingActivity(true);
    try {
      // Create datetime strings
      const startDateTime = `${activityForm.date}T${activityForm.startTime}:00`;
      const endDateTime = `${activityForm.date}T${activityForm.endTime}:00`;

      // Use first room if none selected
      const roomId = activityForm.roomId || rooms[0]?.id;
      
      if (!roomId) {
        toast.error('No hay salas disponibles. Crea una sala primero.');
        setSavingActivity(false);
        return;
      }

      // Get eventId from selected event or first event in list
      const eventId = selectedEvent?.id || eventsList[0]?.id;
      
      if (!eventId) {
        toast.error('No hay evento activo. Selecciona o crea un evento primero.');
        setSavingActivity(false);
        return;
      }

      // Save to API
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activityForm.title,
          description: activityForm.description,
          type: activityForm.type,
          roomId: roomId,
          startTime: startDateTime,
          endTime: endDateTime,
          maxCapacity: activityForm.maxCapacity ? parseInt(activityForm.maxCapacity) : null,
          theme: activityForm.theme,
          expositorName: activityForm.expositorName,
          status: 'SCHEDULED',
          eventId: eventId,
        }),
      });

      const data = await res.json();
      
      if (data.success && data.data) {
        // Add the new activity to the list from API response
        const newActivity: Activity = {
          ...data.data,
          currentAttendance: 0,
        };
        setActivities(prev => [...prev, newActivity]);
        
        // Reset form and close dialog
        setActivityForm({
          title: '',
          description: '',
          type: 'PRESENTATION',
          roomId: '',
          startTime: '',
          endTime: '',
          date: '',
          maxCapacity: '',
          theme: '',
          speakerId: '',
          expositorName: '',
          generateQr: true,
        });
        setActivityDialogOpen(false);
        
        toast.success('¡Actividad creada exitosamente!');
      } else {
        toast.error(data.error || 'Error al crear actividad');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Error al crear actividad. Intenta de nuevo.');
    }
    setSavingActivity(false);
  };

  // Reset activity form
  const resetActivityForm = () => {
    setActivityForm({
      title: '',
      description: '',
      type: 'PRESENTATION',
      roomId: '',
      startTime: '',
      endTime: '',
      date: '',
      maxCapacity: '',
      theme: '',
      speakerId: '',
      expositorName: '',
      generateQr: true,
    });
  };

  // ========== ACTIVITY MANAGEMENT FUNCTIONS ==========

  // Handle edit activity
  const handleEditActivity = (activity: Activity) => {
    setSelectedActivityForEdit(activity);
    const startDate = new Date(activity.startTime);
    const endDate = new Date(activity.endTime);
    setActivityForm({
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      roomId: activity.room?.id || '',
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      date: startDate.toISOString().split('T')[0],
      maxCapacity: '',
      theme: '',
      speakerId: '',
      expositorName: activity.expositorName || '',
      generateQr: true,
    });
    setEditActivityDialogOpen(true);
  };

  // Handle view activity details
  const handleViewActivity = (activity: Activity) => {
    setSelectedActivityForEdit(activity);
    setViewActivityDialogOpen(true);
  };

  // Handle generate QR for activity
  const handleGenerateActivityQR = (activity: Activity) => {
    setSelectedActivityForEdit(activity);
    // Generate QR code with structured format: ACTIVITY:id:title
    const qrData = `ACTIVITY:${activity.id}:${activity.title}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    setActivityQrCode(qrUrl);
    setQrActivityDialogOpen(true);
  };

  // Handle delete activity
  const handleDeleteActivityClick = (activity: Activity) => {
    setSelectedActivityForEdit(activity);
    setDeleteActivityDialogOpen(true);
  };

  // Confirm delete activity
  const handleConfirmDeleteActivity = async () => {
    if (!selectedActivityForEdit) return;

    setDeletingActivity(true);

    try {
      const res = await fetch(`/api/activities?id=${selectedActivityForEdit.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setActivities(prev => prev.filter(a => a.id !== selectedActivityForEdit.id));
        setDeleteActivityDialogOpen(false);
        toast.success('Actividad eliminada correctamente');
      } else {
        toast.error(data.error || 'Error al eliminar actividad');
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Error al eliminar la actividad');
    }

    setDeletingActivity(false);
    setSelectedActivityForEdit(null);
  };

  // Handle save edited activity
  const handleSaveEditedActivity = async () => {
    if (!selectedActivityForEdit) return;
    if (!activityForm.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    setSavingActivity(true);

    try {
      const startDateTime = activityForm.date && activityForm.startTime
        ? `${activityForm.date}T${activityForm.startTime}:00`
        : selectedActivityForEdit.startTime;
      const endDateTime = activityForm.date && activityForm.endTime
        ? `${activityForm.date}T${activityForm.endTime}:00`
        : selectedActivityForEdit.endTime;

      const res = await fetch('/api/activities', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedActivityForEdit.id,
          title: activityForm.title,
          description: activityForm.description,
          type: activityForm.type,
          roomId: activityForm.roomId || selectedActivityForEdit.room?.id,
          startTime: startDateTime,
          endTime: endDateTime,
          status: selectedActivityForEdit.status,
          expositorName: activityForm.expositorName,
          theme: activityForm.theme,
          maxCapacity: activityForm.maxCapacity ? parseInt(activityForm.maxCapacity) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActivities(prev => prev.map(a => a.id === selectedActivityForEdit.id ? data.data : a));
        setEditActivityDialogOpen(false);
        toast.success('Actividad actualizada correctamente');
      } else {
        toast.error(data.error || 'Error al actualizar actividad');
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Error al actualizar la actividad');
    }

    setSavingActivity(false);
    setSelectedActivityForEdit(null);
    resetActivityForm();
  };

  // Reminder and registration states
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [selectedActivityForAction, setSelectedActivityForAction] = useState<Activity | null>(null);
  const [reminderMinutes, setReminderMinutes] = useState('15');
  const [settingReminder, setSettingReminder] = useState(false);
  const [registeringAttendance, setRegisteringAttendance] = useState(false);
  const [userReminders, setUserReminders] = useState<Record<string, { minutes: number; set: boolean }>>({});
  const [registeringActivity, setRegisteringActivity] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // Handle set reminder
  const handleSetReminder = (activity: Activity) => {
    setSelectedActivityForAction(activity);
    setReminderDialogOpen(true);
  };

  // Confirm reminder
  const handleConfirmReminder = async () => {
    if (!selectedActivityForAction) return;
    
    setSettingReminder(true);
    
    // Simulate saving reminder
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const minutes = parseInt(reminderMinutes);
    setUserReminders(prev => ({
      ...prev,
      [selectedActivityForAction.id]: { minutes, set: true }
    }));
    
    setReminderDialogOpen(false);
    setSettingReminder(false);
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      // In a real app, we would schedule the notification
    }
    
    toast.success(`Recordatorio configurado: ${minutes} minutos antes de "${selectedActivityForAction.title}"`);
  };

  // Handle register for activity
  const handleRegisterForActivity = async (activity: Activity) => {
    if (!user) return;
    
    setRegisteringActivity(activity.id);
    
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activityId: activity.id }),
      });
      
      const data = await res.json();
      if (data.success) {
        setUserRegistrations(prev => ({
          ...prev,
          [activity.id]: { registered: true }
        }));
        
        // Update user points
        if (data.data?.totalPoints) {
          setUser(prev => prev ? { ...prev, points: data.data.totalPoints } : prev);
        }
        
        toast.success(data.message || `Te has registrado en "${activity.title}". ¡+5 puntos!`);
      } else {
        toast.error(data.error || 'Error al registrarse');
      }
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Error al registrarse');
    }
    
    setRegisteringActivity(null);
  };

  // Handle check-in for activity
  const handleCheckIn = async (activity: Activity) => {
    if (!user) return;
    
    setCheckingIn(activity.id);
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          action: 'check-in',
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Update attendance status
        setUserAttendance(prev => ({
          ...prev,
          [activity.id]: { 
            ...(prev[activity.id] || {}), 
            checkedIn: true, 
            checkedOut: false, 
            checkInTime: new Date() 
          }
        }));
        
        // Also mark as registered
        setUserRegistrations(prev => ({
          ...prev,
          [activity.id]: { registered: true }
        }));
        
        // Update user points
        if (data.data?.totalPoints) {
          setUser(prev => prev ? { ...prev, points: data.data.totalPoints } : prev);
        }
        
        // Update attendance count for certificate
        if (data.data?.completeAttendances !== undefined) {
          setAttendanceCount(data.data.completeAttendances);
          setCanGenerateCertificate(data.data.canGenerateCertificate);
        }
        
        toast.success(data.message || `Check-in registrado. ¡+10 puntos!`);
      } else {
        toast.error(data.error || 'Error al hacer check-in');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Error al hacer check-in');
    }
    
    setCheckingIn(null);
  };

  // Handle check-out for activity
  const handleCheckOut = async (activity: Activity) => {
    if (!user) return;
    
    setCheckingOut(activity.id);
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: activity.id,
          action: 'check-out',
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Update attendance status
        setUserAttendance(prev => ({
          ...prev,
          [activity.id]: { 
            ...(prev[activity.id] || {}), 
            checkedIn: true,
            checkedOut: true, 
            checkOutTime: new Date() 
          }
        }));
        
        // Update user points
        if (data.data?.totalPoints) {
          setUser(prev => prev ? { ...prev, points: data.data.totalPoints } : prev);
        }
        
        // Update attendance count for certificate
        if (data.data?.completeAttendances !== undefined) {
          setAttendanceCount(data.data.completeAttendances);
          setCanGenerateCertificate(data.data.canGenerateCertificate);
        }
        
        toast.success(data.message || `Check-out registrado. ¡+15 puntos! (incluye bono)`);
      } else {
        toast.error(data.error || 'Error al hacer check-out');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Error al hacer check-out');
    }
    
    setCheckingOut(null);
  };

  // Handle register attendance (opens dialog for manual registration)
  const handleRegisterAttendance = (activity: Activity) => {
    setSelectedActivityForAction(activity);
    setRegisterDialogOpen(true);
  };

  // Confirm attendance registration (legacy - now uses check-in)
  const handleConfirmAttendance = async () => {
    if (!selectedActivityForAction) return;
    
    setRegisteringAttendance(true);
    
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: selectedActivityForAction.id,
          action: 'check-in',
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setUserAttendance(prev => ({
          ...prev,
          [selectedActivityForAction.id]: { checkedIn: true, checkedOut: false }
        }));
        toast.success(`Check-in registrado a "${selectedActivityForAction.title}". ¡+10 puntos!`);
      } else {
        toast.error(data.error || 'Error al registrar');
      }
    } catch (error) {
      console.error('Error registering attendance:', error);
      toast.error('Error al registrar asistencia');
    }
    
    setRegisterDialogOpen(false);
    setRegisteringAttendance(false);
  };

  // Request notification permission
  const requestNotificationPermission = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!('Notification' in window)) {
        toast.error('Tu navegador no soporta notificaciones');
        return;
      }
      
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast.success('✅ Notificaciones activadas correctamente');
        // Show test notification
        new Notification('¡Notificaciones activadas!', {
          body: 'Recibirás recordatorios de tus actividades',
          icon: '/logo.svg',
        });
      } else if (permission === 'denied') {
        toast.error('❌ Permiso denegado. Activa las notificaciones en la configuración del navegador');
      } else {
        toast.warning('⚠️ No se pudo obtener el permiso para notificaciones');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Error al solicitar permiso de notificaciones');
    }
  };

  // User management states
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [viewUserDialogOpen, setViewUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    points: number;
    level: number;
    status: string;
  } | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'PARTICIPANT',
    status: 'active',
  });
  const [savingUser, setSavingUser] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users from API
  const loadUsers = async (search?: string) => {
    setLoadingUsers(true);
    try {
      const searchParam = search || userSearchQuery;
      const url = searchParam ? `/api/users?search=${encodeURIComponent(searchParam)}` : '/api/users';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsersList(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
    setLoadingUsers(false);
  };

  // Handle create new user
  const handleCreateUser = async () => {
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      toast.error('Todos los campos son requeridos');
      return;
    }

    setCreatingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserForm),
      });

      const data = await res.json();
      if (data.success) {
        setUsersList(prev => [...prev, data.data]);
        setNewUserDialogOpen(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'PARTICIPANT' });
        toast.success(`Usuario "${newUserForm.name}" creado exitosamente`);
      } else {
        toast.error(data.error || 'Error al crear usuario');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
    }
    setCreatingUser(false);
  };

  // Handle edit user - from usersList (admin view)
  const handleEditUserFromList = (userItem: User) => {
    const userData = {
      id: userItem.id,
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      points: userItem.points,
      level: userItem.level,
      status: 'active',
    };
    setSelectedUser(userData);
    setEditUserForm({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
    });
    setEditUserDialogOpen(true);
  };

  // Handle view user - from usersList (admin view)
  const handleViewUserFromList = (userItem: User) => {
    const userData = {
      id: userItem.id,
      name: userItem.name,
      email: userItem.email,
      role: userItem.role,
      points: userItem.points,
      level: userItem.level,
      status: 'active',
    };
    setSelectedUser(userData);
    setViewUserDialogOpen(true);
  };

  // Handle edit user - from leaderboard (legacy)
  const handleEditUser = (entry: { name: string; points: number; level: number }, index: number) => {
    // Try to find the user in usersList by name and points
    const foundUser = usersList.find(u => u.name === entry.name && u.points === entry.points);
    
    if (foundUser) {
      handleEditUserFromList(foundUser);
    } else {
      // Fallback to creating mock data if not found in usersList
      const userData = {
        id: `user-${index}`,
        name: entry.name,
        email: `${entry.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        role: 'PARTICIPANT' as const,
        points: entry.points,
        level: entry.level,
        status: 'active',
      };
      setSelectedUser(userData);
      setEditUserForm({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status,
      });
      setEditUserDialogOpen(true);
    }
  };

  // Handle view user
  const handleViewUser = (entry: { name: string; points: number; level: number }, index: number) => {
    // Try to find the user in usersList by name and points
    const foundUser = usersList.find(u => u.name === entry.name && u.points === entry.points);
    
    if (foundUser) {
      handleViewUserFromList(foundUser);
    } else {
      // Fallback to creating mock data if not found in usersList
      const userData = {
        id: `user-${index}`,
        name: entry.name,
        email: `${entry.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        role: 'PARTICIPANT' as const,
        points: entry.points,
        level: entry.level,
        status: 'active',
      };
      setSelectedUser(userData);
      setViewUserDialogOpen(true);
    }
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    setSavingUser(true);
    
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUserForm.name,
          role: editUserForm.role,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Update the usersList state
        setUsersList(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, name: editUserForm.name, role: editUserForm.role as User['role'] }
            : u
        ));
        
        setEditUserDialogOpen(false);
        toast.success(`Usuario "${editUserForm.name}" actualizado correctamente`);
      } else {
        toast.error(data.error || 'Error al actualizar usuario');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error al guardar los cambios');
    }
    
    setSavingUser(false);
  };

  // Map states
  const [mapZoom, setMapZoom] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomLocationDialogOpen, setRoomLocationDialogOpen] = useState(false);
  const [showMyLocation, setShowMyLocation] = useState(false);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Handle room click on map
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setRoomDialogOpen(true);
  };

  // Handle get directions to room
  const handleGetDirections = (room: Room) => {
    setRoomDialogOpen(false);
    setSelectedRoom(room);
    setRoomLocationDialogOpen(true);
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 0.2, 2));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  // Handle show my location
  const handleShowMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tu navegador no soporta geolocalización');
      return;
    }

    setShowMyLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success('Ubicación obtenida correctamente');
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('No se pudo obtener tu ubicación. Verifica los permisos.');
        setShowMyLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Open external maps for directions
  const openExternalMap = (room: Room) => {
    // Using the venue location as default (can be customized)
    const venueLat = room.latitude || -33.45;
    const venueLng = room.longitude || -70.67;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueLat},${venueLng}&destination_name=${encodeURIComponent(room.name)}`;
    window.open(mapsUrl, '_blank');
    toast.success('Abriendo Google Maps...');
  };

  // Room management states
  const [editRoomDialogOpen, setEditRoomDialogOpen] = useState(false);
  const [qrRoomDialogOpen, setQrRoomDialogOpen] = useState(false);
  const [deleteRoomDialogOpen, setDeleteRoomDialogOpen] = useState(false);
  const [mapRoomDialogOpen, setMapRoomDialogOpen] = useState(false);
  const [selectedRoomForEdit, setSelectedRoomForEdit] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    capacity: '',
    building: '',
    floor: '',
    color: '#3B82F6',
    latitude: '',
    longitude: '',
  });
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingRoom, setDeletingRoom] = useState(false);
  const [roomQrCode, setRoomQrCode] = useState<string>('');

  // Project management states
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [viewProjectDialogOpen, setViewProjectDialogOpen] = useState(false);
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);
  const [qrProjectDialogOpen, setQrProjectDialogOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState({
    name: '',
    team: '',
    description: '',
    image: '',
    leaderName: '',
    leaderEmail: '',
    leaderPhone: '',
    institution: '',
    course: '',
    tutorName: '',
    area: '',
    projectCategory: '',
    status: 'DRAFT',
  });
  const [savingProject, setSavingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);
  const [projectQrCode, setProjectQrCode] = useState<string>('');
  const projectImageInputRef = useRef<HTMLInputElement | null>(null);

  // Voting states
  const [userVotes, setUserVotes] = useState<Project[]>([]);
  const [votesRemaining, setVotesRemaining] = useState(3);
  const [votingProjectId, setVotingProjectId] = useState<string | null>(null);
  const [selectedProjectForVote, setSelectedProjectForVote] = useState<Project | null>(null);
  const [voteScore, setVoteScore] = useState(5);
  const [votingDialogOpen, setVotingDialogOpen] = useState(false);
  const [projectAreaFilter, setProjectAreaFilter] = useState<string>('all');

  // Voting configuration states
  const [votingConfig, setVotingConfig] = useState<{
    id: string | null;
    voteType: string;
    maxVotesPerUser: number;
    showResults: boolean;
    isActive: boolean;
  }>({
    id: null,
    voteType: 'LIKE',
    maxVotesPerUser: 3,
    showResults: false,
    isActive: true,
  });
  const [savingVotingConfig, setSavingVotingConfig] = useState(false);
  const [allVotes, setAllVotes] = useState<any[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Notification config states
  const [notificationConfig, setNotificationConfig] = useState({
    activityStartEnabled: true,
    activityReminderEnabled: true,
    activityReminderMinutes: 15,
    voteConfirmationEnabled: true,
    voteReminderEnabled: true,
    pointsEarnedEnabled: true,
    achievementEnabled: true,
    certificateReadyEnabled: true,
    announcementsEnabled: true,
  });
  const [savingNotificationConfig, setSavingNotificationConfig] = useState(false);

  // App configuration states (global settings)
  const [appConfig, setAppConfig] = useState({
    timezone: 'America/Guayaquil',
    footerText: '© 2024 Fábrica de Ideas - Plataforma de Gestión de Eventos',
  });
  const [savingAppConfig, setSavingAppConfig] = useState(false);

  // Timezone options
  const timezoneOptions = [
    { value: 'America/Guayaquil', label: 'Ecuador (GMT-5)' },
    { value: 'America/Bogota', label: 'Colombia (GMT-5)' },
    { value: 'America/Lima', label: 'Perú (GMT-5)' },
    { value: 'America/Mexico_City', label: 'México (GMT-6)' },
    { value: 'America/Santiago', label: 'Chile (GMT-4)' },
    { value: 'America/Buenos_Aires', label: 'Argentina (GMT-3)' },
    { value: 'America/Sao_Paulo', label: 'Brasil (GMT-3)' },
    { value: 'Europe/Madrid', label: 'España (GMT+1)' },
    { value: 'UTC', label: 'UTC' },
  ];

  // QR Scanner states
  const [scannerActive, setScannerActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [totalPointsToday, setTotalPointsToday] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Evaluation states (for EVALUATOR role)
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedProjectForEvaluation, setSelectedProjectForEvaluation] = useState<Project | null>(null);
  const [evaluationDialogOpen, setEvaluationDialogOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    innovation: 0,
    innovationComment: '',
    viability: 0,
    viabilityComment: '',
    impact: 0,
    impactComment: '',
    presentation: 0,
    presentationComment: '',
    scalability: 0,
    scalabilityComment: '',
    execution: 0,
    executionComment: '',
    generalComment: '',
  });
  const [savingEvaluation, setSavingEvaluation] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);
  const [evaluationFilter, setEvaluationFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Evaluator assignments states
  const [evaluatorAssignments, setEvaluatorAssignments] = useState<Array<{
    id: string;
    evaluatorId: string;
    projectId: string;
    completed: boolean;
    evaluator?: { id: string; name: string; email: string };
    project?: { id: string; name: string; description?: string; status: string };
  }>>([]);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [newAssignmentForm, setNewAssignmentForm] = useState({
    evaluatorId: '',
    projectId: '',
  });
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [evaluationSubTab, setEvaluationSubTab] = useState<'projects' | 'assignments'>('projects');

  // Evaluation criteria definitions with weights (total: 100 points)
  const evaluationCriteria = [
    { key: 'innovation', label: 'Innovación y Creatividad', description: 'Originalidad de la idea, enfoque innovador y creatividad en la solución propuesta', maxPoints: 20 },
    { key: 'viability', label: 'Viabilidad del Negocio', description: 'Factibilidad comercial, modelo de negocio claro y potencial de rentabilidad', maxPoints: 15 },
    { key: 'impact', label: 'Impacto Social/Ambiental', description: 'Contribución positiva a la sociedad o medio ambiente, beneficios para la comunidad', maxPoints: 15 },
    { key: 'presentation', label: 'Pitch - Presentación y Comunicación', description: 'Calidad del pitch, claridad en la exposición y capacidad de persuasión', maxPoints: 20 },
    { key: 'scalability', label: 'Potencial de Escalamiento', description: 'Capacidad de crecimiento, expansión a nuevos mercados y replicabilidad', maxPoints: 10 },
    { key: 'execution', label: 'Entregable (Poster, PMV, Producto o Servicio)', description: 'Calidad del entregable, grado de desarrollo y valor demostrado', maxPoints: 20 },
  ];

  // Handle edit room
  const handleEditRoom = (room: Room) => {
    setSelectedRoomForEdit(room);
    setRoomForm({
      name: room.name,
      capacity: room.capacity.toString(),
      building: room.building || '',
      floor: room.floor || '',
      color: room.color || '#3B82F6',
      latitude: room.latitude?.toString() || '',
      longitude: room.longitude?.toString() || '',
    });
    setEditRoomDialogOpen(true);
  };

  // Handle save room
  const handleSaveRoom = async () => {
    if (!roomForm.name.trim()) {
      toast.error('El nombre de la sala es requerido');
      return;
    }

    setSavingRoom(true);
    
    try {
      const roomData = {
        name: roomForm.name,
        capacity: parseInt(roomForm.capacity) || 50,
        building: roomForm.building,
        floor: roomForm.floor,
        color: roomForm.color,
        latitude: roomForm.latitude ? parseFloat(roomForm.latitude) : null,
        longitude: roomForm.longitude ? parseFloat(roomForm.longitude) : null,
      };

      if (selectedRoomForEdit) {
        // Update existing room via API
        const res = await fetch(`/api/rooms/${selectedRoomForEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(roomData),
        });
        
        const data = await res.json();
        
        if (data.success && data.data) {
          // Update local state with API response
          setRoomsList(prev => prev.map(r => 
            r.id === selectedRoomForEdit.id 
              ? data.data
              : r
          ));
          toast.success(`Sala "${roomForm.name}" actualizada correctamente`);
        } else {
          toast.error(data.error || 'Error al actualizar la sala');
        }
      } else {
        // Create new room via API
        const eventId = eventsList[0]?.id || '1';
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            ...roomData,
          }),
        });
        
        const data = await res.json();
        
        if (data.success && data.data) {
          setRoomsList(prev => [...prev, data.data]);
          toast.success(`Sala "${roomForm.name}" creada correctamente`);
        } else {
          toast.error(data.error || 'Error al crear la sala');
        }
      }
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Error al guardar la sala');
    }
    
    setEditRoomDialogOpen(false);
    setSavingRoom(false);
    setSelectedRoomForEdit(null);
    setRoomForm({ name: '', capacity: '', building: '', floor: '', color: '#3B82F6', latitude: '', longitude: '' });
  };

  // Handle generate QR for room
  const handleGenerateRoomQR = (room: Room) => {
    setSelectedRoomForEdit(room);
    // Generate a simple QR code URL (in production, use a real QR library)
    const qrData = `ROOM:${room.id}:${room.name}:${room.building || ''}:${room.floor || ''}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    setRoomQrCode(qrUrl);
    setQrRoomDialogOpen(true);
  };

  // Handle copy QR code to clipboard
  const handleCopyQR = async (qrUrl: string, name: string) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      
      toast.success(`Código QR de "${name}" copiado al portapapeles`);
    } catch (error) {
      console.error('Error copying QR:', error);
      // Fallback: copy the URL instead
      try {
        await navigator.clipboard.writeText(qrUrl);
        toast.success('URL del código QR copiada al portapapeles');
      } catch {
        toast.error('No se pudo copiar el código QR');
      }
    }
  };

  // Handle download QR code as PNG
  const handleDownloadQR = async (qrUrl: string, name: string) => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Código QR de "${name}" descargado`);
    } catch (error) {
      console.error('Error downloading QR:', error);
      toast.error('Error al descargar el código QR');
    }
  };

  // Handle show room on map
  const handleShowRoomMap = (room: Room) => {
    setSelectedRoomForEdit(room);
    setMapRoomDialogOpen(true);
  };

  // Handle delete room
  const handleDeleteRoom = async () => {
    if (!selectedRoomForEdit) return;
    
    setDeletingRoom(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setRoomsList(prev => prev.filter(r => r.id !== selectedRoomForEdit.id));
    setDeleteRoomDialogOpen(false);
    setDeletingRoom(false);
    setSelectedRoomForEdit(null);
    toast.success('Sala eliminada correctamente');
  };

  // Handle new room
  const handleNewRoom = () => {
    setSelectedRoomForEdit(null);
    setRoomForm({ name: '', capacity: '', building: '', floor: '', color: '#3B82F6' });
    setEditRoomDialogOpen(true);
  };

  // ========== PROJECT MANAGEMENT FUNCTIONS ==========

  // Area options
  const areaOptions = [
    { value: 'AGROTECNOLOGIA', label: 'Agrotecnología y soberanía alimentaria' },
    { value: 'BIOFUTURO', label: 'Biofuturo' },
    { value: 'ECONOMIA_CIRCULAR', label: 'Economía circular y sostenibilidad ambiental' },
    { value: 'SERVICIOS_DIGITALES', label: 'Servicios tecnológicos digitales' },
    { value: 'TURISMO_SOSTENIBLE', label: 'Turismo sostenible' },
    { value: 'CREADORES_CONTENIDO', label: 'Creadores de contenido' },
    { value: 'MODA_SOSTENIBLE', label: 'Moda sostenible' },
    { value: 'OTROS', label: 'Otros' },
  ];

  // Project category options
  const projectCategoryOptions = [
    { value: 'EMPRENDIMIENTO_ESCOLAR', label: 'Emprendimiento Escolar' },
    { value: 'IDEA_NEGOCIO', label: 'Idea de negocio' },
    { value: 'PMV_PLAN_NEGOCIOS', label: 'Producto Mínimo Viable (PMV) con Plan de Negocios' },
    { value: 'EMPRENDIMIENTOS_EJECUCION', label: 'Emprendimientos en ejecución' },
  ];

  // Handle new project
  const handleNewProject = () => {
    setSelectedProjectForEdit(null);
    setProjectForm({
      name: '',
      team: '',
      description: '',
      image: '',
      leaderName: '',
      leaderEmail: '',
      leaderPhone: '',
      institution: '',
      course: '',
      tutorName: '',
      area: '',
      projectCategory: '',
      status: 'DRAFT',
    });
    setEditProjectDialogOpen(true);
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    setProjectForm({
      name: project.name,
      team: project.team,
      description: project.description || '',
      image: project.image || '',
      leaderName: project.leaderName || '',
      leaderEmail: project.leaderEmail || '',
      leaderPhone: project.leaderPhone || '',
      institution: project.institution || '',
      course: project.course || '',
      tutorName: project.tutorName || '',
      area: project.area || '',
      projectCategory: project.projectCategory || '',
      status: project.status,
    });
    setEditProjectDialogOpen(true);
  };

  // Handle view project
  const handleViewProject = (project: Project) => {
    setSelectedProjectForEdit(project);
    setViewProjectDialogOpen(true);
  };

  // Handle generate QR for project
  const handleGenerateProjectQR = (project: Project) => {
    setSelectedProjectForEdit(project);
    const qrData = `PROJECT:${project.id}:${project.name}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    setProjectQrCode(qrUrl);
    setQrProjectDialogOpen(true);
  };

  // Handle delete project
  const handleDeleteProject = async () => {
    if (!selectedProjectForEdit) return;
    
    setDeletingProject(true);
    
    try {
      const res = await fetch(`/api/projects/${selectedProjectForEdit.id}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setProjects(prev => prev.filter(p => p.id !== selectedProjectForEdit.id));
        toast.success('Proyecto eliminado correctamente');
      } else {
        toast.error(data.error || 'Error al eliminar el proyecto');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto');
    }
    
    setDeleteProjectDialogOpen(false);
    setDeletingProject(false);
    setSelectedProjectForEdit(null);
  };

  // Handle save project
  const handleSaveProject = async () => {
    if (!projectForm.name.trim()) {
      toast.error('El nombre del proyecto es requerido');
      return;
    }

    setSavingProject(true);
    
    try {
      // Get the first event ID from the events list or use a default
      const eventId = eventsList[0]?.id;
      
      if (!eventId) {
        toast.error('No hay eventos disponibles. Crea un evento primero.');
        setSavingProject(false);
        return;
      }

      if (selectedProjectForEdit) {
        // Update existing project
        const res = await fetch(`/api/projects/${selectedProjectForEdit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectForm),
        });
        
        const data = await res.json();
        
        if (data.success && data.data) {
          setProjects(prev => prev.map(p => p.id === selectedProjectForEdit.id ? data.data : p));
          toast.success(`Proyecto "${projectForm.name}" actualizado correctamente`);
        } else {
          toast.error(data.error || 'Error al actualizar el proyecto');
        }
      } else {
        // Create new project
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            ...projectForm,
          }),
        });
        
        const data = await res.json();
        
        if (data.success && data.data) {
          setProjects(prev => [...prev, data.data]);
          toast.success(`Proyecto "${projectForm.name}" creado correctamente`);
        } else {
          toast.error(data.error || 'Error al crear el proyecto');
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('Error al guardar el proyecto');
    }
    
    setEditProjectDialogOpen(false);
    setSavingProject(false);
    setSelectedProjectForEdit(null);
    setProjectForm({
      name: '',
      team: '',
      description: '',
      image: '',
      leaderName: '',
      leaderEmail: '',
      leaderPhone: '',
      institution: '',
      course: '',
      tutorName: '',
      area: '',
      projectCategory: '',
      status: 'DRAFT',
    });
  };

  // Handle project image upload
  const handleProjectImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede exceder 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProjectForm(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // Open voting dialog or vote directly
  const handleOpenVoteDialog = (project: Project) => {
    if (!user) {
      toast.error('Debes iniciar sesión para votar');
      return;
    }

    if (!votingConfig.isActive) {
      toast.error('La votación está desactivada por el administrador');
      return;
    }

    if (votesRemaining <= 0) {
      toast.error(`Ya has alcanzado el límite de ${votingConfig.maxVotesPerUser} votos`);
      return;
    }

    // For LIKE type, vote directly
    if (votingConfig.voteType === 'LIKE') {
      handleVoteProject(project, 1);
    } else {
      // For STARS or POINTS, open dialog
      setSelectedProjectForVote(project);
      setVoteScore(votingConfig.voteType === 'STARS' ? 5 : 10);
      setVotingDialogOpen(true);
    }
  };

  // Handle vote for project with score
  const handleVoteProject = async (project: Project, score: number = 1) => {
    setVotingProjectId(project.id);
    setVotingDialogOpen(false);

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, score }),
      });

      const data = await res.json();

      if (data.success) {
        setUserVotes(prev => [...prev, project]);
        const remaining = data.meta?.votesRemaining ?? (votesRemaining - 1);
        setVotesRemaining(remaining);
        setProjects(prev => prev.map(p => 
          p.id === project.id ? { ...p, totalVotes: p.totalVotes + 1 } : p
        ));
        
        // Update user points after voting
        if (data.meta?.totalPoints !== undefined) {
          setUser(prev => prev ? { ...prev, points: data.meta.totalPoints } : prev);
        }
        
        // Custom message based on vote type
        const pointsEarned = data.meta?.pointsEarned || 0;
        if (votingConfig.voteType === 'LIKE') {
          toast.success(`¡Votaste por "${project.name}"! ${pointsEarned > 0 ? `+${pointsEarned} puntos. ` : ''}Votos restantes: ${remaining}`);
        } else if (votingConfig.voteType === 'STARS') {
          toast.success(`¡Calificaste "${project.name}" con ${score} estrellas! ${pointsEarned > 0 ? `+${pointsEarned} puntos. ` : ''}Votos restantes: ${remaining}`);
        } else {
          toast.success(`¡Asignaste ${score} puntos a "${project.name}"! ${pointsEarned > 0 ? `+${pointsEarned} puntos. ` : ''}Votos restantes: ${remaining}`);
        }
      } else {
        toast.error(data.error || 'Error al votar');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Error al votar');
    } finally {
      setVotingProjectId(null);
      setSelectedProjectForVote(null);
    }
  };

  // Load user votes on mount - depends on votingConfig being loaded first
  useEffect(() => {
    const loadUserVotes = async () => {
      if (!user || user.role !== 'PARTICIPANT') return;

      try {
        const eventId = eventsList[0]?.id;
        if (!eventId) return;

        const res = await fetch(`/api/votes?userId=${user.id}&eventId=${eventId}`);
        const data = await res.json();

        if (data.success && data.meta) {
          setUserVotes(data.data.map((v: any) => v.project));
          // Calculate votes remaining based on the max votes from API response
          const maxVotes = data.meta.maxVotesPerUser || votingConfig.maxVotesPerUser || 3;
          setVotesRemaining(maxVotes - data.meta.userVoteCount);
        }
      } catch (error) {
        console.error('Error loading user votes:', error);
      }
    };

    // Load votes only after voting config is loaded
    if (votingConfig.maxVotesPerUser > 0) {
      loadUserVotes();
    }
  }, [user, eventsList, votingConfig.maxVotesPerUser]);

  // ========== VOTING CONFIGURATION FUNCTIONS ==========

  // Load voting configuration
  const loadVotingConfig = async () => {
    try {
      const eventId = eventsList[0]?.id;
      if (!eventId) return;

      const res = await fetch(`/api/voting-configs/active?eventId=${eventId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setVotingConfig({
          id: data.data.id,
          voteType: data.data.voteType || 'LIKE',
          maxVotesPerUser: data.data.maxVotesPerUser || 3,
          showResults: data.data.showResults || false,
          isActive: data.data.isActive ?? true,
        });
        // Don't set votesRemaining here - it's calculated in loadUserVotes
      }
    } catch (error) {
      console.error('Error loading voting config:', error);
    }
  };

  // Load all votes for admin view
  const loadAllVotes = async () => {
    if (!user || user.role === 'PARTICIPANT') return;
    
    setLoadingVotes(true);
    try {
      const eventId = eventsList[0]?.id;
      if (!eventId) return;

      const res = await fetch(`/api/votes?eventId=${eventId}&limit=100`);
      const data = await res.json();

      if (data.success) {
        setAllVotes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading all votes:', error);
    } finally {
      setLoadingVotes(false);
    }
  };

  // Save voting configuration
  const handleSaveVotingConfig = async () => {
    setSavingVotingConfig(true);
    try {
      const eventId = eventsList[0]?.id;
      if (!eventId) {
        toast.error('No hay evento activo');
        return;
      }

      const res = await fetch('/api/voting-configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          name: 'Configuración de Votación',
          voteType: votingConfig.voteType,
          maxVotesPerUser: votingConfig.maxVotesPerUser,
          isActive: votingConfig.isActive,
          showResults: votingConfig.showResults,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVotingConfig(prev => ({ ...prev, id: data.data.id }));
        toast.success('Configuración de votación guardada');
      } else {
        toast.error(data.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving voting config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSavingVotingConfig(false);
    }
  };

  // Load voting config on mount
  useEffect(() => {
    if (eventsList.length > 0) {
      loadVotingConfig();
    }
  }, [eventsList]);

  // Load all votes for admin when user changes or voting tab is active
  useEffect(() => {
    if (user && user.role !== 'PARTICIPANT' && eventsList.length > 0 && activeTab === 'voting') {
      loadAllVotes();
    }
  }, [user, eventsList, activeTab]);

  // Load users when users tab is active
  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'ORGANIZER') && activeTab === 'users') {
      loadUsers();
    }
  }, [user, activeTab]);

  // ========== NOTIFICATION FUNCTIONS ==========

  // Load notifications for current user
  const loadNotifications = async () => {
    if (!user) return;
    
    setLoadingNotifications(true);
    try {
      const res = await fetch('/api/notifications?limit=50');
      const data = await res.json();

      if (data.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.meta?.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Load notification config for admin
  const loadNotificationConfig = async () => {
    if (!user || user.role === 'PARTICIPANT') return;
    
    try {
      const eventId = eventsList[0]?.id;
      if (!eventId) return;

      const res = await fetch(`/api/notification-config?eventId=${eventId}`);
      const data = await res.json();

      if (data.success && data.data) {
        setNotificationConfig({
          activityStartEnabled: data.data.activityStartEnabled ?? true,
          activityReminderEnabled: data.data.activityReminderEnabled ?? true,
          activityReminderMinutes: data.data.activityReminderMinutes ?? 15,
          voteConfirmationEnabled: data.data.voteConfirmationEnabled ?? true,
          voteReminderEnabled: data.data.voteReminderEnabled ?? true,
          pointsEarnedEnabled: data.data.pointsEarnedEnabled ?? true,
          achievementEnabled: data.data.achievementEnabled ?? true,
          certificateReadyEnabled: data.data.certificateReadyEnabled ?? true,
          announcementsEnabled: data.data.announcementsEnabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error loading notification config:', error);
    }
  };

  // Save notification config
  const handleSaveNotificationConfig = async () => {
    setSavingNotificationConfig(true);
    try {
      const eventId = eventsList[0]?.id;
      if (!eventId) {
        toast.error('No hay evento activo');
        return;
      }

      const res = await fetch('/api/notification-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          ...notificationConfig,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Configuración de notificaciones guardada');
      } else {
        toast.error(data.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving notification config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSavingNotificationConfig(false);
    }
  };

  // Load app configuration
  const loadAppConfig = async () => {
    try {
      const res = await fetch('/api/app-config');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setAppConfig({
            timezone: data.data.timezone || 'America/Guayaquil',
            footerText: data.data.footerText || '© 2024 Fábrica de Ideas - Plataforma de Gestión de Eventos',
          });
        }
      }
    } catch (error) {
      console.error('Error loading app config:', error);
    }
  };

  // Save app configuration
  const handleSaveAppConfig = async () => {
    setSavingAppConfig(true);
    try {
      const res = await fetch('/api/app-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: {
            timezone: appConfig.timezone,
            footerText: appConfig.footerText,
          },
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Configuración guardada correctamente');
      } else {
        toast.error(data.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving app config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSavingAppConfig(false);
    }
  };

  // Calculate dynamic activity status based on current time
  const getActivityDynamicStatus = useCallback((activity: Activity): 'EN_CURSO' | 'FINALIZADO' | 'PROXIMO' => {
    const now = new Date();
    const startTime = new Date(activity.startTime);
    const endTime = new Date(activity.endTime);

    if (now >= startTime && now <= endTime) {
      return 'EN_CURSO';
    } else if (now > endTime) {
      return 'FINALIZADO';
    } else {
      return 'PROXIMO';
    }
  }, []);

  // Get dynamic status label and color
  const getDynamicStatusInfo = (status: 'EN_CURSO' | 'FINALIZADO' | 'PROXIMO') => {
    switch (status) {
      case 'EN_CURSO':
        return { label: 'En Curso', color: 'bg-green-500 text-white' };
      case 'FINALIZADO':
        return { label: 'Finalizado', color: 'bg-gray-500 text-white' };
      case 'PROXIMO':
        return { label: 'Próximo', color: 'bg-blue-500 text-white' };
    }
  };

  // Format time with timezone
  const formatTimeWithTimezone = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: appConfig.timezone,
      });
    } catch {
      return formatTime(dateStr);
    }
  };

  // Format date with timezone
  const formatDateWithTimezone = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        timeZone: appConfig.timezone,
      });
    } catch {
      return formatDate(dateStr);
    }
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notificationId }),
      });

      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ========== EVALUATION FUNCTIONS ==========

  // Load user's evaluations
  const loadUserEvaluations = async () => {
    if (!user || (user.role !== 'EVALUATOR' && user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) return;
    
    setLoadingEvaluations(true);
    try {
      const res = await fetch(`/api/evaluations?userId=${user.id}`);
      const data = await res.json();

      if (data.success) {
        setEvaluations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading evaluations:', error);
    } finally {
      setLoadingEvaluations(false);
    }
  };

  // Open evaluation dialog for a project
  const handleOpenEvaluationDialog = async (project: Project) => {
    setSelectedProjectForEvaluation(project);
    
    // Check if there's an existing evaluation for this project
    const existingEvaluation = evaluations.find(e => e.projectId === project.id);
    
    if (existingEvaluation) {
      setEvaluationForm({
        innovation: existingEvaluation.innovation,
        innovationComment: existingEvaluation.innovationComment || '',
        viability: existingEvaluation.viability,
        viabilityComment: existingEvaluation.viabilityComment || '',
        impact: existingEvaluation.impact,
        impactComment: existingEvaluation.impactComment || '',
        presentation: existingEvaluation.presentation,
        presentationComment: existingEvaluation.presentationComment || '',
        scalability: existingEvaluation.scalability,
        scalabilityComment: existingEvaluation.scalabilityComment || '',
        execution: existingEvaluation.execution,
        executionComment: existingEvaluation.executionComment || '',
        generalComment: existingEvaluation.generalComment || '',
      });
    } else {
      // Reset form for new evaluation
      setEvaluationForm({
        innovation: 0,
        innovationComment: '',
        viability: 0,
        viabilityComment: '',
        impact: 0,
        impactComment: '',
        presentation: 0,
        presentationComment: '',
        scalability: 0,
        scalabilityComment: '',
        execution: 0,
        executionComment: '',
        generalComment: '',
      });
    }
    
    setEvaluationDialogOpen(true);
  };

  // Handle save evaluation (as draft)
  const handleSaveEvaluation = async (submit: boolean = false) => {
    if (!selectedProjectForEvaluation || !user) return;

    // Validate that at least one criterion is scored
    const hasScores = evaluationForm.innovation > 0 || 
                      evaluationForm.viability > 0 || 
                      evaluationForm.impact > 0 ||
                      evaluationForm.presentation > 0 ||
                      evaluationForm.scalability > 0 ||
                      evaluationForm.execution > 0;

    if (!hasScores && submit) {
      toast.error('Debes calificar al menos un criterio antes de enviar');
      return;
    }

    // Calculate total score (sum of all criteria, max 100 points)
    const totalScore = (evaluationForm.innovation || 0) +
                       (evaluationForm.viability || 0) +
                       (evaluationForm.impact || 0) +
                       (evaluationForm.presentation || 0) +
                       (evaluationForm.scalability || 0) +
                       (evaluationForm.execution || 0);

    setSavingEvaluation(true);
    try {
      const res = await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectForEvaluation.id,
          ...evaluationForm,
          totalScore, // Include calculated total score (0-100)
          status: submit ? 'SUBMITTED' : 'DRAFT'
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local evaluations state
        setEvaluations(prev => {
          const existing = prev.find(e => e.projectId === selectedProjectForEvaluation.id);
          if (existing) {
            return prev.map(e => e.projectId === selectedProjectForEvaluation.id ? data.data : e);
          }
          return [...prev, data.data];
        });

        toast.success(submit 
          ? '¡Evaluación enviada correctamente!' 
          : 'Borrador guardado'
        );
        setEvaluationDialogOpen(false);
      } else {
        toast.error(data.error || 'Error al guardar la evaluación');
      }
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast.error('Error al guardar la evaluación');
    } finally {
      setSavingEvaluation(false);
    }
  };

  // Calculate evaluation progress (percentage of max 100 points)
  const getEvaluationProgress = (evaluation: Evaluation) => {
    const totalScore = (evaluation.innovation || 0) +
                       (evaluation.viability || 0) +
                       (evaluation.impact || 0) +
                       (evaluation.presentation || 0) +
                       (evaluation.scalability || 0) +
                       (evaluation.execution || 0);
    return Math.round((totalScore / 100) * 100);
  };

  // Get projects filtered by evaluation status
  const getFilteredProjectsForEvaluation = () => {
    if (!user || (user.role !== 'EVALUATOR' && user.role !== 'ADMIN' && user.role !== 'ORGANIZER')) return [];

    const evaluatedProjectIds = evaluations
      .filter(e => e.status === 'SUBMITTED')
      .map(e => e.projectId);

    if (evaluationFilter === 'pending') {
      return projects.filter(p => !evaluatedProjectIds.includes(p.id) && p.status === 'APPROVED');
    } else if (evaluationFilter === 'completed') {
      return projects.filter(p => evaluatedProjectIds.includes(p.id));
    }
    
    // Show all approved projects
    return projects.filter(p => p.status === 'APPROVED');
  };

  // Load evaluator assignments
  const loadEvaluatorAssignments = async () => {
    try {
      const res = await fetch('/api/evaluator-assignments');
      const data = await res.json();
      if (data.success) {
        setEvaluatorAssignments(data.data || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  // Create new assignment
  const handleCreateAssignment = async () => {
    if (!newAssignmentForm.evaluatorId || !newAssignmentForm.projectId) {
      toast.error('Selecciona un evaluador y un proyecto');
      return;
    }

    setSavingAssignment(true);
    try {
      const res = await fetch('/api/evaluator-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evaluatorId: newAssignmentForm.evaluatorId,
          projectId: newAssignmentForm.projectId,
          eventId: selectedEvent?.id || eventsList[0]?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEvaluatorAssignments(prev => [...prev, data.data]);
        setAssignmentDialogOpen(false);
        setNewAssignmentForm({ evaluatorId: '', projectId: '' });
        toast.success('Asignación creada correctamente');
      } else {
        toast.error(data.error || 'Error al crear asignación');
      }
    } catch (error) {
      toast.error('Error al crear asignación');
    }
    setSavingAssignment(false);
  };

  // Delete assignment
  const handleDeleteAssignment = async (id: string) => {
    try {
      const res = await fetch(`/api/evaluator-assignments?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setEvaluatorAssignments(prev => prev.filter(a => a.id !== id));
        toast.success('Asignación eliminada correctamente');
      } else {
        toast.error(data.error || 'Error al eliminar asignación');
      }
    } catch (error) {
      toast.error('Error al eliminar asignación');
    }
  };

  // Get filtered projects for assignment search
  const getFilteredProjectsForAssignment = () => {
    if (!assignmentSearchQuery.trim()) {
      return projects.filter(p => p.status === 'APPROVED');
    }
    const query = assignmentSearchQuery.toLowerCase();
    return projects.filter(p => 
      p.status === 'APPROVED' && 
      (p.name.toLowerCase().includes(query) || 
       p.team?.toLowerCase().includes(query) ||
       p.category?.toLowerCase().includes(query))
    );
  };

  // Load evaluations when user is evaluator, admin, or organizer
  useEffect(() => {
    if (user && (user.role === 'EVALUATOR' || user.role === 'ADMIN' || user.role === 'ORGANIZER')) {
      loadUserEvaluations();
    }
  }, [user]);

  // Load evaluator assignments when user is evaluator or admin
  useEffect(() => {
    if (user && (user.role === 'EVALUATOR' || user.role === 'ADMIN' || user.role === 'ORGANIZER')) {
      loadEvaluatorAssignments();
    }
  }, [user]);

  // Load notifications on mount
  useEffect(() => {
    if (user && isLoggedIn) {
      loadNotifications();
    }
  }, [user, isLoggedIn]);

  // Load notification config for admin
  useEffect(() => {
    if (user && user.role !== 'PARTICIPANT' && eventsList.length > 0) {
      loadNotificationConfig();
    }
  }, [user, eventsList]);

  // ========== QR SCANNER FUNCTIONS ==========

  // Scanner reference
  const qrScannerRef = useRef<any>(null);

  // Handle activate camera for QR scanning
  const handleActivateScanner = async () => {
    setScannerActive(true);
    setScanResult(null);

    // Initialize scanner after state updates and DOM is ready
    setTimeout(async () => {
      try {
        // Verify the element exists
        const qrReaderElement = document.getElementById('qr-reader');
        if (!qrReaderElement) {
          throw new Error('El elemento del escáner no está disponible. Intenta de nuevo.');
        }

        const { Html5Qrcode } = await import('html5-qrcode');

        // Create scanner with verbose disabled to avoid encoding errors
        const html5QrCode = new Html5Qrcode('qr-reader', {
          verbose: false,
          useBarCodeDetectorIfSupported: true
        });
        qrScannerRef.current = html5QrCode;

        // Check if camera is available
        const devices = await Html5Qrcode.getCameras();
        if (!devices || devices.length === 0) {
          throw new Error('No se detectó ninguna cámara en este dispositivo');
        }

        // Sort cameras to prefer back camera on mobile
        const sortedDevices = devices.sort((a, b) => {
          const aLabel = (a.label || '').toLowerCase();
          const bLabel = (b.label || '').toLowerCase();
          // Prefer cameras labeled as 'back', 'rear', 'environment'
          const aIsBack = aLabel.includes('back') || aLabel.includes('rear') || aLabel.includes('environment');
          const bIsBack = bLabel.includes('back') || bLabel.includes('rear') || bLabel.includes('environment');
          if (aIsBack && !bIsBack) return -1;
          if (!aIsBack && bIsBack) return 1;
          return 0;
        });

        // Use the first sorted camera (usually back camera on mobile)
        const cameraId = sortedDevices[0].id;

        // Configuration optimized for better compatibility and avoid encoding issues
        const config = {
          fps: 5, // Lower FPS for better compatibility
          qrbox: { width: 250, height: 250 }, // Fixed size to avoid sizing issues
          aspectRatio: 1.0,
          disableFlip: true, // Disable flip to avoid encoding issues
        };

        // Success callback for QR detection
        const onScanSuccess = async (decodedText: string) => {
          try {
            await html5QrCode.stop();
            html5QrCode.clear();
          } catch (e) {
            console.log('Scanner stopped');
          }
          setScannerActive(false);
          qrScannerRef.current = null;
          await handleScanQR(decodedText);
        };

        // Error callback - ignore most errors during scanning
        const onScanError = (error: any) => {
          // Only log serious errors, ignore "no QR found" errors
          const errorMsg = error?.message || '';
          if (!errorMsg.includes('No QR code') && !errorMsg.includes('No MultiFormat')) {
            console.log('Scan warning:', errorMsg);
          }
        };

        // Try to start with environment camera first, fallback to specific camera ID
        let started = false;
        try {
          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            onScanSuccess,
            onScanError
          );
          started = true;
        } catch (envError: any) {
          console.log('Environment camera failed, trying specific camera:', envError?.message);
          // Fallback to specific camera ID
          if (!started && cameraId) {
            await html5QrCode.start(
              cameraId,
              config,
              onScanSuccess,
              onScanError
            );
          }
        }

        toast.success('Cámara activada. Apunta al código QR.');
      } catch (err: any) {
        console.error('Error starting scanner:', err);

        // Provide specific error messages
        let errorMessage = 'No se pudo iniciar la cámara';
        const errorName = err?.name || '';
        const errorMsg = err?.message || '';

        if (errorName === 'NotAllowedError' || errorMsg.includes('Permission') || errorMsg.includes('denied')) {
          errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara en la configuración del navegador.';
        } else if (errorName === 'NotFoundError' || errorMsg.includes('No camera') || errorMsg.includes('No video')) {
          errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (errorName === 'NotReadableError' || errorMsg.includes('Already used')) {
          errorMessage = 'La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que usen la cámara.';
        } else if (errorMsg.includes('elemento')) {
          errorMessage = errorMsg;
        } else if (errorMsg.includes('dispositivo')) {
          errorMessage = errorMsg;
        } else if (errorMsg.includes('encoding') || errorMsg.includes('encode') || errorMsg.includes('Unsupported MIME')) {
          errorMessage = 'Error de codificación de video. Intenta usar otro navegador como Chrome o Firefox.';
        } else if (errorMsg.includes('abort') || errorMsg.includes('Abort')) {
          errorMessage = 'El inicio de la cámara fue interrumpido. Intenta de nuevo.';
        } else if (errorMsg.includes('NotAllowed') || errorMsg.includes('getCameraPermissions')) {
          errorMessage = 'No se pudieron obtener los permisos de cámara. Verifica la configuración del navegador.';
        }

        toast.error(errorMessage);
        setScannerActive(false);
        qrScannerRef.current = null;
      }
    }, 300);
  };

  // Handle deactivate scanner
  const handleDeactivateScanner = async () => {
    try {
      if (qrScannerRef.current) {
        const scanner = qrScannerRef.current;
        try {
          const state = scanner.getState();
          if (state === 2) { // SCANNING
            await scanner.stop();
          }
          scanner.clear();
        } catch (e) {
          // Scanner might already be stopped
        }
        qrScannerRef.current = null;
      }
    } catch (err) {
      console.log('Scanner cleanup error:', err);
    }
    setScannerActive(false);
    setScanResult(null);
  };

  // Handle scan QR code via API
  const handleScanQR = async (code: string) => {
    if (!user || scanning) return;
    
    setScanning(true);
    
    try {
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setScanResult(data.data);

        // Add to recent scans
        const newScan = {
          type: data.data.type,
          name: data.data.activity?.title ||
                 data.data.project?.title ||
                 data.data.room?.name ||
                 data.data.user?.name || 'QR Escaneado',
          time: 'Hace un momento',
          points: data.data.pointsEarned || 0,
          success: true,
        };
        setRecentScans(prev => [newScan, ...prev].slice(0, 10));

        // Update total points today
        if (data.data.pointsEarned) {
          setTotalPointsToday(prev => prev + data.data.pointsEarned);
        }

        // Update user points
        if (data.data.totalPoints) {
          setUser(prev => prev ? { ...prev, points: data.data.totalPoints } : prev);
        }

        // Update attendance count and certificate eligibility
        if (data.data.completeAttendances !== undefined) {
          setAttendanceCount(data.data.completeAttendances);
          setCanGenerateCertificate(data.data.canGenerateCertificate || data.data.completeAttendances >= 3);
        }

        // Update user attendance status for activities
        if (data.data.type === 'ACTIVITY' && data.data.activity) {
          setUserAttendance(prev => ({
            ...prev,
            [data.data.activity.id]: {
              ...(prev[data.data.activity.id] || {}),
              checkedIn: !data.data.attendanceComplete,
              checkedOut: data.data.attendanceComplete || false,
            }
          }));

          // Reload user data to get updated attendance count
          loadUserData();
        }

        toast.success(data.data.message || 'QR escaneado correctamente');
      } else {
        toast.error(data.data?.message || data.error || 'Error al escanear QR');
        setScanResult({ error: true, message: data.data?.message || data.error });
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      toast.error('Error al escanear QR');
    }
    
    setScanning(false);
  };

  // Handle file upload for QR scanning
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

      // Create a temporary visible element for scanning
      const tempElement = document.createElement('div');
      tempElement.id = 'qr-reader-temp';
      tempElement.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 300px; height: 300px;';
      document.body.appendChild(tempElement);

      try {
        // Create scanner with verbose disabled to avoid encoding errors
        const html5QrCode = new Html5Qrcode('qr-reader-temp', { verbose: false });

        // Scan the file with tryHarder option for better detection
        const decodedText = await html5QrCode.scanFile(file, true);

        // Clean up
        try {
          await html5QrCode.clear();
        } catch (e) {
          // Ignore cleanup errors
        }

        document.body.removeChild(tempElement);
        await handleScanQR(decodedText);
      } catch (decodeError: any) {
        // Clean up on error
        try {
          document.body.removeChild(tempElement);
        } catch (e) {
          // Element might already be removed
        }

        console.error('Error decoding QR from image:', decodeError);

        // Provide more specific error message
        const errorMessage = decodeError?.message || '';
        if (errorMessage.includes('No QR code found') || errorMessage.includes('no MultiFormat Readers')) {
          toast.error('No se detectó un código QR en la imagen. Asegúrate de que la imagen sea clara y el QR sea visible.');
        } else if (errorMessage.includes('encoding') || errorMessage.includes('Unsupported')) {
          toast.error('Error al procesar la imagen. Intenta con una imagen en formato JPG o PNG.');
        } else if (errorMessage.includes('decode')) {
          toast.error('No se pudo decodificar el QR. Intenta con una imagen más clara o mejor iluminada.');
        } else {
          toast.error('No se pudo leer el código QR. Intenta con otra imagen o activa la cámara.');
        }
      }
    } catch (error: any) {
      console.error('Error uploading QR image:', error);
      const msg = error?.message || '';
      if (msg.includes('not a function') || msg.includes('import')) {
        toast.error('Error al cargar el escáner. Recarga la página e intenta de nuevo.');
      } else {
        toast.error('Error al procesar la imagen. Verifica que sea una imagen válida.');
      }
    }

    setScanning(false);

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle manual code entry
  const handleManualCodeEntry = async (code: string) => {
    if (!code.trim()) {
      toast.error('Ingresa un código QR');
      return;
    }
    await handleScanQR(code.trim().toUpperCase());
  };

  // ========== EVENT MANAGEMENT FUNCTIONS ==========

  // Handle new event
  const handleNewEvent = () => {
    setSelectedEventForEdit(null);
    setEventForm({
      name: '',
      description: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '18:00',
      location: '',
      address: '',
      website: '',
      isActive: true,
    });
    setEditEventDialogOpen(true);
  };

  // Handle edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEventForEdit(event);
    const startDateTime = new Date(event.startDate);
    const endDateTime = new Date(event.endDate);
    setEventForm({
      name: event.name,
      description: event.description || '',
      startDate: startDateTime.toISOString().split('T')[0],
      startTime: startDateTime.toTimeString().slice(0, 5),
      endDate: endDateTime.toISOString().split('T')[0],
      endTime: endDateTime.toTimeString().slice(0, 5),
      location: event.location || '',
      address: event.address || '',
      website: '',
      isActive: event.isActive,
    });
    setEditEventDialogOpen(true);
  };

  // Handle save event
  const handleSaveEvent = async () => {
    if (!eventForm.name.trim()) {
      toast.error('El nombre del evento es requerido');
      return;
    }
    if (!eventForm.startDate || !eventForm.endDate) {
      toast.error('Las fechas de inicio y fin son requeridas');
      return;
    }

    setSavingEvent(true);

    try {
      const startDateTime = `${eventForm.startDate}T${eventForm.startTime}:00`;
      const endDateTime = `${eventForm.endDate}T${eventForm.endTime}:00`;

      if (selectedEventForEdit) {
        // Update existing event
        const res = await fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedEventForEdit.id,
            name: eventForm.name,
            description: eventForm.description,
            startDate: startDateTime,
            endDate: endDateTime,
            location: eventForm.location,
            address: eventForm.address,
            website: eventForm.website,
            isActive: eventForm.isActive,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setEventsList(prev => prev.map(e => e.id === selectedEventForEdit.id ? data.data : e));
          toast.success(`Evento "${eventForm.name}" actualizado correctamente`);
        } else {
          toast.error(data.error || 'Error al actualizar evento');
        }
      } else {
        // Create new event
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: eventForm.name,
            description: eventForm.description,
            startDate: startDateTime,
            endDate: endDateTime,
            location: eventForm.location,
            address: eventForm.address,
            website: eventForm.website,
            isActive: eventForm.isActive,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setEventsList(prev => [...prev, data.data]);
          toast.success(`Evento "${eventForm.name}" creado correctamente`);
        } else {
          toast.error(data.error || 'Error al crear evento');
        }
      }

      setEditEventDialogOpen(false);
      setSelectedEventForEdit(null);
      setEventForm({
        name: '',
        description: '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '18:00',
        location: '',
        address: '',
        website: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Error al guardar el evento');
    }

    setSavingEvent(false);
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!selectedEventForEdit) return;

    setDeletingEvent(true);

    try {
      const res = await fetch(`/api/events?id=${selectedEventForEdit.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setEventsList(prev => prev.filter(e => e.id !== selectedEventForEdit.id));
        setDeleteEventDialogOpen(false);
        toast.success('Evento eliminado correctamente');
      } else {
        toast.error(data.error || 'Error al eliminar evento');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Error al eliminar el evento');
    }

    setDeletingEvent(false);
    setSelectedEventForEdit(null);
  };

  // ========== CERTIFICATE FUNCTIONS ==========

  // Load certificates
  const loadCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCertificates(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  // Generate certificate
  const handleGenerateCertificate = async () => {
    setGeneratingCertificate(true);
    try {
      // Get first active event for certificate
      const activeEvent = eventsList.find(e => e.isActive) || eventsList[0];

      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'attendance',
          eventId: activeEvent?.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('¡Certificado generado exitosamente!');
        loadCertificates();
      } else {
        toast.error(data.error || 'Error al generar certificado');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Error de conexión');
    }
    setGeneratingCertificate(false);
  };

  // ========== CERTIFICATE TEMPLATE FUNCTIONS ==========

  // Load certificate templates
  const loadCertificateTemplates = async () => {
    try {
      const res = await fetch('/api/certificate-templates');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const templates = data.data || [];
          setCertificateTemplates(templates);
          // Select the first template or create a default one
          if (templates.length > 0) {
            const defaultTemplate = templates.find((t: any) => t.type === 'attendance') || templates[0];
            setSelectedTemplate(defaultTemplate);
            setTemplateForm({
              name: defaultTemplate.name || 'Plantilla por Defecto',
              type: defaultTemplate.type || 'attendance',
              headerText: defaultTemplate.headerText || 'CERTIFICADO DE PARTICIPACIÓN',
              bodyText: defaultTemplate.bodyText || 'Se certifica que',
              organizationName: defaultTemplate.organizationName || 'Fábrica de Ideas',
              primaryColor: defaultTemplate.primaryColor || '#059669',
              secondaryColor: defaultTemplate.secondaryColor || '#0d9488',
              borderColor: defaultTemplate.borderColor || '#059669',
              borderWidth: String(defaultTemplate.borderWidth || 4),
              showQrCode: defaultTemplate.showQrCode !== false,
              showCode: defaultTemplate.showCode !== false,
              showDate: defaultTemplate.showDate !== false,
              showActivities: defaultTemplate.showActivities !== false,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading certificate templates:', error);
    }
  };

  // Create new template
  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      name: 'Nueva Plantilla',
      type: 'attendance',
      headerText: 'CERTIFICADO DE PARTICIPACIÓN',
      bodyText: 'Se certifica que',
      organizationName: 'Fábrica de Ideas',
      primaryColor: '#059669',
      secondaryColor: '#0d9488',
      borderColor: '#059669',
      borderWidth: '4',
      showQrCode: true,
      showCode: true,
      showDate: true,
      showActivities: true,
    });
    toast.success('Plantilla nueva creada. Configura los campos y guárdala.');
  };

  // Save template
  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toast.error('El nombre de la plantilla es requerido');
      return;
    }

    setSavingTemplate(true);
    try {
      const payload = {
        ...(selectedTemplate?.id ? { id: selectedTemplate.id } : {}),
        name: templateForm.name,
        type: templateForm.type,
        headerText: templateForm.headerText,
        bodyText: templateForm.bodyText,
        organizationName: templateForm.organizationName,
        primaryColor: templateForm.primaryColor,
        secondaryColor: templateForm.secondaryColor,
        borderColor: templateForm.borderColor,
        borderWidth: parseInt(templateForm.borderWidth) || 4,
        showQrCode: templateForm.showQrCode,
        showCode: templateForm.showCode,
        showDate: templateForm.showDate,
        showActivities: templateForm.showActivities,
      };

      const method = selectedTemplate?.id ? 'PUT' : 'POST';
      const res = await fetch('/api/certificate-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(selectedTemplate?.id 
          ? 'Plantilla actualizada correctamente' 
          : 'Plantilla creada correctamente'
        );
        loadCertificateTemplates();
      } else {
        toast.error(data.error || 'Error al guardar plantilla');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar la plantilla');
    }
    setSavingTemplate(false);
  };

  // Preview certificate
  const handlePreviewTemplate = () => {
    setPreviewDialogOpen(true);
  };

  // ========== ACHIEVEMENT FUNCTIONS ==========

  // Load achievements
  const loadAchievements = async () => {
    try {
      const res = await fetch('/api/achievements');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEarnedAchievements(data.data.earned || []);
          setAvailableAchievements(data.data.available || []);
          setAchievementStats(data.data.stats || { attendanceCount: 0, voteCount: 0, points: 0, level: 1 });
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  // Auth Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Header */}
        <header className="w-full py-4 px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Fábrica de Ideas
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold">
                    {showLogin ? 'Bienvenido' : 'Crear Cuenta'}
                  </CardTitle>
                  <CardDescription>
                    {showLogin 
                      ? 'Inicia sesión para participar en el evento' 
                      : 'Únete a la comunidad de innovadores'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <Tabs value={showLogin ? 'login' : 'register'} onValueChange={(v) => setShowLogin(v === 'login')}>
                    <TabsContent value="login" className="mt-0">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@email.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="password">Contraseña</Label>
                            <Button 
                              type="button" 
                              variant="link" 
                              className="p-0 h-auto text-xs text-emerald-600 hover:text-emerald-700"
                              onClick={() => {
                                setForgotPasswordEmail(loginEmail);
                                setShowForgotPasswordDialog(true);
                                setResetEmailSent(false);
                              }}
                            >
                              ¿Olvidaste tu contraseña?
                            </Button>
                          </div>
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" disabled={loading}>
                          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="register" className="mt-0">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reg-name">Nombre completo</Label>
                          <Input
                            id="reg-name"
                            type="text"
                            placeholder="Tu nombre"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-email">Email</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reg-password">Contraseña</Label>
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                        
                        {/* Checkbox de términos y condiciones */}
                        <div className="flex items-start gap-2 py-2">
                          <Checkbox
                            id="terms"
                            checked={acceptedTerms}
                            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                          />
                          <Label htmlFor="terms" className="text-sm font-normal leading-tight">
                            Acepto los{' '}
                            <Button 
                              type="button"
                              variant="link" 
                              className="p-0 h-auto text-emerald-600 hover:text-emerald-700"
                              onClick={() => setShowTermsDialog(true)}
                            >
                              términos y condiciones
                            </Button>
                            {' '}y la política de protección de datos personales.
                          </Label>
                        </div>
                        
                        <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" disabled={loading}>
                          {loading ? 'Creando...' : 'Crear Cuenta'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6">
                    <Separator />
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      {showLogin ? (
                        <p>
                          ¿No tienes cuenta?{' '}
                          <Button variant="link" className="p-0 h-auto" onClick={() => setShowLogin(false)}>
                            Regístrate aquí
                          </Button>
                        </p>
                      ) : (
                        <p>
                          ¿Ya tienes cuenta?{' '}
                          <Button variant="link" className="p-0 h-auto" onClick={() => setShowLogin(true)}>
                            Inicia sesión
                          </Button>
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>

        {/* Diálogo de Términos y Condiciones */}
        <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Términos y Condiciones</DialogTitle>
              <DialogDescription>
                Política de Protección de Datos Personales - Ley Orgánica de Protección de Datos Personales del Ecuador
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 text-sm">
                <h3 className="text-lg font-semibold text-emerald-700">TÉRMINOS Y CONDICIONES DE USO</h3>
                <p><strong>Fecha de vigencia:</strong> {new Date().toLocaleDateString('es-EC')}</p>
                
                <h4 className="font-semibold mt-4">1. ACEPTACIÓN DE LOS TÉRMINOS</h4>
                <p>Al registrarse y utilizar la plataforma "Fábrica de Ideas", usted acepta estar sujeto a estos términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no deberá utilizar la plataforma.</p>
                
                <h4 className="font-semibold mt-4">2. PROTECCIÓN DE DATOS PERSONALES</h4>
                <p>En cumplimiento de la <strong>Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> del Ecuador, publicada en el Registro Oficial Suplemento 341 del 26 de mayo de 2021, le informamos:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Responsable del tratamiento:</strong> Fábrica de Ideas actúa como responsable del tratamiento de sus datos personales.</li>
                  <li><strong>Finalidad:</strong> Sus datos personales serán utilizados para: gestión de participación en eventos, registro de asistencia, emisión de certificados, sistema de votaciones, comunicaciones relacionadas con el evento, y generación de estadísticas.</li>
                  <li><strong>Base legal:</strong> El tratamiento de sus datos se fundamenta en el consentimiento expreso que usted otorga al aceptar estos términos.</li>
                  <li><strong>Transferencia internacional:</strong> Sus datos no serán transferidos a terceros países sin su consentimiento adicional.</li>
                </ul>
                
                <h4 className="font-semibold mt-4">3. DATOS PERSONALES RECOPILADOS</h4>
                <p>Recopilamos los siguientes datos personales:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Nombre completo</li>
                  <li>Correo electrónico</li>
                  <li>Número de teléfono (opcional)</li>
                  <li>País de origen (opcional)</li>
                  <li>Fotografía (opcional)</li>
                  <li>Registro de actividades y asistencia</li>
                </ul>
                
                <h4 className="font-semibold mt-4">4. DERECHOS DEL TITULAR</h4>
                <p>Conforme a la LOPDP, usted tiene derecho a:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Acceso:</strong> Conocer qué datos personales tenemos sobre usted.</li>
                  <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos personales.</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en un formato estructurado.</li>
                  <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en ciertas circunstancias.</li>
                  <li><strong>Revocación del consentimiento:</strong> Retirar su consentimiento en cualquier momento.</li>
                </ul>
                
                <h4 className="font-semibold mt-4">5. SEGURIDAD DE LA INFORMACIÓN</h4>
                <p>Implementamos medidas técnicas y organizativas apropiadas para proteger sus datos personales contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Encriptación de contraseñas mediante algoritmos hash seguros</li>
                  <li>Comunicaciones cifradas (HTTPS)</li>
                  <li>Control de acceso basado en roles</li>
                  <li>Respaldo periódico de información</li>
                </ul>
                
                <h4 className="font-semibold mt-4">6. CONSERVACIÓN DE DATOS</h4>
                <p>Sus datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades para las que fueron recopilados, y de acuerdo con lo establecido en la normativa ecuatoriana aplicable.</p>
                
                <h4 className="font-semibold mt-4">7. MENORES DE EDAD</h4>
                <p>La plataforma no está dirigida a menores de 14 años. Si tiene entre 14 y 18 años, deberá contar con el consentimiento de sus padres o representantes legales para utilizar la plataforma.</p>
                
                <h4 className="font-semibold mt-4">8. CONTACTO PARA EJERCER SUS DERECHOS</h4>
                <p>Para ejercer sus derechos ARCO o realizar consultas sobre el tratamiento de sus datos personales, puede contactarnos a través de:</p>
                <p className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                  <strong>Email:</strong> protecciondedatos@fabricadeideas.com<br/>
                  <strong>Plazo de respuesta:</strong> 10 días hábiles según la LOPDP
                </p>
                
                <h4 className="font-semibold mt-4">9. MODIFICACIONES</h4>
                <p>Nos reservamos el derecho de modificar estos términos y condiciones. Las modificaciones serán notificadas a través de la plataforma y entrarán en vigor a partir de su publicación.</p>
                
                <h4 className="font-semibold mt-4">10. AUTORIDAD DE CONTROL</h4>
                <p>Si considera que sus derechos han sido vulnerados, tiene derecho a presentar una reclamación ante la <strong>Defensoría del Pueblo del Ecuador</strong>, como autoridad de control en materia de protección de datos personales.</p>
                
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-800">Al aceptar estos términos:</p>
                  <ul className="list-disc pl-5 mt-2 text-sm text-emerald-700">
                    <li>Consiente el tratamiento de sus datos personales según lo descrito.</li>
                    <li>Acepta los términos y condiciones de uso de la plataforma.</li>
                    <li>Declara haber leído y comprendido esta política.</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTermsDialog(false)}>
                Cerrar
              </Button>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsDialog(false);
                }}
              >
                Acepto los términos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Recuperación de Contraseña */}
        <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-600" />
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription>
                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {resetEmailSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">¡Email Enviado!</h3>
                  <p className="text-sm text-muted-foreground">
                    Si el correo está registrado, recibirás un email con instrucciones para restablecer tu contraseña.
                    Revisa tu bandeja de entrada y la carpeta de spam.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Correo electrónico</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                    onClick={handleForgotPassword}
                    disabled={sendingResetEmail}
                  >
                    {sendingResetEmail ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar instrucciones'
                    )}
                  </Button>
                </>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForgotPasswordDialog(false);
                  setResetEmailSent(false);
                }}
              >
                {resetEmailSent ? 'Cerrar' : 'Cancelar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Restablecer Contraseña */}
        <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                Restablecer Contraseña
              </DialogTitle>
              <DialogDescription>
                Crea una nueva contraseña para tu cuenta.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={confirmResetPassword}
                  onChange={(e) => setConfirmResetPassword(e.target.value)}
                />
              </div>
              {newResetPassword && confirmResetPassword && newResetPassword !== confirmResetPassword && (
                <p className="text-sm text-red-500">Las contraseñas no coinciden</p>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowResetPasswordDialog(false);
                  setResetToken('');
                  setNewResetPassword('');
                  setConfirmResetPassword('');
                }}
              >
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                onClick={handleResetPassword}
                disabled={resettingPassword || !newResetPassword || !confirmResetPassword}
              >
                {resettingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar nueva contraseña'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-muted-foreground mt-auto">
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-white" />
            </div>
            <span>{appConfig.footerText}</span>
          </div>
        </footer>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Fábrica de Ideas
            </span>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className={cn("gap-2", currentView === 'user' && "bg-white dark:bg-gray-700 shadow-sm")}
                onClick={() => setCurrentView('user')}
              >
                <User className="w-4 h-4" />
                Participante
              </Button>
              {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER' || user?.role === 'MODERATOR') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("gap-2", currentView === 'admin' && "bg-white dark:bg-gray-700 shadow-sm")}
                  onClick={() => setCurrentView('admin')}
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              )}
            </div>
            
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {/* Notifications */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <SheetTitle>Notificaciones</SheetTitle>
                      <SheetDescription>
                        {unreadCount > 0 
                          ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                          : 'No tienes notificaciones nuevas'
                        }
                      </SheetDescription>
                    </div>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                        Marcar todas leídas
                      </Button>
                    )}
                  </div>
                </SheetHeader>
                <ScrollArea className="mt-4 h-[calc(100vh-200px)]">
                  {loadingNotifications ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-3" />
                      <p className="text-muted-foreground">No hay notificaciones</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors",
                            notification.isRead 
                              ? "bg-gray-50 dark:bg-gray-800" 
                              : "bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500"
                          )}
                          onClick={() => !notification.isRead && handleMarkNotificationRead(notification.id)}
                        >
                          <div className="flex items-start gap-2">
                            <div className={cn(
                              "mt-0.5",
                              notification.type === 'ACHIEVEMENT' && "text-yellow-500",
                              notification.type === 'VOTE_CONFIRMATION' && "text-purple-500",
                              notification.type === 'POINTS_EARNED' && "text-emerald-500",
                              notification.type === 'ACTIVITY_START' && "text-blue-500",
                              notification.type === 'ACTIVITY_REMINDER' && "text-orange-500",
                              notification.type === 'ANNOUNCEMENT' && "text-red-500",
                              notification.type === 'CERTIFICATE_READY' && "text-teal-500",
                            )}>
                              {notification.type === 'ACHIEVEMENT' && <Trophy className="w-4 h-4" />}
                              {notification.type === 'VOTE_CONFIRMATION' && <Vote className="w-4 h-4" />}
                              {notification.type === 'POINTS_EARNED' && <Zap className="w-4 h-4" />}
                              {notification.type === 'ACTIVITY_START' && <Play className="w-4 h-4" />}
                              {notification.type === 'ACTIVITY_REMINDER' && <Clock className="w-4 h-4" />}
                              {notification.type === 'ANNOUNCEMENT' && <Bell className="w-4 h-4" />}
                              {notification.type === 'CERTIFICATE_READY' && <Award className="w-4 h-4" />}
                              {!['ACHIEVEMENT', 'VOTE_CONFIRMATION', 'POINTS_EARNED', 'ACTIVITY_START', 'ACTIVITY_REMINDER', 'ANNOUNCEMENT', 'CERTIFICATE_READY'].includes(notification.type) && <Bell className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                              <p className="text-xs text-muted-foreground mt-2">
                                {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.points} pts • Nivel {user?.level}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowChangePassword(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Trophy className="w-4 h-4 mr-2" />
                  Mis Logros
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Certificados
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={cn(
          "fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white dark:bg-gray-900 transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <ScrollArea className="h-full py-4">
            <nav className="px-3 space-y-1">
              {currentView === 'admin' ? (
                // Admin Navigation
                <>
                  <Button
                    variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Button>
                  <Button
                    variant={activeTab === 'events' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('events')}
                  >
                    <Calendar className="w-5 h-5" />
                    Eventos
                  </Button>
                  <Button
                    variant={activeTab === 'rooms' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('rooms')}
                  >
                    <Building className="w-5 h-5" />
                    Salas
                  </Button>
                  <Button
                    variant={activeTab === 'activities' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('activities')}
                  >
                    <Presentation className="w-5 h-5" />
                    Actividades
                  </Button>
                  <Button
                    variant={activeTab === 'projects' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('projects')}
                  >
                    <Lightbulb className="w-5 h-5" />
                    Proyectos
                  </Button>
                  <Button
                    variant={activeTab === 'users' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="w-5 h-5" />
                    Usuarios
                  </Button>
                  <Button
                    variant={activeTab === 'qr' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('qr')}
                  >
                    <QrCode className="w-5 h-5" />
                    Códigos QR
                  </Button>
                  <Button
                    variant={activeTab === 'voting' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('voting')}
                  >
                    <Vote className="w-5 h-5" />
                    Votación
                  </Button>
                  <Button
                    variant={activeTab === 'evaluation' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('evaluation')}
                  >
                    <Star className="w-5 h-5" />
                    Evaluación
                  </Button>
                  <Button
                    variant={activeTab === 'reports' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('reports')}
                  >
                    <BarChart3 className="w-5 h-5" />
                    Reportes
                  </Button>
                  <Button
                    variant={activeTab === 'certificates' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('certificates')}
                  >
                    <FileText className="w-5 h-5" />
                    Certificados
                  </Button>
                  <Separator className="my-3" />
                  <Button
                    variant={activeTab === 'settings' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="w-5 h-5" />
                    Configuración
                  </Button>
                </>
              ) : (
                // User Navigation
                <>
                  <Button
                    variant={activeTab === 'agenda' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('agenda')}
                  >
                    <Calendar className="w-5 h-5" />
                    Agenda
                  </Button>
                  <Button
                    variant={activeTab === 'map' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('map')}
                  >
                    <MapPin className="w-5 h-5" />
                    Mapa
                  </Button>
                  <Button
                    variant={activeTab === 'projects-view' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('projects-view')}
                  >
                    <Lightbulb className="w-5 h-5" />
                    Proyectos
                  </Button>
                  <Button
                    variant={activeTab === 'scanner' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('scanner')}
                  >
                    <QrCode className="w-5 h-5" />
                    Escanear QR
                  </Button>
                  <Button
                    variant={activeTab === 'ranking' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('ranking')}
                  >
                    <Trophy className="w-5 h-5" />
                    Ranking
                  </Button>
                  <Button
                    variant={activeTab === 'achievements' ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3"
                    onClick={() => setActiveTab('achievements')}
                  >
                    <Award className="w-5 h-5" />
                    Logros
                  </Button>
                  {/* Evaluation tab - only for EVALUATOR role */}
                  {user?.role === 'EVALUATOR' && (
                    <>
                      <Separator className="my-3" />
                      <Button
                        variant={activeTab === 'evaluation' ? 'secondary' : 'ghost'}
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab('evaluation')}
                      >
                        <Star className="w-5 h-5" />
                        Evaluación
                      </Button>
                    </>
                  )}
                </>
              )}
            </nav>
          </ScrollArea>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <AnimatePresence mode="wait">
            {currentView === 'admin' ? (
              // ADMIN VIEWS
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-muted-foreground">Resumen general del evento</p>
                      </div>
                      <div className="flex gap-2">
                        <Select defaultValue={selectedEvent?.id} onValueChange={(v) => setSelectedEvent(events.find(e => e.id === v) || null)}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Seleccionar evento" />
                          </SelectTrigger>
                          <SelectContent>
                            {events.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: 'Total Usuarios', value: dashboardStats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        { label: 'Actividades', value: dashboardStats.totalActivities, icon: Calendar, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { label: 'Proyectos', value: dashboardStats.totalProjects, icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                        { label: 'Total Votos', value: dashboardStats.totalVotes, icon: Vote, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                      ].map((stat, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card>
                            <CardContent className="pt-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                                  <p className="text-3xl font-bold">{stat.value.toLocaleString()}</p>
                                </div>
                                <div className={cn("p-3 rounded-xl", stat.bg)}>
                                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Actividades por Asistencia
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {activities.slice(0, 5).map((a, i) => (
                              <div key={a.id} className="flex items-center gap-3">
                                <div className={cn("w-3 h-3 rounded-full", getActivityTypeColor(a.type))} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{a.title}</p>
                                </div>
                                <div className="w-24">
                                  <Progress value={(a.currentAttendance / 500) * 100} className="h-2" />
                                </div>
                                <span className="text-sm text-muted-foreground w-12 text-right">{a.currentAttendance}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            Ranking de Proyectos
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {projects.slice(0, 5).map((p, i) => (
                              <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white",
                                  i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-gray-300 dark:bg-gray-600"
                                )}>
                                  {p.rank}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{p.name}</p>
                                  <p className="text-xs text-muted-foreground">{p.team}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 text-sm font-medium">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    {p.averageScore?.toFixed(1)}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{p.totalVotes} votos</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Leaderboard */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Medal className="w-5 h-5" />
                          Tabla de Líderes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2">
                          {mockLeaderboard.map((entry, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                                i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-gray-300 dark:bg-gray-600"
                              )}>
                                {entry.rank}
                              </div>
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={entry.avatar} />
                                <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{entry.name}</p>
                                <p className="text-xs text-muted-foreground">Nivel {entry.level}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-500">{entry.points.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">puntos</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top 3 Winners by Category */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          Top 3 Proyectos por Categoría
                        </CardTitle>
                        <CardDescription>Los proyectos mejor evaluados en cada categoría</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          // Get unique categories from projects
                          const categories = [...new Set(projects.filter(p => p.category).map(p => p.category))];
                          
                          if (categories.length === 0) {
                            return (
                              <div className="text-center py-8 text-muted-foreground">
                                <Lightbulb className="w-12 h-12 mx-auto opacity-50 mb-2" />
                                <p>No hay categorías disponibles</p>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="space-y-6">
                              {categories.map((category) => {
                                // Get top 3 projects for this category, sorted by average evaluation
                                const topProjects = projects
                                  .filter(p => p.category === category && p.status === 'APPROVED')
                                  .sort((a, b) => (b.averageEvaluation || b.averageScore || 0) - (a.averageEvaluation || a.averageScore || 0))
                                  .slice(0, 3);
                                
                                if (topProjects.length === 0) return null;
                                
                                return (
                                  <div key={category} className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary" className="text-sm">{category}</Badge>
                                      <span className="text-xs text-muted-foreground">({topProjects.length} proyectos)</span>
                                    </div>
                                    <div className="grid gap-2">
                                      {topProjects.map((project, index) => (
                                        <div 
                                          key={project.id} 
                                          className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-all",
                                            index === 0 && "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
                                            index === 1 && "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                                            index === 2 && "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                                          )}
                                        >
                                          <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm",
                                            index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-orange-600"
                                          )}>
                                            {index + 1}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{project.name}</p>
                                            <p className="text-xs text-muted-foreground">Equipo: {project.team}</p>
                                          </div>
                                          <div className="text-right">
                                            <div className="flex items-center gap-1 text-sm font-bold text-amber-600">
                                              <Star className="w-4 h-4 fill-amber-500" />
                                              {project.averageEvaluation?.toFixed(1) || project.averageScore?.toFixed(1) || '0.0'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{project.totalVotes} votos</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Events Management */}
                {activeTab === 'events' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Eventos</h1>
                        <p className="text-muted-foreground">Administra todos los eventos</p>
                      </div>
                      <Button
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        onClick={handleNewEvent}
                      >
                        <Plus className="w-4 h-4" />
                        Nuevo Evento
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {eventsList.length === 0 ? (
                        <Card>
                          <CardContent className="pt-6 text-center text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay eventos registrados</p>
                            <p className="text-sm">Crea un nuevo evento para comenzar</p>
                          </CardContent>
                        </Card>
                      ) : (
                        eventsList.map((event) => (
                          <Card key={event.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-xl font-bold">{event.name}</h3>
                                    <Badge variant={event.isActive ? 'default' : 'secondary'} className={event.isActive ? 'bg-emerald-500' : ''}>
                                      {event.isActive ? 'Activo' : 'Inactivo'}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground">{event.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                    </span>
                                    {event.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {event.location}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <Badge variant="outline">{event._count?.rooms || 0} salas</Badge>
                                    <Badge variant="outline">{event._count?.activities || 0} actividades</Badge>
                                    <Badge variant="outline">{event._count?.projects || 0} proyectos</Badge>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleEditEvent(event)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-red-500 hover:bg-red-50"
                                    onClick={() => {
                                      setSelectedEventForEdit(event);
                                      setDeleteEventDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>

                    {/* Edit/Create Event Dialog */}
                    <Dialog open={editEventDialogOpen} onOpenChange={setEditEventDialogOpen}>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {selectedEventForEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}
                          </DialogTitle>
                          <DialogDescription>Completa la información del evento</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label>Nombre del evento *</Label>
                            <Input
                              placeholder="Ej: Fábrica de Ideas 2025"
                              value={eventForm.name}
                              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Textarea
                              placeholder="Describe el evento..."
                              value={eventForm.description}
                              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha inicio *</Label>
                              <Input
                                type="date"
                                value={eventForm.startDate}
                                onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Hora inicio</Label>
                              <Input
                                type="time"
                                value={eventForm.startTime}
                                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Fecha fin *</Label>
                              <Input
                                type="date"
                                value={eventForm.endDate}
                                onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Hora fin</Label>
                              <Input
                                type="time"
                                value={eventForm.endTime}
                                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Ubicación</Label>
                            <Input
                              placeholder="Centro de Convenciones"
                              value={eventForm.location}
                              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dirección</Label>
                            <Input
                              placeholder="Av. Principal 123"
                              value={eventForm.address}
                              onChange={(e) => setEventForm({ ...eventForm, address: e.target.value })}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={eventForm.isActive}
                              onCheckedChange={(checked) => setEventForm({ ...eventForm, isActive: checked })}
                            />
                            <Label>Evento activo</Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditEventDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleSaveEvent}
                            disabled={savingEvent}
                          >
                            {savingEvent ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            {selectedEventForEdit ? 'Guardar Cambios' : 'Crear Evento'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Event Confirmation Dialog */}
                    <Dialog open={deleteEventDialogOpen} onOpenChange={setDeleteEventDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-500">
                            <Trash2 className="w-5 h-5" />
                            Eliminar Evento
                          </DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas eliminar el evento "{selectedEventForEdit?.name}"?
                            Esta acción no se puede deshacer y eliminará todas las salas, actividades y proyectos asociados.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteEventDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleDeleteEvent}
                            disabled={deletingEvent}
                          >
                            {deletingEvent ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Eliminar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Rooms Management */}
                {activeTab === 'rooms' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Salas</h1>
                        <p className="text-muted-foreground">Administra las salas del evento</p>
                      </div>
                      <Button 
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                        onClick={handleNewRoom}
                      >
                        <Plus className="w-4 h-4" />
                        Nueva Sala
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {roomsList.map((room) => (
                        <Card key={room.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: room.color || '#3B82F6' }}>
                                  <Building className="w-5 h-5 text-white" />
                                </div>
                                <CardTitle className="text-lg">{room.name}</CardTitle>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateRoomQR(room)}>
                                    <QrCode className="w-4 h-4 mr-2" /> Generar QR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedRoomForEdit(room);
                                      setDeleteRoomDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>Capacidad: {room.capacity} personas</span>
                              </div>
                              {room.building && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Building className="w-4 h-4" />
                                  <span>{room.building} - {room.floor}</span>
                                </div>
                              )}
                              {room.latitude && room.longitude && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Navigation className="w-4 h-4 text-emerald-500" />
                                  <span className="text-xs">
                                    {room.latitude.toFixed(4)}, {room.longitude.toFixed(4)}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleGenerateRoomQR(room)}
                              >
                                <QrCode className="w-4 h-4 mr-1" />
                                QR
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleShowRoomMap(room)}
                              >
                                <MapPin className="w-4 h-4 mr-1" />
                                Mapa
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Edit Room Dialog */}
                    <Dialog open={editRoomDialogOpen} onOpenChange={setEditRoomDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Building className="w-5 h-5" />
                            {selectedRoomForEdit ? 'Editar Sala' : 'Nueva Sala'}
                          </DialogTitle>
                          <DialogDescription>
                            {selectedRoomForEdit 
                              ? 'Modifica la información de la sala' 
                              : 'Completa la información para crear una nueva sala'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="room-name">Nombre de la sala *</Label>
                            <Input
                              id="room-name"
                              placeholder="Ej: Auditorio Principal"
                              value={roomForm.name}
                              onChange={(e) => setRoomForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="room-capacity">Capacidad</Label>
                              <Input
                                id="room-capacity"
                                type="number"
                                placeholder="50"
                                value={roomForm.capacity}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, capacity: e.target.value }))}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="room-color">Color</Label>
                              <div className="flex gap-2">
                                <Input
                                  id="room-color"
                                  type="color"
                                  value={roomForm.color}
                                  onChange={(e) => setRoomForm(prev => ({ ...prev, color: e.target.value }))}
                                  className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                  value={roomForm.color}
                                  onChange={(e) => setRoomForm(prev => ({ ...prev, color: e.target.value }))}
                                  placeholder="#3B82F6"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="room-building">Edificio</Label>
                              <Input
                                id="room-building"
                                placeholder="Ej: Edificio A"
                                value={roomForm.building}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, building: e.target.value }))}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="room-floor">Piso</Label>
                              <Input
                                id="room-floor"
                                placeholder="Ej: Planta Baja"
                                value={roomForm.floor}
                                onChange={(e) => setRoomForm(prev => ({ ...prev, floor: e.target.value }))}
                              />
                            </div>
                          </div>
                          
                          {/* Geolocation Section */}
                          <div className="space-y-3 pt-2 border-t">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <Navigation className="w-4 h-4" />
                                Ubicación (Latitud/Longitud)
                              </Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (!navigator.geolocation) {
                                    toast.error('Tu navegador no soporta geolocalización');
                                    return;
                                  }
                                  toast.info('Obteniendo ubicación...');
                                  navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                      setRoomForm(prev => ({
                                        ...prev,
                                        latitude: position.coords.latitude.toFixed(6),
                                        longitude: position.coords.longitude.toFixed(6),
                                      }));
                                      toast.success('Ubicación obtenida correctamente');
                                    },
                                    (error) => {
                                      console.error('Error getting location:', error);
                                      toast.error('No se pudo obtener la ubicación. Verifica los permisos.');
                                    },
                                    { enableHighAccuracy: true, timeout: 10000 }
                                  );
                                }}
                              >
                                <Crosshair className="w-4 h-4 mr-1" />
                                Mi ubicación
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="room-latitude">Latitud</Label>
                                <Input
                                  id="room-latitude"
                                  type="number"
                                  step="any"
                                  placeholder="Ej: -33.450000"
                                  value={roomForm.latitude}
                                  onChange={(e) => setRoomForm(prev => ({ ...prev, latitude: e.target.value }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="room-longitude">Longitud</Label>
                                <Input
                                  id="room-longitude"
                                  type="number"
                                  step="any"
                                  placeholder="Ej: -70.670000"
                                  value={roomForm.longitude}
                                  onChange={(e) => setRoomForm(prev => ({ ...prev, longitude: e.target.value }))}
                                />
                              </div>
                            </div>
                            {roomForm.latitude && roomForm.longitude && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                <span>
                                  Ubicación: {roomForm.latitude}, {roomForm.longitude}
                                </span>
                                <Button
                                  type="button"
                                  variant="link"
                                  size="sm"
                                  className="p-0 h-auto"
                                  onClick={() => {
                                    const url = `https://www.google.com/maps?q=${roomForm.latitude},${roomForm.longitude}`;
                                    window.open(url, '_blank');
                                  }}
                                >
                                  Ver en mapa
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditRoomDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleSaveRoom}
                            disabled={savingRoom}
                          >
                            {savingRoom ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              selectedRoomForEdit ? 'Guardar Cambios' : 'Crear Sala'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* QR Code Dialog */}
                    <Dialog open={qrRoomDialogOpen} onOpenChange={setQrRoomDialogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Código QR - {selectedRoomForEdit?.name}
                          </DialogTitle>
                          <DialogDescription>
                            Escanea este código para acceder a la información de la sala
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-4">
                          {roomQrCode && (
                            <div className="bg-white p-4 rounded-lg shadow-inner">
                              <img 
                                src={roomQrCode} 
                                alt="QR Code" 
                                className="w-48 h-48 object-contain"
                              />
                            </div>
                          )}
                          <div className="mt-4 text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              <strong>Sala:</strong> {selectedRoomForEdit?.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Ubicación:</strong> {selectedRoomForEdit?.building} - {selectedRoomForEdit?.floor}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => {
                              if (roomQrCode) {
                                const link = document.createElement('a');
                                link.href = roomQrCode;
                                link.download = `qr-${selectedRoomForEdit?.name?.replace(/\s+/g, '-')}.png`;
                                link.target = '_blank';
                                window.open(roomQrCode, '_blank');
                                toast.success('Abriendo imagen del QR...');
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar QR
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={() => {
                              navigator.clipboard.writeText(`Sala: ${selectedRoomForEdit?.name}, ${selectedRoomForEdit?.building} - ${selectedRoomForEdit?.floor}`);
                              toast.success('Información copiada al portapapeles');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Info
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Map Room Dialog */}
                    <Dialog open={mapRoomDialogOpen} onOpenChange={setMapRoomDialogOpen}>
                      <DialogContent className="sm:max-w-lg w-[95vw] max-w-[95vw] sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                            <span className="truncate">Ubicación de {selectedRoomForEdit?.name}</span>
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Ver ubicación y obtener direcciones
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 sm:space-y-4">
                          {/* Map display */}
                          {selectedRoomForEdit?.latitude && selectedRoomForEdit?.longitude ? (
                            <div className="relative h-40 sm:h-56 rounded-lg overflow-hidden border">
                              <iframe
                                title="Ubicación de la sala"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedRoomForEdit.longitude - 0.005}%2C${selectedRoomForEdit.latitude - 0.003}%2C${selectedRoomForEdit.longitude + 0.005}%2C${selectedRoomForEdit.latitude + 0.003}&layer=mapnik&marker=${selectedRoomForEdit.latitude}%2C${selectedRoomForEdit.longitude}`}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="relative h-32 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <Building 
                                    className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-1 sm:mb-2" 
                                    style={{ color: selectedRoomForEdit?.color || '#3B82F6' }}
                                  />
                                  <p className="text-xs sm:text-sm font-medium">{selectedRoomForEdit?.name}</p>
                                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Ubicación no configurada</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Coordinates display */}
                          {selectedRoomForEdit?.latitude && selectedRoomForEdit?.longitude && (
                            <div className="flex items-center gap-2 p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                  Coordenadas
                                </p>
                                <p className="text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 truncate">
                                  Lat: {selectedRoomForEdit.latitude.toFixed(6)}, Lng: {selectedRoomForEdit.longitude.toFixed(6)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `${selectedRoomForEdit.latitude}, ${selectedRoomForEdit.longitude}`
                                  );
                                  toast.success('Coordenadas copiadas');
                                }}
                              >
                                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <Card>
                              <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">Edificio</span>
                                </div>
                                <p className="font-semibold mt-1 text-sm sm:text-base truncate">{selectedRoomForEdit?.building || 'No especificado'}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">Piso</span>
                                </div>
                                <p className="font-semibold mt-1 text-sm sm:text-base">{selectedRoomForEdit?.floor || 'No especificado'}</p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full text-sm"
                            onClick={() => setMapRoomDialogOpen(false)}
                          >
                            Cerrar
                          </Button>
                          <Button 
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-sm"
                            onClick={() => {
                              if (selectedRoomForEdit) {
                                openExternalMap(selectedRoomForEdit);
                                setMapRoomDialogOpen(false);
                              }
                            }}
                          >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Abrir en Google Maps
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={deleteRoomDialogOpen} onOpenChange={setDeleteRoomDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Eliminar Sala
                          </DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la sala <strong>{selectedRoomForEdit?.name}</strong>?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <AlertTitle>¡Atención!</AlertTitle>
                            <AlertDescription>
                              Esta acción no se puede deshacer. Se eliminará toda la información asociada a esta sala.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setDeleteRoomDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            variant="destructive"
                            onClick={handleDeleteRoom}
                            disabled={deletingRoom}
                          >
                            {deletingRoom ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Sala
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Activities Management */}
                {activeTab === 'activities' && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Gestión de Actividades</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Administra conferencias, talleres y paneles</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="SCHEDULED">Programados</SelectItem>
                            <SelectItem value="IN_PROGRESS">En curso</SelectItem>
                            <SelectItem value="COMPLETED">Finalizados</SelectItem>
                          </SelectContent>
                        </Select>
                        <Dialog open={activityDialogOpen} onOpenChange={(open) => {
                          setActivityDialogOpen(open);
                          if (!open) resetActivityForm();
                        }}>
                          <DialogTrigger asChild>
                            <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 w-full sm:w-auto">
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Nueva Actividad</span>
                              <span className="sm:hidden">Nueva</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw]">
                            <DialogHeader>
                              <DialogTitle>Crear Nueva Actividad</DialogTitle>
                              <DialogDescription>Completa la información de la actividad</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="activity-title">Título *</Label>
                                <Input 
                                  id="activity-title" 
                                  placeholder="Ej: Taller de Design Thinking"
                                  value={activityForm.title}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="activity-description">Descripción</Label>
                                <Textarea 
                                  id="activity-description" 
                                  placeholder="Describe la actividad..." 
                                  rows={3}
                                  value={activityForm.description}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                                />
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Tipo de actividad</Label>
                                  <Select 
                                    value={activityForm.type}
                                    onValueChange={(value) => setActivityForm(prev => ({ ...prev, type: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="KEYNOTE">Conferencia</SelectItem>
                                      <SelectItem value="KEYNOTE_SPEECH">Discurso Principal</SelectItem>
                                      <SelectItem value="CHARLA_MAGISTRAL">Charla Magistral</SelectItem>
                                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                      <SelectItem value="TALLER">Taller</SelectItem>
                                      <SelectItem value="PANEL">Panel</SelectItem>
                                      <SelectItem value="PRESENTATION">Presentación</SelectItem>
                                      <SelectItem value="PITCH">Pitch</SelectItem>
                                      <SelectItem value="NETWORKING">Networking</SelectItem>
                                      <SelectItem value="BREAK">Descanso</SelectItem>
                                      <SelectItem value="CEREMONY">Ceremonia</SelectItem>
                                      <SelectItem value="CONFERENCIA">Conferencia</SelectItem>
                                      <SelectItem value="MESA_REDONDA">Mesa Redonda</SelectItem>
                                      <SelectItem value="FORO">Foro</SelectItem>
                                      <SelectItem value="SEMINARIO">Seminario</SelectItem>
                                      <SelectItem value="CURSO">Curso</SelectItem>
                                      <SelectItem value="OTRO">Otro</SelectItem>
                                      <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Sala</Label>
                                  <Select
                                    value={activityForm.roomId}
                                    onValueChange={(value) => setActivityForm(prev => ({ ...prev, roomId: value }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Seleccionar sala" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Hora inicio *</Label>
                                  <Input 
                                    type="time"
                                    value={activityForm.startTime}
                                    onChange={(e) => setActivityForm(prev => ({ ...prev, startTime: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Hora fin *</Label>
                                  <Input 
                                    type="time"
                                    value={activityForm.endTime}
                                    onChange={(e) => setActivityForm(prev => ({ ...prev, endTime: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                  <Label>Fecha *</Label>
                                  <Input 
                                    type="date"
                                    value={activityForm.date}
                                    onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Capacidad máxima</Label>
                                  <Input 
                                    type="number" 
                                    placeholder="Ej: 100"
                                    value={activityForm.maxCapacity}
                                    onChange={(e) => setActivityForm(prev => ({ ...prev, maxCapacity: e.target.value }))}
                                  />
                                </div>
                              </div>
                              <div className="grid gap-2">
                                <Label>Temática</Label>
                                <Input 
                                  placeholder="Ej: Innovación, Tecnología, Diseño"
                                  value={activityForm.theme}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, theme: e.target.value }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="expositor-name">Expositor</Label>
                                <Input 
                                  id="expositor-name"
                                  placeholder="Nombre del expositor o conferencista"
                                  value={activityForm.expositorName}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, expositorName: e.target.value }))}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch 
                                  id="activity-generate-qr"
                                  checked={activityForm.generateQr}
                                  onCheckedChange={(checked) => setActivityForm(prev => ({ ...prev, generateQr: checked }))}
                                />
                                <Label htmlFor="activity-generate-qr">Generar código QR automáticamente</Label>
                              </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                              <Button variant="outline" onClick={() => {
                                setActivityDialogOpen(false);
                                resetActivityForm();
                              }} className="w-full sm:w-auto">
                                Cancelar
                              </Button>
                              <Button 
                                className="bg-gradient-to-r from-emerald-500 to-teal-600 w-full sm:w-auto"
                                onClick={handleCreateActivity}
                                disabled={savingActivity}
                              >
                                {savingActivity ? (
                                  <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                  </>
                                ) : (
                                  'Crear Actividad'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    <div className="grid gap-3 md:gap-4">
                      {activities.map((activity) => (
                        <Card key={activity.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 md:pt-6 md:px-6">
                            <div className="flex items-start gap-3 md:gap-4">
                              <div className={cn("w-2 h-full min-h-[60px] md:min-h-[80px] rounded-full flex-shrink-0", getActivityTypeColor(activity.type))} />
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                      <Badge className={cn("text-xs", getStatusColor(activity.status))}>
                                        {activity.status === 'SCHEDULED' ? 'Programado' : activity.status === 'IN_PROGRESS' ? 'En curso' : 'Finalizado'}
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">{getTypeLabel(activity.type)}</Badge>
                                    </div>
                                    <h3 className="text-base md:text-lg font-bold truncate">{activity.title}</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="flex-shrink-0 self-start">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditActivity(activity)}>
                                        <Edit className="w-4 h-4 mr-2" /> Editar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleViewActivity(activity)}>
                                        <Eye className="w-4 h-4 mr-2" /> Ver detalles
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleGenerateActivityQR(activity)}>
                                        <QrCode className="w-4 h-4 mr-2" /> Generar QR
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteActivityClick(activity)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 md:mt-3 text-xs md:text-sm">
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                                  </span>
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    <span className="truncate max-w-[120px] md:max-w-none">{activity.room?.name}</span>
                                  </span>
                                  {activity.speaker && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                      <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                      <span className="truncate max-w-[100px] md:max-w-none">{activity.speaker.name}</span>
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                    {activity.currentAttendance} asistentes
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Edit Activity Dialog */}
                    <Dialog open={editActivityDialogOpen} onOpenChange={setEditActivityDialogOpen}>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Editar Actividad</DialogTitle>
                          <DialogDescription>Modifica la información de la actividad</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-activity-title">Título *</Label>
                            <Input
                              id="edit-activity-title"
                              value={activityForm.title}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-activity-description">Descripción</Label>
                            <Textarea
                              id="edit-activity-description"
                              rows={3}
                              value={activityForm.description}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Tipo de actividad</Label>
                              <Select
                                value={activityForm.type}
                                onValueChange={(value) => setActivityForm(prev => ({ ...prev, type: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="KEYNOTE">Conferencia</SelectItem>
                                  <SelectItem value="KEYNOTE_SPEECH">Discurso Principal</SelectItem>
                                  <SelectItem value="CHARLA_MAGISTRAL">Charla Magistral</SelectItem>
                                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                                  <SelectItem value="TALLER">Taller</SelectItem>
                                  <SelectItem value="PANEL">Panel</SelectItem>
                                  <SelectItem value="PRESENTATION">Presentación</SelectItem>
                                  <SelectItem value="PITCH">Pitch</SelectItem>
                                  <SelectItem value="NETWORKING">Networking</SelectItem>
                                  <SelectItem value="BREAK">Descanso</SelectItem>
                                  <SelectItem value="CEREMONY">Ceremonia</SelectItem>
                                  <SelectItem value="CONFERENCIA">Conferencia</SelectItem>
                                  <SelectItem value="MESA_REDONDA">Mesa Redonda</SelectItem>
                                  <SelectItem value="FORO">Foro</SelectItem>
                                  <SelectItem value="SEMINARIO">Seminario</SelectItem>
                                  <SelectItem value="CURSO">Curso</SelectItem>
                                  <SelectItem value="OTRO">Otro</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Sala</Label>
                              <Select
                                value={activityForm.roomId}
                                onValueChange={(value) => setActivityForm(prev => ({ ...prev, roomId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar sala" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rooms.map((room) => (
                                    <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label>Fecha</Label>
                              <Input
                                type="date"
                                value={activityForm.date}
                                onChange={(e) => setActivityForm(prev => ({ ...prev, date: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-2">
                                <Label>Hora inicio</Label>
                                <Input
                                  type="time"
                                  value={activityForm.startTime}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, startTime: e.target.value }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Hora fin</Label>
                                <Input
                                  type="time"
                                  value={activityForm.endTime}
                                  onChange={(e) => setActivityForm(prev => ({ ...prev, endTime: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-expositor-name">Expositor</Label>
                            <Input
                              id="edit-expositor-name"
                              placeholder="Nombre del expositor o conferencista"
                              value={activityForm.expositorName}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, expositorName: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-theme">Temática</Label>
                            <Input
                              id="edit-theme"
                              placeholder="Ej: Innovación, Tecnología, Diseño"
                              value={activityForm.theme}
                              onChange={(e) => setActivityForm(prev => ({ ...prev, theme: e.target.value }))}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditActivityDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleSaveEditedActivity}
                            disabled={savingActivity}
                          >
                            {savingActivity ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              'Guardar Cambios'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* View Activity Details Dialog */}
                    <Dialog open={viewActivityDialogOpen} onOpenChange={setViewActivityDialogOpen}>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Detalles de la Actividad</DialogTitle>
                        </DialogHeader>
                        {selectedActivityForEdit && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-3 h-12 rounded-full", getActivityTypeColor(selectedActivityForEdit.type))} />
                              <div>
                                <h2 className="text-2xl font-bold">{selectedActivityForEdit.title}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge className={getStatusColor(selectedActivityForEdit.status)}>
                                    {selectedActivityForEdit.status === 'SCHEDULED' ? 'Programado' : selectedActivityForEdit.status === 'IN_PROGRESS' ? 'En curso' : 'Finalizado'}
                                  </Badge>
                                  <Badge variant="outline">{getTypeLabel(selectedActivityForEdit.type)}</Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">Horario</span>
                                  </div>
                                  <p className="font-semibold">
                                    {formatTime(selectedActivityForEdit.startTime)} - {formatTime(selectedActivityForEdit.endTime)}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(selectedActivityForEdit.startTime)}
                                  </p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Ubicación</span>
                                  </div>
                                  <p className="font-semibold">{selectedActivityForEdit.room?.name || 'Sin asignar'}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedActivityForEdit.room?.building} - {selectedActivityForEdit.room?.floor}
                                  </p>
                                </CardContent>
                              </Card>
                            </div>

                            {selectedActivityForEdit.description && (
                              <div>
                                <h3 className="font-semibold mb-2">Descripción</h3>
                                <p className="text-muted-foreground">{selectedActivityForEdit.description}</p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                              <Users className="w-8 h-8 text-emerald-500" />
                              <div>
                                <p className="text-2xl font-bold text-emerald-500">{selectedActivityForEdit.currentAttendance}</p>
                                <p className="text-sm text-muted-foreground">Asistentes registrados</p>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setViewActivityDialogOpen(false)}>
                            Cerrar
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={() => {
                              setViewActivityDialogOpen(false);
                              if (selectedActivityForEdit) {
                                handleEditActivity(selectedActivityForEdit);
                              }
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Activity QR Code Dialog */}
                    <Dialog open={qrActivityDialogOpen} onOpenChange={setQrActivityDialogOpen}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Código QR - {selectedActivityForEdit?.title}
                          </DialogTitle>
                          <DialogDescription>
                            Escanea este código para registrar asistencia a la actividad
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-4">
                          {activityQrCode && (
                            <div className="bg-white p-4 rounded-lg shadow-inner">
                              <img
                                src={activityQrCode}
                                alt="QR Code"
                                className="w-48 h-48 object-contain"
                              />
                            </div>
                          )}
                          <div className="mt-4 text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              <strong>Actividad:</strong> {selectedActivityForEdit?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <strong>Tipo:</strong> {getTypeLabel(selectedActivityForEdit?.type || '')}
                            </p>
                            <p className="text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2">
                              Código: ACTIVITY:{selectedActivityForEdit?.id}
                            </p>
                          </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                              if (activityQrCode) {
                                window.open(activityQrCode, '_blank');
                                toast.success('Abriendo imagen del QR...');
                              }
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar QR
                          </Button>
                          <Button
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={() => {
                              navigator.clipboard.writeText(`ACTIVITY:${selectedActivityForEdit?.id}:${selectedActivityForEdit?.title}`);
                              toast.success('Código copiado al portapapeles');
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copiar Código
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Activity Confirmation Dialog */}
                    <Dialog open={deleteActivityDialogOpen} onOpenChange={setDeleteActivityDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            Eliminar Actividad
                          </DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas eliminar la actividad <strong>{selectedActivityForEdit?.title}</strong>?
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <AlertTitle>¡Atención!</AlertTitle>
                            <AlertDescription>
                              Esta acción no se puede deshacer. Se eliminará toda la información asociada a esta actividad, incluyendo registros de asistencia.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDeleteActivityDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteActivity}
                            disabled={deletingActivity}
                          >
                            {deletingActivity ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Actividad
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Projects Management */}
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Proyectos</h1>
                        <p className="text-muted-foreground">Administra los proyectos participantes</p>
                      </div>
                      <div className="flex gap-2">
                        <Select defaultValue="all">
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="DRAFT">Borradores</SelectItem>
                            <SelectItem value="APPROVED">Aprobados</SelectItem>
                            <SelectItem value="FINALIST">Finalistas</SelectItem>
                            <SelectItem value="WINNER">Ganadores</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                          onClick={handleNewProject}
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo Proyecto
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {projects.map((project) => (
                        <Card key={project.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                          {project.image && (
                            <div className="h-40 w-full overflow-hidden bg-gray-100">
                              <img 
                                src={project.image} 
                                alt={project.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {project.rank && project.rank <= 3 && (
                                    <div className={cn(
                                      "w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                      project.rank === 1 ? "bg-amber-500" : project.rank === 2 ? "bg-gray-400" : "bg-amber-700"
                                    )}>
                                      {project.rank}
                                    </div>
                                  )}
                                  <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                                </div>
                                <CardDescription className="line-clamp-1">{project.team}</CardDescription>
                              </div>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status === 'APPROVED' ? 'Aprobado' : 
                                 project.status === 'FINALIST' ? 'Finalista' : 
                                 project.status === 'WINNER' ? 'Ganador' :
                                 project.status === 'DRAFT' ? 'Borrador' : project.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
                            
                            {/* Area and Category badges */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              {project.area && (
                                <Badge variant="outline" className="text-xs">
                                  {areaOptions.find(a => a.value === project.area)?.label || project.area}
                                </Badge>
                              )}
                              {project.projectCategory && (
                                <Badge variant="secondary" className="text-xs">
                                  {projectCategoryOptions.find(c => c.value === project.projectCategory)?.label || project.projectCategory}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Leader info */}
                            {project.leaderName && (
                              <div className="text-xs text-muted-foreground mb-3">
                                <span className="font-medium">Líder:</span> {project.leaderName}
                                {project.institution && <span className="ml-2">• {project.institution}</span>}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span>{project.averageScore?.toFixed(1) || '-'}</span>
                                </div>
                                <span className="text-muted-foreground">{project.totalVotes} votos</span>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditProject(project)}>
                                    <Edit className="w-4 h-4 mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleViewProject(project)}>
                                    <Eye className="w-4 h-4 mr-2" /> Ver detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleGenerateProjectQR(project)}>
                                    <QrCode className="w-4 h-4 mr-2" /> Generar QR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedProjectForEdit(project);
                                      setDeleteProjectDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {projects.length === 0 && (
                      <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No hay proyectos</h3>
                        <p className="text-muted-foreground">Crea el primer proyecto para comenzar</p>
                        <Button 
                          className="mt-4 gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                          onClick={handleNewProject}
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo Proyecto
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Edit Project Dialog */}
                <Dialog open={editProjectDialogOpen} onOpenChange={setEditProjectDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        {selectedProjectForEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                      </DialogTitle>
                      <DialogDescription>
                        Completa la información del proyecto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Project Image */}
                      <div className="space-y-2">
                        <Label>Imagen del Proyecto</Label>
                        <div className="flex gap-4 items-start">
                          {projectForm.image ? (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                              <img src={projectForm.image} alt="Preview" className="w-full h-full object-cover" />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => setProjectForm(prev => ({ ...prev, image: '' }))}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div 
                              className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors"
                              onClick={() => projectImageInputRef.current?.click()}
                            >
                              <div className="text-center">
                                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                                <span className="text-xs text-muted-foreground mt-1">Subir imagen</span>
                              </div>
                            </div>
                          )}
                          <input
                            ref={projectImageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleProjectImageUpload}
                          />
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-name">Nombre del Proyecto *</Label>
                          <Input 
                            id="project-name" 
                            value={projectForm.name}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ej: EcoTrack"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-team">Equipo / Team</Label>
                          <Input 
                            id="project-team" 
                            value={projectForm.team}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, team: e.target.value }))}
                            placeholder="Nombre del equipo"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project-description">Descripción</Label>
                        <Textarea 
                          id="project-description" 
                          value={projectForm.description}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe el proyecto..."
                          rows={3}
                        />
                      </div>

                      {/* Area and Category */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="project-area">Área</Label>
                          <Select 
                            value={projectForm.area}
                            onValueChange={(value) => setProjectForm(prev => ({ ...prev, area: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un área" />
                            </SelectTrigger>
                            <SelectContent>
                              {areaOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="project-category">Categoría</Label>
                          <Select 
                            value={projectForm.projectCategory}
                            onValueChange={(value) => setProjectForm(prev => ({ ...prev, projectCategory: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                            <SelectContent>
                              {projectCategoryOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator />

                      {/* Leader Info */}
                      <div className="space-y-2">
                        <h4 className="font-medium">Información del Líder del Proyecto</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="leader-name">Nombre del Líder</Label>
                          <Input 
                            id="leader-name" 
                            value={projectForm.leaderName}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, leaderName: e.target.value }))}
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="leader-email">Correo Electrónico</Label>
                          <Input 
                            id="leader-email" 
                            type="email"
                            value={projectForm.leaderEmail}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, leaderEmail: e.target.value }))}
                            placeholder="correo@ejemplo.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="leader-phone">Teléfono</Label>
                          <Input 
                            id="leader-phone" 
                            value={projectForm.leaderPhone}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, leaderPhone: e.target.value }))}
                            placeholder="+593 99 999 9999"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="institution">Institución</Label>
                          <Input 
                            id="institution" 
                            value={projectForm.institution}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, institution: e.target.value }))}
                            placeholder="Universidad / Colegio"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="course">Curso / Semestre</Label>
                          <Input 
                            id="course" 
                            value={projectForm.course}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, course: e.target.value }))}
                            placeholder="Ej: 3ro Sistemas"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tutor-name">Nombre del Tutor</Label>
                          <Input 
                            id="tutor-name" 
                            value={projectForm.tutorName}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, tutorName: e.target.value }))}
                            placeholder="Nombre del tutor"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="project-status">Estado del Proyecto</Label>
                        <Select 
                          value={projectForm.status}
                          onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Borrador</SelectItem>
                            <SelectItem value="SUBMITTED">Enviado</SelectItem>
                            <SelectItem value="APPROVED">Aprobado</SelectItem>
                            <SelectItem value="REJECTED">Rechazado</SelectItem>
                            <SelectItem value="FINALIST">Finalista</SelectItem>
                            <SelectItem value="WINNER">Ganador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditProjectDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        onClick={handleSaveProject}
                        disabled={savingProject}
                      >
                        {savingProject ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Guardar Proyecto
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* View Project Dialog */}
                <Dialog open={viewProjectDialogOpen} onOpenChange={setViewProjectDialogOpen}>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Detalles del Proyecto
                      </DialogTitle>
                    </DialogHeader>
                    {selectedProjectForEdit && (
                      <div className="space-y-4">
                        {/* Project Image */}
                        {selectedProjectForEdit.image && (
                          <div className="w-full h-48 rounded-lg overflow-hidden">
                            <img 
                              src={selectedProjectForEdit.image} 
                              alt={selectedProjectForEdit.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between">
                          <div>
                            <h2 className="text-2xl font-bold">{selectedProjectForEdit.name}</h2>
                            <p className="text-muted-foreground">{selectedProjectForEdit.team}</p>
                          </div>
                          <Badge className={getStatusColor(selectedProjectForEdit.status)}>
                            {selectedProjectForEdit.status}
                          </Badge>
                        </div>

                        <p>{selectedProjectForEdit.description}</p>

                        {/* Area and Category */}
                        <div className="flex flex-wrap gap-2">
                          {selectedProjectForEdit.area && (
                            <Badge variant="outline">
                              {areaOptions.find(a => a.value === selectedProjectForEdit.area)?.label}
                            </Badge>
                          )}
                          {selectedProjectForEdit.projectCategory && (
                            <Badge variant="secondary">
                              {projectCategoryOptions.find(c => c.value === selectedProjectForEdit.projectCategory)?.label}
                            </Badge>
                          )}
                        </div>

                        <Separator />

                        {/* Leader Info */}
                        {(selectedProjectForEdit.leaderName || selectedProjectForEdit.institution) && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Información del Líder</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {selectedProjectForEdit.leaderName && (
                                <div><span className="text-muted-foreground">Nombre:</span> {selectedProjectForEdit.leaderName}</div>
                              )}
                              {selectedProjectForEdit.leaderEmail && (
                                <div><span className="text-muted-foreground">Email:</span> {selectedProjectForEdit.leaderEmail}</div>
                              )}
                              {selectedProjectForEdit.leaderPhone && (
                                <div><span className="text-muted-foreground">Teléfono:</span> {selectedProjectForEdit.leaderPhone}</div>
                              )}
                              {selectedProjectForEdit.institution && (
                                <div><span className="text-muted-foreground">Institución:</span> {selectedProjectForEdit.institution}</div>
                              )}
                              {selectedProjectForEdit.course && (
                                <div><span className="text-muted-foreground">Curso:</span> {selectedProjectForEdit.course}</div>
                              )}
                              {selectedProjectForEdit.tutorName && (
                                <div><span className="text-muted-foreground">Tutor:</span> {selectedProjectForEdit.tutorName}</div>
                              )}
                            </div>
                          </div>
                        )}

                        <Separator />

                        {/* Stats */}
                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-500">{selectedProjectForEdit.totalVotes}</div>
                            <div className="text-sm text-muted-foreground">Votos</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-500">{selectedProjectForEdit.averageScore?.toFixed(1) || '-'}</div>
                            <div className="text-sm text-muted-foreground">Puntuación</div>
                          </div>
                          {selectedProjectForEdit.rank && (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-amber-500">#{selectedProjectForEdit.rank}</div>
                              <div className="text-sm text-muted-foreground">Ranking</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setViewProjectDialogOpen(false)}>
                        Cerrar
                      </Button>
                      <Button onClick={() => {
                        setViewProjectDialogOpen(false);
                        handleEditProject(selectedProjectForEdit!);
                      }}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Project QR Dialog */}
                <Dialog open={qrProjectDialogOpen} onOpenChange={setQrProjectDialogOpen}>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        Código QR del Proyecto
                      </DialogTitle>
                      <DialogDescription>
                        {selectedProjectForEdit?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center py-4">
                      <img 
                        src={projectQrCode} 
                        alt="QR Code" 
                        className="w-64 h-64 rounded-lg border"
                      />
                      <p className="text-sm text-muted-foreground mt-4">
                        Escanea para ver el proyecto
                      </p>
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = projectQrCode;
                          link.download = `qr-${selectedProjectForEdit?.name || 'proyecto'}.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Descargar QR
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Project Dialog */}
                <Dialog open={deleteProjectDialogOpen} onOpenChange={setDeleteProjectDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Eliminar Proyecto
                      </DialogTitle>
                      <DialogDescription>
                        ¿Estás seguro de que deseas eliminar el proyecto "{selectedProjectForEdit?.name}"?
                        Esta acción no se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteProjectDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteProject}
                        disabled={deletingProject}
                      >
                        {deletingProject ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Voting Dialog for STARS and POINTS */}
                <Dialog open={votingDialogOpen} onOpenChange={setVotingDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Vote className="w-5 h-5 text-emerald-500" />
                        {votingConfig.voteType === 'STARS' ? 'Calificar Proyecto' : 'Asignar Puntos'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedProjectForVote?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                      {votingConfig.voteType === 'STARS' ? (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-sm text-muted-foreground text-center">
                            Selecciona una calificación de 1 a 5 estrellas
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setVoteScore(star)}
                                className="p-1 transition-transform hover:scale-110"
                              >
                                <Star 
                                  className={cn(
                                    "w-10 h-10 transition-colors",
                                    star <= voteScore 
                                      ? "text-yellow-400 fill-yellow-400" 
                                      : "text-gray-300 dark:text-gray-600"
                                  )} 
                                />
                              </button>
                            ))}
                          </div>
                          <p className="text-2xl font-bold text-center">
                            {voteScore} {voteScore === 1 ? 'estrella' : 'estrellas'}
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <p className="text-sm text-muted-foreground text-center">
                            Asigna puntos del 1 al 10
                          </p>
                          <div className="grid grid-cols-5 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                              <button
                                key={point}
                                onClick={() => setVoteScore(point)}
                                className={cn(
                                  "w-12 h-12 rounded-lg font-bold text-lg transition-all",
                                  point === voteScore
                                    ? "bg-emerald-500 text-white scale-105"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                )}
                              >
                                {point}
                              </button>
                            ))}
                          </div>
                          <p className="text-2xl font-bold text-center">
                            {voteScore} {voteScore === 1 ? 'punto' : 'puntos'}
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => setVotingDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        onClick={() => selectedProjectForVote && handleVoteProject(selectedProjectForVote, voteScore)}
                        disabled={votingProjectId === selectedProjectForVote?.id}
                      >
                        {votingProjectId === selectedProjectForVote?.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Votando...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Confirmar Voto
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Users Management */}
                {activeTab === 'users' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-muted-foreground">Administra los participantes del evento</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="Buscar usuarios..." 
                            className="pl-10 w-[250px]" 
                            value={userSearchQuery}
                            onChange={(e) => {
                              setUserSearchQuery(e.target.value);
                              loadUsers(e.target.value);
                            }}
                          />
                        </div>
                        <Button 
                          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                          onClick={() => setNewUserDialogOpen(true)}
                        >
                          <Plus className="w-4 h-4" />
                          Nuevo Usuario
                        </Button>
                        <Button variant="outline" className="gap-2">
                          <Download className="w-4 h-4" />
                          Exportar
                        </Button>
                      </div>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="rounded-lg border">
                          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 dark:bg-gray-800 text-sm font-medium">
                            <div>Usuario</div>
                            <div>Email</div>
                            <div>Rol</div>
                            <div>Puntos</div>
                            <div>Estado</div>
                            <div>Acciones</div>
                          </div>
                          {loadingUsers ? (
                            <div className="p-8 text-center">
                              <RefreshCw className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                              <p className="mt-2 text-muted-foreground">Cargando usuarios...</p>
                            </div>
                          ) : usersList.length > 0 ? (
                            usersList.map((userItem, i) => (
                              <div key={userItem.id || i} className="grid grid-cols-6 gap-4 p-4 border-t items-center">
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-8 h-8">
                                    <AvatarFallback>{getInitials(userItem.name)}</AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{userItem.name}</span>
                                </div>
                                <div className="text-muted-foreground">{userItem.email}</div>
                                <div><Badge className={getRoleColor(userItem.role)}>{getRoleLabel(userItem.role)}</Badge></div>
                                <div className="font-medium text-emerald-500">{userItem.points}</div>
                                <div><Badge className="bg-green-500">Activo</Badge></div>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setSelectedUser({
                                        id: userItem.id,
                                        name: userItem.name,
                                        email: userItem.email,
                                        role: userItem.role,
                                        points: userItem.points,
                                        level: userItem.level,
                                        status: 'active',
                                      });
                                      setEditUserForm({
                                        name: userItem.name,
                                        email: userItem.email,
                                        role: userItem.role,
                                        status: 'active',
                                      });
                                      setEditUserDialogOpen(true);
                                    }}
                                    title="Editar usuario"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => {
                                      setSelectedUser({
                                        id: userItem.id,
                                        name: userItem.name,
                                        email: userItem.email,
                                        role: userItem.role,
                                        points: userItem.points,
                                        level: userItem.level,
                                        status: 'active',
                                      });
                                      setViewUserDialogOpen(true);
                                    }}
                                    title="Ver detalles"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-muted-foreground">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No se encontraron usuarios</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* New User Dialog */}
                    <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Nuevo Usuario
                          </DialogTitle>
                          <DialogDescription>
                            Crea un nuevo usuario para el evento
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="new-name">Nombre</Label>
                            <Input 
                              id="new-name" 
                              value={newUserForm.name}
                              onChange={(e) => setNewUserForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Nombre completo"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-email">Email</Label>
                            <Input 
                              id="new-email" 
                              type="email"
                              value={newUserForm.email}
                              onChange={(e) => setNewUserForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="correo@ejemplo.com"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-password">Contraseña</Label>
                            <Input 
                              id="new-password" 
                              type="password"
                              value={newUserForm.password}
                              onChange={(e) => setNewUserForm(prev => ({ ...prev, password: e.target.value }))}
                              placeholder="••••••••"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="new-role">Rol</Label>
                            <Select 
                              value={newUserForm.role}
                              onValueChange={(value) => setNewUserForm(prev => ({ ...prev, role: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="ORGANIZER">Organizador</SelectItem>
                                <SelectItem value="MODERATOR">Moderador</SelectItem>
                                <SelectItem value="EVALUATOR">Evaluador</SelectItem>
                                <SelectItem value="PARTICIPANT">Participante</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleCreateUser}
                            disabled={creatingUser}
                          >
                            {creatingUser ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Creando...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Crear Usuario
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Edit User Dialog */}
                    <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Editar Usuario
                          </DialogTitle>
                          <DialogDescription>
                            Modifica la información del usuario
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-name">Nombre</Label>
                            <Input 
                              id="edit-name" 
                              value={editUserForm.name}
                              onChange={(e) => setEditUserForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input 
                              id="edit-email" 
                              type="email"
                              value={editUserForm.email}
                              onChange={(e) => setEditUserForm(prev => ({ ...prev, email: e.target.value }))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-role">Rol</Label>
                            <Select 
                              value={editUserForm.role}
                              onValueChange={(value) => setEditUserForm(prev => ({ ...prev, role: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="ORGANIZER">Organizador</SelectItem>
                                <SelectItem value="MODERATOR">Moderador</SelectItem>
                                <SelectItem value="EVALUATOR">Evaluador</SelectItem>
                                <SelectItem value="PARTICIPANT">Participante</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-status">Estado</Label>
                            <Select 
                              value={editUserForm.status}
                              onValueChange={(value) => setEditUserForm(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Activo</SelectItem>
                                <SelectItem value="inactive">Inactivo</SelectItem>
                                <SelectItem value="suspended">Suspendido</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedUser && (
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="text-sm text-muted-foreground">Puntos actuales</p>
                                <p className="text-lg font-bold text-emerald-500">{selectedUser.points}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Nivel</p>
                                <p className="text-lg font-bold">{selectedUser.level}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditUserDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleSaveUser}
                            disabled={savingUser}
                          >
                            {savingUser ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              'Guardar Cambios'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* View User Dialog */}
                    <Dialog open={viewUserDialogOpen} onOpenChange={setViewUserDialogOpen}>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Detalles del Usuario
                          </DialogTitle>
                        </DialogHeader>
                        {selectedUser && (
                          <div className="space-y-6 py-4">
                            {/* User Header */}
                            <div className="flex items-center gap-4">
                              <Avatar className="w-16 h-16">
                                <AvatarFallback className="text-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                  {getInitials(selectedUser.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                                <p className="text-muted-foreground">{selectedUser.email}</p>
                                <Badge className={getRoleColor(selectedUser.role)}>
                                  {getRoleLabel(selectedUser.role)}
                                </Badge>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                              <Card>
                                <CardContent className="pt-6 text-center">
                                  <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                                  <p className="text-2xl font-bold">{selectedUser.points}</p>
                                  <p className="text-xs text-muted-foreground">Puntos</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-6 text-center">
                                  <Target className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                  <p className="text-2xl font-bold">{selectedUser.level}</p>
                                  <p className="text-xs text-muted-foreground">Nivel</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-6 text-center">
                                  <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                  <p className="text-2xl font-bold">5</p>
                                  <p className="text-xs text-muted-foreground">Actividades</p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Activity Summary */}
                            <div className="space-y-3">
                              <h4 className="font-semibold">Actividad Reciente</h4>
                              <div className="space-y-2">
                                {[
                                  { action: 'Asistencia registrada', activity: 'Taller de Design Thinking', time: 'Hoy, 10:30' },
                                  { action: 'Voto registrado', activity: 'Proyecto EcoTrack', time: 'Hoy, 09:15' },
                                  { action: 'Logro desbloqueado', activity: 'Participante Activo', time: 'Ayer' },
                                ].map((item, i) => (
                                  <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <Check className="w-4 h-4 text-green-500" />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{item.action}</p>
                                      <p className="text-xs text-muted-foreground">{item.activity}</p>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{item.time}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Badges */}
                            <div className="space-y-3">
                              <h4 className="font-semibold">Insignias Obtenidas</h4>
                              <div className="flex flex-wrap gap-2">
                                {['Primera Asistencia', 'Votante Activo', 'Explorador', 'Scáner Pro'].map((badge, i) => (
                                  <Badge key={i} variant="secondary" className="gap-1">
                                    <Medal className="w-3 h-3" />
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setViewUserDialogOpen(false)}>
                            Cerrar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={() => {
                              setViewUserDialogOpen(false);
                              if (selectedUser) {
                                setEditUserForm({
                                  name: selectedUser.name,
                                  email: selectedUser.email,
                                  role: selectedUser.role,
                                  status: selectedUser.status,
                                });
                                setEditUserDialogOpen(true);
                              }
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Usuario
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* QR Management */}
                {activeTab === 'qr' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Códigos QR</h1>
                        <p className="text-muted-foreground">Genera y administra códigos QR</p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
                            <Plus className="w-4 h-4" />
                            Generar QR
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Generar Código QR</DialogTitle>
                            <DialogDescription>Selecciona el tipo de QR a generar</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <Button variant="outline" className="h-24 flex-col gap-2">
                                <Building className="w-6 h-6" />
                                <span>Sala</span>
                              </Button>
                              <Button variant="outline" className="h-24 flex-col gap-2">
                                <Presentation className="w-6 h-6" />
                                <span>Actividad</span>
                              </Button>
                              <Button variant="outline" className="h-24 flex-col gap-2">
                                <Lightbulb className="w-6 h-6" />
                                <span>Proyecto</span>
                              </Button>
                              <Button variant="outline" className="h-24 flex-col gap-2">
                                <User className="w-6 h-6" />
                                <span>Usuario</span>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {rooms.map((room) => {
                        const qrData = `ROOM:${room.id}:${room.name}:${room.building || ''}:${room.floor || ''}`;
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
                        
                        return (
                          <Card key={room.id}>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                {room.name}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                              <div className="w-40 h-40 bg-white rounded-lg p-2 shadow-inner">
                                <img 
                                  src={qrUrl}
                                  alt={`QR Code for ${room.name}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex gap-2 w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleDownloadQR(qrUrl, room.name)}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Descargar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => handleCopyQR(qrUrl, room.name)}
                                >
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copiar
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Voting Management */}
                {activeTab === 'voting' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Votación</h1>
                        <p className="text-muted-foreground">Configura y monitorea la votación de proyectos</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Actualizar
                        </Button>
                        <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
                          <Settings className="w-4 h-4" />
                          Configurar Votación
                        </Button>
                      </div>
                    </div>

                    {/* Voting Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                              <Vote className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Total Votos</p>
                              <p className="text-2xl font-bold">{dashboardStats.totalVotes.toLocaleString()}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                              <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Participantes que Votaron</p>
                              <p className="text-2xl font-bold">847</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-xl">
                              <Activity className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Votos última hora</p>
                              <p className="text-2xl font-bold">156</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Results */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Resultados en Tiempo Real</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-500 animate-pulse">EN VIVO</Badge>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projects.map((project, i) => (
                            <div key={project.id} className="flex items-center gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm",
                                i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-gray-300 dark:bg-gray-600"
                              )}>
                                {i + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{project.name}</span>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <span>{project.averageScore?.toFixed(1) || '-'}</span>
                                    <span className="text-muted-foreground">({project.totalVotes} votos)</span>
                                  </div>
                                </div>
                                <Progress value={projects[0]?.totalVotes ? (project.totalVotes / projects[0].totalVotes) * 100 : 0} className="h-2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Votes Detail Table */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="w-5 h-5" />
                              Detalle de Calificaciones
                            </CardTitle>
                            <CardDescription>
                              Lista de votos con sus calificaciones según el tipo de votación configurado
                            </CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={loadAllVotes} disabled={loadingVotes}>
                            {loadingVotes ? (
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-1" />
                            )}
                            Actualizar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <div className="overflow-x-auto max-h-96">
                            <table className="w-full text-sm">
                              <thead className="sticky top-0 bg-background">
                                <tr className="border-b bg-muted/50">
                                  <th className="p-3 text-left font-medium">Participante</th>
                                  <th className="p-3 text-left font-medium">Proyecto</th>
                                  <th className="p-3 text-center font-medium">Calificación</th>
                                  <th className="p-3 text-center font-medium">Tipo</th>
                                  <th className="p-3 text-right font-medium">Fecha</th>
                                </tr>
                              </thead>
                              <tbody>
                                {loadingVotes ? (
                                  <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-muted-foreground" />
                                      <p className="mt-2 text-muted-foreground">Cargando calificaciones...</p>
                                    </td>
                                  </tr>
                                ) : allVotes.length === 0 ? (
                                  <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                      <div className="flex flex-col items-center gap-2">
                                        <Vote className="w-8 h-8 opacity-50" />
                                        <p>Las calificaciones aparecerán aquí cuando los participantes voten</p>
                                        <p className="text-xs">Tipo de votación actual: <Badge variant="outline">{votingConfig.voteType === 'LIKE' ? 'Like' : votingConfig.voteType === 'STARS' ? 'Estrellas (1-5)' : 'Puntos (1-10)'}</Badge></p>
                                      </div>
                                    </td>
                                  </tr>
                                ) : (
                                  allVotes.map((vote) => (
                                    <tr key={vote.id} className="border-b hover:bg-muted/50">
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-6 h-6">
                                            <AvatarFallback className="text-xs">
                                              {vote.user?.name ? getInitials(vote.user.name) : 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="font-medium">{vote.user?.name || 'Usuario'}</span>
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <span>{vote.project?.name || 'Proyecto'}</span>
                                      </td>
                                      <td className="p-3 text-center">
                                        {votingConfig.voteType === 'STARS' ? (
                                          <div className="flex items-center justify-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                              <Star 
                                                key={i} 
                                                className={cn(
                                                  "w-4 h-4",
                                                  i < (vote.score || 0) 
                                                    ? "text-yellow-400 fill-yellow-400" 
                                                    : "text-gray-300"
                                                )} 
                                              />
                                            ))}
                                            <span className="ml-1 font-medium">{vote.score}</span>
                                          </div>
                                        ) : votingConfig.voteType === 'POINTS' ? (
                                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                            {vote.score} puntos
                                          </Badge>
                                        ) : (
                                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                            <Vote className="w-3 h-3 mr-1" />
                                            Like
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        <Badge variant="outline">
                                          {votingConfig.voteType === 'LIKE' ? 'Like' : votingConfig.voteType === 'STARS' ? 'Estrellas' : 'Puntos'}
                                        </Badge>
                                      </td>
                                      <td className="p-3 text-right text-muted-foreground">
                                        {new Date(vote.createdAt).toLocaleDateString('es-ES', {
                                          day: '2-digit',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {allVotes.length > 0 && (
                          <div className="mt-4 text-sm text-muted-foreground text-right">
                            Total: {allVotes.length} votos
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Certificates Management */}
                {activeTab === 'certificates' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Gestión de Certificados</h1>
                        <p className="text-muted-foreground">Configura y gestiona los certificados de participación</p>
                      </div>
                    </div>

                    {/* Certificate Stats */}
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                              <FileText className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Certificados Emitidos</p>
                              <p className="text-2xl font-bold">{certificates.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-teal-500/10 rounded-xl">
                              <Award className="w-6 h-6 text-teal-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Elegibles para Certificado</p>
                              <p className="text-2xl font-bold">{attendanceCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl">
                              <Users className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Asistencias Completas</p>
                              <p className="text-2xl font-bold">{attendanceCount}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Certificate Template Configuration */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Plantilla de Certificado</CardTitle>
                            <CardDescription>Configura el diseño y contenido del certificado</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            {certificateTemplates.length > 0 && (
                              <Select
                                value={selectedTemplate?.id || ''}
                                onValueChange={(v) => {
                                  const template = certificateTemplates.find((t: any) => t.id === v);
                                  if (template) {
                                    setSelectedTemplate(template);
                                    setTemplateForm({
                                      name: template.name || 'Plantilla',
                                      type: template.type || 'attendance',
                                      headerText: template.headerText || 'CERTIFICADO DE PARTICIPACIÓN',
                                      bodyText: template.bodyText || 'Se certifica que',
                                      organizationName: template.organizationName || 'Fábrica de Ideas',
                                      primaryColor: template.primaryColor || '#059669',
                                      secondaryColor: template.secondaryColor || '#0d9488',
                                      borderColor: template.borderColor || '#059669',
                                      borderWidth: String(template.borderWidth || 4),
                                      showQrCode: template.showQrCode !== false,
                                      showCode: template.showCode !== false,
                                      showDate: template.showDate !== false,
                                      showActivities: template.showActivities !== false,
                                    });
                                  }
                                }}
                              >
                                <SelectTrigger className="w-[200px]">
                                  <SelectValue placeholder="Seleccionar plantilla" />
                                </SelectTrigger>
                                <SelectContent>
                                  {certificateTemplates.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Button 
                              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
                              onClick={handleNewTemplate}
                            >
                              <Plus className="w-4 h-4" />
                              Nueva Plantilla
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Template Preview */}
                        <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                          <div 
                            className="aspect-[1.4/1] max-w-3xl mx-auto rounded-lg p-8 flex flex-col items-center justify-center text-center"
                            style={{ 
                              borderWidth: `${parseInt(templateForm.borderWidth) || 4}px`,
                              borderColor: templateForm.borderColor,
                              borderStyle: 'solid'
                            }}
                          >
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                              style={{ background: `linear-gradient(to bottom right, ${templateForm.primaryColor}, ${templateForm.secondaryColor})` }}
                            >
                              <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: templateForm.primaryColor }}>
                              {templateForm.headerText}
                            </h3>
                            <div className="w-24 h-0.5 mb-4" style={{ backgroundColor: templateForm.secondaryColor }} />
                            <p className="text-gray-600 mb-2">{templateForm.bodyText}</p>
                            <p className="text-xl font-bold text-gray-800 mb-2">NOMBRE DEL PARTICIPANTE</p>
                            <p className="text-gray-600 mb-4">ha participado activamente en</p>
                            <p className="text-lg font-semibold" style={{ color: templateForm.primaryColor }}>
                              {templateForm.organizationName}
                            </p>
                          </div>
                        </div>

                        {/* Template Settings */}
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h4 className="font-semibold">Configuración del Encabezado</h4>
                            <div className="space-y-3">
                              <div className="grid gap-2">
                                <Label>Nombre de la Plantilla</Label>
                                <Input 
                                  value={templateForm.name}
                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="Mi Plantilla"
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Título del Certificado</Label>
                                <Input 
                                  value={templateForm.headerText}
                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, headerText: e.target.value }))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Texto del Cuerpo</Label>
                                <Textarea 
                                  value={templateForm.bodyText}
                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, bodyText: e.target.value }))}
                                  rows={2} 
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>Nombre de la Organización</Label>
                                <Input 
                                  value={templateForm.organizationName}
                                  onChange={(e) => setTemplateForm(prev => ({ ...prev, organizationName: e.target.value }))}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-semibold">Configuración Visual</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Color Primario</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      type="color" 
                                      value={templateForm.primaryColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                                      className="w-12 h-10 p-1" 
                                    />
                                    <Input 
                                      value={templateForm.primaryColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, primaryColor: e.target.value }))}
                                      className="flex-1" 
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label>Color Secundario</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      type="color" 
                                      value={templateForm.secondaryColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                      className="w-12 h-10 p-1" 
                                    />
                                    <Input 
                                      value={templateForm.secondaryColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, secondaryColor: e.target.value }))}
                                      className="flex-1" 
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-2">
                                  <Label>Grosor del Borde</Label>
                                  <Input 
                                    type="number" 
                                    value={templateForm.borderWidth}
                                    onChange={(e) => setTemplateForm(prev => ({ ...prev, borderWidth: e.target.value }))}
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label>Color del Borde</Label>
                                  <div className="flex gap-2">
                                    <Input 
                                      type="color" 
                                      value={templateForm.borderColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, borderColor: e.target.value }))}
                                      className="w-12 h-10 p-1" 
                                    />
                                    <Input 
                                      value={templateForm.borderColor}
                                      onChange={(e) => setTemplateForm(prev => ({ ...prev, borderColor: e.target.value }))}
                                      className="flex-1" 
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Opciones de Contenido</h4>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">Mostrar Código QR</p>
                                <p className="text-sm text-muted-foreground">Para verificación del certificado</p>
                              </div>
                              <Switch 
                                checked={templateForm.showQrCode}
                                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, showQrCode: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">Mostrar Código Único</p>
                                <p className="text-sm text-muted-foreground">Identificador del certificado</p>
                              </div>
                              <Switch 
                                checked={templateForm.showCode}
                                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, showCode: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">Mostrar Fecha</p>
                                <p className="text-sm text-muted-foreground">Fecha de emisión</p>
                              </div>
                              <Switch 
                                checked={templateForm.showDate}
                                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, showDate: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium">Mostrar Actividades</p>
                                <p className="text-sm text-muted-foreground">Lista de actividades asistidas</p>
                              </div>
                              <Switch 
                                checked={templateForm.showActivities}
                                onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, showActivities: checked }))}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3">
                          <Button variant="outline" onClick={handlePreviewTemplate}>Vista Previa</Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleSaveTemplate}
                            disabled={savingTemplate}
                          >
                            {savingTemplate ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Guardar Plantilla
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Preview Dialog */}
                    <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Vista Previa del Certificado</DialogTitle>
                          <DialogDescription>
                            Así se verá el certificado con la configuración actual
                          </DialogDescription>
                        </DialogHeader>
                        <div className="border rounded-lg p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                          <div 
                            className="aspect-[1.4/1] max-w-2xl mx-auto rounded-lg p-8 flex flex-col items-center justify-center text-center"
                            style={{ 
                              borderWidth: `${parseInt(templateForm.borderWidth) || 4}px`,
                              borderColor: templateForm.borderColor,
                              borderStyle: 'solid'
                            }}
                          >
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                              style={{ background: `linear-gradient(to bottom right, ${templateForm.primaryColor}, ${templateForm.secondaryColor})` }}
                            >
                              <Award className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2" style={{ color: templateForm.primaryColor }}>
                              {templateForm.headerText}
                            </h3>
                            <div className="w-24 h-0.5 mb-4" style={{ backgroundColor: templateForm.secondaryColor }} />
                            <p className="text-gray-600 mb-2">{templateForm.bodyText}</p>
                            <p className="text-xl font-bold text-gray-800 mb-2">{user?.name || 'NOMBRE DEL PARTICIPANTE'}</p>
                            <p className="text-gray-600 mb-4">ha participado activamente en</p>
                            <p className="text-lg font-semibold" style={{ color: templateForm.primaryColor }}>
                              {templateForm.organizationName}
                            </p>
                            {templateForm.showDate && (
                              <p className="text-sm text-gray-500 mt-4">
                                Emitido el: {new Date().toLocaleDateString('es-ES')}
                              </p>
                            )}
                            {templateForm.showCode && (
                              <p className="text-xs font-mono text-gray-400 mt-2">
                                CERT-{Date.now().toString(36).toUpperCase()}
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
                            Cerrar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Issued Certificates List */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Certificados Emitidos</CardTitle>
                        <CardDescription>Lista de todos los certificados generados</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {certificates.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No hay certificados emitidos aún</p>
                            <p className="text-sm">Los certificados aparecerán cuando los participantes los generen</p>
                          </div>
                        ) : (
                          <div className="rounded-lg border">
                            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-800 text-sm font-medium">
                              <div>Participante</div>
                              <div>Tipo</div>
                              <div>Fecha</div>
                              <div>Código</div>
                              <div>Acciones</div>
                            </div>
                            {certificates.map((cert: any) => (
                              <div key={cert.id} className="grid grid-cols-5 gap-4 p-4 border-t items-center">
                                <div className="font-medium">{user?.name || 'Usuario'}</div>
                                <div>
                                  <Badge variant="outline">
                                    {cert.type === 'attendance' ? 'Participación' : cert.type}
                                  </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(cert.issueDate).toLocaleDateString('es-ES')}
                                </div>
                                <div className="text-xs font-mono">{cert.code?.slice(0, 15)}...</div>
                                <div className="flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      window.open(`/api/certificates/download?certificateId=${cert.id}`, '_blank');
                                    }}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Descargar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Reports Module */}
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Reportes y Estadísticas</h1>
                        <p className="text-muted-foreground">Análisis detallado del evento</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="gap-2"
                        onClick={() => {
                          // Generate report
                          toast.success('Generando reporte...');
                        }}
                      >
                        <Download className="w-4 h-4" />
                        Exportar Reporte
                      </Button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Users className="w-8 h-8 opacity-80" />
                            <div>
                              <p className="text-sm opacity-90">Total Participantes</p>
                              <p className="text-3xl font-bold">{dashboardStats.totalUsers}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Presentation className="w-8 h-8 opacity-80" />
                            <div>
                              <p className="text-sm opacity-90">Actividades</p>
                              <p className="text-3xl font-bold">{dashboardStats.totalActivities}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Lightbulb className="w-8 h-8 opacity-80" />
                            <div>
                              <p className="text-sm opacity-90">Proyectos</p>
                              <p className="text-3xl font-bold">{dashboardStats.totalProjects}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Vote className="w-8 h-8 opacity-80" />
                            <div>
                              <p className="text-sm opacity-90">Total Votos</p>
                              <p className="text-3xl font-bold">{dashboardStats.totalVotes}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid gap-6 lg:grid-cols-2">
                      {/* Projects by Category */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            Proyectos por Categoría
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(() => {
                              const categories = [...new Set(projects.filter(p => p.category).map(p => p.category))];
                              if (categories.length === 0) {
                                return <p className="text-center text-muted-foreground py-4">No hay categorías</p>;
                              }
                              const maxCount = Math.max(...categories.map(cat => projects.filter(p => p.category === cat).length));
                              return categories.map((category) => {
                                const count = projects.filter(p => p.category === category).length;
                                const percentage = Math.round((count / projects.length) * 100);
                                return (
                                  <div key={category} className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                      <span>{category}</span>
                                      <span className="text-muted-foreground">{count} ({percentage}%)</span>
                                    </div>
                                    <Progress value={(count / maxCount) * 100} className="h-2" />
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Projects by Status */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Proyectos por Estado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {[
                              { status: 'APPROVED', label: 'Aprobados', color: 'bg-emerald-500' },
                              { status: 'DRAFT', label: 'Borradores', color: 'bg-amber-500' },
                              { status: 'FINALIST', label: 'Finalistas', color: 'bg-purple-500' },
                              { status: 'WINNER', label: 'Ganadores', color: 'bg-yellow-500' },
                            ].map(({ status, label, color }) => {
                              const count = projects.filter(p => p.status === status).length;
                              const percentage = projects.length > 0 ? Math.round((count / projects.length) * 100) : 0;
                              return (
                                <div key={status} className="flex items-center gap-3">
                                  <div className={cn("w-3 h-3 rounded-full", color)} />
                                  <span className="flex-1 text-sm">{label}</span>
                                  <span className="font-medium">{count}</span>
                                  <span className="text-sm text-muted-foreground">({percentage}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Evaluations Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Resumen de Evaluaciones
                        </CardTitle>
                        <CardDescription>Estado de las evaluaciones de proyectos</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <CheckCircle className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                            <p className="text-2xl font-bold">{evaluations.filter(e => e.status === 'SUBMITTED').length}</p>
                            <p className="text-sm text-muted-foreground">Evaluaciones Completadas</p>
                          </div>
                          <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                            <FileText className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                            <p className="text-2xl font-bold">{evaluations.filter(e => e.status === 'DRAFT').length}</p>
                            <p className="text-sm text-muted-foreground">Borradores</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                            <p className="text-2xl font-bold">{projects.filter(p => p.status === 'APPROVED').length - evaluations.filter(e => e.status === 'SUBMITTED').length}</p>
                            <p className="text-sm text-muted-foreground">Pendientes</p>
                          </div>
                        </div>

                        {/* Average scores by criteria */}
                        {evaluations.length > 0 && (
                          <div className="mt-6">
                            <h4 className="font-semibold mb-4">Puntuación Promedio por Criterio</h4>
                            <div className="grid gap-3 md:grid-cols-2">
                              {evaluationCriteria.map((criterion) => {
                                const avgScore = evaluations.length > 0
                                  ? evaluations.reduce((sum, e) => sum + (e[criterion.key as keyof Evaluation] as number || 0), 0) / evaluations.filter(e => e.status === 'SUBMITTED').length
                                  : 0;
                                return (
                                  <div key={criterion.key} className="flex items-center gap-3">
                                    <span className="text-sm flex-1">{criterion.label}</span>
                                    <div className="flex items-center gap-2">
                                      <Progress value={avgScore * 10} className="w-24 h-2" />
                                      <span className="text-sm font-medium w-10">{avgScore.toFixed(1)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Top Projects by Evaluation */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          Top 10 Proyectos por Puntuación
                        </CardTitle>
                        <CardDescription>Mejores proyectos según evaluaciones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {projects
                            .filter(p => p.status === 'APPROVED')
                            .sort((a, b) => (b.averageEvaluation || b.averageScore || 0) - (a.averageEvaluation || a.averageScore || 0))
                            .slice(0, 10)
                            .map((project, index) => (
                              <div 
                                key={project.id} 
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border",
                                  index === 0 && "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
                                  index === 1 && "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
                                  index === 2 && "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm",
                                  index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-600" : "bg-gray-300 dark:bg-gray-600"
                                )}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{project.name}</p>
                                  <p className="text-xs text-muted-foreground">{project.team} • {project.category || 'Sin categoría'}</p>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center gap-1 font-bold text-amber-600">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    {project.averageEvaluation?.toFixed(1) || project.averageScore?.toFixed(1) || '0.0'}
                                  </div>
                                  <p className="text-xs text-muted-foreground">{project.totalVotes} votos</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Activities Attendance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="w-5 h-5" />
                          Asistencia a Actividades
                        </CardTitle>
                        <CardDescription>Resumen de asistencia por actividad</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {activities.slice(0, 10).map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3">
                              <div className={cn("w-3 h-3 rounded-full", getActivityTypeColor(activity.type))} />
                              <span className="flex-1 text-sm truncate">{activity.title}</span>
                              <span className="text-sm text-muted-foreground">{formatDate(activity.startTime)}</span>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{activity.currentAttendance}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Settings */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold">Configuración</h1>
                      <p className="text-muted-foreground">Ajustes generales del sistema</p>
                    </div>

                    <div className="grid gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Configuración del Evento</CardTitle>
                          <CardDescription>Opciones generales del evento activo</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Votación habilitada</Label>
                              <p className="text-sm text-muted-foreground">Permitir votación de proyectos</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Códigos QR activos</Label>
                              <p className="text-sm text-muted-foreground">Habilitar escaneo de QR</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Gamificación</Label>
                              <p className="text-sm text-muted-foreground">Sistema de puntos y logros</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Notificaciones push</Label>
                              <p className="text-sm text-muted-foreground">Enviar notificaciones a usuarios</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Vote className="w-5 h-5" />
                            Configuración de Votación
                          </CardTitle>
                          <CardDescription>Parámetros del sistema de votación para participantes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-2">
                            <Label>Tipo de votación</Label>
                            <Select 
                              value={votingConfig.voteType} 
                              onValueChange={(value) => setVotingConfig(prev => ({ ...prev, voteType: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="LIKE">Like (1 voto simple)</SelectItem>
                                <SelectItem value="STARS">Estrellas (1-5)</SelectItem>
                                <SelectItem value="POINTS">Puntos (1-10)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {votingConfig.voteType === 'LIKE' && 'Cada voto vale 1 punto'}
                              {votingConfig.voteType === 'STARS' && 'Los participantes pueden calificar de 1 a 5 estrellas'}
                              {votingConfig.voteType === 'POINTS' && 'Los participantes pueden asignar de 1 a 10 puntos'}
                            </p>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label>Máximo votos por usuario</Label>
                            <Input 
                              type="number" 
                              min={1} 
                              max={100}
                              value={votingConfig.maxVotesPerUser} 
                              onChange={(e) => setVotingConfig(prev => ({ 
                                ...prev, 
                                maxVotesPerUser: parseInt(e.target.value) || 3 
                              }))}
                              className="w-32" 
                            />
                            <p className="text-xs text-muted-foreground">
                              Número máximo de proyectos que un participante puede votar
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="showResults">Mostrar resultados en tiempo real</Label>
                              <p className="text-xs text-muted-foreground">
                                Los participantes podrán ver el ranking de votos
                              </p>
                            </div>
                            <Switch 
                              id="showResults" 
                              checked={votingConfig.showResults}
                              onCheckedChange={(checked) => setVotingConfig(prev => ({ ...prev, showResults: checked }))}
                            />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="votingActive">Votación activa</Label>
                              <p className="text-xs text-muted-foreground">
                                Habilita o deshabilita la votación
                              </p>
                            </div>
                            <Switch 
                              id="votingActive" 
                              checked={votingConfig.isActive}
                              onCheckedChange={(checked) => setVotingConfig(prev => ({ ...prev, isActive: checked }))}
                            />
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                              onClick={handleSaveVotingConfig}
                              disabled={savingVotingConfig}
                            >
                              {savingVotingConfig ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Guardar Configuración
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notification Configuration */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Configuración de Notificaciones
                          </CardTitle>
                          <CardDescription>Controla qué notificaciones reciben los participantes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Actividades</h4>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Inicio de actividad</p>
                                <p className="text-xs text-muted-foreground">Notificar cuando una actividad está por comenzar</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.activityStartEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, activityStartEnabled: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Recordatorios</p>
                                <p className="text-xs text-muted-foreground">Recordar actividades programadas</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.activityReminderEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, activityReminderEnabled: checked }))}
                              />
                            </div>
                            {notificationConfig.activityReminderEnabled && (
                              <div className="pl-4">
                                <Label className="text-xs">Minutos antes del recordatorio</Label>
                                <Input 
                                  type="number" 
                                  min={5} 
                                  max={60}
                                  value={notificationConfig.activityReminderMinutes} 
                                  onChange={(e) => setNotificationConfig(prev => ({ 
                                    ...prev, 
                                    activityReminderMinutes: parseInt(e.target.value) || 15 
                                  }))}
                                  className="w-24 mt-1" 
                                />
                              </div>
                            )}
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Votación</h4>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Confirmación de voto</p>
                                <p className="text-xs text-muted-foreground">Confirmar cuando un participante vota</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.voteConfirmationEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, voteConfirmationEnabled: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Recordatorio de votos</p>
                                <p className="text-xs text-muted-foreground">Recordar votos disponibles</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.voteReminderEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, voteReminderEnabled: checked }))}
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Gamificación</h4>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Puntos ganados</p>
                                <p className="text-xs text-muted-foreground">Notificar puntos obtenidos</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.pointsEarnedEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, pointsEarnedEnabled: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Logros desbloqueados</p>
                                <p className="text-xs text-muted-foreground">Notificar nuevos logros</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.achievementEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, achievementEnabled: checked }))}
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Otros</h4>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Certificados listos</p>
                                <p className="text-xs text-muted-foreground">Notificar cuando un certificado esté disponible</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.certificateReadyEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, certificateReadyEnabled: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">Anuncios globales</p>
                                <p className="text-xs text-muted-foreground">Permitir enviar anuncios a todos los participantes</p>
                              </div>
                              <Switch 
                                checked={notificationConfig.announcementsEnabled}
                                onCheckedChange={(checked) => setNotificationConfig(prev => ({ ...prev, announcementsEnabled: checked }))}
                              />
                            </div>
                          </div>

                          <div className="pt-4">
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              onClick={handleSaveNotificationConfig}
                              disabled={savingNotificationConfig}
                            >
                              {savingNotificationConfig ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Guardar Configuración
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Global Configuration - Timezone and Footer */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5" />
                            Configuración Global
                          </CardTitle>
                          <CardDescription>Zona horaria y personalización del footer</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-2">
                            <Label>Zona Horaria</Label>
                            <Select 
                              value={appConfig.timezone} 
                              onValueChange={(value) => setAppConfig(prev => ({ ...prev, timezone: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {timezoneOptions.map(tz => (
                                  <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Las fechas y horas se mostrarán según esta zona horaria
                            </p>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid gap-2">
                            <Label>Texto del Footer</Label>
                            <Textarea
                              value={appConfig.footerText}
                              onChange={(e) => setAppConfig(prev => ({ ...prev, footerText: e.target.value }))}
                              placeholder="Texto que aparecerá en el footer de la aplicación"
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              Este texto se mostrará en la parte inferior de todas las páginas
                            </p>
                          </div>
                          
                          <div className="pt-4">
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
                              onClick={handleSaveAppConfig}
                              disabled={savingAppConfig}
                            >
                              {savingAppConfig ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4 mr-2" />
                                  Guardar Configuración Global
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              // USER VIEWS
              <motion.div
                key="user"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* User Agenda */}
                {activeTab === 'agenda' && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Agenda del Evento</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Todas las actividades programadas</p>
                      </div>
                      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                        {/* Search */}
                        <div className="relative w-full sm:w-auto">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar actividades..."
                            className="pl-10 w-full sm:w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        {/* Type Filter */}
                        <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                          <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="KEYNOTE">Conferencias</SelectItem>
                            <SelectItem value="WORKSHOP">Talleres</SelectItem>
                            <SelectItem value="PANEL">Paneles</SelectItem>
                            <SelectItem value="PRESENTATION">Presentaciones</SelectItem>
                            <SelectItem value="NETWORKING">Networking</SelectItem>
                            <SelectItem value="BREAK">Descansos</SelectItem>
                            <SelectItem value="OTHER">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Status Filter */}
                        <Select value={activityStatusFilter} onValueChange={setActivityStatusFilter}>
                          <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="registered">Registrados</SelectItem>
                            <SelectItem value="not_registered">No registrados</SelectItem>
                            <SelectItem value="completed">Completados</SelectItem>
                            <SelectItem value="SCHEDULED">Programados</SelectItem>
                            <SelectItem value="IN_PROGRESS">En curso</SelectItem>
                            <SelectItem value="COMPLETED">Finalizados</SelectItem>
                            <SelectItem value="CANCELLED">Cancelados</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Date Filter */}
                        <Select value={activityDateFilter} onValueChange={setActivityDateFilter}>
                          <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Fecha" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las fechas</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="tomorrow">Mañana</SelectItem>
                            <SelectItem value="this_week">Esta semana</SelectItem>
                          </SelectContent>
                        </Select>
                        {/* Clear Filters */}
                        {(activityTypeFilter !== 'all' || activityStatusFilter !== 'all' || activityDateFilter !== 'all' || searchQuery) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => {
                              setActivityTypeFilter('all');
                              setActivityStatusFilter('all');
                              setActivityDateFilter('all');
                              setSearchQuery('');
                            }}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Limpiar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Filter Summary */}
                    {(activityTypeFilter !== 'all' || activityStatusFilter !== 'all' || activityDateFilter !== 'all' || searchQuery) && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Filter className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>
                          Mostrando {getFilteredActivities().length} de {activities.length} actividades
                        </span>
                      </div>
                    )}

                    {/* Today's Schedule */}
                    <div className="space-y-3 md:space-y-4">
                      <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                        Actividades del Evento
                      </h2>
                      <div className="grid gap-3 md:gap-4">
                        {getFilteredActivities().length === 0 ? (
                          <Card>
                            <CardContent className="pt-6 text-center text-muted-foreground">
                              <Presentation className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
                              <p className="text-sm md:text-base">No hay actividades con los filtros seleccionados</p>
                              <p className="text-xs md:text-sm">Intenta cambiar los filtros de búsqueda</p>
                            </CardContent>
                          </Card>
                        ) : (
                          getFilteredActivities().map((activity) => {
                            const isRegistered = userRegistrations[activity.id]?.registered;
                            const attendance = userAttendance[activity.id];
                            const isCheckedIn = attendance?.checkedIn;
                            const isCheckedOut = attendance?.checkedOut;
                            const isComplete = isCheckedIn && isCheckedOut;
                            
                            return (
                              <Card key={activity.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                <div className="flex">
                                  <div className={cn("w-1.5 md:w-2 flex-shrink-0", getActivityTypeColor(activity.type))} />
                                  <CardContent className="flex-1 p-3 md:p-4">
                                    {/* Mobile Layout */}
                                    <div className="sm:hidden space-y-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-1">
                                          {(() => {
                                            const dynamicStatus = getActivityDynamicStatus(activity);
                                            const statusInfo = getDynamicStatusInfo(dynamicStatus);
                                            return (
                                              <Badge className={cn("text-[10px] px-1.5 py-0", statusInfo.color)}>
                                                {statusInfo.label}
                                              </Badge>
                                            );
                                          })()}
                                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getTypeLabel(activity.type)}</Badge>
                                          {getActivityDynamicStatus(activity) === 'EN_CURSO' && (
                                            <Badge className="bg-red-500 animate-pulse text-[10px] px-1.5 py-0">EN VIVO</Badge>
                                          )}
                                          {isRegistered && !isComplete && (
                                            <Badge className="bg-blue-500 text-[10px] px-1.5 py-0">Registrado</Badge>
                                          )}
                                          {isComplete && (
                                            <Badge className="bg-green-500 text-[10px] px-1.5 py-0">✓ Completa</Badge>
                                          )}
                                        </div>
                                      </div>
                                      <h3 className="text-sm font-bold leading-tight">{activity.title}</h3>
                                      <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>
                                      {/* Expositor */}
                                      {(activity.expositorName || activity.speaker?.name) && (
                                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                          <User className="w-3 h-3" />
                                          <span className="font-medium">{activity.expositorName || activity.speaker?.name}</span>
                                        </div>
                                      )}
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatTimeWithTimezone(activity.startTime)} - {formatTimeWithTimezone(activity.endTime)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          <span className="truncate max-w-[100px]">{activity.room?.name || 'Sin sala'}</span>
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Users className="w-3 h-3" />
                                          {activity.currentAttendance}
                                        </span>
                                      </div>
                                      {/* Mobile Action Buttons */}
                                      <div className="flex flex-wrap gap-2 pt-1">
                                        <Button 
                                          variant={userReminders[activity.id]?.set ? "default" : "outline"}
                                          size="sm" 
                                          className="h-7 text-xs px-2 gap-1"
                                          onClick={() => handleSetReminder(activity)}
                                        >
                                          <Bell className="w-3 h-3" />
                                          <span className="hidden xs:inline">Recordatorio</span>
                                          <span className="xs:hidden">🔔</span>
                                        </Button>
                                        
                                        {!isRegistered && !isCheckedIn && (
                                          <Button 
                                            variant="outline"
                                            size="sm" 
                                            className="h-7 text-xs px-2 gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                            onClick={() => handleRegisterForActivity(activity)}
                                            disabled={registeringActivity === activity.id}
                                          >
                                            {registeringActivity === activity.id ? (
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <>
                                                <Plus className="w-3 h-3" />
                                                Registrarse
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isRegistered && !isCheckedIn && (
                                          <Button 
                                            variant="default"
                                            size="sm" 
                                            className="h-7 text-xs px-2 gap-1 bg-blue-500 hover:bg-blue-600"
                                            onClick={() => handleCheckIn(activity)}
                                            disabled={checkingIn === activity.id}
                                          >
                                            {checkingIn === activity.id ? (
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-3 h-3" />
                                                Check-in
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isCheckedIn && !isCheckedOut && (
                                          <Button 
                                            variant="default"
                                            size="sm" 
                                            className="h-7 text-xs px-2 gap-1 bg-amber-500 hover:bg-amber-600"
                                            onClick={() => handleCheckOut(activity)}
                                            disabled={checkingOut === activity.id}
                                          >
                                            {checkingOut === activity.id ? (
                                              <RefreshCw className="w-3 h-3 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-3 h-3" />
                                                Check-out
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isComplete && (
                                          <div className="flex items-center gap-1 text-xs text-green-600 font-medium px-2 py-1 bg-green-50 rounded">
                                            <Trophy className="w-3 h-3" />
                                            ¡Completado!
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Desktop Layout */}
                                    <div className="hidden sm:flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                          {(() => {
                                            const dynamicStatus = getActivityDynamicStatus(activity);
                                            const statusInfo = getDynamicStatusInfo(dynamicStatus);
                                            return (
                                              <Badge className={statusInfo.color}>
                                                {statusInfo.label}
                                              </Badge>
                                            );
                                          })()}
                                          <Badge variant="outline">{getTypeLabel(activity.type)}</Badge>
                                          {getActivityDynamicStatus(activity) === 'EN_CURSO' && (
                                            <Badge className="bg-red-500 animate-pulse">EN VIVO</Badge>
                                          )}
                                          {isRegistered && !isComplete && (
                                            <Badge className="bg-blue-500">Registrado</Badge>
                                          )}
                                          {isComplete && (
                                            <Badge className="bg-green-500">✓ Asistencia Completa</Badge>
                                          )}
                                        </div>
                                        <h3 className="text-lg font-bold mb-1">{activity.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                                        {/* Expositor */}
                                        {(activity.expositorName || activity.speaker?.name) && (
                                          <div className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">Expositor: {activity.expositorName || activity.speaker?.name}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-sm flex-wrap">
                                          <span className="flex items-center gap-1 text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            {formatTimeWithTimezone(activity.startTime)} - {formatTimeWithTimezone(activity.endTime)}
                                          </span>
                                          <span className="flex items-center gap-1 text-muted-foreground">
                                            <MapPin className="w-4 h-4" />
                                            {activity.room?.name || 'Sin sala asignada'}
                                          </span>
                                          <span className="flex items-center gap-1 text-muted-foreground">
                                            <Users className="w-4 h-4" />
                                            {activity.currentAttendance} asistentes
                                          </span>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2 min-w-[140px]">
                                        <Button 
                                          variant={userReminders[activity.id]?.set ? "default" : "outline"}
                                          size="sm" 
                                          className="gap-1"
                                          onClick={() => handleSetReminder(activity)}
                                        >
                                          <Bell className="w-4 h-4" />
                                          Recordatorio
                                        </Button>
                                        
                                        {/* Status-based buttons */}
                                        {!isRegistered && !isCheckedIn && (
                                          <Button 
                                            variant="outline"
                                            size="sm" 
                                            className="gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                            onClick={() => handleRegisterForActivity(activity)}
                                            disabled={registeringActivity === activity.id}
                                          >
                                            {registeringActivity === activity.id ? (
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <>
                                                <Plus className="w-4 h-4" />
                                                Registrarse (+5 pts)
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isRegistered && !isCheckedIn && (
                                          <Button 
                                            variant="default"
                                            size="sm" 
                                            className="gap-1 bg-blue-500 hover:bg-blue-600"
                                            onClick={() => handleCheckIn(activity)}
                                            disabled={checkingIn === activity.id}
                                          >
                                            {checkingIn === activity.id ? (
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-4 h-4" />
                                                Check-in (+10 pts)
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isCheckedIn && !isCheckedOut && (
                                          <Button 
                                            variant="default"
                                            size="sm" 
                                            className="gap-1 bg-amber-500 hover:bg-amber-600"
                                            onClick={() => handleCheckOut(activity)}
                                            disabled={checkingOut === activity.id}
                                          >
                                            {checkingOut === activity.id ? (
                                              <RefreshCw className="w-4 h-4 animate-spin" />
                                            ) : (
                                              <>
                                                <Check className="w-4 h-4" />
                                                Check-out (+15 pts)
                                              </>
                                            )}
                                          </Button>
                                        )}
                                        
                                        {isComplete && (
                                          <div className="flex items-center justify-center gap-1 text-sm text-green-600 font-medium p-2 bg-green-50 rounded-md">
                                            <Trophy className="w-4 h-4" />
                                            ¡Completado!
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </div>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Reminder Dialog */}
                    <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Configurar Recordatorio
                          </DialogTitle>
                          <DialogDescription>
                            {selectedActivityForAction && (
                              <span>Recibirás una notificación antes de: <strong>{selectedActivityForAction.title}</strong></span>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label>¿Cuántos minutos antes quieres ser notificado?</Label>
                            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutos antes</SelectItem>
                                <SelectItem value="10">10 minutos antes</SelectItem>
                                <SelectItem value="15">15 minutos antes</SelectItem>
                                <SelectItem value="30">30 minutos antes</SelectItem>
                                <SelectItem value="60">1 hora antes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Alert>
                            <Sparkles className="w-4 h-4" />
                            <AlertTitle>Notificaciones</AlertTitle>
                            <AlertDescription className="flex items-center justify-between gap-2">
                              <span>Activa las notificaciones del navegador para recibir alertas</span>
                              <Button 
                                type="button"
                                variant="outline" 
                                size="sm" 
                                onClick={requestNotificationPermission}
                              >
                                Activar
                              </Button>
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setReminderDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleConfirmReminder}
                            disabled={settingReminder}
                          >
                            {settingReminder ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              'Guardar Recordatorio'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Register Attendance Dialog */}
                    <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <QrCode className="w-5 h-5" />
                            Registrar Asistencia
                          </DialogTitle>
                          <DialogDescription>
                            {selectedActivityForAction && (
                              <span>Confirma tu asistencia a: <strong>{selectedActivityForAction.title}</strong></span>
                            )}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {selectedActivityForAction && (
                            <Card>
                              <CardContent className="pt-6">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(selectedActivityForAction.status)}>
                                      {selectedActivityForAction.status === 'SCHEDULED' ? 'Próximo' : 
                                       selectedActivityForAction.status === 'IN_PROGRESS' ? 'En curso' : 'Finalizado'}
                                    </Badge>
                                    <Badge variant="outline">{getTypeLabel(selectedActivityForAction.type)}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {formatTime(selectedActivityForAction.startTime)} - {formatTime(selectedActivityForAction.endTime)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-4 h-4" />
                                      {selectedActivityForAction.room?.name}
                                    </span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                          <Alert className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                            <Gift className="w-4 h-4 text-emerald-600" />
                            <AlertTitle>¡Gana puntos!</AlertTitle>
                            <AlertDescription>
                              Al registrar tu asistencia ganarás <strong>+10 puntos</strong> y podrás obtener certificados de participación.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setRegisterDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                            onClick={handleConfirmAttendance}
                            disabled={registeringAttendance}
                          >
                            {registeringAttendance ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Registrando...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Confirmar Asistencia
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Map View */}
                {activeTab === 'map' && (
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Mapa del Evento</h1>
                        <p className="text-sm md:text-base text-muted-foreground">Ubica las salas y actividades</p>
                      </div>
                    </div>

                    {/* Interactive Map Placeholder */}
                    <Card className="overflow-hidden">
                      <div className="relative h-[280px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-800 dark:to-gray-900">
                        {/* Map Grid - Responsive grid layout */}
                        <div 
                          className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-3 md:p-4 transition-transform duration-300 origin-center overflow-hidden"
                          style={{ transform: `scale(${mapZoom})` }}
                        >
                          {rooms.map((room, i) => (
                            <motion.div
                              key={room.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => handleRoomClick(room)}
                              className={cn(
                                "relative rounded-lg p-2 sm:p-3 cursor-pointer hover:shadow-lg transition-all min-h-[80px] sm:min-h-[100px] md:min-h-[120px]",
                                selectedRoom?.id === room.id && "ring-2 sm:ring-4 ring-white ring-opacity-80"
                              )}
                              style={{ backgroundColor: room.color || '#3B82F6' }}
                            >
                              <div className="absolute inset-0 bg-white/20 rounded-lg hover:bg-white/30 transition-colors" />
                              <div className="relative">
                                <Building className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white mb-1 sm:mb-2" />
                                <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-tight">{room.name}</p>
                                <p className="text-white/80 text-[10px] sm:text-xs mt-0.5 sm:mt-1 hidden sm:block">Cap: {room.capacity}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* My Location Indicator */}
                        {showMyLocation && myLocation && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="relative"
                            >
                              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                              <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-ping opacity-50" />
                            </motion.div>
                          </div>
                        )}

                        {/* Legend - Responsive positioning and sizing */}
                        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg z-10 max-w-[140px] sm:max-w-[180px]">
                          <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2">Leyenda</p>
                          <div className="grid gap-0.5 sm:gap-1 text-[10px] sm:text-xs">
                            {rooms.slice(0, 4).map((room, i) => (
                              <button 
                                key={i} 
                                className="flex items-center gap-1.5 sm:gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-1 py-0.5 rounded text-left w-full"
                                onClick={() => handleRoomClick(room)}
                              >
                                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded shrink-0" style={{ backgroundColor: room.color || '#3B82F6' }} />
                                <span className="truncate">{room.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Zoom Controls - Responsive sizing and positioning */}
                        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col gap-1.5 sm:gap-2 z-10">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={handleZoomIn}
                            disabled={mapZoom >= 2}
                            title="Acercar"
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-8 w-8 sm:h-10 sm:w-10"
                            onClick={handleZoomOut}
                            disabled={mapZoom <= 0.5}
                            title="Alejar"
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className={cn("h-8 w-8 sm:h-10 sm:w-10", showMyLocation && "bg-blue-500 text-white hover:bg-blue-600")}
                            onClick={handleShowMyLocation}
                            title="Mi ubicación"
                          >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>

                    {/* Room List */}
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {rooms.map((room) => (
                        <Card 
                          key={room.id} 
                          className={cn(
                            "hover:shadow-lg transition-all cursor-pointer",
                            selectedRoom?.id === room.id && "ring-2 ring-emerald-500"
                          )}
                          onClick={() => handleRoomClick(room)}
                        >
                          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: room.color || '#3B82F6' }}>
                                <Building className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{room.name}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                  {room.building} - {room.floor} • Cap: {room.capacity}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Room Details Dialog */}
                    <Dialog open={roomDialogOpen} onOpenChange={setRoomDialogOpen}>
                      <DialogContent className="sm:max-w-md w-[95vw] max-w-[95vw] sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Building className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: selectedRoom?.color || '#3B82F6' }} />
                            <span className="truncate">{selectedRoom?.name}</span>
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Información de la sala
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <Card>
                              <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">Edificio</span>
                                </div>
                                <p className="font-semibold mt-1 text-sm sm:text-base truncate">{selectedRoom?.building || 'No especificado'}</p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                                  <span className="text-xs sm:text-sm text-muted-foreground">Piso</span>
                                </div>
                                <p className="font-semibold mt-1 text-sm sm:text-base">{selectedRoom?.floor || 'No especificado'}</p>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Card>
                            <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs sm:text-sm text-muted-foreground">Capacidad máxima</p>
                                  <p className="text-xl sm:text-2xl font-bold">{selectedRoom?.capacity} personas</p>
                                </div>
                                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Activities in this room */}
                          <div>
                            <h4 className="text-xs sm:text-sm font-medium mb-2">Actividades en esta sala</h4>
                            <ScrollArea className="max-h-32 sm:max-h-40">
                              <div className="space-y-1.5 sm:space-y-2">
                                {activities
                                  .filter(a => a.room?.id === selectedRoom?.id)
                                  .slice(0, 3)
                                  .map((activity) => (
                                    <div 
                                      key={activity.id}
                                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                                    >
                                      <div className={cn("w-2 h-2 rounded-full shrink-0", getActivityTypeColor(activity.type))} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                                          {formatTime(activity.startTime)} - {formatTime(activity.endTime)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                {activities.filter(a => a.room?.id === selectedRoom?.id).length === 0 && (
                                  <p className="text-xs sm:text-sm text-muted-foreground text-center py-2">
                                    No hay actividades programadas
                                  </p>
                                )}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto text-sm"
                            onClick={() => selectedRoom && openExternalMap(selectedRoom)}
                          >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Ver en Google Maps
                          </Button>
                          <Button 
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-sm"
                            onClick={() => selectedRoom && handleGetDirections(selectedRoom)}
                          >
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Cómo llegar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Room Location Dialog */}
                    <Dialog open={roomLocationDialogOpen} onOpenChange={setRoomLocationDialogOpen}>
                      <DialogContent className="sm:max-w-lg w-[95vw] max-w-[95vw] sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                            <span className="truncate">Cómo llegar a {selectedRoom?.name}</span>
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Direcciones y ubicación de referencia
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 sm:space-y-4">
                          {/* Reference Map Image */}
                          <div className="relative h-36 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center">
                                <MapPin className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-500 mx-auto mb-1 sm:mb-2" />
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {selectedRoom?.building} - {selectedRoom?.floor}
                                </p>
                              </div>
                            </div>
                            {/* Location marker */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative"
                              >
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white shadow-lg" 
                                  style={{ backgroundColor: selectedRoom?.color || '#3B82F6' }}>
                                  <Building className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Directions */}
                          <div className="space-y-2 sm:space-y-3">
                            <h4 className="text-xs sm:text-sm font-medium">Instrucciones para llegar:</h4>
                            <div className="space-y-1.5 sm:space-y-2">
                              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">1</div>
                                <p className="text-xs sm:text-sm">Dirígete al <strong>{selectedRoom?.building}</strong></p>
                              </div>
                              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">2</div>
                                <p className="text-xs sm:text-sm">Ubica el acceso a <strong>{selectedRoom?.floor}</strong></p>
                              </div>
                              <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">3</div>
                                <p className="text-xs sm:text-sm">Busca la sala <strong>{selectedRoom?.name}</strong></p>
                              </div>
                            </div>
                          </div>

                          {/* Quick info */}
                          <Alert className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
                            <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                            <AlertTitle className="text-sm">Información adicional</AlertTitle>
                            <AlertDescription className="text-xs sm:text-sm">
                              Capacidad: {selectedRoom?.capacity} personas
                            </AlertDescription>
                          </Alert>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full sm:w-auto text-sm"
                            onClick={() => setRoomLocationDialogOpen(false)}
                          >
                            Cerrar
                          </Button>
                          <Button 
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-sm"
                            onClick={() => selectedRoom && openExternalMap(selectedRoom)}
                          >
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                            Abrir en Google Maps
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Projects View */}
                {activeTab === 'projects-view' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Proyectos Participantes</h1>
                        <p className="text-muted-foreground">Descubre y vota por los mejores proyectos</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {/* Votes remaining indicator */}
                        {user && user.role === 'PARTICIPANT' && (
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg",
                            votingConfig.isActive 
                              ? "bg-emerald-100 dark:bg-emerald-900/30" 
                              : "bg-red-100 dark:bg-red-900/30"
                          )}>
                            <Vote className={cn(
                              "w-5 h-5",
                              votingConfig.isActive ? "text-emerald-600" : "text-red-600"
                            )} />
                            <span className={cn(
                              "font-medium",
                              votingConfig.isActive 
                                ? "text-emerald-700 dark:text-emerald-300" 
                                : "text-red-700 dark:text-red-300"
                            )}>
                              {votingConfig.isActive 
                                ? `${votesRemaining} votos restantes de ${votingConfig.maxVotesPerUser}`
                                : "Votación desactivada"
                              }
                            </span>
                          </div>
                        )}
                        <Select value={projectAreaFilter} onValueChange={setProjectAreaFilter}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Área" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas las áreas</SelectItem>
                            {areaOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Voting status alert */}
                    {user && user.role === 'PARTICIPANT' && !votingConfig.isActive && (
                      <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <AlertTitle>Votación pausada</AlertTitle>
                        <AlertDescription>
                          La votación ha sido temporalmente desactivada por el administrador. Por favor espera a que se reactive.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* My votes section */}
                    {user && user.role === 'PARTICIPANT' && userVotes.length > 0 && (
                      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                            Mis Votos ({userVotes.length}/{votingConfig.maxVotesPerUser})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {userVotes.map((votedProject) => (
                              <Badge key={votedProject.id} variant="secondary" className="py-1 px-3">
                                {votedProject.name}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {projects
                        .filter(p => p.status === 'APPROVED' || p.status === 'FINALIST' || p.status === 'WINNER')
                        .filter(p => projectAreaFilter === 'all' || p.area === projectAreaFilter)
                        .map((project) => {
                        const hasVoted = userVotes.some(v => v.id === project.id);
                        const isVoting = votingProjectId === project.id;
                        
                        return (
                          <Card key={project.id} className="hover:shadow-xl transition-all hover:-translate-y-1 overflow-hidden">
                            {project.image && (
                              <div className="h-40 w-full overflow-hidden">
                                <img 
                                  src={project.image} 
                                  alt={project.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <CardHeader className="pb-2">
                              {/* Nombre del proyecto */}
                              <div className="flex items-start gap-3">
                                {project.rank && project.rank <= 3 && (
                                  <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0",
                                    project.rank === 1 ? "bg-amber-500" : project.rank === 2 ? "bg-gray-400" : "bg-amber-700"
                                  )}>
                                    {project.rank}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-2">
                              {/* Equipo */}
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Equipo:</span>
                                <span className="font-medium">{project.team || 'No especificado'}</span>
                              </div>
                              
                              {/* Área */}
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Área:</span>
                                {project.area ? (
                                  <Badge variant="outline" className="text-xs">
                                    {areaOptions.find(a => a.value === project.area)?.label || project.area}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground italic">No especificada</span>
                                )}
                              </div>
                              
                              {/* Categoría */}
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Award className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Categoría:</span>
                                {project.projectCategory ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {projectCategoryOptions.find(c => c.value === project.projectCategory)?.label || project.projectCategory}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground italic">No especificada</span>
                                )}
                              </div>
                              
                              {/* Descripción */}
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                              
                              <div className="flex items-center justify-between mb-4 pt-2 border-t">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-500" />
                                    <span className="font-bold">{project.averageScore?.toFixed(1) || '-'}</span>
                                  </div>
                                  <span className="text-sm text-muted-foreground">({project.totalVotes} votos)</span>
                                </div>
                              </div>
                              
                              {/* Vote button */}
                              {user && user.role === 'PARTICIPANT' ? (
                                hasVoted ? (
                                  <Button className="w-full" variant="outline" disabled>
                                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                                    Ya votaste
                                  </Button>
                                ) : (
                                  <Button 
                                    className={cn(
                                      "w-full",
                                      votingConfig.isActive 
                                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                    )}
                                    onClick={() => handleOpenVoteDialog(project)}
                                    disabled={isVoting || votesRemaining <= 0 || !votingConfig.isActive}
                                  >
                                    {isVoting ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Votando...
                                      </>
                                    ) : !votingConfig.isActive ? (
                                      <>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Votación desactivada
                                      </>
                                    ) : votesRemaining <= 0 ? (
                                      <>
                                        <X className="w-4 h-4 mr-2" />
                                        Sin votos disponibles
                                      </>
                                    ) : (
                                      <>
                                        <Vote className="w-4 h-4 mr-2" />
                                        {votingConfig.voteType === 'LIKE' 
                                          ? 'Votar por este proyecto'
                                          : votingConfig.voteType === 'STARS'
                                            ? 'Calificar proyecto'
                                            : 'Asignar puntos'
                                        }
                                      </>
                                    )}
                                  </Button>
                                )
                              ) : (
                                <Button className="w-full" variant="outline" disabled>
                                  <Vote className="w-4 h-4 mr-2" />
                                  Inicia sesión para votar
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                    
                    {projects.filter(p => p.status === 'APPROVED' || p.status === 'FINALIST' || p.status === 'WINNER').length === 0 && (
                      <div className="text-center py-12">
                        <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No hay proyectos disponibles</h3>
                        <p className="text-muted-foreground">Los proyectos aprobados aparecerán aquí</p>
                      </div>
                    )}
                  </div>
                )}

                {/* QR Scanner */}
                {activeTab === 'scanner' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Escáner QR</h1>
                        <p className="text-muted-foreground">Escanea códigos QR para registrar asistencia y ganar puntos</p>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Escáner
                          </CardTitle>
                          <CardDescription>
                            {scannerActive 
                              ? 'Apunta el código QR dentro del marco' 
                              : 'Activa la cámara o sube una imagen con QR'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {/* Camera / Scanner View */}
                          <div className="aspect-square bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                            {scannerActive ? (
                              <>
                                {/* QR Scanner with camera */}
                                <div id="qr-reader" className="w-full h-full [&>div]:h-full" />
                                
                                {/* Scanning overlay */}
                                <div className="absolute inset-4 border-2 border-white/50 rounded-lg pointer-events-none">
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                                </div>
                                
                                {scanning && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <RefreshCw className="w-12 h-12 text-white animate-spin" />
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {/* Placeholder when camera is off */}
                                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
                                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
                                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
                                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />
                                </div>
                                <div className="text-white text-center z-10">
                                  <QrCode className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                  <p className="text-sm opacity-75">Activa la cámara o sube una imagen</p>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Action buttons */}
                          <div className="mt-4 flex gap-2">
                            {scannerActive ? (
                              <Button 
                                variant="destructive"
                                className="flex-1"
                                onClick={handleDeactivateScanner}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Desactivar Cámara
                              </Button>
                            ) : (
                              <Button 
                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600"
                                onClick={handleActivateScanner}
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Activar Cámara
                              </Button>
                            )}
                            <Button 
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={scanning}
                            >
                              {scanning ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              Subir Imagen
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </div>
                          
                          {/* Manual code entry */}
                          <div className="mt-4">
                            <Label>O ingresa el código manualmente</Label>
                            <div className="flex gap-2 mt-2">
                              <Input 
                                placeholder="Ej: ABCD1234"
                                id="manual-qr-code"
                                className="flex-1 uppercase"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const input = e.target as HTMLInputElement;
                                    handleManualCodeEntry(input.value);
                                  }
                                }}
                              />
                              <Button 
                                variant="secondary"
                                onClick={() => {
                                  const input = document.getElementById('manual-qr-code') as HTMLInputElement;
                                  handleManualCodeEntry(input?.value || '');
                                }}
                                disabled={scanning}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-4">
                        {/* Scan Result */}
                        {scanResult && (
                          <Card className={scanResult.error ? "border-red-500" : "border-emerald-500"}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                {scanResult.error ? (
                                  <X className="w-5 h-5 text-red-500" />
                                ) : (
                                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                                )}
                                Resultado del Escaneo
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {scanResult.error ? (
                                <p className="text-red-500">{scanResult.message}</p>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                      {scanResult.type === 'ACTIVITY' && <Presentation className="w-6 h-6" />}
                                      {scanResult.type === 'PROJECT' && <Lightbulb className="w-6 h-6" />}
                                      {scanResult.type === 'ROOM' && <Building className="w-6 h-6" />}
                                      {scanResult.type === 'USER' && <User className="w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-bold text-lg">
                                        {scanResult.activity?.title || 
                                         scanResult.project?.title || 
                                         scanResult.room?.name || 
                                         scanResult.user?.name || 'QR Escaneado'}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {scanResult.type === 'ACTIVITY' && 'Actividad'}
                                        {scanResult.type === 'PROJECT' && 'Proyecto'}
                                        {scanResult.type === 'ROOM' && 'Sala'}
                                        {scanResult.type === 'USER' && 'Usuario'}
                                        {scanResult.attendanceComplete && ' • Asistencia Completa ✓'}
                                      </p>
                                    </div>
                                    {scanResult.pointsEarned > 0 && (
                                      <Badge className="bg-emerald-500 text-lg px-3 py-1">
                                        +{scanResult.pointsEarned} pts
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {scanResult.activityDetails && (
                                    <div className="text-sm text-muted-foreground space-y-1">
                                      {scanResult.activityDetails.room && (
                                        <p>📍 {scanResult.activityDetails.room.name}</p>
                                      )}
                                      <p>🎯 {scanResult.completeAttendances}/3 asistencias para certificado</p>
                                    </div>
                                  )}
                                  
                                  {scanResult.canGenerateCertificate && (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                      <p className="text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
                                        <Award className="w-4 h-4" />
                                        ¡Ya puedes generar tu certificado!
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Recent Scans */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Últimos Escaneos</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {recentScans.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No hay escaneos recientes</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {recentScans.map((scan, i) => (
                                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                      <Check className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{scan.name}</p>
                                      <p className="text-xs text-muted-foreground">{scan.type} • {scan.time}</p>
                                    </div>
                                    {scan.points > 0 && (
                                      <Badge className="bg-emerald-500">+{scan.points} pts</Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Points Summary */}
                        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Zap className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="text-sm opacity-90">Puntos ganados hoy</p>
                                <p className="text-3xl font-bold">+{totalPointsToday}</p>
                              </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/20">
                              <div className="flex justify-between text-sm">
                                <span className="opacity-90">Total acumulado</span>
                                <span className="font-bold">{user?.points || 0} pts</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ranking */}
                {activeTab === 'ranking' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Ranking de Participantes</h1>
                        <p className="text-muted-foreground">Los participantes más activos del evento</p>
                      </div>
                    </div>

                    {/* Top 3 */}
                    <div className="grid gap-4 md:grid-cols-3">
                      {mockLeaderboard.slice(0, 3).map((entry, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <Card className={cn(
                            "relative overflow-hidden",
                            i === 0 && "ring-2 ring-amber-400"
                          )}>
                            <div className={cn(
                              "absolute top-0 left-0 right-0 h-2",
                              i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : "bg-amber-700"
                            )} />
                            <CardContent className="pt-8 text-center">
                              <div className="relative inline-block">
                                <Avatar className="w-20 h-20 mx-auto mb-4">
                                  <AvatarFallback className="text-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                                    {getInitials(entry.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm",
                                  i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : "bg-amber-700"
                                )}>
                                  {entry.rank}
                                </div>
                              </div>
                              <h3 className="font-bold text-lg">{entry.name}</h3>
                              <p className="text-sm text-muted-foreground">Nivel {entry.level}</p>
                              <div className="mt-4 flex items-center justify-center gap-2">
                                <Trophy className="w-5 h-5 text-emerald-500" />
                                <span className="text-2xl font-bold text-emerald-500">{entry.points.toLocaleString()}</span>
                                <span className="text-muted-foreground">pts</span>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Full Leaderboard */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Clasificación Completa</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {mockLeaderboard.map((entry, i) => (
                            <div
                              key={i}
                              className={cn(
                                "flex items-center gap-4 p-3 rounded-lg",
                                entry.name === user?.name && "bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                                i === 0 ? "bg-amber-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-gray-300 dark:bg-gray-600"
                              )}>
                                {entry.rank}
                              </div>
                              <Avatar>
                                <AvatarFallback>{getInitials(entry.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">
                                  {entry.name}
                                  {entry.name === user?.name && <span className="ml-2 text-xs text-emerald-500">(Tú)</span>}
                                </p>
                                <p className="text-xs text-muted-foreground">Nivel {entry.level}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-emerald-500">{entry.points.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">puntos</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Achievements */}
                {activeTab === 'achievements' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold">Logros y Medallas</h1>
                        <p className="text-muted-foreground">Tu progreso en el evento</p>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="grid gap-4 md:grid-cols-4">
                      <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Zap className="w-8 h-8" />
                            <div>
                              <p className="text-sm opacity-90">Puntos Totales</p>
                              <p className="text-3xl font-bold">{achievementStats.points || user?.points || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Target className="w-8 h-8 text-blue-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Nivel Actual</p>
                              <p className="text-3xl font-bold">{achievementStats.level || user?.level || 1}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Calendar className="w-8 h-8 text-purple-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Actividades</p>
                              <p className="text-3xl font-bold">{achievementStats.attendanceCount || 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-4">
                            <Award className="w-8 h-8 text-amber-500" />
                            <div>
                              <p className="text-sm text-muted-foreground">Medallas</p>
                              <p className="text-3xl font-bold">{earnedAchievements.length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Level Progress */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Progreso al Siguiente Nivel</CardTitle>
                        <CardDescription>Nivel {achievementStats.level || user?.level || 1} → Nivel {(achievementStats.level || user?.level || 1) + 1}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Progress
                          value={((achievementStats.points || user?.points || 0) % 100)}
                          className="h-3"
                        />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>{achievementStats.points || user?.points || 0} puntos</span>
                          <span>{((achievementStats.level || user?.level || 1) + 1) * 100} puntos necesarios</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Certificate Section */}
                    <Card className="border-2 border-dashed">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-emerald-500" />
                          Certificado de Participación
                        </CardTitle>
                        <CardDescription>
                          Genera y descarga tu certificado de participación al evento
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {certificates.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-500">
                              <Check className="w-5 h-5" />
                              <span className="font-medium">¡Ya tienes tu certificado generado!</span>
                            </div>
                            {certificates.map((cert: any) => (
                              <Card key={cert.id} className="bg-emerald-50 dark:bg-emerald-950/30">
                                <CardContent className="pt-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                      <p className="font-semibold">{cert.title}</p>
                                      <p className="text-sm text-muted-foreground">
                                        Código de verificación: {cert.code}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        Emitido: {new Date(cert.issueDate).toLocaleDateString('es-ES', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => {
                                          window.open(`/api/certificates/download?certificateId=${cert.id}`, '_blank');
                                        }}
                                      >
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar PDF
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg",
                                attendanceCount >= 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              )}>
                                {attendanceCount >= 3 ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Clock className="w-5 h-5" />
                                )}
                                <span>{attendanceCount}/3 asistencias completas</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Necesitas registrar tu entrada y salida en al menos 3 actividades para generar tu certificado.
                            </p>
                            <Button
                              className="bg-gradient-to-r from-emerald-500 to-teal-600"
                              disabled={attendanceCount < 3 || generatingCertificate}
                              onClick={async () => {
                                setGeneratingCertificate(true);
                                try {
                                  const activeEvent = eventsList.find(e => e.isActive) || eventsList[0];
                                  const res = await fetch('/api/certificates', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      type: 'attendance',
                                      eventId: activeEvent?.id,
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    toast.success('¡Certificado generado exitosamente!');
                                    // Reload certificates
                                    const certRes = await fetch('/api/certificates');
                                    if (certRes.ok) {
                                      const certData = await certRes.json();
                                      if (certData.success) {
                                        setCertificates(certData.data || []);
                                      }
                                    }
                                  } else {
                                    toast.error(data.error || 'Error al generar certificado');
                                  }
                                } catch (error) {
                                  toast.error('Error de conexión');
                                }
                                setGeneratingCertificate(false);
                              }}
                            >
                              {generatingCertificate ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <FileText className="w-4 h-4 mr-2" />
                              )}
                              Generar Certificado
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Earned Achievements Grid */}
                    {earnedAchievements.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Logros Obtenidos</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {earnedAchievements.map((achievement: any, i: number) => (
                            <motion.div
                              key={achievement.id || i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-amber-400 to-yellow-500">
                                      <Medal className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{achievement.achievement?.name || achievement.name}</h3>
                                        <Check className="w-4 h-4 text-emerald-500" />
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {achievement.achievement?.description || achievement.description}
                                      </p>
                                      {achievement.achievement?.points > 0 && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                          +{achievement.achievement?.points || achievement.points} puntos
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Achievements Grid */}
                    {availableAchievements.length > 0 && (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Logros Disponibles</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {availableAchievements.map((achievement: any, i: number) => (
                            <motion.div
                              key={achievement.id || i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                            >
                              <Card className="hover:shadow-lg transition-shadow opacity-70">
                                <CardContent className="pt-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                                      <Lock className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-semibold">{achievement.name}</h3>
                                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                                      {achievement.points > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          +{achievement.points} puntos al desbloquear
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback: Show default achievements if no data from API */}
                    {earnedAchievements.length === 0 && availableAchievements.length === 0 && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[
                          { name: 'Primera Asistencia', desc: 'Asiste a tu primera actividad', icon: Calendar, unlocked: attendanceCount >= 1, color: attendanceCount >= 1 ? 'bg-emerald-500' : 'bg-gray-400' },
                          { name: 'Participante Activo', desc: 'Asiste a 3 actividades', icon: Activity, unlocked: attendanceCount >= 3, color: attendanceCount >= 3 ? 'bg-blue-500' : 'bg-gray-400' },
                          { name: 'Votante', desc: 'Vota por un proyecto', icon: Vote, unlocked: achievementStats.voteCount >= 1, color: achievementStats.voteCount >= 1 ? 'bg-purple-500' : 'bg-gray-400' },
                          { name: 'Explorador', desc: 'Escanea 5 códigos QR', icon: QrCode, unlocked: false, color: 'bg-gray-400' },
                          { name: 'Top 10', desc: 'Entra al top 10 del ranking', icon: Trophy, unlocked: false, color: 'bg-gray-400' },
                          { name: 'Maratonista', desc: 'Asiste a 10 actividades', icon: Medal, unlocked: attendanceCount >= 10, color: attendanceCount >= 10 ? 'bg-amber-500' : 'bg-gray-400' },
                        ].map((achievement, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <Card className={cn(
                              "hover:shadow-lg transition-shadow",
                              !achievement.unlocked && "opacity-60"
                            )}>
                              <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", achievement.color)}>
                                    <achievement.icon className="w-7 h-7 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold">{achievement.name}</h3>
                                      {achievement.unlocked && <Check className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Evaluation Module - For EVALUATOR, ADMIN, ORGANIZER roles */}
                {activeTab === 'evaluation' && (user?.role === 'EVALUATOR' || user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                          <Star className="w-7 h-7 text-amber-500" />
                          Evaluación de Proyectos
                        </h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                          {user?.role === 'EVALUATOR' 
                            ? 'Califica los proyectos de emprendimiento e innovación' 
                            : 'Gestiona asignaciones y evalúa proyectos'}
                        </p>
                      </div>
                    </div>

                    {/* Tabs for Admin/Organizer - Projects and Assignments */}
                    {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
                      <Tabs value={evaluationSubTab} onValueChange={(v) => setEvaluationSubTab(v as 'projects' | 'assignments')}>
                        <TabsList>
                          <TabsTrigger value="projects">Proyectos</TabsTrigger>
                          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}

                    {/* Projects Tab Content */}
                    {((user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && evaluationSubTab === 'projects') || user?.role === 'EVALUATOR' ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={evaluationFilter} 
                            onValueChange={(value: 'all' | 'pending' | 'completed') => setEvaluationFilter(value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Filtrar proyectos" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos los proyectos</SelectItem>
                              <SelectItem value="pending">Pendientes</SelectItem>
                              <SelectItem value="completed">Evaluados</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Evaluation Stats */}
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                            <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                              <div className="flex items-center gap-2 md:gap-4">
                                <Lightbulb className="w-6 h-6 md:w-8 md:h-8" />
                                <div>
                                  <p className="text-xs md:text-sm opacity-90">Total Proyectos</p>
                                  <p className="text-xl md:text-3xl font-bold">{projects.filter(p => p.status === 'APPROVED').length}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                              <div className="flex items-center gap-2 md:gap-4">
                                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                                <div>
                                  <p className="text-xs md:text-sm text-muted-foreground">Evaluados</p>
                                  <p className="text-xl md:text-3xl font-bold">{evaluations.filter(e => e.status === 'SUBMITTED').length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                          <div className="flex items-center gap-2 md:gap-4">
                            <Clock className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                            <div>
                              <p className="text-xs md:text-sm text-muted-foreground">Pendientes</p>
                              <p className="text-xl md:text-3xl font-bold">
                                {projects.filter(p => p.status === 'APPROVED').length - evaluations.filter(e => e.status === 'SUBMITTED').length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
                          <div className="flex items-center gap-2 md:gap-4">
                            <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                            <div>
                              <p className="text-xs md:text-sm text-muted-foreground">Borradores</p>
                              <p className="text-xl md:text-3xl font-bold">{evaluations.filter(e => e.status === 'DRAFT').length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Criteria Description Card */}
                    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base md:text-lg flex items-center gap-2">
                          <Target className="w-5 h-5 text-amber-500" />
                          Criterios de Evaluación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 text-sm">
                          {evaluationCriteria.map(c => (
                            <div key={c.key} className="flex items-start gap-2">
                              <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                              <div>
                                <span className="font-medium">{c.label}</span>
                                <p className="text-xs text-muted-foreground hidden md:block">{c.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Projects List for Evaluation */}
                    <div className="grid gap-4">
                      {loadingEvaluations ? (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <RefreshCw className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">Cargando proyectos...</p>
                          </CardContent>
                        </Card>
                      ) : getFilteredProjectsForEvaluation().length === 0 ? (
                        <Card>
                          <CardContent className="py-8 text-center">
                            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                            <p className="mt-2 text-muted-foreground">
                              {evaluationFilter === 'pending' 
                                ? 'No tienes proyectos pendientes de evaluación'
                                : evaluationFilter === 'completed'
                                ? 'No has evaluado ningún proyecto aún'
                                : 'No hay proyectos disponibles para evaluar'}
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        getFilteredProjectsForEvaluation().map((project) => {
                          const existingEvaluation = evaluations.find(e => e.projectId === project.id);
                          const isSubmitted = existingEvaluation?.status === 'SUBMITTED';
                          const progress = existingEvaluation ? getEvaluationProgress(existingEvaluation) : 0;
                          
                          return (
                            <motion.div
                              key={project.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <Card className={cn(
                                "hover:shadow-lg transition-all cursor-pointer",
                                isSubmitted && "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20"
                              )}>
                                <CardContent className="p-4 md:p-6">
                                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    {/* Project Image or Placeholder */}
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                      {project.image ? (
                                        <img src={project.image} alt={project.name} className="w-full h-full object-cover rounded-lg" />
                                      ) : (
                                        <Lightbulb className="w-8 h-8 text-white" />
                                      )}
                                    </div>

                                    {/* Project Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-lg font-bold truncate">{project.name}</h3>
                                            {isSubmitted && (
                                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                                                <Check className="w-3 h-3 mr-1" />
                                                Evaluado
                                              </Badge>
                                            )}
                                            {existingEvaluation?.status === 'DRAFT' && (
                                              <Badge variant="outline" className="border-amber-300 text-amber-700">
                                                <FileText className="w-3 h-3 mr-1" />
                                                Borrador
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-sm text-muted-foreground">Equipo: {project.team}</p>
                                        </div>
                                      </div>
                                      
                                      {project.description && (
                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description}</p>
                                      )}
                                      
                                      <div className="flex flex-wrap items-center gap-3 mt-3">
                                        {project.category && (
                                          <Badge variant="secondary">{project.category}</Badge>
                                        )}
                                        
                                        {/* Show evaluation score if submitted */}
                                        {isSubmitted && existingEvaluation && (
                                          <div className="flex items-center gap-2 text-sm">
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            <span className="font-medium">{existingEvaluation.totalScore.toFixed(0)}/100 pts</span>
                                          </div>
                                        )}
                                        
                                        {/* Show progress bar for drafts */}
                                        {existingEvaluation?.status === 'DRAFT' && (
                                          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                                            <Progress value={progress} className="h-2 flex-1" />
                                            <span className="text-xs text-muted-foreground">{progress}%</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Button */}
                                    <Button
                                      className={cn(
                                        "w-full md:w-auto",
                                        isSubmitted 
                                          ? "bg-emerald-500 hover:bg-emerald-600" 
                                          : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                                      )}
                                      onClick={() => handleOpenEvaluationDialog(project)}
                                    >
                                      {isSubmitted ? (
                                        <>
                                          <Eye className="w-4 h-4 mr-2" />
                                          Ver Evaluación
                                        </>
                                      ) : existingEvaluation?.status === 'DRAFT' ? (
                                        <>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Continuar
                                        </>
                                      ) : (
                                        <>
                                          <Star className="w-4 h-4 mr-2" />
                                          Evaluar
                                        </>
                                      )}
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                      </>
                    ) : null}

                    {/* Assignments Tab Content - Only for Admin/Organizer */}
                    {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && evaluationSubTab === 'assignments' && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                          <div className="flex-1">
                            <Input
                              placeholder="Buscar proyectos por nombre, equipo o categoría..."
                              value={assignmentSearchQuery}
                              onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                              className="max-w-md"
                            />
                          </div>
                          <Button
                            onClick={() => setAssignmentDialogOpen(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Asignación
                          </Button>
                        </div>

                        {evaluatorAssignments.length === 0 ? (
                          <Card>
                            <CardContent className="py-8 text-center">
                              <Award className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                              <p className="mt-2 text-muted-foreground">No hay asignaciones creadas</p>
                              <p className="text-sm text-muted-foreground">Crea una nueva asignación para comenzar</p>
                            </CardContent>
                          </Card>
                        ) : (
                          <div className="space-y-3">
                            {evaluatorAssignments.map((assignment) => (
                              <Card key={assignment.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-10 w-10">
                                        <AvatarFallback>
                                          {assignment.evaluator?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'EV'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="font-medium">{assignment.evaluator?.name || 'Evaluador'}</p>
                                        <p className="text-sm text-muted-foreground">
                                          Proyecto: {assignment.project?.name || 'Proyecto'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {assignment.completed ? (
                                        <Badge className="bg-emerald-500">Completado</Badge>
                                      ) : (
                                        <Badge variant="outline">Pendiente</Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteAssignment(assignment.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Profile Dialog */}
                <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mi Perfil</DialogTitle>
                      <DialogDescription>Información de tu cuenta</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl">
                            {user?.name ? getInitials(user.name) : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-lg">{user?.name}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <Badge className={getRoleColor(user?.role || 'PARTICIPANT')}>
                            {getRoleLabel(user?.role || 'PARTICIPANT')}
                          </Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{user?.points || 0}</p>
                          <p className="text-xs text-muted-foreground">Puntos</p>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-amber-600">{user?.level || 1}</p>
                          <p className="text-xs text-muted-foreground">Nivel</p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => {
                            setShowProfileDialog(false);
                            setShowChangePassword(true);
                          }}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          Cambiar Contraseña
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full justify-start"
                          onClick={() => {
                            setShowProfileDialog(false);
                            setShowDeleteAccountDialog(true);
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Eliminar Mi Cuenta
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setShowProfileDialog(false)}>Cerrar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Change Password Dialog */}
                <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cambiar Contraseña</DialogTitle>
                      <DialogDescription>Ingresa tu contraseña actual y la nueva</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-pwd">Contraseña Actual</Label>
                        <Input
                          id="current-pwd"
                          type="password"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-pwd">Nueva Contraseña</Label>
                        <Input
                          id="new-pwd"
                          type="password"
                          placeholder="Mínimo 6 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-pwd">Confirmar Contraseña</Label>
                        <Input
                          id="confirm-pwd"
                          type="password"
                          placeholder="Repite la nueva contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setShowChangePassword(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        disabled={savingProfile || !currentPassword || !newPassword || newPassword !== confirmPassword}
                        onClick={async () => {
                          if (newPassword !== confirmPassword) {
                            toast.error('Las contraseñas no coinciden');
                            return;
                          }
                          if (newPassword.length < 6) {
                            toast.error('La contraseña debe tener al menos 6 caracteres');
                            return;
                          }
                          setSavingProfile(true);
                          try {
                            const res = await fetch('/api/auth/change-password', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ currentPassword, newPassword }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success('Contraseña actualizada correctamente');
                              setShowChangePassword(false);
                              setCurrentPassword('');
                              setNewPassword('');
                              setConfirmPassword('');
                            } else {
                              toast.error(data.error || 'Error al cambiar contraseña');
                            }
                          } catch {
                            toast.error('Error de conexión');
                          }
                          setSavingProfile(false);
                        }}
                      >
                        {savingProfile ? 'Guardando...' : 'Cambiar Contraseña'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Delete Account Dialog */}
                <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Eliminar Cuenta
                      </DialogTitle>
                      <DialogDescription>Esta acción es irreversible</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertTitle>Advertencia</AlertTitle>
                        <AlertDescription>
                          Al eliminar tu cuenta, se borrarán permanentemente:
                          <ul className="list-disc pl-4 mt-2 text-sm">
                            <li>Tu información personal</li>
                            <li>Tu historial de asistencias</li>
                            <li>Tus votos y evaluaciones</li>
                            <li>Tus certificados y logros</li>
                          </ul>
                          <p className="mt-2 text-xs">De acuerdo con la Ley Orgánica de Protección de Datos Personales del Ecuador, tienes derecho a solicitar la eliminación de tus datos.</p>
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label>Escribe <strong>ELIMINAR</strong> para confirmar:</Label>
                        <Input
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                          placeholder="ELIMINAR"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirma tu contraseña:</Label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setShowDeleteAccountDialog(false);
                        setDeleteConfirmText('');
                        setCurrentPassword('');
                      }}>
                        Cancelar
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={deleteConfirmText !== 'ELIMINAR' || !currentPassword || deletingAccount}
                        onClick={async () => {
                          setDeletingAccount(true);
                          try {
                            const res = await fetch('/api/users/delete-account', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ password: currentPassword }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success('Cuenta eliminada correctamente');
                              setUser(null);
                              setIsLoggedIn(false);
                              setShowDeleteAccountDialog(false);
                            } else {
                              toast.error(data.error || 'Error al eliminar cuenta');
                            }
                          } catch {
                            toast.error('Error de conexión');
                          }
                          setDeletingAccount(false);
                        }}
                      >
                        {deletingAccount ? 'Eliminando...' : 'Eliminar Mi Cuenta'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* New Assignment Dialog - Inside AdminView */}
                <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Asignación</DialogTitle>
                      <DialogDescription>Asigna un proyecto a un evaluador</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Evaluador</Label>
                        <Select
                          value={newAssignmentForm.evaluatorId}
                          onValueChange={(value) => setNewAssignmentForm(prev => ({ ...prev, evaluatorId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar evaluador" />
                          </SelectTrigger>
                          <SelectContent>
                            {usersList.filter(u => u.role === 'EVALUATOR' || u.role === 'ADMIN' || u.role === 'ORGANIZER').map((evaluator) => (
                              <SelectItem key={evaluator.id} value={evaluator.id}>
                                {evaluator.name} ({getRoleLabel(evaluator.role)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Proyecto</Label>
                        <Input
                          placeholder="Buscar proyecto..."
                          value={assignmentSearchQuery}
                          onChange={(e) => setAssignmentSearchQuery(e.target.value)}
                          className="mb-2"
                        />
                        <Select
                          value={newAssignmentForm.projectId}
                          onValueChange={(value) => setNewAssignmentForm(prev => ({ ...prev, projectId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar proyecto" />
                          </SelectTrigger>
                          <SelectContent>
                            {getFilteredProjectsForAssignment().slice(0, 20).map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name} - {project.team}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setAssignmentDialogOpen(false);
                        setNewAssignmentForm({ evaluatorId: '', projectId: '' });
                        setAssignmentSearchQuery('');
                      }}>
                        Cancelar
                      </Button>
                      <Button
                        className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        onClick={handleCreateAssignment}
                        disabled={savingAssignment}
                      >
                        {savingAssignment ? 'Creando...' : 'Crear Asignación'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Evaluation Dialog - Inside AdminView with Rubric 0-100 */}
                <Dialog open={evaluationDialogOpen} onOpenChange={setEvaluationDialogOpen}>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-lg md:text-xl">
                        <Star className="w-5 h-5 text-amber-500" />
                        Evaluación de Proyecto
                      </DialogTitle>
                      <DialogDescription>
                        {selectedProjectForEvaluation?.name} - {selectedProjectForEvaluation?.team}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      {/* Project Description */}
                      {selectedProjectForEvaluation?.description && (
                        <Alert>
                          <Lightbulb className="h-4 w-4" />
                          <AlertTitle>Descripción del Proyecto</AlertTitle>
                          <AlertDescription>{selectedProjectForEvaluation.description}</AlertDescription>
                        </Alert>
                      )}

                      {/* Rúbrica de Evaluación - Puntaje sobre 100 */}
                      <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                        <Target className="h-4 w-4 text-amber-500" />
                        <AlertTitle className="font-semibold">Rúbrica de Evaluación - Total: 100 Puntos</AlertTitle>
                        <AlertDescription className="text-sm mt-2">
                          Cada criterio se califica de 0 hasta su puntaje máximo. La suma total es sobre 100 puntos.
                        </AlertDescription>
                      </Alert>

                      {/* Evaluation Criteria with Dynamic Point Selectors */}
                      {evaluationCriteria.map((criterion) => (
                        <div key={criterion.key} className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-base font-semibold">{criterion.label}</Label>
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  Máx. {criterion.maxPoints} pts
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-wrap items-center gap-1">
                                {Array.from({ length: criterion.maxPoints + 1 }, (_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setEvaluationForm(prev => ({
                                      ...prev,
                                      [criterion.key]: i
                                    }))}
                                    className={cn(
                                      "w-7 h-7 text-xs font-medium rounded transition-all hover:scale-105",
                                      i === evaluationForm[criterion.key as keyof typeof evaluationForm]
                                        ? "bg-amber-500 text-white scale-105"
                                        : i < (evaluationForm[criterion.key as keyof typeof evaluationForm] as number || 0)
                                          ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-100"
                                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                  >
                                    {i}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={((evaluationForm[criterion.key as keyof typeof evaluationForm] as number || 0) / criterion.maxPoints) * 100} 
                            className="h-2"
                          />
                          <Textarea
                            placeholder={`Comentario sobre ${criterion.label.toLowerCase()} (opcional)`}
                            value={evaluationForm[`${criterion.key}Comment` as keyof typeof evaluationForm] as string}
                            onChange={(e) => setEvaluationForm(prev => ({
                              ...prev,
                              [`${criterion.key}Comment`]: e.target.value
                            }))}
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      ))}

                      {/* General Comment */}
                      <div className="space-y-2 pt-4 border-t">
                        <Label className="text-base font-semibold">Comentario General</Label>
                        <Textarea
                          placeholder="Agrega un comentario general sobre el proyecto..."
                          value={evaluationForm.generalComment}
                          onChange={(e) => setEvaluationForm(prev => ({
                            ...prev,
                            generalComment: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      {/* Total Score Summary - Over 100 points */}
                      {(() => {
                        const totalScore = evaluationCriteria.reduce((sum, criterion) => {
                          return sum + (evaluationForm[criterion.key as keyof typeof evaluationForm] as number || 0);
                        }, 0);
                        const maxPossible = evaluationCriteria.reduce((sum, c) => sum + c.maxPoints, 0);
                        const percentage = (totalScore / maxPossible) * 100;
                        
                        return (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium text-lg">Puntaje Total</span>
                                <p className="text-xs text-muted-foreground">Suma de todos los criterios</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="flex items-center gap-2">
                                    <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                                    <span className="text-3xl font-bold text-amber-600">
                                      {totalScore}
                                    </span>
                                    <span className="text-lg text-muted-foreground">/ {maxPossible}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground text-right">{percentage.toFixed(1)}%</p>
                                </div>
                              </div>
                            </div>
                            <Progress value={percentage} className="h-3 mt-3" />
                          </div>
                        );
                      })()}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setEvaluationDialogOpen(false)}
                        className="w-full sm:w-auto"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        variant="secondary"
                        onClick={() => handleSaveEvaluation(false)}
                        disabled={savingEvaluation}
                        className="w-full sm:w-auto"
                      >
                        {savingEvaluation ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 mr-2" />
                            Guardar Borrador
                          </>
                        )}
                      </Button>
                      <Button 
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        onClick={() => handleSaveEvaluation(true)}
                        disabled={savingEvaluation}
                      >
                        {savingEvaluation ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Evaluación
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-gray-900 lg:hidden z-50">
        <div className="grid grid-cols-5 h-16">
          {currentView === 'admin' ? (
            <>
              {[
                { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' },
                { icon: Calendar, label: 'Eventos', tab: 'events' },
                { icon: Presentation, label: 'Actividades', tab: 'activities' },
                { icon: Lightbulb, label: 'Proyectos', tab: 'projects' },
                { icon: Settings, label: 'Más', tab: 'settings' },
              ].map((item) => (
                <Button
                  key={item.tab}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center justify-center h-full rounded-none",
                    activeTab === item.tab && "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  )}
                  onClick={() => setActiveTab(item.tab)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Button>
              ))}
            </>
          ) : (
            <>
              {[
                { icon: Calendar, label: 'Agenda', tab: 'agenda' },
                { icon: MapPin, label: 'Mapa', tab: 'map' },
                { icon: Lightbulb, label: 'Proyectos', tab: 'projects-view' },
                { icon: QrCode, label: 'QR', tab: 'scanner' },
                { icon: Trophy, label: 'Ranking', tab: 'ranking' },
              ].map((item) => (
                <Button
                  key={item.tab}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center justify-center h-full rounded-none",
                    activeTab === item.tab && "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  )}
                  onClick={() => setActiveTab(item.tab)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </Button>
              ))}
            </>
          )}
        </div>
      </nav>

      {/* Global Voting Dialog for STARS and POINTS */}
      <Dialog open={votingDialogOpen} onOpenChange={setVotingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-emerald-500" />
              {votingConfig.voteType === 'STARS' ? 'Calificar Proyecto' : 'Asignar Puntos'}
            </DialogTitle>
            <DialogDescription>
              {selectedProjectForVote?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {votingConfig.voteType === 'STARS' ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Selecciona una calificación de 1 a 5 estrellas
                </p>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setVoteScore(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={cn(
                          "w-10 h-10 transition-colors",
                          star <= voteScore 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-300 dark:text-gray-600"
                        )} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-2xl font-bold text-center">
                  {voteScore} {voteScore === 1 ? 'estrella' : 'estrellas'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  Asigna puntos del 1 al 10
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                    <button
                      key={point}
                      onClick={() => setVoteScore(point)}
                      className={cn(
                        "w-12 h-12 rounded-lg font-bold text-lg transition-all",
                        point === voteScore
                          ? "bg-emerald-500 text-white scale-105"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                      )}
                    >
                      {point}
                    </button>
                  ))}
                </div>
                <p className="text-2xl font-bold text-center">
                  {voteScore} {voteScore === 1 ? 'punto' : 'puntos'}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setVotingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
              onClick={() => selectedProjectForVote && handleVoteProject(selectedProjectForVote, voteScore)}
              disabled={votingProjectId === selectedProjectForVote?.id}
            >
              {votingProjectId === selectedProjectForVote?.id ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Votando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Voto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 py-3 px-4 md:py-4 md:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
            </div>
            <span className="text-xs md:text-sm">{appConfig.footerText}</span>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4" />
              Configuración
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </Button>
          </div>
        </div>
      </footer>

      {/* Add bottom padding for mobile nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
