// functions/api/utils.ts
// Core utility functions and interfaces for the API

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
  AVATARS: KVNamespace;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  passwordChangedAt?: string;
}

export interface Session {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Progress {
  [week: string]: {
    [task: string]: boolean;
  };
}

// Generate secure random string
export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get cookie value
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  
  if (!cookie) return null;
  return decodeURIComponent(cookie.split('=')[1]);
}

// Create cookie string
export function createCookie(
  name: string, 
  value: string, 
  maxAge: number = 86400
): string {
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

// JSON response helper
export function jsonResponse(
  data: any, 
  status: number = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...headers
    }
  });
}

// Error response helper
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

// Validate session and get user ID
export async function validateSession(env: Env, request: Request): Promise<string | null> {
  const sessionToken = getCookie(request, 'session');
  if (!sessionToken) return null;
  
  const sessionData = await env.USERS.get(`session:${sessionToken}`);
  if (!sessionData) return null;
  
  try {
    const session: Session = JSON.parse(sessionData);
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    
    if (now < expiresAt) {
      return session.userId;
    } else {
      await env.USERS.delete(`session:${sessionToken}`);
      return null;
    }
  } catch (e) {
    console.error('Session validation error:', e);
    return null;
  }
}

// 🔹 Add this function (required for dashboard.ts)
export async function getSession(env: Env, sessionToken: string): Promise<Session | null> {
  if (!sessionToken) return null;

  const sessionData = await env.USERS.get(`session:${sessionToken}`);
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as Session;
  } catch {
    return null;
  }
}

// Get user by ID
export async function getUserById(env: Env, userId: string): Promise<User | null> {
  const userData = await env.USERS.list({ prefix: `user:` });
  
  for (const { name } of userData.keys) {
    const userJson = await env.USERS.get(name);
    if (!userJson) continue;
    
    try {
      const user = JSON.parse(userJson) as User;
      if (user.id === userId) {
        return user;
      }
    } catch (e) {
      console.error('User parse error:', e);
    }
  }
  
  return null;
}

// Create session
export async function createSession(
  env: Env, 
  userId: string, 
  ttl: number = 86400
): Promise<string> {
  const sessionToken = generateSecureToken();
  const session: Session = {
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
  };
  
  await env.USERS.put(
    `session:${sessionToken}`, 
    JSON.stringify(session), 
    { expirationTtl: ttl }
  );
  
  return sessionToken;
}

// Rate limiting
export async function checkRateLimit(
  env: Env, 
  identifier: string, 
  limit: number = 10, 
  window: number = 60
): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const current = await env.USERS.get(key);
  
  if (!current) {
    await env.USERS.put(key, '1', { expirationTtl: window });
    return true;
  }
  
  const count = parseInt(current);
  if (count >= limit) {
    return false;
  }
  
  await env.USERS.put(key, (count + 1).toString(), { expirationTtl: window });
  return true;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isValidPassword(password: string): boolean {
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}
