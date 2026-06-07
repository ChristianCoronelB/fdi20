#!/usr/bin/env node
/**
 * Next.js Server Supervisor
 * This service monitors and restarts the Next.js server automatically
 */

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
    projectDir: '/home/z/my-project',
    port: 3000,
    checkInterval: 10000,  // Check every 10 seconds
    startupTimeout: 30000, // Wait 30 seconds for server to start
    maxRestarts: 5,        // Max restarts per hour
    restartCooldown: 3000  // Wait 3 seconds between restarts
};

const LOG_FILE = path.join(CONFIG.projectDir, 'dev.log');
const PID_FILE = path.join(CONFIG.projectDir, 'server.pid');

let serverProcess = null;
let restartCount = 0;
let lastRestartTime = 0;
let isShuttingDown = false;

// Logging
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [SUPERVISOR] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
}

// Check if server is responding
function checkServer() {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: CONFIG.port,
            path: '/api/app-config',
            method: 'GET',
            timeout: 5000
        }, (res) => {
            resolve(res.statusCode < 500);
        });
        
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
            req.destroy();
            resolve(false);
        });
        req.end();
    });
}

// Kill any existing Next.js processes
function killExistingProcesses() {
    return new Promise((resolve) => {
        exec('pkill -9 -f "next dev" 2>/dev/null; pkill -9 -f "next-server" 2>/dev/null', () => {
            setTimeout(resolve, 2000);
        });
    });
}

// Start the server
async function startServer() {
    if (isShuttingDown) return false;
    
    // Check restart limit
    const now = Date.now();
    if (now - lastRestartTime < 3600000) { // Within 1 hour
        if (restartCount >= CONFIG.maxRestarts) {
            log(`Max restarts (${CONFIG.maxRestarts}) reached within 1 hour. Waiting...`);
            return false;
        }
    } else {
        restartCount = 0;
    }
    
    log('Starting Next.js server...');
    
    await killExistingProcesses();
    
    serverProcess = spawn('bun', ['run', 'dev'], {
        cwd: CONFIG.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
        detached: false
    });
    
    // Handle stdout
    serverProcess.stdout.on('data', (data) => {
        fs.appendFileSync(LOG_FILE, data);
    });
    
    // Handle stderr
    serverProcess.stderr.on('data', (data) => {
        fs.appendFileSync(LOG_FILE, data);
    });
    
    // Handle exit
    serverProcess.on('exit', (code, signal) => {
        log(`Server exited with code ${code}, signal ${signal}`);
        serverProcess = null;
        
        if (!isShuttingDown) {
            log('Server crashed, will restart...');
        }
    });
    
    serverProcess.on('error', (err) => {
        log(`Server error: ${err.message}`);
        serverProcess = null;
    });
    
    // Save PID
    if (serverProcess && serverProcess.pid) {
        fs.writeFileSync(PID_FILE, serverProcess.pid.toString());
    }
    
    // Wait for server to be ready
    log('Waiting for server to be ready...');
    const startTime = Date.now();
    
    while (Date.now() - startTime < CONFIG.startupTimeout) {
        await new Promise(r => setTimeout(r, 1000));
        const isReady = await checkServer();
        if (isReady) {
            log('Server is ready and responding!');
            restartCount++;
            lastRestartTime = Date.now();
            return true;
        }
    }
    
    log('Server failed to start within timeout');
    return false;
}

// Main supervision loop
async function supervise() {
    log('Supervisor started');
    
    // Initial start
    await startServer();
    
    // Monitoring loop
    setInterval(async () => {
        if (isShuttingDown) return;
        
        const isRunning = await checkServer();
        
        if (!isRunning) {
            log('Server not responding, checking process...');
            
            if (!serverProcess || !serverProcess.pid) {
                log('No server process found, restarting...');
                await startServer();
            } else {
                // Try to kill and restart
                log('Killing hung process...');
                await killExistingProcesses();
                await new Promise(r => setTimeout(r, CONFIG.restartCooldown));
                await startServer();
            }
        }
    }, CONFIG.checkInterval);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    log('Received SIGTERM, shutting down...');
    isShuttingDown = true;
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    log('Received SIGINT, shutting down...');
    isShuttingDown = true;
    if (serverProcess) {
        serverProcess.kill('SIGTERM');
    }
    process.exit(0);
});

// Start supervision
supervise().catch(err => {
    log(`Fatal error: ${err.message}`);
    process.exit(1);
});
