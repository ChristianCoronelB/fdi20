'use client';

/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Bell, Globe, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User as UserType } from './types';
import { getInitials, getRoleLabel, getRoleColor } from './helpers';

interface SettingsProps {
  user: UserType;
  onUpdateUser: (updates: Partial<UserType>) => void;
}

export function Settings({ user, onUpdateUser }: SettingsProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
