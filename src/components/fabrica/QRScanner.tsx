'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QRScannerProps {
  userRole: string;
}

export function QRScanner({ userRole }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const canScan = userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'MODERATOR';

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const simulateScan = () => {
    // Simulate a successful scan for demo
    const types = ['ACTIVITY', 'PROJECT', 'ROOM'];
    const type = types[Math.floor(Math.random() * types.length)];
    const id = `demo-${Date.now()}`;
    setLastScan(`${type}:${id}`);
    setScanResult('success');
    setTimeout(() => setScanResult(null), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-500" />
          QR Scanner
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
                      <div className="w-48 h-48 border-4 border-emerald-500 rounded-lg" />
                    </div>
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
                  <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={startScanning}>
                    <Camera className="w-4 h-4 mr-2" />
                    Iniciar Cámara
                  </Button>
                )}
                <Button variant="outline" onClick={simulateScan}>
                  Simular Escaneo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scan Result */}
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`border-2 ${scanResult === 'success' ? 'border-green-500' : 'border-red-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {scanResult === 'success' ? (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-500" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {scanResult === 'success' ? '¡Escaneo Exitoso!' : 'Error de Escaneo'}
                      </p>
                      {lastScan && (
                        <p className="text-sm text-gray-500">{lastScan}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Instrucciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>1. Haz clic en "Iniciar Cámara" para activar el escáner</p>
              <p>2. Apunta la cámara hacia un código QR válido</p>
              <p>3. El sistema detectará automáticamente el código</p>
              <p>4. Verifica el resultado del escaneo en pantalla</p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
