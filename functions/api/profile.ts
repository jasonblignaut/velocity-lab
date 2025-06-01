// functions/api/profile.ts
// Enhanced user profile endpoints (no avatar functionality) - FIXED IMPORTS

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  calculateProgress,
  validatePassword,
  sanitizeInput,
  logActivity,
  validateCSRFToken  // Import from utils.ts instead of csrf.ts
} from '../utils';
import type { Env, User, Progress } from '../utils';

// GET user profile
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Get user
    const user = await getUserById(env, userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }
    
    // Get progress
    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Calculate statistics
    let completedTasks = 0;
    const tasksByWeek: Record<string, number> = {};
    
    ['week1', 'week2', 'week3', 'week4'].forEach(week => {
      const weekTasks = progress[week] || {};
      const completed = Object.values(weekTasks).filter(Boolean).length;
      tasksByWeek[week] = completed;
      completedTasks += completed;
    });
    
    const totalTasks = 14;
    const progressPercent = calculateProgress(progress);
    
    // Get user rank
    const allUsers = await env.USERS.list({ prefix: `user:` });
    const userProgressList: Array<{ id: string; progress: number }> = [];
    
    for (const { name: userKey } of allUsers.keys) {
      const userData = await env.USERS.get(userKey);
      if (!userData) continue;
      
      const otherUser = JSON.parse(userData) as User;
      const otherProgressData = await env.PROGRESS.get(`progress:${otherUser.id}`);
      const otherProgress: Progress = otherProgressData ? JSON.parse(otherProgressData) : {};
      
      const otherProgressPercent = calculateProgress(otherProgress);
      userProgressList.push({
        id: otherUser.id,
        progress: otherProgressPercent
      });
    }
    
    userProgressList.sort((a, b) => b.progress - a.progress);
    const rank = userProgressList.findIndex(u => u.id === userId) + 1;
    
    // Log profile view
    await logActivity(env, userId, 'profile_view');
    
    return jsonResponse({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      progress: progressPercent,
      completedTasks,
      totalTasks,
      tasksByWeek,
      rank,
      totalUsers: userProgressList.length,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      passwordChangedAt: user.passwordChangedAt
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST profile actions
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    if (url.pathname === '/api/profile/change-password') {
      return await handlePasswordChange(context);
    }
    
    if (url.pathname === '/api/profile/export-data') {
      return await handleDataExport(context);
    }
    
    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Profile POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};

async function handlePasswordChange(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // Validate session
  const userId = await validateSession(env, request);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }
  
  const formData = await request.formData();
  const currentPassword = formData.get('currentPassword')?.toString();
  const newPassword = formData.get('newPassword')?.toString();
  const csrfToken = formData.get('csrf_token')?.toString();
  
  if (!currentPassword || !newPassword || !csrfToken) {
    return errorResponse('Missing required fields', 400);
  }
  
  // Validate CSRF
  const isValidCSRF = await validateCSRFToken(env, csrfToken);
  if (!isValidCSRF) {
    return errorResponse('Invalid CSRF token', 403);
  }
  
  // Get user
  const user = await getUserById(env, userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  // Verify current password
  if (user.password !== currentPassword) {
    return errorResponse('Current password is incorrect', 400);
  }
  
  // Validate new password
  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return errorResponse(passwordValidation.message || 'Invalid password', 400);
  }
  
  // Prevent same password
  if (currentPassword === newPassword) {
    return errorResponse('New password must be different from current password', 400);
  }
  
  // Update password
  user.password = newPassword;
  user.passwordChangedAt = new Date().toISOString();
  await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
  
  // Log password change
  await logActivity(env, userId, 'password_changed', {
    changedBy: 'self'
  });
  
  return jsonResponse({ 
    message: 'Password updated successfully',
    passwordChangedAt: user.passwordChangedAt
  });
}

async function handleDataExport(context: { env: Env; request: Request }) {
  const { env, request } = context;
  
  // Validate session
  const userId = await validateSession(env, request);
  if (!userId) {
    return errorResponse('Unauthorized', 401);
  }
  
  // Get user
  const user = await getUserById(env, userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  // Get progress
  const progressData = await env.PROGRESS.get(`progress:${userId}`);
  const progress: Progress = progressData ? JSON.parse(progressData) : {};
  
  // Get activity logs
  const logs = await env.USERS.list({ prefix: `log:` });
  const userLogs = [];
  
  for (const { name: logKey } of logs.keys) {
    const logData = await env.USERS.get(logKey);
    if (logData) {
      try {
        const log = JSON.parse(logData);
        if (log.userId === userId) {
          userLogs.push(log);
        }
      } catch (e) {
        // Skip invalid logs
      }
    }
  }
  
  // Prepare export data (excluding sensitive information)
  const exportData = {
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      passwordChangedAt: user.passwordChangedAt
    },
    progress: progress,
    statistics: {
      totalTasks: 14,
      completedTasks: calculateProgress(progress) * 14 / 100,
      progressPercentage: calculateProgress(progress)
    },
    activityLogs: userLogs,
    exportedAt: new Date().toISOString()
  };
  
  // Log data export
  await logActivity(env, userId, 'data_exported');
  
  // Return as JSON download
  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="velocity-lab-data-${user.email}-${new Date().toISOString().split('T')[0]}.json"`,
      'Cache-Control': 'no-cache'
    }
  });
}