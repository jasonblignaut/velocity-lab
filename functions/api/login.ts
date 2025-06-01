// functions/api/login.ts
// User login endpoint

import { 
  jsonResponse, 
  errorResponse, 
  createSession, 
  createCookie,
  checkRateLimit
} from './utils';
import { validateCSRFToken } from './csrf';
import type { Env, User } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const formData = await request.formData();
    
    // Extract form fields
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();
    
    // Validate required fields
    if (!email || !password || !csrfToken) {
      return errorResponse('Missing required fields', 400);
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `login:${clientIP}`, 5, 300);
    
    if (!canProceed) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }
    
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(env, csrfToken);
    if (!isValidCSRF) {
      return errorResponse('Invalid CSRF token', 403);
    }
    
    // Get user
    const userData = await env.USERS.get(`user:${email}`);
    if (!userData) {
      return errorResponse('Invalid email or password', 401);
    }
    
    const user: User = JSON.parse(userData);
    
    // Verify password
    if (user.password !== password) { // In production, use proper password hashing
      return errorResponse('Invalid email or password', 401);
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    await env.USERS.put(`user:${email}`, JSON.stringify(user));
    
    // Create session
    const sessionToken = await createSession(env, user.id);
    
    // Log login
    await env.USERS.put(
      `log:login:${new Date().toISOString()}:${user.id}`,
      JSON.stringify({ action: 'user_login', ip: clientIP }),
      { expirationTtl: 86400 * 7 }
    );
    
    return jsonResponse(
      { name: user.name, role: user.role },
      200,
      { 'Set-Cookie': createCookie('session', sessionToken) }
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
};