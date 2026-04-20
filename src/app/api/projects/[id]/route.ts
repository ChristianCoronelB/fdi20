import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, isOrganizer } from '@/lib/auth';
import { ProjectStatus } from '@prisma/client';

// GET /api/projects/[id] - Get project with votes, room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await db.project.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            building: true,
            floor: true,
            capacity: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            slug: true,
            votingEnabled: true,
          },
        },
        votes: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate average score
    const votesWithScores = project.votes.filter(v => v.score > 0);
    const averageScore = votesWithScores.length > 0
      ? votesWithScores.reduce((sum, v) => sum + v.score, 0) / votesWithScores.length
      : null;

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        averageScore,
        team: project.team ? JSON.parse(project.team) : [],
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update project (including status changes)
export async function PUT(
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

    if (!isOrganizer(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Organizer role required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const {
      name,
      team,
      category,
      description,
      image,
      videoUrl,
      githubUrl,
      websiteUrl,
      // New fields for Fábrica de Ideas
      leaderName,
      leaderEmail,
      leaderPhone,
      institution,
      course,
      tutorName,
      area,
      projectCategory,
      status,
      roomId,
      isActive,
    } = body;

    // Validate status if provided
    if (status && !Object.values(ProjectStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Verify room exists if provided
    if (roomId !== undefined && roomId !== null) {
      const room = await db.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        );
      }
    }

    const project = await db.project.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(team !== undefined && { team: typeof team === 'object' ? JSON.stringify(team) : team }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(githubUrl !== undefined && { githubUrl }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        // New fields
        ...(leaderName !== undefined && { leaderName }),
        ...(leaderEmail !== undefined && { leaderEmail }),
        ...(leaderPhone !== undefined && { leaderPhone }),
        ...(institution !== undefined && { institution }),
        ...(course !== undefined && { course }),
        ...(tutorName !== undefined && { tutorName }),
        ...(area !== undefined && { area }),
        ...(projectCategory !== undefined && { projectCategory }),
        ...(status !== undefined && { status }),
        ...(roomId !== undefined && { roomId }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        room: true,
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
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

    if (!isOrganizer(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin or Organizer role required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if project exists
    const existingProject = await db.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: { votes: true },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete votes first (cascade should handle this, but let's be explicit)
    await db.vote.deleteMany({
      where: { projectId: id },
    });

    // Delete the project
    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      data: { message: 'Project deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
