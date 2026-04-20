# Historial de Versiones - Fábrica de Ideas

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
   npm install
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

4. Si tienes datos existentes, copia tu base de datos:
   ```bash
   cp tu-version-anterior/prisma/db/custom.db ./prisma/db/
   ```
