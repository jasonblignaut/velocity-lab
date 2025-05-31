// Utility functions for CSRF, sessions, and environment interfaces

// Generate a random string using Web Crypto API
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

export async function generateCSRFToken(env: Env): Promise<string> {
  const token = generateRandomString(32);
  await env.USERS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
}

export async function validateCSRFToken(env: Env, token: string): Promise<boolean> {
  const value = await env.USERS.get(`csrf:${token}`);
  if (value === 'valid') {
    await env.USERS.delete(`csrf:${token}`);
    return true;
  }
  return false;
}

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
  AVATARS: KVNamespace;
}

export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
}

// Validate session and get user data
export async function getUserFromSession(env: Env, request: Request): Promise<any | null> {
  const sessionToken = getCookie(request, 'session');
  if (!sessionToken) return null;

  const userId = await env.USERS.get(`session:${sessionToken}`);
  if (!userId) return null;

  const userData = await env.USERS.get(`user:${userId}`);
  if (!userData) {
    // Clean up invalid session
    await env.USERS.delete(`session:${sessionToken}`);
    return null;
  }

  return JSON.parse(userData);
}