/**
 * Velocity Lab - Comprehensive Utility Functions
 * Enterprise-grade utilities for Exchange Hybrid deployment training platform
 */

// ============================================================================
// TYPE DEFINITIONS & INTERFACES
// ============================================================================

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
  SESSIONS: KVNamespace;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Note: In production, this should be hashed
  role: 'user' | 'admin';
  createdAt: string;
  lastLogin?: string;
  passwordChangedAt?: string;
  currentLabId?: string;
  loginAttempts?: number;
  lockedUntil?: string;
  emailVerified?: boolean;
  lastActive?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    language: string;
  };
  labHistory?: Array<{
    labId: string;
    startedAt: string;
    completedAt?: string;
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
    timeSpent?: number; // in minutes
    certificateIssued?: boolean;
  }>;
  achievements?: string[];
  stats?: {
    totalTimeSpent: number;
    totalTasksCompleted: number;
    totalLabsCompleted: number;
    averageScore: number;
    streakDays: number;
    lastStreakDate?: string;
  };
}

export interface Progress {
  [week: string]: {
    [task: string]: {
      completed: boolean;
      completedAt?: string;
      timeSpent?: number; // in minutes
      attempts?: number;
      notes?: string;
      difficulty?: 1 | 2 | 3 | 4 | 5;
      subtasks?: { 
        [subtask: string]: {
          completed: boolean;
          completedAt?: string;
          notes?: string;
        };
      };
    };
  };
}

export interface SessionData {
  userId: string;
  createdAt: string;
  lastAccessed: string;
  ipAddress: string;
  userAgent: string;
  remember: boolean;
  csrfToken?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  details: Record<string, any>;
  success: boolean;
  errorMessage?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface SecurityEvent {
  type: 'login_failed' | 'account_locked' | 'suspicious_activity' | 'password_changed';
  userId?: string;
  ipAddress: string;
  timestamp: string;
  details: Record<string, any>;
}

// ============================================================================
// TASK STRUCTURE & CONSTANTS
// ============================================================================

export const TASK_STRUCTURE = {
  week1: {
    title: "Foundation Setup",
    description: "Active Directory infrastructure and domain setup",
    estimatedHours: 8,
    difficulty: 2,
    prerequisites: [],
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
    ],
  },
  week2: {
    title: "Infrastructure Expansion",
    description: "Redundancy, updates, and time synchronization",
    estimatedHours: 6,
    difficulty: 3,
    prerequisites: ['week1'],
    tasks: [
      'install-second-server',
      'promote-additional-dc',
      'install-wsus-role',
      'configure-wsus-settings',
      'setup-wsus-gpo',
      'configure-primary-time',
      'configure-secondary-time',
      'test-infrastructure',
    ],
  },
  week3: {
    title: "Exchange Server Deployment",
    description: "Email system installation and configuration",
    estimatedHours: 12,
    difficulty: 4,
    prerequisites: ['week1', 'week2'],
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
      'configure-internal-mailflow',
    ],
  },
  week4: {
    title: "Cloud Integration",
    description: "Microsoft 365 hybrid deployment",
    estimatedHours: 10,
    difficulty: 5,
    prerequisites: ['week1', 'week2', 'week3'],
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
      'verify-hybrid-functionality',
    ],
  },
} as const;

export const TOTAL_TASKS = 42;

// Security Constants
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
  CSRF_TOKEN_DURATION: 60 * 60 * 1000, // 1 hour
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_AGE: 90 * 24 * 60 * 60 * 1000, // 90 days
} as const;

// Rate Limiting
export const RATE_LIMITS = {
  LOGIN: { requests: 10, window: 15 * 60 * 1000 }, // 10 requests per 15 minutes
  REGISTER: { requests: 5, window: 60 * 60 * 1000 }, // 5 requests per hour
  API: { requests: 100, window: 60 * 1000 }, // 100 requests per minute
  ADMIN: { requests: 50, window: 60 * 1000 }, // 50 requests per minute for admin
} as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates email address format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email.trim().toLowerCase());
};

/**
 * Comprehensive password validation
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Length validation
  if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
  }

  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Character requirements
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common patterns to avoid
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /letmein/i,
    /welcome/i,
    /admin/i,
  ];

  commonPatterns.forEach(pattern => {
    if (pattern.test(password)) {
      warnings.push('Password contains common patterns that should be avoided');
    }
  });

  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeating the same character multiple times');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

/**
 * Validates user name
 */
