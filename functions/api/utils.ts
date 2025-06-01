// functions/api/utils.ts

import { Env } from '@cloudflare/workers-types';

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
  expiresAt?: string; // For compatibility with old utils
}

// Generate a random token
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Hash password using SHA-256 (note: use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Get cookie from request headers
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
}

// Set cookie with secure attributes
export function setCookie(name: string, value: string, days: number = 1): string {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  return `${name}=${value}; Path=/; Expires=${expires}; SameSite=Strict; HttpOnly`;
}

// Return JSON response with standard headers
export function jsonResponse(data: any, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...headers,
    },
  });
}

// Get user by ID from KV
export async function getUserById(env: Env, userId: string): Promise<User | null> {
  const userData = await env.USERS.get(`user:${userId}`, { type: 'json' });
  return userData ? (userData as User) : null;
}

// Validate CSRF token
export async function validateCSRFToken(env: Env, token: string, sessionId: string): Promise<boolean> {
  if (!sessionId || !token) return false;
  const storedToken = await env.USERS.get(`csrf:${sessionId}`);
  return storedToken === token;
}

// Rate limiting using KV
export async function checkRateLimit(
  env: Env,
  key: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<boolean> {
  const fullKey = `ratelimit:${key}`;
  const windowMs = windowSeconds * 1000;
  const record = (await env.USERS.get(fullKey, { type: 'json' })) || {
    count: 0,
    reset: Date.now() + windowMs,
  };

  if (record.reset < Date.now()) {
    record.count = 0;
    record.reset = Date.now() + windowMs;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  await env.USERS.put(fullKey, JSON.stringify(record), { expirationTtl: Math.ceil(windowMs / 1000) });
  return true;
}

// Log activity to KV
export async function logActivity(
  env: Env,
  userId: string,
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const log = {
    userId,
    action,
    timestamp: new Date().toISOString(),
    metadata,
  };
  await env.USERS.put(`log:${generateToken()}`, JSON.stringify(log), { expirationTtl: 30 * 24 * 60 * 60 }); // 30 days
}

// Authenticate user via session
export async function authenticate(request: Request, env: Env): Promise<User | null> {
  const sessionId = getCookie(request, 'session');
  if (!sessionId) return null;

  const session: Session = await env.USERS.get(`session:${sessionId}`, { type: 'json' });
  if (!session) return null;

  const expires = session.expires || new Date(session.expiresAt).getTime();
  if (expires < Date.now()) {
    await env.USERS.delete(`session:${sessionId}`);
    return null;
  }

  return getUserById(env, session.userId);
}

// Require admin access
export function requireAdmin(user: User | null): Response | null {
  if (!user || user.role !== 'admin') {
    return jsonResponse({ error: 'Admin access required' }, 403);
  }
  return null;
}