// functions/api/export.ts
// Data export endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById
} from './utils';
import type { Env, User, Progress } from './utils';

// GET export endpoints
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    if (url.pathname === '/api/export/progress') {
      return await exportProgress(context);
    }
    
    if (url.pathname === '/api/export/user-data') {
      return await exportUserData(context);
    }
    
    if (url.pathname === '/api/admin/export/all-progress') {
      return await exportAllProgress(context);
    }
    
    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Export error:', error);
    return errorResponse('Internal server error', 500);
  }
};

async function exportProgress(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // Validate session
  const userId = await validateSession(env, request);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }
  
  const user = await getUserById(env, userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  // Get progress data
  const progressData = await env.PROGRESS.get(`progress:${userId}`);
  const progress: Progress = progressData ? JSON.parse(progressData) : {};
  
  // Create CSV
  const csvRows = ['Week,Task,Completed'];
  
  const weeks = {
    week1: ['dc', 'vm', 'share', 'group'],
    week2: ['server', 'wsus', 'time'],
    week3: ['upgrade', 'exchange', 'mailbox', 'mail'],
    week4: ['external', 'hybrid', 'hosting']
  };
  
  Object.entries(weeks).forEach(([week, tasks]) => {
    tasks.forEach(task => {
      const completed = progress[week]?.[task] || false;
      csvRows.push(`${week},${task},${completed}`);
    });
  });
  
  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="velocity-lab-progress-${user.email}-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function exportUserData(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // Validate session
  const userId = await validateSession(env, request);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }
  
  const user = await getUserById(env, userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  // Get all user data
  const progressData = await env.PROGRESS.get(`progress:${userId}`);
  const progress: Progress = progressData ? JSON.parse(progressData) : {};
  
  // Get avatar status
  const hasAvatar = await env.AVATARS.get(userId, { type: 'stream' });
  
  // Compile user data
  const userData = {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    },
    progress,
    hasAvatar: !!hasAvatar,
    exportDate: new Date().toISOString()
  };
  
  return new Response(JSON.stringify(userData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="velocity-lab-data-${user.email}-${new Date().toISOString().split('T')[0]}.json"`
    }
  });
}

async function exportAllProgress(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // Validate admin access
  const userId = await validateSession(env, request);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }
  
  const currentUser = await getUserById(env, userId);
  if (!currentUser || currentUser.role !== 'admin') {
    return errorResponse('Admin access required', 403);
  }
  
  // Create CSV header
  const csvRows = ['Name,Email,Role,Overall Progress %,Week 1,Week 2,Week 3,Week 4,Last Activity'];
  
  // Get all users
  const users = await env.USERS.list({ prefix: `user:` });
  
  for (const { name: userKey } of users.keys) {
    const userData = await env.USERS.get(userKey);
    if (!userData) continue;
    
    const user = JSON.parse(userData) as User;
    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Calculate progress by week
    const weekCounts = [0, 0, 0, 0];
    const weekTasks = [4, 3, 4, 3]; // Tasks per week
    
    ['week1', 'week2', 'week3', 'week4'].forEach((week, index) => {
      const completed = Object.values(progress[week] || {}).filter(Boolean).length;
      weekCounts[index] = completed;
    });
    
    const totalCompleted = weekCounts.reduce((a, b) => a + b, 0);
    const overallProgress = Math.round((totalCompleted / 14) * 100);
    
    csvRows.push([
      `"${user.name}"`,
      user.email,
      user.role,
      `${overallProgress}%`,
      `${weekCounts[0]}/${weekTasks[0]}`,
      `${weekCounts[1]}/${weekTasks[1]}`,
      `${weekCounts[2]}/${weekTasks[2]}`,
      `${weekCounts[3]}/${weekTasks[3]}`,
      user.lastLogin || user.createdAt
    ].join(','));
  }
  
  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="velocity-lab-all-progress-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}