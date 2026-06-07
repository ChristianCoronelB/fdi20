const { spawn, exec } = require('child_process');
const http = require('http');

const PROJECT_DIR = '/home/z/my-project';
const LOG_FILE = '/home/z/my-project/dev.log';

let serverProcess = null;
let isRestarting = false;

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

function checkServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: '/',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            resolve(res.statusCode === 200 || res.statusCode === 304 || res.statusCode === 302 || res.statusCode === 401 || res.statusCode === 404);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

function killExistingProcesses() {
    return new Promise((resolve) => {
        exec('pkill -f "next dev" 2>/dev/null; pkill -f "next-server" 2>/dev/null', () => {
            setTimeout(resolve, 2000);
        });
    });
}

async function startServer() {
    if (isRestarting) return;
    isRestarting = true;
    
    log('Starting Next.js server...');
    
    await killExistingProcesses();
    
    serverProcess = spawn('bun', ['run', 'dev'], {
        cwd: PROJECT_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        detached: false
    });
    
    serverProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });
    
    serverProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
    
    serverProcess.on('exit', (code, signal) => {
        log(`Server exited with code ${code}, signal ${signal}`);
        serverProcess = null;
        isRestarting = false;
    });
    
    serverProcess.on('error', (err) => {
        log(`Server error: ${err.message}`);
        serverProcess = null;
        isRestarting = false;
    });
    
    // Wait for server to start
    let attempts = 0;
    while (attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        const isRunning = await checkServer();
        if (isRunning) {
            log('Server is running!');
            isRestarting = false;
            return true;
        }
        attempts++;
    }
    
    log('Server failed to start within 30 seconds');
    isRestarting = false;
    return false;
}

async function main() {
    log('Keep-alive service started');
    
    // Initial start
    await startServer();
    
    // Check every 10 seconds
    setInterval(async () => {
        const isRunning = await checkServer();
        if (!isRunning && !isRestarting) {
            log('Server is not responding, restarting...');
            await startServer();
        }
    }, 10000);
}

main().catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
});
