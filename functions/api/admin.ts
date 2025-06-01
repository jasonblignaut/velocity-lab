// functions/api/admin.ts

import { Env } from '@cloudflare/workers-types';
import { authenticate, requireAdmin, jsonResponse, validateCSRFToken, getCookie, logActivity } from './utils';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  passwordChangedAt?: string;
  roleChangedAt?: string;
  roleChangedBy?: string;
}

interface Session {
  userId: string;
  expires: number;
  expiresAt?: string;
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const user = await authenticate(request, env);
  const adminCheck = requireAdmin(user);
  if (adminCheck) return adminCheck;

  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/api/admin/users-progress') {
    try {
      const users: Array<{ id: string; name: string; progress: number; avatar: string }> = [];
      const userKeys = await env.USERS.list({ prefix: 'user:' });
      for (const key of userKeys.keys) {
        if (!key.name.startsWith('user:email:') && !key.name.startsWith('user:session:')) {
          const u: User = await env.USERS.get(key.name, { type: 'json' });
          const progressData = (await env.PROGRESS.get(`progress:${u.id}`, { type: 'json' })) || {};
          let completedTasks = 0;
          Object.values(progressData).forEach((week: any) => {
            completedTasks += Object.values(week).filter(Boolean).length;
          });
          const progress = Math.round((completedTasks / 14) * 100); // 14 total tasks
          const avatarUrl = `/api/avatar?userId=${u.id}`;
          users.push({
            id: u.id,
            name: u.name,
            progress,
            avatar: avatarUrl,
          });
        }
      }

      await logActivity(env, user.id, 'users_progress_view');
      return jsonResponse(users);
    } catch (error) {
      console.error('Users progress error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/grant-admin') {
    const sessionId = getCookie(request, 'session');
    const formData = await request.formData();
    const token = formData.get('csrf_token')?.toString();
    
    if (!token || !sessionId || !(await validateCSRFToken(env, token, sessionId))) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }

    const email = formData.get('email')?.toLowerCase();
    if (!email) {
      return jsonResponse({ error: 'Email required' }, 400);
    }

    try {
      const targetUserId = await env.USERS.get(`user:email:${email}`);
      if (!targetUserId) {
        return jsonResponse({ error: 'User not found' }, 404);
      }

      const targetUser: User = await env.USERS.get(`user:${targetUserId}`, { type: 'json' });
      if (targetUser.role === 'admin') {
        return jsonResponse({ error: 'User is already an admin' }, 400);
      }

      targetUser.role = 'admin';
      targetUser.roleChangedAt = new Date().toISOString();
      targetUser.roleChangedBy = user.email;
      await env.USERS.put(`user:${targetUserId}`, JSON.stringify(targetUser));

      await logActivity(env, targetUser.id, 'admin_granted', {
        by: user.email,
        target: targetUser.email,
      });

      return jsonResponse({ user: { name: targetUser.name } });
    } catch (error) {
      console.error('Grant admin error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405);
}