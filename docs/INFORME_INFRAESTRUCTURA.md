# Informe de Infraestructura para Producción
## Fábrica de Ideas - Plataforma de Gestión de Eventos

---

## 1. Resumen Ejecutivo

Este informe presenta la estimación de recursos de infraestructura necesarios para desplegar la aplicación **Fábrica de Ideas** en un entorno de producción, considerando una demanda de **900 usuarios concurrentes** con aproximadamente **50 interacciones por usuario** durante el evento.

---

## 2. Stack Tecnológico Actual

### 2.1 Framework y Runtime
| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | Next.js | 16.x |
| Runtime | Bun | 1.3.x |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| UI | shadcn/ui | Latest |

### 2.2 Base de Datos
| Componente | Tecnología | Notas |
|------------|------------|-------|
| ORM | Prisma | 6.x |
| BD Actual | SQLite | Desarrollo |
| BD Producción | PostgreSQL | Recomendado |

### 2.3 Servicios Externos
| Servicio | Propósito | SDK |
|----------|-----------|-----|
| z-ai-web-dev-sdk | IA (LLM, VLM, TTS, etc.) | Integrado |
| OpenStreetMap | Mapas | iframe |
| QR Server | Generación QR | Externo |

### 2.4 Modelos de Datos (17 entidades)
- Users, Sessions, Events
- Rooms, Speakers, Activities
- Projects, Votes, VotingConfig
- Attendance, ActivityRegistration
- QRCode, Notifications, NotificationConfig
- Achievements, UserAchievement
- Certificates, CertificateTemplates
- AnalyticsEvent

---

## 3. Requisitos de Servidor

### 3.1 Especificaciones Mínimas Recomendadas

#### Servidor de Aplicación (Nodo Principal)

| Recurso | Especificación | Justificación |
|---------|----------------|---------------|
| **CPU** | 4 vCPU (2 núcleos físicos) | Next.js con SSR requiere procesamiento para cada request |
| **RAM** | 8 GB DDR4 | Node.js (1-2GB) + PostgreSQL (2-4GB) + Sistema + Cache |
| **Almacenamiento** | 100 GB SSD NVMe | Base de datos + assets + logs + sistema |
| **Red** | 1 Gbps | Para soportar tráfico concurrente |

#### Servidor de Base de Datos (Recomendado separado)

| Recurso | Especificación | Justificación |
|---------|----------------|---------------|
| **CPU** | 2 vCPU | Consultas optimizadas con índices |
| **RAM** | 4 GB | Cache de PostgreSQL + conexiones |
| **Almacenamiento** | 50 GB SSD | Base de datos + backups |
| **Red** | 1 Gbps | Conexión con servidor de aplicación |

### 3.2 Especificaciones Recomendadas (Alto Rendimiento)

#### Servidor de Aplicación

| Recurso | Especificación |
|---------|----------------|
| **CPU** | 8 vCPU (4 núcleos físicos) |
| **RAM** | 16 GB DDR4 |
| **Almacenamiento** | 200 GB SSD NVMe |
| **Red** | 1-10 Gbps |

#### Servidor de Base de Datos

| Recurso | Especificación |
|---------|----------------|
| **CPU** | 4 vCPU dedicados |
| **RAM** | 8 GB DDR4 |
| **Almacenamiento** | 100 GB SSD NVMe con IOPS alto |
| **Red** | 1 Gbps |

---

## 4. Servicios Requeridos

### 4.1 Sistema Operativo
```
- Ubuntu Server 22.04 LTS o 24.04 LTS
- Docker y Docker Compose (opcional pero recomendado)
- systemd para gestión de servicios
```

### 4.2 Servicios de Sistema

| Servicio | Propósito | Puerto |
|----------|-----------|--------|
| **SSH** | Acceso remoto seguro | 22 |
| **Nginx** | Proxy inverso / SSL | 80, 443 |
| **Certbot** | Certificados SSL Let's Encrypt | - |
| **UFW** | Firewall | - |
| **Fail2ban** | Protección contra ataques | - |

### 4.3 Servicios de Aplicación

