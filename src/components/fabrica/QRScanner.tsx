'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react';
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
  const [isMounted, setIsMounted] = useState(false);
  
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef(false);

  const canScan = userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'MODERATOR' || userRole === 'EVALUATOR' || userRole === 'PARTICIPANT';

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      cleanupScanner();
    };
  }, []);

  // Cleanup function
  const cleanupScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        // Check if scanner is actually running before stopping
        if (isScanningRef.current) {
          await scannerRef.current.stop();
          isScanningRef.current = false;
        }
        // Clear the scanner
        scannerRef.current.clear();
      } catch (error) {
        // Silently ignore cleanup errors
        console.debug('Scanner cleanup:', error);
      }
      scannerRef.current = null;
    }
  }, []);

  // Process QR code via API
  const processQrCode = async (decodedText: string) => {
    if (processing) return;
    
    setProcessing(true);
    
    try {
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
        
        invalidateCache('/api/activities');
        invalidateCache('/api/attendance');
        invalidateCache('/api/achievements');
        invalidateCache('/api/dashboard');
        
        toast.success(data.data?.message || '¡Escaneo exitoso!');
        onScanSuccess?.(data.data);
        
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
    
    setTimeout(() => {
      setScanResult(null);
      setResultMessage('');
      setResultData(null);
    }, 4000);
  };

  const startScanner = async () => {
    if (!isMounted || !containerRef.current) return;
    
    setCameraError(null);
    
    try {
      // Clean up any existing scanner first
      await cleanupScanner();
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!isMounted) return;
      
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create unique ID for this scanner instance
      const scannerId = `qr-scanner-${Date.now()}`;
      
      // Create scanner element
      const scannerElement = document.createElement('div');
      scannerElement.id = scannerId;
      scannerElement.style.width = '100%';
      scannerElement.style.minHeight = '300px';
      
      // Clear container and add scanner element
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(scannerElement);
      
      // Create scanner instance
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;
      
      // Start scanning
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          processQrCode(decodedText);
        },
        () => {
          // Ignore scan failures (no QR in view)
        }
      );
      
      isScanningRef.current = true;
      setScanning(true);
      
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      if (isMounted) {
        setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
        toast.error('Error al iniciar la cámara');
      }
    }
  };

  const stopScanner = async () => {
    setScanning(false);
    await cleanupScanner();
    
    // Clear container
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    
    setScanResult(null);
    setResultMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessing(true);
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create temporary element for file scanning
      const tempId = `temp-scanner-${Date.now()}`;
      const tempElement = document.createElement('div');
      tempElement.id = tempId;
      tempElement.style.display = 'none';
      document.body.appendChild(tempElement);
      
      const html5QrCode = new Html5Qrcode(tempId);
      
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        await processQrCode(decodedText);
      } catch (scanError) {
        toast.error('No se pudo leer el código QR de la imagen');
      } finally {
        try {
          html5QrCode.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
        document.body.removeChild(tempElement);
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

  if (!isMounted) {
    return null;
  }

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
                ref={containerRef}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{ minHeight: scanning ? '300px' : '200px' }}
              >
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 pointer-events-none">
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

          {/* Instructions */}
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
