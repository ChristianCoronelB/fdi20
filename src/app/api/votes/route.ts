import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Default values when no config exists
const DEFAULT_MAX_VOTES = 3;

// GET /api/votes - List votes (filter by projectId, userId, eventId)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const where: Record<string, unknown> = {};
    
    // Non-admin users can only see their own votes when filtering by userId
    if (userId) {
      if (session.role !== 'ADMIN' && session.userId !== userId) {
        return NextResponse.json(
          { success: false, error: 'You can only view your own votes' },
          { status: 403 }
        );
      }
      where.userId = userId;
    }
    
    if (projectId) {
      where.projectId = projectId;
    }

    // Filter by eventId through project relation
    if (eventId) {
      where.project = {
        eventId: eventId
      };
    }

    const votes = await db.vote.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            category: true,
            area: true,
            projectCategory: true,
            status: true,
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    // Include score in the response data
    const votesWithScore = votes.map(vote => ({
      ...vote,
      score: vote.score,
    }));

    // Get total count for pagination
    const total = await db.vote.count({ where });

    // Get voting config for the event
    let votingConfig = null;
    let userVoteCount = 0;
    let maxVotesPerUser = DEFAULT_MAX_VOTES;

    if (userId && eventId) {
      // Get active voting config
      votingConfig = await db.votingConfig.findFirst({
        where: {
          eventId,
          isActive: true,
        },
      });

      maxVotesPerUser = votingConfig?.maxVotesPerUser || DEFAULT_MAX_VOTES;

      // Count user's votes for this event
      userVoteCount = await db.vote.count({
        where: {
          userId,
          project: {
            eventId: eventId
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: votesWithScore,
      meta: {
        total,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null,
        userVoteCount,
        maxVotesPerUser,
        votingConfig: votingConfig ? {
          id: votingConfig.id,
          name: votingConfig.name,
          voteType: votingConfig.voteType,
          maxVotesPerUser: votingConfig.maxVotesPerUser,
          showResults: votingConfig.showResults,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

// POST /api/votes - Create vote (authenticated users, respects voting config)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId, score, comment } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Verify project exists and is approved/finalist/winner
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        event: {
          select: {
            id: true,
            votingEnabled: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!project.isActive) {
      return NextResponse.json(
        { success: false, error: 'Project is not active' },
        { status: 400 }
      );
    }

    // Check if voting is enabled for this event
    if (!project.event.votingEnabled) {
      return NextResponse.json(
        { success: false, error: 'Voting is not enabled for this event' },
        { status: 400 }
      );
    }

    // Check if project is in a votable status
    const votableStatuses = ['APPROVED', 'FINALIST', 'WINNER'];
    if (!votableStatuses.includes(project.status)) {
      return NextResponse.json(
        { success: false, error: 'This project is not open for voting' },
        { status: 400 }
      );
    }

    // Check if user already voted for this project (one vote per user per project)
    const existingVote = await db.vote.findUnique({
      where: {
        userId_projectId: {
          userId: session.userId,
          projectId,
        },
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { success: false, error: 'Ya has votado por este proyecto' },
        { status: 400 }
      );
    }

    // Get voting config for this event
    const votingConfig = await db.votingConfig.findFirst({
      where: {
        eventId: project.event.id,
        isActive: true,
      },
    });

    const maxVotesPerUser = votingConfig?.maxVotesPerUser || DEFAULT_MAX_VOTES;

    // Check if user has reached the maximum votes for this event
    const userVoteCount = await db.vote.count({
      where: {
        userId: session.userId,
        project: {
          eventId: project.event.id
        }
      }
    });

    if (userVoteCount >= maxVotesPerUser) {
      return NextResponse.json(
        { success: false, error: `Ya has alcanzado el límite de ${maxVotesPerUser} votos. Elimina un voto anterior para votar por otro proyecto.` },
        { status: 400 }
      );
    }

    // Validate score based on vote type
    let voteScore = 1;
    if (votingConfig?.voteType === 'STARS') {
      voteScore = score && score >= 1 && score <= 5 ? score : 5;
    } else if (votingConfig?.voteType === 'POINTS') {
      voteScore = score && score >= 1 && score <= 10 ? score : 10;
    } else {
      // LIKE type - always 1
      voteScore = 1;
    }

    // Create vote and update project vote count
    const vote = await db.$transaction(async (tx) => {
      const newVote = await tx.vote.create({
        data: {
          userId: session.userId,
          projectId,
          score: voteScore,
          comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Get all votes for this project to calculate average
      const projectVotes = await tx.vote.findMany({
        where: { projectId },
        select: { score: true },
      });

      // Calculate average score
      const totalScore = projectVotes.reduce((sum, v) => sum + v.score, 0);
      const averageScore = projectVotes.length > 0 ? totalScore / projectVotes.length : 0;

      // Update project total votes and average score
      await tx.project.update({
        where: { id: projectId },
        data: {
          totalVotes: { increment: 1 },
          averageScore: averageScore,
        },
      });

      return newVote;
    });

    // Create notification for vote confirmation
    const notificationConfig = await db.notificationConfig.findFirst({
      where: { eventId: project.event.id },
    });

    if (notificationConfig?.voteConfirmationEnabled !== false) {
      const votesRemaining = maxVotesPerUser - userVoteCount - 1;
      await db.notification.create({
        data: {
          userId: session.userId,
          eventId: project.event.id,
          title: '🗳️ ¡Voto Registrado!',
          message: `Has votado por "${vote.project.name}". ${votesRemaining > 0 ? `Te quedan ${votesRemaining} votos disponibles.` : 'Has usado todos tus votos.'}`,
          type: 'VOTE_CONFIRMATION',
          actionUrl: '/projects-view',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: vote,
      meta: {
        votesRemaining: maxVotesPerUser - userVoteCount - 1,
        maxVotesPerUser,
        voteType: votingConfig?.voteType || 'LIKE',
        score: voteScore,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating vote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vote' },
      { status: 500 }
    );
  }
}
