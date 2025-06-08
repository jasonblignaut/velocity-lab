// functions/api/users/register.js
// User Registration Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  isValidEmail, 
  sanitizeInput, 
  hashPassword, 
  generateToken 
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    console.log('=== REGISTRATION DEBUG START ===');
    
    // Parse form data
    const formData = await request.formData();
    const name = sanitizeInput(formData.get('name'));
    const email = sanitizeInput(formData.get('email'));
    const password = formData.get('password');
    
    console.log('Registration attempt for:', name, email);
    
    // Validate required fields
    if (!name || !email || !password) {
      return createErrorResponse('All fields are required', 400);
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    // Validate password length
    if (password.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }
    
    const emailLower = email.toLowerCase();
    
    // Try different KV binding names
    let usersKV = env.VELOCITY_USERS || env.velocity_users || env.users;
    let sessionsKV = env.VELOCITY_SESSIONS || env.velocity_sessions || env.sessions;
    
    if (!usersKV) {
      console.error('No users KV binding found');
      return createErrorResponse('Database configuration error', 500);
    }
    
    // Check if user already exists
    const existingUser = await usersKV.get(`user:${emailLower}`);
    if (existingUser) {
      return createErrorResponse('An account with this email already exists', 409);
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate user ID and session token
    const userId = generateToken();
    const sessionToken = generateToken();
    
    // Create user object
    const user = {
      id: userId,
      name: name,
      email: emailLower,
      hashedPassword: hashedPassword,
      role: 'user', // Default role
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };
    
    // Save user to KV storage
    await usersKV.put(`user:${emailLower}`, JSON.stringify(user));
    console.log('User saved to KV');
    
    // Create session object
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      rememberMe: false
    };
    
    // Save session to KV storage (24 hour expiration)
    if (sessionsKV) {
      await sessionsKV.put(sessionToken, JSON.stringify(session), {
        expirationTtl: 24 * 60 * 60 // 24 hours
      });
      console.log('Session saved to KV');
    }
    
    console.log('=== REGISTRATION SUCCESS ===');
    
    // Return success response matching old working format
    return createResponse({
      name: user.name,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken
    }, true, `Welcome to Velocity Lab, ${user.name}! 🚀`);
    
  } catch (error) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Registration error details:', error);
    return createErrorResponse('Registration failed. Please try again.', 500);
  }
}