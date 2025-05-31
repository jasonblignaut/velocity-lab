// functions/api/admin.ts

import { Env } from '@cloudflare/workers-types';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: number;
}

interface Session {
  userId: string;
  expires: number;
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[0] : null;
}

async function validateCsrf(request: Request, env: Env): Promise<boolean> {
  const formData = await request.formData();
  const token = formData.get('csrf_token');
  const sessionId = getCookie(request);
  if (!sessionId || !token) return false;

  const storedToken = await env.USERS.get(`csrf:${sessionId}`);
  return storedToken === token;
}

async function authenticate(request: Request, env: Env): Promise<User | null> {
  const sessionId = getCookie(request, 'session');
  if (!sessionId) return null;

  const session: Session = await env.USERS.get(`session:${sessionId}`, { type: 'json' });
  if (!session || session.expires < Date.now()) {
    return null;
  }

  const user: User = await env.USERS.get(`user:${session.userId}`, { type: 'json' });
  return user ? { ...user, sessionId } : null;
}

function requireAdmin(user: User | null): Response | null {
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export async function handleAdmin(request: Request, env: Env): Promise<Response> {
  const user = await authenticate(request, env);
  const adminCheck = requireAdmin(user);
  if (adminCheck) return adminCheck;

  const url = new URL(request.url);

  if (request.method === 'GET' && url.pathname === '/api/admin/users-progress') {
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

    return new Response(JSON.stringify(users), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/grant-admin') {
    if (!(await validateCsrf(request, env))) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const email = formData.get('email')?.toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUserId = await env.USERS.get(`user:email:${email}`);
    if (!targetUserId) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const targetUser: User = await env.USERS.get(`user:${targetUserId}`, { type: 'json' });
    targetUser.role = 'admin';
    await env.USERS.put(`user:${targetUserId}`, JSON.stringify(targetUser));

    return new Response(JSON.stringify({ user: { name: targetUser.name } }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed', {
    status: 405,
      headers: 'Content-Type': 'application/json' },
  });
}