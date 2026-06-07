import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectDir = '/home/z/my-project';

function startServer() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Starting Next.js server...`);
    
    const server = spawn('bun', ['run', 'dev'], {
        cwd: projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });
    
    server.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    
    server.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    
    server.on('exit', (code, signal) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] Server exited with code ${code}, signal ${signal}. Restarting in 5 seconds...`);
        setTimeout(startServer, 5000);
    });
    
    server.on('error', (err) => {
        console.error('Failed to start server:', err);
        setTimeout(startServer, 5000);
    });
    
    return server;
}

startServer();

// Keep the process alive
setInterval(() => {
    // Heartbeat
}, 60000);