| Servicio | Propósito | Puerto |
|----------|-----------|--------|
| **Node.js/Bun** | Runtime de Next.js | 3000 |
| **PostgreSQL** | Base de datos principal | 5432 |
| **PM2** | Gestor de procesos Node.js | - |
| **Redis** | Cache y sesiones (opcional) | 6379 |

### 4.4 Servicios de Monitoreo

| Servicio | Propósito | Puerto |
|----------|-----------|--------|
| **Prometheus** | Métricas del sistema | 9090 |
| **Grafana** | Dashboards de monitoreo | 3001 |
| **Uptime Kuma** | Monitoreo de disponibilidad | 3002 |

### 4.5 Servicios de Backup

| Servicio | Propósito |
|----------|-----------|
| **pg_dump** | Backups de PostgreSQL |
| **rsync** | Sincronización de archivos |
| **AWS S3 / Backblaze** | Almacenamiento de backups externo |

---

## 5. Estimación de Ancho de Banda

### 5.1 Cálculo de Tráfico

#### Parámetros Base
| Parámetro | Valor |
|-----------|-------|
| Usuarios totales | 900 |
| Interacciones por usuario | 50 |
| Duración del evento | 8 horas (28,800 segundos) |

#### Cálculo de Requests

```
Total de interacciones = 900 usuarios × 50 interacciones = 45,000 requests
Requests por segundo = 45,000 / 28,800 = 1.56 RPS (promedio)
Pico estimado = 1.56 × 5 (factor de pico) = 7.8 RPS
```

### 5.2 Tamaño Promedio de Requests

| Tipo de Request | Tamaño Request | Tamaño Response | Frecuencia |
|-----------------|----------------|-----------------|------------|
| Autenticación | 2 KB | 1 KB | 2% |
| Consulta lista | 1 KB | 50 KB | 20% |
| Consulta detalle | 1 KB | 10 KB | 30% |
| Crear/Actualizar | 5 KB | 2 KB | 15% |
| Votación | 2 KB | 1 KB | 20% |
| QR Scan | 3 KB | 5 KB | 10% |
| Carga de imágenes | 500 KB | 2 KB | 3% |

### 5.3 Cálculo de Ancho de Banda

#### Tráfico Promedio

```
Promedio request: 5 KB
Promedio response: 15 KB

Tráfico por request = 5 KB + 15 KB = 20 KB

Tráfico total = 45,000 × 20 KB = 900,000 KB = 900 MB
Tráfico por segundo = 900 MB / 28,800 s = 0.031 MB/s = 256 Kbps
```

#### Tráfico de Pico (considerando concurrencia)

```
Factor de pico = 10x durante momentos críticos
Tráfico de pico = 256 Kbps × 10 = 2.56 Mbps

Margen de seguridad = 3x
Ancho de banda recomendado = 2.56 × 3 = 7.68 Mbps
```

### 5.4 Ancho de Banda Total

| Escenario | Ancho de Banda |
|-----------|----------------|
| **Mínimo requerido** | 10 Mbps |
| **Recomendado** | 50 Mbps |
| **Ideal con overhead** | 100 Mbps |

### 5.5 Transferencia Mensual Estimada

```
Evento: 900 usuarios × 50 interacciones × 20 KB = 900 MB por evento
Eventos similares: 4 por mes = 3.6 GB
Uso normal (fuera de eventos): ~10 GB/mes
Total mensual: ~15-20 GB/mes
```

---

## 6. Estimación de Almacenamiento

### 6.1 Base de Datos

#### Estimación por Registro

| Tabla | Registros Estimados | Tamaño por Registro | Total |
|-------|---------------------|---------------------|-------|
| Users | 1,000 | 1 KB | 1 MB |
| Sessions | 2,000 | 0.5 KB | 1 MB |
| Events | 10 | 2 KB | 20 KB |
| Rooms | 50 | 1 KB | 50 KB |
| Activities | 200 | 1 KB | 200 KB |
| Projects | 100 | 2 KB | 200 KB |
| Votes | 9,000 | 0.5 KB | 4.5 MB |
| Attendance | 5,000 | 0.5 KB | 2.5 MB |
| Notifications | 10,000 | 0.5 KB | 5 MB |
| Certificates | 1,000 | 1 KB | 1 MB |
| QR Codes | 2,000 | 0.5 KB | 1 MB |
| Analytics | 50,000 | 0.5 KB | 25 MB |
| **Total BD** | | | **~50 MB** |

