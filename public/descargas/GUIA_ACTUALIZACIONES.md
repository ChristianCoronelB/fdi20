# Guía de Actualizaciones - Fábrica de Ideas

## Cómo Probar Actualizaciones en tu Servidor Local con Bun

### 📋 Requisitos Previos
- **Bun** instalado (recomendado) - [Instalar Bun](https://bun.sh)
- SQLite3 (normalmente viene con Bun)
- El proyecto descargado y descomprimido

### Verificar instalación de Bun:
```bash
bun --version    # Debe mostrar la versión instalada
```

---

## 🔧 Error Común: "Cannot find module '@prisma/client-...'"

### Solución Rápida (Todos los sistemas)
```bash
bunx prisma generate
bunx prisma db push
bun run dev
```

### Solución Completa (si persiste el error)

```bash
# 1. Limpiar todo
rm -rf node_modules
rm -rf .next
rm -rf node_modules/.prisma

# 2. Reinstalar dependencias con Bun
bun install

# 3. Generar cliente Prisma
bunx prisma generate

# 4. Sincronizar base de datos
bunx prisma db push

# 5. Iniciar servidor
bun run dev
```

---

## 📥 Aplicar Actualizaciones

### Paso 1: Respaldar tu versión actual
```bash
# Crea una copia de seguridad
cp -r fabrica-de-ideas fabrica-de-ideas-backup
```

### Paso 2: Descargar nueva versión
- Descarga el archivo ZIP desde la página de descargas
- Descomprime en una carpeta nueva

### Paso 3: Migrar datos (si tienes datos importantes)
```bash
# Copiar base de datos existente
cp fabrica-de-ideas-backup/prisma/db/custom.db fabrica-de-ideas/prisma/db/
# o
cp fabrica-de-ideas-backup/db/custom.db fabrica-de-ideas/db/
```

### Paso 4: Instalar y ejecutar con Bun
```bash
cd fabrica-de-ideas
bun install
bunx prisma generate
bunx prisma db push
bun run dev
```

---

## 🚀 Usando el Script de Reparación Automática

El proyecto incluye un script automático para Bun:

### Mac/Linux:
```bash
chmod +x fix-prisma.sh
./fix-prisma.sh
```

### Windows (PowerShell):
```powershell
bunx prisma generate
bunx prisma db push
bun run dev
```

---

## 📁 Estructura de Archivos Importantes

```
fabrica-de-ideas/
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   └── db/
│       └── custom.db    # Base de datos SQLite
├── src/
│   ├── app/             # Páginas y APIs
│   └── components/      # Componentes React
├── package.json         # Dependencias
└── fix-prisma.sh        # Script de reparación
```

---

## ⚠️ Problemas Comunes y Soluciones

### Error: "Cannot find module"
**Solución:** Ejecuta `bunx prisma generate`

### Error: "Database is locked"
**Solución:** Cierra todas las conexiones y reinicia el servidor
```bash
# Matar procesos de Bun
pkill -f bun
bun run dev
```

### Error: "Table not found"
**Solución:** Ejecuta `bunx prisma db push`

### Error: "Port 3000 already in use"
**Solución:**
```bash
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# O simplemente matar todos los procesos Bun
pkill -f bun

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: "Bun not found"
**Solución:**
```bash
# Instalar Bun (Mac/Linux)
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"

# Reiniciar terminal después de instalar
```

### La página no carga cambios
**Solución:**
```bash
# Limpiar caché de Next.js
rm -rf .next
bun run dev
```

---

## 📋 Comandos Útiles con Bun

| Acción | Comando |
|--------|---------|
| Iniciar servidor | `bun run dev` |
| Detener servidor | `Ctrl + C` |
| Instalar dependencias | `bun install` |
| Limpiar caché | `rm -rf .next` |
| Reiniciar DB | `rm dev.db && bunx prisma db push` |
| Ver usuarios | `bunx prisma studio` |
| Construir para producción | `bun run build` |
| Ejecutar producción | `bun run start` |
| Generar Prisma | `bunx prisma generate` |
| Sincronizar DB | `bunx prisma db push` |

---

## 🔄 Flujo de Actualización Recomendado

```
1. Descargar nueva versión ZIP
       ↓
2. Detener servidor actual (Ctrl+C)
       ↓
3. Backup de base de datos
       ↓
4. Descomprimir nueva versión
       ↓
5. bun install
       ↓
6. bunx prisma generate
       ↓
7. bunx prisma db push (si hay cambios en schema)
       ↓
8. bun run dev
       ↓
9. Probar funcionalidades
       ↓
10. Reportar problemas si los hay
```

---

## 🆘 Soporte Técnico

Si tienes problemas que no puedes resolver:

1. **Revisa los logs del servidor** - Mira la terminal donde corre `bun run dev`
2. **Revisa la consola del navegador** - F12 → Console
3. **Limpia todo y reinstala:**
   ```bash
   rm -rf .next node_modules
   bun install
   bunx prisma generate
   bunx prisma db push
   bun run dev
   ```
4. **Verifica la versión de Bun:**
   ```bash
   bun --version  # Debe ser 1.0 o superior
   ```

---

## 📌 Notas Importantes

- **Siempre usa `bun` en lugar de `npm`** para mejor rendimiento
- **Bun es más rápido** que npm en instalación y ejecución
- Los comandos con `bunx` son equivalentes a `npx` pero con Bun
- Si tienes problemas con Bun, puedes usar npm como alternativa:
  ```bash
  npm install
  npx prisma generate
  npx prisma db push
  npm run dev
  ```

---

**Versión del Documento:** 2.0.0
**Servidor Recomendado:** Bun
**Última Actualización:** Enero 2025
