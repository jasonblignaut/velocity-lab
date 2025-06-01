// functions/api/admin.ts
// Enhanced Admin dashboard endpoints with password/role management

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById
} from './utils';
import type { Env, User, Progress } from './utils';

// GET admin endpoints
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    if (url.pathname === '/api/admin/users-progress') {
      return await getUsersProgress(context);
    }
    
    if (url.pathname === '/api/admin/stats') {
      return await getAdminStats(context);
    }
    
    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Admin GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST admin actions
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const url = new URL(request.url);
    
    if (url.pathname === '/api/admin/change-user-password') {
      return await changeUserPassword(context);
    }
    
    if (url.pathname === '/api/admin/change-user-role') {
      return await changeUserRole(context);
    }
    
    if (url.pathname === '/api/admin/delete-user') {
      return await deleteUser(context);
    }
    
    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Admin POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};

async function getUsersProgress(context: { env: Env; request: Request }) {
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
  
  // Get all users
  const usersProgress = [];
  const users = await env.USERS.list({ prefix: `user:` });
  
  for (const { name: userKey } of users.keys) {
    const userData = await env.USERS.get(userKey);
    if (!userData) continue;
    
    const user = JSON.parse(userData) as User;
    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Calculate progress
    let completedTasks = 0;
    const weekProgress: Record<string, number> = {};
    
    ['week1', 'week2', 'week3', 'week4'].forEach(week => {
      const weekTasks = progress[week] || {};
      const completed = Object.values(weekTasks).filter(Boolean).length;
      weekProgress[week] = completed;
      completedTasks += completed;
    });
    
    const totalTasks = 14;
    const progressPercent = Math.round((completedTasks / totalTasks) * 100);
    
    usersProgress.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      progress: progressPercent,
      completedTasks,
      totalTasks,
      weekProgress,
      lastActivity: user.lastLogin || user.createdAt,
      createdAt: user.createdAt
    });
  }
  
  // Sort by progress descending
  usersProgress.sort((a, b) => b.progress - a.progress);
  
  return jsonResponse(usersProgress);
}

async function getAdminStats(context: { env: Env; request: Request }) {
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
  
  // Calculate statistics
  const users = await env.USERS.list({ prefix: `user:` });
  let totalUsers = 0;
  let totalAdmins = 0;
  let totalProgress = 0;
  let completedUsers = 0;
  let activeToday = 0;
  let activeThisWeek = 0;
  
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  for (const { name: userKey } of users.keys) {
    const userData = await env.USERS.get(userKey);
    if (!userData) continue;
    
    const user = JSON.parse(userData) as User;
    totalUsers++;
    
    if (user.role === 'admin') totalAdmins++;
    
    // Check activity
    const lastActivity = new Date(user.lastLogin || user.createdAt);
    if (lastActivity >= todayStart) activeToday++;
    if (lastActivity >= weekStart) activeThisWeek++;
    
    // Calculate progress
    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    let completedTasks = 0;
    Object.values(progress).forEach(week => {
      completedTasks += Object.values(week).filter(Boolean).length;
    });
    
    const progressPercent = Math.round((completedTasks / 14) * 100);
    totalProgress += progressPercent;
    
    if (progressPercent === 100) completedUsers++;
  }
  
  const averageProgress = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;
  
  return jsonResponse({
    totalUsers,
    totalAdmins,
    completedUsers,
    averageProgress,
    activeUsers: totalUsers - completedUsers,
    activeToday,
    activeThisWeek,
    completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0
  });
}

async function changeUserPassword(context: { env: Env; request: Request }) {
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
  
  const formData = await request.formData();
  const email = formData.get('email')?.toString().toLowerCase();
  const newPassword = formData.get('newPassword')?.toString();
  
  if (!email || !newPassword) {
    return errorResponse('Email and new password required', 400);
  }
  
  if (newPassword.length < 8) {
    return errorResponse('Password must be at least 8 characters', 400);
  }
  
  // Get target user
  const targetUserData = await env.USERS.get(`user:${email}`);
  if (!targetUserData) {
    return errorResponse('User not found', 404);
  }
  
  const targetUser = JSON.parse(targetUserData) as User;
  
  // Update password
  targetUser.password = newPassword;
  targetUser.passwordChangedAt = new Date().toISOString();
  await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
  
  // Log action
  await env.USERS.put(
    `log:admin:${new Date().toISOString()}:${targetUser.id}`,
    JSON.stringify({
      action: 'password_changed_by_admin',
      by: currentUser.email,
      target: targetUser.email
    }),
    { expirationTtl: 86400 * 90 }
  );
  
  return jsonResponse({
    message: 'Password updated successfully',
    user: {
      name: targetUser.name,
      email: targetUser.email
    }
  });
}

async function changeUserRole(context: { env: Env; request: Request }) {
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
  
  const formData = await request.formData();
  const email = formData.get('email')?.toString().toLowerCase();
  const newRole = formData.get('role')?.toString();
  
  if (!email || !newRole) {
    return errorResponse('Email and role required', 400);
  }
  
  if (newRole !== 'admin' && newRole !== 'user') {
    return errorResponse('Invalid role. Must be "admin" or "user"', 400);
  }
  
  // Prevent self-demotion
  if (email === currentUser.email && newRole === 'user') {
    return errorResponse('Cannot change your own role to user', 400);
  }
  
  // Get target user
  const targetUserData = await env.USERS.get(`user:${email}`);
  if (!targetUserData) {
    return errorResponse('User not found', 404);
  }
  
  const targetUser = JSON.parse(targetUserData) as User;
  
  if (targetUser.role === newRole) {
    return errorResponse(`User is already a ${newRole}`, 400);
  }
  
  // Update role
  targetUser.role = newRole;
  await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
  
  // Log action
  await env.USERS.put(
    `log:admin:${new Date().toISOString()}:${targetUser.id}`,
    JSON.stringify({
      action: `role_changed_to_${newRole}`,
      by: currentUser.email,
      target: targetUser.email
    }),
    { expirationTtl: 86400 * 90 }
  );
  
  return jsonResponse({
    message: `User role updated to ${newRole} successfully`,
    user: {
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role
    }
  });
}

async function deleteUser(context: { env: Env; request: Request }) {
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
  
  const formData = await request.formData();
  const email = formData.get('email')?.toString().toLowerCase();
  
  if (!email) {
    return errorResponse('Email required', 400);
  }
  
  // Prevent self-deletion
  if (email === currentUser.email) {
    return errorResponse('Cannot delete your own account', 400);
  }
  
  // Get target user
  const targetUserData = await env.USERS.get(`user:${email}`);
  if (!targetUserData) {
    return errorResponse('User not found', 404);
  }
  
  const targetUser = JSON.parse(targetUserData) as User;
  
  // Delete user data
  await env.USERS.delete(`user:${email}`);
  await env.PROGRESS.delete(`progress:${targetUser.id}`);
  
  // Delete user sessions
  const sessions = await env.USERS.list({ prefix: `session:` });
  for (const { name: sessionKey } of sessions.keys) {
    const sessionData = await env.USERS.get(sessionKey);
    if (sessionData === targetUser.id) {
      await env.USERS.delete(sessionKey);
    }
  }
  
  // Log action
  await env.USERS.put(
    `log:admin:${new Date().toISOString()}:${targetUser.id}`,
    JSON.stringify({
      action: 'user_deleted',
      by: currentUser.email,
      target: targetUser.email
    }),
    { expirationTtl: 86400 * 90 }
  );
  
  return jsonResponse({
    message: 'User deleted successfully',
    deletedUser: {
      email: targetUser.email
    }
  });
}