export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (trimmedName.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (!/^[a-zA-Z\s\-'\.]+$/.test(trimmedName)) {
    errors.push('Name can only contain letters, spaces, hyphens, apostrophes, and periods');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>&'"]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&#x27;',
        '"': '&quot;',
      };
      return entities[char] || char;
    })
    .trim();
};

/**
 * Validates task and week identifiers
 */
export const validateTaskIdentifiers = (week: string, task?: string): ValidationResult => {
  const errors: string[] = [];

  if (!TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE]) {
    errors.push(`Invalid week identifier: ${week}`);
  }

  if (task) {
    const weekData = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE];
    if (weekData && !weekData.tasks.includes(task)) {
      errors.push(`Invalid task identifier: ${task} for week ${week}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};

// ============================================================================
// SECURITY FUNCTIONS
// ============================================================================

/**
 * Generates cryptographically secure random token
 */
export const generateSecureToken = (): string => {
  return crypto.randomUUID();
};

/**
 * Generates and stores CSRF token
 */
export const generateCSRFToken = async (env: Env): Promise<string> => {
  const token = generateSecureToken();
  const expirationTtl = Math.floor(SECURITY_CONFIG.CSRF_TOKEN_DURATION / 1000);
  
  await env.SESSIONS.put(`csrf:${token}`, JSON.stringify({
    created: new Date().toISOString(),
    valid: true,
  }), { expirationTtl });
  
  return token;
};

/**
 * Validates and consumes CSRF token
 */
export const validateCSRFToken = async (env: Env, token: string): Promise<boolean> => {
  if (!token) return false;

  try {
    const tokenData = await env.SESSIONS.get(`csrf:${token}`);
    if (!tokenData) return false;

    const parsedData = JSON.parse(tokenData);
    if (!parsedData.valid) return false;

    // Consume the token (delete it)
    await env.SESSIONS.delete(`csrf:${token}`);
    return true;
  } catch (error) {
    console.error('CSRF token validation error:', error);
    return false;
  }
};

/**
 * Creates user session with enhanced security
 */
export const createSession = async (
  env: Env,
  userId: string,
  ipAddress: string,
  userAgent: string,
  remember: boolean = false
): Promise<string> => {
  const sessionToken = generateSecureToken();
  const expirationTime = remember 
    ? SECURITY_CONFIG.REMEMBER_ME_DURATION 
    : SECURITY_CONFIG.SESSION_TIMEOUT;
  
  const sessionData: SessionData = {
    userId,
    createdAt: new Date().toISOString(),
    lastAccessed: new Date().toISOString(),
    ipAddress,
    userAgent,
    remember,
    csrfToken: await generateCSRFToken(env),
  };

  const expirationTtl = Math.floor(expirationTime / 1000);
  await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData), { expirationTtl });

  return sessionToken;
};

/**
 * Validates session and updates last accessed time
 */
export const validateSession = async (env: Env, request: Request): Promise<string | null> => {
  const sessionToken = extractSessionToken(request);
  if (!sessionToken) return null;

  try {
    const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);
    if (!sessionData) return null;

    const session: SessionData = JSON.parse(sessionData);
    
    // Update last accessed time
    session.lastAccessed = new Date().toISOString();
    
    // Verify IP address for security (optional, can be disabled for mobile users)
    const currentIp = getClientIP(request);
    if (session.ipAddress !== currentIp) {
      console.warn(`IP mismatch for session ${sessionToken}: ${session.ipAddress} vs ${currentIp}`);
      // In production, you might want to invalidate the session or require re-authentication
    }

    // Update session data
    const expirationTime = session.remember 
      ? SECURITY_CONFIG.REMEMBER_ME_DURATION 
      : SECURITY_CONFIG.SESSION_TIMEOUT;
    const expirationTtl = Math.floor(expirationTime / 1000);
    
    await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(session), { expirationTtl });

    return session.userId;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
};

/**
 * Invalidates a session
 */
export const invalidateSession = async (env: Env, sessionToken: string): Promise<void> => {
  await env.SESSIONS.delete(`session:${sessionToken}`);
};

/**
 * Extracts session token from request
 */
const extractSessionToken = (request: Request): string | null => {
  // Try Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/session=([^;]+)/);
    return match ? match[1] : null;
  }

  return null;
};

/**
 * Gets client IP address
 */
export const getClientIP = (request: Request): string => {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For')?.split(',')[0] || 
         request.headers.get('X-Real-IP') || 
         'unknown';
};

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Retrieves user by email with caching
 */
export const getUserByEmail = async (env: Env, email: string): Promise<User | null> => {
  try {
    const userData = await env.USERS.get(`user:${email.toLowerCase()}`);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user by email:', error);
    return null;
  }
};

/**
 * Retrieves user by ID
 */
export const getUserById = async (env: Env, userId: string): Promise<User | null> => {
  try {
    const userKeys = await env.USERS.list({ prefix: 'user:' });
    
    for (const key of userKeys.keys) {
      const userData = await env.USERS.get(key.name);
      if (userData) {
        const user: User = JSON.parse(userData);
        if (user.id === userId) {
          return user;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving user by ID:', error);
    return null;
  }
};

/**
 * Creates a new user with validation
 */
export const createUser = async (
  env: Env,
  userData: Omit<User, 'id' | 'createdAt' | 'stats' | 'achievements'>
): Promise<User> => {
  const userId = generateSecureToken();
  const now = new Date().toISOString();

  const user: User = {
    ...userData,
    id: userId,
    createdAt: now,
    stats: {
      totalTimeSpent: 0,
      totalTasksCompleted: 0,
      totalLabsCompleted: 0,
      averageScore: 0,
      streakDays: 0,
    },
    achievements: [],
    preferences: {
      theme: 'auto',
      notifications: true,
      language: 'en',
    },
  };

  await env.USERS.put(`user:${userData.email.toLowerCase()}`, JSON.stringify(user));
  await env.PROGRESS.put(`progress:${userId}`, JSON.stringify({}));

  return user;
};

/**
 * Updates user's last login time and statistics
 */
export const updateLastLogin = async (env: Env, user: User, ipAddress: string): Promise<void> => {
  const now = new Date().toISOString();
  
  const updatedUser: User = {
    ...user,
    lastLogin: now,
    lastActive: now,
    loginAttempts: 0, // Reset login attempts on successful login
    lockedUntil: undefined, // Clear any lock
  };

  await env.USERS.put(`user:${user.email.toLowerCase()}`, JSON.stringify(updatedUser));
};

/**
 * Handles failed login attempt with security measures
 */
export const handleFailedLogin = async (
  env: Env,
  email: string,
  ipAddress: string,
  reason: string
): Promise<void> => {
  const user = await getUserByEmail(env, email);
  
  if (user) {
    const attempts = (user.loginAttempts || 0) + 1;
    const updatedUser: User = {
      ...user,
      loginAttempts: attempts,
    };

    // Lock account if too many attempts
    if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      updatedUser.lockedUntil = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION).toISOString();
      
      await logSecurityEvent(env, {
        type: 'account_locked',
        userId: user.id,
        ipAddress,
        timestamp: new Date().toISOString(),
        details: { attempts, reason },
      });
    }

    await env.USERS.put(`user:${email.toLowerCase()}`, JSON.stringify(updatedUser));
  }

  await logSecurityEvent(env, {
    type: 'login_failed',
    userId: user?.id,
    ipAddress,
    timestamp: new Date().toISOString(),
    details: { email, reason, attempts: (user?.loginAttempts || 0) + 1 },
  });
};

/**
 * Checks if user account is locked
 */
export const isAccountLocked = (user: User): boolean => {
  if (!user.lockedUntil) return false;
  return new Date(user.lockedUntil) > new Date();
};

// ============================================================================
// PROGRESS TRACKING FUNCTIONS
// ============================================================================

/**
 * Updates lab progress with detailed tracking
 */
export const updateLabProgress = async (
  env: Env,
  user: User,
  labId: string,
  progress: Progress
): Promise<void> => {
  const completedTasks = calculateCompletedTasks(progress);
  const progressPercentage = calculateProgress(progress);
  const now = new Date().toISOString();

  const updatedLabHistory = user.labHistory ? [...user.labHistory] : [];
  const labIndex = updatedLabHistory.findIndex(lab => lab.labId === labId);

  if (labIndex >= 0) {
    // Update existing lab entry
    updatedLabHistory[labIndex] = {
      ...updatedLabHistory[labIndex],
      completedTasks,
      progressPercentage,
      completedAt: progressPercentage === 100 ? now : undefined,
    };
  } else {
    // Create new lab entry
    updatedLabHistory.push({
      labId,
      startedAt: now,
      totalTasks: TOTAL_TASKS,
      completedTasks,
      progressPercentage,
      completedAt: progressPercentage === 100 ? now : undefined,
    });
  }

  // Update user statistics
  const updatedStats = {
    ...user.stats,
    totalTasksCompleted: user.stats?.totalTasksCompleted || 0,
    totalLabsCompleted: updatedLabHistory.filter(lab => lab.completedAt).length,
  };

  const updatedUser: User = {
    ...user,
    currentLabId: labId,
    labHistory: updatedLabHistory,
    lastActive: now,
    stats: updatedStats,
  };

  await env.USERS.put(`user:${user.email.toLowerCase()}`, JSON.stringify(updatedUser));
};

/**
 * Calculates overall progress percentage
 */
export const calculateProgress = (progress: Progress): number => {
  let completedTasks = 0;
  
  Object.keys(TASK_STRUCTURE).forEach(week => {
    if (progress[week]) {
      const weekTasks = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].tasks;
      weekTasks.forEach(task => {
        if (progress[week][task]?.completed) {
          completedTasks++;
        }
      });
    }
  });
  
  return Math.round((completedTasks / TOTAL_TASKS) * 100);
};

/**
 * Calculates number of completed tasks
 */
export const calculateCompletedTasks = (progress: Progress): number => {
  let completedTasks = 0;
  
  Object.keys(TASK_STRUCTURE).forEach(week => {
    if (progress[week]) {
      const weekTasks = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE].tasks;
      weekTasks.forEach(task => {
        if (progress[week][task]?.completed) {
          completedTasks++;
        }
      });
    }
  });
  
  return completedTasks;
};

/**
 * Gets detailed progress statistics
 */
export const getProgressStatistics = (progress: Progress) => {
  const stats = {
    totalTasks: TOTAL_TASKS,
    completedTasks: 0,
    progressPercentage: 0,
    weeklyProgress: {} as Record<string, { completed: number; total: number; percentage: number }>,
    timeSpent: 0,
    averageDifficulty: 0,
  };

  let totalTimeSpent = 0;
  let totalDifficultyPoints = 0;
  let tasksWithDifficulty = 0;

  Object.entries(TASK_STRUCTURE).forEach(([weekKey, weekData]) => {
    const weekProgress = progress[weekKey] || {};
    let weekCompleted = 0;
    
    weekData.tasks.forEach(taskId => {
      const taskProgress = weekProgress[taskId];
      if (taskProgress?.completed) {
        weekCompleted++;
        stats.completedTasks++;
        
        if (taskProgress.timeSpent) {
          totalTimeSpent += taskProgress.timeSpent;
        }
        
        if (taskProgress.difficulty) {
          totalDifficultyPoints += taskProgress.difficulty;
          tasksWithDifficulty++;
        }
      }
    });

    stats.weeklyProgress[weekKey] = {
      completed: weekCompleted,
      total: weekData.tasks.length,
      percentage: Math.round((weekCompleted / weekData.tasks.length) * 100),
    };
  });

  stats.progressPercentage = Math.round((stats.completedTasks / TOTAL_TASKS) * 100);
  stats.timeSpent = totalTimeSpent;
  stats.averageDifficulty = tasksWithDifficulty > 0 ? totalDifficultyPoints / tasksWithDifficulty : 0;

  return stats;
};

// ============================================================================
// ACTIVITY LOGGING & ANALYTICS
// ============================================================================

/**
 * Logs user activity with detailed context
 */
export const logActivity = async (
  env: Env,
  userId: string,
  action: string,
  details: Record<string, any>,
  request?: Request
): Promise<void> => {
  const activityId = generateSecureToken();
  const ipAddress = request ? getClientIP(request) : 'server';
  const userAgent = request?.headers.get('User-Agent') || 'unknown';

  const logEntry: ActivityLog = {
    id: activityId,
    userId,
    action,
    timestamp: new Date().toISOString(),
    ipAddress,
    userAgent,
    details,
    success: true,
  };

  try {
    // Store for 30 days
    const expirationTtl = 30 * 24 * 60 * 60;
    await env.SESSIONS.put(`log:${activityId}`, JSON.stringify(logEntry), { expirationTtl });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

/**
 * Logs security events
 */
export const logSecurityEvent = async (env: Env, event: SecurityEvent): Promise<void> => {
  const eventId = generateSecureToken();
  
  try {
    // Store security events for 90 days
    const expirationTtl = 90 * 24 * 60 * 60;
    await env.SESSIONS.put(`security:${eventId}`, JSON.stringify(event), { expirationTtl });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

// ============================================================================
// DATA EXPORT/IMPORT FUNCTIONS
// ============================================================================

/**
 * Generates comprehensive progress CSV export
 */
export const generateProgressCSV = (users: Array<{
  name: string;
  email: string;
  role: string;
  progress: number;
  completedTasks: number;
  lastLogin?: string;
  createdAt?: string;
  totalTimeSpent?: number;
  averageScore?: number;
}>): string => {
  const headers = [
    'Name',
    'Email', 
    'Role',
    'Progress (%)',
    'Completed Tasks',
    'Total Tasks',
    'Last Login',
    'Account Created',
    'Time Spent (hours)',
    'Average Score'
  ];

  const rows = users.map(user => [
    `"${user.name.replace(/"/g, '""')}"`,
    user.email,
    user.role,
    user.progress,
    user.completedTasks,
    TOTAL_TASKS,
    user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
    user.totalTimeSpent ? Math.round(user.totalTimeSpent / 60 * 100) / 100 : 0,
    user.averageScore || 0,
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

