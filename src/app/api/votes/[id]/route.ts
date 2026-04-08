import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/votes/[id] - Get vote details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const vote = await db.vote.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            image: true,
            event: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!vote) {
      return NextResponse.json(
        { success: false, error: 'Vote not found' },
        { status: 404 }
      );
    }

    // Users can only see their own vote details unless they're admin
    if (session.role !== 'ADMIN' && vote.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only view your own votes' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: vote,
    });
  } catch (error) {
    console.error('Error fetching vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vote' },
      { status: 500 }
    );
  }
}

// DELETE /api/votes/[id] - Delete vote (own vote only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if vote exists
    const existingVote = await db.vote.findUnique({
      where: { id },
    });

    if (!existingVote) {
      return NextResponse.json(
        { success: false, error: 'Vote not found' },
        { status: 404 }
      );
    }

    // Users can only delete their own votes (admin can delete any)
    if (session.role !== 'ADMIN' && existingVote.userId !== session.userId) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own votes' },
        { status: 403 }
      );
    }

    // Delete vote and update project vote count
    await db.$transaction(async (tx) => {
      await tx.vote.delete({
        where: { id },
      });

      // Update project total votes
      await tx.project.update({
        where: { id: existingVote.projectId },
        data: {
          totalVotes: { decrement: 1 },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Vote deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vote' },
      { status: 500 }
    );
  }
}
