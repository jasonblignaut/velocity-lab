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
  passwordChangedAt?: string;
  currentLabId?: string;
  labHistory?: Array<{
    labId: string;
    startedAt: string;
    endedAt?: string;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    isCompleted: boolean;
  }>;
}

export interface Progress {
  [week: string]: {
    [task: string]: {
      completed: boolean;
      subtasks?: { [subtask: string]: boolean };
      completedAt?: string;
      notes?: string;
    };
  };
}

export interface LabHistoryEntry {
  labId: string;
  startedAt: string;
  endedAt?: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  isCompleted: boolean;
}

// Task structure that matches the frontend exactly - simplified flat arrays
export const TASK_STRUCTURE = {
  week1: [
    'install-server2012',
    'configure-static-ip', 
    'install-adds-role',
    'promote-to-dc',
    'configure-dns-server',
    'create-domain-users',
    'join-vm-domain',
    'create-hidden-share',
    'map-drive-gpo',
    'map-drive-script',
    'map-drive-powershell',
    'create-security-group',
    'restrict-share-access'
  ],
  week2: [
    'install-second-server',
    'promote-additional-dc',
    'install-wsus-role',
    'configure-wsus-settings',
    'setup-wsus-gpo',
    'configure-primary-time',
    'configure-secondary-time',
    'test-infrastructure'
  ],
  week3: [
    'backup-servers',
    'upgrade-dc1-2016',
    'upgrade-dc2-2016',
    'raise-functional-levels',
    'install-exchange-server',
    'install-exchange-prereqs',
    'extend-ad-schema',
    'install-exchange-2019',
    'configure-exchange-basic',
    'create-mailboxes',
    'test-mailbox-access',
    'configure-internal-mailflow'
  ],
  week4: [
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
};

export const TOTAL_TASKS = 42;

// Email validation using standard regex
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Password validation - can be made more strict for production
export const validatePassword = (password: string): { valid: boolean; errors?: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
};

// Basic input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>&'"]/g, '') // Remove potentially dangerous characters
    .trim() // Remove leading/trailing whitespace
    .substring(0, 1000); // Limit length to prevent abuse
};

// Generate CSRF token for form protection
export const generateCSRFToken = async (env: Env): Promise<string> => {
  const token = crypto.randomUUID();
  await env.SESSIONS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 }); // 1 hour expiry
  return token;
};

// Validate and consume CSRF token
export const validateCSRFToken = async (env: Env, token: string): Promise<boolean> => {
  if (!token) return false;
  
  try {
    const valid = await env.SESSIONS.get(`csrf:${token}`);
    if (valid) {
      // Delete token after use (one-time use)
      await env.SESSIONS.delete(`csrf:${token}`);
      return true;
    }
    return false;
  } catch (e) {
    console.error('CSRF token validation error:', e);
    return false;
  }
};

// Create session token for authenticated users
export const createSession = async (env: Env, userId: string, remember: boolean = false): Promise<string> => {
  const sessionToken = crypto.randomUUID();
  const expirationTime = remember ? 30 * 86400 : 86400; // 30 days if remember, else 1 day
  
  try {
    await env.SESSIONS.put(`session:${sessionToken}`, userId, { 
      expirationTtl: expirationTime 
    });
    return sessionToken;
  } catch (e) {
    console.error('Session creation error:', e);
    throw new Error('Failed to create session');
  }
};

// Validate session and return user ID with improved error handling
export const validateSession = async (env: Env, request: Request): Promise<string | null> => {
  try {
    // Try Authorization header first (Bearer token), then Cookie
    const sessionToken = request.headers.get('Authorization')?.replace('Bearer ', '') ||
                        request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];
    
    if (!sessionToken) return null;
    
    const userId = await env.SESSIONS.get(`session:${sessionToken}`);
    return userId || null;
  } catch (e) {
    console.error('Session validation error:', e);
    return null;
  }
};

// Get user by email address with improved error handling
export const getUserByEmail = async (env: Env, email: string): Promise<User | null> => {
  try {
    const userData = await env.USERS.get(`user:${email.toLowerCase()}`);
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Error getting user by email:', e);
    return null;
  }
};

// Get user by ID with improved error handling and timeout
export const getUserById = async (env: Env, userId: string): Promise<User | null> => {
  try {
    const userKeys = await env.USERS.list({ prefix: 'user:' });
    
    // Process users in batches to avoid timeout
    for (const key of userKeys.keys) {
      try {
        const userData = await env.USERS.get(key.name);
        if (userData) {
          const user: User = JSON.parse(userData);
          if (user.id === userId) {
            return user;
          }
        }
      } catch (e) {
        console.error(`Error processing user key ${key.name}:`, e);
        continue; // Skip this user and continue
      }
    }
    return null;
  } catch (e) {
    console.error('Error getting user by ID:', e);
    return null;
  }
};

// Update user's last login timestamp
export const updateLastLogin = async (env: Env, user: User): Promise<void> => {
  try {
    const updatedUser = { 
      ...user, 
      lastLogin: new Date().toISOString() 
    };
    await env.USERS.put(`user:${user.email}`, JSON.stringify(updatedUser));
  } catch (e) {
    console.error('Error updating last login:', e);
  }
};

