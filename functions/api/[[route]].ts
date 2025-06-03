// functions/api/[[route]].ts
import {
  jsonResponse,
  errorResponse,
  validateSession,
  getUserById,
  getUserByEmail,
  createSession,
  updateLastLogin,
  validateEmail,
  validatePassword,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  checkRateLimit,
  logActivity,
  getCurrentLabProgress,
  calculateProgress,
  calculateCompletedTasks,
  startNewLab,
  TASK_STRUCTURE,
  TOTAL_TASKS,
  type Env,
  type User,
  type Progress
} from '../utils';

// GET handler
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === '/api/csrf') {
      const token = await generateCSRFToken(env);
      return new Response(JSON.stringify({ 
        token,
        expiresIn: 3600
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
      });
    }

    if (path === '/api/profile') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);

      const user = await getUserById(env, userId);
      if (!user) return errorResponse('User not found', 404);

      const progress = await getCurrentLabProgress(env, userId);
      const progressPercent = calculateProgress(progress);
      const completedTasks = calculateCompletedTasks(progress);

      return jsonResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        progress: progressPercent,
        completedTasks,
        totalTasks: TOTAL_TASKS,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      });
    }

    if (path === '/api/progress') {
      const userId = await validateSession(env, request);
      if (!userId) {
        console.error('Progress request failed: No valid session', { cookies: request.headers.get('Cookie') });
        return errorResponse('Unauthorized', 401);
      }

      const progress = await getCurrentLabProgress(env, userId);
      const completedTasks = calculateCompletedTasks(progress);
      const progressPercentage = calculateProgress(progress);

      return jsonResponse({
        ...progress,
        totalTasks: TOTAL_TASKS,
        completedTasks,
        progressPercentage
      });
    }

    if (path.startsWith('/api/admin/')) {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);

      const user = await getUserById(env, userId);
      if (!user || user.role !== 'admin') return errorResponse('Admin access required', 403);

      if (path === '/api/admin/stats') {
        const users = await env.USERS.list({ prefix: 'user:' });
        let totalUsers = 0;
        let completedUsers = 0;
        let totalProgress = 0;

        for (const { name: userKey } of users.keys) {
          const userData = await env.USERS.get(userKey);
          if (!userData) continue;

          totalUsers++;
          const progressData = await env.PROGRESS.get(`progress:${JSON.parse(userData).id}`);
          const progress = progressData ? JSON.parse(progressData) : {};
          const progressPercent = calculateProgress(progress);
          totalProgress += progressPercent;

          if (progressPercent === 100) completedUsers++;
        }

        return jsonResponse({
          totalUsers,
          completedUsers,
          averageProgress: totalUsers > 0 ? Math.round(totalProgress / totalUsers) : 0,
          completionRate: totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 0
        });
      }

      if (path === '/api/admin/users-progress') {
        const usersProgress = [];
        const users = await env.USERS.list({ prefix: 'user:' });

        for (const { name: userKey } of users.keys) {
          const userData = await env.USERS.get(userKey);
          if (!userData) continue;

          const user = JSON.parse(userData) as User;
          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress = progressData ? JSON.parse(progressData) : {};
          const completedTasks = calculateCompletedTasks(progress);
          const progressPercent = calculateProgress(progress);

          usersProgress.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            progress: progressPercent,
            completedTasks,
            totalTasks: TOTAL_TASKS,
            lastActivity: user.lastLogin || user.createdAt
          });
        }

        return jsonResponse(usersProgress.sort((a, b) => b.progress - a.progress));
      }
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('API GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST handler
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const isLocal = request.url.includes('localhost');

  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await checkRateLimit(env, ip, 30))) {
      return errorResponse('Too many requests', 429);
    }

    if (path === '/api/login') {
      const formData = await request.formData();
      const email = formData.get('email')?.toString().trim().toLowerCase() || '';
      const password = formData.get('password')?.toString() || '';
      const remember = formData.get('remember') === 'on';
      const csrfToken = formData.get('csrf_token')?.toString() || '';

      if (!email || !password || !csrfToken) {
        return errorResponse('Missing required fields', 400);
      }

      if (!validateEmail(email)) {
        return errorResponse('Invalid email address', 400);
      }

      if (!(await validateCSRFToken(env, csrfToken))) {
        return errorResponse('Invalid CSRF token', 403);
      }

      const user = await getUserByEmail(env, email);
      if (!user || user.password !== password) {
        await logActivity(env, 'unknown', 'login_failed', { email, ip });
        return errorResponse('Invalid email or password', 401);
      }

      await updateLastLogin(env, user);
      const sessionDuration = remember ? 86400 * 30 : 86400;
      const sessionToken = crypto.randomUUID();
      await env.SESSIONS.put(`session:${sessionToken}`, user.id, { expirationTtl: sessionDuration });

      await logActivity(env, user.id, 'login_successful', { email, remember, ip });

      return new Response(JSON.stringify({
        success: true,
        name: user.name,
        role: user.role,
        message: 'Login successful'
      }), {
        status: 200,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${sessionDuration}; SameSite=Strict${isLocal ? '' : '; Secure'}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/register') {
      const formData = await request.formData();
      const name = sanitizeInput(formData.get('name')?.toString().trim() || '');
      const email = formData.get('email')?.toString().trim().toLowerCase() || '';
      const password = formData.get('password')?.toString() || '';
      const csrfToken = formData.get('csrf_token')?.toString() || '';

      if (!name || !email || !password || !csrfToken) {
        return errorResponse('Missing required fields', 400);
      }

      if (name.length < 2 || !validateEmail(email)) {
        return errorResponse('Invalid name or email', 400);
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return errorResponse(passwordValidation.message!, 400);
      }

      if (!(await validateCSRFToken(env, csrfToken))) {
        return errorResponse('Invalid CSRF token', 403);
      }

      if (await getUserByEmail(env, email)) {
        return errorResponse('Email already registered', 409);
      }

      const userId = crypto.randomUUID();
      const userData: User = {
        id: userId,
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      };

      await env.USERS.put(`user:${email}`, JSON.stringify(userData));
      const sessionToken = await createSession(env, userId);

      await logActivity(env, userId, 'user_registered', { email });

      return new Response(JSON.stringify({
        success: true,
        name: userData.name,
        role: userData.role,
        message: 'Registration successful'
      }), {
        status: 201,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict${isLocal ? '' : '; Secure'}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/logout') {
      const cookies = request.headers.get('Cookie');
      const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];

      if (sessionToken) {
        const userId = await validateSession(env, request);
        if (userId) {
          await logActivity(env, userId, 'logout', { ip });
        }
        await env.SESSIONS.delete(`session:${sessionToken}`);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${isLocal ? '' : '; Secure'}`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/progress') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);

      const formData = await request.formData();
      const task = formData.get('task') as string;
      const week = formData.get('week') as string;
      const checked = formData.get('checked') as string;
      const subtask = formData.get('subtask') as string;
      const subtask_checked = formData.get('subtask_checked') as string;

      if (!task || !week) {
        return errorResponse('Task and week required', 400);
      }

      let progress = await getCurrentLabProgress(env, userId);
      if (!progress[week]) progress[week] = {};
      if (!progress[week][task]) progress[week][task] = { completed: false, subtasks: {} };

      const taskData = progress[week][task];

      if (subtask !== null && subtask !== undefined && subtask !== '') {
        if (!taskData.subtasks) taskData.subtasks = {};
        taskData.subtasks[subtask] = subtask_checked === 'true';
      }

      if (checked !== null && checked !== undefined && checked !== '') {
        taskData.completed = checked === 'true';
        if (taskData.completed) {
          taskData.completedAt = new Date().toISOString();
        }
      }

      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));

      const completedTasks = calculateCompletedTasks(progress);
      const progressPercentage = calculateProgress(progress);

      await logActivity(env, userId, 'progress_updated', {
        task: `${week}-${task}`,
        completed: taskData.completed,
        completedTasks,
        progressPercentage
      });

      return jsonResponse({
        completedTasks,
        totalTasks: TOTAL_TASKS,
        progressPercentage
      });
    }

    if (path === '/api/lab/start-new') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);

      const labId = await startNewLab(env, userId);
      await logActivity(env, userId, 'lab_started', { labId });

      return jsonResponse({ labId, totalTasks: TOTAL_TASKS });
    }

    if (path.startsWith('/api/admin/')) {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);

      const user = await getUserById(env, userId);
      if (!user || user.role !== 'admin') return errorResponse('Admin access required', 403);

      if (path === '/api/admin/change-user-password') {
        const formData = await request.formData();
        const email = formData.get('email')?.toString().toLowerCase();
        const newPassword = formData.get('newPassword')?.toString();

        if (!email || !newPassword || newPassword.length < 8) {
          return errorResponse('Invalid email or password', 400);
        }

        const targetUser = await getUserByEmail(env, email);
        if (!targetUser) return errorResponse('User not found', 404);

        targetUser.password = newPassword;
        await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));

        await logActivity(env, userId, 'admin_password_changed', { target: email });
        return jsonResponse({ message: 'Password updated' });
      }

      if (path === '/api/admin/change-user-role') {
        const formData = await request.formData();
        const email = formData.get('email')?.toString().toLowerCase();
        const newRole = formData.get('role')?.toString();

        if (!email || !newRole || !['admin', 'user'].includes(newRole)) {
          return errorResponse('Invalid email or role', 400);
        }

        if (email === user.email && newRole === 'user') {
          return errorResponse('Cannot demote yourself', 400);
        }

        const targetUser = await getUserByEmail(env, email);
        if (!targetUser) return errorResponse('User not found', 404);

        targetUser.role = newRole as 'admin' | 'user';
        await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));

        await logActivity(env, userId, 'admin_role_changed', { target: email, newRole });
        return jsonResponse({ message: 'Role updated' });
      }
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('API POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};