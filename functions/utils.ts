/**
 * Velocity Lab - Complete API Routes Handler
 * Enterprise-grade API endpoints for Exchange Hybrid deployment training platform
 */

import {
  validateEmail,
  validatePassword,
  validateName,
  validateTaskIdentifiers,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  createSession,
  validateSession,
  invalidateSession,
  getUserByEmail,
  getUserById,
  createUser,
  updateLastLogin,
  handleFailedLogin,
  isAccountLocked,
  updateLabProgress,
  calculateProgress,
  calculateCompletedTasks,
  generateProgressCSV,
  parseProgressCSV,
  logActivity,
  logSecurityEvent,
  checkRateLimit,
  createRateLimitResponse,
  createErrorResponse,
  createSuccessResponse,
  extractRequestData,
  getClientIP,
  performHealthCheck,
  updateUserStreak,
  getUserAnalytics,
  getProgressStatistics,
  TASK_STRUCTURE,
  TOTAL_TASKS,
  RATE_LIMITS,
  type Env,
  type User,
  type Progress,
} from '../utils';

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Handles CORS preflight requests
 */
const handleCORS = (): Response => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

/**
 * Adds CORS headers to response
 */
const addCORSHeaders = (response: Response): Response => {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
};

/**
 * Validates admin privileges
 */
const requireAdmin = async (env: Env, request: Request): Promise<User | Response> => {
  const userId = await validateSession(env, request);
  if (!userId) {
    return createErrorResponse('Authentication required', 401);
  }

  const user = await getUserById(env, userId);
  if (!user) {
    return createErrorResponse('User not found', 404);
  }

  if (user.role !== 'admin') {
    await logSecurityEvent(env, {
      type: 'suspicious_activity',
      userId: user.id,
      ipAddress: getClientIP(request),
      timestamp: new Date().toISOString(),
      details: { action: 'attempted_admin_access', userRole: user.role },
    });
    return createErrorResponse('Admin privileges required', 403);
  }

  return user;
};

/**
 * Validates authenticated user
 */
const requireAuth = async (env: Env, request: Request): Promise<User | Response> => {
  const userId = await validateSession(env, request);
  if (!userId) {
    return createErrorResponse('Authentication required', 401);
  }

  const user = await getUserById(env, userId);
  if (!user) {
    return createErrorResponse('User not found', 404);
  }

  return user;
};

// ============================================================================
// MAIN REQUEST HANDLER
// ============================================================================

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const clientIP = getClientIP(request);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    // Health check endpoint
    if (path === '/api/health' && method === 'GET') {
      return await handleHealthCheck(env);
    }

    // Route to appropriate handler
    const response = await routeRequest(env, request, path, method, clientIP);
    return addCORSHeaders(response);
  } catch (error) {
    console.error('Unhandled error in request handler:', error);
    
    // Log the error for monitoring
    await logActivity(env, 'system', 'unhandled_error', {
      path,
      method,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, request);

    return addCORSHeaders(
      createErrorResponse('Internal server error', 500)
    );
  }
};

// ============================================================================
// ROUTE DISPATCHER
// ============================================================================

