// functions/api/users/login.js
// User Login Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  isValidEmail, 
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
    const email = sanitizeInput(formData.get('email'));
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';
    
    // Validate required fields
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    const emailLower = email.toLowerCase();
    
    // Get user from database
    const user = await getUserByEmail(emailLower, env);
    if (!user) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Check if user account is active
    if (!user.isActive) {
      return createErrorResponse('Account has been deactivated. Please contact support.', 403);
    }
    
    // Verify password
    const hashedInputPassword = await hashPassword(password);
    if (hashedInputPassword !== user.hashedPassword) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Generate new session token
    const sessionToken = generateToken();
    
    // Create session object
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      rememberMe: remember
    };
    
    // Set session expiration based on remember me option
    const sessionExpirationTTL = remember ? (30 * 24 * 60 * 60) : (24 * 60 * 60); // 30 days or 1 day
    
    // Save session to KV storage
    await env.VELOCITY_SESSIONS.put(sessionToken, JSON.stringify(session), {
      expirationTtl: sessionExpirationTTL
    });
    
    // Update user's last active time
    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString()
    };
    await env.VELOCITY_USERS.put(`user:${emailLower}`, JSON.stringify(updatedUser));
    
    // Return success response with user data and session token
    return createResponse({
      name: user.name,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken
    }, true, `Welcome back, ${user.name}! 🎉`);
    
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Login failed. Please try again.', 500);
  }
}