# Historial de Versiones - Fábrica de Ideas

## v2.8.3 - 2025-05-04

### Corrección Definitiva - Diálogos de Evaluación en Scope Global

#### Problema
Los diálogos del módulo de evaluación (Nueva Asignación y Evaluación) no se mostraban al hacer clic. Estaban ubicados DENTRO del bloque `AnimatePresence` que se renderiza condicionalmente, causando que no fueran accesibles.

#### Solución
- **Diálogos movidos al scope global** - Después del diálogo de votación global
- **Fuera del AnimatePresence** - Renderizado independiente del estado de animación
- **Ubicación correcta** - Entre el diálogo de votación y el footer global

#### Sistema de Evaluación - Rúbrica 100 Puntos
| Criterio | Puntos Máx. |
|----------|-------------|
| Innovación y Creatividad | 20 pts |
| Viabilidad del Negocio | 15 pts |
| Impacto Social/Ambiental | 15 pts |
| Pitch (Presentación) | 20 pts |
| Potencial de Escalamiento | 10 pts |
| Entregable | 20 pts |
| **TOTAL** | **100 pts** |

#### Archivo
- `fabrica-de-ideas-v2.8.3-bun.zip` (~527 KB)

---

## v2.8.2 - 2025-05-04

### Corrección de Diálogos de Evaluación

#### Problema
Los diálogos del módulo de evaluación de proyectos no se mostraban correctamente. Estaban ubicados dentro del bloque `AnimatePresence` que se renderiza condicionalmente.

#### Solución
- **Movidos los diálogos de evaluación y asignación** fuera del bloque `AnimatePresence`
- Ahora los diálogos están en el scope global, accesibles desde cualquier vista
- Diálogos corregidos:
  - **Nueva Asignación** - Asignar proyectos a evaluadores
  - **Evaluación de Proyecto** - Calificar con los 6 criterios

#### Ubicación del Código
Los diálogos ahora están después del diálogo de votación global (línea 10942+) en `src/app/page.tsx`

---

## v2.8.1 - 2025-05-04

### Correcciones de Errores

#### Error de Nodemailer
- **Solucionado**: Error "Module not found: Can't resolve 'nodemailer'"
- Se instaló correctamente el paquete `nodemailer` para el sistema de envío de emails

#### Error de Serialización BigInt
- **Solucionado**: Error "JSON.stringify cannot serialize BigInt" en API de asistencia
- Corregido en `src/app/api/attendance/route.ts` convirtiendo valores COUNT a Number

#### Mejoras de Seguridad
- **Eliminadas credenciales de prueba** de la pantalla de login
- Removido el alert que mostraba usuario/contraseña de demostración

### Instrucciones de Actualización

```bash
# 1. Detener el servicio
pm2 stop fabrica-de-ideas

# 2. Respaldar base de datos
cp prisma/db/custom.db prisma/db/custom.db.backup

# 3. Actualizar archivos (descomprimir ZIP)

# 4. Instalar dependencias (incluye nodemailer)
bun install

# 5. Reiniciar el servicio
pm2 restart fabrica-de-ideas
```

---

## v2.8.0 - 2025-05-04

### Términos y Condiciones - Ley de Protección de Datos Ecuador

#### Nuevas Funcionalidades
- **Checkbox de términos y condiciones** obligatorio en el registro
- **Modal completo** con términos basados en la LOPDP (Ley Orgánica de Protección de Datos Personales del Ecuador)
- **Derechos ARCO** documentados para los usuarios
- **Campo acceptedTerms** guardado en la base de datos

### Recuperación de Contraseña por Email

#### Sistema Completo
- **Enlace "¿Olvidaste tu contraseña?"** en el login
- **Envío de emails** con token de recuperación (1 hora de validez)
- **Diálogo de restablecimiento** con validación de contraseñas
- **Email de confirmación** al cambiar contraseña

