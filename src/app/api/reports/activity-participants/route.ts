import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import jsPDF from 'jspdf';

// GET: Get participants list for an activity
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Only admins and organizers can access reports
    if (session.role !== 'ADMIN' && session.role !== 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver reportes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get('activityId');
    const format = searchParams.get('format') || 'json'; // json or pdf

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: 'ID de actividad requerido' },
        { status: 400 }
      );
    }

    // Get activity details
    const activityResult = await db.$queryRaw`
      SELECT a.*, r.name as roomName, e.name as eventName
      FROM activities a
      LEFT JOIN rooms r ON a.roomId = r.id
      LEFT JOIN events e ON a.eventId = e.id
      WHERE a.id = ${activityId}
    `;
    const activity = (activityResult as any[])[0];

    if (!activity) {
      return NextResponse.json(
        { success: false, error: 'Actividad no encontrada' },
        { status: 404 }
      );
    }

    // Get participants (attendances)
    const participants = await db.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.points,
        u.level,
        att.checkInTime,
        att.checkOutTime,
        att.points as attendancePoints,
        CASE 
          WHEN att.checkInTime IS NOT NULL AND att.checkOutTime IS NOT NULL THEN 'Completa'
          WHEN att.checkInTime IS NOT NULL AND att.checkOutTime IS NULL THEN 'Check-in solo'
          ELSE 'Sin registro'
        END as attendanceStatus
      FROM attendances att
      JOIN users u ON att.userId = u.id
      WHERE att.activityId = ${activityId}
      ORDER BY att.checkInTime ASC
    `;

    // Get registered users (who registered but didn't attend)
    const registeredOnly = await db.$queryRaw`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.points,
        u.level,
        ar.registeredAt
      FROM activity_registrations ar
      JOIN users u ON ar.userId = u.id
      WHERE ar.activityId = ${activityId}
      AND u.id NOT IN (
        SELECT userId FROM attendances WHERE activityId = ${activityId}
      )
      ORDER BY ar.registeredAt ASC
    `;

    const reportData = {
      activity: {
        id: activity.id,
        title: activity.title,
        type: activity.type,
        startTime: activity.startTime,
        endTime: activity.endTime,
        room: activity.roomName,
        event: activity.eventName,
      },
      summary: {
        totalRegistered: (participants as any[]).length + (registeredOnly as any[]).length,
        totalAttended: (participants as any[]).length,
        completeAttendances: (participants as any[]).filter((p: any) => p.checkInTime && p.checkOutTime).length,
        partialAttendances: (participants as any[]).filter((p: any) => p.checkInTime && !p.checkOutTime).length,
      },
      participants: participants as any[],
      registeredOnly: registeredOnly as any[],
      generatedAt: new Date().toISOString(),
    };

    // Return JSON or PDF
    if (format === 'pdf') {
      return generatePDF(reportData);
    }

    return NextResponse.json({
      success: true,
      data: reportData,
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar reporte' },
      { status: 500 }
    );
  }
}

// Generate PDF report
function generatePDF(data: any): NextResponse {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 15;
  let y = 20;

  // Header
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('REPORTE DE PARTICIPANTES', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Activity info
  pdf.setFontSize(14);
  pdf.text(data.activity.title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const startDate = new Date(data.activity.startTime);
  const formattedDate = startDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  pdf.text(`Fecha: ${formattedDate}`, margin, y);
  y += 5;
  pdf.text(`Hora: ${formattedTime}`, margin, y);
  y += 5;
  pdf.text(`Sala: ${data.activity.room || 'Sin asignar'}`, margin, y);
  y += 5;
  pdf.text(`Evento: ${data.activity.event || 'N/A'}`, margin, y);
  y += 10;

  // Summary
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y, pageWidth - margin * 2, 20, 'F');
  y += 5;

  pdf.setFont('helvetica', 'bold');
  pdf.text('RESUMEN', margin + 5, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`Total Registrados: ${data.summary.totalRegistered}`, margin + 5, y);
  y += 4;
  pdf.text(`Total Asistieron: ${data.summary.totalAttended}`, margin + 5, y);
  y += 4;
  pdf.text(`Asistencias Completas: ${data.summary.completeAttendances}`, margin + 5, y);
  y += 4;
  pdf.text(`Asistencias Parciales: ${data.summary.partialAttendances}`, margin + 5, y);
  y += 12;

  // Participants table
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('LISTA DE ASISTENTES', margin, y);
  y += 8;

  // Table header
  pdf.setFillColor(5, 150, 105); // emerald-600
  pdf.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.text('Nombre', margin + 2, y + 5);
  pdf.text('Email', margin + 60, y + 5);
  pdf.text('Check-in', margin + 120, y + 5);
  pdf.text('Check-out', margin + 145, y + 5);
  pdf.text('Estado', margin + 170, y + 5);
  y += 7;

  // Table rows
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  let rowY = y;
  data.participants.forEach((participant: any, index: number) => {
    // Alternate row background
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, rowY, pageWidth - margin * 2, 6, 'F');
    }

    const checkIn = participant.checkInTime 
      ? new Date(participant.checkInTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      : '-';
    const checkOut = participant.checkOutTime 
      ? new Date(participant.checkOutTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      : '-';

    // Truncate name and email if too long
    const name = participant.name.length > 25 ? participant.name.substring(0, 22) + '...' : participant.name;
    const email = participant.email.length > 35 ? participant.email.substring(0, 32) + '...' : participant.email;

    pdf.text(name, margin + 2, rowY + 4);
    pdf.text(email, margin + 60, rowY + 4);
    pdf.text(checkIn, margin + 120, rowY + 4);
    pdf.text(checkOut, margin + 145, rowY + 4);
    
    // Status with color
    if (participant.checkInTime && participant.checkOutTime) {
      pdf.setTextColor(5, 150, 105);
      pdf.text('Completa', margin + 170, rowY + 4);
    } else {
      pdf.setTextColor(234, 179, 8);
      pdf.text('Parcial', margin + 170, rowY + 4);
    }
    pdf.setTextColor(0, 0, 0);

    rowY += 6;

    // Add new page if needed
    if (rowY > 280) {
      pdf.addPage();
      rowY = 20;
    }
  });

  // Registered but not attended
  if (data.registeredOnly && data.registeredOnly.length > 0) {
    rowY += 10;
    if (rowY > 260) {
      pdf.addPage();
      rowY = 20;
    }

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('REGISTRADOS SIN ASISTENCIA', margin, rowY);
    rowY += 8;

    data.registeredOnly.forEach((registered: any, index: number) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, rowY, pageWidth - margin * 2, 6, 'F');
      }

      const name = registered.name.length > 40 ? registered.name.substring(0, 37) + '...' : registered.name;
      const email = registered.email.length > 50 ? registered.email.substring(0, 47) + '...' : registered.email;

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(name, margin + 2, rowY + 4);
      pdf.text(email, margin + 80, rowY + 4);

      rowY += 6;

      if (rowY > 280) {
        pdf.addPage();
        rowY = 20;
      }
    });
  }

  // Footer
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      290,
      { align: 'center' }
    );
  }

  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-${data.activity.title.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  });
}
