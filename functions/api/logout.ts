// functions/api/logout.ts

import { Env } from '@cloudflare/workers-types';

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

export async function handleLogout(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = getCookie(request, 'session');
  if (sessionId) {
    await env.USERS.delete(`session:${sessionId}`);
    await env.USERS.delete(`csrf:${sessionId}`);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${setCookie('session', '', -1)}; ${setCookie('user', '', -1)}`,
    },
  });
}