#### Configuración de Email
Variables en `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=contraseña-de-aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

#### APIs Nuevas
- `POST /api/auth/forgot-password` - Solicitar recuperación
- `GET /api/auth/reset-password` - Validar token
- `POST /api/auth/reset-password` - Restablecer contraseña

---

## v2.7.9 - 2025-04-30

### Selector de Puntos Dinámico por Criterio

#### Cambio Principal en el Sistema de Evaluación
- Cada criterio ahora se califica de 0 hasta su **peso máximo específico**
- **No más ponderación**: El puntaje total es la suma directa de todos los puntos

#### Escalas de Puntuación por Criterio:
- **Innovación y Creatividad**: 0 a 20 puntos
- **Viabilidad del Negocio**: 0 a 15 puntos
- **Impacto Social/Ambiental**: 0 a 15 puntos
- **Pitch (Presentación y Comunicación)**: 0 a 20 puntos
- **Potencial de Escalamiento**: 0 a 10 puntos
- **Entregable (Poster, PMV, Producto o Servicio)**: 0 a 20 puntos

#### Mejoras en la Interfaz:
- Selector visual de puntos con botones individuales para cada valor
- Barra de progreso visual que muestra el porcentaje alcanzado en cada criterio
- Indicación clara del máximo de puntos por criterio (ej: "Máx. 20 pts")
- Diseño responsivo con grid de botones adaptables

---

## v2.7.8 - 2025-04-29

### Módulo de Evaluación - Actualización Completa

#### Criterios de Evaluación con Pesos Correctos
- Innovación y Creatividad: 20% (máx. 20 pts)
- Viabilidad del Negocio: 15% (máx. 15 pts)
- Impacto Social/Ambiental: 15% (máx. 15 pts)
- Pitch - Presentación y Comunicación: 20% (máx. 20 pts)
- Potencial de Escalamiento: 10% (máx. 10 pts)
- Entregable (Poster, PMV, Producto o Servicio): 20% (máx. 20 pts)

#### Control de Evaluaciones
- Evaluaciones enviadas (SUBMITTED) no pueden ser modificadas por el evaluador
- Solo el administrador puede eliminar evaluaciones enviadas
- Múltiples evaluadores pueden evaluar el mismo proyecto

---

## v2.7.7 - 2025-04-29

### Corrección Crítica - API de Asignaciones
- **Error `assignedBy` missing**: Solucionado error PrismaClientValidationError al crear asignaciones
- **Campo session.userId corregido**: La interfaz JWTPayload usa `userId`, no `id`

---

## v2.2.1 - 2026-04-24

### Correcciones Importantes
- **Enum ActivityType**: Corregido error de Prisma Studio al leer tabla Activity
  - Agregados tipos faltantes: CHARLA_MAGISTRAL, PITCH, CEREMONY
  - Selectores de tipo de actividad actualizados en el frontend
- **API de Actividades**: Mejor manejo de errores y tipos dinámicos

### Módulo de Evaluación
- Sistema de asignación de proyectos a evaluadores activo
- Formulario de evaluación con rúbrica de 6 criterios:
  1. Innovación y Creatividad (20%)
  2. Viabilidad del Negocio (15%)
  3. Impacto Social/Ambiental (15%)
  4. Pitch - Presentación y Comunicación (20%)
  5. Potencial de Escalamiento (10%)
  6. Entregable - Poster, PMV, Producto o Servicio (20%)
- Búsqueda de proyectos en asignaciones
- Puntaje total automático sobre 100 puntos

---

## v2.2.0 - 2026-04-23

### Nuevas Funcionalidades
- **Módulo de Usuarios Corregido**: Botón "Guardar Cambios" funcional
- **Módulo de Actividades Corregido**: Guardado de información completo
- **Módulo de Evaluación Activado**: Formularios visibles y funcionales
- **Footer Global**: Implementado y configurable

---

## v2.1.5 - 2026-04-22

### Nuevas Funcionalidades
- **Módulo de Evaluación**: Sistema completo de evaluación con rúbrica de 6 criterios
- **Módulo de Reportes**: Generación de estadísticas y reportes
- **Dashboard**: Resumen de proyectos ganadores por categoría
- **Footer Global**: Footer personalizable con configuración

### Correcciones
- Corregidos diálogos de evaluación (Evaluar, Nueva Asignación)
- Corregido diálogo de cambio de contraseña en perfil de usuario
- Corregida eliminación de actividades
- Mejorada la búsqueda de proyectos en asignaciones

---

## v2.1.4 - 2026-04-22

### Nuevas Funcionalidades
- **Módulo de Evaluación**: Sistema completo de evaluación con rúbrica de 6 criterios
- **Módulo de Reportes**: Generación de estadísticas y reportes
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
