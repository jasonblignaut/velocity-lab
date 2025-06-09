// functions/api/users/register.js
// User Registration Endpoint for Velocity Lab - FIXED FOR FORMDATA

import { 
  createResponse, 
  createErrorResponse, 
  hashPassword,
  generateUserId,
  createSession,
  isValidEmail,
  sanitizeString,
  checkRateLimit,
  logActivity
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Rate limiting - 5 registration attempts per 15 minutes per IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `register:${clientIP}`;
    
    if (!(await checkRateLimit(env, rateLimitKey, 5, 15))) {
      return createErrorResponse('Too many registration attempts. Please try again later.', 429);
    }
    
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    // Extract fields from FormData
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const remember = formData.get('remember');
    
    // Validate required fields
    if (!name || !email || !password) {
      return createErrorResponse('Name, email, and password are required', 400);
    }
    
    // Sanitize and validate input
    const cleanName = sanitizeString(name, 100);
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password;
    
    if (cleanName.length < 2) {
      return createErrorResponse('Name must be at least 2 characters long', 400);
    }
    
    if (!isValidEmail(cleanEmail)) {
      return createErrorResponse('Please enter a valid email address', 400);
    }
    
    if (cleanPassword.length < 8) {
      return createErrorResponse('Password must be at least 8 characters long', 400);
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(env, cleanEmail);
    if (existingUser) {
      return createErrorResponse('An account with this email already exists', 409);
    }
    
    // Determine user role (first user becomes admin)
    const userRole = await determineUserRole(env);
    
    // Hash password
    const passwordHash = await hashPassword(cleanPassword);
    
    // Generate user ID
    const userId = generateUserId();
    
    // Create user object
    const newUser = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: userRole,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      isActive: true
    };
    
    // Save user to KV storage
    const userKey = `user:${userId}`;
    await env.VELOCITY_USERS.put(userKey, JSON.stringify(newUser));
    
    // Update users index for admin panel
    await updateUsersIndex(env, userId);
    
    // Create session
    const rememberMe = Boolean(remember === 'on' || remember === 'true' || remember === true);
    const sessionToken = await createSession(env, userId, rememberMe);
    
    logActivity('users/register', userId, 'POST', { 
      email: cleanEmail, 
      role: userRole,
      rememberMe 
    });
    
    // Prepare response (exclude sensitive data)
    const responseData = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      sessionToken
    };
    
    return createResponse(responseData, true, 'Account created successfully');
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.message.includes('FormData')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    if (error.message.includes('Rate limit')) {
      return createErrorResponse('Registration temporarily unavailable. Please try again later.', 503);
    }
    
    return createErrorResponse('Failed to create account. Please try again.', 500);
  }
}

// Helper function to get user by email
async function getUserByEmail(env, email) {
  try {
    // Since KV doesn't have secondary indexes, we need to maintain an email-to-userId mapping
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

// Helper function to determine user role
async function determineUserRole(env) {
  try {
    // Check if this is the first user (who becomes admin)
    const usersIndexKey = 'users_index';
    const usersIndexData = await env.VELOCITY_USERS.get(usersIndexKey);
    
    if (!usersIndexData) {
      // First user - make them admin
      return 'admin';
    }
    
    const userIds = JSON.parse(usersIndexData);
    
    if (userIds.length === 0) {
      // First user - make them admin
      return 'admin';
    }
    
    // Check if we have any existing admins
    let hasAdmin = false;
    for (const userId of userIds) {
      try {
        const userKey = `user:${userId}`;
        const userData = await env.VELOCITY_USERS.get(userKey);
        if (userData) {
          const user = JSON.parse(userData);
          if (user.role === 'admin') {
            hasAdmin = true;
            break;
          }
        }
      } catch (userError) {
        console.error(`Failed to check user ${userId} for admin role:`, userError);
      }
    }
    
    // If no admin exists, make this user admin (for data recovery scenarios)
    return hasAdmin ? 'user' : 'admin';
    
  } catch (error) {
    console.error('Failed to determine user role:', error);
    // Default to regular user on error
    return 'user';
  }
}

// Helper function to update users index
async function updateUsersIndex(env, userId) {
  try {
    const usersIndexKey = 'users_index';
    const usersIndexData = await env.VELOCITY_USERS.get(usersIndexKey);
    
    let userIds = [];
    if (usersIndexData) {
      try {
        userIds = JSON.parse(usersIndexData);
      } catch (parseError) {
        console.error('Failed to parse users index:', parseError);
        userIds = [];
      }
    }
    
    // Ensure userIds is an array
    if (!Array.isArray(userIds)) {
      userIds = [];
    }
    
    // Add new user ID if not already present
    if (!userIds.includes(userId)) {
      userIds.push(userId);
    }
    
    // Save updated index
    await env.VELOCITY_USERS.put(usersIndexKey, JSON.stringify(userIds));
    
    // Also create email-to-userId mapping for faster lookups
    const user = await env.VELOCITY_USERS.get(`user:${userId}`);
    if (user) {
      const userData = JSON.parse(user);
      const emailKey = `email:${userData.email}`;
      await env.VELOCITY_USERS.put(emailKey, userId);
    }
    
  } catch (error) {
    console.error('Failed to update users index:', error);
    // Don't throw error as this is not critical for registration success
  }
}

// Helper function to validate password strength
function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  // Optional: Add more strength requirements
  // if (!/[A-Z]/.test(password)) {
  //   errors.push('Password must contain at least one uppercase letter');
  // }
  
  // if (!/[a-z]/.test(password)) {
  //   errors.push('Password must contain at least one lowercase letter');
  // }
  
  // if (!/[0-9]/.test(password)) {
  //   errors.push('Password must contain at least one number');
  // }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Please choose a more secure password');
  }
  
  return errors;
}

// Helper function to generate username suggestions if email is taken
function generateUsernameSuggestions(email) {
  const baseUsername = email.split('@')[0];
  const suggestions = [];
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseUsername}${i}`);
  }
  
  // Add current year
  const currentYear = new Date().getFullYear();
  suggestions.push(`${baseUsername}${currentYear}`);
  
  return suggestions;
}

// GET endpoint to check email availability (optional)
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Rate limiting for email checks
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `email_check:${clientIP}`;
    
    if (!(await checkRateLimit(env, rateLimitKey, 20, 5))) {
      return createErrorResponse('Too many requests. Please try again later.', 429);
    }
    
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return createErrorResponse('Email parameter is required', 400);
    }
    
    if (!isValidEmail(email)) {
      return createErrorResponse('Invalid email format', 400);
    }
    
    const existingUser = await getUserByEmail(env, email.toLowerCase().trim());
    
    const responseData = {
      email: email.toLowerCase().trim(),
      available: !existingUser,
      suggestions: existingUser ? generateUsernameSuggestions(email) : []
    };
    
    return createResponse(responseData, true, 'Email availability checked');
    
  } catch (error) {
    console.error('Email check error:', error);
    return createErrorResponse('Failed to check email availability', 500);
  }
}