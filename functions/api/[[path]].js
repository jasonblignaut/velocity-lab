// functions/api/[[path]].js - Velocity Lab Training Platform API

import { handleCsrf } from './csrf.js';
import { handleLogin } from './login.js';
import { handleRegister } from './register.js';
import { handleLogout } from './logout.js';
import { handleProgress } from './progress.js';
import { handleAvatar } from './avatar.js';
import { handleProfile } from './profile.js';
import { handleAdmin } from './admin.js';
import {
  jsonResponse,
  checkRateLimit,
  authenticate,
  requireAdmin,
  logActivity,
} from './utils.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // Rate limiting check
    if (!(await checkRateLimit(env, ip))) {
      return jsonResponse({ error: 'Too many requests' }, 429);
    }

    // Serve static assets for non-API routes
    if (!path.startsWith('/api/')) {
      return env.ASSETS.fetch(request);
    }

    // CSRF token generation
    if (path === '/api/csrf' && request.method === 'GET') {
      return handleCsrf(request, env);
    }

    // User registration
    if (path === '/api/register' && request.method === 'POST') {
      return handleRegister(request, env);
    }

    // User login
    if (path === '/api/login' && request.method === 'POST') {
      return handleLogin(request, env);
    }

    // User logout
    if (path === '/api/logout' && request.method === 'POST') {
      return handleLogout(request, env);
    }

    // User progress (GET/POST)
    if (path === '/api/progress') {
      return handleProgress(request, env);
    }

    // User avatar (GET/POST)
    if (path === '/api/avatar') {
      return handleAvatar(request, env);
    }

    // Change password or export data
    if (path === '/api/change-password' || path === '/api/user/export') {
      return handleProfile(request, env);
    }

    // Admin endpoints
    if (path === '/api/admin/users-progress' || path === '/api/admin/grant-admin') {
      return handleAdmin(request, env);
    }

    // Admin stats
    if (path === '/api/admin/stats' && request.method === 'GET') {
      const user = await authenticate(request, env);
      const adminCheck = requireAdmin(user);
      if (adminCheck) return adminCheck;

      try {
        const users = await env.USERS.list({ prefix: 'user:' });
        let totalUsers = 0;
        let totalAdmins = 0;
        let totalProgress = 0;
        let completedUsers = 0;
        let activeToday = 0;
        let activeThisWeek = 0;

        const now = Date.now();
        const todayStart = new Date(now).setHours(0, 0, 0, 0);
        const weekStart = now - 7 * 24 * 60 * 60 * 1000;

        for (const { name: userKey } of users.keys) {
          if (!userKey.startsWith('user:email:') && !userKey.startsWith('user:session:')) {
            const user = await env.USERS.get(userKey, { type: 'json' });
            totalUsers++;
            if (user.role === 'admin') totalAdmins++;

            const lastActivity = new Date(user.lastLogin || user.createdAt).getTime();
            if (lastActivity >= todayStart) activeToday++;
            if (lastActivity >= weekStart) activeThisWeek++;

            const progressData = (await env.PROGRESS.get(`progress:${user.id}`, { type: 'json' })) || {};
            let completedTasks = 0;
            Object.values(progressData).forEach(week => {
              completedTasks += Object.values(week).filter(Boolean).length;
            });
            const progress = Math.round((completedTasks / 14) * 100);
            totalProgress += progress;
            if (progress === 100) completedUsers++;
          }
        }

        const averageProgress = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;

        const recentLogs = [];
        const logs = await env.USERS.list({ prefix: 'log:', limit: 10 });
        for (const { name: logKey } of logs.keys) {
          const logData = await env.USERS.get(logKey, { type: 'json' });
          if (logData) recentLogs.push(logData);
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
          recentActivity: recentLogs,
        });
      } catch (error) {
        console.error('Admin stats error:', error);
        return jsonResponse({ error: 'Internal server error' }, 500);
      }
    }

    // User profile
    if (path === '/api/user/profile' && request.method === 'GET') {
      const user = await authenticate(request, env);
      if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

      try {
        const progressData = (await env.PROGRESS.get(`progress:${user.id}`, { type: 'json' })) || {};
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

        const allUsers = await env.USERS.list({ prefix: 'user:' });
        const userProgress = [];
        for (const { name: userKey } of allUsers.keys) {
          if (!userKey.startsWith('user:email:') && !userKey.startsWith('user:session:')) {
            const u = await env.USERS.get(userKey, { type: 'json' });
            const uProgress = (await env.PROGRESS.get(`progress:${u.id}`, { type: 'json' })) || {};
            let uCompleted = 0;
            Object.values(uProgress).forEach(week => {
              uCompleted += Object.values(week).filter(Boolean).length;
            });
            userProgress.push({ id: u.id, progress: Math.round((uCompleted / 14) * 100) });
          }
        }
        userProgress.sort((a, b) => b.progress - a.progress);
        const rank = userProgress.findIndex(u => u.id === user.id) + 1;

        await logActivity(env, user.id, 'profile_view');
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
          passwordChangedAt: user.passwordChangedAt,
        });
      } catch (error) {
        console.error('User profile error:', error);
        return jsonResponse({ error: 'Internal server error' }, 500);
      }
    }

    // Admin progress export
    if (path === '/api/export/progress' && request.method === 'GET') {
      const user = await authenticate(request, env);
      const adminCheck = requireAdmin(user);
      if (adminCheck) return adminCheck;

      try {
        const users = await env.USERS.list({ prefix: 'user:' });
        const csvData = ['Name,Email,Role,Progress,Completed Tasks,Week 1,Week 2,Week 3,Week 4,Last Activity'];

        for (const { name: userKey } of users.keys) {
          if (!userKey.startsWith('user:email:') && !userKey.startsWith('user:session:')) {
            const user = await env.USERS.get(userKey, { type: 'json' });
            const progressData = (await env.PROGRESS.get(`progress:${user.id}`, { type: 'json' })) || {};
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
        }

        await logActivity(env, user.id, 'progress_export');
        return new Response(csvData.join('\n'), {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="velocity-lab-progress-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      } catch (error) {
        console.error('Export error:', error);
        return jsonResponse({ error: 'Internal server error' }, 500);
      }
    }

    // Handle user avatar for admin
    if (path.startsWith('/api/user-avatar/') && request.method === 'GET') {
      const user = await authenticate(request, env);
      const adminCheck = requireAdmin(user);
      if (adminCheck) return adminCheck;

      try {
        const targetUserId = path.split('/').pop();
        const avatar = await env.AVATARS.get(targetUserId, { type: 'arrayBuffer' });
        if (!avatar) {
          return new Response(null, { status: 404 });
        }

        return new Response(avatar, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
          },
        });
      } catch (error) {
        console.error('User avatar fetch error:', error);
        return jsonResponse({ error: 'Internal server error' }, 500);
      }
    }

    // 404 for unknown API routes
    return jsonResponse({ error: 'API endpoint not found' }, 404);
  },
};