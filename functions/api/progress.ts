// progress.js - Backend progress handling for Velocity Lab
// This should be integrated into your Express.js backend

const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with database in production)
let progressData = {};
let userSessions = {};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  // Check if user is logged in (implement your auth logic)
  const user = req.session?.user || req.cookies?.user;
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.user = typeof user === 'string' ? JSON.parse(user) : user;
  next();
};

// GET /api/progress - Load user's progress
router.get('/progress', requireAuth, (req, res) => {
  try {
    const userId = req.user.id || req.user.email; // Use email as fallback ID
    
    // Initialize empty progress if user doesn't exist
    if (!progressData[userId]) {
      progressData[userId] = {
        week1: {},
        week2: {},
        week3: {},
        week4: {},
        lastUpdated: new Date().toISOString(),
        totalTasks: 42,
        completedTasks: 0
      };
    }
    
    console.log(`Loading progress for user: ${userId}`);
    res.json(progressData[userId]);
  } catch (error) {
    console.error('Error loading progress:', error);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// POST /api/progress - Save user's progress
router.post('/progress', requireAuth, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const { task, week, checked, subtask, subtask_checked } = req.body;
    
    // Initialize progress if doesn't exist
    if (!progressData[userId]) {
      progressData[userId] = {
        week1: {},
        week2: {},
        week3: {},
        week4: {},
        lastUpdated: new Date().toISOString(),
        totalTasks: 42,
        completedTasks: 0
      };
    }
    
    // Initialize week data if doesn't exist
    if (!progressData[userId][week]) {
      progressData[userId][week] = {};
    }
    
    // Initialize task data if doesn't exist
    if (!progressData[userId][week][task]) {
      progressData[userId][week][task] = {
        completed: false,
        subtasks: {},
        lastUpdated: new Date().toISOString()
      };
    }
    
    const taskData = progressData[userId][week][task];
    
    // Update subtask if provided
    if (subtask !== undefined) {
      taskData.subtasks[subtask] = subtask_checked === 'true';
      console.log(`Updated subtask ${subtask} for ${week}-${task}: ${subtask_checked}`);
    }
    
    // Update main task
    if (checked !== undefined) {
      taskData.completed = checked === 'true';
      console.log(`Updated task ${week}-${task}: ${checked}`);
    }
    
    taskData.lastUpdated = new Date().toISOString();
    progressData[userId].lastUpdated = new Date().toISOString();
    
    // Calculate total completed tasks
    let completedCount = 0;
    Object.values(progressData[userId]).forEach(weekData => {
      if (typeof weekData === 'object' && weekData !== null && !Array.isArray(weekData)) {
        Object.values(weekData).forEach(taskData => {
          if (taskData && taskData.completed) {
            completedCount++;
          }
        });
      }
    });
    progressData[userId].completedTasks = completedCount;
    
    console.log(`Progress saved for user ${userId}. Total completed: ${completedCount}/42`);
    
    res.json({ 
      success: true, 
      completedTasks: completedCount,
      totalTasks: 42,
      progress: Math.round((completedCount / 42) * 100)
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// POST /api/lab/start-new - Start a new lab session
router.post('/lab/start-new', requireAuth, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    
    // Save current progress to history (in production, save to database)
    const currentProgress = progressData[userId];
    if (currentProgress && currentProgress.completedTasks > 0) {
      // Save to history (implement history storage)
      console.log(`Saving progress to history for user ${userId}`);
    }
    
    // Reset progress
    progressData[userId] = {
      week1: {},
      week2: {},
      week3: {},
      week4: {},
      lastUpdated: new Date().toISOString(),
      totalTasks: 42,
      completedTasks: 0,
      labStarted: new Date().toISOString()
    };
    
    console.log(`Started new lab for user ${userId}`);
    
    res.json({ 
      success: true, 
      message: 'New lab started successfully',
      progress: progressData[userId]
    });
  } catch (error) {
    console.error('Error starting new lab:', error);
    res.status(500).json({ error: 'Failed to start new lab' });
  }
});

// GET /api/csrf - Get CSRF token
router.get('/csrf', (req, res) => {
  // Generate a simple CSRF token (in production, use proper CSRF protection)
  const token = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  
  // Store token in session
  req.session = req.session || {};
  req.session.csrfToken = token;
  
  res.json({ token });
});

// POST /api/login - User login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Simple demo login (replace with proper authentication)
    if (email && password) {
      const user = {
        id: email.split('@')[0], // Use email prefix as ID
        email: email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        role: email.includes('admin') ? 'admin' : 'user',
        lastLogin: new Date().toISOString()
      };
      
      // Store user in session
      req.session = req.session || {};
      req.session.user = user;
      
      console.log(`User logged in: ${email}`);
      
      res.json({
        success: true,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ error: 'Email and password required' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/register - User registration
router.post('/register', (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    
    // Simple demo registration (replace with proper user creation)
    if (name && email && password) {
      const user = {
        id: email.split('@')[0], // Use email prefix as ID
        email: email,
        name: name,
        company: company || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Store user in session
      req.session = req.session || {};
      req.session.user = user;
      
      console.log(`User registered: ${email}`);
      
      res.json({
        success: true,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ error: 'Name, email and password required' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/logout - User logout
router.post('/logout', (req, res) => {
  try {
    // Clear session
    req.session = null;
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Admin routes
router.get('/admin/overview', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Calculate overview stats
    const userCount = Object.keys(progressData).length;
    let totalCompletion = 0;
    let completedLabs = 0;
    
    Object.values(progressData).forEach(userData => {
      if (userData.completedTasks) {
        totalCompletion += userData.completedTasks;
        if (userData.completedTasks === 42) {
          completedLabs++;
        }
      }
    });
    
    const averageCompletion = userCount > 0 ? Math.round((totalCompletion / (userCount * 42)) * 100) : 0;
    
    res.json({
      totalUsers: userCount,
      newUsersToday: 0, // Implement based on registration dates
      activeUsers: userCount, // Implement based on recent activity
      averageCompletion: averageCompletion,
      labsCompleted: completedLabs
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to load admin overview' });
  }
});

// GET /api/admin/users - Get all users (admin only)
router.get('/admin/users', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Return mock users data (replace with database query)
    const users = Object.keys(progressData).map(userId => {
      const userData = progressData[userId];
      const progress = userData.completedTasks ? Math.round((userData.completedTasks / 42) * 100) : 0;
      
      return {
        id: userId,
        name: userId.charAt(0).toUpperCase() + userId.slice(1),
        email: `${userId}@example.com`,
        company: 'Demo Company',
        role: userId.includes('admin') ? 'admin' : 'user',
        progress: progress,
        lastActive: userData.lastUpdated || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// POST /api/admin/export-users - Export users data (admin only)
router.post('/admin/export-users', requireAuth, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Generate CSV data
    let csvData = 'Name,Email,Company,Role,Progress,Last Active\n';
    
    Object.keys(progressData).forEach(userId => {
      const userData = progressData[userId];
      const progress = userData.completedTasks ? Math.round((userData.completedTasks / 42) * 100) : 0;
      
      csvData += `${userId},${userId}@example.com,Demo Company,user,${progress}%,${userData.lastUpdated || 'Never'}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
    res.send(csvData);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Failed to export users' });
  }
});

// POST /api/profile/export-data - Export user's own data
router.post('/profile/export-data', requireAuth, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const userData = progressData[userId] || {};
    
    // Create export data
    const exportData = {
      user: req.user,
      progress: userData,
      exportDate: new Date().toISOString(),
      totalTasks: 42,
      completedTasks: userData.completedTasks || 0,
      completionPercentage: userData.completedTasks ? Math.round((userData.completedTasks / 42) * 100) : 0
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=velocity-lab-data-${userId}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// GET /api/profile/lab-history - Get user's lab history
router.get('/profile/lab-history', requireAuth, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    
    // Mock lab history data (replace with database query)
    const history = [
      {
        id: 1,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        completedAt: null,
        completedTasks: progressData[userId]?.completedTasks || 0,
        totalTasks: 42,
        progressPercentage: progressData[userId]?.completedTasks ? 
          Math.round((progressData[userId].completedTasks / 42) * 100) : 0,
        durationDays: 7
      }
    ];
    
    res.json(history);
  } catch (error) {
    console.error('Lab history error:', error);
    res.status(500).json({ error: 'Failed to load lab history' });
  }
});

// POST /api/profile/change-password - Change user password
router.post('/profile/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    // In production, verify current password and hash new password
    console.log(`Password changed for user: ${req.user.email}`);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Utility function to initialize demo data
function initializeDemoData() {
  // Create some demo progress data
  const demoUsers = ['demo', 'admin', 'testuser'];
  
  demoUsers.forEach(userId => {
    if (!progressData[userId]) {
      progressData[userId] = {
        week1: {
          'install-server2012': { completed: true, subtasks: { '1': true, '2': true, '3': true } },
          'configure-static-ip': { completed: true, subtasks: {} },
          'install-adds-role': { completed: false, subtasks: {} }
        },
        week2: {},
        week3: {},
        week4: {},
        lastUpdated: new Date().toISOString(),
        totalTasks: 42,
        completedTasks: 2,
        labStarted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      };
    }
  });
  
  console.log('Demo data initialized');
}

// Initialize demo data on startup
initializeDemoData();

module.exports = router;

// Example Express.js integration:
/*
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const progressRoutes = require('./progress');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Serve static files
app.use(express.static('public'));

// API routes
app.use('/api', progressRoutes);

// Serve HTML files
app.get('/', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.get('/dashboard', (req, res) => res.sendFile(__dirname + '/public/dashboard.html'));
app.get('/profile', (req, res) => res.sendFile(__dirname + '/public/profile.html'));
app.get('/admin', (req, res) => res.sendFile(__dirname + '/public/admin.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Velocity Lab server running on port ${PORT}`);
});
*/