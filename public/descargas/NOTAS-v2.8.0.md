# Notas de Versión v2.8.0

## Fecha: 4 de Mayo de 2025

## Cambios Principales

### 1. Términos y Condiciones con Ley de Protección de Datos de Ecuador

Se ha implementado un sistema completo de aceptación de términos y condiciones basado en la **Ley Orgánica de Protección de Datos Personales (LOPDP)** del Ecuador:

- **Checkbox obligatorio** en el formulario de registro
- **Modal con términos completos** que incluye:
  - Aceptación de términos
  - Política de protección de datos personales
  - Derechos ARCO del titular
  - Finalidad del tratamiento de datos
  - Seguridad de la información
  - Contacto para ejercer derechos
  - Referencia a la Defensoría del Pueblo como autoridad de control

### 2. Recuperación de Contraseña por Email

Sistema completo de recuperación de contraseña:

- **Enlace "¿Olvidaste tu contraseña?"** en el formulario de login
- **Envío de email** con enlace de recuperación
- **Token de seguridad** con expiración de 1 hora
- **Diálogo para nueva contraseña** con validación
- **Confirmación de cambio** por email

### 3. Servicio de Email Integrado

Sistema de envío de emails con soporte para:

- SMTP estándar
- Gmail (con contraseña de aplicación)
- Outlook/Hotmail
- Otros proveedores de email

#### Configuración de Email

Agregar las siguientes variables en `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación
EMAIL_FROM_NAME=Fábrica de Ideas
EMAIL_FROM=noreply@fabricadeideas.com
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

**Nota:** Si no se configura el email, el sistema simulará el envío mostrando los emails en los logs del servidor.

### 4. Nuevos Modelos de Base de Datos

- **PasswordReset**: Almacena tokens de recuperación de contraseña
- **Campos en User**:
  - `acceptedTerms`: Indica si aceptó términos
  - `acceptedTermsAt`: Fecha de aceptación

## APIs Nuevas

### POST /api/auth/forgot-password
Solicita un email de recuperación de contraseña.

**Body:**
```json
{
  "email": "usuario@email.com"
}
```

### GET /api/auth/reset-password
Valida un token de recuperación.

**Query params:** `?token=xxx`

### POST /api/auth/reset-password
Restablece la contraseña con un token válido.

**Body:**
```json
{
  "token": "xxx",
  "password": "nueva-contraseña",
  "confirmPassword": "nueva-contraseña"
}
```

## Cómo Actualizar

1. Descargue el archivo `fabrica-de-ideas-v2.8.0-bun.zip`
2. Extraiga el contenido en su servidor
3. Ejecute `bun install`
4. Ejecute `bun run db:push` para actualizar la base de datos
5. Configure las variables de email en `.env`
6. Reinicie el servidor con `bun run dev`

## Configuración de Gmail

Para usar Gmail como proveedor de email:

1. Active la verificación en 2 pasos en su cuenta de Google
2. Genere una "Contraseña de aplicación" en:
   - Cuenta de Google → Seguridad → Contraseñas de aplicación
3. Use esa contraseña en `EMAIL_PASS`

---

**Versión anterior**: v2.7.9
**Versión actual**: v2.8.0