// Lab History Management
export const startNewLab = async (env: Env, user: User): Promise<{ labId: string; updatedUser: User }> => {
  try {
    const labId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Initialize lab history if it doesn't exist
    if (!user.labHistory) {
      user.labHistory = [];
    }
    
    // End the current lab if it exists and isn't already completed
    if (user.currentLabId) {
      const currentLabIndex = user.labHistory.findIndex(lab => lab.labId === user.currentLabId);
      if (currentLabIndex >= 0 && !user.labHistory[currentLabIndex].isCompleted) {
        // Get current progress before ending
        const progressData = await env.PROGRESS.get(`progress:${user.id}`);
        const progress: Progress = progressData ? JSON.parse(progressData) : {};
        const completedTasks = calculateCompletedTasks(progress);
        const progressPercentage = calculateProgress(progress);
        
        user.labHistory[currentLabIndex] = {
          ...user.labHistory[currentLabIndex],
          endedAt: now,
          completedTasks,
          progressPercentage,
          isCompleted: progressPercentage === 100
        };
      }
    }
    
    // Add new lab to history
    const newLabEntry: LabHistoryEntry = {
      labId,
      startedAt: now,
      totalTasks: TOTAL_TASKS,
      completedTasks: 0,
      progressPercentage: 0,
      isCompleted: false
    };
    
    user.labHistory.push(newLabEntry);
    user.currentLabId = labId;
    
    // Save updated user
    await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
    
    // Reset progress
    await env.PROGRESS.put(`progress:${user.id}`, JSON.stringify({}));
    
    return { labId, updatedUser: user };
  } catch (e) {
    console.error('Error starting new lab:', e);
    throw new Error('Failed to start new lab');
  }
};

// Update lab progress with history tracking
export const updateLabProgress = async (env: Env, user: User, progress: Progress): Promise<User> => {
  try {
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);
    const now = new Date().toISOString();
    
    // Initialize lab history if it doesn't exist
    if (!user.labHistory) {
      user.labHistory = [];
    }
    
    // If no current lab, create one
    if (!user.currentLabId) {
      const labResult = await startNewLab(env, user);
      user = labResult.updatedUser;
    }
    
    // Update current lab in history
    const currentLabIndex = user.labHistory.findIndex(lab => lab.labId === user.currentLabId);
    if (currentLabIndex >= 0) {
      const isCompleted = progressPercentage === 100;
      user.labHistory[currentLabIndex] = {
        ...user.labHistory[currentLabIndex],
        completedTasks,
        progressPercentage,
        isCompleted,
        endedAt: isCompleted ? now : undefined
      };
    }
    
    // Save updated user
    await env.USERS.put(`user:${user.email}`, JSON.stringify(user));
    
    return user;
  } catch (e) {
    console.error('Error updating lab progress:', e);
    throw new Error('Failed to update lab progress');
  }
};

// Get lab history for a user
export const getLabHistory = async (env: Env, userId: string): Promise<LabHistoryEntry[]> => {
  try {
    const user = await getUserById(env, userId);
    return user?.labHistory || [];
  } catch (e) {
    console.error('Error getting lab history:', e);
    return [];
  }
};

// Log activity for audit trail with improved error handling
export const logActivity = async (env: Env, userId: string, action: string, details: any): Promise<void> => {
  try {
    const logEntry = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    
    // Store logs with 7-day expiry
    const logKey = `log:${crypto.randomUUID()}`;
    await env.SESSIONS.put(logKey, JSON.stringify(logEntry), { 
      expirationTtl: 7 * 86400 // 7 days
    });
  } catch (e) {
    console.error('Error logging activity:', e);
    // Don't throw - logging failures shouldn't break the main flow
  }
};

// Calculate overall progress percentage
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

// Calculate total completed tasks count
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

// Calculate week-specific progress
export const calculateWeekProgress = (progress: Progress, week: string): { completed: number; total: number; percentage: number } => {
  const weekTasks = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE] || [];
  let completed = 0;
  
  if (progress[week]) {
    weekTasks.forEach(task => {
      if (progress[week][task]?.completed) {
        completed++;
      }
    });
  }
  
  return {
    completed,
    total: weekTasks.length,
    percentage: weekTasks.length > 0 ? Math.round((completed / weekTasks.length) * 100) : 0
  };
};

// Generate CSV export of user progress
export const generateProgressCSV = (users: Array<{
  name: string;
  email: string;
  role: string;
  progress: number;
  completedTasks: number;
  lastLogin?: string;
}>): string => {
  const headers = [
    'Name',
    'Email', 
    'Role',
    'Progress (%)',
    'Completed Tasks',
    'Total Tasks',
    'Last Login'
  ];
  
  const csvRows = [headers.join(',')];
  
  users.forEach(user => {
    const row = [
      `"${user.name.replace(/"/g, '""')}"`, // Escape quotes in names
      user.email,
      user.role,
      user.progress.toString(),
      user.completedTasks.toString(),
      TOTAL_TASKS.toString(),
      user.lastLogin ? new Date(user.lastLogin).toISOString() : 'Never'
    ];
    csvRows.push(row.join(','));
  });
  
  return csvRows.join('\n');
};

