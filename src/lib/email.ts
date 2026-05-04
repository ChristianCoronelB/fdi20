import nodemailer from 'nodemailer';

// Configuración del transportador de email
// Soporta SMTP estándar y servicios como Gmail, Outlook, etc.
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
}

// Obtener configuración de email desde variables de entorno
function getEmailConfig(): EmailConfig {
  return {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros puertos
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    fromName: process.env.EMAIL_FROM_NAME || 'Fábrica de Ideas',
    fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@fabricadeideas.com',
  };
}

// Crear transportador de nodemailer
function createTransporter() {
  const config = getEmailConfig();
  
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.pass ? {
      user: config.user,
      pass: config.pass,
    } : undefined,
    tls: {
      // No rechazar certificados autofirmados en desarrollo
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
}

// Interfaz para el envío de email
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// Función principal para enviar emails
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = getEmailConfig();
    
    // Verificar si el email está configurado
    if (!config.user) {
      console.log('📧 Email no configurado. Simulando envío...');
      console.log(`   Para: ${Array.isArray(to) ? to.join(', ') : to}`);
      console.log(`   Asunto: ${subject}`);
      return { success: true }; // En desarrollo, simular éxito
    }
    
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML para versión texto
    });
    
    console.log('📧 Email enviado:', info.messageId);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al enviar email' 
    };
  }
}

// Plantilla HTML base para emails
function getEmailBaseTemplate(content: string, title: string): string {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .email-card {
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          opacity: 0.9;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning-box {
          background-color: #fef3cd;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .code-box {
          background-color: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="email-card">
          <div class="header">
            <h1>🎨 Fábrica de Ideas</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Fábrica de Ideas. Todos los derechos reservados.</p>
            <p>Este email fue enviado automáticamente. Por favor, no responda a este mensaje.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email de recuperación de contraseña
export async function sendPasswordResetEmail(
  email: string, 
  resetToken: string, 
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const subject = 'Recuperación de Contraseña - Fábrica de Ideas';
  
  const content = `
    <h2 style="margin-top: 0; color: #333;">¿Olvidaste tu contraseña?</h2>
    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}?token=${resetToken}" class="button">Restablecer Contraseña</a>
    </div>
    <p>O copia y pega el siguiente enlace en tu navegador:</p>
    <p style="word-break: break-all; color: #059669; font-size: 14px;">${resetUrl}?token=${resetToken}</p>
    <div class="warning-box">
      <p style="margin: 0;"><strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.</p>
      <p style="margin: 10px 0 0 0;">Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
    </div>
    <p style="font-size: 14px; color: #666;">Por tu seguridad, el enlace solo puede usarse una vez.</p>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: getEmailBaseTemplate(content, subject),
  });
}

// Email de confirmación de cambio de contraseña
export async function sendPasswordChangedEmail(email: string): Promise<{ success: boolean; error?: string }> {
  const subject = 'Contraseña Actualizada - Fábrica de Ideas';
  
  const content = `
    <h2 style="margin-top: 0; color: #333;">✅ Contraseña Actualizada</h2>
    <p>Tu contraseña ha sido actualizada exitosamente.</p>
    <p>Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.</p>
    <div style="margin-top: 30px; padding: 20px; background-color: #ecfdf5; border-radius: 8px;">
      <p style="margin: 0; color: #059669;"><strong>Consejo de seguridad:</strong> Utiliza contraseñas únicas para cada servicio y considera usar un gestor de contraseñas.</p>
    </div>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: getEmailBaseTemplate(content, subject),
  });
}

// Email de bienvenida al registrarse
export async function sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
  const subject = '¡Bienvenido a Fábrica de Ideas!';
  
  const content = `
    <h2 style="margin-top: 0; color: #333;">¡Hola, ${name}! 👋</h2>
    <p>¡Bienvenido a <strong>Fábrica de Ideas</strong>! Tu cuenta ha sido creada exitosamente.</p>
    <p>Ahora puedes:</p>
    <ul>
      <li>Participar en eventos de innovación</li>
      <li>Votar por tus proyectos favoritos</li>
      <li>Registrar tu asistencia con QR</li>
      <li>Ganar puntos y logros</li>
      <li>Obtener certificados de participación</li>
    </ul>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || '/'}" class="button">Comenzar a Explorar</a>
    </div>
    <p style="font-size: 14px; color: #666;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
  `;
  
  return sendEmail({
    to: email,
    subject,
    html: getEmailBaseTemplate(content, subject),
  });
}

// Verificar configuración de email
export async function verifyEmailConfig(): Promise<{ configured: boolean; message: string }> {
  const config = getEmailConfig();
  
  if (!config.user) {
    return {
      configured: false,
      message: 'Email no configurado. Los correos se simularán en los logs.',
    };
  }
  
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return {
      configured: true,
      message: `Email configurado correctamente (${config.user})`,
    };
  } catch (error) {
    return {
      configured: false,
      message: `Error de configuración: ${error instanceof Error ? error.message : 'Error desconocido'}`,
    };
  }
}

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  verifyEmailConfig,
};
