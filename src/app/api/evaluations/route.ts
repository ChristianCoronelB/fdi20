import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - List evaluations for a project or by a user
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    // If projectId is provided, get evaluations for that project
    if (projectId) {
      const evaluations = await db.evaluation.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      // Calculate average scores
      const avgScores = evaluations.length > 0 ? {
        innovation: evaluations.reduce((sum, e) => sum + e.innovation, 0) / evaluations.length,
        viability: evaluations.reduce((sum, e) => sum + e.viability, 0) / evaluations.length,
        impact: evaluations.reduce((sum, e) => sum + e.impact, 0) / evaluations.length,
        presentation: evaluations.reduce((sum, e) => sum + e.presentation, 0) / evaluations.length,
        scalability: evaluations.reduce((sum, e) => sum + e.scalability, 0) / evaluations.length,
        execution: evaluations.reduce((sum, e) => sum + e.execution, 0) / evaluations.length,
        total: evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length,
      } : null;

      return NextResponse.json({
        success: true,
        data: evaluations,
        meta: {
          count: evaluations.length,
          averageScores: avgScores
        }
      });
    }

    // If userId is provided, get evaluations by that user
    if (userId) {
      // Only allow users to see their own evaluations (or admins to see all)
      if (userId !== user.id && user.role !== 'ADMIN' && user.role !== 'ORGANIZER') {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
      }

      const evaluations = await db.evaluation.findMany({
        where: { userId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              team: true,
              category: true,
              description: true,
              image: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      return NextResponse.json({
        success: true,
        data: evaluations
      });
    }

    // For admins: get all evaluations
    if (user.role !== 'ADMIN' && user.role !== 'ORGANIZER' && user.role !== 'EVALUATOR') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 });
    }

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const evaluations = await db.evaluation.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        project: {
          select: {
            id: true,
            name: true,
            team: true,
            category: true,
            status: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: evaluations
    });

  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener evaluaciones'
    }, { status: 500 });
  }
}

// POST - Create or update an evaluation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    // Only EVALUATOR, ADMIN, or ORGANIZER can create evaluations
    if (user.role !== 'EVALUATOR' && user.role !== 'ADMIN' && user.role !== 'ORGANIZER') {
      return NextResponse.json({
        success: false,
        error: 'Solo los evaluadores pueden crear evaluaciones'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      projectId,
      innovation,
      innovationComment,
      viability,
      viabilityComment,
      impact,
      impactComment,
      presentation,
      presentationComment,
      scalability,
      scalabilityComment,
      execution,
      executionComment,
      generalComment,
      totalScore: providedTotalScore, // Total score from frontend (sum over 100 points)
      status = 'DRAFT'
    } = body;

    if (!projectId) {
      return NextResponse.json({
        success: false,
        error: 'El ID del proyecto es requerido'
      }, { status: 400 });
    }

    // Check if project exists
    const project = await db.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({
        success: false,
        error: 'Proyecto no encontrado'
      }, { status: 404 });
    }

    // Use provided total score (sum of all criteria, max 100 points)
    // or calculate it if not provided
    const totalScore = providedTotalScore ?? 
      (innovation || 0) + (viability || 0) + (impact || 0) + 
      (presentation || 0) + (scalability || 0) + (execution || 0);

    // Check if evaluation already exists
    const existingEvaluation = await db.evaluation.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId
        }
      }
    });

    let evaluation;

    if (existingEvaluation) {
      // Update existing evaluation
      evaluation = await db.evaluation.update({
        where: { id: existingEvaluation.id },
        data: {
          innovation: innovation ?? existingEvaluation.innovation,
          innovationComment,
          viability: viability ?? existingEvaluation.viability,
          viabilityComment,
          impact: impact ?? existingEvaluation.impact,
          impactComment,
          presentation: presentation ?? existingEvaluation.presentation,
          presentationComment,
          scalability: scalability ?? existingEvaluation.scalability,
          scalabilityComment,
          execution: execution ?? existingEvaluation.execution,
          executionComment,
          generalComment,
          totalScore,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date() : existingEvaluation.submittedAt
        }
      });
    } else {
      // Create new evaluation
      evaluation = await db.evaluation.create({
        data: {
          userId: user.id,
          projectId,
          innovation: innovation ?? 0,
          innovationComment,
          viability: viability ?? 0,
          viabilityComment,
          impact: impact ?? 0,
          impactComment,
          presentation: presentation ?? 0,
          presentationComment,
          scalability: scalability ?? 0,
          scalabilityComment,
          execution: execution ?? 0,
          executionComment,
          generalComment,
          totalScore,
          status,
          submittedAt: status === 'SUBMITTED' ? new Date() : null
        }
      });
    }

    // Update project's average evaluation score
    await updateProjectEvaluationStats(projectId);

    return NextResponse.json({
      success: true,
      data: evaluation,
      message: existingEvaluation ? 'Evaluación actualizada' : 'Evaluación creada'
    });

  } catch (error) {
    console.error('Error creating/updating evaluation:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al guardar la evaluación'
    }, { status: 500 });
  }
}

// Helper function to update project evaluation stats
async function updateProjectEvaluationStats(projectId: string) {
  const evaluations = await db.evaluation.findMany({
    where: { projectId, status: 'SUBMITTED' }
  });

  if (evaluations.length > 0) {
    const averageEvaluation = evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length;
    
    await db.project.update({
      where: { id: projectId },
      data: {
        averageEvaluation,
        evaluationCount: evaluations.length
      }
    });
  }
}
