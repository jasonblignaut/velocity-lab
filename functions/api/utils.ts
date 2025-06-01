// functions/api/utils.ts
import type { Env, User } from './utils';

// Generate a secure random token (e.g., CSRF or session token)
export function generateSecureToken(length = 48): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return [...array].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// JSON response helper
export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message }, status);
}

// Create HTTP cookie header string
export function createCookie(name: string, value: string, options: Record<string, any> = {}) {
  const opts = {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 3600 * 24 * 7, // 7 days default
    ...options,
  };

  let cookie = `${name}=${value}`;

  if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`;
  if (opts.path) cookie += `; Path=${opts.path}`;
  if (opts.httpOnly) cookie += `; HttpOnly`;
  if (opts.secure) cookie += `; Secure`;
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`;

  return cookie;
}

// Rate limit check (simple counter in KV)
export async function checkRateLimit(env: Env, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  let attemptsRaw = await env.USERS.get(key, { type: 'json' }) as { timestamps: number[] } | null;

  if (!attemptsRaw) {
    attemptsRaw = { timestamps: [] };
  }

  // Filter timestamps inside window
  attemptsRaw.timestamps = attemptsRaw.timestamps.filter(ts => ts > windowStart);

  if (attemptsRaw.timestamps.length >= limit) {
    // Rate limit exceeded
    return false;
  }

  // Add current timestamp and store back
  attemptsRaw.timestamps.push(now);
  await env.USERS.put(key, JSON.stringify(attemptsRaw), { expirationTtl: windowSeconds });

  return true;
}

// Create a new session: store session token linked to user ID
export async function createSession(env: Env, userId: string): Promise<string> {
  const sessionToken = generateSecureToken();
  // Store session with TTL 7 days
  await env.USERS.put(`session:${sessionToken}`, userId, { expirationTtl: 60 * 60 * 24 * 7 });
  return sessionToken;
}

// Get session user ID from request cookies
export async function getSession(env: Env, request: Request): Promise<{ userId: string } | null> {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;

  const sessionToken = match[1];
  const userId = await env.USERS.get(`session:${sessionToken}`);
  if (!userId) return null;

  return { userId };
}

// Generate & store CSRF token for session (overwrite old)
export async function generateCsrfToken(env: Env, userId: string): Promise<string> {
  const token = generateSecureToken(24);
  await env.USERS.put(`csrf:${userId}`, token, { expirationTtl: 60 * 60 }); // 1 hour
  return token;
}

// Validate CSRF token for session user ID
export async function validateCSRFToken(env: Env, userId: string, token: string | null): Promise<boolean> {
  if (!token) return false;
  const stored = await env.USERS.get(`csrf:${userId}`);
  return stored === token;
}
