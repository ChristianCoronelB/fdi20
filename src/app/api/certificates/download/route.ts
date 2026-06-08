import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import jsPDF from 'jspdf';

// Helper function to generate QR code URL
function getQrCodeUrl(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`CERT:${code}`)}`;
}

// Helper function to wrap text based on actual PDF text width
// When jsPDF is created with unit: 'mm', getTextWidth() returns width in millimeters
function wrapText(pdf: jsPDF, text: string, maxWidthMm: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidthMm = pdf.getTextWidth(testLine); // Returns mm when unit is 'mm'
    
    if (testWidthMm > maxWidthMm && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// Helper function to draw centered wrapped text
function drawCenteredWrappedText(
  pdf: jsPDF, 
  text: string, 
  maxWidth: number, 
  startY: number, 
  lineHeight: number
): number {
  const lines = wrapText(pdf, text, maxWidth);
  const centerX = 297 / 2;
  
  lines.forEach((line, index) => {
    pdf.text(line, centerX, startY + (index * lineHeight), { align: 'center' });
  });
  
  return startY + (lines.length * lineHeight);
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
    const template = await db.certificateTemplate.findFirst({
      where: {
        isActive: true,
        type: 'attendance',
        OR: [
          { eventId: certificate.eventId },
          { eventId: null }
        ]
      },
      orderBy: [
        { eventId: 'desc' } // Prefer event-specific template over default
      ],
    });

    // Create PDF document (A4 landscape: 297 x 210 mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const margin = 25;
    const contentWidth = pageWidth - (margin * 2);

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

    // Track current Y position
    let currentY = 35;

    // Header
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    
    const headerText = template?.headerText || 'CERTIFICADO DE PARTICIPACIÓN';
    pdf.text(headerText, pageWidth / 2, currentY, { align: 'center' });

    // Decorative line under header
    currentY += 5;
    pdf.setDrawColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setLineWidth(1);
    pdf.line(pageWidth / 2 - 50, currentY, pageWidth / 2 + 50, currentY);

    // Body text (wrapped)
    currentY += 15;
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const bodyText = template?.bodyText || 'Se certifica que';
    currentY = drawCenteredWrappedText(pdf, bodyText, contentWidth, currentY, 6);

    // Participant name (highlighted)
    currentY += 10;
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(user.name.toUpperCase(), pageWidth / 2, currentY, { align: 'center' });

    // Decorative line under name
    currentY += 3;
    pdf.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    pdf.setLineWidth(0.5);
    const nameWidth = pdf.getTextWidth(user.name.toUpperCase()) + 20;
    pdf.line(pageWidth / 2 - nameWidth / 2, currentY, pageWidth / 2 + nameWidth / 2, currentY);

    // Participation description
    currentY += 12;
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const participantLabel = template?.participantLabel || 'ha participado activamente en';
    currentY = drawCenteredWrappedText(pdf, participantLabel, contentWidth, currentY, 6);

    // Event name
    currentY += 10;
    pdf.setTextColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const eventName = certificate.eventName || 'Fábrica de Ideas 2025';
    currentY = drawCenteredWrappedText(pdf, eventName, contentWidth, currentY, 7);

    // Activities list (if enabled and available)
    currentY += 10;
    if (template?.showActivities !== false && activities.length > 0) {
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      
      const activityNames = activities.slice(0, 5).map(a => a.title).join(' • ');
      const truncatedActivities = activityNames.length > 120 
        ? activityNames.substring(0, 117) + '...' 
        : activityNames;
      
      const activitiesText = `Actividades: ${truncatedActivities}`;
      currentY = drawCenteredWrappedText(pdf, activitiesText, contentWidth, currentY, 5);
    }

    // Issue date
    currentY += 8;
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
      pdf.text(`Fecha de emisión: ${formattedDate}`, pageWidth / 2, currentY, { align: 'center' });
    }

    // Organization name (centered at bottom)
    const organizationName = template?.organizationName || 'Fábrica de Ideas';
    
    // Draw organization name with wrapping if needed
    const orgY = pageHeight - 50;
    pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    
    // Check if organization name is too long
    const orgLines = wrapText(pdf, organizationName, 120);
    orgLines.forEach((line, index) => {
      pdf.text(line, pageWidth / 2, orgY + (index * 5), { align: 'center' });
    });

    // Signature line
    const sigY = orgY + (orgLines.length * 5) + 5;
    pdf.setDrawColor(textRgb.r, textRgb.g, textRgb.b);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY);

    // Signature text
    if (template?.signatureText) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text(template.signatureText, pageWidth / 2, sigY + 5, { align: 'center' });
    }

    // QR Code (bottom left)
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
        pdf.addImage(qrBase64, 'PNG', margin, pageHeight - 45, 25, 25);
      } catch (e) {
        console.log('Could not load QR code');
      }
    }

    // Certificate code (below QR)
    if (template?.showCode !== false) {
      pdf.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Código: ${certificate.code}`, margin, pageHeight - 15);
    }

    // Verification URL (bottom center)
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
