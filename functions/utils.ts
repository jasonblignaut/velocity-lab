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

// Simple task structure matching the frontend exactly
export const TASK_STRUCTURE = {
  week1: ['install-server2012', 'configure-static-ip', 'install-adds-role', 'promote-to-dc', 'configure-dns-server', 'create-domain-users', 'join-vm-domain', 'create-hidden-share', 'map-drive-gpo', 'map-drive-script', 'map-drive-powershell', 'create-security-group', 'restrict-share-access'],
  week2: ['install-second-server', 'promote-additional-dc', 'install-wsus-role', 'configure-wsus-settings', 'setup-wsus-gpo', 'configure-primary-time', 'configure-secondary-time', 'test-infrastructure'],
  week3: ['backup-servers', 'upgrade-dc1-2016', 'upgrade-dc2-2016', 'raise-functional-levels', 'install-exchange-server', 'install-exchange-prereqs', 'extend-ad-schema', 'install-exchange-2019', 'configure-exchange-basic', 'create-mailboxes', 'test-mailbox-access', 'configure-internal-mailflow'],
  week4: ['configure-external-dns', 'setup-firewall-rules', 'install-ssl-certificates', 'configure-external-mailflow', 'setup-modern-auth', 'prepare-m365-tenant', 'install-aad-connect', 'run-hybrid-wizard', 'configure-hybrid-mailflow', 'verify-hybrid-functionality']
};

export const TOTAL_TASKS = 42;

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors?: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  return errors.length ? { valid: false, errors } : { valid: true };
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

export const getUserById = async (env: Env, userId: string): Promise<User | null> => {
  const userKeys = await env.USERS.list();
  for (const key of userKeys.keys) {
    const userData = await env.USERS.get(key.name);
    if (userData) {
      const user: User = JSON.parse(userData);
      if (user.id === userId) return user;
    }
  }
  return null;
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
      TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].forEach(task => {
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
      TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].forEach(task => {
        if (progress[week][task]?.completed) {
          completedTasks++;
        }
      });
    }
  });
  return completedTasks;
};

export const generateProgressCSV = (users: Array<{
  name: string;
  email: string;
  role: string;
  progress: number;
  completedTasks: number;
  lastLogin?: string;
}>): string => {
  const headers = ['Name', 'Email', 'Role', 'Progress (%)', 'Completed Tasks', 'Last Login'];
  const rows = users.map(u => [
    `"${u.name.replace(/"/g, '""')}"`,
    u.email,
    u.role,
    u.progress,
    u.completedTasks,
    u.lastLogin ? new Date(u.lastLogin).toISOString() : 'Never',
  ]);
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

export const parseProgressCSV = (csv: string): Array<{ email: string; progress: Progress }> => {
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length < 1) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  const emailIndex = headers.indexOf('Email');
  if (emailIndex === -1) return [];

  const result: Array<{ email: string; progress: Progress }> = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    if (values.length > emailIndex) {
      const email = values[emailIndex];
      if (validateEmail(email)) {
        // For simplicity, reset progress; extend for full parsing if needed
        const progress: Progress = {};
        result.push({ email, progress });
      }
    }
  }
  return result;
};