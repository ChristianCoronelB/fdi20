# Fábrica de Ideas - v2.1.3

## Fecha de Actualización
Enero 2025

## Cambios en esta versión

### 1. Módulo de Perfil de Usuario - CORREGIDO ✅
- **Botón "Cambiar Contraseña"**: Ahora abre correctamente el diálogo de cambio de contraseña
- **Botón "Eliminar Mi Cuenta"**: Funciona correctamente con confirmación de texto y contraseña
- **Menú de usuario mejorado**: Agregada opción directa para cambiar contraseña desde el menú
- Cumple con la LOPDP Ecuador para eliminación de datos personales

### 2. Módulo de Evaluación - CORREGIDO Y MEJORADO ✅
- **Acceso para Administradores**: Ahora los roles ADMIN y ORGANIZER pueden acceder al módulo de evaluación
- **Pestañas del módulo**:
  - **Proyectos**: Lista de proyectos para evaluar con filtros (Todos, Pendientes, Evaluados)
  - **Asignaciones**: Solo visible para ADMIN/ORGANIZER - Gestiona asignaciones de evaluadores a proyectos
- **Botón "Evaluar"**: Ahora abre correctamente el formulario de evaluación
- **Botón "Nueva Asignación"**: Funciona correctamente, permite asignar evaluadores a proyectos
- **Búsqueda de proyectos**: Agregado campo de búsqueda en el diálogo de nueva asignación

### 3. Dashboard - MEJORADO ✅
- **Nueva sección "Top 3 Proyectos por Categoría"**: 
  - Muestra los 3 mejores proyectos de cada categoría
  - Ordenados por puntuación de evaluación
  - Visualización con medallas de oro, plata y bronce
  - Información del equipo y puntuación promedio

### 4. Sistema de Asignaciones - NUEVO ✅
- **Diálogo de Nueva Asignación**: 
  - Selector de evaluadores con roles EVALUATOR, ADMIN, ORGANIZER
  - Búsqueda de proyectos por nombre, equipo o categoría
  - Creación y eliminación de asignaciones
- **Lista de asignaciones**: 
  - Muestra evaluador, proyecto y estado (Completado/Pendiente)
  - Opción de eliminar asignaciones

## Archivos Modificados
- `src/app/page.tsx` - UI principal con diálogos de perfil, evaluación y asignaciones
- `src/app/api/evaluations/route.ts` - API de evaluaciones

## Nuevas Funcionalidades

### Diálogos Agregados:
1. **Diálogo de Perfil**: Información del usuario con puntos, nivel y rol
2. **Diálogo de Cambio de Contraseña**: Validación de contraseña actual y confirmación
3. **Diálogo de Eliminación de Cuenta**: Con advertencias y confirmación de texto
4. **Diálogo de Nueva Asignación**: Para asignar evaluadores a proyectos

### Estados Nuevos:
- `showProfileDialog` - Controla el diálogo de perfil
- `showChangePassword` - Controla el diálogo de cambio de contraseña
- `showDeleteAccountDialog` - Controla el diálogo de eliminación de cuenta
- `assignmentDialogOpen` - Controla el diálogo de nueva asignación
- `evaluationSubTab` - Controla las pestañas del módulo de evaluación
- `evaluatorAssignments` - Lista de asignaciones de evaluadores

## Instrucciones de Actualización

### Para Windows PowerShell:
```powershell
# 1. Detener el servidor si está corriendo (Ctrl+C)

# 2. Crear carpeta de actualización
New-Item -ItemType Directory -Force -Path "C:\fabrica-de-ideas-update"
Expand-Archive -Path "fabrica-de-ideas-v2.1.3-bun.zip" -DestinationPath "C:\fabrica-de-ideas-update" -Force

# 3. Respaldar base de datos
Copy-Item "C:\fabrica-de-ideas\prisma\dev.db" "C:\fabrica-de-ideas\prisma\dev.db.backup-v213"

# 4. Copiar archivos actualizados
Copy-Item -Recurse -Force "C:\fabrica-de-ideas-update\*" "C:\fabrica-de-ideas\"

# 5. Aplicar cambios en BD (si es necesario)
cd C:\fabrica-de-ideas
bun run db:push

# 6. Reiniciar el servidor
bun run dev
```

### Para Linux/Mac:
```bash
# 1. Detener el servidor

# 2. Descomprimir y copiar
unzip -o fabrica-de-ideas-v2.1.3-bun.zip -d /ruta/fabrica-de-ideas/

# 3. Aplicar migraciones
cd /ruta/fabrica-de-ideas
bun run db:push

# 4. Reiniciar
bun run dev
```

## Requisitos
- Bun runtime v1.0+
- Node.js 18+ (para compatibilidad)
- SQLite3

## Notas
- Esta actualización es compatible con la base de datos existente
- No se requieren migraciones de esquema nuevas
- Los datos existentes se conservan
- Los usuarios pueden gestionar su contraseña y eliminar su cuenta

---
Desarrollado para el evento Fábrica de Ideas
