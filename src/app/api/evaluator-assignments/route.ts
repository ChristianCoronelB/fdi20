import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - Obtener asignaciones de evaluadores
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
    const evaluatorId = searchParams.get('evaluatorId');
    const projectId = searchParams.get('projectId');

    // Construir filtros
    const where: any = {};
    
    if (evaluatorId) {
      where.evaluatorId = evaluatorId;
    }
    
    if (projectId) {
      where.projectId = projectId;
    }

    // Si es evaluador, solo ver sus propias asignaciones
    if (session.role === 'EVALUATOR') {
      where.evaluatorId = session.id;
    }

    const assignments = await db.evaluatorAssignment.findMany({
      where,
      include: {
        evaluator: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        project: {
          include: {
            event: { select: { id: true, name: true } },
            room: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error('Error fetching evaluator assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener asignaciones' },
      { status: 500 }
    );
  }
}

// POST - Crear asignación de evaluador (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ORGANIZER')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { evaluatorId, projectId, dueDate } = body;

    if (!evaluatorId || !projectId) {
      return NextResponse.json(
        { success: false, error: 'EvaluatorId y projectId son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el evaluador existe y tiene rol EVALUATOR
    const evaluator = await db.user.findFirst({
      where: { id: evaluatorId, role: 'EVALUATOR' },
    });

    if (!evaluator) {
      return NextResponse.json(
        { success: false, error: 'El evaluador no existe o no tiene rol de evaluador' },
        { status: 400 }
      );
    }

    // Verificar que el proyecto existe
    const project = await db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'El proyecto no existe' },
        { status: 400 }
      );
    }

    // Verificar si ya existe la asignación
    const existing = await db.evaluatorAssignment.findUnique({
      where: {
        evaluatorId_projectId: { evaluatorId, projectId },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'El evaluador ya está asignado a este proyecto' },
        { status: 400 }
      );
    }

    // Crear asignación
    const assignment = await db.evaluatorAssignment.create({
      data: {
        evaluatorId,
        projectId,
        assignedBy: session.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        evaluator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, team: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: assignment,
      message: 'Asignación creada correctamente',
    });
  } catch (error) {
    console.error('Error creating evaluator assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear asignación' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar asignación
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ORGANIZER')) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const evaluatorId = searchParams.get('evaluatorId');
    const projectId = searchParams.get('projectId');

    if (id) {
      // Eliminar por ID
      await db.evaluatorAssignment.delete({
        where: { id },
      });
    } else if (evaluatorId && projectId) {
      // Eliminar por combinación evaluatorId + projectId
      await db.evaluatorAssignment.delete({
        where: {
          evaluatorId_projectId: { evaluatorId, projectId },
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'ID o combinación evaluatorId/projectId requeridos' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Asignación eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting evaluator assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar asignación' },
      { status: 500 }
    );
  }
}
