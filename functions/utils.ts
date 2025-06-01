// functions/utils.ts
// Enhanced utilities for Velocity Lab - ADMIN CREDENTIALS REMOVED

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
  SESSIONS: KVNamespace;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  passwordChangedAt?: string;
}

export interface Progress {
  [week: string]: {
    [task: string]: boolean;
  };
}

export interface Session {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

// JSON response helper
export const jsonResponse = (data: any, status: number = 200): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};

// Error response helper
export const errorResponse = (message: string, status: number = 400): Response => {
  return jsonResponse({ error: message }, status);
};

// Validate session and return user ID
export const validateSession = async (env: Env, request: Request): Promise<string | null> => {
  try {
    const cookies = request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    
    if (!sessionToken) {
      return null;
    }
    
    const userId = await env.USERS.get(`session:${sessionToken}`);
    return userId;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

// Get user by ID
export const getUserById = async (env: Env, userId: string): Promise<User | null> => {
  try {
    // First, try to find user by ID in all user records
    const users = await env.USERS.list({ prefix: 'user:' });
    
    for (const { name: userKey } of users.keys) {
      const userData = await env.USERS.get(userKey);
      if (userData) {
        const user = JSON.parse(userData) as User;
        if (user.id === userId) {
          return user;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (env: Env, email: string): Promise<User | null> => {
  try {
    const userData = await env.USERS.get(`user:${email.toLowerCase()}`);
    if (!userData) {
      return null;
    }
    return JSON.parse(userData) as User;
  } catch (error) {
    console.error('Get user by email error:', error);
    return null;
  }
};

// Generate CSRF token
export const generateCSRFToken = async (env: Env): Promise<string> => {
  const token = crypto.randomUUID();
  await env.USERS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
};

// Validate CSRF token
export const validateCSRFToken = async (env: Env, token: string): Promise<boolean> => {
  try {
    const isValid = await env.USERS.get(`csrf:${token}`);
    if (isValid) {
      await env.USERS.delete(`csrf:${token}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
};

// Create session
export const createSession = async (env: Env, userId: string): Promise<string> => {
  const sessionToken = crypto.randomUUID();
  await env.USERS.put(`session:${sessionToken}`, userId, { 
    expirationTtl: 86400 // 24 hours
  });
  return sessionToken;
};

// Delete session
export const deleteSession = async (env: Env, sessionToken: string): Promise<void> => {
  await env.USERS.delete(`session:${sessionToken}`);
};

// Update user's last login
export const updateLastLogin = async (env: Env, user: User): Promise<void> => {
  try {
    user.lastLogin = new Date().toISOString();
    await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
  } catch (error) {
    console.error('Update last login error:', error);
  }
};

// Log activity
export const logActivity = async (env: Env, userId: string, action: string, metadata?: any): Promise<void> => {
  try {
    const logEntry = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };
    
    const logKey = `log:${action}:${Date.now()}:${userId}`;
    await env.USERS.put(logKey, JSON.stringify(logEntry), {
      expirationTtl: 86400 * 30 // 30 days
    });
  } catch (error) {
    console.error('Log activity error:', error);
  }
};

// Rate limiting helper
export const checkRateLimit = async (env: Env, identifier: string, limit: number = 60): Promise<boolean> => {
  try {
    const key = `rate:${identifier}`;
    const current = await env.USERS.get(key);
    const count = current ? parseInt(current) : 0;
    
    if (count >= limit) {
      return false;
    }
    
    await env.USERS.put(key, (count + 1).toString(), { expirationTtl: 60 });
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return true; // Allow on error
  }
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  return { valid: true };
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Calculate user progress percentage (30-task system)
export const calculateProgress = (progress: Progress): number => {
  let completedTasks = 0;
  const totalTasks = 30; // Updated to 30-task system
  
  Object.values(progress).forEach(week => {
    completedTasks += Object.values(week).filter(Boolean).length;
  });
  
  return Math.round((completedTasks / totalTasks) * 100);
};

// NO DEFAULT ADMIN - Removed initializeDefaultAdmin function
// Admins must be created manually through the registration process
// and then promoted via database direct access or other secure means

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString();
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Clean expired sessions
export const cleanExpiredSessions = async (env: Env): Promise<void> => {
  try {
    const sessions = await env.USERS.list({ prefix: 'session:' });
    const now = Date.now();
    
    for (const { name: sessionKey } of sessions.keys) {
      // Sessions automatically expire due to TTL, but we can clean up manually if needed
      // This is more for logging/monitoring purposes
    }
  } catch (error) {
    console.error('Clean expired sessions error:', error);
  }
};