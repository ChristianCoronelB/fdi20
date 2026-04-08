import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET: List certificate templates
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
    const eventId = searchParams.get('eventId');
    const type = searchParams.get('type');

    // Build where clause
    const whereConditions: string[] = ['isActive = 1'];
    const params: any[] = [];

    if (eventId) {
      whereConditions.push('(eventId = ? OR eventId IS NULL)');
      params.push(eventId);
    }

    if (type) {
      whereConditions.push('type = ?');
      params.push(type);
    }

    const whereClause = whereConditions.join(' AND ');

    const templates = await db.$queryRawUnsafe(
      `SELECT * FROM certificate_templates WHERE ${whereClause} ORDER BY createdAt DESC`,
      ...params
    );

    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching certificate templates:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener plantillas' },
      { status: 500 }
    );
  }
}

// POST: Create certificate template (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ORGANIZER')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      eventId,
      name,
      type = 'attendance',
      headerText,
      logoUrl,
      bodyText,
      participantLabel,
      eventLabel,
      organizationName,
      organizationLogo,
      signatureText,
      signatureImageUrl,
      backgroundColor,
      primaryColor,
      secondaryColor,
      textColor,
      fontFamily,
      borderColor,
      borderWidth,
      borderRadius,
      paperWidth,
      paperHeight,
      showQrCode,
      showCode,
      showDate,
      showActivities,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const id = `ctpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    await db.$executeRaw`
      INSERT INTO certificate_templates (
        id, eventId, name, type, headerText, logoUrl, bodyText, participantLabel,
        eventLabel, organizationName, organizationLogo, signatureText, signatureImageUrl,
        backgroundColor, primaryColor, secondaryColor, textColor, fontFamily,
        borderColor, borderWidth, borderRadius, paperWidth, paperHeight,
        showQrCode, showCode, showDate, showActivities, isActive, createdAt, updatedAt
      ) VALUES (
        ${id}, ${eventId || null}, ${name}, ${type}, ${headerText || null}, ${logoUrl || null},
        ${bodyText || null}, ${participantLabel || null}, ${eventLabel || null},
        ${organizationName || null}, ${organizationLogo || null}, ${signatureText || null},
        ${signatureImageUrl || null}, ${backgroundColor || null}, ${primaryColor || null},
        ${secondaryColor || null}, ${textColor || null}, ${fontFamily || null},
        ${borderColor || null}, ${borderWidth || null}, ${borderRadius || null},
        ${paperWidth || null}, ${paperHeight || null},
        ${showQrCode !== false ? 1 : 0}, ${showCode !== false ? 1 : 0},
        ${showDate !== false ? 1 : 0}, ${showActivities !== false ? 1 : 0}, 1, ${now}, ${now}
      )
    `;

    return NextResponse.json({
      success: true,
      data: { id, name, type },
      message: 'Plantilla creada correctamente',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating certificate template:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear plantilla' },
      { status: 500 }
    );
  }
}

// PUT: Update certificate template (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ORGANIZER')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de plantilla requerido' },
        { status: 400 }
      );
    }

    // Check if template exists
    const existing = await db.$queryRaw`
      SELECT * FROM certificate_templates WHERE id = ${id}
    `;

    if ((existing as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Plantilla no encontrada' },
        { status: 404 }
      );
    }

    const now = new Date();

    // Build update query
    const updates: string[] = ['updatedAt = ?'];
    const values: any[] = [now];

    const fields = [
      'name', 'type', 'headerText', 'logoUrl', 'bodyText', 'participantLabel',
      'eventLabel', 'organizationName', 'organizationLogo', 'signatureText',
      'signatureImageUrl', 'backgroundColor', 'primaryColor', 'secondaryColor',
      'textColor', 'fontFamily', 'borderColor', 'borderWidth', 'borderRadius',
      'paperWidth', 'paperHeight', 'showQrCode', 'showCode', 'showDate', 
      'showActivities', 'isActive'
    ];

    for (const field of fields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        if (['showQrCode', 'showCode', 'showDate', 'showActivities', 'isActive'].includes(field)) {
          values.push(updateData[field] ? 1 : 0);
        } else {
          values.push(updateData[field]);
        }
      }
    }

    values.push(id);

    await db.$executeRawUnsafe(
      `UPDATE certificate_templates SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );

    return NextResponse.json({
      success: true,
      message: 'Plantilla actualizada correctamente',
    });
  } catch (error) {
    console.error('Error updating certificate template:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar plantilla' },
      { status: 500 }
    );
  }
}

// DELETE: Delete certificate template (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de plantilla requerido' },
        { status: 400 }
      );
    }

    // Soft delete
    await db.$executeRaw`
      UPDATE certificate_templates SET isActive = 0 WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Plantilla eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting certificate template:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar plantilla' },
      { status: 500 }
    );
  }
}
