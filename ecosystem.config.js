module.exports = {
  apps: [
    {
      name: 'fdi20',
      script: 'bun',
      args: 'run start',
      cwd: '/home/tu-usuario/fdi20', // CAMBIAR por tu ruta real en el VPS
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
    },
  ],
};
