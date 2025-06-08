// functions/_middleware.js
// Cloudflare Pages Functions Middleware for Velocity Lab

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  
  // Handle CORS for all API requests
  if (url.pathname.startsWith('/api/')) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    // Continue to the actual API handler
    const response = await next();
    
    // Add CORS headers to all API responses
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }
  
  // For non-API requests, just continue
  return next();
}

// Utility function to create standardized API responses
export function createResponse(data = null, success = true, message = '', status = 200) {
  return new Response(JSON.stringify({
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Utility function to handle API errors
export function createErrorResponse(message = 'Internal Server Error', status = 500) {
  console.error('API Error:', message);
  return createResponse(null, false, message, status);
}

// Utility function to validate session token
export async function validateSession(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.substring(7);
    const sessionData = await env.VELOCITY_SESSIONS.get(token);
    
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired (30 days)
    const expirationTime = new Date(session.createdAt).getTime() + (30 * 24 * 60 * 60 * 1000);
    if (Date.now() > expirationTime) {
      await env.VELOCITY_SESSIONS.delete(token);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Utility function to require authentication
export async function requireAuth(request, env) {
  const session = await validateSession(request, env);
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

// Utility function to require admin role
export async function requireAdmin(request, env) {
  const session = await requireAuth(request, env);
  if (session.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return session;
}

// Utility function to generate random token
export function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Utility function to hash passwords (simple implementation)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'velocity_salt_2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

// Utility function to validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to validate password strength
export function isValidPassword(password) {
  return password && password.length >= 8;
}

// Utility function to sanitize user input
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().substring(0, 1000); // Limit length and trim
}

// Utility function to get user by email
export async function getUserByEmail(email, env) {
  try {
    const userData = await env.VELOCITY_USERS.get(`user:${email.toLowerCase()}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Utility function to get user progress
export async function getUserProgress(userId, env) {
  try {
    const progressData = await env.VELOCITY_PROGRESS.get(`progress:${userId}`);
    return progressData ? JSON.parse(progressData) : {};
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {};
  }
}

// Utility function to save user progress
export async function saveUserProgress(userId, progress, env) {
  try {
    await env.VELOCITY_PROGRESS.put(`progress:${userId}`, JSON.stringify({
      ...progress,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Error saving user progress:', error);
    return false;
  }
}