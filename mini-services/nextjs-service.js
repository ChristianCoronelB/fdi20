const { spawn } = require('child_process');
const path = require('path');

console.log('[nextjs-service] Starting...');

const next = spawn('node', [
    path.join(__dirname, '..', 'node_modules', '.bin', 'next'),
    'dev', '-p', '3000'
], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    detached: true
});

next.on('error', (err) => console.error('[nextjs-service] Error:', err));
next.on('exit', (code) => console.log('[nextjs-service] Exit:', code));

process.on('SIGTERM', () => {
    next.kill();
    process.exit(0);
});