#### Con índices y overhead de PostgreSQL

```
Total con índices = 50 MB × 3 = 150 MB
Margen de crecimiento (1 año) = 500 MB
Total recomendado BD = 1 GB
```

### 6.2 Archivos Estáticos

| Tipo de Archivo | Cantidad | Tamaño Promedio | Total |
|-----------------|----------|-----------------|-------|
| Avatares usuarios | 900 | 100 KB | 90 MB |
| Fotos proyectos | 100 | 500 KB | 50 MB |
| Logos eventos | 10 | 200 KB | 2 MB |
| Certificados PDF | 1,000 | 200 KB | 200 MB |
| Assets públicos | - | - | 50 MB |
| **Total Archivos** | | | **~400 MB** |

### 6.3 Logs y Backups

| Tipo | Retención | Espacio |
|------|-----------|---------|
| Logs de aplicación | 30 días | 2 GB |
| Logs de acceso Nginx | 30 días | 1 GB |
| Backups diarios | 7 días | 5 GB |
| Backups semanales | 4 semanas | 20 GB |
| **Total** | | **~30 GB** |

### 6.4 Resumen de Almacenamiento

| Componente | Espacio |
|------------|---------|
| Sistema operativo | 10 GB |
| Aplicación | 2 GB |
| Base de datos | 1 GB |
| Archivos estáticos | 1 GB |
| Logs | 5 GB |
| Backups locales | 20 GB |
| Caché y temp | 5 GB |
| **Total recomendado** | **50-100 GB** |

---

## 7. Configuración de Red

### 7.1 Puertos Requeridos

| Puerto | Servicio | Acceso |
|--------|----------|--------|
| 22 | SSH | Solo IPs autorizadas |
| 80 | HTTP (redirect) | Público |
| 443 | HTTPS | Público |
| 3000 | Next.js | Solo localhost/Nginx |
| 5432 | PostgreSQL | Solo localhost/App server |
| 6379 | Redis (opcional) | Solo localhost |

### 7.2 Configuración DNS

```
fabricadeideas.com       A      IP_SERVIDOR
www.fabricadeideas.com   CNAME  fabricadeideas.com
api.fabricadeideas.com   A      IP_SERVIDOR
```

### 7.3 SSL/TLS

- Certificado SSL con Let's Encrypt
- Renovación automática con Certbot
- Configuración TLS 1.2/1.3
- HSTS habilitado

---

## 8. Estimación de Costos

### 8.1 Infraestructura Cloud (Mensual)

#### Opción 1: AWS

| Servicio | Especificación | Costo Estimado |
|----------|----------------|----------------|
| EC2 t3.medium | 2 vCPU, 4 GB RAM | $35-50/mes |
| RDS PostgreSQL | db.t3.medium | $50-70/mes |
| EBS Storage | 100 GB | $10/mes |
| S3 Storage | 50 GB | $1.15/mes |
| CloudFront CDN | 100 GB transfer | $8.50/mes |
| Load Balancer | Application LB | $20/mes |
| **Total AWS** | | **$125-160/mes** |

#### Opción 2: DigitalOcean

| Servicio | Especificación | Costo |
|----------|----------------|-------|
| Droplet | 4 vCPU, 8 GB RAM | $48/mes |
| Managed PostgreSQL | 2 vCPU, 4 GB | $60/mes |
| Spaces (S3 compatible) | 50 GB | $5/mes |
| Load Balancer | - | $12/mes |
| **Total DigitalOcean** | | **$125/mes** |

#### Opción 3: Hetzner (Más Económico)

| Servicio | Especificación | Costo |
|----------|----------------|-------|
| VPS CX41 | 4 vCPU, 16 GB RAM | ~$12/mes |
| PostgreSQL (mismo servidor) | Incluido | $0 |
| Storage Box | 100 GB | ~$4/mes |
| **Total Hetzner** | | **~$16-20/mes** |

