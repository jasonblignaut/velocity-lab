import {
  validateEmail,
  validatePassword,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  createSession,
  validateSession,
  getUserByEmail,
  getUserById,
  updateLastLogin,
  logActivity,
  startNewLab,
  updateLabProgress,
  getLabHistory,
  TASK_STRUCTURE,
  calculateProgress,
  calculateCompletedTasks,
  generateProgressCSV,
  parseProgressCSV,
  batchProcessUsers,
  isValidTask,
  type User,
  type Progress,
  type Env,
} from '../utils';

const jsonResponse = (data: any, status = 200) =>
  new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

const errorResponse = (error: string, status: number) =>
  new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const path = url.pathname;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

  // CORS Options Handler
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // CSRF Token Endpoint
  if (path === '/api/csrf' && request.method === 'GET') {
    try {
      const token = await generateCSRFToken(env);
      return new Response(JSON.stringify({ success: true, token, expiresIn: 3600 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
    } catch (e) {
      await logActivity(env, 'unknown', 'register_error', { ip, error: (e as Error).message });
      return errorResponse('Registration failed', 500);
    }
  }

  // Logout Endpoint
  if (path === '/api/logout' && request.method === 'POST') {
    try {
      const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                          request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
      
      if (sessionToken) {
        await env.SESSIONS.delete(`session:${sessionToken}`);
      }
      
      await logActivity(env, 'unknown', 'logout', { ip });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'logout_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Get Progress Endpoint
  if (path === '/api/progress' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }
      
      const progressData = await env.PROGRESS.get(`progress:${userId}`);
      const data: Progress = progressData ? JSON.parse(progressData) : {};
      
      return jsonResponse(data);
    } catch (e) {
      await logActivity(env, 'unknown', 'progress_get_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Update Progress Endpoint with Auto-tick Support
  if (path === '/api/progress' && request.method === 'POST') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      let week, task, checked, subtask, subtask_checked, csrf_token;
      const contentType = request.headers.get('Content-Type') || '';
      
      if (contentType.includes('form-data')) {
        const formData = await request.formData();
        week = formData.get('week')?.toString();
        task = formData.get('task')?.toString();
        checked = formData.get('checked')?.toString() === 'true';
        subtask = formData.get('subtask')?.toString();
        subtask_checked = formData.get('subtask_checked')?.toString() === 'true';
        csrf_token = formData.get('csrf_token')?.toString();
      } else {
        const data = await request.json();
        ({ week, task, checked, subtask, subtask_checked, csrf_token } = data);
      }

      if (!week || (!task && !subtask) || !csrf_token) {
        return errorResponse('Missing required fields', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, userId, 'progress_failed_csrf', { week, task, ip });
        return errorResponse('Invalid CSRF token', 403);
      }
      
      if (!TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE]) {
        return errorResponse('Invalid week', 400);
      }
      
      if (task && !isValidTask(week, task)) {
        return errorResponse('Invalid task', 400);
      }

      const progressData = await env.PROGRESS.get(`progress:${userId}`);
      let progress: Progress = progressData ? JSON.parse(progressData) : {};
      
      if (!progress[week]) {
        progress[week] = {};
      }

      if (task) {
        if (!progress[week][task]) {
          progress[week][task] = { completed: false };
        }
        progress[week][task].completed = checked;
        
        if (checked) {
          progress[week][task].completedAt = new Date().toISOString();
        }
      }
      
      if (subtask && task) {
        if (!progress[week][task]) {
          progress[week][task] = { completed: false, subtasks: {} };
        }
        if (!progress[week][task].subtasks) {
          progress[week][task].subtasks = {};
        }
        progress[week][task].subtasks![subtask] = subtask_checked;
      }

      // Save progress
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));

      // Update lab history
      const user = await getUserById(env, userId);
      if (user) {
        await updateLabProgress(env, user, progress);
      }

      await logActivity(env, userId, 'progress_updated', { week, task, subtask, ip });
      
      const completedTasks = calculateCompletedTasks(progress);
      const progressPercentage = calculateProgress(progress);
      
      return jsonResponse({
        completedTasks,
        totalTasks: 42,
        progressPercentage
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'progress_post_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Start New Lab Endpoint
  if (path === '/api/lab/start-new' && request.method === 'POST') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }
      
      const formData = await request.formData();
      const csrf_token = formData.get('csrf_token')?.toString();
      
      if (!csrf_token || !(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, userId, 'lab_start_failed_csrf', { ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      const user = await getUserById(env, userId);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      const { labId } = await startNewLab(env, user);
      await logActivity(env, userId, 'lab_started', { labId, ip });
      
      return jsonResponse({ labId, totalTasks: 42 });
    } catch (e) {
      await logActivity(env, 'unknown', 'lab_start_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Lab History Endpoint
  if (path === '/api/lab/history' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const history = await getLabHistory(env, userId);
      await logActivity(env, userId, 'lab_history_viewed', { ip });
      
      return jsonResponse(history);
    } catch (e) {
      await logActivity(env, 'unknown', 'lab_history_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Get Users Progress Leaderboard (FIXED)
  if (path === '/api/admin/users-progress' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_access_denied', { path, ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      // Use batch processing to avoid timeout issues
      const users = await batchProcessUsers(env, (user: User, progress: Progress) => {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          progress: calculateProgress(progress),
          completedTasks: calculateCompletedTasks(progress),
          totalTasks: 42,
          lastActivity: user.lastLogin || user.createdAt,
          lastLogin: user.lastLogin
        };
      }, 5); // Process 5 users at a time to avoid timeout

      // Sort by progress descending
      users.sort((a, b) => b.progress - a.progress);
      
      await logActivity(env, userId, 'admin_users_progress_success', { 
        userCount: users.length, 
        ip 
      });
      
      return jsonResponse(users);
    } catch (e) {
      console.error('Admin users progress error:', e);
      await logActivity(env, 'unknown', 'admin_users_progress_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Get Dashboard Stats
  if (path === '/api/admin/stats' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_stats_denied', { ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      const users = await batchProcessUsers(env, (user: User, progress: Progress) => {
        const progressPercentage = calculateProgress(progress);
        return {
          progressPercentage,
          isCompleted: progressPercentage === 100
        };
      });

      const totalUsers = users.length;
      const completedUsers = users.filter(u => u.isCompleted).length;
      const totalProgress = users.reduce((sum, u) => sum + u.progressPercentage, 0);
      const averageProgress = totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0;
      const completionRate = totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0;

      await logActivity(env, userId, 'admin_stats_viewed', { totalUsers, ip });

      return jsonResponse({
        totalUsers,
        completedUsers,
        averageProgress,
        completionRate
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'admin_stats_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Update User Role
  if (path === '/api/admin/update-role' && request.method === 'POST') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_role_update_denied', { ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      const formData = await request.formData();
      const email = formData.get('email')?.toString();
      const role = formData.get('role')?.toString() as 'user' | 'admin';
      const csrf_token = formData.get('csrf_token')?.toString();

      if (!email || !role || !csrf_token || !['user', 'admin'].includes(role)) {
        return errorResponse('Invalid request', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, userId, 'role_update_failed_csrf', { email, ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      const user = await getUserByEmail(env, email);
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      if (user.id === userId && role !== 'admin') {
        return errorResponse('Cannot demote yourself', 400);
      }

      user.role = role;
      await env.USERS.put(`user:${email}`, JSON.stringify(user));
      await logActivity(env, userId, 'role_updated', { email, role, ip });

      return jsonResponse({ message: 'Role updated successfully' });
    } catch (e) {
      await logActivity(env, 'unknown', 'role_update_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Reset User Progress
  if (path === '/api/admin/reset-progress' && request.method === 'POST') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_reset_progress_denied', { ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      const formData = await request.formData();
      const email = formData.get('email')?.toString();
      const csrf_token = formData.get('csrf_token')?.toString();

      if (!email || !csrf_token) {
        return errorResponse('Invalid request', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, userId, 'reset_progress_failed_csrf', { email, ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      const user = await getUserByEmail(env, email);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      // Reset user's progress to empty and start new lab
      await startNewLab(env, user);
      await logActivity(env, userId, 'progress_reset', { email, ip });

      return jsonResponse({ message: 'Progress reset successfully' });
    } catch (e) {
      await logActivity(env, 'unknown', 'reset_progress_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Export Progress as CSV
  if (path === '/api/admin/export-progress' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_export_denied', { ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      const users = await batchProcessUsers(env, (user: User, progress: Progress) => {
        return {
          name: user.name,
          email: user.email,
          role: user.role,
          progress: calculateProgress(progress),
          completedTasks: calculateCompletedTasks(progress),
          lastLogin: user.lastLogin,
        };
      });

      const csv = generateProgressCSV(users);
      await logActivity(env, userId, 'progress_exported', { userCount: users.length, ip });

      return jsonResponse({ csv });
    } catch (e) {
      await logActivity(env, 'unknown', 'export_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Import Progress from CSV
  if (path === '/api/admin/import-progress' && request.method === 'POST') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_import_denied', { ip });
        return errorResponse('Access denied - insufficient permissions', 403);
      }

      const formData = await request.formData();
      const csv = formData.get('csv')?.toString();
      const csrf_token = formData.get('csrf_token')?.toString();

      if (!csv || !csrf_token) {
        return errorResponse('Invalid request', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, userId, 'import_failed_csrf', { ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      const progressData = parseProgressCSV(csv);
      let importedCount = 0;
      
      for (const { email, progress } of progressData) {
        const user = await getUserByEmail(env, email);
        if (user) {
          await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify(progress));
          importedCount++;
        }
      }

      await logActivity(env, userId, 'progress_imported', { ip, importedCount });
      
      return jsonResponse({ importedCount });
    } catch (e) {
      await logActivity(env, 'unknown', 'import_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Profile Endpoint
  if (path === '/api/profile' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const user = await getUserById(env, userId);
      if (!user) {
        return errorResponse('User not found', 404);
      }

      const progressData = await env.PROGRESS.get(`progress:${userId}`);
      const progress: Progress = progressData ? JSON.parse(progressData) : {};
      const progressPercent = calculateProgress(progress);
      const completedTasks = calculateCompletedTasks(progress);

      return jsonResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        progress: progressPercent,
        completedTasks,
        totalTasks: 42,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        labHistory: user.labHistory || []
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'profile_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // 404 - Route not found
  return errorResponse('Not found', 404);
};'csrf_failed', { ip, error: e.message });
      return errorResponse('Server error', 500);
    }
  }

  // Login Endpoint
  if (path === '/api/login' && request.method === 'POST') {
    try {
      let email, password, remember, csrf_token;
      const contentType = request.headers.get('Content-Type') || '';
      
      if (contentType.includes('form-data')) {
        const formData = await request.formData();
        email = formData.get('email')?.toString();
        password = formData.get('password')?.toString();
        remember = formData.get('remember') === 'on';
        csrf_token = formData.get('csrf_token')?.toString();
      } else {
        const data = await request.json();
        ({ email, password, remember, csrf_token } = data);
      }

      if (!email || !password || !csrf_token) {
        return errorResponse('Missing required fields', 400);
      }
      
      if (!validateEmail(email)) {
        return errorResponse('Invalid email address', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, 'unknown', 'login_failed_csrf', { email, ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      const user = await getUserByEmail(env, email);
      if (!user || user.password !== password) {
        await logActivity(env, 'unknown', 'login_failed', { email, ip });
        return errorResponse('Invalid credentials or session expired', 401);
      }

      await updateLastLogin(env, user);
      const sessionToken = await createSession(env, user.id, remember);
      await logActivity(env, user.id, 'login_successful', { email, ip });

      return new Response(JSON.stringify({
        success: true,
        name: user.name,
        role: user.role,
        email: user.email,
        sessionToken
      }), {
        status: 200,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${remember ? 86400 * 30 : 86400}; SameSite=Strict; Secure`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'login_error', { ip, error: (e as Error).message });
      return errorResponse('Server error', 500);
    }
  }

  // Register Endpoint
  if (path === '/api/register' && request.method === 'POST') {
    try {
      let name, email, password, csrf_token;
      const contentType = request.headers.get('Content-Type') || '';
      
      if (contentType.includes('form-data')) {
        const formData = await request.formData();
        name = formData.get('name')?.toString();
        email = formData.get('email')?.toString();
        password = formData.get('password')?.toString();
        csrf_token = formData.get('csrf_token')?.toString();
      } else {
        const data = await request.json();
        ({ name, email, password, csrf_token } = data);
      }

      if (!name || !email || !password || !csrf_token) {
        return errorResponse('Missing required fields', 400);
      }
      
      if (name.length < 2 || !validateEmail(email)) {
        return errorResponse('Invalid name or email', 400);
      }
      
      const pwdValidation = validatePassword(password);
      if (!pwdValidation.valid) {
        return errorResponse(pwdValidation.errors?.join(', ') || 'Invalid password', 400);
      }
      
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, 'unknown', 'register_failed_csrf', { email, ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      if (await getUserByEmail(env, email)) {
        return errorResponse('Email already registered', 409);
      }

      const userId = crypto.randomUUID();
      const userData: User = {
        id: userId,
        name: sanitizeInput(name),
        email: email.toLowerCase(),
        password, // Note: In production, hash passwords with bcrypt
        role: 'user',
        createdAt: new Date().toISOString(),
        labHistory: []
      };

      await env.USERS.put(`user:${email}`, JSON.stringify(userData));
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify({})); // Initialize empty progress
      const sessionToken = await createSession(env, userId);
      await logActivity(env, userId, 'user_created', { email, ip });

      return new Response(JSON.stringify({
        success: true,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        sessionToken
      }), {
        status: 201,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (e) {
      await logActivity(env, 'unknown',