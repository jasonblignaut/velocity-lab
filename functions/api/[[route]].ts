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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path === '/api/csrf') {
      const token = await generateCSRFToken(env);
      return jsonResponse({ token, expiresIn: 3600 });
    }

    if (path === '/api/profile') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);
      const user = await getUserById(env, userId);
      if (!user) return errorResponse('User not found', 404);
      const progress = await getCurrentLabProgress(env, userId);
      return jsonResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        progress: calculateProgress(progress),
        completedTasks: calculateCompletedTasks(progress),
        totalTasks: TOTAL_TASKS,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      });
    }

    if (path === '/api/progress') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);
      const progress = await getCurrentLabProgress(env, userId);
      return jsonResponse({
        ...progress,
        totalTasks: TOTAL_TASKS,
        completedTasks: calculateCompletedTasks(progress),
        progressPercentage: calculateProgress(progress)
      });
    }

    if (path.startsWith('/api/admin/')) {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);
      const user = await getUserById(env, userId);
      if (!user || user.role !== 'admin') return errorResponse('Admin access required', 403);

      if (path === '/api/admin/stats') {
        const users = await env.USERS.list({ prefix: 'user:' });
        let totalUsers = 0, completedUsers = 0, totalProgress = 0;
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
          usersProgress.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            progress: calculateProgress(progress),
            completedTasks: calculateCompletedTasks(progress),
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await checkRateLimit(env, ip, 50))) { // Increased limit to 50
      return errorResponse('Too many requests', 429);
    }

    if (path === '/api/login') {
      const data = await request.json();
      const { email, password, remember, csrf_token } = data;
      if (!email || !password || !csrf_token) return errorResponse('Missing required fields', 400);
      if (!validateEmail(email)) return errorResponse('Invalid email address', 400);
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
      await logActivity(env, user.id, 'login_successful', { email, remember, ip });

      return new Response(JSON.stringify({
        success: true,
        name: user.name,
        role: user.role,
        sessionToken
      }), {
        status: 200,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=${remember ? 86400 * 30 : 86400}; SameSite=Strict; Secure`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/register') {
      const data = await request.json();
      const { name, email, password, csrf_token } = data;
      if (!name || !email || !password || !csrf_token) return errorResponse('Missing required fields', 400);
      if (name.length < 2 || !validateEmail(email)) return errorResponse('Invalid name or email', 400);
      if (!validatePassword(password).valid) return errorResponse('Password must be at least 8 characters', 400);
      if (!(await validateCSRFToken(env, csrf_token))) {
        await logActivity(env, 'unknown', 'register_failed_csrf', { email, ip });
        return errorResponse('Invalid CSRF token', 403);
      }

      if (await getUserByEmail(env, email)) return errorResponse('Email already registered', 409);

      const userId = crypto.randomUUID();
      const userData: User = {
        id: userId,
        name: sanitizeInput(name),
        email: email.toLowerCase(),
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
        sessionToken
      }), {
        status: 201,
        headers: {
          'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/logout') {
      const sessionToken = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
      if (sessionToken) {
        const userId = await validateSession(env, request);
        if (userId) await logActivity(env, userId, 'logout', { ip });
        await env.SESSIONS.delete(`session:${sessionToken}`);
      }
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
          'Content-Type': 'application/json'
        }
      });
    }

    if (path === '/api/progress') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);
      const { task, week, checked, subtask, subtask_checked, csrf_token } = await request.json();
      if (!task || !week || !csrf_token) return errorResponse('Task, week, and CSRF token required', 400);
      if (!(await validateCSRFToken(env, csrf_token))) return errorResponse('Invalid CSRF token', 403);

      let progress = await getCurrentLabProgress(env, userId);
      if (!progress[week]) progress[week] = {};
      if (!progress[week][task]) progress[week][task] = { completed: false, subtasks: {} };

      const taskData = progress[week][task];
      if (subtask) {
        if (!taskData.subtasks) taskData.subtasks = {};
        taskData.subtasks[subtask] = subtask_checked === true;
      }
      if (checked !== undefined) {
        taskData.completed = checked === true;
        if (taskData.completed) taskData.completedAt = new Date().toISOString();
      }

      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
      await logActivity(env, userId, 'progress_updated', {
        task: `${week}-${task}`,
        completed: taskData.completed,
        completedTasks: calculateCompletedTasks(progress),
        progressPercentage: calculateProgress(progress)
      });

      return jsonResponse({
        completedTasks: calculateCompletedTasks(progress),
        totalTasks: TOTAL_TASKS,
        progressPercentage: calculateProgress(progress)
      });
    }

    if (path === '/api/lab/start-new') {
      const userId = await validateSession(env, request);
      if (!userId) return errorResponse('Unauthorized', 401);
      const { csrf_token } = await request.json();
      if (!csrf_token) return errorResponse('CSRF token required', 400);
      if (!(await validateCSRFToken(env, csrf_token))) return errorResponse('Invalid CSRF token', 403);
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
        const { email, newPassword, csrf_token } = await request.json();
        if (!email || !newPassword || newPassword.length < 8 || !csrf_token) return errorResponse('Invalid email, password, or CSRF token', 400);
        if (!(await validateCSRFToken(env, csrf_token))) return errorResponse('Invalid CSRF token', 403);
        const targetUser = await getUserByEmail(env, email);
        if (!targetUser) return errorResponse('User not found', 404);
        targetUser.password = newPassword;
        await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
        await logActivity(env, userId, 'admin_password_changed', { target: email });
        return jsonResponse({ message: 'Password updated' });
      }

      if (path === '/api/admin/change-user-role') {
        const { email, role, csrf_token } = await request.json();
        if (!email || !role || !['admin', 'user'].includes(role) || !csrf_token) return errorResponse('Invalid email, role, or CSRF token', 400);
        if (!(await validateCSRFToken(env, csrf_token))) return errorResponse('Invalid CSRF token', 403);
        if (email === user.email && role === 'user') return errorResponse('Cannot demote yourself', 400);
        const targetUser = await getUserByEmail(env, email);
        if (!targetUser) return errorResponse('User not found', 404);
        targetUser.role = role as 'admin' | 'user';
        await env.USERS.put(`user:${email}`, JSON.stringify(targetUser));
        await logActivity(env, userId, 'admin_role_changed', { target: email, newRole: role });
        return jsonResponse({ message: 'Role updated' });
      }
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('API POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};