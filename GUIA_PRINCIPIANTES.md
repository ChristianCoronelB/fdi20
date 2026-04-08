# 🚀 Guía de Despliegue para Principiantes - Fábrica de Ideas

> **¿Primera vez desplegando?** ¡No te preocupes! Esta guía está diseñada para ti.
> Te acompañaremos paso a paso con capturas de pantalla y explicaciones claras.

---

## 📋 Tabla de Contenidos

1. [Preparar el Código](#-paso-1-preparar-el-código)
2. [Crear Cuenta en GitHub](#-paso-2-crear-cuenta-en-github)
3. [Subir el Código a GitHub](#-paso-3-subir-el-código-a-github)
4. [Desplegar en Vercel (Gratis)](#-paso-4-desplegar-en-vercel-gratis)
5. [¡Listo! Tu app está en línea](#-paso-5-tu-aplicación-está-en-línea)

---

## 🎯 PASO 1: Preparar el Código

### 1.1 Abre una terminal en tu computadora

Si estás en el sandbox, ya tienes todo listo. Si no, descarga el proyecto primero.

### 1.2 Verifica que todo funciona

```bash
# Entra a la carpeta del proyecto
cd /home/z/my-project

# Instala las dependencias (si no están instaladas)
bun install

# Genera el cliente de base de datos
bunx prisma generate

# Ejecuta la base de datos
bunx prisma migrate dev

# Prueba que funciona
bun run dev
```

Si ves el mensaje "Ready" ✅, todo está bien.

---

## 🎯 PASO 2: Crear Cuenta en GitHub

### 2.1 Ve a GitHub

1. Abre tu navegador
2. Ve a: **https://github.com**
3. Haz clic en **"Sign up"** (Registrarse)

### 2.2 Completa el registro

```
┌─────────────────────────────────────────┐
│  GitHub                                 │
│                                         │
│  Email: tu-email@ejemplo.com           │
│  Password: ••••••••••                  │
│  Username: tu-usuario                  │
│                                         │
│  [Create account]                      │
└─────────────────────────────────────────┘
```

### 2.3 Verifica tu email

GitHub te enviará un código de verificación. Ingrésalo para activar tu cuenta.

---

## 🎯 PASO 3: Subir el Código a GitHub

### 3.1 Crea un nuevo repositorio

1. En GitHub, haz clic en el botón **"+"** (esquina superior derecha)
2. Selecciona **"New repository"**

```
┌─────────────────────────────────────────┐
│  Create a new repository                │
│                                         │
│  Repository name: fabrica-de-ideas     │
│  Description: Event Management App     │
│                                         │
│  ○ Public   ○ Private                  │
│                                         │
│  [Create repository]                   │
└─────────────────────────────────────────┘
```

### 3.2 Sube tu código desde la terminal

Copia y pega estos comandos uno por uno:

```bash
# Inicializa Git (si no está inicializado)
git init

# Agrega todos los archivos
git add .

# Crea tu primer commit
git commit -m "Mi primera aplicación - Fábrica de Ideas"

# Conecta con GitHub (REEMPLAZA tu-usuario con tu nombre de usuario)
git remote add origin https://github.com/tu-usuario/fabrica-de-ideas.git

# Sube el código
git push -u origin main
```

> **¿Te pide contraseña?** GitHub ahora usa tokens. Ve a:
> Settings → Developer settings → Personal access tokens → Generate new token
> Selecciona "repo" y copia el token. Úsalo como contraseña.

---

## 🎯 PASO 4: Desplegar en Vercel (GRATIS)

### 4.1 Ve a Vercel

1. Abre: **https://vercel.com**
2. Haz clic en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**

```
┌─────────────────────────────────────────┐
│  Vercel                                 │
│                                         │
│  [Continue with GitHub]  ← Selecciona  │
│  [Continue with GitLab]                │
│  [Continue with Bitbucket]             │
└─────────────────────────────────────────┘
```

### 4.2 Autoriza a Vercel

GitHub te preguntará si autorizas a Vercel. Haz clic en **"Authorize Vercel"**.

### 4.3 Importa tu proyecto

1. Verás una lista de tus repositorios
2. Busca **"fabrica-de-ideas"**
3. Haz clic en **"Import"**

```
┌─────────────────────────────────────────┐
│  Import Git Repository                  │
│                                         │
│  fabrica-de-ideas                       │
│  ┌─────────────────────────────────┐   │
│  │ Import →                        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 4.4 Configura el proyecto

Vercel detectará automáticamente que es Next.js. Solo necesitas agregar las variables de entorno:

1. Busca **"Environment Variables"**
2. Agrega estas variables:

```
DATABASE_URL=file:./db/prod.db
JWT_SECRET=tu-clave-secreta-super-larga-minimo-32-caracteres-para-seguridad
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
```

> **Importante:** Cambia `tu-clave-secreta...` por una clave real larga.

### 4.5 Despliega

1. Haz clic en **"Deploy"**
2. Espera 2-3 minutos ⏳
3. ¡Verás confeti! 🎉

```
┌─────────────────────────────────────────┐
│  🎉 Congratulations!                    │
│                                         │
│  Your project has been deployed!       │
│                                         │
│  https://fabrica-de-ideas.vercel.app   │
│                                         │
│  [Visit]  [Go to Dashboard]            │
└─────────────────────────────────────────┘
```

---

## 🎯 PASO 5: Tu Aplicación está en Línea

### 5.1 Accede a tu app

Haz clic en **"Visit"** o ve a tu URL:
```
https://fabrica-de-ideas.vercel.app
```

### 5.2 Credenciales de prueba

```
Email: admin@fabricadeideas.com
Password: admin123
```

### 5.3 ¡Comparte tu app!

Tu aplicación ahora está disponible en internet para cualquier persona.

---

## 🔧 Actualizaciones Futuras

¿Hiciste cambios y quieres actualizar la app?

```bash
# Guarda los cambios
git add .
git commit -m "Nuevas mejoras"
git push

# ¡Vercel actualiza automáticamente!
```

---

## ❓ Preguntas Frecuentes

### ¿Es realmente gratis?
✅ Sí, Vercel tiene un plan gratuito generoso para proyectos personales.

### ¿Puedo usar mi propio dominio?
✅ Sí, en Vercel ve a Settings → Domains → Add domain

### ¿La base de datos se pierde?
⚠️ SQLite en Vercel es efímero. Para datos permanentes, considera usar:
- PlanetScale (MySQL gratis)
- Supabase (PostgreSQL gratis)
- MongoDB Atlas (MongoDB gratis)

### ¿Necesito una base de datos permanente?
Escribe `NECESITO BASE DE DATOS PERMANENTE` y te guiaré para configurar Supabase (gratis).

---

## 🆘 ¿Necesitas Ayuda?

Si tienes algún problema, copia el error que ves y te ayudaré a resolverlo.

**Errores comunes:**

| Error | Solución |
|-------|----------|
| "Authentication failed" | Regenera tu token de GitHub |
| "Build failed" | Revisa los logs en Vercel |
| "Database error" | Configura las variables de entorno |
