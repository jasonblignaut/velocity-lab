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
  TASK_STRUCTURE,
  calculateProgress,
  calculateCompletedTasks,
  generateProgressCSV,
  parseProgressCSV,
} from '../utils';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

interface Progress {
  [week: string]: {
    [task: string]: {
      completed: boolean;
      subtasks?: { [subtask: string]: boolean };
    };
  };
}

const errorResponse = (error: string, status: number) =>
  new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });

export const onRequest: PagesFunction<{
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
  SESSIONS: KVNamespace;
}> = async ({ request, env }) => {
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
      await logActivity(env, 'unknown', 'csrf_failed', { ip, error: e.message });
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
        return errorResponse('Invalid email or password', 401);
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
      await logActivity(env, 'unknown', 'login_error', { ip, error: e.message });
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
      await logActivity(env, 'unknown', 'register_error', { ip, error: e.message });
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
      await logActivity(env, 'unknown', 'logout_error', { ip, error: e.message });
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
      
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'progress_get_error', { ip, error: e.message });
      return errorResponse('Server error', 500);
    }
  }

  // Update Progress Endpoint
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
      
      if (task && !TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].includes(task)) {
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
      }
      
      if (subtask) {
        if (!progress[week][task]) {
          progress[week][task] = { completed: false, subtasks: {} };
        }
        if (!progress[week][task].subtasks) {
          progress[week][task].subtasks = {};
        }
        progress[week][task].subtasks![subtask] = subtask_checked;
      }

      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
      await logActivity(env, userId, 'progress_updated', { week, task, subtask, ip });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'progress_post_error', { ip, error: e.message });
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

      // Reset progress to empty object
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify({}));
      await logActivity(env, userId, 'lab_started', { ip });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'lab_start_error', { ip, error: e.message });
      return errorResponse('Server error', 500);
    }
  }

  // Admin - Get Users Progress Leaderboard
  if (path === '/api/admin/users-progress' && request.method === 'GET') {
    try {
      const userId = await validateSession(env, request);
      if (!userId) {
        return errorResponse('Unauthorized', 401);
      }

      const currentUser = await getUserById(env, userId);
      if (!currentUser || currentUser.role !== 'admin') {
        await logActivity(env, userId, 'admin_access_denied', { ip });
        return errorResponse('Forbidden', 403);
      }

      const users = [];
      const userKeys = await env.USERS.list();
      
      for (const key of userKeys.keys) {
        try {
          const userData = await env.USERS.get(key.name);
          if (userData) {
            const user: User = JSON.parse(userData);
            const progressData = await env.PROGRESS.get(`progress:${user.id}`);
            const progress: Progress = progressData ? JSON.parse(progressData) : {};
            
            users.push({
              name: user.name,
              email: user.email,
              role: user.role,
              progress: calculateProgress(progress),
              completedTasks: calculateCompletedTasks(progress),
              lastLogin: user.lastLogin,
            });
          }
        } catch (e) {
          await logActivity(env, userId, 'user_progress_error', { ip, key: key.name, error: e.message });
          continue;
        }
      }

      // Sort by progress descending
      users.sort((a, b) => b.progress - a.progress);
      await logActivity(env, userId, 'admin_users_progress', { ip });
      
      return new Response(JSON.stringify({ success: true, data: users }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'admin_users_progress_error', { ip, error: e.message });
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
        return errorResponse('Forbidden', 403);
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

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'role_update_error', { ip, error: e.message });
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
        return errorResponse('Forbidden', 403);
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

      // Reset user's progress to empty
      await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify({}));
      await logActivity(env, userId, 'progress_reset', { email, ip });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'reset_progress_error', { ip, error: e.message });
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
        return errorResponse('Forbidden', 403);
      }

      const users = [];
      const userKeys = await env.USERS.list();
      
      for (const key of userKeys.keys) {
        try {
          const userData = await env.USERS.get(key.name);
          if (userData) {
            const user: User = JSON.parse(userData);
            const progressData = await env.PROGRESS.get(`progress:${user.id}`);
            const progress: Progress = progressData ? JSON.parse(progressData) : {};
            
            users.push({
              name: user.name,
              email: user.email,
              role: user.role,
              progress: calculateProgress(progress),
              completedTasks: calculateCompletedTasks(progress),
              lastLogin: user.lastLogin,
            });
          }
        } catch (e) {
          await logActivity(env, userId, 'export_user_error', { ip, key: key.name, error: e.message });
          continue;
        }
      }

      const csv = generateProgressCSV(users);
      await logActivity(env, userId, 'progress_exported', { ip });

      return new Response(JSON.stringify({ success: true, csv }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'export_error', { ip, error: e.message });
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
        return errorResponse('Forbidden', 403);
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
      
      return new Response(JSON.stringify({ success: true, importedCount }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    } catch (e) {
      await logActivity(env, 'unknown', 'import_error', { ip, error: e.message });
      return errorResponse('Server error', 500);
    }
  }

  // 404 - Route not found
  return errorResponse('Not found', 404);
};