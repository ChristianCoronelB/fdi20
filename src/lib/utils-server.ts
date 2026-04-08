import { db } from './db';
import type { DashboardStats, ChartData, ActivityByHour, VotingResult } from '@/types';

export async function getDashboardStats(eventId?: string): Promise<DashboardStats> {
  const where = eventId ? { eventId } : {};
  
  const [
    totalUsers,
    totalEvents,
    totalActivities,
    totalProjects,
    totalVotes,
    totalAttendance,
    activeUsers,
    upcomingActivities,
  ] = await Promise.all([
    db.user.count(),
    db.event.count(),
    db.activity.count(where),
    db.project.count(where),
    db.vote.count(),
    db.attendance.count(),
    db.user.count({ where: { isActive: true } }),
    db.activity.count({
      where: {
        ...where,
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
    }),
  ]);
  
  return {
    totalUsers,
    totalEvents,
    totalActivities,
    totalProjects,
    totalVotes,
    totalAttendance,
    activeUsers,
    upcomingActivities,
  };
}

export async function getActivityStats(eventId: string): Promise<ChartData[]> {
  const activities = await db.activity.findMany({
    where: { eventId },
    select: {
      title: true,
      currentAttendance: true,
    },
    orderBy: { currentAttendance: 'desc' },
    take: 10,
  });
  
  return activities.map((a, i) => ({
    name: a.title.length > 20 ? a.title.substring(0, 20) + '...' : a.title,
    value: a.currentAttendance,
    color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'][i],
  }));
}

export async function getAttendanceByHour(eventId: string): Promise<ActivityByHour[]> {
  const attendances = await db.attendance.findMany({
    where: {
      activity: { eventId },
    },
    select: {
      checkInTime: true,
    },
  });
  
  const hourCounts: Record<number, number> = {};
  
  attendances.forEach((a) => {
    const hour = new Date(a.checkInTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCounts[i] || 0,
  }));
}

export async function getVotingResults(eventId: string): Promise<VotingResult[]> {
  const projects = await db.project.findMany({
    where: { eventId },
    include: {
      _count: { select: { votes: true } },
      votes: {
        select: { score: true },
      },
    },
  });
  
  const results = projects.map((p) => {
    const totalScore = p.votes.reduce((sum, v) => sum + v.score, 0);
    const averageScore = p.votes.length > 0 ? totalScore / p.votes.length : 0;
    
    return {
      projectId: p.id,
      projectName: p.name,
      team: p.team,
      category: p.category || 'General',
      totalVotes: p._count.votes,
      averageScore,
      rank: 0,
    };
  });
  
  // Sort by average score, then by total votes
  results.sort((a, b) => {
    if (b.averageScore !== a.averageScore) return b.averageScore - a.averageScore;
    return b.totalVotes - a.totalVotes;
  });
  
  // Assign ranks
  results.forEach((r, i) => {
    r.rank = i + 1;
  });
  
  return results;
}

export async function getLeaderboard(eventId?: string): Promise<Array<{
  userId: string;
  userName: string;
  userAvatar: string | null;
  points: number;
  level: number;
  rank: number;
}>> {
  const users = await db.user.findMany({
    where: {
      isActive: true,
      ...(eventId && {
        attendances: {
          some: {
            activity: { eventId },
          },
        },
      }),
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      points: true,
      level: true,
    },
    orderBy: [
      { points: 'desc' },
      { level: 'desc' },
    ],
    take: 100,
  });
  
  return users.map((u, i) => ({
    userId: u.id,
    userName: u.name,
    userAvatar: u.avatar,
    points: u.points,
    level: u.level,
    rank: i + 1,
  }));
}

export async function getRecentActivity(eventId: string): Promise<Array<{
  type: string;
  message: string;
  timestamp: Date;
  userName?: string;
}>> {
  const recentVotes = await db.vote.findMany({
    where: { project: { eventId } },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  const recentAttendance = await db.attendance.findMany({
    where: { activity: { eventId } },
    include: { user: true, activity: true },
    orderBy: { checkInTime: 'desc' },
    take: 5,
  });
  
  const activities: Array<{ type: string; message: string; timestamp: Date; userName?: string }> = [];
  
  recentVotes.forEach((v) => {
    activities.push({
      type: 'vote',
      message: `${v.user.name} votó por un proyecto`,
      timestamp: v.createdAt,
      userName: v.user.name,
    });
  });
  
  recentAttendance.forEach((a) => {
    activities.push({
      type: 'attendance',
      message: `${a.user.name} asistió a ${a.activity.title}`,
      timestamp: a.checkInTime,
      userName: a.user.name,
    });
  });
  
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
}
