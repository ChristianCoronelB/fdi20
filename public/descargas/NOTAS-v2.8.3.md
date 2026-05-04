# Notas de Actualización v2.8.3

**Fecha de lanzamiento:** 4 de mayo de 2025

## Corrección Crítica - Diálogos de Evaluación en Scope Global

### Problema Corregido
Los diálogos del módulo de evaluación de proyectos (Nueva Asignación y Evaluación) no se mostraban al hacer clic en los botones correspondientes. El problema se debía a que los diálogos estaban ubicados DENTRO del bloque `AnimatePresence` que se renderiza condicionalmente.

### Solución Aplicada
- **Diálogos movidos al scope global** - Ahora están al mismo nivel que el diálogo de votación global
- **Ubicación correcta** - Fuera del bloque `AnimatePresence`, antes del footer
- **Renderizado garantizado** - Los diálogos ahora se renderizan independientemente del estado de animación

### Diálogos Corregidos
1. **Diálogo de Nueva Asignación** - Permite asignar proyectos a evaluadores
2. **Diálogo de Evaluación** - Permite calificar proyectos con los 6 criterios de la rúbrica

---

## Sistema de Calificación - Rúbrica sobre 100 Puntos

El sistema de evaluación utiliza una rúbrica con puntaje máximo de **100 puntos** distribuidos en 6 criterios:

| Criterio | Puntos Máx. | Descripción |
|----------|-------------|-------------|
| Innovación y Creatividad | 20 pts | Originalidad y creatividad de la propuesta |
| Viabilidad del Negocio | 15 pts | Factibilidad comercial y financiera |
| Impacto Social/Ambiental | 15 pts | Beneficio para la sociedad o medio ambiente |
| Pitch (Presentación) | 20 pts | Calidad de la presentación y comunicación |
| Potencial de Escalamiento | 10 pts | Capacidad de crecimiento y expansión |
| Entregable | 20 pts | Calidad del producto/servicio entregado |
| **TOTAL** | **100 pts** | |

### Características del Sistema de Evaluación
- Selectores dinámicos de puntos según el máximo de cada criterio
- Visualización de progreso en tiempo real
- Cálculo automático del puntaje total y porcentaje
- Comentarios opcionales por cada criterio
- Comentario general del evaluador
- Opciones de guardar borrador o enviar evaluación definitiva

---

## Instrucciones de Actualización en VPS Hostinger

### Paso 1: Respaldar Base de Datos
```bash
cd /var/www/fabrica-de-ideas
cp prisma/db/custom.db prisma/db/custom.db.backup
```

### Paso 2: Detener el Servicio
```bash
pm2 stop fabrica-de-ideas
```

### Paso 3: Actualizar Archivos
```bash
# Subir el archivo fabrica-de-ideas-v2.8.3-bun.zip al servidor
# Luego descomprimir sobrescribiendo los archivos
unzip -o fabrica-de-ideas-v2.8.3-bun.zip
```

### Paso 4: Instalar Dependencias
```bash
bun install
```

### Paso 5: Reiniciar el Servicio
```bash
pm2 restart fabrica-de-ideas
```

---

## Verificación de la Actualización

1. Iniciar sesión como Administrador u Organizador
2. Ir al módulo de **Evaluación** en el menú lateral
3. Verificar que al hacer clic en **"Nueva Asignación"** se abre el diálogo correctamente
4. Verificar que al hacer clic en **"Evaluar"** en un proyecto se abre el diálogo de evaluación
5. Verificar que los selectores de puntos funcionan correctamente (0-20, 0-15, 0-10 según el criterio)
6. Verificar que el puntaje total se calcula correctamente sobre 100 puntos

---

## Archivos Modificados

- `src/app/page.tsx` - Reubicación de diálogos de evaluación al scope global

---

## Tamaño del Paquete

- **Archivo:** `fabrica-de-ideas-v2.8.3-bun.zip`
- **Tamaño:** ~527 KB

---

## Historial de Cambios Recientes

| Versión | Fecha | Cambio Principal |
|---------|-------|------------------|
| v2.8.3 | 04/05/2025 | Diálogos de evaluación en scope global |
| v2.8.2 | 04/05/2025 | Intento de corrección de diálogos |
| v2.8.1 | 04/05/2025 | Error BigInt y credenciales de prueba |
| v2.8.0 | 04/05/2025 | Términos y condiciones, recuperación de contraseña |
| v2.7.9 | 30/04/2025 | Selector de puntos dinámico por criterio |

---

**Fábrica de Ideas - Sistema de Gestión de Eventos**
