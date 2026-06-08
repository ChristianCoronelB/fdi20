import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/certificates - List user certificates
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || session.userId;
    
    // Only admins can view other users' certificates
    if (userId !== session.userId && session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }
    
    // Get certificates using raw query since the relation isn't properly set up
    const certificates = await db.$queryRaw`
      SELECT 
        c.id,
        c.userId,
        c.eventId,
        c.type,
        c.title,
        c.description,
        c.issueDate,
        c.code,
        c.createdAt,
        e.name as eventName,
        e.startDate as eventStartDate,
        e.endDate as eventEndDate
      FROM certificates c
      LEFT JOIN events e ON c.eventId = e.id
      WHERE c.userId = ${userId}
      ORDER BY c.createdAt DESC
    `;
    
    // Format the results
    const formattedCertificates = (certificates as any[]).map((cert: any) => ({
      id: cert.id,
      userId: cert.userId,
      eventId: cert.eventId,
      type: cert.type,
      title: cert.title,
      description: cert.description,
      issueDate: cert.issueDate,
      code: cert.code,
      createdAt: cert.createdAt,
      event: cert.eventName ? {
        name: cert.eventName,
        startDate: cert.eventStartDate,
        endDate: cert.eventEndDate,
      } : null,
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedCertificates,
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener certificados' },
      { status: 500 }
    );
  }
}

// POST /api/certificates - Generate certificate
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { userId, eventId, type = 'attendance' } = body;
    
    // Only admins can generate certificates for other users
    const targetUserId = userId || session.userId;
    if (targetUserId !== session.userId && session.role !== 'ADMIN' && session.role !== 'ORGANIZER') {
      return NextResponse.json(
        { success: false, error: 'No autorizado para generar certificados' },
        { status: 403 }
      );
    }
    
    // Get user info
    const user = await db.user.findUnique({
      where: { id: targetUserId },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // Check attendance requirements for participation certificate
    if (type === 'attendance') {
      // Count total attendances with check-in and check-out (complete attendance)
      const attendanceCount = await db.$queryRaw`
        SELECT COUNT(*) as count 
        FROM attendances a
        JOIN activities act ON a.activityId = act.id
        WHERE a.userId = ${targetUserId} 
        AND a.checkInTime IS NOT NULL 
        AND a.checkOutTime IS NOT NULL
      `;
      
      const completeAttendances = Number((attendanceCount as any[])[0]?.count || 0);
      
      // Require at least 3 complete attendances for certificate
      if (completeAttendances < 3) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Necesitas al menos 3 asistencias completas para generar el certificado. Actualmente tienes ${completeAttendances}.`,
            completeAttendances,
          },
          { status: 400 }
        );
      }
    }
    
    // Check if certificate already exists for this type
    // Use Prisma's findFirst instead of raw query to avoid SQL syntax issues
    const existingCert = await db.certificate.findFirst({
      where: {
        userId: targetUserId,
        type: type,
        ...(eventId && { eventId: eventId }),
      },
    });
    
    if (existingCert) {
      return NextResponse.json(
        { success: false, error: 'Ya tienes un certificado de este tipo' },
        { status: 400 }
      );
    }
    
    // Get event info for certificate title
    let eventInfo = null;
    if (eventId) {
      const event = await db.event.findUnique({
        where: { id: eventId },
      });
      eventInfo = event;
    }
    
    // Generate unique code
    const code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate certificate title
    const certificateTitle = type === 'attendance' 
      ? `Certificado de Participación - ${eventInfo?.name || 'Fábrica de Ideas 2025'}`
      : `Certificado de ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    const certificateDescription = type === 'attendance'
      ? `Certificamos que ${user.name} ha participado activamente en el evento ${eventInfo?.name || 'Fábrica de Ideas 2025'}.`
      : `Certificado emitido para ${user.name}`;
    
    // Create certificate using raw query
    const id = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    
    await db.$executeRaw`
      INSERT INTO certificates (id, userId, eventId, type, title, description, issueDate, code, createdAt)
      VALUES (${id}, ${targetUserId}, ${eventId || null}, ${type}, ${certificateTitle}, ${certificateDescription}, ${now}, ${code}, ${now})
    `;
    
    return NextResponse.json({
      success: true,
      data: {
        id,
        userId: targetUserId,
        eventId,
        type,
        title: certificateTitle,
        description: certificateDescription,
        code,
        issueDate: now,
      },
      message: '¡Certificado generado exitosamente!',
    });
  } catch (error) {
    console.error('Create certificate error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar certificado' },
      { status: 500 }
    );
  }
}
