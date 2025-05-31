// functions/api/avatar.ts

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

export async function handleAvatar(request: Request, env: Env): Promise<Response> {
  const user = await authenticate(request, env);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (request.method === 'GET') {
    const avatar = await env.AVATARS.get(`avatar:${user.id}`, { type: 'arrayBuffer' });
    if (!avatar) {
      const url = new URL(request.url);
      return env.ASSETS.fetch(new Request(new URL('/assets/default-avatar.png', url)));
    }

    return new Response(avatar, {
      headers: { 'Content-Type': 'image/jpeg' },
    });
  }

  if (request.method === 'POST') {
    if (!(await validateCsrf(request, env))) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    if (!file || !file.type.startsWith('image/')) {
      return new Response(JSON.stringify({ error: 'Invalid image file' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File size exceeds 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const buffer = await file.arrayBuffer();
    await env.AVATARS.put(`avatar:${user.id}`, buffer);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}