'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, Building, Users, Calendar, Loader2, Crosshair, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then(mod => mod.Popup),
  { ssr: false }
);

import 'leaflet/dist/leaflet.css';

interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  building?: string;
  floor?: string;
  latitude?: number | null;
  longitude?: number | null;
  color?: string;
  icon?: string;
  _count?: { activities: number; projects: number };
}

interface Activity {
  id: string;
  title: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  room?: Room;
}

interface Event {
  id: string;
  name: string;
  location?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function Maps() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Default center (will be updated with event or user location)
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.1807, -78.4678]); // Quito, Ecuador

  useEffect(() => {
    // Load data
    const loadData = async () => {
      try {
        const [roomsRes, activitiesRes, eventsRes] = await Promise.all([
          fetch('/api/rooms?limit=100'),
          fetch('/api/activities?limit=100'),
          fetch('/api/events?limit=100'),
        ]);

        if (roomsRes.ok) {
          const data = await roomsRes.json();
          const roomsData = data.data?.rooms || data.data || [];
          setRooms(roomsData);
          
          // Set map center to first room with coordinates
          const roomWithCoords = roomsData.find((r: Room) => r.latitude && r.longitude);
          if (roomWithCoords) {
            setMapCenter([roomWithCoords.latitude!, roomWithCoords.longitude!]);
          }
        }

        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          setActivities(data.data?.activities || data.data || []);
        }

        if (eventsRes.ok) {
          const data = await eventsRes.json();
          const eventsData = data.data?.events || data.data || [];
          setEvents(eventsData);
          
          // Set map center to first event with coordinates
          const eventWithCoords = eventsData.find((e: Event) => e.latitude && e.longitude);
          if (eventWithCoords) {
            setMapCenter([eventWithCoords.latitude!, eventWithCoords.longitude!]);
          }
        }

        setLoading(false);
        
        // Set map ready after a short delay
        setTimeout(() => setMapReady(true), 100);
      } catch (error) {
        console.error('Error loading map data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
        toast.success('Ubicación obtenida');
      },
      (error) => {
        console.error('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Permiso de ubicación denegado');
        } else {
          setLocationError('No se pudo obtener la ubicación');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Get room color for marker
  const getRoomColor = (room: Room) => {
    return room.color || '#3B82F6';
  };

  // Get activity type label
  const getActivityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      KEYNOTE: 'Conferencia',
      WORKSHOP: 'Taller',
      PANEL: 'Panel',
      PRESENTATION: 'Presentación',
      NETWORKING: 'Networking',
      BREAK: 'Descanso',
      OTHER: 'Otro',
    };
    return labels[type] || type;
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Get distance to room from user location
  const getDistanceToRoom = (room: Room): string | null => {
    if (!userLocation || !room.latitude || !room.longitude) return null;
    const distance = calculateDistance(
      userLocation.lat, userLocation.lng,
      room.latitude, room.longitude
    );
    return formatDistance(distance);
  };

  // Rooms with coordinates
  const roomsWithCoords = rooms.filter(r => r.latitude && r.longitude);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-6 h-6 text-emerald-500" />
            Mapas del Evento
          </h2>
          <p className="text-gray-500">Ubica las salas y actividades del evento</p>
        </div>
        <div className="flex gap-2">
          {locationError && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="w-3 h-3" />
              Sin ubicación
            </Badge>
          )}
          <Button variant="outline" onClick={getUserLocation}>
            <Crosshair className="w-4 h-4 mr-2" />
            Mi ubicación
          </Button>
        </div>
      </div>

      {/* Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="h-[500px] relative">
            {mapReady && typeof window !== 'undefined' && (
              <MapContainer
                center={mapCenter}
                zoom={17}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Room markers */}
                {roomsWithCoords.map((room) => {
                  // Create custom icon
                  const L = require('leaflet');
                  const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                      <div style="
                        background-color: ${getRoomColor(room)};
                        width: 36px;
                        height: 36px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                      ">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                          <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                      </div>
                    `,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  });
                  
                  return (
                    <Marker
                      key={room.id}
                      position={[room.latitude!, room.longitude!]}
                      icon={customIcon}
                      eventHandlers={{
                        click: () => setSelectedRoom(room),
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <h3 className="font-bold text-lg">{room.name}</h3>
                          {room.building && <p className="text-sm text-gray-600">{room.building}</p>}
                          {room.floor && <p className="text-sm text-gray-600">Piso: {room.floor}</p>}
                          <p className="text-sm">Capacidad: {room.capacity} personas</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">
                              {room._count?.activities || 0} actividades
                            </Badge>
                          </div>
                          {userLocation && (
                            <p className="text-sm text-emerald-600 mt-2">
                              📍 {getDistanceToRoom(room)} de tu ubicación
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                
                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={(() => {
                      const L = require('leaflet');
                      return L.divIcon({
                        className: 'user-marker',
                        html: `
                          <div style="
                            background-color: #3B82F6;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
                            animation: pulse 2s infinite;
                          "></div>
                          <style>
                            @keyframes pulse {
                              0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                              70% { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
                              100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                            }
                          </style>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10],
                      });
                    })()}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-bold">📍 Tu ubicación</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            )}
          </div>
        </Card>

        {/* Room List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Salas</CardTitle>
            <CardDescription>
              {roomsWithCoords.length} de {rooms.length} salas con ubicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      selectedRoom?.id === room.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                    onClick={() => {
                      setSelectedRoom(room);
                      if (room.latitude && room.longitude) {
                        setMapCenter([room.latitude, room.longitude]);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: getRoomColor(room) }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{room.name}</p>
                        {room.building && (
                          <p className="text-sm text-gray-500">{room.building}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {room.capacity}
                          </Badge>
                          {room._count?.activities && (
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {room._count.activities}
                            </Badge>
                          )}
                          {getDistanceToRoom(room) && (
                            <Badge variant="secondary" className="text-xs">
                              📍 {getDistanceToRoom(room)}
                            </Badge>
                          )}
                        </div>
                        {!room.latitude && (
                          <p className="text-xs text-orange-500 mt-1">
                            Sin coordenadas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Activities in Selected Room */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Actividades en {selectedRoom.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activities
                .filter(a => a.room?.id === selectedRoom.id)
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-emerald-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.startTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(activity.endTime).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {getActivityTypeLabel(activity.type)}
                      </Badge>
                    </div>
                  </div>
                ))}
              {activities.filter(a => a.room?.id === selectedRoom.id).length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">
                  No hay actividades programadas en esta sala
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
