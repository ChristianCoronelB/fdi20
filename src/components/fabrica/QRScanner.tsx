'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, RefreshCw, MapPin, Navigation, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  validateLocationForQR,
  formatDistance,
  type Coordinates
} from '@/lib/geolocation';
import { invalidateCache } from '@/hooks/use-data';

interface QRScannerProps {
  userRole: string;
  onScanSuccess?: (result: any) => void;
}

interface Room {
  id: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  building?: string;
  floor?: string;
}

export function QRScanner({ userRole, onScanSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultData, setResultData] = useState<any>(null);
  
  // Location states
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [nearbyRoom, setNearbyRoom] = useState<Room | null>(null);
  const [distanceToRoom, setDistanceToRoom] = useState<number | null>(null);
  
  // Rooms data for location validation
  const [rooms, setRooms] = useState<Room[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watchIdRef = useRef<number | null>(null);

  const canScan = userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'MODERATOR' || userRole === 'PARTICIPANT';
  const MAX_DISTANCE_METERS = 30;

  // Load rooms for location validation
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms?limit=100');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRooms(data.data.rooms || data.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };
    fetchRooms();
  }, []);

  // Start watching location when scanning
  useEffect(() => {
    if (scanning && canScan) {
      // Get initial position
      getCurrentLocation();
      
      // Watch position
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const coords: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setUserLocation(coords);
            setLocationError(null);
            
            // Find nearby room
            findNearbyRoom(coords);
          },
          (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
              setLocationError('Permiso de ubicación denegado. Habilita la ubicación para escanear QRs.');
            } else {
              setLocationError('No se pudo obtener tu ubicación.');
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      }
    }
    
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [scanning, canScan]);

  // Cleanup video stream on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const getCurrentLocation = async () => {
    setGettingLocation(true);
    setLocationError(null);
    
    try {
      if (!navigator.geolocation) {
        throw new Error('La geolocalización no está soportada');
      }
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
      
      const coords: Coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coords);
      findNearbyRoom(coords);
    } catch (error: any) {
      console.error('Location error:', error);
      if (error.code === 1) {
        setLocationError('Permiso de ubicación denegado. Habilita la ubicación en tu navegador.');
      } else {
        setLocationError('No se pudo obtener tu ubicación. Intenta de nuevo.');
      }
    } finally {
      setGettingLocation(false);
    }
  };

  const findNearbyRoom = (coords: Coordinates) => {
    let closestRoom: Room | null = null;
    let closestDistance = Infinity;
    
    for (const room of rooms) {
      if (room.latitude && room.longitude) {
        const roomCoords: Coordinates = {
          latitude: room.latitude,
          longitude: room.longitude,
        };
        
        // Simple distance calculation using Haversine approximation
        const distance = calculateDistance(coords, roomCoords);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestRoom = room;
        }
      }
    }
    
    setNearbyRoom(closestRoom);
    setDistanceToRoom(closestDistance);
  };

  // Haversine formula for distance calculation
  const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (coord1.latitude * Math.PI) / 180;
    const φ2 = (coord2.latitude * Math.PI) / 180;
    const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    setScanResult(null);
    setResultMessage('');
    setResultData(null);
  };

  const processScan = async (scannedCode: string) => {
    setProcessing(true);
    setScanResult(null);
    
    try {
      // Parse the QR code to determine type and get target location
      const parts = scannedCode.split(':');
      const qrType = parts[0];
      let targetRoomId = parts[1];
      
      // For ACTIVITY QR codes, we need to find the room
      if (qrType === 'ACTIVITY' && targetRoomId) {
        // Get activity details to find its room
        const activityRes = await fetch(`/api/activities?limit=100`);
        if (activityRes.ok) {
          const activityData = await activityRes.json();
          const activities = activityData.data?.activities || activityData.data || [];
          const activity = activities.find((a: any) => a.id === targetRoomId);
          
          if (activity?.room?.id) {
            targetRoomId = activity.room.id;
          }
        }
      }
      
      // Validate location if this is a ROOM or ACTIVITY QR
      if ((qrType === 'ROOM' || qrType === 'ACTIVITY') && targetRoomId) {
        const room = rooms.find(r => r.id === targetRoomId);
        
        if (room?.latitude && room?.longitude) {
          const targetCoords: Coordinates = {
            latitude: room.latitude,
            longitude: room.longitude,
          };
          
          if (!userLocation) {
            toast.error('No se pudo obtener tu ubicación. Habilita los permisos de ubicación.');
            setProcessing(false);
            return;
          }
          
          const distance = calculateDistance(userLocation, targetCoords);
          
          if (distance > MAX_DISTANCE_METERS) {
            setScanResult('error');
            setResultMessage(`Debes estar a menos de ${MAX_DISTANCE_METERS} metros de "${room.name}". Actualmente estás a ${formatDistance(distance)}.`);
            setResultData({ distance, room, userLocation });
            setProcessing(false);
            return;
          }
        }
      }
      
      // Process the scan
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: scannedCode }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setScanResult('success');
        setResultMessage(data.data?.message || 'Escaneo exitoso');
        setResultData(data.data);
        setLastScan(scannedCode);
        
        // Invalidate cache to refresh data
        invalidateCache('/api/activities');
        invalidateCache('/api/attendance');
        invalidateCache('/api/achievements');
        invalidateCache('/api/dashboard');
        
        toast.success(data.data?.message || 'Escaneo exitoso');
        
        // Call success callback
        onScanSuccess?.(data.data);
      } else {
        setScanResult('error');
        setResultMessage(data.error || 'Error al procesar el código QR');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult('error');
      setResultMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
    
    // Clear result after 5 seconds
    setTimeout(() => {
      setScanResult(null);
      setResultMessage('');
    }, 5000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessing(true);
    
    try {
      // Use a QR code library to read from image
      // For now, we'll use a simple approach with html5-qrcode
      const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode;
      
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        await processScan(decodedText);
      } catch (scanError) {
        toast.error('No se pudo leer el código QR de la imagen');
      } finally {
        html5QrCode.clear();
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Hidden element for file scanning */}
      <div id="qr-reader-hidden" style={{ display: 'none' }}></div>

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-500" />
          Escáner QR
        </h2>
        <p className="text-gray-500">Escanea códigos QR para registro de asistencia</p>
      </div>

      {!canScan ? (
        <Card>
          <CardContent className="py-12 text-center">
            <QrCode className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No tienes permisos para escanear códigos QR</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Location Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Estado de Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              {gettingLocation ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Obteniendo ubicación...
                </div>
              ) : locationError ? (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertTitle>Error de ubicación</AlertTitle>
                  <AlertDescription>{locationError}</AlertDescription>
                </Alert>
              ) : userLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <MapPin className="w-4 h-4" />
                    <span>Ubicación obtenida</span>
                  </div>
                  {nearbyRoom && (
                    <div className="text-sm text-gray-600">
                      <p>Sala más cercana: <strong>{nearbyRoom.name}</strong></p>
                      {distanceToRoom !== null && (
                        <p className={distanceToRoom <= MAX_DISTANCE_METERS ? 'text-green-600' : 'text-orange-500'}>
                          Distancia: {formatDistance(distanceToRoom)}
                          {distanceToRoom > MAX_DISTANCE_METERS && ` (debes estar a menos de ${MAX_DISTANCE_METERS}m)`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">
                  Habilita la ubicación para validar distancia a las salas
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Navigation className="w-4 h-4 mr-2" />
                )}
                Actualizar ubicación
              </Button>
            </CardContent>
          </Card>

          {/* Scanner Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Escáner de Cámara
              </CardTitle>
              <CardDescription>
                Apunta la cámara hacia un código QR para escanear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                {scanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-4 border-emerald-500 rounded-lg animate-pulse" />
                    </div>
                    {processing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-12 h-12 mx-auto mb-2" />
                    <p>Cámara desactivada</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                {scanning ? (
                  <Button variant="outline" className="flex-1" onClick={stopScanning}>
                    Detener Escaneo
                  </Button>
                ) : (
                  <>
                    <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={startScanning}>
                      <Camera className="w-4 h-4 mr-2" />
                      Iniciar Cámara
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={processing}
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Scan Result */}
          <AnimatePresence>
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`border-2 ${scanResult === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {scanResult === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {scanResult === 'success' ? '¡Escaneo Exitoso!' : 'Error de Escaneo'}
                        </p>
                        <p className="text-sm text-gray-600">{resultMessage}</p>
                        {resultData?.pointsEarned && (
                          <Badge variant="secondary" className="mt-2">
                            +{resultData.pointsEarned} puntos
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>1. Habilita la ubicación en tu dispositivo</p>
              <p>2. Haz clic en "Iniciar Cámara" para activar el escáner</p>
              <p>3. Acércate a la sala (menos de {MAX_DISTANCE_METERS} metros)</p>
              <p>4. Apunta la cámara hacia un código QR válido</p>
              <p>5. El sistema validará tu ubicación y registrará tu asistencia</p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}

// Import Upload icon
import { Upload } from 'lucide-react';
