// functions/api/users/register.js
// User Registration Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  isValidEmail, 
  isValidPassword, 
  sanitizeInput, 
  hashPassword, 
  generateToken, 
  getUserByEmail 
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Parse form data
    const formData = await request.formData();
    const name = sanitizeInput(formData.get('name'));
    const email = sanitizeInput(formData.get('email'));
    const password = formData.get('password');
    
    // Validate required fields
    if (!name || !email || !password) {
      return createErrorResponse('All fields are required', 400);
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    // Validate password strength
    if (!isValidPassword(password)) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }
    
    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return createErrorResponse('Name must be between 2 and 50 characters', 400);
    }
    
    const emailLower = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await getUserByEmail(emailLower, env);
    if (existingUser) {
      return createErrorResponse('An account with this email already exists', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate user ID and session token
    const userId = generateToken();
    const sessionToken = generateToken();
    
    // Determine user role (first user becomes admin)
    const userKeys = await env.VELOCITY_USERS.list({ prefix: 'user:' });
    const role = userKeys.keys.length === 0 ? 'admin' : 'user';
    
    // Create user object
    const user = {
      id: userId,
      name: name,
      email: emailLower,
      role: role,
      hashedPassword: hashedPassword,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };
    
    // Create session object
    const session = {
      userId: userId,
      email: emailLower,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };
    
    // Save user to KV storage
    await env.VELOCITY_USERS.put(`user:${emailLower}`, JSON.stringify(user));
    
    // Save session to KV storage with 30-day expiration
    const sessionExpirationTTL = 30 * 24 * 60 * 60; // 30 days in seconds
    await env.VELOCITY_SESSIONS.put(sessionToken, JSON.stringify(session), {
      expirationTtl: sessionExpirationTTL
    });
    
    // Initialize empty progress for new user
    await env.VELOCITY_PROGRESS.put(`progress:${userId}`, JSON.stringify({
      userId: userId,
      tasks: {},
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }));
    
    // Return success response with user data and session token
    return createResponse({
      name: user.name,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken
    }, true, 'Account created successfully! Welcome to Velocity Lab! 🚀');
    
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Registration failed. Please try again.', 500);
  }
}