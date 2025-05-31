// functions/api/[[path]].js
import { getCookie } from './utils';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Helper to return JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });

  // Validate session and get userId
  const getUserId = async () => {
    const sessionToken = getCookie(request, 'session');
    if (!sessionToken) return null;
    
    const sessionData = await env.USERS.get(`session:${sessionToken}`);
    if (!sessionData) return null;
    
    try {
      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      
      if (now < expiresAt) {
        return session.userId;
      } else {
        await env.USERS.delete(`session:${sessionToken}`);
        return null;
      }
    } catch (e) {
      console.error('Session validation error:', e);
      return null;
    }
  };

  // Get user object by ID
  const getUserById = async (userId) => {
    const userData = await env.USERS.list({ prefix: `user:` });
    for (const { name } of userData.keys) {
      const user = JSON.parse(await env.USERS.get(name));
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  };

  // Rate limiting helper
  const checkRateLimit = async (identifier, limit = 10, window = 60) => {
    const key = `ratelimit:${identifier}`;
    const current = await env.USERS.get(key);
    
    if (!current) {
      await env.USERS.put(key, '1', { expirationTtl: window });
      return true;
    }
    
    const count = parseInt(current);
    if (count >= limit) {
      return false;
    }
    
    await env.USERS.put(key, (count + 1).toString(), { expirationTtl: window });
    return true;
  };

  // GET /api/avatar
  if (path === '/api/avatar' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const avatar = await env.AVATARS.get(userId, { type: 'arrayBuffer' });
      if (!avatar) {
        // Return default avatar
        return new Response(null, { status: 404 });
      }

      return new Response(avatar, {
        headers: { 
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        },
        status: 200,
      });
    } catch (error) {
      console.error('Avatar fetch error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // POST /api/avatar
  if (path === '/api/avatar' && request.method === 'POST') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      // Rate limit avatar uploads
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      if (!await checkRateLimit(`avatar:${clientIP}`, 5, 3600)) {
        return jsonResponse({ error: 'Too many uploads. Please try again later.' }, 429);
      }

      const formData = await request.formData();
      const avatar = formData.get('avatar');
      
      if (!avatar || !(avatar instanceof File)) {
        return jsonResponse({ error: 'No file uploaded' }, 400);
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(avatar.type)) {
        return jsonResponse({ error: 'Invalid file type. Please upload an image.' }, 400);
      }

      // Check file size (5MB limit)
      if (avatar.size > 5 * 1024 * 1024) {
        return jsonResponse({ error: 'File too large. Maximum size is 5MB.' }, 400);
      }

      const arrayBuffer = await avatar.arrayBuffer();
      await env.AVATARS.put(userId, arrayBuffer);
      
      // Log activity
      await env.USERS.put(
        `log:avatar:${new Date().toISOString()}:${userId}`,
        JSON.stringify({ action: 'avatar_upload', size: avatar.size }),
        { expirationTtl: 86400 * 30 }
      );
      
      return jsonResponse({ message: 'Avatar uploaded successfully' }, 200);
    } catch (error) {
      console.error('Avatar upload error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // POST /api/change-password
  if (path === '/api/change-password' && request.method === 'POST') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const formData = await request.formData();
      const currentPassword = formData.get('currentPassword')?.toString();
      const newPassword = formData.get('newPassword')?.toString();
      const csrfToken = formData.get('csrf_token')?.toString();

      if (!currentPassword || !newPassword || !csrfToken) {
        return jsonResponse({ error: 'Missing required fields' }, 400);
      }

      // Validate CSRF token
      const csrfData = await env.USERS.get(`csrf:${csrfToken}`);
      if (!csrfData) {
        return jsonResponse({ error: 'Invalid CSRF token' }, 403);
      }
      await env.USERS.delete(`csrf:${csrfToken}`);

      // Validate password strength
      if (newPassword.length < 8) {
        return jsonResponse({ error: 'New password must be at least 8 characters' }, 400);
      }

      if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
        return jsonResponse({ error: 'Password must contain uppercase, lowercase, and numbers' }, 400);
      }

      const user = await getUserById(userId);
      if (!user) return jsonResponse({ error: 'User not found' }, 404);

      if (user.password !== currentPassword) {
        return jsonResponse({ error: 'Current password is incorrect' }, 400);
      }

      user.password = newPassword;
      user.passwordChangedAt = new Date().toISOString();
      await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
      
      // Log password change
      await env.USERS.put(
        `log:password:${new Date().toISOString()}:${userId}`,
        JSON.stringify({ action: 'password_change' }),
        { expirationTtl: 86400 * 30 }
      );
      
      return jsonResponse({ message: 'Password updated successfully' }, 200);
    } catch (error) {
      console.error('Password change error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/admin/users-progress
  if (path === '/api/admin/users-progress' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const currentUser = await getUserById(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized - Admin access required' }, 403);
      }

      const usersProgress = [];
      const users = await env.USERS.list({ prefix: `user:` });

      for (const { name: userKey } of users.keys) {
        const user = JSON.parse(await env.USERS.get(userKey));
        const progressData = JSON.parse((await env.PROGRESS.get(`progress:${user.id}`)) || '{}');
        
        const totalTasks = 14;
        let completedTasks = 0;
        const weekProgress = {};

        // Calculate progress by week
        const weeks = ['week1', 'week2', 'week3', 'week4'];
        weeks.forEach(week => {
          const weekTasks = progressData[week] || {};
          const completed = Object.values(weekTasks).filter(Boolean).length;
          weekProgress[week] = completed;
          completedTasks += completed;
        });

        const progress = Math.round((completedTasks / totalTasks) * 100);
        
        // Check if user has avatar
        const hasAvatar = await env.AVATARS.get(user.id, { type: 'stream' });
        const avatarUrl = hasAvatar ? `/api/user-avatar/${user.id}` : null;

        usersProgress.push({
          id: user.id,
          name: user.name,
          email: user.email,
          progress,
          avatar: avatarUrl,
          role: user.role,
          completedTasks,
          totalTasks,
          weekProgress,
          lastActivity: user.lastLogin || user.createdAt
        });
      }

      // Sort by progress (descending)
      usersProgress.sort((a, b) => b.progress - a.progress);

      return jsonResponse(usersProgress, 200);
    } catch (error) {
      console.error('Fetch users progress error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/user-avatar/:userId
  if (path.startsWith('/api/user-avatar/') && request.method === 'GET') {
    try {
      const requestingUserId = await getUserId();
      if (!requestingUserId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const requestingUser = await getUserById(requestingUserId);
      if (!requestingUser || requestingUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized' }, 403);
      }

      const targetUserId = path.split('/').pop();
      const avatar = await env.AVATARS.get(targetUserId, { type: 'arrayBuffer' });
      
      if (!avatar) {
        return new Response(null, { status: 404 });
      }

      return new Response(avatar, {
        headers: { 
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        },
        status: 200,
      });
    } catch (error) {
      console.error('User avatar fetch error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // POST /api/admin/grant-admin
  if (path === '/api/admin/grant-admin' && request.method === 'POST') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const currentUser = await getUserById(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized - Admin access required' }, 403);
      }

      const formData = await request.formData();
      const email = formData.get('email')?.toString().toLowerCase();

      if (!email) {
        return jsonResponse({ error: 'Email is required' }, 400);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return jsonResponse({ error: 'Invalid email format' }, 400);
      }

      const targetUserData = await env.USERS.get(`user:${email}`);
      if (!targetUserData) {
        return jsonResponse({ error: 'User not found' }, 404);
      }

      const targetUser = JSON.parse(targetUserData);
      
      if (targetUser.role === 'admin') {
        return jsonResponse({ error: 'User is already an admin' }, 400);
      }

      targetUser.role = 'admin';
      targetUser.roleChangedAt = new Date().toISOString();
      targetUser.roleChangedBy = currentUser.email;
      
      await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));

      // Log admin grant
      await env.USERS.put(
        `log:admin:${new Date().toISOString()}:${targetUser.id}`,
        JSON.stringify({ 
          action: 'admin_granted',
          by: currentUser.email,
          target: targetUser.email
        }),
        { expirationTtl: 86400 * 90 } // Keep for 90 days
      );

      return jsonResponse({ 
        message: 'Admin access granted successfully',
        user: {
          name: targetUser.name,
          email: targetUser.email
        }
      }, 200);
    } catch (error) {
      console.error('Grant admin error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/admin/stats
  if (path === '/api/admin/stats' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const currentUser = await getUserById(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized - Admin access required' }, 403);
      }

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
        const user = JSON.parse(await env.USERS.get(userKey));
        totalUsers++;
        
        if (user.role === 'admin') totalAdmins++;

        // Check last activity
        const lastActivity = new Date(user.lastLogin || user.createdAt || 0);
        if (lastActivity >= todayStart) activeToday++;
        if (lastActivity >= weekStart) activeThisWeek++;

        const progressData = JSON.parse((await env.PROGRESS.get(`progress:${user.id}`)) || '{}');
        let completedTasks = 0;
        
        Object.values(progressData).forEach((week) => {
          completedTasks += Object.values(week).filter(Boolean).length;
        });

        const progress = Math.round((completedTasks / 14) * 100);
        totalProgress += progress;
        
        if (progress === 100) completedUsers++;
      }

      const averageProgress = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;

      // Get recent activity logs
      const recentLogs = [];
      const logs = await env.USERS.list({ prefix: `log:`, limit: 10 });
      
      for (const { name: logKey } of logs.keys) {
        const logData = await env.USERS.get(logKey);
        if (logData) {
          try {
            const log = JSON.parse(logData);
            recentLogs.push(log);
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
        recentActivity: recentLogs
      }, 200);
    } catch (error) {
      console.error('Admin stats error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/user/profile
  if (path === '/api/user/profile' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const user = await getUserById(userId);
      if (!user) return jsonResponse({ error: 'User not found' }, 404);

      const progressData = JSON.parse((await env.PROGRESS.get(`progress:${userId}`)) || '{}');
      let completedTasks = 0;
      const tasksByWeek = {};
      
      const weeks = ['week1', 'week2', 'week3', 'week4'];
      weeks.forEach(week => {
        const weekTasks = progressData[week] || {};
        const completed = Object.values(weekTasks).filter(Boolean).length;
        tasksByWeek[week] = completed;
        completedTasks += completed;
      });

      const progress = Math.round((completedTasks / 14) * 100);

      // Get user's rank
      const allUsers = await env.USERS.list({ prefix: `user:` });
      const userProgress = [];
      
      for (const { name: userKey } of allUsers.keys) {
        const userData = JSON.parse(await env.USERS.get(userKey));
        const userProgressData = JSON.parse((await env.PROGRESS.get(`progress:${userData.id}`)) || '{}');
        let userCompleted = 0;
        
        Object.values(userProgressData).forEach((week) => {
          userCompleted += Object.values(week).filter(Boolean).length;
        });
        
        userProgress.push({
          id: userData.id,
          progress: Math.round((userCompleted / 14) * 100)
        });
      }
      
      userProgress.sort((a, b) => b.progress - a.progress);
      const rank = userProgress.findIndex(u => u.id === userId) + 1;

      return jsonResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        progress,
        completedTasks,
        totalTasks: 14,
        tasksByWeek,
        rank,
        totalUsers: userProgress.length,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        passwordChangedAt: user.passwordChangedAt
      }, 200);
    } catch (error) {
      console.error('User profile error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/export/progress (Admin only)
  if (path === '/api/export/progress' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const currentUser = await getUserById(userId);
      if (!currentUser || currentUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized - Admin access required' }, 403);
      }

      const users = await env.USERS.list({ prefix: `user:` });
      const csvData = ['Name,Email,Role,Progress,Completed Tasks,Week 1,Week 2,Week 3,Week 4,Last Activity'];

      for (const { name: userKey } of users.keys) {
        const user = JSON.parse(await env.USERS.get(userKey));
        const progressData = JSON.parse((await env.PROGRESS.get(`progress:${user.id}`)) || '{}');
        
        let completedTasks = 0;
        const weekProgress = [];
        
        ['week1', 'week2', 'week3', 'week4'].forEach(week => {
          const weekTasks = progressData[week] || {};
          const completed = Object.values(weekTasks).filter(Boolean).length;
          weekProgress.push(completed);
          completedTasks += completed;
        });

        const progress = Math.round((completedTasks / 14) * 100);
        const lastActivity = user.lastLogin || user.createdAt || 'Never';

        csvData.push(
          `"${user.name}","${user.email}","${user.role}",${progress}%,${completedTasks}/14,${weekProgress.join(',')},${lastActivity}`
        );
      }

      return new Response(csvData.join('\n'), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="velocity-lab-progress-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // Handle 404 for unmatched API routes
  if (path.startsWith('/api/')) {
    return jsonResponse({ error: 'API endpoint not found' }, 404);
  }

  // Pass through for non-API routes
  return env.ASSETS.fetch(request);
}</parameter>
</invoke>