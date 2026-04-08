import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hasRole } from '@/lib/auth';
import type { UserRole } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Get user details with attendance, votes
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Users can only see their own profile unless they're admin/moderator
    const isOwnProfile = session.userId === id;
    const canViewAll = hasRole(session.role, ['ADMIN', 'ORGANIZER', 'MODERATOR']);

    if (!isOwnProfile && !canViewAll) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver este usuario' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        points: true,
        level: true,
        bio: true,
        phone: true,
        country: true,
        language: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Get user's attendance records
    const attendances = await db.attendance.findMany({
      where: { userId: id },
      include: {
        activity: {
          select: {
            id: true,
            title: true,
            type: true,
            startTime: true,
            endTime: true,
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            event: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { checkInTime: 'desc' },
      take: 20,
    });

    // Get user's votes
    const votes = await db.vote.findMany({
      where: { userId: id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            category: true,
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
      take: 20,
    });

    // Get user's achievements
    const achievements = await db.userAchievement.findMany({
      where: { userId: id },
      include: {
        achievement: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            points: true,
            category: true,
          },
        },
      },
      orderBy: { earnedAt: 'desc' },
    });

    // Get user's certificates
    const certificates = await db.certificate.findMany({
      where: { userId: id },
      orderBy: { issueDate: 'desc' },
    });

    // Statistics
    const stats = {
      totalAttendance: await db.attendance.count({ where: { userId: id } }),
      totalVotes: await db.vote.count({ where: { userId: id } }),
      totalPoints: user.points,
      totalAchievements: achievements.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        user,
        attendances,
        votes,
        achievements,
        certificates,
        stats,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Update user (admin can change roles)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { name, bio, phone, country, language, avatar, role, isActive } = body;

    // Check permissions
    const isOwnProfile = session.userId === id;
    const isAdminUser = hasRole(session.role, ['ADMIN']);

    if (!isOwnProfile && !isAdminUser) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para modificar este usuario' },
        { status: 403 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Fields anyone can update on their own profile
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (country !== undefined) updateData.country = country;
    if (language !== undefined) updateData.language = language;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Admin-only fields
    if (isAdminUser) {
      if (role !== undefined) {
        // Prevent admin from demoting themselves
        if (id === session.userId && role !== 'ADMIN') {
          return NextResponse.json(
            { success: false, error: 'No puedes cambiar tu propio rol de administrador' },
            { status: 400 }
          );
        }
        updateData.role = role as UserRole;
      }
      if (isActive !== undefined) updateData.isActive = isActive;
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        points: true,
        level: true,
        bio: true,
        phone: true,
        country: true,
        language: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate user (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Only admins can deactivate users
    if (!hasRole(session.role, ['ADMIN'])) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para desactivar usuarios' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Prevent admin from deactivating themselves
    if (id === session.userId) {
      return NextResponse.json(
        { success: false, error: 'No puedes desactivar tu propia cuenta' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Soft delete - deactivate instead of deleting
    const updatedUser = await db.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Usuario desactivado',
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
