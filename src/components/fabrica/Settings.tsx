'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Bell, Globe, Moon, Sun, User, Settings as SettingsIcon, Save, Clock, FileText, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { User as UserType } from './types';
import { getInitials, getRoleLabel, getRoleColor } from './helpers';

interface SettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

// Lista de zonas horarias comunes
const TIMEZONES = [
  { value: 'America/La_Paz', label: 'La Paz, Bolivia (UTC-4)' },
  { value: 'America/Lima', label: 'Lima, Perú (UTC-5)' },
  { value: 'America/Bogota', label: 'Bogotá, Colombia (UTC-5)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
  { value: 'America/Guatemala', label: 'Guatemala (UTC-6)' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires, Argentina (UTC-3)' },
  { value: 'America/Santiago', label: 'Santiago, Chile (UTC-4)' },
  { value: 'America/Caracas', label: 'Caracas, Venezuela (UTC-4)' },
  { value: 'America/Asuncion', label: 'Asunción, Paraguay (UTC-4)' },
  { value: 'America/Montevideo', label: 'Montevideo, Uruguay (UTC-3)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brasil (UTC-3)' },
  { value: 'Europe/Madrid', label: 'Madrid, España (UTC+1)' },
  { value: 'UTC', label: 'UTC (Tiempo Universal)' },
];

export function Settings({ user, onUpdateUser }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // App config states
  const [timezone, setTimezone] = useState('America/La_Paz');
  const [footerText, setFooterText] = useState('© 2024 Fábrica de Ideas - Todos los derechos reservados');
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Load app config on mount
  useEffect(() => {
    setMounted(true);
    
    // Load app config
    const loadConfig = async () => {
      try {
        const res = await fetch('/api/app-config');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setTimezone(data.data.timezone || 'America/La_Paz');
            setFooterText(data.data.footerText || '© 2024 Fábrica de Ideas - Todos los derechos reservados');
          }
        }
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };
    
    loadConfig();
  }, []);

  // Save app config
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await fetch('/api/app-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configs: {
            timezone,
            footerText,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Configuración guardada correctamente');
      } else {
        toast.error(data.error || 'Error al guardar configuración');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar configuración');
    }
    setSavingConfig(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >

      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-500" />
          Configuración
        </h2>
        <p className="text-gray-500">Administra tu perfil y preferencias</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Información personal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-gray-500">{user.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>
          </div>

          <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>

      {/* App Configuration Card - Solo para ADMIN */}
      {user.role === 'ADMIN' && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-emerald-500" />
              Configuración de la Aplicación
            </CardTitle>
            <CardDescription>Configuración global del sistema (Solo Administradores)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timezone */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" />
                <Label htmlFor="timezone" className="text-base font-medium">Zona Horaria</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Define la zona horaria para mostrar fechas y horas en toda la aplicación
              </p>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Footer Text */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                <Label htmlFor="footerText" className="text-base font-medium">Texto del Footer</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Texto que aparecerá en el pie de página de toda la aplicación
              </p>
              <Textarea
                id="footerText"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="© 2024 Fábrica de Ideas - Todos los derechos reservados"
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="bg-gradient-to-r from-emerald-500 to-teal-600"
              >
                {savingConfig ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>Personaliza tu experiencia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {mounted && theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-medium">Tema Oscuro</p>
                <p className="text-sm text-gray-500">Cambia la apariencia de la aplicación</p>
              </div>
            </div>
            <Switch
              checked={mounted && theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <div>
                <p className="font-medium">Notificaciones</p>
                <p className="text-sm text-gray-500">Recibe alertas de actividades</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5" />
              <div>
                <p className="font-medium">Idioma</p>
                <p className="text-sm text-gray-500">Idioma de la interfaz</p>
              </div>
            </div>
            <span className="text-sm font-medium">Español</span>
          </div>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
          <CardDescription>Protege tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5" />
              <div>
                <p className="font-medium">Cambiar Contraseña</p>
                <p className="text-sm text-gray-500">Actualiza tu contraseña</p>
              </div>
            </div>
            <Button variant="outline">Cambiar</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
