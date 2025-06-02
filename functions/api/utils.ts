// functions/utils.ts
// Enhanced utilities for Velocity Lab - 42-Task System with Lab History

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
  labHistory?: LabHistory[];
  currentLabId?: string;
}

export interface Progress {
  [week: string]: {
    [task: string]: {
      completed: boolean;
      subtasks?: {
        [subtaskKey: string]: boolean;
      };
      completedAt?: string;
    };
  };
}

export interface Session {
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface LabHistory {
  labId: string;
  startedAt: string;
  completedAt?: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  durationDays?: number;
}

export interface SubtaskDefinition {
  id: string;
  title: string;
  description?: string;
}

export interface TaskDefinition {
  id: string;
  title: string;
  description: string;
  subtasks: SubtaskDefinition[];
  referenceLinks?: Array<{
    title: string;
    url: string;
    type: 'official' | 'community' | 'video' | 'blog';
  }>;
}

// FIXED: Enhanced task structure for comprehensive 42-task hybrid migration lab
export const TASK_STRUCTURE = {
  week1: {
    title: "Foundation Setup",
    description: "Windows Server 2012 DC, domain joining, and network shares",
    taskCount: 12,
    tasks: [
      'install-server2012',
      'configure-static-ip',
      'install-adds-role',
      'promote-to-dc',
      'configure-dns-server',
      'create-domain-users',
      'setup-vm-dns',
      'join-vm-domain',
      'create-hidden-share',
      'map-drive-gpo',
      'map-drive-script',
      'create-security-group'
    ]
  },
  week2: {
    title: "Infrastructure Expansion", 
    description: "Second DC, WSUS, and time synchronization",
    taskCount: 8,
    tasks: [
      'install-second-server',
      'promote-additional-dc',
      'install-wsus-role',
      'configure-wsus-settings',
      'setup-wsus-gpo',
      'configure-primary-time',
      'configure-secondary-time',
      'test-infrastructure'
    ]
  },
  week3: {
    title: "Email & Messaging",
    description: "Server 2016 upgrade and Exchange 2019 deployment", 
    taskCount: 12,
    tasks: [
      'backup-servers',
      'upgrade-dc1-2016',
      'upgrade-dc2-2016',
      'raise-functional-levels',
      'prepare-exchange-server',
      'install-exchange-prereqs',
      'extend-ad-schema',
      'install-exchange-2019',
      'configure-exchange-basic',
      'create-mailboxes',
      'test-mailbox-access',
      'configure-internal-mailflow'
    ]
  },
  week4: {
    title: "Cloud Integration",
    description: "External mail publishing and Microsoft 365 hybrid setup",
    taskCount: 10,
    tasks: [
      'configure-external-dns',
      'setup-firewall-rules',
      'install-ssl-certificates',
      'configure-external-mailflow',
      'setup-modern-auth',
      'prepare-m365-tenant',
      'install-aad-connect',
      'run-hybrid-wizard',
      'configure-hybrid-mailflow',
      'verify-hybrid-functionality'
    ]
  }
};

// FIXED: Total task count calculation
export const TOTAL_TASKS = Object.values(TASK_STRUCTURE).reduce((sum, week) => sum + week.taskCount, 0); // 42 tasks

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

// ENHANCED: Calculate user progress percentage with subtask support
export const calculateProgress = (progress: Progress): number => {
  let completedMainTasks = 0;
  let completedSubtasks = 0;
  let totalSubtasks = 0;
  
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    const weekProgress = progress[weekKey] || {};
    
    week.tasks.forEach(taskId => {
      const taskProgress = weekProgress[taskId];
      
      if (taskProgress?.completed) {
        completedMainTasks++;
      }
      
      // Count subtasks if they exist
      if (taskProgress?.subtasks) {
        const subtaskEntries = Object.entries(taskProgress.subtasks);
        totalSubtasks += subtaskEntries.length;
        completedSubtasks += subtaskEntries.filter(([_, completed]) => completed).length;
      }
    });
  });
  
  // Weight main tasks more heavily than subtasks
  const mainTaskWeight = 0.7;
  const subtaskWeight = 0.3;
  
  const mainTaskProgress = (completedMainTasks / TOTAL_TASKS) * 100;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  const overallProgress = (mainTaskProgress * mainTaskWeight) + (subtaskProgress * subtaskWeight);
  
  return Math.round(overallProgress);
};

