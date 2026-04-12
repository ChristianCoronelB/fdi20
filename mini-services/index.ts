import { spawn } from 'child_process';
import path from 'path';

const PORT = 3000;

console.log(`[nextjs-service] Starting Next.js on port ${PORT}...`);

const nextProcess = spawn('node', [
    path.join(__dirname, '..', 'node_modules', '.bin', 'next'),
    'dev',
    '-p', String(PORT)
], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
});

nextProcess.on('error', (err) => {
    console.error('[nextjs-service] Error:', err);
});

nextProcess.on('exit', (code) => {
    console.log(`[nextjs-service] Process exited with code ${code}`);
});

// Keep the service running
process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    process.exit(0);
});

process.on('SIGINT', () => {
    nextProcess.kill('SIGINT');
    process.exit(0);
});