async function routeRequest(
  env: Env,
  request: Request,
  path: string,
  method: string,
  clientIP: string
): Promise<Response> {
  // Authentication routes
  if (path === '/api/csrf' && method === 'GET') {
    return await handleGetCSRF(env);
  }

  if (path === '/api/login' && method === 'POST') {
    return await handleLogin(env, request, clientIP);
  }

  if (path === '/api/register' && method === 'POST') {
    return await handleRegister(env, request, clientIP);
  }

  if (path === '/api/logout' && method === 'POST') {
    return await handleLogout(env, request, clientIP);
  }

  // Progress routes
  if (path === '/api/progress' && method === 'GET') {
    return await handleGetProgress(env, request);
  }

  if (path === '/api/progress' && method === 'POST') {
    return await handleUpdateProgress(env, request, clientIP);
  }

  // Lab management routes
  if (path === '/api/lab/start-new' && method === 'POST') {
    return await handleStartNewLab(env, request, clientIP);
  }

  // User profile routes
  if (path === '/api/profile' && method === 'GET') {
    return await handleGetProfile(env, request);
  }

  if (path === '/api/profile' && method === 'PUT') {
    return await handleUpdateProfile(env, request, clientIP);
  }

  // Analytics routes
  if (path === '/api/analytics' && method === 'GET') {
    return await handleGetAnalytics(env, request);
  }

  // Admin routes
  if (path === '/api/admin/users-progress' && method === 'GET') {
    return await handleAdminUsersProgress(env, request);
  }

  if (path === '/api/admin/update-role' && method === 'POST') {
    return await handleAdminUpdateRole(env, request, clientIP);
  }

  if (path === '/api/admin/reset-progress' && method === 'POST') {
    return await handleAdminResetProgress(env, request, clientIP);
  }

  if (path === '/api/admin/export-progress' && method === 'GET') {
    return await handleAdminExportProgress(env, request);
  }

  if (path === '/api/admin/import-progress' && method === 'POST') {
    return await handleAdminImportProgress(env, request, clientIP);
  }

  if (path === '/api/admin/analytics' && method === 'GET') {
    return await handleAdminAnalytics(env, request);
  }

  if (path === '/api/admin/users' && method === 'GET') {
    return await handleAdminGetUsers(env, request);
  }

  if (path === '/api/admin/security-events' && method === 'GET') {
    return await handleAdminSecurityEvents(env, request);
  }

  // 404 for unknown routes
  return createErrorResponse('Endpoint not found', 404);
}

// ============================================================================
// AUTHENTICATION HANDLERS
// ============================================================================

