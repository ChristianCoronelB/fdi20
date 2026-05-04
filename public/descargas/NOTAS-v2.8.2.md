# Notas de Actualización v2.8.2

**Fecha de lanzamiento:** 4 de mayo de 2025

## Corrección Importante - Diálogos de Evaluación

### Problema Corregido
Los diálogos del módulo de evaluación de proyectos no se mostraban correctamente porque estaban ubicados dentro del bloque `AnimatePresence` que se renderiza condicionalmente.

### Solución Aplicada
- **Movidos los diálogos de evaluación y asignación** fuera del bloque `AnimatePresence`
- Ahora los diálogos están en el scope global, al mismo nivel que el diálogo de votación
- Agregado comentario explicativo para futuras referencias

### Diálogos Corregidos
1. **Diálogo de Nueva Asignación** - Permite asignar proyectos a evaluadores
2. **Diálogo de Evaluación** - Permite calificar proyectos con los 6 criterios:
   - Innovación y Creatividad (máx. 20 pts)
   - Viabilidad del Negocio (máx. 15 pts)
   - Impacto Social/Ambiental (máx. 15 pts)
   - Pitch - Presentación y Comunicación (máx. 20 pts)
   - Potencial de Escalamiento (máx. 10 pts)
   - Entregable (máx. 20 pts)

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
# Subir el archivo fabrica-de-ideas-v2.8.2-bun.zip al servidor
# Luego descomprimir sobrescribiendo los archivos
unzip -o fabrica-de-ideas-v2.8.2-bun.zip
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
3. Verificar que al hacer clic en **"Nueva Asignación"** se abre el diálogo
4. Verificar que al hacer clic en **"Evaluar"** en un proyecto se abre el diálogo de evaluación
5. Verificar que los selectores de evaluador y proyecto funcionan correctamente

---

## Archivos Modificados

- `src/app/page.tsx` - Reubicación de diálogos de evaluación fuera de AnimatePresence

---

## Tamaño del Paquete

- **Archivo:** `fabrica-de-ideas-v2.8.2-bun.zip`
- **Tamaño:** ~23 MB

---

## Historial de Cambios Recientes

| Versión | Fecha | Cambio Principal |
|---------|-------|------------------|
| v2.8.2 | 04/05/2025 | Corrección de diálogos de evaluación |
| v2.8.1 | 04/05/2025 | Error BigInt y credenciales de prueba |
| v2.8.0 | 04/05/2025 | Términos y condiciones, recuperación de contraseña |
| v2.7.9 | 30/04/2025 | Selector de puntos dinámico por criterio |

---

**Fábrica de Ideas - Sistema de Gestión de Eventos**
