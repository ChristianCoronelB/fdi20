# 💡 Fábrica de Ideas - Gestión y Participación en Eventos

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)

**Plataforma completa para gestión de eventos, conferencias y hackathons**

[Ver Demo](#) · [Reportar Bug](#) · [Solicitar Feature](#)

</div>

---

## 📱 Capturas de Pantalla

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   🏠 Dashboard Admin          📅 Agenda Usuario          🗺️ Mapa   │
│   ┌─────────────────────┐    ┌─────────────────────┐    ┌───────┐  │
│   │ 📊 Estadísticas     │    │ 🎯 Actividades      │    │ 📍    │  │
│   │ 👥 Usuarios: 1,250  │    │    del día          │    │ 🏢    │  │
│   │ 📅 Eventos: 45      │    │                     │    │ 📍    │  │
│   │ 🏆 Proyectos: 32    │    │ [Recordatorio]      │    │ 🏢    │  │
│   └─────────────────────┘    └─────────────────────┘    └───────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Características Principales

### 🔐 **Sistema de Autenticación**
- Login/Registro con JWT
- Roles: Admin, Organizador, Moderador, Participante
- Perfiles de usuario con avatar

### 📊 **Panel de Administración**
- Dashboard con estadísticas en tiempo real
- Gestión de eventos, salas y actividades
- Administración de usuarios y proyectos
- Sistema de votaciones
- Generación de códigos QR

### 📅 **Módulo de Agenda**
- Cronograma de actividades
- Filtros por tipo de evento
- Recordatorios y notificaciones
- Registro de asistencia

### 🗺️ **Mapa Interactivo**
- Ubicación de salas
- Geolocalización
- Integración con Google Maps
- Navegación paso a paso

### 🏆 **Gamificación**
- Sistema de puntos y niveles
- Ranking de participantes
- Logros y medallas
- Certificados de participación

### 📱 **PWA Ready**
- Instalable en móviles
- Modo offline
- Notificaciones push

---

## 🚀 Inicio Rápido

### Opción 1: Desarrollo Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/fabrica-de-ideas.git

# Entrar al directorio
cd fabrica-de-ideas

# Instalar dependencias
bun install

# Configurar base de datos
bunx prisma migrate dev

# Iniciar servidor
bun run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

### Opción 2: Despliegue en Vercel (Gratis)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🔧 Variables de Entorno

Crea un archivo `.env` con:

```env
# Base de datos
DATABASE_URL="file:./db/app.db"

# JWT (cambiar en producción)
JWT_SECRET="tu-clave-secreta-super-larga-minimo-32-caracteres"

# URL de la aplicación
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 📦 Tecnologías Utilizadas

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | Next.js 16 + React 19 |
| **Lenguaje** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 + shadcn/ui |
| **Base de datos** | Prisma + SQLite |
| **Animaciones** | Framer Motion |
| **Iconos** | Lucide React |
| **Estado** | Zustand |
| **Autenticación** | JWT + bcrypt |

---

## 📁 Estructura del Proyecto

```
fabrica-de-ideas/
├── 📁 prisma/
│   └── schema.prisma       # Esquema de base de datos
├── 📁 src/
│   ├── 📁 app/
│   │   ├── page.tsx        # Página principal (SPA)
│   │   └── 📁 api/         # Endpoints REST
│   ├── 📁 components/
│   │   └── 📁 ui/          # Componentes shadcn/ui
│   └── 📁 lib/
│       ├── auth.ts         # Funciones de autenticación
│       └── db.ts           # Cliente Prisma
├── 📁 public/              # Archivos estáticos
├── Dockerfile              # Imagen Docker
├── docker-compose.yml      # Orquestación
└── GUIA_PRINCIPIANTES.md   # Guía de despliegue
```

---

## 🎯 Guías Disponibles

| Guía | Descripción |
|------|-------------|
| [GUIA_PRINCIPIANTES.md](./GUIA_PRINCIPIANTES.md) | Guía paso a paso para principiantes |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Guía técnica de despliegue |
| [deploy.sh](./deploy.sh) | Script automatizado |

---

## 📱 Credenciales de Prueba

```
Admin:
Email: admin@fabricadeideas.com
Password: admin123
```

---

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Hecho con ❤️ para la comunidad de innovadores**

[⬆ Volver arriba](#-fábrica-de-ideas---gestión-y-participación-en-eventos)

</div>
