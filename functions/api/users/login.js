// functions/api/users/login.js
// Debug-Enhanced User Login Endpoint for Velocity Lab

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
    console.log('=== LOGIN DEBUG START ===');
    console.log('Available env bindings:', Object.keys(env));
    
    // Parse form data
    const formData = await request.formData();
    const email = sanitizeInput(formData.get('email'));
    const password = formData.get('password');
    const remember = formData.get('remember') === 'on';
    
    console.log('Login attempt for email:', email);
    
    // Validate required fields
    if (!email || !password) {
      return createErrorResponse('Email and password are required', 400);
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    const emailLower = email.toLowerCase();
    console.log('Looking up user with key:', `user:${emailLower}`);
    
    // Try different KV binding names (uppercase and lowercase)
    let usersKV = env.VELOCITY_USERS || env.velocity_users || env.users;
    let sessionsKV = env.VELOCITY_SESSIONS || env.velocity_sessions || env.sessions;
    
    if (!usersKV) {
      console.error('No users KV binding found. Available:', Object.keys(env));
      return createErrorResponse('Database configuration error', 500);
    }
    
    console.log('Using KV binding for users');
    
    // Get user from database
    const userData = await usersKV.get(`user:${emailLower}`);
    console.log('KV lookup result exists:', !!userData);
    
    if (!userData) {
      console.log('User not found in KV');
      return createErrorResponse('Invalid email or password', 401);
    }
    
    let user;
    try {
      user = JSON.parse(userData);
      console.log('User data parsed successfully. Has password:', !!user.hashedPassword);
      console.log('User role:', user.role);
      console.log('User name:', user.name);
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      return createErrorResponse('Invalid user data format', 500);
    }
    
    // Verify password
    const hashedInputPassword = await hashPassword(password);
    console.log('Password hashes match:', hashedInputPassword === user.hashedPassword);
    
    if (hashedInputPassword !== user.hashedPassword) {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Generate new session token
    const sessionToken = generateToken();
    console.log('Generated session token');
    
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
    const sessionExpirationTTL = remember ? (30 * 24 * 60 * 60) : (24 * 60 * 60);
    
    // Save session to KV storage
    if (sessionsKV) {
      await sessionsKV.put(sessionToken, JSON.stringify(session), {
        expirationTtl: sessionExpirationTTL
      });
      console.log('Session saved to KV');
    } else {
      console.warn('No sessions KV binding found, session not saved');
    }
    
    // Update user's last active time
    const updatedUser = {
      ...user,
      lastActive: new Date().toISOString(),
      isActive: true
    };
    
    await usersKV.put(`user:${emailLower}`, JSON.stringify(updatedUser));
    console.log('User last active updated');
    
    console.log('=== LOGIN SUCCESS ===');
    
    // Return success response
    return createResponse({
      name: user.name,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken
    }, true, `Welcome back, ${user.name}! 🎉`);
    
  } catch (error) {
    console.error('=== LOGIN ERROR ===');
    console.error('Login error details:', error);
    console.error('Error stack:', error.stack);
    return createErrorResponse('Login failed. Please try again.', 500);
  }
}