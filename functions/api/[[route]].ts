import {
  validateEmail,
  validatePassword,
  sanitizeInput,
  generateCSRFToken,
  validateCSRFToken,
  createSession,
  validateSession,
  getUserByEmail,
  updateLastLogin,
  logActivity,
  TASK_STRUCTURE,
  calculateProgress,
  calculateCompletedTasks,
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

  // Handle CORS preflight
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

  // CSRF Token Generation
  if (path === '/api/csrf' && request.method === 'GET') {
    const token = await generateCSRFToken(env);
    return new Response(JSON.stringify({ success: true, token, expiresIn: 3600 }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Login
  if (path === '/api/login' && request.method === 'POST') {
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
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Register
  if (path === '/api/register' && request.method === 'POST') {
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
      createdAt: new Date().toISOString(),
    };

    await env.USERS.put(`user:${email}`, JSON.stringify(userData));
    const sessionToken = await createSession(env, userId);
    await logActivity(env, userId, 'user_registered', { email, ip });

    return new Response(JSON.stringify({
      success: true,
      name: userData.name,
      role: userData.role,
      sessionToken
    }), {
      status: 201,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Logout
  if (path === '/api/logout' && request.method === 'POST') {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    if (sessionToken) {
      await env.SESSIONS.delete(`session:${sessionToken}`);
    }
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Set-Cookie': 'session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Progress (GET)
  if (path === '/api/progress' && request.method === 'GET') {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) return errorResponse('Unauthorized', 401);

    const userId = await validateSession(env, request);
    if (!userId) return errorResponse('Invalid session', 401);

    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    const data: Progress = progressData ? JSON.parse(progressData) : {};

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Progress (POST)
  if (path === '/api/progress' && request.method === 'POST') {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) return errorResponse('Unauthorized', 401);

    const userId = await validateSession(env, request);
    if (!userId) return errorResponse('Invalid session', 401);

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
    if (!week || (!task && !subtask) || !csrf_token) return errorResponse('Missing required fields', 400);
    if (!(await validateCSRFToken(env, csrf_token))) {
      await logActivity(env, userId, 'progress_failed_csrf', { week, task, ip });
      return errorResponse('Invalid CSRF token', 403);
    }
    if (!TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE]) return errorResponse('Invalid week', 400);
    if (task && !TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].tasks.includes(task)) return errorResponse('Invalid task', 400);

    const progressKey = `progress:${userId}`;
    let progress: Progress = (await env.PROGRESS.get(progressKey)) ? JSON.parse(await env.PROGRESS.get(progressKey)) : {};

    if (!progress[week]) progress[week] = {};
    if (task) {
      if (!progress[week][task]) progress[week][task] = { completed: false };
      progress[week][task].completed = checked;
    }
    if (subtask) {
      if (!progress[week][task]) progress[week][task] = { completed: false, subtasks: {} };
      if (!progress[week][task].subtasks) progress[week][task].subtasks = {};
      progress[week][task].subtasks[subtask] = subtask_checked;
    }

    await env.PROGRESS.put(progressKey, JSON.stringify(progress));
    await logActivity(env, userId, 'progress_updated', { week, task, subtask, ip });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Start New Lab
  if (path === '/api/lab/start-new' && request.method === 'POST') {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) return errorResponse('Unauthorized', 401);

    const userId = await validateSession(env, request);
    if (!userId) return errorResponse('Invalid session', 401);

    let csrf_token;
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('form-data')) {
      const formData = await request.formData();
      csrf_token = formData.get('csrf_token')?.toString();
    } else {
      const data = await request.json();
      ({ csrf_token } = data);
    }
    if (!csrf_token) return errorResponse('Missing CSRF token', 400);
    if (!(await validateCSRFToken(env, csrf_token))) {
      await logActivity(env, userId, 'new_lab_failed_csrf', { ip });
      return errorResponse('Invalid CSRF token', 403);
    }

    const progressKey = `progress:${userId}`;
    const currentProgress = await env.PROGRESS.get(progressKey);
    if (currentProgress) {
      const historyKey = `history:${userId}:${new Date().toISOString()}`;
      await env.PROGRESS.put(historyKey, currentProgress);
    }
    const emptyProgress: Progress = {};
    Object.keys(TASK_STRUCTURE).forEach(weekKey => {
      emptyProgress[weekKey] = {};
      TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE].tasks.forEach(taskId => {
        emptyProgress[weekKey][taskId] = { completed: false, subtasks: {} };
      });
    });
    await env.PROGRESS.put(progressKey, JSON.stringify(emptyProgress));
    await logActivity(env, userId, 'new_lab_started', { ip });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // Admin: Users Progress
  if (path === '/api/admin/users-progress' && request.method === 'GET') {
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) return errorResponse('Unauthorized', 401);

    const userId = await validateSession(env, request);
    if (!userId) return errorResponse('Invalid session', 401);

    const user = await getUserByEmail(env, (await env.USERS.list()).keys.find(k => env.USERS.get(k.name).then(u => u && JSON.parse(u).id === userId))?.name.replace('user:', '') || '');
    if (!user || user.role !== 'admin') return errorResponse('Forbidden', 403);

    const users = [];
    const userKeys = await env.USERS.list();
    for (const key of userKeys.keys) {
      const userData = await env.USERS.get(key.name);
      if (userData) {
        const user: User = JSON.parse(userData);
        const progressData = await env.PROGRESS.get(`progress:${user.id}`);
        const progress: Progress = progressData ? JSON.parse(progressData) : {};
        users.push({
          name: user.name,
          progress: calculateProgress(progress),
          completedTasks: calculateCompletedTasks(progress),
        });
      }
    }

    users.sort((a, b) => b.progress - a.progress);

    return new Response(JSON.stringify({ success: true, data: users }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  return errorResponse('Not found', 404);
};