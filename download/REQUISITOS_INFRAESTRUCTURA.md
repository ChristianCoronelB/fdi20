# 🏗️ Requisitos de Infraestructura - Fábrica de Ideas

## 📊 Escenario: 700 Usuarios Activos

---

## ⚠️ Limitaciones Actuales

La arquitectura actual tiene las siguientes limitaciones para 700 usuarios:

| Componente | Limitación | Impacto |
|------------|------------|---------|
| **SQLite** | Base de datos embebida, un solo archivo | No escala horizontalmente, bloqueos de escritura |
| **Sin caché** | Cada petición consulta la BD | Alto uso de CPU/IO |
| **Archivos estáticos** | Servidos desde el mismo servidor | Ancho de banda limitado |
| **Sin CDN** | Todo el tráfico va al servidor | Latencia alta para usuarios remotos |

---

## 🖥️ Opción 1: Servidor Único (Mínimo Recomendado)

### Hardware

| Recurso | Especificación | Justificación |
|---------|----------------|---------------|
| **CPU** | 4 vCPU | Procesamiento de requests, QR, PDFs |
| **RAM** | 8 GB | Next.js cache, sesiones, operaciones |
| **Almacenamiento** | 50 GB SSD | BD, logs, certificados, imágenes |
| **Ancho de banda** | 100 Mbps | 700 usuarios concurrentes |

### Software

```
Ubuntu 22.04 LTS
Node.js 20.x / Bun
PM2 (gestión de procesos)
Nginx (proxy reverso)
```

### Estimación de Costo
- **VPS Cloud:** $40-80 USD/mes
- **Proveedores:** DigitalOcean, Linode, Vultr, AWS EC2 t3.medium

---

## 🚀 Opción 2: Arquitectura Recomendada (Producción)

### Diagrama

```
                    ┌─────────────┐
                    │   CDN       │
                    │ (Cloudflare)│
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx     │
                    │ Load Balancer│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  Next.js    │  │  Next.js    │  │  Next.js    │
   │  Instancia 1│  │  Instancia 2│  │  Instancia 3│
   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │   Redis     │  │  PostgreSQL │  │   S3/MinIO  │
   │   (Caché)   │  │  (Base de   │  │  (Archivos) │
   │             │  │   datos)    │  │             │
   └─────────────┘  └─────────────┘  └─────────────┘
```

### Componentes Detallados

#### 1. Servidor de Aplicación (x2-3 instancias)

| Recurso | Especificación |
|---------|----------------|
| **CPU** | 2-4 vCPU cada uno |
| **RAM** | 4-8 GB cada uno |
| **Almacenamiento** | 20 GB SSD |

#### 2. Base de Datos PostgreSQL

| Recurso | Especificación |
|---------|----------------|
| **CPU** | 4 vCPU dedicadas |
| **RAM** | 8-16 GB |
| **Almacenamiento** | 100 GB SSD con backups |
| **Configuración** | Connection pooling (PgBouncer) |

#### 3. Redis (Caché y Sesiones)

| Recurso | Especificación |
|---------|----------------|
| **CPU** | 2 vCPU |
| **RAM** | 4-8 GB |
| **Uso** | Sesiones, caché de queries, rate limiting |

#### 4. Almacenamiento de Objetos (S3/MinIO)

| Recurso | Especificación |
|---------|----------------|
| **Capacidad** | 100+ GB |
| **Uso** | Certificados PDF, imágenes, QR codes |

#### 5. CDN (Cloudflare)

- Certificados SSL gratis
- Cacheo de estáticos
- Protección DDoS
- Reducción de latencia global

---

## 📦 Especificaciones por Componente

### Base de Datos: Migrar de SQLite a PostgreSQL

```sql
-- Cambios necesarios en schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Beneficios:**
- Soporta 700+ conexiones concurrentes
- Mejor rendimiento en escrituras
- Replicación y backups automáticos
- Índices optimizados

### Redis para Caché y Sesiones

```typescript
// Configuración de sesiones con Redis
import { Redis } from 'ioredis';
import session from 'express-session';
import connectRedis from 'connect-redis';