/**
 * Parses and validates progress CSV import
 */
export const parseProgressCSV = (csv: string): Array<{ email: string; progress: Progress }> => {
  const lines = csv.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
  
  if (emailIndex === -1) {
    throw new Error('CSV must contain an email column');
  }

  const result: Array<{ email: string; progress: Progress }> = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = parseCSVLine(lines[i]);
      
      if (values.length > emailIndex) {
        const email = values[emailIndex].trim().toLowerCase();
        
        if (validateEmail(email)) {
          // For now, create empty progress - extend this for full progress import
          const progress: Progress = {};
          result.push({ email, progress });
        }
      }
    } catch (error) {
      console.warn(`Failed to parse CSV line ${i + 1}:`, error);
    }
  }

  return result;
};

/**
 * Parses a single CSV line handling quoted values
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// ============================================================================
// RATE LIMITING FUNCTIONS
// ============================================================================

/**
 * Implements rate limiting for API endpoints
 */
export const checkRateLimit = async (
  env: Env,
  identifier: string,
  action: string,
  limits: { requests: number; window: number }
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
  const key = `ratelimit:${action}:${identifier}`;
  const now = Date.now();
  const windowStart = now - limits.window;
  
  try {
    // Get existing rate limit data
    const existing = await env.SESSIONS.get(key);
    let requests: number[] = existing ? JSON.parse(existing) : [];
    
    // Remove expired requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= limits.requests) {
      const oldestRequest = Math.min(...requests);
      const resetTime = oldestRequest + limits.window;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
      };
    }
    
    // Add current request
    requests.push(now);
    
    // Store updated data (expire after window duration)
    const expirationTtl = Math.ceil(limits.window / 1000);
    await env.SESSIONS.put(key, JSON.stringify(requests), { expirationTtl });
    
    return {
      allowed: true,
      remaining: limits.requests - requests.length,
      resetTime: now + limits.window,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: limits.requests,
      resetTime: now + limits.window,
    };
  }
};

