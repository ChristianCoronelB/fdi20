import { spawn } from 'child_process';
import { setInterval } from 'timers';

const PROJECT_DIR = '/home/z/my-project';

let serverProcess = null;
let isStarting = false;

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

async function checkServer() {
    try {
        const response = await fetch('http://localhost:3000');
        return response.ok || response.status === 401 || response.status === 404;
    } catch {
        return false;
    }
}

function startServer() {
    if (isStarting) return;
    isStarting = true;
    
    log('Starting Next.js server...');
    
    serverProcess = spawn('bun', ['run', 'dev'], {
        cwd: PROJECT_DIR,
        stdio: 'inherit',
        shell: true
    });
    
    serverProcess.on('exit', (code, signal) => {
        log(`Server exited with code ${code}, signal ${signal}`);
        serverProcess = null;
        isStarting = false;
    });
    
    serverProcess.on('error', (err) => {
        log(`Server error: ${err.message}`);
        serverProcess = null;
        isStarting = false;
    });
}

async function main() {
    log('Next.js server service started');
    
    startServer();
    
    // Keep alive check every 15 seconds
    setInterval(async () => {
        const isRunning = await checkServer();
        if (!isRunning && !isStarting) {
            log('Server not responding, restarting...');
            if (serverProcess) {
                serverProcess.kill();
                serverProcess = null;
            }
            startServer();
        }
    }, 15000);
}

main().catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
});
