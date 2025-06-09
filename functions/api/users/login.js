// functions/api/users/login.js
// User Login Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  verifyPassword,
  createSession,
  isValidEmail,
  checkRateLimit,
  parseRequestJSON,
  updateUserActivity,
  logActivity
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Rate limiting - 10 login attempts per 15 minutes per IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `login:${clientIP}`;
    
    if (!(await checkRateLimit(env, rateLimitKey, 10, 15))) {
      return createErrorResponse('Too many login attempts. Please try again later.', 429);
    }
    
    // Parse request body
    const loginData = await parseRequestJSON(request);
    
    // Validate required fields
    if (!loginData.email || !loginData.password) {
      return createErrorResponse('Email and password are required', 400);
    }
    
    // Sanitize input
    const email = loginData.email.toLowerCase().trim();
    const password = loginData.password;
    
    if (!isValidEmail(email)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    // Get user by email
    const user = await getUserByEmail(env, email);
    
    if (!user) {
      // Use generic error message to prevent email enumeration
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Check if user account is active
    if (user.isActive === false) {
      return createErrorResponse('Your account has been deactivated. Please contact support.', 403);
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash);
    
    if (!passwordValid) {
      // Log failed login attempt
      logActivity('users/login', user.id, 'FAILED_LOGIN', { email, ip: clientIP });
      
      // Additional rate limiting per user email
      const userRateLimitKey = `login_user:${email}`;
      await checkRateLimit(env, userRateLimitKey, 5, 30); // 5 attempts per 30 minutes per email
      
      return createErrorResponse('Invalid email or password', 401);
    }
    
    // Create session
    const rememberMe = Boolean(loginData.remember);
    const sessionToken = await createSession(env, user.id, rememberMe);
    
    // Update user's last activity
    await updateUserActivity(env, user.id);
    
    logActivity('users/login', user.id, 'LOGIN_SUCCESS', { 
      email, 
      rememberMe,
      ip: clientIP 
    });
    
    // Prepare response (exclude sensitive data)
    const responseData = {
      name: user.name,
      email: user.email,
      role: user.role,
      sessionToken
    };
    
    return createResponse(responseData, true, 'Login successful');
    
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    if (error.message.includes('Rate limit')) {
      return createErrorResponse('Login temporarily unavailable. Please try again later.', 503);
    }
    
    return createErrorResponse('Login failed. Please try again.', 500);
  }
}

// Helper function to get user by email
async function getUserByEmail(env, email) {
  try {
    // Use email-to-userId mapping for faster lookups
    const emailKey = `email:${email}`;
    const userId = await env.VELOCITY_USERS.get(emailKey);
    
    if (!userId) {
      return null;
    }
    
    const userKey = `user:${userId}`;
    const userData = await env.VELOCITY_USERS.get(userKey);
    
    if (!userData) {
      // Clean up orphaned email mapping
      await env.VELOCITY_USERS.delete(emailKey);
      return null;
    }
    
    return JSON.parse(userData);
    
  } catch (error) {
    console.error('Failed to get user by email:', error);
    return null;
  }
}

// Helper function to check failed login attempts
async function checkFailedAttempts(env, userId) {
  try {
    const failedAttemptsKey = `failed_login:${userId}`;
    const failedData = await env.VELOCITY_SESSIONS.get(failedAttemptsKey);
    
    if (!failedData) {
      return { count: 0, lockedUntil: null };
    }
    
    const attempts = JSON.parse(failedData);
    const now = Date.now();
    
    // Filter out old attempts (older than 1 hour)
    const recentAttempts = attempts.filter(timestamp => now - timestamp < 60 * 60 * 1000);
    
    // Check if account is locked (5 failed attempts in 1 hour = 30 minute lock)
    if (recentAttempts.length >= 5) {
      const lastAttempt = Math.max(...recentAttempts);
      const lockDuration = 30 * 60 * 1000; // 30 minutes
      const lockedUntil = lastAttempt + lockDuration;
      
      if (now < lockedUntil) {
        return { count: recentAttempts.length, lockedUntil };
      }
    }
    
    return { count: recentAttempts.length, lockedUntil: null };
    
  } catch (error) {
    console.error('Failed to check failed attempts:', error);
    return { count: 0, lockedUntil: null };
  }
}

// Helper function to record failed login attempt
async function recordFailedAttempt(env, userId) {
  try {
    const failedAttemptsKey = `failed_login:${userId}`;
    const failedData = await env.VELOCITY_SESSIONS.get(failedAttemptsKey);
    
    let attempts = [];
    if (failedData) {
      attempts = JSON.parse(failedData);
    }
    
    // Add current attempt
    attempts.push(Date.now());
    
    // Keep only recent attempts (last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    attempts = attempts.filter(timestamp => timestamp > oneHourAgo);
    
    // Save with 2 hour TTL
    await env.VELOCITY_SESSIONS.put(failedAttemptsKey, JSON.stringify(attempts), {
      expirationTtl: 2 * 60 * 60 // 2 hours
    });
    
  } catch (error) {
    console.error('Failed to record failed attempt:', error);
  }
}

// Helper function to clear failed attempts on successful login
async function clearFailedAttempts(env, userId) {
  try {
    const failedAttemptsKey = `failed_login:${userId}`;
    await env.VELOCITY_SESSIONS.delete(failedAttemptsKey);
  } catch (error) {
    console.error('Failed to clear failed attempts:', error);
  }
}

// GET endpoint to check login status (for frontend session validation)
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // This is a simple endpoint to validate if a session is still active
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorResponse('No session token provided', 401);
    }
    
    const sessionToken = authHeader.replace('Bearer ', '');
    
    // Check session validity
    const sessionKey = `session:${sessionToken}`;
    const sessionData = await env.VELOCITY_SESSIONS.get(sessionKey);
    
    if (!sessionData) {
      return createErrorResponse('Invalid or expired session', 401);
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      await env.VELOCITY_SESSIONS.delete(sessionKey);
      return createErrorResponse('Session expired', 401);
    }
    
    // Get user data
    const userKey = `user:${session.userId}`;
    const userData = await env.VELOCITY_USERS.get(userKey);
    
    if (!userData) {
      await env.VELOCITY_SESSIONS.delete(sessionKey);
      return createErrorResponse('User not found', 401);
    }
    
    const user = JSON.parse(userData);
    
    // Check if user is still active
    if (user.isActive === false) {
      await env.VELOCITY_SESSIONS.delete(sessionKey);
      return createErrorResponse('Account deactivated', 403);
    }
    
    const responseData = {
      name: user.name,
      email: user.email,
      role: user.role,
      sessionValid: true,
      expiresAt: session.expiresAt
    };
    
    return createResponse(responseData, true, 'Session is valid');
    
  } catch (error) {
    console.error('Session validation error:', error);
    return createErrorResponse('Failed to validate session', 500);
  }
}

// Helper function to get user sessions count (for monitoring)
async function getUserSessionsCount(env, userId) {
  try {
    // This would require a more complex implementation to scan all sessions
    // For now, we'll return a simple estimate
    return 1;
  } catch (error) {
    console.error('Failed to get user sessions count:', error);
    return 0;
  }
}