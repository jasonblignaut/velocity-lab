// functions/api/csrf.ts

import { Env } from '@cloudflare/workers-types';

interface Session {
  temp?: boolean;
  userId?: string;
  expires?: number;
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

export async function handleCsrf(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let sessionId = getCookie(request, 'session');
  if (!sessionId) {
    sessionId = generateToken();
    await env.USERS.put(`session:${sessionId}`, JSON.stringify({ temp: true } as Session), {
      expirationTtl: 3600,
    });
  }

  const token = generateToken();
  await env.USERS.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 });

  return new Response(JSON.stringify({ token }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': setCookie('session', sessionId),
    },
  });
}