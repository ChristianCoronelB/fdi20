'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Menu, X, Home, Calendar, FolderKanban, Star, Award, QrCode, Settings,
  LogOut, Users, Trophy, ChevronRight, Heart, Eye, EyeOff,
  Mail, Lock, User, ArrowRight, Plus, Edit, Trash2, BarChart3,
  Building, MapPin, Clock, CheckCircle, AlertCircle, FileText, Send,
  Shield, UserCog, LayoutDashboard, Globe, Bell, Camera
} from 'lucide-react';

// ==================== TYPES ====================
type UserRole = 'ADMIN' | 'ORGANIZER' | 'EVALUATOR' | 'PARTICIPANT';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  level: number;
  avatar?: string;
}

interface Project {
  id: string;
  name: string;
  team: string;
  category: string;
  description: string;
  totalVotes: number;
  averageScore: number;
  averageEvaluation: number;
  evaluationCount: number;
  status: string;
  rank?: number;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  room: { name: string; building?: string };
  currentAttendance: number;
}

// ==================== DEMO USERS ====================
const DEMO_USERS: UserData[] = [
  { id: '1', name: 'Admin Principal', email: 'admin@fabrica.com', role: 'ADMIN', points: 5000, level: 50 },
  { id: '2', name: 'Carlos Organizador', email: 'organizer@fabrica.com', role: 'ORGANIZER', points: 3000, level: 30 },
  { id: '3', name: 'María Evaluadora', email: 'evaluator@fabrica.com', role: 'EVALUATOR', points: 2000, level: 20 },
  { id: '4', name: 'Juan Participante', email: 'participant@fabrica.com', role: 'PARTICIPANT', points: 1000, level: 10 },
];

const DEMO_PASSWORD = 'demo123';

// ==================== MOCK DATA ====================
const mockProjects: Project[] = [
  { id: '1', name: 'EcoTrack', team: 'Green Solutions', category: 'Sostenibilidad', description: 'App para monitorear y reducir tu huella de carbono personal.', totalVotes: 156, averageScore: 4.7, averageEvaluation: 8.5, evaluationCount: 3, status: 'APPROVED', rank: 1 },
  { id: '2', name: 'MediConnect', team: 'HealthTech Pro', category: 'Salud', description: 'Plataforma de telemedicina con IA para diagnóstico preventivo.', totalVotes: 142, averageScore: 4.5, averageEvaluation: 8.2, evaluationCount: 2, status: 'APPROVED', rank: 2 },
  { id: '3', name: 'LearnPath', team: 'EduInnovators', category: 'Educación', description: 'Sistema de aprendizaje adaptativo basado en el estilo cognitivo.', totalVotes: 128, averageScore: 4.4, averageEvaluation: 7.8, evaluationCount: 2, status: 'APPROVED', rank: 3 },
  { id: '4', name: 'SmartCity Hub', team: 'Urban Tech', category: 'Smart Cities', description: 'Plataforma IoT para gestión urbana inteligente.', totalVotes: 98, averageScore: 4.2, averageEvaluation: 7.5, evaluationCount: 1, status: 'APPROVED', rank: 4 },
  { id: '5', name: 'FinBot', team: 'FinTech Dreams', category: 'Finanzas', description: 'Asistente financiero personal impulsado por IA.', totalVotes: 87, averageScore: 4.0, averageEvaluation: 7.0, evaluationCount: 1, status: 'APPROVED', rank: 5 },
];