### 8.2 Servicios Adicionales

| Servicio | Costo Mensual |
|----------|---------------|
| Dominio .com | $1/mes |
| Email (SendGrid/Postmark) | $15/mes |
| Monitoreo externo | $5/mes |
| CDN (si no incluido) | $10/mes |
| **Total adicionales** | **$31/mes** |

### 8.3 Costo Total Estimado

| Proveedor | Costo Mensual | Costo Anual |
|-----------|---------------|-------------|
| AWS | $155-190 | $1,860-2,280 |
| DigitalOcean | $155 | $1,860 |
| Hetzner | $50-60 | $600-720 |

---

## 9. Arquitectura Recomendada

### 9.1 Diagrama de Despliegue

```
                                    ┌─────────────────┐
                                    │   Cloudflare    │
                                    │   (CDN/DDoS)    │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Load Balancer  │
                                    │    (Nginx)      │
                                    └────────┬────────┘
                                             │
                      ┌──────────────────────┼──────────────────────┐
                      │                      │                      │
             ┌────────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
             │   App Server 1  │    │   App Server 2  │    │   App Server N  │
             │   (Next.js)     │    │   (Next.js)     │    │   (Next.js)     │
             │   PM2 Cluster   │    │   PM2 Cluster   │    │   PM2 Cluster   │
             └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
                      │                      │                      │
                      └──────────────────────┼──────────────────────┘
                                             │
                                    ┌────────▼────────┐
                                    │   PostgreSQL    │
                                    │   (Primary +    │
                                    │   Replica)      │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │     Redis       │
                                    │   (Cache/Ses)   │
                                    └─────────────────┘
```

### 9.2 Configuración de Nginx

```nginx
# /etc/nginx/sites-available/fabricadeideas
upstream nextjs_backend {
    least_conn;
    server 127.0.0.1:3000 weight=5;
    keepalive 64;
}

server {
    listen 80;
    server_name fabricadeideas.com www.fabricadeideas.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name fabricadeideas.com www.fabricadeideas.com;

    ssl_certificate /etc/letsencrypt/live/fabricadeideas.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fabricadeideas.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header HSTS "max-age=31536000; includeSubDomains" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript;

    # Static files cache
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache static_cache;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # All other requests
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 9.3 Configuración de PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'fabrica-de-ideas',
    script: '.next/standalone/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/fabrica',
      NEXTAUTH_SECRET: 'your-secret-key',
      NEXTAUTH_URL: 'https://fabricadeideas.com'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

---

## 10. Escalabilidad

### 10.1 Estrategia de Escalado

| Usuarios | Configuración |
|----------|---------------|
| 0-500 | 1 servidor (4 vCPU, 8 GB) |
| 500-2,000 | 2 servidores + LB |
| 2,000-5,000 | 3-4 servidores + LB + Redis |
| 5,000+ | Kubernetes + CDN global |

### 10.2 Métricas para Escalar

| Métrica | Umbral | Acción |
|---------|--------|--------|
| CPU > 80% | 5 min | Añadir servidor |
| RAM > 85% | 5 min | Escalar memoria |
| Requests > 100 RPS | Continuo | Escalar horizontalmente |
| DB Connections > 80% | - | Optimizar pool |

---

## 11. Seguridad

### 11.1 Checklist de Seguridad

- [ ] HTTPS obligatorio con TLS 1.2+
- [ ] Headers de seguridad (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting en API endpoints
- [ ] Validación de input en todos los formularios
- [ ] Sanitización de datos en uploads
- [ ] Autenticación con sesiones seguras
- [ ] Contraseñas hasheadas con bcrypt
- [ ] Backups encriptados
- [ ] Firewall configurado (UFW)
- [ ] Fail2ban para SSH
- [ ] Actualizaciones automáticas de seguridad

### 11.2 Rate Limiting Recomendado

```nginx
# En Nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location /api/auth/login {
    limit_req zone=login burst=5 nodelay;
    # ...
}

