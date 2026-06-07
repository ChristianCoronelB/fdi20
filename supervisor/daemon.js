// Supervisor definitivo para Next.js - Mantiene el servidor siempre activo
const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const PROJECT_DIR = '/home/z/my-project';
const LOG_FILE = '/home/z/my-project/supervisor/daemon.log';
const DEV_LOG = '/home/z/my-project/dev.log';

let serverProcess = null;
let restartCount = 0;
let lastRestart = 0;

function log(message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    console.log(line.trim());
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) {}
}

function checkHTTP() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: '/',
            method: 'GET',
            timeout: 8000
        }, (res) => {
            resolve(res.statusCode === 200);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

function killOldProcesses() {
    return new Promise((resolve) => {
        exec('pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null', () => {
            setTimeout(resolve, 2000);
        });
    });
}

async function startServer() {
    const now = Date.now();
    
    // Evitar reinicios muy frecuentes
    if (now - lastRestart < 10000) {
        log('⏳ Esperando antes de reiniciar...');
        await new Promise(r => setTimeout(r, 5000));
    }
    
    lastRestart = now;
    restartCount++;
    
    log(`🚀 Iniciando servidor (intento #${restartCount})...`);
    
    await killOldProcesses();
    
    // Limpiar log de desarrollo
    try {
        fs.writeFileSync(DEV_LOG, '');
    } catch (e) {}
    
    serverProcess = spawn('bun', ['run', 'dev'], {
        cwd: PROJECT_DIR,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    serverProcess.stdout.on('data', (data) => {
        try {
            fs.appendFileSync(DEV_LOG, data);
        } catch (e) {}
    });
    
    serverProcess.stderr.on('data', (data) => {
        try {
            fs.appendFileSync(DEV_LOG, data);
        } catch (e) {}
    });
    
    serverProcess.on('error', (err) => {
        log(`❌ Error en proceso: ${err.message}`);
        serverProcess = null;
    });
    
    serverProcess.on('exit', (code, signal) => {
        log(`⚠️ Proceso terminado (código: ${code}, señal: ${signal})`);
        serverProcess = null;
    });
    
    // Esperar a que compile
    log('⏳ Esperando compilación...');
    await new Promise(r => setTimeout(r, 15000));
    
    // Verificar que responde
    const isUp = await checkHTTP();
    if (isUp) {
        log('✅ Servidor iniciado correctamente');
        return true;
    } else {
        log('❌ Servidor no responde después de iniciar');
        return false;
    }
}

async function monitor() {
    const isRunning = await checkHTTP();
    
    if (!isRunning) {
        log('⚠️ Servidor no responde, reiniciando...');
        await startServer();
    }
}

// Manejar señales para no morir
process.on('SIGTERM', () => log('📌 SIGTERM recibido, continuando...'));
process.on('SIGINT', () => log('📌 SIGINT recibido, continuando...'));
process.on('SIGHUP', () => log('📌 SIGHUP recibido, continuando...'));

// Capturar errores no manejados
process.on('uncaughtException', (err) => {
    log(`❌ Error no capturado: ${err.message}`);
});

process.on('unhandledRejection', (reason) => {
    log(`❌ Promesa rechazada: ${reason}`);
});

// INICIO
log('═══════════════════════════════════════════════════');
log('🚀 SUPERVISOR DEFINITIVO INICIADO');
log('═══════════════════════════════════════════════════');

// Iniciar servidor inmediatamente
startServer().then(() => {
    // Monitorear cada 20 segundos
    setInterval(monitor, 20000);
    
    // Log de estado cada minuto
    setInterval(async () => {
        const isUp = await checkHTTP();
        log(isUp ? '💚 Servidor OK' : '💔 Servidor DOWN');
    }, 60000);
});
