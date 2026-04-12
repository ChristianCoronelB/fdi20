'use client';

import { motion } from 'framer-motion';
import { Award, Trophy, Star, Target, Users, Zap, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface AchievementsProps {
  userPoints: number;
  userLevel: number;
}

const achievementsList = [
  {
    id: 'first-attendance',
    name: 'Primera Asistencia',
    description: 'Asiste a tu primera actividad',
    icon: Target,
    points: 10,
    requirement: 'Asistir a 1 actividad',
    unlocked: true,
  },
  {
    id: 'five-activities',
    name: 'Participante Activo',
    description: 'Asiste a 5 actividades',
    icon: Users,
    points: 50,
    requirement: 'Asistir a 5 actividades',
    unlocked: true,
  },
  {
    id: 'first-vote',
    name: 'Voz y Voto',
    description: 'Emite tu primer voto',
    icon: Star,
    points: 15,
    requirement: 'Votar por 1 proyecto',
    unlocked: true,
  },
  {
    id: 'ten-votes',
    name: 'Jurado Popular',
    description: 'Vota por 10 proyectos',
    icon: Trophy,
    points: 100,
    requirement: 'Votar por 10 proyectos',
    unlocked: false,
    progress: 7,
    total: 10,
  },
  {
    id: 'evaluator',
    name: 'Evaluador Experto',
    description: 'Completa 5 evaluaciones',
    icon: Zap,
    points: 150,
    requirement: 'Evaluar 5 proyectos',
    unlocked: false,
    progress: 2,
    total: 5,
  },
  {
    id: 'champion',
    name: 'Campeón de Ideas',
    description: 'Alcanza 1000 puntos',
    icon: Award,
    points: 500,
    requirement: 'Acumular 1000 puntos',
    unlocked: false,
    progress: 450,
    total: 1000,
  },
];

export function Achievements({ userPoints, userLevel }: AchievementsProps) {
  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Logros
        </h2>
        <p className="text-gray-500">Desbloquea logros ganando puntos y participando</p>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{userPoints}</p>
              <p className="text-amber-100 text-sm">Puntos Totales</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{userLevel}</p>
              <p className="text-amber-100 text-sm">Nivel</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{unlockedCount}/{achievementsList.length}</p>
              <p className="text-amber-100 text-sm">Logros</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {achievementsList.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`h-full ${achievement.unlocked ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/10' : 'opacity-75'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      {achievement.unlocked ? (
                        <Icon className="w-7 h-7" />
                      ) : (
                        <Lock className="w-7 h-7" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{achievement.name}</h3>
                        {achievement.unlocked && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {achievement.requirement}
                        </span>
                      </div>
                      {!achievement.unlocked && achievement.progress !== undefined && (
                        <div className="mt-2">
                          <Progress value={(achievement.progress / achievement.total) * 100} className="h-1.5" />
                          <p className="text-xs text-gray-500 mt-1">
                            {achievement.progress}/{achievement.total}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