const redis = new Redis(process.env.REDIS_URL);
const RedisStore = connectRedis(session);

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));
```

**Beneficios:**
- Sesiones distribuidas entre instancias
- Cache de queries frecuentes
- Rate limiting
- Reducción de carga en BD

---

## 💰 Estimación de Costos Mensuales

### Opción Económica (VPS Único)

| Servicio | Proveedor | Costo |
|----------|-----------|-------|
| VPS 8GB | DigitalOcean | $48/mes |
| Dominio | Cloudflare | $10/año |
| Backups | Incluido | - |
| **Total** | | **~$50/mes** |

### Opción Recomendada (Producción)

| Servicio | Proveedor | Costo |
|----------|-----------|-------|
| App Servers (x2) | DigitalOcean | $48/mes |
| PostgreSQL | Managed DB | $15/mes |
| Redis | Managed | $15/mes |
| S3 Storage | AWS/DigitalOcean | $5/mes |
| CDN | Cloudflare | Gratis |
| Dominio | Cloudflare | $10/año |
| Load Balancer | DigitalOcean | $12/mes |
| **Total** | | **~$100-150/mes** |

### Opción Cloud (AWS/GCP)

| Servicio | Costo Estimado |
|----------|----------------|
| ECS/Fargate (2 tareas) | $50-80/mes |
| RDS PostgreSQL | $30-50/mes |
| ElastiCache Redis | $20-40/mes |
| S3 + CloudFront | $10-20/mes |
| ALB | $20/mes |
| **Total** | **$130-210/mes** |

---

## 📈 Métricas a Monitorear

### Aplicación
- [ ] Requests por segundo (RPS)
- [ ] Tiempo de respuesta (p50, p95, p99)
- [ ] Tasa de errores
- [ ] Uso de memoria Node.js

### Base de Datos
- [ ] Conexiones activas
- [ ] Queries lentas (>100ms)
- [ ] Uso de CPU
- [ ] IOPS

### Infraestructura
- [ ] CPU del servidor
- [ ] Memoria disponible
- [ ] Espacio en disco
- [ ] Tráfico de red

---

## 🔧 Cambios Necesarios en el Código

### 1. Migrar a PostgreSQL

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Agregar Connection Pooling

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

### 3. Agregar Caché Redis

```typescript
// src/lib/cache.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### 4. Rate Limiting

```typescript
// src/middleware.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(
  ip: string,
  limit: number = 100,
  window: number = 60
): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, window);
  }
  
  return current <= limit;
}
```

---

## 🚦 Recomendaciones por Fase

### Fase 1: Inicio (0-100 usuarios)
- ✅ VPS único con specs mínimas
- ✅ SQLite funciona correctamente
- ✅ Monitoreo básico

### Fase 2: Crecimiento (100-500 usuarios)
- ⚡ Migrar a PostgreSQL
- ⚡ Agregar Redis para caché
- ⚡ Configurar backups automáticos

### Fase 3: Escala (500-1000 usuarios)
- 🚀 Múltiples instancias de app
- 🚀 Load balancer
- 🚀 CDN para estáticos
- 🚀 Monitoreo avanzado

### Fase 4: Alto Tráfico (1000+ usuarios)
- 📈 Auto-scaling
- 📈 Base de datos replicada
- 📈 Microservicios si es necesario

---

## 📞 Resumen para 700 Usuarios Activos

### Mínimo Absoluto
```
VPS: 4 vCPU, 8GB RAM, 50GB SSD
BD: PostgreSQL (migrar de SQLite)
Costo: ~$50-80/mes
```

### Recomendado
```
App: 2 instancias de 2vCPU, 4GB RAM cada una
BD: PostgreSQL managed, 4vCPU, 8GB RAM
Caché: Redis, 2GB RAM
CDN: Cloudflare (gratis)
Costo: ~$100-150/mes
```

---

¿Necesitas que te ayude a implementar alguno de estos cambios en el código?