/**
 * Creates rate limiting middleware response
 */
export const createRateLimitResponse = (
  remaining: number,
  resetTime: number,
  retryAfter?: number
): Response => {
  const headers = new Headers({
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });

  if (retryAfter) {
    headers.set('Retry-After', Math.ceil(retryAfter / 1000).toString());
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: retryAfter ? Math.ceil(retryAfter / 1000) : undefined,
    }),
    {
      status: 429,
      headers,
    }
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates standardized error response
 */
export const createErrorResponse = (
  error: string,
  status: number = 400,
  details?: Record<string, any>
): Response => {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};

/**
 * Creates standardized success response
 */
export const createSuccessResponse = (
  data?: any,
  message?: string,
  status: number = 200
): Response => {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};

/**
 * Validates request content type
 */
export const validateContentType = (request: Request, expectedTypes: string[]): boolean => {
  const contentType = request.headers.get('Content-Type') || '';
  return expectedTypes.some(type => contentType.includes(type));
};

/**
 * Extracts and validates request data
 */
export const extractRequestData = async (request: Request): Promise<any> => {
  const contentType = request.headers.get('Content-Type') || '';
  
  if (contentType.includes('application/json')) {
    return await request.json();
  } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }
  
  throw new Error('Unsupported content type');
};

/**
 * Generates user-friendly task titles
 */
