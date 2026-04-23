# Guía de Instalación - Fábrica de Ideas v2.1.5

## 📋 Requisitos Previos

### Opción A: Con Bun (Recomendado)
- **Bun** v1.0 o superior
- **Sistema operativo**: Windows, macOS o Linux

### Opción B: Con Node.js
- **Node.js** v18.0 o superior
- **npm** o **pnpm**

### Generales
- 512 MB de RAM mínimo
- 100 MB de espacio en disco
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

---

## 🚀 Instalación Rápida con Bun

### Paso 1: Instalar Bun (si no lo tienes)

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -fsSL https://bun.sh/install | bash
```

### Paso 2: Descomprimir el archivo

Descomprime `fabrica-de-ideas-v2.1.5-bun.zip` en la ubicación deseada.

### Paso 3: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (puedes copiar el archivo `.env.example`):

```bash
cp .env.example .env
```

O crea el archivo `.env` manualmente con el siguiente contenido:

```env
DATABASE_URL="file:./db/fabrica.db"
NEXTAUTH_SECRET="tu-secreto-muy-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### Paso 4: Instalar dependencias y configurar base de datos

```bash
bun install
bun run db:push
bun run db:seed
```

### Paso 5: Iniciar la aplicación

```bash
bun run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## 🔧 Instalación con Node.js

### Paso 1: Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="file:./db/fabrica.db"
NEXTAUTH_SECRET="tu-secreto-muy-seguro"
NEXTAUTH_URL="http://localhost:3000"
```

### Paso 2: Instalar dependencias

```bash
cd fabrica-de-ideas
npm install
```

### Paso 3: Configurar base de datos

```bash
npm run db:push
npm run db:seed
```

### Paso 4: Iniciar la aplicación

```bash
npm run dev
```

---

## 👤 Credenciales por Defecto

Después de ejecutar el seed, tendrás los siguientes usuarios:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@fabricadeideas.com | admin123 |
| Organizador | organizer@fabricadeideas.com | org123 |
| Moderador | moderator@fabricadeideas.com | mod123 |
| Evaluador | evaluator@fabricadeideas.com | eval123 |
| Participante | user1@fabricadeideas.com | user123 |

**⚠️ IMPORTANTE:** Cambia estas contraseñas en producción.

---

## 🆕 Novedades v2.1.5

### 1. Módulo de Configuración Mejorado
- Campo de **Zona Horaria** configurable
- Campo de texto para **Footer personalizado**
- Todas las fechas/horas usan la zona horaria configurada

### 2. Gestión de Actividades Actualizada
- Nuevo campo **"Expositor"** para cada actividad
- Opción **"Charla Magistral"** añadida a tipos de actividad
- Formulario de edición corregido con todos los campos
- Botón guardar funcional

### 3. Agenda de Eventos Mejorada
- Etiquetas de estado dinámicas según hora actual:
  - **"En Curso"** - actividad en progreso
  - **"Finalizado"** - actividad terminada
  - **"Próximo"** - actividad pendiente
- Visualización del Expositor en listado

### 4. Footer Global
- Texto de footer configurable desde administración
- Visible en todas las interfaces de la aplicación

### 5. Módulo de Evaluación de Proyectos
- Solo Evaluadores y Administradores pueden evaluar
- Admin asigna proyectos a cada evaluador
- Rúbrica con 6 criterios (100 puntos total):
  - Innovación y Creatividad (20 pts)
  - Viabilidad del Negocio (15 pts)
  - Impacto Social/Ambiental (15 pts)
  - Pitch (20 pts)
  - Potencial de Escalamiento (10 pts)
  - Entregable (20 pts)
- Tooltips con descripciones y requerimientos

### 6. Módulo de Reportes
- Solo para rol Administrador
- Estadísticas generadas automáticamente
- Listados disponibles:
  - Proyectos registrados
  - Ganadores por categoría
  - Proyectos por puntaje
  - Participantes
  - Actividades
  - Salas
  - Proyectos más votados

---

## 📁 Estructura del Proyecto

```
fabrica-de-ideas/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   ├── seed.ts            # Datos iniciales
│   └── db/                # Base de datos SQLite
├── src/
│   ├── app/
│   │   ├── api/           # Endpoints REST
│   │   ├── page.tsx       # Página principal
│   │   ├── layout.tsx     # Layout principal
│   │   └── globals.css    # Estilos globales
│   ├── components/
│   │   ├── ui/            # Componentes shadcn/ui
│   │   └── fabrica/       # Componentes de la app
│   ├── lib/               # Utilidades
│   └── hooks/             # Custom hooks
├── public/                # Archivos estáticos
├── package.json
└── VERSION.txt
```

---

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia servidor de desarrollo |
| `bun run build` | Compila para producción |
| `bun run start` | Inicia servidor de producción |
| `bun run lint` | Verifica código con ESLint |
| `bun run db:push` | Sincroniza esquema con BD |
| `bun run db:seed` | Carga datos iniciales |
| `bun run create-admin` | Crea usuario administrador |

---

## 🔒 Seguridad en Producción

1. **Cambiar contraseñas por defecto**
2. **Configurar variables de entorno**:
   ```env
   DATABASE_URL="file:./db/production.db"
   NEXTAUTH_SECRET="tu-secreto-muy-seguro"
   NEXTAUTH_URL="https://tu-dominio.com"
   ```
3. **Usar HTTPS**
4. **Configurar firewall** para puerto 3000
5. **Respaldos periódicos** de la base de datos

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todos los requisitos estén instalados
2. Borra la carpeta `node_modules` y ejecuta `bun install` nuevamente
3. Verifica los logs en la consola
4. Consulta el archivo `VERSION.txt` para verificar la versión instalada

---

## 📄 Licencia

Este proyecto fue desarrollado para la gestión del evento "Fábrica de Ideas".

---

**Versión:** v2.1.5-20260423  
**Fecha:** 23 de Abril de 2026  
**Autor:** Z.ai Code
