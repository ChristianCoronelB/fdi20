import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import jsPDF from 'jspdf';

// Helper function to generate QR code URL
function getQrCodeUrl(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`CERT:${code}`)}`;
}

// Helper function to wrap text
function wrapText(text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * 2.5 > maxWidth) { // Approximate character width
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('certificateId');
    const userId = searchParams.get('userId');

    // Determine target user
    const targetUserId = userId || session.userId;
    
    // Only admins can download other users' certificates
    if (targetUserId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Get certificate info
    let certificate: any;
    
    if (certificateId) {
      const certResult = await db.$queryRaw`
        SELECT c.*, e.name as eventName, e.startDate as eventStartDate, e.endDate as eventEndDate
        FROM certificates c
        LEFT JOIN events e ON c.eventId = e.id
        WHERE c.id = ${certificateId} AND c.userId = ${targetUserId}
      `;
      certificate = (certResult as any[])[0];
    } else {
      // Get the latest attendance certificate
      const certResult = await db.$queryRaw`
        SELECT c.*, e.name as eventName, e.startDate as eventStartDate, e.endDate as eventEndDate
        FROM certificates c
        LEFT JOIN events e ON c.eventId = e.id
        WHERE c.userId = ${targetUserId} AND c.type = 'attendance'
        ORDER BY c.createdAt DESC LIMIT 1
      `;
      certificate = (certResult as any[])[0];
    }

    if (!certificate) {
      return NextResponse.json(
        { success: false, error: 'Certificado no encontrado' },
        { status: 404 }
      );
    }

    // Get user info
    const userResult = await db.$queryRaw`
      SELECT name, email FROM users WHERE id = ${targetUserId}
    `;
    const user = (userResult as any[])[0];

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Get attended activities
    const activitiesResult = await db.$queryRaw`
      SELECT a.title, a.type, a.startTime, a.endTime
      FROM attendances att
      JOIN activities a ON att.activityId = a.id
      WHERE att.userId = ${targetUserId} 
      AND att.checkInTime IS NOT NULL 
      AND att.checkOutTime IS NOT NULL
      ORDER BY a.startTime ASC
    `;
    const activities = activitiesResult as any[];

    // Get certificate template (default or event-specific)
    const templateResult = await db.$queryRaw`
      SELECT * FROM certificate_templates 
      WHERE isActive = 1 
      AND type = 'attendance'
      AND (eventId = ${certificate.eventId} OR eventId IS NULL)
      ORDER BY eventId DESC
      LIMIT 1
    `;
    const template = (templateResult as any[])[0];

    // Create PDF document (A4 landscape: 297 x 210 mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 20;

    // Get colors from template or use defaults
    const primaryColor = template?.primaryColor || '#059669';
    const secondaryColor = template?.secondaryColor || '#0d9488';
    const textColor = template?.textColor || '#1f2937';
    const borderColor = template?.borderColor || '#059669';
    const borderWidth = template?.borderWidth || 4;

    // Parse hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);
    const textRgb = hexToRgb(textColor);
    const borderRgb = hexToRgb(borderColor);

    // Draw decorative border
    pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
    pdf.setLineWidth(borderWidth! / 2);
    pdf.rect(5, 5, pageWidth - 10, pageHeight - 10);

    // Draw inner border
    pdf.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    pdf.setLineWidth(0.5);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // Draw decorative corners
    const cornerSize = 15;
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(2);

    // Top-left corner
    pdf.line(12, 12, 12 + cornerSize, 12);
    pdf.line(12, 12, 12, 12 + cornerSize);

    // Top-right corner
    pdf.line(pageWidth - 12 - cornerSize, 12, pageWidth - 12, 12);
    pdf.line(pageWidth - 12, 12, pageWidth - 12, 12 + cornerSize);

    // Bottom-left corner
    pdf.line(12, pageHeight - 12, 12 + cornerSize, pageHeight - 12);
    pdf.line(12, pageHeight - 12 - cornerSize, 12, pageHeight - 12);

    // Bottom-right corner
    pdf.line(pageWidth - 12 - cornerSize, pageHeight - 12, pageWidth - 12, pageHeight - 12);
    pdf.line(pageWidth - 12, pageHeight - 12 - cornerSize, pageWidth - 12, pageHeight - 12);

    // Header
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    
    const headerText = template?.headerText || 'CERTIFICADO DE PARTICIPACIÓN';
    pdf.text(headerText, pageWidth / 2, 35, { align: 'center' });

    // Decorative line under header
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(1);
    pdf.line(pageWidth / 2 - 60, 40, pageWidth / 2 + 60, 40);

    // Body text
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
    const bodyText = template?.bodyText || 'Se certifica que';
    pdf.text(bodyText, pageWidth / 2, 55, { align: 'center' });

    // Participant name (highlighted)
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(user.name.toUpperCase(), pageWidth / 2, 75, { align: 'center' });

    // Decorative line under name
    pdf.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    pdf.setLineWidth(0.5);
    const nameWidth = pdf.getTextWidth(user.name.toUpperCase()) + 20;
    pdf.line(pageWidth / 2 - nameWidth / 2, 78, pageWidth / 2 + nameWidth / 2, 78);

    // Participation description
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    
    const participantLabel = template?.participantLabel || 'ha participado activamente en';
    pdf.text(participantLabel, pageWidth / 2, 90, { align: 'center' });

    // Event name
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const eventName = certificate.eventName || 'Fábrica de Ideas 2025';
    pdf.text(eventName, pageWidth / 2, 105, { align: 'center' });

    // Activities list (if enabled and available)
    if (template?.showActivities !== false && activities.length > 0) {
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      
      const activityNames = activities.slice(0, 5).map(a => a.title).join(' • ');
      const truncatedActivities = activityNames.length > 100 
        ? activityNames.substring(0, 97) + '...' 
        : activityNames;
      
      const activityLines = wrapText(`Actividades: ${truncatedActivities}`, pageWidth - 60);
      activityLines.forEach((line, index) => {
        pdf.text(line, pageWidth / 2, 118 + (index * 5), { align: 'center' });
      });
    }

    // Issue date
    if (template?.showDate !== false) {
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const issueDate = new Date(certificate.issueDate);
      const formattedDate = issueDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      pdf.text(`Fecha de emisión: ${formattedDate}`, pageWidth / 2, 135, { align: 'center' });
    }

    // QR Code
    if (template?.showQrCode !== false) {
      const qrCodeUrl = getQrCodeUrl(certificate.code);
      try {
        const qrResponse = await fetch(qrCodeUrl);
        const qrBlob = await qrResponse.blob();
        const qrBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(qrBlob);
        });
        pdf.addImage(qrBase64, 'PNG', margin, pageHeight - 50, 30, 30);
      } catch (e) {
        console.log('Could not load QR code');
      }
    }

    // Certificate code
    if (template?.showCode !== false) {
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Código: ${certificate.code}`, margin + 15, pageHeight - 17);
    }

    // Organization and signature
    const organizationName = template?.organizationName || 'Fábrica de Ideas';
    
    // Right side - Organization
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(organizationName, pageWidth - margin - 50, pageHeight - 45, { align: 'center' });

    // Signature line
    pdf.setDrawColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth - margin - 90, pageHeight - 35, pageWidth - margin - 10, pageHeight - 35);

    // Signature text
    if (template?.signatureText) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.signatureText, pageWidth - margin - 50, pageHeight - 28, { align: 'center' });
    }

    // Verification URL
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(7);
    pdf.text(
      `Verificar en: verificar.fabricadeideas.com/${certificate.code}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${certificate.code}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar certificado' },
      { status: 500 }
    );
  }
}