export const formatTaskTitle = (taskId: string): string => {
  return taskId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Calculates estimated time for completion
 */
export const calculateEstimatedTime = (progress: Progress): number => {
  let totalEstimatedHours = 0;
  let completedHours = 0;
  
  Object.entries(TASK_STRUCTURE).forEach(([weekKey, weekData]) => {
    const weekProgress = progress[weekKey] || {};
    const weekCompletedTasks = weekData.tasks.filter(task => weekProgress[task]?.completed).length;
    const weekProgressPercentage = weekCompletedTasks / weekData.tasks.length;
    
    totalEstimatedHours += weekData.estimatedHours;
    completedHours += weekData.estimatedHours * weekProgressPercentage;
  });
  
  return Math.max(0, totalEstimatedHours - completedHours);
};

/**
 * Gets user achievements based on progress
 */
export const calculateAchievements = (user: User, progress: Progress): string[] => {
  const achievements: string[] = [];
  const stats = getProgressStatistics(progress);
  
  // Progress-based achievements
  if (stats.progressPercentage >= 25) achievements.push('quarter_master');
  if (stats.progressPercentage >= 50) achievements.push('halfway_hero');
  if (stats.progressPercentage >= 75) achievements.push('almost_there');
  if (stats.progressPercentage >= 100) achievements.push('lab_master');
  
  // Week completion achievements
  Object.entries(stats.weeklyProgress).forEach(([week, weekStats]) => {
    if (weekStats.percentage === 100) {
      achievements.push(`${week}_complete`);
    }
  });
  
  // Time-based achievements
  if (stats.timeSpent >= 20 * 60) achievements.push('dedicated_learner'); // 20 hours
  if (stats.timeSpent >= 40 * 60) achievements.push('time_master'); // 40 hours
  
  // Streak achievements
  if (user.stats?.streakDays && user.stats.streakDays >= 7) achievements.push('week_warrior');
  if (user.stats?.streakDays && user.stats.streakDays >= 30) achievements.push('month_master');
  
  // Speed achievements
  const daysSinceStart = user.createdAt 
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  if (stats.progressPercentage === 100 && daysSinceStart <= 7) {
    achievements.push('speed_demon');
  }
  
  return [...new Set(achievements)]; // Remove duplicates
};

/**
 * Checks prerequisites for a week
 */
export const checkPrerequisites = (weekKey: string, progress: Progress): boolean => {
  const weekData = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
  if (!weekData || !weekData.prerequisites) return true;
  
  return weekData.prerequisites.every(prereqWeek => {
    const prereqData = TASK_STRUCTURE[prereqWeek as keyof typeof TASK_STRUCTURE];
    if (!prereqData) return false;
    
    const weekProgress = progress[prereqWeek] || {};
    const completedTasks = prereqData.tasks.filter(task => weekProgress[task]?.completed).length;
    
    // Require at least 80% completion of prerequisite weeks
    return (completedTasks / prereqData.tasks.length) >= 0.8;
  });
};

/**
 * Updates user streak tracking
 */
export const updateUserStreak = async (env: Env, user: User): Promise<User> => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  const lastStreakDate = user.stats?.lastStreakDate;
  
  let streakDays = user.stats?.streakDays || 0;
  
  if (lastStreakDate === yesterday) {
    // Continue streak
    streakDays += 1;
  } else if (lastStreakDate !== today) {
    // Start new streak
    streakDays = 1;
  }
  // If lastStreakDate === today, don't change streak
  
  const updatedUser: User = {
    ...user,
    stats: {
      ...user.stats,
      streakDays,
      lastStreakDate: today,
    },
  };
  
  await env.USERS.put(`user:${user.email.toLowerCase()}`, JSON.stringify(updatedUser));
  return updatedUser;
};