const mockActivities: Activity[] = [
  { id: '1', title: 'Inauguración del Evento', description: 'Ceremonia de apertura con keynote principal.', type: 'KEYNOTE', status: 'SCHEDULED', startTime: '2024-03-15T09:00:00', endTime: '2024-03-15T10:30:00', room: { name: 'Auditorio Principal', building: 'Edificio A' }, currentAttendance: 0 },
  { id: '2', title: 'Taller de Design Thinking', description: 'Aprende metodologías de diseño centrado en el usuario.', type: 'WORKSHOP', status: 'SCHEDULED', startTime: '2024-03-15T11:00:00', endTime: '2024-03-15T13:00:00', room: { name: 'Sala Innovación', building: 'Edificio B' }, currentAttendance: 35 },
  { id: '3', title: 'Panel: Startups que transforman', description: 'Fundadores comparten sus experiencias.', type: 'PANEL', status: 'IN_PROGRESS', startTime: '2024-03-15T14:00:00', endTime: '2024-03-15T15:30:00', room: { name: 'Auditorio Principal', building: 'Edificio A' }, currentAttendance: 280 },
  { id: '4', title: 'Networking & Coffee', description: 'Espacio para conectar con otros participantes.', type: 'NETWORKING', status: 'SCHEDULED', startTime: '2024-03-15T15:30:00', endTime: '2024-03-15T16:00:00', room: { name: 'Área Común' }, currentAttendance: 150 },
  { id: '5', title: 'Pitch Competition', description: 'Presentación de proyectos finalistas.', type: 'COMPETITION', status: 'SCHEDULED', startTime: '2024-03-15T16:00:00', endTime: '2024-03-15T18:00:00', room: { name: 'Auditorio Principal', building: 'Edificio A' }, currentAttendance: 0 },
];

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

const EVALUATION_CRITERIA = [
  { key: 'innovation', label: 'Innovación y Creatividad', description: 'Originalidad y creatividad de la idea', maxScore: 10 },
  { key: 'viability', label: 'Viabilidad del Negocio', description: 'Factibilidad de implementación', maxScore: 10 },
  { key: 'impact', label: 'Impacto Social/Ambiental', description: 'Contribución positiva a la sociedad', maxScore: 10 },
  { key: 'presentation', label: 'Presentación y Comunicación', description: 'Calidad de la presentación', maxScore: 10 },
  { key: 'scalability', label: 'Potencial de Escalamiento', description: 'Capacidad de crecimiento', maxScore: 10 },
  { key: 'execution', label: 'Equipo y Ejecución', description: 'Capacidad del equipo', maxScore: 10 },
];

