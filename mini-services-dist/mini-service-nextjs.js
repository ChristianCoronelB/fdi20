const { spawn } = require('child_process');

console.log('[nextjs-service] Starting Next.js development server on port 3000...');

const proc = spawn('bun', ['run', 'dev'], {
    cwd: '/home/z/my-project',
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' }
});

proc.on('error', (err) => console.error('[nextjs-service] Error:', err));
proc.on('exit', (code) => {
    console.log(`[nextjs-service] Exited with code ${code}`);
    process.exit(code);
});

process.on('SIGTERM', () => { proc.kill('SIGTERM'); process.exit(0); });
process.on('SIGINT', () => { proc.kill('SIGINT'); process.exit(0); });