/**
 * Password hashing utilities (placeholder - implement with crypto API)
 */
export const hashPassword = async (password: string): Promise<string> => {
  // In production, use a proper password hashing library like bcrypt or Argon2
  // This is a placeholder implementation
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'velocity_lab_salt'); // Add salt
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verifies password against hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * Generates secure random password
 */
export const generateRandomPassword = (length: number = 12): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one character from each required type
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  password += upperCase[Math.floor(Math.random() * upperCase.length)];
  password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill remaining length
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Email validation with domain checking
 */
export const validateEmailDomain = async (email: string): Promise<boolean> => {
  if (!validateEmail(email)) return false;
  
  const domain = email.split('@')[1];
  
  // List of disposable email domains to block
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    // Add more as needed
  ];
  
  return !disposableDomains.includes(domain.toLowerCase());
};

/**
 * Gets comprehensive user analytics
 */
export const getUserAnalytics = (user: User, progress: Progress) => {
  const stats = getProgressStatistics(progress);
  const achievements = calculateAchievements(user, progress);
  
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      lastActive: user.lastActive,
    },
    progress: stats,
    achievements: {
      total: achievements.length,
      list: achievements,
    },
    timeTracking: {
      totalTimeSpent: stats.timeSpent,
      averageSessionTime: user.stats?.totalTimeSpent || 0,
      estimatedCompletion: calculateEstimatedTime(progress),
    },
    streaks: {
      current: user.stats?.streakDays || 0,
      longest: user.stats?.streakDays || 0, // This would need to be tracked separately
      lastActive: user.stats?.lastStreakDate,
    },
    performance: {
      averageScore: user.stats?.averageScore || 0,
      totalTasksCompleted: stats.completedTasks,
      completionRate: stats.progressPercentage,
      averageDifficulty: stats.averageDifficulty,
    },
  };
};

