// functions/api/register.ts
// Enhanced user registration endpoint

import { 
  jsonResponse, 
  errorResponse, 
  validateCSRFToken,
  getUserByEmail,
  createSession,
  validateEmail,
  validatePassword,
  sanitizeInput,
  logActivity,
  checkRateLimit
} from './utils';
import type { Env, User } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await checkRateLimit(env, `register:${ip}`, 5))) { // 5 registration attempts per minute
      return errorResponse('Too many registration attempts. Please try again later.', 429);
    }
    
    const formData = await request.formData();
    const name = sanitizeInput(formData.get('name')?.toString().trim() || '');
    const email = formData.get('email')?.toString().trim().toLowerCase() || '';
    const password = formData.get('password')?.toString() || '';
    const repeatPassword = formData.get('repeatPassword')?.toString() || '';
    const role = sanitizeInput(formData.get('role')?.toString().trim() || '');
    const csrfToken = formData.get('csrf_token')?.toString() || '';
    
    // Validate required fields
    if (!name || !email || !password || !repeatPassword || !role || !csrfToken) {
      return errorResponse('Missing required fields', 400);
    }
    
    // Validate CSRF token
    const isValidCSRF = await validateCSRFToken(env, csrfToken);
    if (!isValidCSRF) {
      return errorResponse('Invalid CSRF token', 403);
    }
    
    // Validate input lengths
    if (name.length < 2 || name.length > 50) {
      return errorResponse('Name must be between 2 and 50 characters', 400);
    }
    
    if (email.length > 100) {
      return errorResponse('Email must be less than 100 characters', 400);
    }
    
    if (role.length > 100) {
      return errorResponse('Role must be less than 100 characters', 400);
    }
    
    // Validate email format
    if (!validateEmail(email)) {
      return errorResponse('Please enter a valid email address', 400);
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return errorResponse(passwordValidation.message || 'Invalid password', 400);
    }
    
    // Validate password match
    if (password !== repeatPassword) {
      return errorResponse('Passwords do not match', 400);
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(env, email);
    if (existingUser) {
      return errorResponse('Email address is already registered', 409);
    }
    
    // Create new user
    const userId = crypto.randomUUID();
    const userData: User = {
      id: userId,
      name,
      email,
      password, // Store as plain text as requested (not recommended for production)
      role: 'user', // All new users start as regular users
      createdAt: new Date().toISOString()
    };
    
    // Save user
    await env.USERS.put(`user:${email}`, JSON.stringify(userData));
    
    // Create session
    const sessionToken = await createSession(env, userId);
    
    // Log registration
    await logActivity(env, userId, 'user_registered', {
      email,
      role: userData.role
    });
    
    // Return success response with session cookie
    return new Response(JSON.stringify({ 
      name: userData.name, 
      role: userData.role,
      message: 'Registration successful'
    }), {
      status: 201,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Registration failed. Please try again.', 500);
  }
};