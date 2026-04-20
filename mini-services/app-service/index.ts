import { spawn } from 'child_process';

console.log('[Service] Iniciando servidor Next.js...');

const server = spawn('node', ['node_modules/.bin/next', 'dev', '-p', '3000'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit'
});

server.on('exit', (code) => {
    console.log('[Service] Servidor terminó con código:', code);
    process.exit(code || 0);
});

server.on('error', (err) => {
    console.error('[Service] Error:', err);
});
