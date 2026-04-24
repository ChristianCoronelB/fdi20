'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Filter, Users, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import type { Activity } from './types';
import { getStatusColor, getActivityTypeColor, getTypeLabel, formatTime, formatDate } from './helpers';

interface AgendaProps {
  activities: Activity[];
  onRegister: (activityId: string) => Promise<void>;
  userRegistrations: Record<string, { registered: boolean }>;
}

export function Agenda({ activities, onRegister, userRegistrations }: AgendaProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [registering, setRegistering] = useState<string | null>(null);

  const filteredActivities = activities.filter(a => {
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.room?.name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  const handleRegister = async (activityId: string) => {
    setRegistering(activityId);
    await onRegister(activityId);
    setRegistering(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Agenda
          </h2>
          <p className="text-gray-500">Explora las actividades del evento</p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full md:w-48">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="KEYNOTE">Conferencias</SelectItem>
              <SelectItem value="CHARLA_MAGISTRAL">Charlas Magistrales</SelectItem>
              <SelectItem value="WORKSHOP">Workshops</SelectItem>
              <SelectItem value="TALLER">Talleres</SelectItem>
              <SelectItem value="PANEL">Paneles</SelectItem>
              <SelectItem value="PRESENTATION">Presentaciones</SelectItem>
              <SelectItem value="PITCH">Pitches</SelectItem>
              <SelectItem value="NETWORKING">Networking</SelectItem>
              <SelectItem value="CEREMONY">Ceremonias</SelectItem>
              <SelectItem value="SEMINARIO">Seminarios</SelectItem>
              <SelectItem value="CURSO">Cursos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-6">
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              {formatDate(activities[0].startTime)}
            </h3>
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const isRegistered = userRegistrations[activity.id]?.registered;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`hover:shadow-md transition-shadow ${isRegistered ? 'border-emerald-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Time Column */}
                          <div className="text-center min-w-16">
                            <p className="text-lg font-bold">{formatTime(activity.startTime)}</p>
                            <p className="text-sm text-gray-500">{formatTime(activity.endTime)}</p>
                          </div>

                          {/* Type Indicator */}
                          <div className={`w-1 rounded-full ${getActivityTypeColor(activity.type)}`} />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold">{activity.title}</h4>
                                {activity.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              <Badge className={getStatusColor(activity.status)}>
                                {activity.status}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {activity.room?.name || 'Por definir'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {activity.currentAttendance} asistentes
                              </span>
                              <Badge variant="outline">
                                {getTypeLabel(activity.type)}
                              </Badge>
                            </div>
                          </div>

                          {/* Action */}
                          <div>
                            {isRegistered ? (
                              <Badge className="bg-emerald-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Registrado
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRegister(activity.id)}
                                disabled={registering === activity.id}
                              >
                                {registering === activity.id ? 'Registrando...' : 'Registrarse'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No se encontraron actividades</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
