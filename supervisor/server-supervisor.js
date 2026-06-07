// Servidor supervisor - mantiene el servidor Next.js siempre activo
const { spawn } = require('child_process');
const http = require('http');

const LOG_FILE = '/home/z/my-project/supervisor.log';
const fs = require('fs');

let serverProcess = null;
let isRestarting = false;

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
}

function checkServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET',
            timeout: 10000
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

function startServer() {
    if (isRestarting) return;
    isRestarting = true;
    
    log('🚀 Iniciando servidor Next.js...');
    
    // Matar procesos antiguos
    try {
        require('child_process').execSync('pkill -f "next dev" 2>/dev/null || true');
        require('child_process').execSync('pkill -f "next-server" 2>/dev/null || true');
    } catch (e) {}
    
    setTimeout(() => {
        serverProcess = spawn('bun', ['run', 'dev'], {
            cwd: '/home/z/my-project',
            detached: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        serverProcess.stdout.on('data', (data) => {
            fs.appendFileSync('/home/z/my-project/dev.log', data);
        });
        
        serverProcess.stderr.on('data', (data) => {
            fs.appendFileSync('/home/z/my-project/dev.log', data);
        });
        
        serverProcess.on('exit', (code) => {
            log(`⚠️ Servidor terminado con código: ${code}`);
            serverProcess = null;
        });
        
        log(`✅ Servidor iniciado con PID: ${serverProcess.pid}`);
        isRestarting = false;
    }, 2000);
}

async function monitor() {
    const isRunning = await checkServer();
    
    if (!isRunning) {
        log('⚠️ Servidor no responde, reiniciando...');
        startServer();
    } else {
        log('✓ Servidor funcionando correctamente');
    }
}

// Inicio
log('========== SUPERVISOR NODE.JS INICIADO ==========');

// Iniciar servidor inmediatamente
startServer();

// Monitorear cada 15 segundos
setInterval(monitor, 15000);

// Mantener el proceso vivo
process.on('SIGTERM', () => log('Recibido SIGTERM, ignorando...'));
process.on('SIGINT', () => log('Recibido SIGINT, ignorando...'));