async function handleGetCSRF(env: Env): Promise<Response> {
  try {
    const token = await generateCSRFToken(env);
    return createSuccessResponse({
      token,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return createErrorResponse('Failed to generate CSRF token', 500);
  }
}

async function handleLogin(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'login', RATE_LIMITS.LOGIN);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, retryAfter);
    }

    const data = await extractRequestData(request);
    const { email, password, remember, csrf_token } = data;

    // Validate required fields
    if (!email || !password || !csrf_token) {
      return createErrorResponse('Missing required fields: email, password, csrf_token', 400);
    }

    // Validate CSRF token
    if (!(await validateCSRFToken(env, csrf_token))) {
      await logSecurityEvent(env, {
        type: 'suspicious_activity',
        ipAddress: clientIP,
        timestamp: new Date().toISOString(),
        details: { action: 'invalid_csrf_token', email },
      });
      return createErrorResponse('Invalid CSRF token', 403);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Get user
    const user = await getUserByEmail(env, email);
    if (!user) {
      await handleFailedLogin(env, email, clientIP, 'user_not_found');
      return createErrorResponse('Invalid email or password', 401);
    }

    // Check if account is locked
    if (isAccountLocked(user)) {
      return createErrorResponse('Account is temporarily locked due to multiple failed login attempts', 423);
    }

    // Verify password (in production, use proper password hashing)
    if (user.password !== password) {
      await handleFailedLogin(env, email, clientIP, 'invalid_password');
      return createErrorResponse('Invalid email or password', 401);
    }

    // Update last login
    await updateLastLogin(env, user, clientIP);

    // Update user streak
    await updateUserStreak(env, user);

    // Create session
    const userAgent = request.headers.get('User-Agent') || '';
    const sessionToken = await createSession(env, user.id, clientIP, userAgent, !!remember);

    // Log successful login
    await logActivity(env, user.id, 'login_successful', {
      email: user.email,
      remember: !!remember,
    }, request);

    return createSuccessResponse({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      sessionToken,
      expiresIn: remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days or 1 day
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    await logActivity(env, 'unknown', 'login_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, request);
    return createErrorResponse('Login failed', 500);
  }
}

async function handleRegister(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'register', RATE_LIMITS.REGISTER);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, retryAfter);
    }

    const data = await extractRequestData(request);
    const { name, email, password, csrf_token } = data;

    // Validate required fields
    if (!name || !email || !password || !csrf_token) {
      return createErrorResponse('Missing required fields: name, email, password, csrf_token', 400);
    }

    // Validate CSRF token
    if (!(await validateCSRFToken(env, csrf_token))) {
      await logSecurityEvent(env, {
        type: 'suspicious_activity',
        ipAddress: clientIP,
        timestamp: new Date().toISOString(),
        details: { action: 'invalid_csrf_token', email },
      });
      return createErrorResponse('Invalid CSRF token', 403);
    }

    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      return createErrorResponse(nameValidation.errors?.join(', ') || 'Invalid name', 400);
    }

    // Validate email
    if (!validateEmail(email)) {
      return createErrorResponse('Invalid email format', 400);
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return createErrorResponse(
        passwordValidation.errors?.join(', ') || 'Invalid password',
        400,
        { warnings: passwordValidation.warnings }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(env, email);
    if (existingUser) {
      await logSecurityEvent(env, {
        type: 'suspicious_activity',
        ipAddress: clientIP,
        timestamp: new Date().toISOString(),
        details: { action: 'duplicate_registration_attempt', email },
      });
      return createErrorResponse('Email already registered', 409);
    }

    // Create new user
    const userData = {
      name: sanitizeInput(name),
      email: email.toLowerCase(),
      password, // Note: In production, hash the password
      role: 'user' as const,
      emailVerified: false,
      preferences: {
        theme: 'auto' as const,
        notifications: true,
        language: 'en',
      },
    };

    const user = await createUser(env, userData);

    // Create session
    const userAgent = request.headers.get('User-Agent') || '';
    const sessionToken = await createSession(env, user.id, clientIP, userAgent, false);

    // Log successful registration
    await logActivity(env, user.id, 'user_registered', {
      email: user.email,
      name: user.name,
    }, request);

    return createSuccessResponse({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      sessionToken,
      expiresIn: 24 * 60 * 60, // 1 day
    }, 'Registration successful', 201);

  } catch (error) {
    console.error('Registration error:', error);
    await logActivity(env, 'unknown', 'register_error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    }, request);
    return createErrorResponse('Registration failed', 500);
  }
}

async function handleLogout(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                        request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];

    if (sessionToken) {
      await invalidateSession(env, sessionToken);
    }

    await logActivity(env, 'unknown', 'user_logout', { sessionToken: !!sessionToken }, request);

    return createSuccessResponse(null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return createErrorResponse('Logout failed', 500);
  }
}

// ============================================================================
// PROGRESS HANDLERS
// ============================================================================

