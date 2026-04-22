# Historial de Versiones - Fábrica de Ideas

## v2.1.4 - 2026-04-22

### Nuevas Funcionalidades
- **Módulo de Evaluación**: Sistema completo de evaluación con rúbrica de 6 criterios
  - Innovación y Creatividad (20%)
  - Viabilidad del Negocio (15%)
  - Impacto Social/Ambiental (15%)
  - Presentación y Comunicación (20%)
  - Potencial de Escalamiento (15%)
  - Equipo y Ejecución (15%)
- **Módulo de Reportes**: Generación de estadísticas y reportes
  - Estadísticas generales del evento
  - Reporte de proyectos por categoría
  - Reporte de evaluaciones
  - Top proyectos por evaluación
- **Dashboard**: Resumen de proyectos ganadores por categoría
- **Footer Global**: Footer personalizable con configuración

### Correcciones
- Corregidos diálogos de evaluación (Evaluar, Nueva Asignación)
- Corregido diálogo de cambio de contraseña en perfil de usuario
- Corregida eliminación de actividades
- Mejorada la búsqueda de proyectos en asignaciones

### Mejoras Técnicas
- Optimización del rendimiento general
- Mejoras en la gestión de estados de diálogos
- Actualización de dependencias

---

## v2.1.3 - 2026-04-21

### Nuevas Funcionalidades
- **Módulo de Evaluación**: Asignación de proyectos a evaluadores
- **Dashboard**: Resumen de proyectos ganadores por categoría
- **Perfil de Usuario**: Cambio de contraseña funcional

### Correcciones
- Corregido botón de eliminar actividades
- Corregido botón de asignación de evaluación
- Mejoras en estadísticas de reportes

---

## v2.1.2 - 2026-04-20

### Nuevas Funcionalidades
- **Módulo de Reportes**: Primer versión con estadísticas básicas
- **Evaluación**: Preparación del sistema de rúbricas

### Correcciones
- Correcciones generales de bugs

---

## v1.1.0 - 2026-04-18

### Nuevas Funcionalidades
- **Módulo Usuarios**: Agregado botón "Nuevo Usuario" para crear usuarios
- **Módulo Usuarios**: Búsqueda de usuarios funcional con filtrado en tiempo real
- **Módulo Usuarios**: Rol "Evaluador" agregado a las opciones de rol
- **Módulo Proyectos**: Campos adicionales para datos del proyecto (líder, institución, área, etc.)
- **Módulo Proyectos Participante**: Filtro por área para proyectos
- **Módulo Proyectos Participante**: Puntos ganados al votar (+5 puntos por voto)

### Correcciones
- **Módulo Actividades**: Corregido guardado de información del formulario
- **Módulo Proyectos**: Corregido registro de todos los campos del formulario
- **Módulo QR**: Funciones de copiar y descargar códigos QR funcionales
- **Módulo Configuración**: Todas las opciones de notificación funcionales

### Mejoras Técnicas
- API de proyectos actualizada con nuevos campos
- API de usuarios con creación de usuarios
- API de votos con sistema de puntos
- Base de datos actualizada con nuevos campos

---

## v1.0.0 - 2026-04-17

### Funcionalidades Iniciales
- Dashboard con estadísticas
- Gestión de eventos
- Gestión de actividades
- Gestión de proyectos
- Sistema de votación
- Escáner QR
- Sistema de gamificación
- Certificados
- Mapas interactivos

### Roles de Usuario
- Administrador
- Organizador
- Moderador
- Evaluador
- Participante

---

## Cómo Actualizar

1. Descarga la última versión
2. Descomprime el archivo
3. Ejecuta:
   ```bash
   bun install
   bun run db:generate
   bun run db:push
   bun run dev
   ```

4. Si tienes datos existentes, copia tu base de datos:
   ```bash
   cp tu-version-anterior/prisma/db/custom.db ./prisma/db/
   ```

---

## Requisitos del Sistema

- **Runtime**: Bun (recomendado) o Node.js 18+
- **Base de datos**: SQLite (incluido)
- **RAM**: 512MB mínimo
- **Disco**: 100MB mínimo
- **SO**: Windows Server 2016+, Linux, macOS

## Tecnologías

- Next.js 16.1.3
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma ORM
- SQLite
- shadcn/ui