location /api {
    limit_req zone=api burst=20 nodelay;
    # ...
}
```

---

## 12. Procedimiento de Deployment

### 12.1 Pre-Deployment

1. Configurar servidor con Ubuntu 22.04
2. Instalar Docker/Docker Compose o servicios nativos
3. Configurar firewall (UFW)
4. Configurar SSL con Certbot
5. Configurar backups automatizados

### 12.2 Deployment

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/fabrica-de-ideas.git
cd fabrica-de-ideas

# 2. Instalar dependencias
bun install

# 3. Configurar variables de entorno
cp .env.example .env.production
nano .env.production

# 4. Generar cliente Prisma
bun run db:generate

# 5. Ejecutar migraciones
bun run db:migrate

# 6. Build de producción
bun run build

# 7. Iniciar con PM2
pm2 start ecosystem.config.js --env production

# 8. Guardar configuración PM2
pm2 save
pm2 startup
```

### 12.3 Post-Deployment

1. Verificar logs: `pm2 logs`
2. Verificar salud: `curl https://fabricadeideas.com/api/health`
3. Configurar monitoreo
4. Ejecutar pruebas de carga

---

## 13. Plan de Contingencia

### 13.1 Tiempos de Recuperación Objetivo

| Componente | RTO | RPO |
|------------|-----|-----|
| Aplicación | 15 min | 0 |
| Base de datos | 1 hora | 1 hora |
| Archivos estáticos | 4 horas | 24 horas |

### 13.2 Procedimientos de Backup

```bash
# Backup diario de PostgreSQL
pg_dump -U postgres fabrica > backup_$(date +%Y%m%d).sql

# Backup de archivos
rsync -avz /var/www/fabrica/uploads s3://bucket/backups/

# Backup automático con cron
0 2 * * * /scripts/backup.sh
```

---

## 14. Resumen y Recomendaciones

### 14.1 Especificación Mínima para 900 Usuarios

| Componente | Especificación |
|------------|----------------|
| CPU | 4 vCPU |
| RAM | 8 GB |
| Almacenamiento | 100 GB SSD |
| Ancho de banda | 50 Mbps |
| BD | PostgreSQL 15+ |
| Costo mensual | $50-150 USD |

### 14.2 Especificación Recomendada

| Componente | Especificación |
|------------|----------------|
| CPU | 8 vCPU |
| RAM | 16 GB |
| Almacenamiento | 200 GB SSD |
| Ancho de banda | 100 Mbps |
| BD | PostgreSQL (servidor dedicado) |
| Redis | Para caché y sesiones |
| Costo mensual | $100-200 USD |

### 14.3 Proveedor Recomendado por Presupuesto

| Presupuesto | Proveedor | Justificación |
|-------------|-----------|---------------|
| Bajo (< $50/mes) | Hetzner | Excelente relación costo/rendimiento |
| Medio ($50-150/mes) | DigitalOcean | Facilidad de uso, soporte |
| Alto (> $150/mes) | AWS/GCP | Escalabilidad, servicios managed |

---

## 15. Anexos

### 15.1 Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fabrica?schema=public"

# Authentication
NEXTAUTH_SECRET="your-super-secret-key-at-least-32-chars"
NEXTAUTH_URL="https://fabricadeideas.com"

# Application
NODE_ENV="production"
PORT=3000

# Optional: AI Services
Z_AI_API_KEY="your-api-key"

# Optional: Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="noreply@fabricadeideas.com"
SMTP_PASS="your-smtp-password"

# Optional: Storage
S3_BUCKET="fabrica-uploads"
S3_ACCESS_KEY="your-access-key"
S3_SECRET_KEY="your-secret-key"
S3_REGION="us-east-1"
```

### 15.2 Comandos Útiles

```bash
# Verificar estado de servicios
pm2 status
systemctl status postgresql
systemctl status nginx

# Ver logs
pm2 logs fabrica-de-ideas
tail -f /var/log/nginx/access.log

# Reiniciar servicios
pm2 restart all
sudo systemctl restart nginx

# Verificar recursos
htop
df -h
free -m
```

---

**Documento generado para Fábrica de Ideas**  
**Fecha:** Marzo 2025  
**Versión:** 1.0
