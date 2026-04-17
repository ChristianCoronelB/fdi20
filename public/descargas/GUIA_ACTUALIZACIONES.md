# Guía de Actualizaciones - Fábrica de Ideas

## Cómo Probar Actualizaciones en tu Servidor Local

### 📋 Requisitos Previos
- Node.js 18+ o Bun instalado
- SQLite3 (normalmente viene con Node)
- El proyecto descargado y descomprimido

---

## 🔧 Error Común: "Cannot find module '@prisma/client-...'"

### Solución Rápida (Windows)
```cmd
npx prisma generate
npx prisma db push
npm run dev
```

### Solución Rápida (Mac/Linux)
```bash
npx prisma generate
npx prisma db push
npm run dev
```

### Solución Completa (si persiste el error)

```bash
# 1. Limpiar todo
rm -rf node_modules
rm -rf .next
rm -rf node_modules/.prisma

# 2. Reinstalar dependencias
npm install
# o si usas bun: bun install

# 3. Generar cliente Prisma
npx prisma generate

# 4. Sincronizar base de datos
npx prisma db push

# 5. Iniciar servidor
npm run dev
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

### Paso 4: Instalar y ejecutar
```bash
cd fabrica-de-ideas
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## 🚀 Usando el Script de Reparación

El proyecto incluye un script automático:

### Mac/Linux:
```bash
chmod +x fix-prisma.sh
./fix-prisma.sh
```

### Windows:
```cmd
npx prisma generate
npx prisma db push
npm run dev
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

## ⚠️ Problemas Comunes

### Error: "Cannot find module"
**Solución:** Ejecuta `npx prisma generate`

### Error: "Database is locked"
**Solución:** Cierra todas las conexiones y reinicia el servidor

### Error: "Table not found"
**Solución:** Ejecuta `npx prisma db push`

### Error: "Port 3000 already in use"
**Solución:**
```bash
# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de usar Node.js 18+ o Bun

---

**Versión del Documento:** 1.0.0
**Última Actualización:** Enero 2025
