# Fábrica de Ideas - Instrucciones de Instalación

## 📋 Requisitos Previos

- **Node.js 18+** o **Bun** (recomendado)
- **npm**, **yarn**, **pnpm** o **bun**

## 🚀 Instalación Rápida

### Opción 1: Con Bun (Recomendado)

```bash
# 1. Descomprimir el archivo ZIP
unzip fabrica-de-ideas-proyecto.zip

# 2. Entrar al directorio
cd fabrica-de-ideas-proyecto

# 3. Instalar dependencias
bun install

# 4. Inicializar la base de datos
bun run db:push

# 5. Iniciar el servidor de desarrollo
bun run dev
```

### Opción 2: Con npm

```bash
# 1. Descomprimir el archivo ZIP
unzip fabrica-de-ideas-proyecto.zip

# 2. Entrar al directorio
cd fabrica-de-ideas-proyecto

# 3. Instalar dependencias
npm install

# 4. Inicializar la base de datos
npm run db:push

# 5. Iniciar el servidor de desarrollo
npm run dev
```

## 🔐 Usuarios de Prueba

Una vez iniciado el servidor, abre http://localhost:3000 en tu navegador.

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@fabrica.com | demo123 | 👑 Administrador |
| organizer@fabrica.com | demo123 | 📋 Organizador |
| evaluator@fabrica.com | demo123 | ⭐ Evaluador |
| participant@fabrica.com | demo123 | 👤 Participante |

## 📱 Funcionalidades por Rol

### 👑 Administrador
- Dashboard con estadísticas completas
- Gestión de usuarios (CRUD)
- Gestión de eventos y actividades
- Gestión de proyectos y evaluaciones
- Gestión de espacios/aulas
- Reportes y estadísticas

### 📋 Organizador
- Gestión de eventos
- Gestión de actividades
- Evaluación de proyectos

### ⭐ Evaluador
- Evaluación de proyectos con 6 criterios:
  - Innovación y Creatividad
  - Viabilidad del Negocio
  - Impacto Social/Ambiental
  - Presentación y Comunicación
  - Potencial de Escalamiento
  - Equipo y Ejecución

### 👤 Participante
- Dashboard personal
- Agenda de actividades
- Votación de proyectos
- Logros y gamificación
- Escáner QR para asistencia

## 🛠️ Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **shadcn/ui** - Componentes UI
- **Prisma** - ORM de base de datos
- **SQLite** - Base de datos
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx          # Página principal (aplicación completa)
│   ├── layout.tsx        # Layout raíz
│   ├── globals.css       # Estilos globales
│   └── api/              # API Routes
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   └── fabrica/          # Componentes específicos de la app
├── hooks/                # Custom hooks
├── lib/                  # Utilidades
├── store/                # Estado global (Zustand)
└── types/                # Tipos TypeScript
prisma/
├── schema.prisma         # Schema de base de datos
└── db/                   # Base de datos SQLite
```

## ❓ Solución de Problemas

### Error de base de datos
```bash
bun run db:push
# o
npm run db:push
```

### Error de dependencias
```bash
rm -rf node_modules
bun install
# o
rm -rf node_modules package-lock.json
npm install
```

### Puerto en uso
El servidor usa el puerto 3000 por defecto. Si está en uso:
```bash
PORT=3001 bun run dev
# o
PORT=3001 npm run dev
```

## 📞 Soporte

Si tienes algún problema, revisa la consola del navegador y del servidor para ver los mensajes de error.

---

**¡Disfruta Fábrica de Ideas!** 🚀