async function handleGetProgress(env: Env, request: Request): Promise<Response> {
  try {
    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};

    const statistics = getProgressStatistics(progress);

    return createSuccessResponse({
      progress,
      statistics,
      taskStructure: TASK_STRUCTURE,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return createErrorResponse('Failed to retrieve progress', 500);
  }
}

async function handleUpdateProgress(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    // Rate limiting
    const rateLimitResult = await checkRateLimit(env, clientIP, 'api', RATE_LIMITS.API);
    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.resetTime, retryAfter);
    }

    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const data = await extractRequestData(request);
    const { week, task, checked, subtask, subtask_checked, csrf_token, time_spent, difficulty, notes } = data;

    // Validate required fields
    if (!week || (!task && !subtask) || !csrf_token) {
      return createErrorResponse('Missing required fields', 400);
    }

    // Validate CSRF token
    if (!(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    // Validate task identifiers
    const validation = validateTaskIdentifiers(week, task);
    if (!validation.valid) {
      return createErrorResponse(validation.errors?.join(', ') || 'Invalid task identifiers', 400);
    }

    // Get current progress
    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    let progress: Progress = progressData ? JSON.parse(progressData) : {};

    if (!progress[week]) progress[week] = {};

    if (task) {
      if (!progress[week][task]) progress[week][task] = { completed: false };
      
      progress[week][task].completed = checked === 'true' || checked === true;
      progress[week][task].completedAt = new Date().toISOString();
      
      if (time_spent) progress[week][task].timeSpent = parseInt(time_spent);
      if (difficulty) progress[week][task].difficulty = parseInt(difficulty) as 1 | 2 | 3 | 4 | 5;
      if (notes) progress[week][task].notes = sanitizeInput(notes);
      
      // Increment attempts
      progress[week][task].attempts = (progress[week][task].attempts || 0) + 1;
    }

    if (subtask && task) {
      if (!progress[week][task]) progress[week][task] = { completed: false, subtasks: {} };
      if (!progress[week][task].subtasks) progress[week][task].subtasks = {};
      
      progress[week][task].subtasks![subtask] = {
        completed: subtask_checked === 'true' || subtask_checked === true,
        completedAt: new Date().toISOString(),
        notes: notes ? sanitizeInput(notes) : undefined,
      };
    }

    // Save progress
    await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify(progress));

    // Update lab progress and user statistics
    await updateLabProgress(env, user, 'current', progress);

    // Update user streak
    await updateUserStreak(env, user);

    // Log activity
    await logActivity(env, user.id, 'progress_updated', {
      week,
      task,
      subtask,
      checked: task ? checked : undefined,
      subtask_checked: subtask ? subtask_checked : undefined,
    }, request);

    const statistics = getProgressStatistics(progress);

    return createSuccessResponse({
      progress,
      statistics,
    }, task ? (checked ? 'Task completed!' : 'Task updated') : 'Subtask updated');

  } catch (error) {
    console.error('Update progress error:', error);
    return createErrorResponse('Failed to update progress', 500);
  }
}

// ============================================================================
// LAB MANAGEMENT HANDLERS
// ============================================================================

async function handleStartNewLab(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const data = await extractRequestData(request);
    const { csrf_token } = data;

    if (!csrf_token || !(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    // Reset progress
    await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify({}));

    // Log activity
    await logActivity(env, user.id, 'lab_started', {}, request);

    return createSuccessResponse(null, 'New lab started successfully');
  } catch (error) {
    console.error('Start new lab error:', error);
    return createErrorResponse('Failed to start new lab', 500);
  }
}

// ============================================================================
// USER PROFILE HANDLERS
// ============================================================================

async function handleGetProfile(env: Env, request: Request): Promise<Response> {
  try {
    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};

    const analytics = getUserAnalytics(user, progress);

    return createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        labHistory: user.labHistory,
        achievements: user.achievements,
        stats: user.stats,
      },
      analytics,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return createErrorResponse('Failed to retrieve profile', 500);
  }
}

async function handleUpdateProfile(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const data = await extractRequestData(request);
    const { name, preferences, csrf_token } = data;

    if (!csrf_token || !(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    const updatedUser = { ...user };

    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return createErrorResponse(nameValidation.errors?.join(', ') || 'Invalid name', 400);
      }
      updatedUser.name = sanitizeInput(name);
    }

    if (preferences) {
      updatedUser.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    await env.USERS.put(`user:${user.email.toLowerCase()}`, JSON.stringify(updatedUser));

    await logActivity(env, user.id, 'profile_updated', { name, preferences }, request);

    return createSuccessResponse({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        preferences: updatedUser.preferences,
      },
    }, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return createErrorResponse('Failed to update profile', 500);
  }
}

// ============================================================================
// ANALYTICS HANDLERS
// ============================================================================

