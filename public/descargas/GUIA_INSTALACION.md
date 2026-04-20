# 🚀 Guía de Instalación y Pruebas Locales con Bun

## 📋 Requisitos Previos

### Instalar Bun (Recomendado)

Bun es un runtime de JavaScript ultra rápido, ideal para este proyecto.

#### Mac/Linux:
```bash
curl -fsSL https://bun.sh/install | bash
```

#### Windows (PowerShell):
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### Verificar instalación:
```bash
bun --version    # Debe mostrar la versión instalada
```

> **Nota:** Después de instalar Bun, cierra y vuelve a abrir tu terminal.

---

## 📥 Paso 1: Descargar y Descomprimir

### Opción A: Desde terminal
```bash
# Crear carpeta de proyectos
mkdir -p ~/proyectos
cd ~/proyectos

# Descomprimir el archivo descargado
unzip ~/Downloads/fabrica-de-ideas-descarga.zip -d fabrica-de-ideas
cd fabrica-de-ideas
```

### Opción B: Manual
1. Descomprime el archivo ZIP en tu carpeta de preferencia
2. Abre una terminal en esa carpeta

---

## ⚙️ Paso 2: Instalar Dependencias

```bash
# Con Bun (recomendado - más rápido)
bun install
```

> **Alternativa con npm:** Si prefieres usar npm, ejecuta `npm install`

---

## 🔧 Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cat > .env << 'ENVEOF'
DATABASE_URL="file:./dev.db"
JWT_SECRET="mi-secreto-jwt-super-seguro-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENVEOF
```

O crea el archivo manualmente con el siguiente contenido:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="mi-secreto-jwt-super-seguro-2024"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🗄️ Paso 4: Inicializar Base de Datos

```bash
# Crear la base de datos con Bun
bunx prisma generate
bunx prisma db push
```

> **Nota:** `bunx` es el equivalente a `npx` pero con Bun

---

## ▶️ Paso 5: Iniciar el Servidor

```bash
# Modo desarrollo (con recarga automática)
bun run dev
```

El servidor iniciará en: **http://localhost:3000**

Abre esta URL en tu navegador para ver la aplicación.

---

## 🧪 Paso 6: Probar la Aplicación

### Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Admin** | admin@fabricadeideas.com | admin123 |
| Organizador | organizer@fabricadeideas.com | org123 |
| Moderador | moderator@fabricadeideas.com | mod123 |
| Participante | user1@fabricadeideas.com | user123 |

### Checklist de Pruebas

#### 🔐 Autenticación
- [ ] Login con usuario admin
- [ ] Logout
- [ ] Login con diferentes roles

#### 👥 Gestión de Usuarios (Admin)
- [ ] Ver lista de usuarios
- [ ] Crear nuevo usuario
- [ ] Editar usuario existente
- [ ] Eliminar/desactivar usuario

#### 📅 Gestión de Eventos
- [ ] Crear nuevo evento
- [ ] Editar evento
- [ ] Ver detalles del evento

#### 🎯 Gestión de Actividades
- [ ] Crear nueva actividad
- [ ] Asignar sala y horario
- [ ] Generar código QR

#### 📊 Proyectos
- [ ] Ver lista de proyectos
- [ ] Votar por un proyecto
- [ ] Ver detalles

#### ⭐ Evaluaciones (Evaluador)
- [ ] Seleccionar proyecto
- [ ] Completar criterios de evaluación
- [ ] Guardar evaluación

#### 📱 QR Scanner (Participante)
- [ ] Escanear código QR
- [ ] Verificar registro de asistencia

#### 🏆 Logros y Gamificación
- [ ] Ver puntos acumulados
- [ ] Ver nivel actual
- [ ] Ver logros desbloqueados

---

## 🔄 Cómo Actualizar a una Nueva Versión

### Método 1: Reemplazar todo (recomendado)

```bash
# 1. Detén el servidor actual (Ctrl+C)

# 2. Haz backup de tu base de datos si tienes datos importantes
cp dev.db dev.db.backup

# 3. Elimina la carpeta anterior
cd ..
rm -rf fabrica-de-ideas

# 4. Descomprime la nueva versión
unzip ~/Downloads/fabrica-de-ideas-descarga.zip -d fabrica-de-ideas
cd fabrica-de-ideas

# 5. Restaura la base de datos si es necesario
cp ../dev.db.backup dev.db

# 6. Instala y ejecuta con Bun
bun install
bunx prisma generate
bunx prisma db push
bun run dev
```

### Método 2: Solo actualizar archivos específicos

```bash
# Descomprime solo los archivos que cambiaron
unzip -o fabrica-de-ideas-descarga.zip "src/*" -d fabrica-de-ideas

# Reinicia el servidor
bun run dev
```

---

## 🛠️ Solución de Problemas

### Error: "Cannot find module '@prisma/client'"
```bash
bunx prisma generate
bunx prisma db push
```

### Error: "Cannot find module" (general)
```bash
rm -rf node_modules
bun install
bunx prisma generate
```

### Error: "Database locked"
```bash
# Cerrar todas las conexiones
pkill -f bun
bun run db:push
```

### Error: "Port 3000 already in use"
```bash
# Encontrar y matar proceso en puerto 3000
lsof -i :3000
kill -9 <PID>

# O matar todos los procesos Bun
pkill -f bun

# O usar otro puerto
PORT=3001 bun run dev
```

### Error: "Prisma Client not found"
```bash
bunx prisma generate
```

### La página no carga cambios
```bash
# Limpiar caché de Next.js
rm -rf .next
bun run dev
```

### Error: "Bun command not found"
```bash
# Reinstalar Bun
# Mac/Linux:
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell):
powershell -c "irm bun.sh/install.ps1 | iex"

# Reiniciar terminal después de instalar
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
| Ver usuarios en DB | `bunx prisma studio` |
| Construir para producción | `bun run build` |
| Ejecutar producción | `bun run start` |
| Generar Prisma Client | `bunx prisma generate` |
| Sincronizar DB | `bunx prisma db push` |
| Ver versiones | `bun --version` |

---

## 📊 Flujo de Trabajo Recomendado

```
1. Descargar nueva versión
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
10. Reportar problemas
```

---

## 🆘 Soporte

Si encuentras algún problema:

1. **Revisa la consola del servidor** para ver errores
2. **Revisa la consola del navegador** (F12 → Console)
3. **Intenta limpiar y reinstalar:**
   ```bash
   rm -rf .next node_modules
   bun install
   bunx prisma generate
   bunx prisma db push
   bun run dev
   ```
4. Reporta el error con capturas de pantalla

---

## 💡 Alternativa con npm (si no puedes usar Bun)

Si por alguna razón no puedes usar Bun, puedes usar npm:

```bash
# Instalar dependencias
npm install

# Generar Prisma Client
npx prisma generate

# Crear base de datos
npx prisma db push

# Iniciar servidor
npm run dev
```

---

## 📌 Ventajas de usar Bun

| Característica | Bun | npm |
|----------------|-----|-----|
| Velocidad de instalación | ⚡ Ultra rápido | 🐢 Lento |
| Inicio del servidor | ⚡ Rápido | 🐢 Lento |
| Uso de memoria | ✅ Menor | ❌ Mayor |
| Compatibilidad | ✅ Node.js compatible | ✅ Nativo |

---

**Versión del Documento:** 2.0.0
**Servidor Recomendado:** Bun
**Última Actualización:** Enero 2025
