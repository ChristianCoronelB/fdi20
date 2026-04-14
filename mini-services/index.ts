import { spawn } from 'child_process';
import path from 'path';

const PORT = 3000;

console.log(`[fabrica-service] Starting Fábrica de Ideas on port ${PORT}...`);

const nextProcess = spawn('bun', [
    'run',
    'dev'
], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
});

nextProcess.on('error', (err) => {
    console.error('[fabrica-service] Error:', err);
});

nextProcess.on('exit', (code) => {
    console.log(`[fabrica-service] Process exited with code ${code}`);
});

process.on('SIGTERM', () => {
    nextProcess.kill('SIGTERM');
    process.exit(0);
});

process.on('SIGINT', () => {
    nextProcess.kill('SIGINT');
    process.exit(0);
});
