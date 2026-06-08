'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, MapPin, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { invalidateCache } from '@/hooks/use-data';

interface QRScannerProps {
  userRole: string;
  onScanSuccess?: (result: any) => void;
}

export function QRScanner({ userRole, onScanSuccess }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultData, setResultData] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerContainerId = 'qr-scanner-container';

  const canScan = userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'MODERATOR' || userRole === 'EVALUATOR' || userRole === 'PARTICIPANT';

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    setCameraError(null);
    
    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create scanner instance
      scannerRef.current = new Html5Qrcode(scannerContainerId);
      
      // Start scanning with camera
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        onScanFailure
      );
      
      setScanning(true);
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
      toast.error('Error al iniciar la cámara');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
    setScanning(false);
    setScanResult(null);
    setResultMessage('');
  };

  const handleScanSuccess = async (decodedText: string) => {
    // Prevent multiple scans while processing
    if (processing) return;
    
    setProcessing(true);
    
    try {
      // Process the scan via API
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: decodedText }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setScanResult('success');
        setResultMessage(data.data?.message || '¡Escaneo exitoso!');
        setResultData(data.data);
        
        // Invalidate cache to refresh data
        invalidateCache('/api/activities');
        invalidateCache('/api/attendance');
        invalidateCache('/api/achievements');
        invalidateCache('/api/dashboard');
        
        toast.success(data.data?.message || '¡Escaneo exitoso!');
        
        // Call success callback
        onScanSuccess?.(data.data);
        
        // Vibrate on success (mobile)
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      } else {
        setScanResult('error');
        setResultMessage(data.error || 'Error al procesar el código QR');
        toast.error(data.error || 'Error al procesar el código QR');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult('error');
      setResultMessage('Error de conexión. Intenta de nuevo.');
      toast.error('Error de conexión');
    } finally {
      setProcessing(false);
    }
    
    // Clear result after 4 seconds
    setTimeout(() => {
      setScanResult(null);
      setResultMessage('');
      setResultData(null);
    }, 4000);
  };

  const onScanFailure = (error: any) => {
    // Ignore scan failures (normal when no QR is in view)
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessing(true);
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');
      
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        await handleScanSuccess(decodedText);
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
              <div 
                id={scannerContainerId}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{ minHeight: scanning ? '300px' : '200px' }}
              >
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
                    <Camera className="w-12 h-12 mb-2" />
                    <p className="text-center">Presiona "Iniciar Cámara" para escanear</p>
                  </div>
                )}
              </div>
              
              {cameraError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {cameraError}
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                {scanning ? (
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={stopScanner}
                    disabled={processing}
                  >
                    Detener Cámara
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" 
                      onClick={startScanner}
                      disabled={processing}
                    >
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
                      title="Subir imagen con QR"
                    >
                      {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
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
                <Card className={`border-2 ${scanResult === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {scanResult === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {scanResult === 'success' ? '¡Escaneo Exitoso!' : 'Error'}
                        </p>
                        <p className="text-sm text-gray-600">{resultMessage}</p>
                        {resultData?.pointsEarned && resultData.pointsEarned > 0 && (
                          <Badge className="mt-2 bg-emerald-500">
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

          {/* Instructions - Simplified */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Cómo usar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>1. Presiona <strong>"Iniciar Cámara"</strong></p>
              <p>2. Apunta al código QR</p>
              <p>3. El escaneo es automático</p>
              <p className="text-gray-400 text-xs mt-2">
                También puedes subir una imagen con un código QR
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  );
}
