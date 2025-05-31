// api/utils.ts

// Utility functions for CSRF, sessions, and environment interfaces

// Generate a random string using Web Crypto API
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

// Generate a CSRF token and store it in KV
export async function generateCSRFToken(env: Env): Promise<string> {
  const token = generateRandomString(32);
  await env.USERS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
}

// Validate a CSRF token by checking KV and delete on success
export async function validateCSRFToken(env: Env, token: string): Promise<boolean> {
  const value = await env.USERS.get(`csrf:${token}`);
  if (value === 'valid') {
    await env.USERS.delete(`csrf:${token}`);
    return true;
  }
  return false;
}

// Get a cookie from the request headers
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  if (!cookie) return null;
  return cookie.split('=')[1];
}

// Environment interface for Cloudflare Pages Functions
export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
}