async function handleGetAnalytics(env: Env, request: Request): Promise<Response> {
  try {
    const user = await requireAuth(env, request);
    if (user instanceof Response) return user;

    const progressData = await env.PROGRESS.get(`progress:${user.id}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};

    const analytics = getUserAnalytics(user, progress);

    return createSuccessResponse(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    return createErrorResponse('Failed to retrieve analytics', 500);
  }
}

// ============================================================================
// ADMIN HANDLERS
// ============================================================================

async function handleAdminUsersProgress(env: Env, request: Request): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const users = [];
    const userKeys = await env.USERS.list({ prefix: 'user:' });

    for (const key of userKeys.keys) {
      try {
        const userData = await env.USERS.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress: Progress = progressData ? JSON.parse(progressData) : {};
          
          const statistics = getProgressStatistics(progress);
          
          users.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            progress: statistics.progressPercentage,
            completedTasks: statistics.completedTasks,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            timeSpent: statistics.timeSpent,
            averageScore: user.stats?.averageScore || 0,
            achievements: user.achievements?.length || 0,
            streakDays: user.stats?.streakDays || 0,
          });
        }
      } catch (error) {
        console.error(`Error processing user ${key.name}:`, error);
        continue;
      }
    }

    // Sort by progress descending
    users.sort((a, b) => b.progress - a.progress);

    await logActivity(env, admin.id, 'admin_users_progress_viewed', { userCount: users.length }, request);

    return createSuccessResponse(users);
  } catch (error) {
    console.error('Admin users progress error:', error);
    return createErrorResponse('Failed to retrieve users progress', 500);
  }
}

async function handleAdminUpdateRole(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const data = await extractRequestData(request);
    const { email, role, csrf_token } = data;

    if (!email || !role || !csrf_token || !['user', 'admin'].includes(role)) {
      return createErrorResponse('Invalid request parameters', 400);
    }

    if (!(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    const user = await getUserByEmail(env, email);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    // Prevent self-demotion
    if (user.id === admin.id && role !== 'admin') {
      return createErrorResponse('Cannot demote yourself', 400);
    }

    const updatedUser: User = { ...user, role: role as 'user' | 'admin' };
    await env.USERS.put(`user:${email.toLowerCase()}`, JSON.stringify(updatedUser));

    await logActivity(env, admin.id, 'admin_role_updated', {
      targetUser: user.id,
      targetEmail: email,
      oldRole: user.role,
      newRole: role,
    }, request);

    return createSuccessResponse(null, `Role updated for ${email}`);
  } catch (error) {
    console.error('Admin update role error:', error);
    return createErrorResponse('Failed to update role', 500);
  }
}

async function handleAdminResetProgress(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const data = await extractRequestData(request);
    const { email, csrf_token } = data;

    if (!email || !csrf_token) {
      return createErrorResponse('Missing required fields', 400);
    }

    if (!(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    const user = await getUserByEmail(env, email);
    if (!user) {
      return createErrorResponse('User not found', 404);
    }

    await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify({}));

    await logActivity(env, admin.id, 'admin_progress_reset', {
      targetUser: user.id,
      targetEmail: email,
    }, request);

    return createSuccessResponse(null, `Progress reset for ${email}`);
  } catch (error) {
    console.error('Admin reset progress error:', error);
    return createErrorResponse('Failed to reset progress', 500);
  }
}

async function handleAdminExportProgress(env: Env, request: Request): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const users = [];
    const userKeys = await env.USERS.list({ prefix: 'user:' });

    for (const key of userKeys.keys) {
      try {
        const userData = await env.USERS.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress: Progress = progressData ? JSON.parse(progressData) : {};
          
          const statistics = getProgressStatistics(progress);
          
          users.push({
            name: user.name,
            email: user.email,
            role: user.role,
            progress: statistics.progressPercentage,
            completedTasks: statistics.completedTasks,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            totalTimeSpent: statistics.timeSpent,
            averageScore: user.stats?.averageScore || 0,
          });
        }
      } catch (error) {
        console.error(`Error processing user ${key.name}:`, error);
        continue;
      }
    }

    const csv = generateProgressCSV(users);

    await logActivity(env, admin.id, 'admin_progress_exported', { userCount: users.length }, request);

    return createSuccessResponse({ csv }, 'Progress data exported successfully');
  } catch (error) {
    console.error('Admin export progress error:', error);
    return createErrorResponse('Failed to export progress', 500);
  }
}

async function handleAdminImportProgress(env: Env, request: Request, clientIP: string): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const data = await extractRequestData(request);
    const { csv, csrf_token } = data;

    if (!csv || !csrf_token) {
      return createErrorResponse('Missing required fields', 400);
    }

    if (!(await validateCSRFToken(env, csrf_token))) {
      return createErrorResponse('Invalid CSRF token', 403);
    }

    const progressData = parseProgressCSV(csv);
    let updatedCount = 0;
    let errorCount = 0;

    for (const { email, progress } of progressData) {
      try {
        const user = await getUserByEmail(env, email);
        if (user) {
          await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify(progress));
          await updateLabProgress(env, user, 'imported', progress);
          updatedCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Error importing progress for ${email}:`, error);
        errorCount++;
      }
    }

    await logActivity(env, admin.id, 'admin_progress_imported', {
      totalEntries: progressData.length,
      updatedCount,
      errorCount,
    }, request);

    return createSuccessResponse({
      imported: updatedCount,
      errors: errorCount,
      total: progressData.length,
    }, `Progress data imported: ${updatedCount} updated, ${errorCount} errors`);

  } catch (error) {
    console.error('Admin import progress error:', error);
    return createErrorResponse('Failed to import progress', 500);
  }
}

