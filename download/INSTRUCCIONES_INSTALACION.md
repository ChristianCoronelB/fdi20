# Fábrica de Ideas - Guía de Instalación Local

## 📋 Requisitos Previos

Antes de instalar el proyecto, asegúrate de tener instalado:

1. **Bun** (recomendado) o **Node.js 18+**
   - Bun: https://bun.sh
   - Node.js: https://nodejs.org

2. **Git** para clonar el repositorio (opcional si descargas el ZIP)

---

## 🚀 Pasos de Instalación

### 1. Descomprimir el archivo
```bash
unzip fabrica-de-ideas.zip
cd fabrica-de-ideas
```

### 2. Instalar dependencias

Con **Bun** (recomendado):
```bash
bun install
```

O con **npm**:
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="file:./db/custom.db"
SESSION_SECRET="tu-clave-secreta-muy-segura-cambiar-en-produccion"
```

> ⚠️ **Importante:** Cambia `SESSION_SECRET` por una cadena aleatoria segura en producción.

### 4. Inicializar la base de datos
```bash
bun run db:push
```

### 5. Crear usuario administrador
```bash
bun run create-admin
```

### 6. Iniciar el servidor de desarrollo
```bash
bun run dev
```

### 7. Acceder a la aplicación
Abre tu navegador en: **http://localhost:3000**

---

## 🔐 Credenciales por defecto

Después de ejecutar `bun run create-admin`:

| Campo | Valor |
|-------|-------|
| **Email** | admin@fabricadeideas.com |
| **Password** | admin123 |

> ⚠️ **Importante:** Cambia estas credenciales inmediatamente en producción.

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia el servidor de desarrollo (puerto 3000) |
| `bun run build` | Compila para producción |
| `bun run start` | Inicia en modo producción |
| `bun run lint` | Verifica el código con ESLint |
| `bun run db:push` | Sincroniza el esquema de la base de datos |
| `bun run db:generate` | Genera el cliente de Prisma |
| `bun run db:seed` | Pobla la base de datos con datos de ejemplo |
| `bun run create-admin` | Crea el usuario administrador |

---

## 📁 Estructura del Proyecto

```
fabrica-de-ideas/
├── src/
│   ├── app/                 # Páginas y API routes (Next.js App Router)
│   │   ├── api/             # Endpoints del backend
│   │   │   ├── auth/        # Autenticación (login, register, logout)
│   │   │   ├── events/      # Gestión de eventos
│   │   │   ├── rooms/       # Gestión de salas
│   │   │   ├── activities/  # Gestión de actividades
│   │   │   ├── attendance/  # Control de asistencia
│   │   │   ├── qr/          # Códigos QR
│   │   │   ├── certificates/# Certificados
│   │   │   └── ...
│   │   └── page.tsx         # Página principal
│   ├── components/          # Componentes React
│   │   └── ui/              # Componentes UI (shadcn/ui)
│   ├── lib/                 # Utilidades y configuración
│   ├── hooks/               # Custom hooks
│   └── types/               # Tipos TypeScript
├── prisma/
│   ├── schema.prisma        # Esquema de la base de datos
│   └── seed.ts              # Datos iniciales
├── public/                  # Archivos estáticos
├── db/                      # Base de datos SQLite
└── create-admin.ts          # Script para crear admin
```

---

## ✨ Funcionalidades Principales

### Para Participantes
- ✅ Registro e inicio de sesión
- ✅ Agenda de actividades con filtros
- ✅ Registro de asistencia mediante QR
- ✅ Sistema de puntos y logros
- ✅ Certificados de participación
- ✅ Votación de proyectos

### Para Administradores
- ✅ Dashboard con estadísticas
- ✅ Gestión de eventos
- ✅ Gestión de salas con **georreferenciación**
- ✅ Gestión de actividades
- ✅ Generación de códigos QR
- ✅ Gestión de usuarios
- ✅ Configuración de plantillas de certificados

---

## 🔧 Solución de Problemas

### Error de base de datos
```bash
rm -f db/custom.db
bun run db:push
bun run create-admin
```

### Error de dependencias
```bash
rm -rf node_modules bun.lock
bun install
```

### Puerto en uso
El servidor usa el puerto 3000 por defecto. Si está en uso:
```bash
PORT=3001 bun run dev
```

### Error de Prisma
```bash
bun run db:generate
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión |
|------------|---------|
| Next.js | 16.x |
| React | 19.x |
| TypeScript | 5.x |
| Tailwind CSS | 4.x |
| shadcn/ui | Última |
| Prisma ORM | 6.x |
| SQLite | - |

---

## 📞 Soporte

Para reportar problemas o sugerir mejoras, contacta al equipo de desarrollo.

---

## 📄 Licencia

Este proyecto es privado y confidencial.

---

¡Disfruta usando **Fábrica de Ideas**! 🎉
