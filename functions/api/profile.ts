// functions/api/profile.ts

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

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
}

async function validateCsrf(request: Request, env: Env): Promise<boolean> {
  const formData = await request.formData();
  const token = formData.get('csrf_token');
  const sessionId = getCookie(request, 'session');
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

export async function handleProfile(request: Request, env: Env): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'POST' && new URL(request.url).pathname === '/api/change-password') {
    if (!(await validateCsrf(request, env))) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!newPassword || newPassword !== confirmPassword || newPassword.length < 8) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    const updatedUser: User = { ...user, password: hashedPassword };
    await env.USERS.put(`user:${user.id}`, JSON.stringify(updatedUser));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'GET' && new URL(request.url).pathname === '/api/user/export') {
    const progress = (await env.PROGRESS.get(`progress:${user.id}`, { type: 'json' })) || {};
    const rows = [['Week', 'Task', 'Completed']];
    for (const [week, tasks] of Object.entries(progress)) {
      for (const [task, completed] of Object.entries(tasks)) {
        rows.push([week, task, completed ? 'Yes' : 'No']);
      }
    }

    const csv = rows.map(row => row.join(',')).join('\n');
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="progress-${user.id}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}