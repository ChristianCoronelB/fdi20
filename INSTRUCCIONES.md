# Fábrica de Ideas v2.1.5 - Instrucciones de Instalación

## Requisitos del Sistema

- **Node.js** >= 18.x
- **Bun** >= 1.0.x (recomendado) o npm/pnpm/yarn
- **Sistema Operativo**: Windows, Linux o macOS

## Instalación Rápida

### Paso 1: Descomprimir el proyecto
Descomprime el archivo `fabrica-de-ideas-v2.1.5.zip` en la ubicación deseada.

### Paso 2: Instalar dependencias
Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
bun install
```

O si usas npm:
```bash
npm install
```

### Paso 3: Configurar la base de datos
El proyecto usa SQLite, por lo que no necesitas instalar un servidor de base de datos.

```bash
# Crear la base de datos y aplicar el esquema
bun run db:push

# Poblar la base de datos con datos iniciales
bun run db:seed
```

### Paso 4: Iniciar el servidor de desarrollo
```bash
bun run dev
```

El servidor estará disponible en: **http://localhost:3000**

## Credenciales de Acceso

### Administrador
- **Email**: admin@fabricaideas.com
- **Contraseña**: admin123

### Participante de prueba
- **Email**: participante@test.com
- **Contraseña**: test123

### Organizador
- **Email**: organizador@fabricaideas.com
- **Contraseña**: admin123

## Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Inicia el servidor de desarrollo |
| `bun run build` | Compila el proyecto para producción |
| `bun run start` | Inicia el servidor en modo producción |
| `bun run lint` | Verifica la calidad del código |
| `bun run db:push` | Sincroniza el esquema con la BD |
| `bun run db:seed` | Pobla la BD con datos iniciales |
| `bun run db:studio` | Abre Prisma Studio para ver la BD |

## Despliegue en Producción

### Opción 1: Servidor Node.js
```bash
bun run build
bun run start
```

### Opción 2: Usando PM2 (recomendado para Windows/Linux)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Compilar el proyecto
bun run build

# Iniciar con PM2
pm2 start npm --name "fabrica-ideas" -- start

# Guardar configuración
pm2 save

# Configurar para inicio automático
pm2 startup
```

## Estructura del Proyecto

```
fabrica-de-ideas/
├── prisma/
│   ├── schema.prisma    # Esquema de la base de datos
│   └── seed.ts          # Datos iniciales
├── src/
│   ├── app/
│   │   ├── api/         # Endpoints de la API
│   │   └── page.tsx     # Aplicación principal
│   ├── components/      # Componentes UI
│   └── lib/             # Utilidades y configuración
├── db/
│   └── custom.db        # Base de datos SQLite
├── public/              # Archivos estáticos
└── package.json         # Dependencias
```

## Funcionalidades Principales

### Panel de Administrador
- Dashboard con estadísticas
- Gestión de eventos
- Gestión de salas
- Gestión de actividades
- Gestión de proyectos
- Gestión de usuarios
- Configuración de votación
- **Módulo de Evaluación** (para asignar evaluadores a proyectos)
- Generación de códigos QR
- Certificados
- Reportes

### Panel de Participante
- Agenda de actividades
- Mapa interactivo
- Proyectos (votación)
- Escáner QR
- Ranking y logros
- Certificados

### Módulo de Evaluación
- Asignación de evaluadores a proyectos
- Criterios de evaluación:
  - Innovación y Creatividad (20%)
  - Viabilidad del Negocio (15%)
  - Impacto Social/Ambiental (15%)
  - Presentación y Comunicación (20%)
  - Potencial de Escalamiento (10%)
  - Equipo y Ejecución (20%)

## Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
bun install
```

### Error de base de datos
```bash
# Regenerar la base de datos
bun run db:push
bun run db:seed
```

### Puerto 3000 ocupado
```bash
# En Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# En Linux/Mac
lsof -i :3000
kill -9 <PID>
```

## Soporte

Para reportar problemas o solicitar ayuda, contacta al equipo de desarrollo.

---
**Fábrica de Ideas v2.1.5** - Plataforma de Gestión de Eventos de Innovación
