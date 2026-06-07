// Supervisor simple - Solo reinicia si el servidor está caído
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const PORT = 3000;
const PROJECT_DIR = '/home/z/my-project';
const LOG_FILE = '/home/z/my-project/supervisor/watchdog.log';
const DEV_LOG = '/home/z/my-project/dev.log';

function log(msg) {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(line.trim());
    try { fs.appendFileSync(LOG_FILE, line); } catch(e) {}
}

function checkHTTP() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: PORT,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => resolve(res.statusCode === 200));
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
}

function startServer() {
    log('🚀 Iniciando servidor...');
    
    const proc = spawn('bun', ['run', 'dev'], {
        cwd: PROJECT_DIR,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    proc.stdout.on('data', (data) => {
        try { fs.appendFileSync(DEV_LOG, data); } catch(e) {}
    });
    
    proc.stderr.on('data', (data) => {
        try { fs.appendFileSync(DEV_LOG, data); } catch(e) {}
    });
    
    proc.unref();
    log(`✅ Servidor iniciado (PID: ${proc.pid})`);
}

// No capturar señales - dejar que el proceso viva
log('═══════════════════════════════════════');
log('🚀 WATCHDOG INICIADO');
log('═══════════════════════════════════════');

// Iniciar inmediatamente
startServer();

// Monitorear cada 30 segundos
setInterval(async () => {
    const ok = await checkHTTP();
    if (!ok) {
        log('⚠️ Servidor caído, reiniciando...');
        startServer();
    }
}, 30000);

// Log de estado cada 2 minutos
setInterval(async () => {
    const ok = await checkHTTP();
    log(ok ? '💚 OK' : '💔 DOWN');
}, 120000);