async function handleAdminAnalytics(env: Env, request: Request): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const users = [];
    const userKeys = await env.USERS.list({ prefix: 'user:' });

    let totalUsers = 0;
    let activeUsers = 0;
    let completedLabs = 0;
    let totalProgress = 0;
    let totalTimeSpent = 0;
    const registrationsByMonth: Record<string, number> = {};
    const progressDistribution = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
    const roleDistribution = { user: 0, admin: 0 };

    for (const key of userKeys.keys) {
      try {
        const userData = await env.USERS.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress: Progress = progressData ? JSON.parse(progressData) : {};
          
          const statistics = getProgressStatistics(progress);
          
          totalUsers++;
          totalProgress += statistics.progressPercentage;
          totalTimeSpent += statistics.timeSpent;
          roleDistribution[user.role]++;

          // Check if user was active in last 30 days
          if (user.lastLogin) {
            const lastLogin = new Date(user.lastLogin);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            if (lastLogin > thirtyDaysAgo) {
              activeUsers++;
            }
          }

          // Count completed labs
          if (statistics.progressPercentage === 100) {
            completedLabs++;
          }

          // Progress distribution
          if (statistics.progressPercentage <= 25) progressDistribution['0-25']++;
          else if (statistics.progressPercentage <= 50) progressDistribution['26-50']++;
          else if (statistics.progressPercentage <= 75) progressDistribution['51-75']++;
          else progressDistribution['76-100']++;

          // Registration by month
          if (user.createdAt) {
            const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
            registrationsByMonth[month] = (registrationsByMonth[month] || 0) + 1;
          }

          users.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            progress: statistics.progressPercentage,
            completedTasks: statistics.completedTasks,
            timeSpent: statistics.timeSpent,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            achievements: user.achievements?.length || 0,
            streakDays: user.stats?.streakDays || 0,
          });
        }
      } catch (error) {
        console.error(`Error processing user ${key.name}:`, error);
        continue;
      }
    }

    const analytics = {
      overview: {
        totalUsers,
        activeUsers,
        completedLabs,
        averageProgress: totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0,
        totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to hours
        completionRate: totalUsers > 0 ? Math.round((completedLabs / totalUsers) * 100) : 0,
      },
      distributions: {
        progress: progressDistribution,
        roles: roleDistribution,
      },
      trends: {
        registrationsByMonth,
      },
      topPerformers: users
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 10),
      recentActivity: users
        .filter(u => u.lastLogin)
        .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
        .slice(0, 20),
    };

    await logActivity(env, admin.id, 'admin_analytics_viewed', { totalUsers }, request);

    return createSuccessResponse(analytics);
  } catch (error) {
    console.error('Admin analytics error:', error);
    return createErrorResponse('Failed to retrieve analytics', 500);
  }
}

