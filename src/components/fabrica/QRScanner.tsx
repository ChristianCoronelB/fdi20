'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle, Upload, Loader2 } from 'lucide-react';
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
  const [scanResult, setScanResult] = useState<'success' | 'error' | 'duplicate' | null>(null);
  const [resultMessage, setResultMessage] = useState('');
  const [resultData, setResultData] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const scannerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  const canScan = ['ADMIN', 'ORGANIZER', 'MODERATOR', 'EVALUATOR', 'PARTICIPANT'].includes(userRole);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
        // Check if already scanned
        if (data.data?.alreadyScanned) {
          setScanResult('duplicate');
          setResultMessage(data.data?.message || 'Este código ya fue escaneado');
          setResultData(data.data);
          toast.warning(data.data?.message || 'Código ya escaneado');
        } else {
          setScanResult('success');
          setResultMessage(data.data?.message || '¡Escaneo exitoso!');
          setResultData(data.data);
          
          invalidateCache('/api/activities');
          invalidateCache('/api/attendance');
          invalidateCache('/api/dashboard');
          
          toast.success(data.data?.message || '¡Escaneo exitoso!');
          onScanSuccess?.(data.data);
          
          if (navigator.vibrate) navigator.vibrate(200);
          
          // Stop scanner after success
          setTimeout(() => {
            if (mountedRef.current && scanning) stopScanner();
          }, 2000);
        }
      } else {
        setScanResult('error');
        const errorMsg = data.data?.message || data.error || 'Error al procesar el código';
        setResultMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      setScanResult('error');
      setResultMessage('Error de conexión');
      toast.error('Error de conexión');
    } finally {
      setProcessing(false);
    }

    setTimeout(() => {
      if (mountedRef.current) {
        setScanResult(null);
        setResultMessage('');
        setResultData(null);
      }
    }, 4000);
  };

  const startScanner = async () => {
    setCameraError(null);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const container = document.getElementById('scanner-container');
      if (!container) return;

      const scannerId = `qr-${Date.now()}`;
      container.innerHTML = '';
      
      const scannerDiv = document.createElement('div');
      scannerDiv.id = scannerId;
      scannerDiv.style.width = '100%';
      scannerDiv.style.minHeight = '300px';
      container.appendChild(scannerDiv);

      const html5QrCode = new Html5Qrcode(scannerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => processQrCode(decodedText),
        () => {}
      );

      setScanning(true);
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('No se pudo acceder a la cámara. Verifica los permisos.');
      toast.error('Error al iniciar la cámara');
    }
  };

  const stopScanner = async () => {
    setScanning(false);
    
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
      scannerRef.current = null;
    }

    const container = document.getElementById('scanner-container');
    if (container) container.innerHTML = '';
    
    setScanResult(null);
    setResultMessage('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessing(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      const tempId = `temp-${Date.now()}`;
      const tempDiv = document.createElement('div');
      tempDiv.id = tempId;
      tempDiv.style.display = 'none';
      document.body.appendChild(tempDiv);

      const html5QrCode = new Html5Qrcode(tempId);
      
      try {
        const decodedText = await html5QrCode.scanFile(file, true);
        await processQrCode(decodedText);
      } catch {
        toast.error('No se pudo leer el código QR de la imagen');
      } finally {
        html5QrCode.clear().catch(() => {});
        document.body.removeChild(tempDiv);
      }
    } catch (error) {
      toast.error('Error al procesar la imagen');
    } finally {
      setProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getResultStyles = () => {
    switch (scanResult) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'duplicate': return 'border-amber-500 bg-amber-50';
      default: return '';
    }
  };

  const getResultIcon = () => {
    switch (scanResult) {
      case 'success': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error': return <XCircle className="w-8 h-8 text-red-500" />;
      case 'duplicate': return <AlertCircle className="w-8 h-8 text-amber-500" />;
      default: return null;
    }
  };

  const getResultTitle = () => {
    switch (scanResult) {
      case 'success': return '¡Exitoso!';
      case 'error': return 'Error';
      case 'duplicate': return 'Ya Escaneado';
      default: return '';
    }
  };

  if (!canScan) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <QrCode className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tienes permisos para escanear códigos QR</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-500" />
          Escáner QR
        </h2>
        <p className="text-gray-500">Escanea códigos QR para registro de asistencia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escáner de Cámara
          </CardTitle>
          <CardDescription>Apunta la cámara hacia un código QR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden min-h-[200px]">
            <div id="scanner-container" style={{ minHeight: scanning ? '300px' : 'auto' }} />
            
            {!scanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
                <Camera className="w-12 h-12 mb-2" />
                <p>Presiona "Iniciar Cámara" para escanear</p>
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
              <Button variant="outline" className="flex-1" onClick={stopScanner} disabled={processing}>
                Detener Cámara
              </Button>
            ) : (
              <>
                <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={startScanner} disabled={processing}>
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Cámara
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {scanResult && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className={`border-2 ${getResultStyles()}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getResultIcon()}
                  <div>
                    <p className="font-semibold text-lg">{getResultTitle()}</p>
                    <p className="text-sm text-gray-600">{resultMessage}</p>
                    {resultData?.pointsEarned > 0 && (
                      <Badge className="mt-2 bg-emerald-500">+{resultData.pointsEarned} puntos</Badge>
                    )}
                    {resultData?.attendanceComplete && (
                      <Badge className="mt-2 bg-blue-500">Asistencia completa</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Card>
        <CardContent className="py-4 space-y-1 text-sm text-gray-600">
          <p>1. Presiona <strong>"Iniciar Cámara"</strong></p>
          <p>2. Apunta al código QR</p>
          <p>3. El escaneo es automático</p>
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
            <strong>Nota:</strong> Cada código QR solo puede escanearse una vez.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
