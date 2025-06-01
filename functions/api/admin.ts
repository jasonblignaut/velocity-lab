// functions/api/admin.ts
// Admin dashboard endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById
} from './utils';
import type { Env, User, Progress } from './utils';

// GET users progress
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
    
    if (url.pathname.startsWith('/api/admin/user-avatar/')) {
      return await getUserAvatar(context);
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
    
    if (url.pathname === '/api/admin/grant-admin') {
      return await grantAdminAccess(context);
    }
    
    if (url.pathname === '/api/admin/revoke-admin') {
      return await revokeAdminAccess(context);
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
    
    // Check avatar
    const hasAvatar = await env.AVATARS.get(user.id, { type: 'stream' });
    const avatarUrl = hasAvatar ? `/api/admin/user-avatar/${user.id}` : null;
    
    usersProgress.push({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      progress: progressPercent,
      completedTasks,
      totalTasks,
      weekProgress,
      avatar: avatarUrl,
      lastActivity: user.lastLogin || user.createdAt,
      createdAt: user.createdAt
    });
  }
  
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
 
 // Get recent activity logs
 const recentLogs = [];
 const logs = await env.USERS.list({ prefix: `log:`, limit: 20 });
 
 for (const { name: logKey } of logs.keys) {
   const logData = await env.USERS.get(logKey);
   if (logData) {
     try {
       const log = JSON.parse(logData);
       const parts = logKey.split(':');
       recentLogs.push({
         ...log,
         type: parts[1],
         timestamp: parts[2],
         userId: parts[3]
       });
     } catch (e) {
       console.error('Log parse error:', e);
     }
   }
 }
 
 return jsonResponse({
   totalUsers,
   totalAdmins,
   completedUsers,
   averageProgress,
   activeUsers: totalUsers - completedUsers,
   activeToday,
   activeThisWeek,
   completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0,
   recentActivity: recentLogs.sort((a, b) => 
     new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
   ).slice(0, 10)
 });
}

async function getUserAvatar(context: { env: Env; request: Request }) {
 const { env, request } = context;
 const url = new URL(request.url);
 
 // Validate admin access
 const userId = await validateSession(env, request);
 if (!userId) {
   return errorResponse('Unauthorized', 401);
 }
 
 const currentUser = await getUserById(env, userId);
 if (!currentUser || currentUser.role !== 'admin') {
   return errorResponse('Admin access required', 403);
 }
 
 // Get target user ID
 const targetUserId = url.pathname.split('/').pop();
 if (!targetUserId) {
   return errorResponse('User ID required', 400);
 }
 
 // Get avatar
 const avatar = await env.AVATARS.get(targetUserId, { type: 'arrayBuffer' });
 if (!avatar) {
   return new Response(null, { status: 404 });
 }
 
 return new Response(avatar, {
   headers: {
     'Content-Type': 'image/jpeg',
     'Cache-Control': 'public, max-age=3600'
   }
 });
}

async function grantAdminAccess(context: { env: Env; request: Request }) {
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
 
 // Get target user
 const targetUserData = await env.USERS.get(`user:${email}`);
 if (!targetUserData) {
   return errorResponse('User not found', 404);
 }
 
 const targetUser = JSON.parse(targetUserData) as User;
 
 if (targetUser.role === 'admin') {
   return errorResponse('User is already an admin', 400);
 }
 
 // Grant admin access
 targetUser.role = 'admin';
 await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
 
 // Log action
 await env.USERS.put(
   `log:admin:${new Date().toISOString()}:${targetUser.id}`,
   JSON.stringify({
     action: 'admin_granted',
     by: currentUser.email,
     target: targetUser.email
   }),
   { expirationTtl: 86400 * 90 }
 );
 
 return jsonResponse({
   message: 'Admin access granted successfully',
   user: {
     id: targetUser.id,
     name: targetUser.name,
     email: targetUser.email
   }
 });
}

async function revokeAdminAccess(context: { env: Env; request: Request }) {
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
 
 // Prevent self-demotion
 if (email === currentUser.email) {
   return errorResponse('Cannot revoke your own admin access', 400);
 }
 
 // Get target user
 const targetUserData = await env.USERS.get(`user:${email}`);
 if (!targetUserData) {
   return errorResponse('User not found', 404);
 }
 
 const targetUser = JSON.parse(targetUserData) as User;
 
 if (targetUser.role !== 'admin') {
   return errorResponse('User is not an admin', 400);
 }
 
 // Revoke admin access
 targetUser.role = 'user';
 await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
 
 // Log action
 await env.USERS.put(
   `log:admin:${new Date().toISOString()}:${targetUser.id}`,
   JSON.stringify({
     action: 'admin_revoked',
     by: currentUser.email,
     target: targetUser.email
   }),
   { expirationTtl: 86400 * 90 }
 );
 
 return jsonResponse({
   message: 'Admin access revoked successfully',
   user: {
     id: targetUser.id,
     name: targetUser.name,
     email: targetUser.email
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
 await env.AVATARS.delete(targetUser.id);
 
 // Delete user sessions
 const sessions = await env.USERS.list({ prefix: `session:` });
 for (const { name: sessionKey } of sessions.keys) {
   const sessionData = await env.USERS.get(sessionKey);
   if (sessionData) {
     try {
       const session = JSON.parse(sessionData);
       if (session.userId === targetUser.id) {
         await env.USERS.delete(sessionKey);
       }
     } catch (e) {
       console.error('Session cleanup error:', e);
     }
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
   user: {
     email: targetUser.email
   }
 });
}