async function handleAdminGetUsers(env: Env, request: Request): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const search = url.searchParams.get('search')?.toLowerCase();
    const role = url.searchParams.get('role');

    const users = [];
    const userKeys = await env.USERS.list({ prefix: 'user:' });

    for (const key of userKeys.keys) {
      try {
        const userData = await env.USERS.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          
          // Apply filters
          if (search && !user.name.toLowerCase().includes(search) && !user.email.toLowerCase().includes(search)) {
            continue;
          }
          
          if (role && user.role !== role) {
            continue;
          }

          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress: Progress = progressData ? JSON.parse(progressData) : {};
          const statistics = getProgressStatistics(progress);
          
          users.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            lastActive: user.lastActive,
            progress: statistics.progressPercentage,
            completedTasks: statistics.completedTasks,
            timeSpent: statistics.timeSpent,
            achievements: user.achievements?.length || 0,
            streakDays: user.stats?.streakDays || 0,
            loginAttempts: user.loginAttempts || 0,
            isLocked: isAccountLocked(user),
          });
        }
      } catch (error) {
        console.error(`Error processing user ${key.name}:`, error);
        continue;
      }
    }

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    await logActivity(env, admin.id, 'admin_users_viewed', {
      page,
      limit,
      search,
      role,
      total,
      returned: paginatedUsers.length,
    }, request);

    return createSuccessResponse({
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    return createErrorResponse('Failed to retrieve users', 500);
  }
}

async function handleAdminSecurityEvents(env: Env, request: Request): Promise<Response> {
  try {
    const admin = await requireAdmin(env, request);
    if (admin instanceof Response) return admin;

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 500);
    const type = url.searchParams.get('type');

    const events = [];
    const eventKeys = await env.SESSIONS.list({ prefix: 'security:' });

    for (const key of eventKeys.keys) {
      try {
        const eventData = await env.SESSIONS.get(key.name);
        if (eventData) {
          const event = JSON.parse(eventData);
          
          // Apply type filter
          if (type && event.type !== type) {
            continue;
          }
          
          events.push(event);
        }
      } catch (error) {
        console.error(`Error processing event ${key.name}:`, error);
        continue;
      }
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit results
    const limitedEvents = events.slice(0, limit);

    await logActivity(env, admin.id, 'admin_security_events_viewed', {
      type,
      limit,
      total: events.length,
      returned: limitedEvents.length,
    }, request);

    return createSuccessResponse({
      events: limitedEvents,
      total: events.length,
      types: [...new Set(events.map(e => e.type))],
    });
  } catch (error) {
    console.error('Admin security events error:', error);
    return createErrorResponse('Failed to retrieve security events', 500);
  }
}

// ============================================================================
// HEALTH CHECK HANDLER
// ============================================================================

async function handleHealthCheck(env: Env): Promise<Response> {
  try {
    const healthResult = await performHealthCheck(env);
    
    const status = healthResult.status === 'healthy' ? 200 : 
                   healthResult.status === 'degraded' ? 200 : 503;

    return new Response(JSON.stringify({
      status: healthResult.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      checks: healthResult.checks,
      uptime: process.uptime ? Math.floor(process.uptime()) : 'unknown',
    }), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new Response(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...CORS_HEADERS,
      },
    });
  }
}