// ==================== LOGIN SCREEN ====================
function LoginScreen({ onLogin }: { onLogin: (user: UserData) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    if (isLogin) {
      // Check demo users
      const user = DEMO_USERS.find(u => u.email === email);
      if (user && password === DEMO_PASSWORD) {
        onLogin(user);
      } else {
        setError('Credenciales inválidas. Usa: admin@fabrica.com / demo123');
      }
    } else {
      // Register new participant
      if (name && email && password) {
        const newUser: UserData = {
          id: Date.now().toString(),
          name,
          email,
          role: 'PARTICIPANT',
          points: 100,
          level: 1
        };
        onLogin(newUser);
      } else {
        setError('Por favor completa todos los campos');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white shadow-2xl mb-6"
          >
            <Sparkles className="w-12 h-12 text-emerald-500" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Fábrica de Ideas</h1>
          <p className="text-white/80 text-lg">Plataforma de Gestión de Eventos</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${isLogin ? 'bg-white text-emerald-600 shadow' : 'text-gray-500'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${!isLogin ? 'bg-white text-emerald-600 shadow' : 'text-gray-500'}`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700 mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>• admin@fabrica.com / demo123 (Administrador)</p>
              <p>• organizer@fabrica.com / demo123 (Organizador)</p>
              <p>• evaluator@fabrica.com / demo123 (Evaluador)</p>
              <p>• participant@fabrica.com / demo123 (Participante)</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  user,
  onLogout
}: {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserData;
  onLogout: () => void;
}) {
  const isAdmin = user.role === 'ADMIN';
  const isOrganizer = user.role === 'ORGANIZER' || isAdmin;
  const isEvaluator = user.role === 'EVALUATOR' || isOrganizer;

  const participantMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'achievements', label: 'Logros', icon: Award },
    { id: 'qr', label: 'QR Scanner', icon: QrCode },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const evaluatorMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'evaluations', label: 'Evaluaciones', icon: Star },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'achievements', label: 'Logros', icon: Award },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'activities', label: 'Actividades', icon: Clock },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'evaluations', label: 'Evaluaciones', icon: Star },
    { id: 'rooms', label: 'Espacios', icon: Building },
    { id: 'reports', label: 'Reportes', icon: BarChart3 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const menuItems = isAdmin ? adminMenu : (isEvaluator ? evaluatorMenu : participantMenu);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    ORGANIZER: 'bg-purple-100 text-purple-700',
    EVALUATOR: 'bg-blue-100 text-blue-700',
    PARTICIPANT: 'bg-green-100 text-green-700',
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-70 bg-white shadow-2xl z-50 flex flex-col"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-800">Fábrica de Ideas</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 mx-4 mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.name}</p>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${roleColors[user.role]}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-emerald-600">Nivel {user.level} • {user.points} pts</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}

// ==================== DASHBOARD ====================
function Dashboard({ user }: { user: UserData }) {
  const isAdmin = user.role === 'ADMIN';
  const isEvaluator = user.role === 'EVALUATOR' || user.role === 'ORGANIZER' || user.role === 'ADMIN';

  const stats = [
    { label: 'Participantes', value: '1,250', icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: 'Proyectos', value: '32', icon: FolderKanban, color: 'from-purple-400 to-purple-600' },
    { label: 'Actividades', value: '45', icon: Calendar, color: 'from-orange-400 to-orange-600' },
    { label: 'Votos', value: '1,847', icon: Heart, color: 'from-pink-400 to-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
        <p className="text-white/80">Tienes {user.points} puntos y estás en el nivel {user.level}</p>
        <div className="mt-4 flex gap-4">
          {isEvaluator && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Puedes evaluar proyectos</span>
          )}
          {isAdmin && (
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Acceso completo</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800">Ranking de Participantes</h2>
        </div>
        <div className="space-y-3">
          {mockLeaderboard.map((player) => (
            <div
              key={player.rank}
              className={`flex items-center gap-4 p-3 rounded-xl ${
                player.name === user.name ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-gray-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                player.rank === 1 ? 'bg-yellow-400 text-white' :
                player.rank === 2 ? 'bg-gray-300 text-white' :
                player.rank === 3 ? 'bg-orange-400 text-white' :
                'bg-gray-200 text-gray-600'
              }`}>
                {player.rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{player.name}</p>
                <p className="text-sm text-gray-500">Nivel {player.level}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{player.points.toLocaleString()}</p>
                <p className="text-xs text-gray-400">puntos</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN: USER MANAGEMENT ====================
function UserManagement() {
  const [users, setUsers] = useState([...DEMO_USERS, { id: '5', name: 'Usuario Nuevo', email: 'nuevo@test.com', role: 'PARTICIPANT' as UserRole, points: 500, level: 5 }]);

  const roleColors: Record<UserRole, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    ORGANIZER: 'bg-purple-100 text-purple-700',
    EVALUATOR: 'bg-blue-100 text-blue-700',
    PARTICIPANT: 'bg-green-100 text-green-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Puntos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-sm text-gray-500">Nivel {u.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-600">{u.points}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN: ROOMS ====================
function RoomsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Espacios</h1>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Espacio
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex gap-1">
                <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{room.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{room.building}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>Capacidad: {room.capacity} personas</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== ADMIN: REPORTS ====================
function ReportsPanel() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reportes y Estadísticas</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Participación por Actividad</h2>
          <div className="space-y-3">
            {mockActivities.slice(0, 4).map((act) => (
              <div key={act.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{act.title}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }} />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">{act.currentAttendance}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Proyectos por Categoría</h2>
          <div className="space-y-3">
            {['Sostenibilidad', 'Salud', 'Educación', 'Smart Cities', 'Finanzas'].map((cat, i) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="flex-1 text-gray-700">{cat}</span>
                <span className="font-medium text-gray-800">{[8, 6, 7, 5, 6][i]} proyectos</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Votaciones</h2>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-emerald-600">1,847</p>
            <p className="text-gray-500 mt-2">Total de votos emitidos</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">856</p>
              <p className="text-sm text-gray-500">Usuarios que votaron</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">2.2</p>
              <p className="text-sm text-gray-500">Promedio por usuario</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Evaluaciones</h2>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-purple-600">48</p>
            <p className="text-gray-500 mt-2">Evaluaciones completadas</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">32</p>
              <p className="text-sm text-gray-500">Proyectos evaluados</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-800">8.2</p>
              <p className="text-sm text-gray-500">Promedio general</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN: EVENTS ====================
function EventsManagement() {
  const events = [
    { id: '1', name: 'Hackathon Fábrica de Ideas 2024', status: 'Activo', startDate: '2024-03-15', endDate: '2024-03-17', participants: 1250 },
    { id: '2', name: 'Pitch Competition Q1', status: 'Próximo', startDate: '2024-04-01', endDate: '2024-04-01', participants: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Eventos</h1>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Evento
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Evento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fechas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Participantes</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-800">{event.name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {event.startDate} - {event.endDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-800 font-medium">{event.participants}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== ADMIN: ACTIVITIES ====================
function ActivitiesManagement() {
  const typeColors: Record<string, string> = {
    KEYNOTE: 'bg-blue-100 text-blue-700',
    WORKSHOP: 'bg-orange-100 text-orange-700',
    PANEL: 'bg-purple-100 text-purple-700',
    NETWORKING: 'bg-green-100 text-green-700',
    COMPETITION: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Actividades</h1>
        <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Actividad
        </button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-2xl p-5 shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded ${typeColors[activity.type] || 'bg-gray-100 text-gray-700'}`}>
                    {activity.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    activity.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">{activity.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{activity.description}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(activity.startTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(activity.endTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {activity.room.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {activity.currentAttendance} asistentes
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== PROJECTS (ALL ROLES) ====================
function ProjectsView({ user }: { user: UserData }) {
  const [votedProjects, setVotedProjects] = useState<string[]>([]);
  const isAdmin = user.role === 'ADMIN';

  const handleVote = (projectId: string) => {
    if (!votedProjects.includes(projectId)) {
      setVotedProjects([...votedProjects, projectId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Proyectos</h1>
        {isAdmin && (
          <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {mockProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    #{index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                  {project.evaluationCount > 0 && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      {project.evaluationCount} evaluaciones
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{project.team}</p>
                <p className="text-sm text-gray-500 mb-2">{project.description}</p>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {project.category}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{project.averageScore}</span>
                </div>
                <p className="text-sm text-gray-500">{project.totalVotes} votos</p>
                {project.averageEvaluation > 0 && (
                  <p className="text-sm text-purple-600 font-medium">Eval: {project.averageEvaluation.toFixed(1)}/10</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {!isAdmin && (
                <button
                  onClick={() => handleVote(project.id)}
                  disabled={votedProjects.includes(project.id)}
                  className={`flex-1 py-2 rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                    votedProjects.includes(project.id)
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${votedProjects.includes(project.id) ? 'fill-current' : ''}`} />
                  {votedProjects.includes(project.id) ? 'Votado' : 'Votar'}
                </button>
              )}
              <button className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition">
                Ver Detalles
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== EVALUATIONS (EVALUATOR) ====================
function EvaluationsView({ user }: { user: UserData }) {
  const [selectedProject, setSelectedProject] = useState(mockProjects[0]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleScoreChange = (key: string, value: number) => {
    setScores({ ...scores, [key]: value });
  };

  const handleCommentChange = (key: string, value: string) => {
    setComments({ ...comments, [key]: value });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const totalScore = EVALUATION_CRITERIA.reduce((sum, criteria) => sum + (scores[criteria.key] || 0), 0);
  const avgScore = totalScore / EVALUATION_CRITERIA.length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Evaluaciones de Proyectos</h1>
        <p className="text-white/80">Evalúa con los 6 criterios establecidos (1-10 cada uno)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="font-bold text-gray-800 mb-4">Seleccionar Proyecto</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {mockProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedProject.id === project.id
                      ? 'bg-purple-100 border-2 border-purple-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800">{project.name}</p>
                  <p className="text-sm text-gray-500">{project.team}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg">
            <h2 className="font-bold text-gray-800 mb-2">{selectedProject.name}</h2>
            <p className="text-gray-600 mb-4">{selectedProject.description}</p>
            <div className="p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-purple-700">Puntaje promedio actual: <strong>{avgScore.toFixed(1)}/10</strong></p>
              <p className="text-xs text-purple-600">Criterios evaluados: {Object.keys(scores).length}/6</p>
            </div>
          </div>

          {EVALUATION_CRITERIA.map((criteria) => (
            <div key={criteria.key} className="bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{criteria.label}</h3>
                  <p className="text-sm text-gray-500">{criteria.description}</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {scores[criteria.key] || 0}/{criteria.maxScore}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: criteria.maxScore }, (_, i) => i + 1).map((score) => (
                  <button
                    key={score}
                    onClick={() => handleScoreChange(criteria.key, score)}
                    className={`w-9 h-9 rounded-lg font-medium transition-all ${
                      scores[criteria.key] === score
                        ? 'bg-purple-500 text-white'
                        : scores[criteria.key] && score < scores[criteria.key]
                        ? 'bg-purple-200 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Comentario (opcional)"
                value={comments[criteria.key] || ''}
                onChange={(e) => handleCommentChange(criteria.key, e.target.value)}
                className="w-full mt-3 p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition shadow-lg flex items-center justify-center gap-2"
          >
            {submitted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                ¡Evaluación Enviada!
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Evaluación
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== AGENDA (PARTICIPANT) ====================
function AgendaView() {
  const [registered, setRegistered] = useState<string[]>([]);

  const typeColors: Record<string, string> = {
    KEYNOTE: 'bg-blue-100 text-blue-700',
    WORKSHOP: 'bg-orange-100 text-orange-700',
    PANEL: 'bg-purple-100 text-purple-700',
    NETWORKING: 'bg-green-100 text-green-700',
    COMPETITION: 'bg-red-100 text-red-700',
  };

  const handleRegister = (activityId: string) => {
    if (!registered.includes(activityId)) {
      setRegistered([...registered, activityId]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Agenda del Evento</h1>
        <p className="text-white/80">15-17 de Marzo, 2024 • Centro de Convenciones</p>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="text-center min-w-16 p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-gray-800">
                  {new Date(activity.startTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.endTime).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${typeColors[activity.type] || 'bg-gray-100 text-gray-700'}`}>
                    {activity.type}
                  </span>
                  {activity.status === 'IN_PROGRESS' && (
                    <span className="px-2 py-1 text-xs bg-green-500 text-white rounded animate-pulse">EN VIVO</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800">{activity.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {activity.room.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {activity.currentAttendance} inscritos
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRegister(activity.id)}
                disabled={registered.includes(activity.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  registered.includes(activity.id)
                    ? 'bg-green-100 text-green-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {registered.includes(activity.id) ? 'Inscrito ✓' : 'Inscribirse'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== ACHIEVEMENTS ====================
function AchievementsView({ user }: { user: UserData }) {
  const achievements = [
    { id: 1, name: 'Primer Voto', description: 'Emite tu primer voto', icon: '🎯', earned: true },
    { id: 2, name: 'Participante Activo', description: 'Asiste a 5 actividades', icon: '⭐', earned: true },
    { id: 3, name: 'Evaluar Pro', description: 'Evalúa 10 proyectos', icon: '📊', earned: false, progress: 60 },
    { id: 4, name: 'Networker', description: 'Conecta con 20 personas', icon: '🤝', earned: false, progress: 35 },
    { id: 5, name: 'Campeón', description: 'Llega al top 10', icon: '🏆', earned: false, progress: 15 },
    { id: 6, name: 'Mentor', description: 'Ayuda a 5 equipos', icon: '💡', earned: false, progress: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Logros y Gamificación</h1>
        <p className="text-white/80">Desbloquea recompensas y sube de nivel</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{user.points}</p>
            <p className="text-sm text-white/70">Puntos</p>
          </div>
          <div className="h-12 w-px bg-white/30" />
          <div className="text-center">
            <p className="text-3xl font-bold">{user.level}</p>
            <p className="text-sm text-white/70">Nivel</p>
          </div>
          <div className="h-12 w-px bg-white/30" />
          <div className="text-center">
            <p className="text-3xl font-bold">{achievements.filter(a => a.earned).length}</p>
            <p className="text-sm text-white/70">Logros</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl p-4 shadow-lg text-center ${!achievement.earned && 'opacity-60'}`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-bold text-gray-800 mb-1">{achievement.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{achievement.description}</p>
            {achievement.earned ? (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                ✓ Obtenido
              </span>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${achievement.progress}%` }}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==================== QR SCANNER ====================
function QRScannerView({ user }: { user: UserData }) {
  const [scans, setScans] = useState<{ activity: string; time: string }[]>([]);

  const handleScan = () => {
    setScans([
      { activity: 'Taller de Design Thinking', time: new Date().toLocaleTimeString() },
      ...scans
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">QR Scanner</h1>
        <p className="text-white/80">Escanea códigos para registrar asistencia</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="w-48 h-48 mx-auto border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
          <QrCode className="w-24 h-24 text-gray-300" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-1 bg-cyan-500 animate-pulse" style={{ animation: 'scan 2s linear infinite' }} />
          </div>
        </div>
        <p className="text-gray-500 mb-4">Apunta la cámara hacia el código QR</p>
        <button
          onClick={handleScan}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition flex items-center justify-center gap-2 mx-auto"
        >
          <Camera className="w-5 h-5" />
          Iniciar Escaneo
        </button>
      </div>

      {scans.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-lg">
          <h3 className="font-bold text-gray-800 mb-3">Escaneos Recientes</h3>
          <div className="space-y-2">
            {scans.map((scan, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{scan.activity}</p>
                  <p className="text-sm text-gray-500">Hoy, {scan.time}</p>
                </div>
                <span className="text-sm text-emerald-600 font-medium">+10 pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== SETTINGS ====================
function SettingsView({ user }: { user: UserData }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Configuración</h1>
        <p className="text-white/80">Administra tu perfil y preferencias</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-bold text-gray-800 mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              defaultValue={user.name}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue={user.email}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <button className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition">
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="font-bold text-gray-800 mb-4">Notificaciones</h2>
        <div className="space-y-3">
          {['Recordatorios de actividades', 'Nuevos proyectos', 'Actualizaciones de ranking', 'Notificaciones de puntos'].map((item) => (
            <label key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <span className="text-gray-700">{item}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 text-emerald-500 rounded" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================
export default function FabricaDeIdeasApp() {
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      setSidebarOpen(true);
    }
  }, [user]);

  const handleLogin = (loggedInUser: UserData) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSidebarOpen(false);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'users':
        return user.role === 'ADMIN' ? <UserManagement /> : <Dashboard user={user} />;
      case 'events':
        return user.role === 'ADMIN' || user.role === 'ORGANIZER' ? <EventsManagement /> : <Dashboard user={user} />;
      case 'activities':
        return user.role === 'ADMIN' || user.role === 'ORGANIZER' ? <ActivitiesManagement /> : <AgendaView />;
      case 'projects':
        return <ProjectsView user={user} />;
      case 'evaluations':
        return user.role === 'EVALUATOR' || user.role === 'ADMIN' || user.role === 'ORGANIZER' ? <EvaluationsView user={user} /> : <ProjectsView user={user} />;
      case 'rooms':
        return user.role === 'ADMIN' ? <RoomsManagement /> : <Dashboard user={user} />;
      case 'reports':
        return user.role === 'ADMIN' ? <ReportsPanel /> : <Dashboard user={user} />;
      case 'agenda':
        return <AgendaView />;
      case 'achievements':
        return <AchievementsView user={user} />;
      case 'qr':
        return <QRScannerView user={user} />;
      case 'settings':
        return <SettingsView user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-70' : ''}`}>
        <header className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-gray-800 hidden sm:inline">Fábrica de Ideas</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-30">
          <div className="flex justify-around py-2">
            {[
              { id: 'dashboard', icon: Home, label: 'Inicio' },
              { id: 'agenda', icon: Calendar, label: 'Agenda' },
              { id: 'projects', icon: FolderKanban, label: 'Proyectos' },
              { id: 'achievements', icon: Award, label: 'Logros' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-2 ${
                  activeTab === item.id ? 'text-emerald-500' : 'text-gray-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
