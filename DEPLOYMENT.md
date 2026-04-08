# 🚀 Guía de Despliegue - Fábrica de Ideas

Esta guía te ayudará a desplegar la aplicación en diferentes infraestructuras.

---

## 📋 Requisitos Previos

- Node.js 20+ o Bun
- 512MB RAM mínimo (1GB recomendado)
- 1GB de almacenamiento

---

## 1️⃣ Vercel (Recomendado - Gratuito)

La forma más fácil de desplegar la aplicación:

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Desplegar
vercel --prod
```

**O desde GitHub:**
1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno
3. Despliegue automático en cada push

---

## 2️⃣ Servidor VPS/Cloud (DigitalOcean, AWS, etc.)

### Opción A: Usando Docker

```bash
# 1. Clonar el repositorio en el servidor
git clone <tu-repo>
cd fabrica-de-ideas

# 2. Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con tus valores

# 3. Construir y ejecutar
docker-compose up -d --build

# 4. Verificar
docker-compose logs -f
```

### Opción B: Instalación Directa

```bash
# 1. Instalar Bun en el servidor
curl -fsSL https://bun.sh/install | bash

# 2. Clonar y configurar
git clone <tu-repo>
cd fabrica-de-ideas
cp .env.example .env

# 3. Instalar dependencias
bun install

# 4. Configurar base de datos
bunx prisma generate
bunx prisma migrate deploy
bunx prisma db seed  # Datos de prueba

# 5. Compilar
bun run build

# 6. Ejecutar con PM2 (producción)
npm install -g pm2
pm2 start bun --name "fabrica-de-ideas" -- run start
pm2 save
pm2 startup
```

---

## 3️⃣ PM2 + Nginx (Producción Recomendado)

### Configurar PM2

```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fabrica-de-ideas',
    script: 'bun',
    args: 'run start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Configurar Nginx

```nginx
# /etc/nginx/sites-available/fabrica-de-ideas
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/fabrica-de-ideas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### SSL con Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 4️⃣ Variables de Entorno Importantes

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de conexión a la base de datos | ✅ |
| `JWT_SECRET` | Clave secreta para JWT (mín. 32 chars) | ✅ |
| `NEXT_PUBLIC_APP_URL` | URL pública de la aplicación | ✅ |

---

## 5️⃣ Comandos Útiles

```bash
# Desarrollo
bun run dev

# Producción
bun run build
bun run start

# Base de datos
bunx prisma studio        # Abrir editor visual
bunx prisma migrate dev   # Crear migración
bunx prisma migrate deploy # Aplicar en producción

# Linting
bun run lint
```

---

## 6️⃣ Monitoreo

```bash
# Ver logs
pm2 logs fabrica-de-ideas

# Monitorear recursos
pm2 monit

# Estado de la aplicación
pm2 status
```

---

## 7️⃣ Backup de Base de Datos

```bash
# Crear backup
cp prisma/dev.db backups/dev-$(date +%Y%m%d).db

# Restaurar
cp backups/dev-20240101.db prisma/dev.db
```

---

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs` o `docker-compose logs`
2. Verifica las variables de entorno
3. Confirma que la base de datos existe
4. Revisa la conexión de red
