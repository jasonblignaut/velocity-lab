// functions/api/register.ts

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

function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
}

function setCookie(name: string, value: string, days: number = 1): string {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  return `${name}=${value}; Path=/; Expires=${expires}; SameSite=Strict; HttpOnly`;
}

async function validateCsrf(request: Request, env: Env): Promise<boolean> {
  const formData = await request.formData();
  const token = formData.get('csrf_token');
  const sessionId = getCookie(request, 'session');
  if (!sessionId || !token) return false;

  const storedToken = await env.USERS.get(`csrf:${sessionId}`);
  return storedToken === token;
}

export async function handleRegister(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!(await validateCsrf(request, env))) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formData = await request.formData();
  const email = formData.get('email')?.toLowerCase();
  const password = formData.get('password');
  const repeatPassword = formData.get('repeatPassword');
  const name = formData.get('name');

  if (!email || !password || !name || password !== repeatPassword) {
    return new Response(JSON.stringify({ error: 'Invalid input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userId = generateToken();
  const existingUser = await env.USERS.get(`user:email:${email}`);
  if (existingUser) {
    return new Response(JSON.stringify({ error: 'Email already registered' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const hashedPassword = await hashPassword(password);
  const user: User = {
    id: userId,
    email,
    name,
    password: hashedPassword,
    role: 'user',
    createdAt: Date.now(),
  };

  await env.USERS.put(`user:${userId}`, JSON.stringify(user));
  await env.USERS.put(`user:email:${email}`, userId);

  // Initialize progress
  await env.PROGRESS.put(`progress:${userId}`, JSON.stringify({}));

  const sessionId = generateToken();
  await env.USERS.put(
    `session:${sessionId}`,
    JSON.stringify({
      userId,
      expires: Date.now() + 24 * 60 * 60 * 1000,
    } as Session),
    { expirationTtl: 24 * 60 * 60 },
  );

  return new Response(JSON.stringify({ id: userId, name, email, role: 'user' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie('session', sessionId),
    },
  });
}