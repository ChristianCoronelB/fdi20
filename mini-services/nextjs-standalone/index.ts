import { spawn } from 'child_process';

console.log('Iniciando servidor Next.js...');

const server = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    detached: true
});

server.on('exit', (code) => {
    console.log(`Servidor terminó con código: ${code}`);
});

server.on('error', (err) => {
    console.error('Error:', err);
});

// Mantener el proceso vivo
process.on('SIGINT', () => {
    console.log('Recibido SIGINT');
});

process.on('SIGTERM', () => {
    console.log('Recibido SIGTERM');
});

console.log('Servidor iniciado, PID:', server.pid);