// Parse CSV import of progress data
export const parseProgressCSV = (csv: string): Array<{ email: string; progress: Progress }> => {
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) { // Need at least header + 1 data row
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
  
  if (emailIndex === -1) {
    throw new Error('CSV must contain an Email column');
  }
  
  const result: Array<{ email: string; progress: Progress }> = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    
    if (values.length > emailIndex && values[emailIndex]) {
      const email = values[emailIndex].toLowerCase();
      
      if (validateEmail(email)) {
        // For basic import, reset progress to empty
        // Could be extended to parse actual progress data from CSV
        const progress: Progress = {};
        result.push({ email, progress });
      }
    }
  }
  
  return result;
};

// Detailed progress export with task-level data
export const generateDetailedProgressCSV = (users: Array<{
  name: string;
  email: string;
  role: string;
  progress: Progress;
  lastLogin?: string;
}>): string => {
  const headers = ['Name', 'Email', 'Role', 'Week', 'Task', 'Completed', 'Last Login'];
  const csvRows = [headers.join(',')];
  
  users.forEach(user => {
    Object.keys(TASK_STRUCTURE).forEach(week => {
      TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].forEach(task => {
        const completed = user.progress[week]?.[task]?.completed || false;
        const row = [
          `"${user.name.replace(/"/g, '""')}"`,
          user.email,
          user.role,
          week,
          task,
          completed ? 'TRUE' : 'FALSE',
          user.lastLogin ? new Date(user.lastLogin).toISOString() : 'Never'
        ];
        csvRows.push(row.join(','));
      });
    });
  });
  
  return csvRows.join('\n');
};

// Validate task exists in structure
export const isValidTask = (week: string, task: string): boolean => {
  const weekTasks = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE];
  return weekTasks ? weekTasks.includes(task) : false;
};

// Get user statistics
export const getUserStats = (progress: Progress): {
  totalCompleted: number;
  totalTasks: number;
  progressPercentage: number;
  weekStats: { [week: string]: { completed: number; total: number; percentage: number } };
} => {
  const weekStats: { [week: string]: { completed: number; total: number; percentage: number } } = {};
  let totalCompleted = 0;
  
  Object.keys(TASK_STRUCTURE).forEach(week => {
    const weekProgress = calculateWeekProgress(progress, week);
    weekStats[week] = weekProgress;
    totalCompleted += weekProgress.completed;
  });
  
  return {
    totalCompleted,
    totalTasks: TOTAL_TASKS,
    progressPercentage: Math.round((totalCompleted / TOTAL_TASKS) * 100),
    weekStats
  };
};

// Rate limiting helper with improved error handling
export const checkRateLimit = async (env: Env, identifier: string, limit: number = 10, window: number = 60): Promise<boolean> => {
  try {
    const key = `rate:${identifier}:${Math.floor(Date.now() / (window * 1000))}`;
    const current = await env.SESSIONS.get(key);
    const count = current ? parseInt(current) : 0;
    
    if (count >= limit) {
      return false;
    }
    
    await env.SESSIONS.put(key, (count + 1).toString(), { expirationTtl: window });
    return true;
  } catch (e) {
    console.error('Rate limit check error:', e);
    return true; // Allow on error to avoid blocking legitimate users
  }
};

// Generate secure random string
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }
  
  return result;
};

// Hash password for production use (placeholder for bcrypt)
export const hashPassword = async (password: string): Promise<string> => {
  // In production, use proper bcrypt hashing
  // For now, return plain text (NOT SECURE - only for development)
  return password;
};

// Verify password hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  // In production, use proper bcrypt verification
  // For now, simple comparison (NOT SECURE - only for development)
  return password === hash;
};

// Batch process users to avoid timeout issues
export const batchProcessUsers = async <T>(
  env: Env, 
  processor: (user: User, progress: Progress) => T,
  batchSize: number = 10
): Promise<T[]> => {
  try {
    const results: T[] = [];
    const userKeys = await env.USERS.list({ prefix: 'user:' });
    
    // Process in batches to avoid timeout
    for (let i = 0; i < userKeys.keys.length; i += batchSize) {
      const batch = userKeys.keys.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (key) => {
        try {
          const userData = await env.USERS.get(key.name);
          if (!userData) return null;
          
          const user: User = JSON.parse(userData);
          const progressData = await env.PROGRESS.get(`progress:${user.id}`);
          const progress: Progress = progressData ? JSON.parse(progressData) : {};
          
          return processor(user, progress);
        } catch (e) {
          console.error(`Error processing user ${key.name}:`, e);
          return null;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter((result): result is T => result !== null));
    }
    
    return results;
  } catch (e) {
    console.error('Batch process users error:', e);
    return [];
  }
};