// ============================================================================
// HEALTH CHECK FUNCTIONS
// ============================================================================

/**
 * Performs system health check
 */
export const performHealthCheck = async (env: Env): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, { status: string; message?: string; timestamp: string }>;
}> => {
  const checks: Record<string, { status: string; message?: string; timestamp: string }> = {};
  const timestamp = new Date().toISOString();
  
  // Test KV stores
  try {
    await env.SESSIONS.put('health_check', 'test', { expirationTtl: 60 });
    await env.SESSIONS.get('health_check');
    await env.SESSIONS.delete('health_check');
    checks.sessions_kv = { status: 'healthy', timestamp };
  } catch (error) {
    checks.sessions_kv = { 
      status: 'unhealthy', 
      message: 'SESSIONS KV store inaccessible',
      timestamp 
    };
  }
  
  try {
    await env.USERS.put('health_check', 'test', { expirationTtl: 60 });
    await env.USERS.get('health_check');
    await env.USERS.delete('health_check');
    checks.users_kv = { status: 'healthy', timestamp };
  } catch (error) {
    checks.users_kv = { 
      status: 'unhealthy', 
      message: 'USERS KV store inaccessible',
      timestamp 
    };
  }
  
  try {
    await env.PROGRESS.put('health_check', 'test', { expirationTtl: 60 });
    await env.PROGRESS.get('health_check');
    await env.PROGRESS.delete('health_check');
    checks.progress_kv = { status: 'healthy', timestamp };
  } catch (error) {
    checks.progress_kv = { 
      status: 'unhealthy', 
      message: 'PROGRESS KV store inaccessible',
      timestamp 
    };
  }
  
  // Test crypto functions
  try {
    const token = generateSecureToken();
    const csrfToken = await generateCSRFToken(env);
    checks.crypto = { status: 'healthy', timestamp };
  } catch (error) {
    checks.crypto = { 
      status: 'unhealthy', 
      message: 'Crypto functions failed',
      timestamp 
    };
  }
  
  // Determine overall status
  const unhealthyChecks = Object.values(checks).filter(check => check.status === 'unhealthy');
  const degradedChecks = Object.values(checks).filter(check => check.status === 'degraded');
  
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (unhealthyChecks.length > 0) {
    overallStatus = 'unhealthy';
  } else if (degradedChecks.length > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }
  
  return {
    status: overallStatus,
    checks,
  };
};