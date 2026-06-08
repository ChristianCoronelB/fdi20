'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, CheckCircle, XCircle, Upload, Loader2, AlertCircle, RepeatIcon } from 'lucide-react';
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
  const [resultMessage, setResultMessage] = useState<string>('');
  const [resultData, setResultData] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerKey, setScannerKey] = useState(0);
  
  // Use refs that persist across renders
  const scannerInstanceRef = useRef<any>(null);
  const scannerElementRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef(false);
  const mountedRef = useRef(true);
  
  // Track scanned codes in this session to prevent duplicate scans
  const scannedCodesRef = useRef<Set<string>>(new Set());

  const canScan = userRole === 'ADMIN' || userRole === 'ORGANIZER' || userRole === 'MODERATOR' || userRole === 'EVALUATOR' || userRole === 'PARTICIPANT';

  // Cleanup on unmount only
  useEffect(() => {
    mountedRef.current = true;
    
    return () => {
      mountedRef.current = false;
      // Cleanup scanner synchronously on unmount
      if (scannerInstanceRef.current && isScanningRef.current) {
        try {
          scannerInstanceRef.current.stop().then(() => {
            if (scannerInstanceRef.current) {
              scannerInstanceRef.current.clear();
            }
          }).catch(() => {});
        } catch (e) {
          // Ignore errors during unmount
        }
      }
    };
  }, []);

  // Process QR code via API
  const processQrCode = async (decodedText: string) => {
    if (processing) return;
    
    // Check if this code was already scanned in this session
    if (scannedCodesRef.current.has(decodedText)) {
      // Already scanned in this session, ignore
      return;
    }
    
    // Mark as processing and add to scanned set
    setProcessing(true);
    scannedCodesRef.current.add(decodedText);
    
    try {
      const res = await fetch('/api/qr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: decodedText }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Check if this was already scanned before (server-side check)
        if (data.data?.alreadyScanned) {
          setScanResult('duplicate');
          setResultMessage(data.data?.message || 'Este código ya fue escaneado anteriormente');
          setResultData(data.data);
          
          toast.warning(data.data?.message || 'Código ya escaneado');
          
          // Light vibration pattern for duplicate
          if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
        } else {
          setScanResult('success');
          setResultMessage(data.data?.message || '¡Escaneo exitoso!');
          setResultData(data.data);
          
          invalidateCache('/api/activities');
          invalidateCache('/api/attendance');
          invalidateCache('/api/achievements');
          invalidateCache('/api/dashboard');
          
          toast.success(data.data?.message || '¡Escaneo exitoso!');
          onScanSuccess?.(data.data);
          
          // Success vibration
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          // Stop scanner after successful scan to prevent accidental re-scans
          setTimeout(() => {
            if (mountedRef.current && isScanningRef.current) {
              stopScanner();
            }
          }, 2000);
        }
      } else {
        setScanResult('error');
        setResultMessage(data.error || 'Error al procesar el código QR');
        toast.error(data.error || 'Error al procesar el código QR');
        
        // Remove from scanned set on error so user can retry
        scannedCodesRef.current.delete(decodedText);
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult('error');
      setResultMessage('Error de conexión. Intenta de nuevo.');
      toast.error('Error de conexión');
      
      // Remove from scanned set on error so user can retry
      scannedCodesRef.current.delete(decodedText);
    } finally {
      setProcessing(false);
    }
    
    // Clear result after delay
    setTimeout(() => {
      if (mountedRef.current) {
        setScanResult(null);
        setResultMessage('');
        setResultData(null);
      }
    }, 5000);
  };

  const startScanner = async () => {
    if (!mountedRef.current) return;
    
    setCameraError(null);
    
    try {
      // Dynamically import html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (!mountedRef.current) return;
      
      // Create a unique ID for this scanner instance
      const scannerId = `qr-reader-${Date.now()}`;
      
      // Find or create the scanner container
      let container = document.getElementById('scanner-wrapper');
      if (!container) {
        console.error('Scanner wrapper not found');
        return;
      }
      
      // Create a new div element that React doesn't control
      const scannerDiv = document.createElement('div');
      scannerDiv.id = scannerId;
      scannerDiv.style.width = '100%';
      scannerDiv.style.minHeight = '300px';
      scannerDiv.style.borderRadius = '8px';
      scannerDiv.style.overflow = 'hidden';
      
      // Clear any existing content
      container.innerHTML = '';
      container.appendChild(scannerDiv);
      
      // Store reference to the element we created
      scannerElementRef.current = scannerDiv;
      
      // Create scanner instance
      const html5QrCode = new Html5Qrcode(scannerId);
      scannerInstanceRef.current = html5QrCode;
      
      // Debounce flag to prevent multiple rapid scans
      let isProcessingScan = false;
      
      // Start scanning
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText: string) => {
          // Prevent multiple rapid scans
          if (isProcessingScan || processing) return;
          
          isProcessingScan = true;
          
          if (mountedRef.current) {
            await processQrCode(decodedText);
          }
          
          // Reset processing flag after a delay
          setTimeout(() => {
            isProcessingScan = false;
          }, 3000);
        },
        () => {
          // Ignore scan failures (no QR in view)
        }
      );
      
      isScanningRef.current = true;
      if (mountedRef.current) {
        setScanning(true);
      }
      
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      if (mountedRef.current) {
        setCameraError('No se pudo acceder a la cámara. Verifica los permisos del navegador.');
        toast.error('Error al iniciar la cámara');
      }
    }
  };

  const stopScanner = async () => {
    if (!mountedRef.current) return;
    
    setScanning(false);
    
    try {
      if (scannerInstanceRef.current && isScanningRef.current) {
        await scannerInstanceRef.current.stop();
        isScanningRef.current = false;
      }
      
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear();
        scannerInstanceRef.current = null;
      }
    } catch (error) {
      console.debug('Error stopping scanner:', error);
    }
    
    // Clear the scanner container
    const container = document.getElementById('scanner-wrapper');
    if (container) {
      container.innerHTML = '';
    }
    scannerElementRef.current = null;
    
    // Reset state
    if (mountedRef.current) {
      setScanResult(null);
      setResultMessage('');
      setScannerKey(prev => prev + 1);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setProcessing(true);
    
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      // Create temporary element for file scanning outside React tree
      const tempId = `temp-scanner-${Date.now()}`;
      const tempElement = document.createElement('div');
      tempElement.id = tempId;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.visibility = 'hidden';
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
        // Remove temp element from DOM
        if (tempElement.parentNode) {
          tempElement.parentNode.removeChild(tempElement);
        }
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      if (mountedRef.current) {
        setProcessing(false);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get result card styling based on result type
  const getResultStyles = () => {
    switch (scanResult) {
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'duplicate':
        return 'border-amber-500 bg-amber-50';
      default:
        return '';
    }
  };

  const getResultIcon = () => {
    switch (scanResult) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />;
      case 'duplicate':
        return <AlertCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />;
      default:
        return null;
    }
  };

  const getResultTitle = () => {
    switch (scanResult) {
      case 'success':
        return '¡Escaneo Exitoso!';
      case 'error':
        return 'Error';
      case 'duplicate':
        return 'Código Ya Escaneado';
      default:
        return '';
    }
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
              {/* Scanner container - isolated from React's DOM management */}
              <div 
                key={scannerKey}
                className="relative bg-gray-900 rounded-lg overflow-hidden"
                style={{ minHeight: scanning ? '300px' : '200px' }}
              >
                {/* This div is managed by html5-qrcode, NOT React */}
                <div 
                  id="scanner-wrapper"
                  suppressHydrationWarning
                  style={{ width: '100%', minHeight: scanning ? '300px' : 'auto' }}
                />
                
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
                <Card className={`border-2 ${getResultStyles()}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getResultIcon()}
                      <div>
                        <p className="font-semibold text-lg">
                          {getResultTitle()}
                        </p>
                        <p className="text-sm text-gray-600">{resultMessage}</p>
                        {resultData?.pointsEarned && resultData.pointsEarned > 0 && (
                          <Badge className="mt-2 bg-emerald-500">
                            +{resultData.pointsEarned} puntos
                          </Badge>
                        )}
                        {scanResult === 'duplicate' && resultData?.attendanceComplete && (
                          <Badge className="mt-2 bg-amber-500">
                            Asistencia completada
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
              <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-amber-700 text-xs flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <strong>Importante:</strong> Cada código QR solo puede escanearse una vez
                </p>
              </div>
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
