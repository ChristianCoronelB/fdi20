'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Menu, X, Home, Calendar, FolderKanban, Star, Award, QrCode, Settings as SettingsIcon,
  LogOut, TrendingUp, Users, FileText, Trophy, ChevronRight, Heart, Eye, EyeOff,
  Mail, Lock, User, ArrowRight
} from 'lucide-react';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  level: number;
}

// Login Screen Component
function LoginScreen({ onLogin }: { onLogin: (user: UserData) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular login/demo
    setTimeout(() => {
      const user: UserData = {
        id: '1',
        name: name || 'Usuario Demo',
        email: email || 'demo@fabrica.com',
        role: 'EVALUATOR',
        points: 1250,
        level: 12
      };
      onLogin(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
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

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isLogin ? 'bg-white text-emerald-600 shadow' : 'text-gray-500'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isLogin ? 'bg-white text-emerald-600 shadow' : 'text-gray-500'
              }`}
            >
              Registrarse
            </button>
          </div>

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

          <p className="text-center text-gray-500 text-sm mt-6">
            Demo: Usa cualquier email y contraseña
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Sidebar Component
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
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'projects', label: 'Proyectos', icon: FolderKanban },
    { id: 'evaluations', label: 'Evaluaciones', icon: Star },
    { id: 'achievements', label: 'Logros', icon: Award },
    { id: 'qr', label: 'QR Scanner', icon: QrCode },
    { id: 'settings', label: 'Configuración', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Overlay for mobile */}
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

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        className="fixed left-0 top-0 h-full w-70 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
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

        {/* User Info */}
        <div className="p-4 mx-4 mt-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate">{user.name}</p>
              <p className="text-sm text-emerald-600">Nivel {user.level} • {user.points} pts</p>
            </div>
          </div>
        </div>

        {/* Menu */}
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

        {/* Logout */}
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

// Dashboard Component
function Dashboard({ user }: { user: UserData }) {
  const stats = [
    { label: 'Participantes', value: '1,250', icon: Users, color: 'from-blue-400 to-blue-600' },
    { label: 'Proyectos', value: '32', icon: FolderKanban, color: 'from-purple-400 to-purple-600' },
    { label: 'Actividades', value: '45', icon: Calendar, color: 'from-orange-400 to-orange-600' },
    { label: 'Votos', value: '1,847', icon: Heart, color: 'from-pink-400 to-pink-600' },
  ];

  const leaderboard = [
    { rank: 1, name: 'Ana Rodríguez', points: 3250, level: 33 },
    { rank: 2, name: 'Pedro Sánchez', points: 2980, level: 30 },
    { rank: 3, name: 'Carlos García', points: 2450, level: 25 },
    { rank: 4, name: 'María Fernández', points: 2100, level: 21 },
    { rank: 5, name: 'Luis Torres', points: 1890, level: 19 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">¡Bienvenido, {user.name}!</h1>
        <p className="text-white/80">Tienes {user.points} puntos y estás en el nivel {user.level}</p>
      </div>

      {/* Stats Grid */}
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

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-800">Ranking de Participantes</h2>
        </div>
        <div className="space-y-3">
          {leaderboard.map((player) => (
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

// Projects Component
function Projects() {
  const projects = [
    { id: 1, name: 'EcoTrack', team: 'Green Solutions', category: 'Sostenibilidad', votes: 156, score: 4.7 },
    { id: 2, name: 'MediConnect', team: 'HealthTech Pro', category: 'Salud', votes: 142, score: 4.5 },
    { id: 3, name: 'LearnPath', team: 'EduInnovators', category: 'Educación', votes: 128, score: 4.4 },
    { id: 4, name: 'SmartCity Hub', team: 'Urban Tech', category: 'Smart Cities', votes: 98, score: 4.2 },
    { id: 5, name: 'FinBot', team: 'FinTech Dreams', category: 'Finanzas', votes: 87, score: 4.0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Proyectos</h1>
        <span className="text-sm text-gray-500">{projects.length} proyectos</span>
      </div>

      <div className="grid gap-4">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                    #{index + 1}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800">{project.name}</h3>
                </div>
                <p className="text-gray-600 mb-2">{project.team}</p>
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  {project.category}
                </span>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-yellow-500 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{project.score}</span>
                </div>
                <p className="text-sm text-gray-500">{project.votes} votos</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" /> Votar
              </button>
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

// Evaluations Component
function Evaluations() {
  const criteria = [
    { id: 1, name: 'Innovación', description: 'Originalidad y creatividad del proyecto', maxScore: 10 },
    { id: 2, name: 'Impacto Social', description: 'Potencial de generar cambio positivo', maxScore: 10 },
    { id: 3, name: 'Viabilidad', description: 'Factibilidad de implementación', maxScore: 10 },
    { id: 4, name: 'Presentación', description: 'Calidad de la exposición', maxScore: 10 },
    { id: 5, name: 'Equipo', description: 'Capacidad y experiencia del equipo', maxScore: 10 },
    { id: 6, name: 'Escalabilidad', description: 'Potencial de crecimiento', maxScore: 10 },
  ];

  const [scores, setScores] = useState<Record<number, number>>({});

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Evaluaciones</h1>
        <p className="text-white/80">Evalúa proyectos con los 6 criterios establecidos</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Seleccionar Proyecto</h2>
        <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none">
          <option>EcoTrack - Green Solutions</option>
          <option>MediConnect - HealthTech Pro</option>
          <option>LearnPath - EduInnovators</option>
        </select>
      </div>

      <div className="space-y-4">
        {criteria.map((criterion, index) => (
          <motion.div
            key={criterion.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{criterion.name}</h3>
                <p className="text-sm text-gray-500">{criterion.description}</p>
              </div>
              <span className="text-2xl font-bold text-purple-600">
                {scores[criterion.id] || 0}/{criterion.maxScore}
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: criterion.maxScore }, (_, i) => i + 1).map((score) => (
                <button
                  key={score}
                  onClick={() => setScores({ ...scores, [criterion.id]: score })}
                  className={`w-9 h-9 rounded-lg font-medium transition-all ${
                    scores[criterion.id] === score
                      ? 'bg-purple-500 text-white'
                      : scores[criterion.id] && score < scores[criterion.id]
                      ? 'bg-purple-200 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-700 transition shadow-lg">
        Enviar Evaluación
      </button>
    </div>
  );
}

// Agenda Component
function Agenda() {
  const activities = [
    { id: 1, title: 'Inauguración del Evento', time: '09:00 - 10:30', type: 'KEYNOTE', room: 'Auditorio Principal' },
    { id: 2, title: 'Taller de Design Thinking', time: '11:00 - 13:00', type: 'WORKSHOP', room: 'Sala Innovación' },
    { id: 3, title: 'Panel: Startups que transforman', time: '14:00 - 15:30', type: 'PANEL', room: 'Auditorio Principal' },
    { id: 4, title: 'Networking & Coffee', time: '15:30 - 16:00', type: 'NETWORKING', room: 'Área Común' },
    { id: 5, title: 'Pitch Competition', time: '16:00 - 18:00', type: 'COMPETITION', room: 'Auditorio Principal' },
  ];

  const typeColors: Record<string, string> = {
    KEYNOTE: 'bg-blue-100 text-blue-700',
    WORKSHOP: 'bg-orange-100 text-orange-700',
    PANEL: 'bg-purple-100 text-purple-700',
    NETWORKING: 'bg-green-100 text-green-700',
    COMPETITION: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Agenda</h1>
        <p className="text-white/80">15 de Marzo, 2024</p>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="text-center min-w-16">
                <p className="text-sm text-gray-500">{activity.time.split(' - ')[0]}</p>
                <p className="text-xs text-gray-400">{activity.time.split(' - ')[1]}</p>
              </div>
              <div className="flex-1">
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${typeColors[activity.type]}`}>
                  {activity.type}
                </span>
                <h3 className="font-bold text-gray-800 mt-2">{activity.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{activity.room}</p>
              </div>
              <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition">
                Registrar
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Achievements Component
function Achievements() {
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
        <h1 className="text-2xl font-bold mb-2">Logros</h1>
        <p className="text-white/80">Desbloquea recompensas y sube de nivel</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-2xl p-4 shadow-lg text-center ${
              !achievement.earned && 'opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-bold text-gray-800 mb-1">{achievement.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{achievement.description}</p>
            {achievement.earned ? (
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                ✓ Obtenido
              </span>
            ) : (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
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

// QR Scanner Component
function QRScanner() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">QR Scanner</h1>
        <p className="text-white/80">Escanea códigos para registrar asistencia</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
        <div className="w-48 h-48 mx-auto border-4 border-dashed border-gray-300 rounded-2xl flex items-center justify-center mb-4">
          <QrCode className="w-24 h-24 text-gray-300" />
        </div>
        <p className="text-gray-500 mb-4">Apunta la cámara hacia el código QR</p>
        <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition">
          Iniciar Escaneo
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-lg">
        <h3 className="font-bold text-gray-800 mb-3">Escaneos Recientes</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-600">✓</span>
            </div>
            <div>
              <p className="font-medium text-gray-800">Taller de Design Thinking</p>
              <p className="text-sm text-gray-500">Hoy, 11:05 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Component
function Settings({ user }: { user: UserData }) {
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
          {['Recordatorios de actividades', 'Nuevos proyectos', 'Actualizaciones de ranking'].map((item) => (
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

// Main App Component
export default function FabricaDeIdeasApp() {
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleLogin = (loggedInUser: UserData) => {
    setUser(loggedInUser);
    setSidebarOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    setSidebarOpen(false);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-70' : ''}`}>
        {/* Header */}
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

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard user={user} />}
              {activeTab === 'agenda' && <Agenda />}
              {activeTab === 'projects' && <Projects />}
              {activeTab === 'evaluations' && <Evaluations />}
              {activeTab === 'achievements' && <Achievements />}
              {activeTab === 'qr' && <QRScanner />}
              {activeTab === 'settings' && <Settings user={user} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-30">
          <div className="flex justify-around py-2">
            {[
              { id: 'dashboard', icon: Home, label: 'Inicio' },
              { id: 'agenda', icon: Calendar, label: 'Agenda' },
              { id: 'projects', icon: FolderKanban, label: 'Proyectos' },
              { id: 'evaluations', icon: Star, label: 'Evaluar' },
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
