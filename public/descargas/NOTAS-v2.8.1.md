# Notas de Actualización v2.8.1

**Fecha de lanzamiento:** 4 de mayo de 2025

## Correcciones Incluidas

### 1. Error de Nodemailer Corregido
**Problema:** La funcionalidad de recuperación de contraseña generaba el error:
```
Module not found: Can't resolve 'nodemailer'
```

**Solución:** Se instaló el paquete `nodemailer` correctamente en las dependencias del proyecto.

---

### 2. Error de Serialización BigInt Corregido
**Problema:** La API de asistencia generaba el error:
```
TypeError: JSON.stringify cannot serialize BigInt.
```

**Ubicación:** `src/app/api/attendance/route.ts` línea 86

**Solución:** Se convirtió el valor COUNT de BigInt a Number:
```typescript
// Antes
const total = (countResult as any[])[0]?.count || 0;

// Después
const total = Number((countResult as any[])[0]?.count || 0);
```

---

### 3. Credenciales de Prueba Eliminadas
**Problema:** La pantalla de login mostraba credenciales de prueba visibles para cualquier usuario.

**Solución:** Se eliminó el alert con las credenciales de demostración por seguridad.

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
Opción A - Usando el ZIP descargado:
```bash
# Subir el archivo fabrica-de-ideas-v2.8.1-bun.zip al servidor
# Luego descomprimir sobrescribiendo los archivos
unzip -o fabrica-de-ideas-v2.8.1-bun.zip
```

Opción B - Usando Git (si tienes repositorio):
```bash
git pull origin main
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

1. Acceder a la aplicación
2. Verificar que el login funciona correctamente
3. Verificar que la pantalla de login NO muestra credenciales de prueba
4. Probar la funcionalidad de "Olvidé mi contraseña" (requiere configuración SMTP)

---

## Configuración de Email (Opcional)

Para que funcione la recuperación de contraseña, configurar en `.env`:

```env
# Configuración SMTP para envío de emails
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

**Para Gmail:** Necesitas generar una "Contraseña de aplicación" en tu cuenta de Google.

---

## Archivos Modificados

- `src/app/api/attendance/route.ts` - Corrección BigInt
- `src/app/page.tsx` - Eliminación de credenciales de prueba
- `package.json` - Agregado nodemailer
- `bun.lock` - Lockfile actualizado

---

## Tamaño del Paquete

- **Archivo:** `fabrica-de-ideas-v2.8.1-bun.zip`
- **Tamaño:** ~23 MB

---

## Soporte

Si encuentras algún problema después de la actualización:

1. Revisa los logs del servicio: `pm2 logs fabrica-de-ideas`
2. Verifica que la base de datos esté intacta
3. Asegúrate de haber ejecutado `bun install`

---

**Fábrica de Ideas - Sistema de Gestión de Eventos**