// NEW: Start a new lab for a user
export const startNewLab = async (env: Env, userId: string): Promise<string> => {
  try {
    const user = await getUserById(env, userId);
    if (!user) throw new Error('User not found');
    
    const labId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Initialize empty progress for new lab
    const emptyProgress: Progress = {};
    Object.keys(TASK_STRUCTURE).forEach(weekKey => {
      emptyProgress[weekKey] = {};
      const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
      week.tasks.forEach(taskId => {
        emptyProgress[weekKey][taskId] = {
          completed: false,
          subtasks: {}
        };
      });
    });
    
    // Save new lab progress
    await env.PROGRESS.put(`progress:${userId}:${labId}`, JSON.stringify(emptyProgress));
    
    // Update user's current lab
    user.currentLabId = labId;
    if (!user.labHistory) user.labHistory = [];
    
    user.labHistory.push({
      labId,
      startedAt: now,
      totalTasks: TOTAL_TASKS,
      completedTasks: 0,
      progressPercentage: 0
    });
    
    await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
    
    // Log lab start
    await logActivity(env, userId, 'lab_started', { labId, totalTasks: TOTAL_TASKS });
    
    return labId;
  } catch (error) {
    console.error('Start new lab error:', error);
    throw error;
  }
};

// NEW: Complete current lab
export const completeLab = async (env: Env, userId: string): Promise<void> => {
  try {
    const user = await getUserById(env, userId);
    if (!user || !user.currentLabId) return;
    
    const labId = user.currentLabId;
    const progressData = await env.PROGRESS.get(`progress:${userId}:${labId}`);
    if (!progressData) return;
    
    const progress = JSON.parse(progressData) as Progress;
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);
    
    // Update lab history
    if (user.labHistory) {
      const labIndex = user.labHistory.findIndex(lab => lab.labId === labId);
      if (labIndex !== -1) {
        const lab = user.labHistory[labIndex];
        lab.completedAt = new Date().toISOString();
        lab.completedTasks = completedTasks;
        lab.progressPercentage = progressPercentage;
        
        // Calculate duration
        const startDate = new Date(lab.startedAt);
        const endDate = new Date(lab.completedAt);
        lab.durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
    
    // Log lab completion
    await logActivity(env, userId, 'lab_completed', { 
      labId, 
      completedTasks, 
      totalTasks: TOTAL_TASKS,
      progressPercentage 
    });
  } catch (error) {
    console.error('Complete lab error:', error);
  }
};

// NEW: Get current lab progress
export const getCurrentLabProgress = async (env: Env, userId: string): Promise<Progress | null> => {
  try {
    const user = await getUserById(env, userId);
    if (!user) return null;
    
    // If no current lab, create one
    if (!user.currentLabId) {
      const labId = await startNewLab(env, userId);
      user.currentLabId = labId;
    }
    
    const progressData = await env.PROGRESS.get(`progress:${userId}:${user.currentLabId}`);
    if (!progressData) return null;
    
    return JSON.parse(progressData) as Progress;
  } catch (error) {
    console.error('Get current lab progress error:', error);
    return null;
  }
};

// NEW: Calculate completed tasks count
export const calculateCompletedTasks = (progress: Progress): number => {
  let completed = 0;
  
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    const weekProgress = progress[weekKey] || {};
    
    week.tasks.forEach(taskId => {
      if (weekProgress[taskId]?.completed) {
        completed++;
      }
    });
  });
  
  return completed;
};

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
    
    for (const { name: sessionKey } of sessions.keys) {
      // Sessions automatically expire due to TTL, but we can clean up manually if needed
      // This is more for logging/monitoring purposes
    }
  } catch (error) {
    console.error('Clean expired sessions error:', error);
  }
};