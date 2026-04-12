'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Sparkles } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { ThemeProvider } from 'next-themes';

import {
  LoginScreen,
  Sidebar,
  Dashboard,
  Projects,
  Evaluations,
  Agenda,
  Settings,
  Achievements,
  QRScanner,
  type User,
  type Event,
  type Activity,
  type Project,
  type DashboardStats,
} from '@/components/fabrica';

// Mock data for demo
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
  { rank: 1, name: 'Ana Rodríguez', points: 3250, level: 33 },
  { rank: 2, name: 'Pedro Sánchez', points: 2980, level: 30 },
  { rank: 3, name: 'Carlos García', points: 2450, level: 25 },
  { rank: 4, name: 'María Fernández', points: 2100, level: 21 },
  { rank: 5, name: 'Luis Torres', points: 1890, level: 19 },
];

const mockRooms = [
  { id: '1', name: 'Auditorio Principal', capacity: 500, building: 'Edificio A' },
  { id: '2', name: 'Sala Innovación', capacity: 150, building: 'Edificio B' },
  { id: '3', name: 'Workshop Lab 1', capacity: 50, building: 'Edificio C' },
];

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Inauguración del Evento',
    description: 'Ceremonia de apertura con keynote principal.',
    type: 'KEYNOTE',
    status: 'SCHEDULED',
    startTime: '2024-03-15T09:00:00',
    endTime: '2024-03-15T10:30:00',
    room: mockRooms[0],
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
    currentAttendance: 35,
  },
  {
    id: '3',
    title: 'Panel: Startups que transforman',
    description: 'Fundadores comparten sus experiencias.',
    type: 'PANEL',
    status: 'IN_PROGRESS',
    startTime: '2024-03-15T14:00:00',
    endTime: '2024-03-15T15:30:00',
    room: mockRooms[0],
    currentAttendance: 280,
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
    averageEvaluation: 8.5,
    evaluationCount: 3,
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
    averageEvaluation: 8.2,
    evaluationCount: 2,
    status: 'APPROVED',
    rank: 2,
  },
  {
    id: '3',
    name: 'LearnPath',
    team: 'EduInnovators',
    category: 'Educación',
    description: 'Sistema de aprendizaje adaptativo basado en el estilo cognitivo.',
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

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [stats, setStats] = useState(mockDashboardStats);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [activities] = useState<Activity[]>(mockActivities);
  const [userRegistrations, setUserRegistrations] = useState<Record<string, { registered: boolean }>>({});

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
          }
        }
      } catch {
        // Not logged in
      }
    };
    checkSession();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsLoggedIn(true);
    toast.success('¡Bienvenido!');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    setUser(null);
    setIsLoggedIn(false);
    setActiveTab('dashboard');
    toast.success('Sesión cerrada');
  };

  const handleVote = async (projectId: string, score: number) => {
    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, score }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`¡Voto registrado! +${score} puntos`);
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, totalVotes: p.totalVotes + 1 } : p
        ));
      }
    } catch {
      toast.success('¡Voto registrado! (demo)');
    }
  };

  const handleRegister = async (activityId: string) => {
    setUserRegistrations(prev => ({
      ...prev,
      [activityId]: { registered: true }
    }));
    toast.success('¡Registro exitoso! +5 puntos');
  };

  // Show login screen if not logged in
  if (!isLoggedIn || !user) {
    return <LoginScreen onLogin={handleLogin} loading={loading} setLoading={setLoading} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-70' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div className="hidden md:flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-900 dark:text-white">Fábrica de Ideas</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-20">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <Dashboard stats={stats} leaderboard={mockLeaderboard} user={user} />
            )}
            {activeTab === 'agenda' && (
              <Agenda
                activities={activities}
                onRegister={handleRegister}
                userRegistrations={userRegistrations}
              />
            )}
            {activeTab === 'projects' && (
              <Projects
                projects={projects}
                userRole={user.role}
                onVote={handleVote}
              />
            )}
            {activeTab === 'evaluations' && (
              <Evaluations
                projects={projects}
                userId={user.id}
                userRole={user.role}
              />
            )}
            {activeTab === 'achievements' && (
              <Achievements userPoints={user.points} userLevel={user.level} />
            )}
            {activeTab === 'qr' && (
              <QRScanner userRole={user.role} />
            )}
            {activeTab === 'settings' && (
              <Settings user={user} onUpdateUser={() => {}} />
            )}
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden z-40">
        <div className="flex justify-around py-2">
          {['dashboard', 'agenda', 'projects', 'evaluations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center p-2 ${
                activeTab === tab ? 'text-emerald-500' : 'text-gray-500'
              }`}
            >
              <span className="text-xs capitalize">{tab === 'dashboard' ? 'Inicio' : tab}</span>
            </button>
          ))}
        </div>
      </nav>

      <Toaster position="top-right" />
    </div>
  );
}

export default function FabricaDeIdeasApp() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AppContent />
    </ThemeProvider>
  );
}
