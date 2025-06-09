// functions/_middleware.js
// Core middleware and utilities for Velocity Lab API

import { createHash } from 'crypto';

// CORS Headers for all API responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS requests
export async function onRequest(context) {
  const { request } = context;
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: CORS_HEADERS
    });
  }
  
  // Continue to the actual handler
  return await context.next();
}

// Create standardized API response
export function createResponse(data = null, success = true, message = '', status = 200) {
  const response = {
    success,
    message,
    data,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}

// Create standardized error response
export function createErrorResponse(message, status = 400, details = null) {
  const response = {
    success: false,
    message,
    data: null,
    error: details,
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS
    }
  });
}

// Require authentication and return session data
export async function requireAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }
  
  const sessionToken = authHeader.replace('Bearer ', '');
  
  if (!sessionToken) {
    throw new Error('Authentication required');
  }
  
  // Get session from KV storage
  const sessionKey = `session:${sessionToken}`;
  const sessionData = await env.VELOCITY_SESSIONS.get(sessionKey);
  
  if (!sessionData) {
    throw new Error('Invalid or expired session');
  }
  
  let session;
  try {
    session = JSON.parse(sessionData);
  } catch (error) {
    throw new Error('Invalid session data');
  }
  
  // Check if session is expired
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    // Clean up expired session
    await env.VELOCITY_SESSIONS.delete(sessionKey);
    throw new Error('Session expired');
  }
  
  // Get user data to verify user still exists and get current role
  const userKey = `user:${session.userId}`;
  const userData = await env.VELOCITY_USERS.get(userKey);
  
  if (!userData) {
    // Clean up session for non-existent user
    await env.VELOCITY_SESSIONS.delete(sessionKey);
    throw new Error('User not found');
  }
  
  let user;
  try {
    user = JSON.parse(userData);
  } catch (error) {
    throw new Error('Invalid user data');
  }
  
  // Return session with current user data
  return {
    sessionToken,
    userId: session.userId,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt
  };
}

// Require admin role
export async function requireAdmin(request, env) {
  const session = await requireAuth(request, env);
  
  if (session.userRole !== 'admin') {
    throw new Error('Admin privileges required');
  }
  
  return session;
}

// Hash password using Web Crypto API
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'velocity_lab_salt_2025'); // Add salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password against hash
export async function verifyPassword(password, hash) {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Generate secure session token
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate user ID
export function generateUserId() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize and validate user input
export function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, ''); // Remove potentially dangerous characters
}

// Rate limiting helper
export async function checkRateLimit(env, identifier, maxRequests = 10, windowMinutes = 15) {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const rateLimitKey = `rate_limit:${identifier}`;
  
  try {
    const rateLimitData = await env.VELOCITY_SESSIONS.get(rateLimitKey);
    
    let requests = [];
    if (rateLimitData) {
      requests = JSON.parse(rateLimitData);
      // Filter out old requests outside the window
      requests = requests.filter(timestamp => now - timestamp < windowMs);
    }
    
    // Check if over limit
    if (requests.length >= maxRequests) {
      return false;
    }
    
    // Add current request
    requests.push(now);
    
    // Save updated rate limit data (expire after window + 5 minutes)
    const expirationTtl = Math.floor((windowMs + 5 * 60 * 1000) / 1000);
    await env.VELOCITY_SESSIONS.put(rateLimitKey, JSON.stringify(requests), {
      expirationTtl
    });
    
    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // On error, allow the request (fail open)
    return true;
  }
}

// Create session with TTL
export async function createSession(env, userId, rememberMe = false) {
  const sessionToken = generateSessionToken();
  const now = new Date();
  
  // Session expires in 24 hours by default, 30 days if "remember me"
  const expirationHours = rememberMe ? 24 * 30 : 24;
  const expiresAt = new Date(now.getTime() + expirationHours * 60 * 60 * 1000);
  
  const sessionData = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    rememberMe
  };
  
  const sessionKey = `session:${sessionToken}`;
  
  // TTL in seconds
  const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
  
  await env.VELOCITY_SESSIONS.put(sessionKey, JSON.stringify(sessionData), {
    expirationTtl: ttlSeconds
  });
  
  return sessionToken;
}

// Delete session
export async function deleteSession(env, sessionToken) {
  const sessionKey = `session:${sessionToken}`;
  await env.VELOCITY_SESSIONS.delete(sessionKey);
}

// Get all user sessions (for cleanup)
export async function getUserSessions(env, userId) {
  try {
    // List all sessions (this is expensive, so we'll use a prefix scan if needed)
    // For now, we'll rely on TTL cleanup
    return [];
  } catch (error) {
    console.error('Failed to get user sessions:', error);
    return [];
  }
}

// Update user last activity
export async function updateUserActivity(env, userId) {
  try {
    const userKey = `user:${userId}`;
    const userData = await env.VELOCITY_USERS.get(userKey);
    
    if (userData) {
      const user = JSON.parse(userData);
      user.lastActive = new Date().toISOString();
      await env.VELOCITY_USERS.put(userKey, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to update user activity:', error);
    // Don't throw - this is not critical
  }
}

// Validate and format task ID
export function validateTaskId(taskId) {
  if (typeof taskId !== 'string') {
    return null;
  }
  
  // Expected format: week1-task1, week2-task5, etc.
  const taskIdRegex = /^week\d+-task\d+$/;
  return taskIdRegex.test(taskId) ? taskId : null;
}

// Calculate user progress statistics
export function calculateProgressStats(progressData) {
  if (!progressData || typeof progressData !== 'object') {
    return {
      totalTasks: 0,
      completedTasks: 0,
      progressPercentage: 0,
      hasNotes: false,
      lastUpdated: null
    };
  }
  
  const tasks = Object.values(progressData);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task && task.completed).length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Check if user has any notes
  const hasNotes = tasks.some(task => task && task.notes && task.notes.trim().length > 0);
  
  // Find last updated time
  let lastUpdated = null;
  tasks.forEach(task => {
    if (task && task.lastUpdated) {
      if (!lastUpdated || new Date(task.lastUpdated) > new Date(lastUpdated)) {
        lastUpdated = task.lastUpdated;
      }
    }
  });
  
  return {
    totalTasks,
    completedTasks,
    progressPercentage,
    hasNotes,
    lastUpdated
  };
}

// Parse request JSON with error handling
export async function parseRequestJSON(request) {
  try {
    const text = await request.text();
    if (!text.trim()) {
      throw new Error('Empty request body');
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

// Log API activity (for debugging)
export function logActivity(endpoint, userId, action, details = {}) {
  console.log(`API: ${endpoint} | User: ${userId} | Action: ${action}`, details);
}