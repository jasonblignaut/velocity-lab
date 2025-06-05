// functions/utils.ts
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
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface Progress {
  [weekKey: string]: {
    [taskId: string]: {
      completed: boolean;
      subtasks?: { [key: string]: boolean };
      completedAt?: string;
    };
  };
}

export const TASK_STRUCTURE = {
  week1: { tasks: ['install-server2012', 'configure-static-ip', 'install-adds-role', 'promote-to-dc', 'configure-dns-server', 'create-domain-users', 'setup-vm-dns', 'join-vm-domain', 'create-hidden-share', 'map-drive-gpo', 'map-drive-script', 'create-security-group'] },
  week2: { tasks: ['install-second-server', 'promote-additional-dc', 'install-wsus-role', 'configure-wsus-settings', 'setup-wsus-gpo', 'configure-primary-time', 'configure-secondary-time', 'test-infrastructure'] },
  week3: { tasks: ['backup-servers', 'upgrade-dc1-2016', 'upgrade-dc2-2016', 'raise-functional-levels', 'prepare-exchange-server', 'install-exchange-prereqs', 'extend-ad-schema', 'install-exchange-2019', 'configure-exchange-basic', 'create-mailboxes', 'test-mailbox-access', 'configure-internal-mailflow'] },
  week4: { tasks: ['configure-external-dns', 'setup-firewall-rules', 'install-ssl-certificates', 'configure-external-mailflow', 'setup-modern-auth', 'prepare-m365-tenant', 'install-aad-connect', 'run-hybrid-wizard', 'configure-hybrid-mailflow', 'verify-hybrid-functionality'] }
};

export const TOTAL_TASKS = 42;

export const jsonResponse = (data: any, status = 200) =>
  new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  });

export const errorResponse = (error: string, status = 400) =>
  new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });

export const validateEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password: string) => ({
  valid: password.length >= 8,
  message: password.length >= 8 ? null : 'Password must be at least 8 characters'
});

export const sanitizeInput = (input: string) =>
  input.trim().replace(/[<>\"'&]/g, '');

export const validateSession = async (env: Env, request: Request): Promise<string | null> => {
  const authHeader = request.headers.get('Authorization');
  let sessionToken: string | undefined;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.split(' ')[1];
  } else {
    const cookies = request.headers.get('Cookie');
    sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
  }
  if (!sessionToken) return null;
  const userId = await env.SESSIONS.get(`session:${sessionToken}`);
  return userId || null;
};

export const createSession = async (env: Env, userId: string, remember: boolean = false): Promise<string> => {
  const sessionToken = crypto.randomUUID();
  const expirationTtl = remember ? 86400 * 30 : 86400; // 30 days or 1 day
  await env.SESSIONS.put(`session:${sessionToken}`, userId, { expirationTtl });
  return sessionToken;
};

export const deleteSession = async (env: Env, sessionToken: string) => {
  await env.SESSIONS.delete(`session:${sessionToken}`);
};

export const getUserByEmail = async (env: Env, email: string): Promise<User | null> => {
  const userData = await env.USERS.get(`user:${email}`);
  return userData ? JSON.parse(userData) : null;
};

export const getUserById = async (env: Env, userId: string): Promise<User | null> => {
  const users = await env.USERS.list({ prefix: 'user:' });
  for (const { name: userKey } of users.keys) {
    const userData = await env.USERS.get(userKey);
    if (userData) {
      const user = JSON.parse(userData) as User;
      if (user.id === userId) return user;
    }
  }
  return null;
};

export const updateLastLogin = async (env: Env, user: User) => {
  user.lastLogin = new Date().toISOString();
  await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
};

export const getCurrentLabProgress = async (env: Env, userId: string): Promise<Progress> => {
  const progressData = await env.PROGRESS.get(`progress:${userId}`);
  if (!progressData) {
    const emptyProgress: Progress = {};
    Object.keys(TASK_STRUCTURE).forEach(weekKey => {
      emptyProgress[weekKey] = {};
      TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE].tasks.forEach(taskId => {
        emptyProgress[weekKey][taskId] = { completed: false, subtasks: {} };
      });
    });
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(emptyProgress));
    return emptyProgress;
  }
  return JSON.parse(progressData);
};

export const calculateProgress = (progress: Progress): number => {
  let completed = 0;
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    const weekProgress = progress[weekKey] || {};
    week.tasks.forEach(taskId => {
      if (weekProgress[taskId]?.completed) completed++;
    });
  });
  return Math.round((completed / TOTAL_TASKS) * 100);
};

export const calculateCompletedTasks = (progress: Progress): number => {
  let completed = 0;
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    const weekProgress = progress[weekKey] || {};
    week.tasks.forEach(taskId => {
      if (weekProgress[taskId]?.completed) completed++;
    });
  });
  return completed;
};

export const generateCSRFToken = async (env: Env): Promise<string> => {
  const token = crypto.randomUUID();
  await env.SESSIONS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
};

export const validateCSRFToken = async (env: Env, token: string): Promise<boolean> => {
  const isValid = await env.SESSIONS.get(`csrf:${token}`);
  if (isValid) {
    await env.SESSIONS.delete(`csrf:${token}`);
    return true;
  }
  return false;
};

export const checkRateLimit = async (env: Env, key: string, limit: number): Promise<boolean> => {
  const current = await env.SESSIONS.get(`rate:${key}`);
  const count = current ? parseInt(current) : 0;
  if (count >= limit) return false;
  await env.SESSIONS.put(`rate:${key}`, (count + 1).toString(), { expirationTtl: 60 });
  return true;
};

export const logActivity = async (env: Env, userId: string, action: string, details?: any) => {
  const logKey = `log:${new Date().toISOString()}:${userId}`;
  const logData = {
    userId,
    action,
    details,
    timestamp: new Date().toISOString()
  };
  await env.SESSIONS.put(logKey, JSON.stringify(logData), { expirationTtl: 86400 * 30 });
};

export const startNewLab = async (env: Env, userId: string): Promise<string> => {
  const labId = crypto.randomUUID();
  const currentProgress = await getCurrentLabProgress(env, userId);
  const historyKey = `history:${userId}:${new Date().toISOString()}`;
  await env.PROGRESS.put(historyKey, JSON.stringify(currentProgress));
  const emptyProgress: Progress = {};
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    emptyProgress[weekKey] = {};
    TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE].tasks.forEach(taskId => {
      emptyProgress[weekKey][taskId] = { completed: false, subtasks: {} };
    });
  });
  await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(emptyProgress));
  return labId;
};

export const completeLab = async (env: Env, userId: string) => {
  const progress = await getCurrentLabProgress(env, userId);
  const completedKey = `completed:${userId}:${new Date().toISOString()}`;
  await env.PROGRESS.put(completedKey, JSON.stringify(progress));
};