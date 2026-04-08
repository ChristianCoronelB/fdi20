# 🏭 Fábrica de Ideas - Sistema de Gestión de Eventos

Plataforma profesional para gestión y participación en eventos con votación de proyectos, asistencia QR, mapas interactivos y gamificación.

## 🚀 Instalación Rápida

### Requisitos
- Node.js 18+ o Bun
- npm, yarn, pnpm o bun

### Pasos

```bash
# 1. Descomprimir el archivo ZIP
cd fabrica-de-ideas

# 2. Instalar dependencias
npm install
# o con bun (más rápido):
bun install

# 3. Configurar base de datos
npm run db:push

# 4. Poblar con datos de prueba
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

Abrir http://localhost:3000 en el navegador.

## 🔐 Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@fabricadeideas.com | admin123 |
| Organizador | organizer@fabricadeideas.com | admin123 |
| Moderador | moderator@fabricadeideas.com | admin123 |

## 📁 Estructura del Proyecto

```
fabrica-de-ideas/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos de prueba
├── src/
│   ├── app/
│   │   ├── api/           # 20+ endpoints REST
│   │   ├── layout.tsx     # Layout principal
│   │   └── page.tsx       # Aplicación SPA
│   ├── components/ui/     # Componentes shadcn/ui
│   ├── lib/               # Utilidades y auth
│   ├── store/             # Estado global (Zustand)
│   └── types/             # Tipos TypeScript
├── public/                # Archivos estáticos
└── package.json
```

## ✨ Funcionalidades

### Panel Administrativo
- Dashboard con estadísticas en tiempo real
- Gestión de eventos, salas, actividades
- Gestión de expositores y proyectos
- Sistema de votación configurable
- Generación de códigos QR
- Gestión de usuarios y roles

### Aplicación de Usuario
- Agenda de actividades
- Mapa interactivo del evento
- Sistema de votación de proyectos
- Escáner de códigos QR
- Ranking y tabla de líderes
- Sistema de logros y gamificación

### APIs REST
- Autenticación JWT con roles
- CRUD completo para todas las entidades
- Sistema de votación anti-fraude
- Registro de asistencia automático
- Certificados verificables

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI**: shadcn/ui, Lucide Icons, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM, SQLite
- **Auth**: JWT con bcrypt
- **Estado**: Zustand

## 🔧 Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo
npm run build     # Construir para producción
npm run start     # Servidor de producción
npm run lint      # Verificar código
npm run db:push   # Crear/actualizar base de datos
npm run db:seed   # Poblar con datos de prueba
```

## 🌙 Características

- ✅ Diseño responsivo (móvil y desktop)
- ✅ Modo oscuro/claro
- ✅ Animaciones fluidas
- ✅ Tiempo real
- ✅ PWA ready

## 📄 Licencia

MIT License - Libre para uso comercial y personal.

---

Desarrollado con ❤️ para Fábrica de Ideas
