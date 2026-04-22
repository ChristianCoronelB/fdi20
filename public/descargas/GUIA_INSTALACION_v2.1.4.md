# Fábrica de Ideas v2.1.4 - Guía de Instalación

## 📦 Contenido del Paquete

Este paquete incluye:
- Aplicación completa Next.js 16
- Base de datos SQLite configurada
- Scripts de inicialización
- Documentación técnica

---

## 🚀 Instalación Rápida con Bun (Recomendado)

### Paso 1: Instalar Bun
```bash
# En Windows (PowerShell):
powershell -c "irm bun.sh/install.ps1 | iex"

# En Linux/Mac:
curl -fsSL https://bun.sh/install | bash
```

### Paso 2: Descomprimir el proyecto
```bash
unzip fabrica-de-ideas-v2.1.4.zip
cd fabrica-de-ideas
```

### Paso 3: Instalar dependencias
```bash
bun install
```

### Paso 4: Configurar base de datos
```bash
bun run db:push
bun run db:seed
```

### Paso 5: Crear usuario administrador
```bash
bun run create-admin
```

### Paso 6: Iniciar la aplicación
```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 🖥️ Instalación en Windows Server

### Requisitos Previos
- Windows Server 2016 o superior
- PowerShell 5.1 o superior
- 512MB RAM mínimo
- 100MB espacio en disco

### Pasos de Instalación

1. **Instalar Bun para Windows:**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

2. **Reiniciar PowerShell** para aplicar los cambios

3. **Navegar al directorio del proyecto:**
```powershell
cd C:\ruta\a\fabrica-de-ideas
```

4. **Ejecutar script de instalación:**
```powershell
# Instalar dependencias
bun install

# Configurar base de datos
bun run db:push
bun run db:seed

# Crear administrador
bun run create-admin
```

5. **Iniciar el servidor:**
```powershell
bun run dev
```

6. **Configurar como servicio Windows (opcional):**
```powershell
# Usando NSSM (Non-Sucking Service Manager)
nssm install FabricaDeIdeas "C:\Users\TuUsuario\.bun\bin\bun.exe" "run" "dev" "--cwd" "C:\ruta\a\fabrica-de-ideas"
nssm start FabricaDeIdeas
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno (.env)
```env
DATABASE_URL="file:./prisma/db/custom.db"
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura"
NEXTAUTH_URL="http://localhost:3000"
```

### Puertos
Por defecto la aplicación usa el puerto 3000. Para cambiarlo:
```bash
bun run dev -p 4000
```

---

## 👤 Credenciales por Defecto

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@fabricadeideas.com | admin123 |
| Organizador | organizer@fabricadeideas.com | org123 |
| Moderador | moderator@fabricadeideas.com | mod123 |
| Evaluador | evaluator@fabricadeideas.com | eval123 |
| Participante | user1@fabricadeideas.com | user123 |

⚠️ **Importante:** Cambia estas contraseñas después del primer inicio.

---

## 📚 Módulos Disponibles

1. **Dashboard** - Estadísticas y resumen general
2. **Usuarios** - Gestión de usuarios y roles
3. **Eventos** - Administración de eventos
4. **Actividades** - Agenda y programación
5. **Proyectos** - Registro y seguimiento de proyectos
6. **Evaluación** - Sistema de evaluación con rúbrica
7. **Reportes** - Generación de informes
8. **Votación** - Sistema de votación pública
9. **QR Scanner** - Control de asistencia
10. **Logros** - Gamificación
11. **Certificados** - Generación automática
12. **Configuración** - Ajustes del sistema

---

## 🔍 Solución de Problemas

### Error: "Cannot find module"
```bash
bun install
```

### Error: "Database locked"
```bash
# Detener el servidor y reiniciar
bun run db:push
```

### Error: "Port 3000 already in use"
```bash
# Usar otro puerto
bun run dev -p 3001
```

### Error: "Prisma Client not initialized"
```bash
bun run db:generate
```

---

## 📞 Soporte

Para reportar problemas o solicitar ayuda:
- Revisar los logs en `server-output.log`
- Verificar la consola del navegador
- Consultar la documentación en `/docs`

---

## 📋 Historial de Versiones

### v2.1.4 (22 Abril 2026)
- Correcciones en módulo de evaluación
- Mejoras en módulo de reportes
- Footer global con configuración
- Optimizaciones de rendimiento

### v2.1.3
- Sistema de evaluación completo
- Dashboard con ganadores por categoría
- Mejoras en UI/UX

### v2.1.2
- Módulo de reportes
- Correcciones de bugs

---

¡Gracias por usar Fábrica de Ideas! 🎉
