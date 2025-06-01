// functions/api/profile.ts
// User profile endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById
} from './utils';
import { validateCSRFToken } from './csrf';
import type { Env, User, Progress } from './utils';

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
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);
    
    // Get user rank
    const allUsers = await env.USERS.list({ prefix: `user:` });
    const userProgressList: Array<{ id: string; progress: number }> = [];
    
    for (const { name: userKey } of allUsers.keys) {
      const userData = await env.USERS.get(userKey);
      if (!userData) continue;
      
      const otherUser = JSON.parse(userData) as User;
      const otherProgressData = await env.PROGRESS.get(`progress:${otherUser.id}`);
      const otherProgress: Progress = otherProgressData ? JSON.parse(otherProgressData) : {};
      
      let otherCompleted = 0;
      Object.values(otherProgress).forEach(week => {
        otherCompleted += Object.values(week).filter(Boolean).length;
      });
      
      userProgressList.push({
        id: otherUser.id,
        progress: Math.round((otherCompleted / totalTasks) * 100)
      });
    }
    
    userProgressList.sort((a, b) => b.progress - a.progress);
    const rank = userProgressList.findIndex(u => u.id === userId) + 1;
    
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
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST change password
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    if (url.pathname === '/api/profile/change-password') {
      return await handlePasswordChange(context);
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
  if (newPassword.length < 8) {
    return errorResponse('New password must be at least 8 characters', 400);
  }
  
  // Update password
  user.password = newPassword;
  user.passwordChangedAt = new Date().toISOString();
  await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
  
  // Log password change
  await env.USERS.put(
    `log:password:${new Date().toISOString()}:${userId}`,
    JSON.stringify({ action: 'password_changed' }),
    { expirationTtl: 86400 * 90 }
  );
  
  return jsonResponse({ message: 'Password updated successfully' });
}