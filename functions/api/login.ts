// functions/api/login.ts
// Enhanced user login endpoint

import { 
  jsonResponse, 
  errorResponse, 
  validateCSRFToken,
  getUserByEmail,
  createSession,
  updateLastLogin,
  validateEmail,
  logActivity,
  checkRateLimit
} from '../utils';
import type { Env } from '../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await checkRateLimit(env, `login:${ip}`, 10))) { // 10 login attempts per minute
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }
    
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const password = formData.get('password')?.toString() || '';
    const csrfToken = formData.get('csrf_token')?.toString() || '';
    const remember = formData.get('remember') === 'on';
    
    // Validate required fields
    if (!email || !password || !csrfToken) {
      return errorResponse('Missing required fields', 400);
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return errorResponse('Please enter a valid email address', 400);
    }
    
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(env, csrfToken);
    if (!isValidCSRF) {
      return errorResponse('Invalid CSRF token', 403);
    }
    
    // Get user
    const user = await getUserByEmail(env, email);
    if (!user) {
      // Log failed login attempt
      await logActivity(env, 'unknown', 'login_failed', {
        email,
        reason: 'user_not_found',
        ip
      });
      return errorResponse('Invalid email or password', 401);
    }
    
    // Verify password
    if (user.password !== password) {
      // Log failed login attempt
      await logActivity(env, user.id, 'login_failed', {
        email,
        reason: 'invalid_password',
        ip
      });
      return errorResponse('Invalid email or password', 401);
    }
    
    // Update last login
    await updateLastLogin(env, user);
    
    // Create session (longer session if remember me is checked)
    const sessionDuration = remember ? 86400 * 30 : 86400; // 30 days or 1 day
    const sessionToken = crypto.randomUUID();
    await env.USERS.put(`session:${sessionToken}`, user.id, { 
      expirationTtl: sessionDuration
    });
    
    // Log successful login
    await logActivity(env, user.id, 'login_successful', {
      email,
      remember,
      ip
    });
    
    // Return success response with session cookie
    const cookieMaxAge = remember ? 86400 * 30 : 86400;
    
    return new Response(JSON.stringify({ 
      name: user.name, 
      role: user.role,
      message: 'Login successful'
    }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${cookieMaxAge}; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Login failed. Please try again.', 500);
  }
};