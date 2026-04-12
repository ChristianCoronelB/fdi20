'use client';

import { motion } from 'framer-motion';
import {
  Users, Calendar, Lightbulb, Vote, TrendingUp, Award, Zap, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { DashboardStats, User } from './types';
import { getInitials } from './helpers';

interface DashboardProps {
  stats: DashboardStats;
  leaderboard: { rank: number; name: string; points: number; level: number; avatar?: string }[];
  user: User;
}

const statCards = [
  { key: 'totalUsers', label: 'Usuarios', icon: Users, color: 'from-blue-500 to-blue-600' },
  { key: 'totalEvents', label: 'Eventos', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { key: 'totalActivities', label: 'Actividades', icon: Zap, color: 'from-orange-500 to-orange-600' },
  { key: 'totalProjects', label: 'Proyectos', icon: Lightbulb, color: 'from-emerald-500 to-emerald-600' },
  { key: 'totalVotes', label: 'Votos', icon: Vote, color: 'from-pink-500 to-pink-600' },
  { key: 'totalAttendance', label: 'Asistencias', icon: Target, color: 'from-teal-500 to-teal-600' },
] as const;

export function Dashboard({ stats, leaderboard, user }: DashboardProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Header */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">¡Bienvenido, {user.name}!</h2>
                <p className="text-emerald-100 mt-1">
                  Continúa participando para ganar más puntos y desbloquear logros.
                </p>
              </div>
              <div className="hidden md:block">
                <div className="bg-white/20 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{user.points} puntos</p>
                  <p className="text-xs text-emerald-100">Nivel {user.level}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progreso al siguiente nivel</span>
                <span>{user.points % 100}/100 XP</span>
              </div>
              <Progress value={user.points % 100} className="h-2 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const value = stats[stat.key];
          return (
            <motion.div key={stat.key} variants={item}>
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full`} />
                  <Icon className={`w-5 h-5 mb-2 text-gray-400`} />
                  <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Tabla de Posiciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <div
                  key={player.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    player.rank <= 3 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' : ''
                  } ${player.name === user.name ? 'ring-2 ring-emerald-500' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-amber-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-600'
                  }`}>
                    {player.rank}
                  </div>
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                      {getInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{player.name}</p>
                    <p className="text-sm text-gray-500">Nivel {player.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{player.points.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">puntos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
