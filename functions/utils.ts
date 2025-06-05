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
  [week: string]: {
    [task: string]: {
      completed: boolean;
      subtasks?: { [subtask: string]: boolean };
    };
  };
}

export const TASK_STRUCTURE = {
  week1: { tasks: ['install-server2012', 'configure-static-ip', 'install-adds-role', 'promote-to-dc', 'configure-dns-server', 'create-domain-users', 'setup-vm-dns', 'join-vm-domain', 'create-hidden-share', 'map-drive-gpo', 'map-drive-script', 'create-security-group'] },
  week2: { tasks: ['install-second-server', 'promote-additional-dc', 'install-wsus-role', 'configure-wsus-settings', 'setup-wsus-gpo', 'configure-primary-time', 'configure-secondary-time', 'test-infrastructure'] },
  week3: { tasks: ['backup-servers', 'upgrade-dc1-2016', 'upgrade-dc2-2016', 'raise-functional-levels', 'prepare-exchange-server', 'install-exchange-prereqs', 'extend-ad-schema', 'install-exchange-2019', 'configure-exchange-basic', 'create-mailboxes', 'test-mailbox-access', 'configure-internal-mailflow'] },
  week4: { tasks: ['configure-external-dns', 'setup-firewall-rules', 'install-ssl-certificates', 'configure-external-mailflow', 'setup-modern-auth', 'prepare-m365-tenant', 'install-aad-connect', 'run-hybrid-wizard', 'configure-hybrid-mailflow', 'verify-hybrid-functionality'] },
};

export const TOTAL_TASKS = 42;

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors?: string[] } => {
  if (password.length < 8) {
    return { valid: false, errors: ['Password must be at least 8 characters'] };
  }
  return { valid: true };
};

export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>&'"]/g, '');
};

export const generateCSRFToken = async (env: Env): Promise<string> => {
  const token = crypto.randomUUID();
  await env.SESSIONS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
};

export const validateCSRFToken = async (env: Env, token: string): Promise<boolean> => {
  const valid = await env.SESSIONS.get(`csrf:${token}`);
  if (valid) {
    await env.SESSIONS.delete(`csrf:${token}`);
    return true;
  }
  return false;
};

export const createSession = async (env: Env, userId: string, remember: boolean = false): Promise<string> => {
  const sessionToken = crypto.randomUUID();
  const expires = remember ? 30 * 86400 : 86400; // 30 days or 1 day
  await env.SESSIONS.put(`session:${sessionToken}`, userId, { expirationTtl: expires });
  return sessionToken;
};

export const validateSession = async (env: Env, request: Request): Promise<string | null> => {
  const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                      request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
  if (!sessionToken) return null;
  const userId = await env.SESSIONS.get(`session:${sessionToken}`);
  return userId || null;
};

export const getUserByEmail = async (env: Env, email: string): Promise<User | null> => {
  const userData = await env.USERS.get(`user:${email.toLowerCase()}`);
  return userData ? JSON.parse(userData) : null;
};

export const updateLastLogin = async (env: Env, user: User): Promise<void> => {
  const updatedUser = { ...user, lastLogin: new Date().toISOString() };
  await env.USERS.put(`user:${user.email}`, JSON.stringify(updatedUser));
};

export const logActivity = async (env: Env, userId: string, action: string, details: any): Promise<void> => {
  const logEntry = {
    userId,
    action,
    timestamp: new Date().toISOString(),
    details,
  };
  await env.SESSIONS.put(`log:${crypto.randomUUID()}`, JSON.stringify(logEntry), { expirationTtl: 7 * 86400 });
};

export const calculateProgress = (progress: Progress): number => {
  let completedTasks = 0;
  Object.keys(TASK_STRUCTURE).forEach(week => {
    if (progress[week]) {
      TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].tasks.forEach(task => {
        if (progress[week][task]?.completed) {
          completedTasks++;
        }
      });
    }
  });
  return Math.round((completedTasks / TOTAL_TASKS) * 100);
};

export const calculateCompletedTasks = (progress: Progress): number => {
  let completedTasks = 0;
  Object.keys(TASK_STRUCTURE).forEach(week => {
    if (progress[week]) {
      TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].tasks.forEach(task => {
        if (progress[week][task]?.completed) {
          completedTasks++;
        }
      });
    }
  });
  return completedTasks;
};