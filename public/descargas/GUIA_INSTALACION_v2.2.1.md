# Guía de Instalación - Fábrica de Ideas v2.2.1

## Requisitos del Sistema

- **Sistema Operativo**: Windows Server 2016+, Linux (Ubuntu 20.04+), macOS 11+
- **Runtime**: Bun (recomendado) o Node.js 18+
- **RAM**: 512MB mínimo, 1GB recomendado
- **Disco**: 100MB mínimo
- **Puerto**: 3000 (configurable)

---

## Instalación con Bun (Recomendado)

### 1. Instalar Bun

**Linux/macOS:**
```bash
curl -fsSL https://bun.sh/install | bash
```

**Windows (PowerShell):**
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Descomprimir el proyecto

```bash
unzip fabrica-de-ideas-v2.2.1-bun.zip
cd fabrica-de-ideas-v2.2.1-bun
```

### 3. Instalar dependencias

```bash
bun install
```

### 4. Configurar base de datos

```bash
# Generar cliente Prisma
bun run db:generate

# Crear tablas en la base de datos
bun run db:push

# Poblar con datos iniciales (usuarios, evento demo)
bun run db:seed
```

### 5. Iniciar la aplicación

```bash
# Modo desarrollo (con recarga automática)
bun run dev

# Modo producción
bun run build
bun run start
```

### 6. Acceder a la aplicación

Abre tu navegador en: `http://localhost:3000`

---

## Instalación con Node.js

### 1. Instalar Node.js 18+

Descarga desde: https://nodejs.org/

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar base de datos

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Iniciar la aplicación

```bash
npm run dev
```

---

## Credenciales por Defecto

Después de ejecutar el seed, puedes acceder con:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@fabricadeideas.com | admin123 |
| Organizador | organizer@fabricadeideas.com | org123 |
| Moderador | moderator@fabricadeideas.com | mod123 |
| Evaluador | evaluator@fabricadeideas.com | eval123 |
| Participante | user1@fabricadeideas.com | user123 |

---

## Estructura del Proyecto

```
fabrica-de-ideas/
├── prisma/
│   ├── schema.prisma    # Esquema de base de datos
│   ├── seed.ts          # Datos iniciales
│   └── db/              # Base de datos SQLite
├── src/
│   ├── app/
│   │   ├── page.tsx     # Página principal
│   │   ├── api/         # Endpoints API
│   │   └── ...
│   ├── components/
│   │   ├── fabrica/     # Componentes de la app
│   │   └── ui/          # Componentes shadcn/ui
│   ├── lib/             # Utilidades
│   └── types/           # Tipos TypeScript
├── public/              # Archivos estáticos
└── package.json
```

---

## Configuración de Producción

### Variables de entorno (opcional)

Crea un archivo `.env` en la raíz:

```env
DATABASE_URL="file:./prisma/db/custom.db"
NEXTAUTH_SECRET="tu-clave-secreta-muy-segura"
NEXTAUTH_URL="http://tu-dominio.com"
```

### Construir para producción

```bash
bun run build
```

### Ejecutar en producción

```bash
bun run start
```

---

## Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

```bash
bun run db:generate
```

### Error: "Table not found"

```bash
bun run db:push
```

### Puerto 3000 en uso

Modifica el puerto en `package.json`:
```json
"dev": "next dev -p 3001"
```

---

## Soporte

Para reportar problemas o solicitar ayuda:
- Revisa el archivo `VERSION.txt` para ver las novedades
- Consulta `README.md` para más información

---

**Fábrica de Ideas v2.2.1** - Plataforma de gestión de eventos de emprendimiento
