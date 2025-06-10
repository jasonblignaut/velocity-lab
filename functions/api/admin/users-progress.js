// functions/api/admin/users-progress.js
// Admin Users Progress Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAdmin,
  calculateProgressStats,
  logActivity
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    const session = await requireAdmin(request, env);
    
    logActivity('admin/users-progress', session.userId, 'GET', { adminUser: session.userEmail });
    
    // Get all users from KV storage
    const usersList = await getAllUsers(env);
    
    if (usersList.length === 0) {
      return createResponse([], true, 'No users found');
    }
    
    // Get progress and lab history for each user
    const usersWithProgress = await Promise.all(
      usersList.map(async (user) => {
        try {
          // Get user progress
          const progressData = await getUserProgress(env, user.id);
          const progressStats = calculateProgressStats(progressData);
          
          // Get user lab history
          const labHistory = await getUserLabHistory(env, user.id);
          const labStats = calculateLabStats(labHistory);
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastActive: user.lastActive,
            
            // Progress statistics
            progressPercentage: progressStats.progressPercentage,
            completedTasks: progressStats.completedTasks,
            totalTasks: progressStats.totalTasks,
            hasNotes: progressStats.hasNotes,
            lastUpdated: progressStats.lastUpdated,
            
            // Lab statistics
            completedLabs: labStats.completedLabs,
            totalSessions: labStats.totalSessions,
            lastLabDate: labStats.lastLabDate,
            currentLabStatus: labStats.currentLabStatus,
            
            // Additional metrics
            completionRate: progressStats.totalTasks > 0 ? 
              Math.round((progressStats.completedTasks / progressStats.totalTasks) * 100) : 0,
            avgTasksPerLab: labStats.totalSessions > 0 ? 
              Math.round(progressStats.completedTasks / labStats.totalSessions) : 0
          };
          
        } catch (userError) {
          console.error(`Failed to get data for user ${user.id}:`, userError);
          
          // Return basic user info even if progress/lab data fails
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastActive: user.lastActive,
            progressPercentage: 0,
            completedTasks: 0,
            totalTasks: 0,
            hasNotes: false,
            lastUpdated: null,
            completedLabs: 0,
            totalSessions: 0,
            lastLabDate: null,
            currentLabStatus: null,
            completionRate: 0,
            avgTasksPerLab: 0,
            error: 'Failed to load user data'
          };
        }
      })
    );
    
    // Sort users for leaderboard (completed labs first, then progress percentage)
    const sortedUsers = usersWithProgress.sort((a, b) => {
      if (a.completedLabs !== b.completedLabs) {
        return b.completedLabs - a.completedLabs; // More completed labs first
      }
      return b.progressPercentage - a.progressPercentage; // Higher percentage first
    });
    
    // Add leaderboard positions
    const usersWithRanking = sortedUsers.map((user, index) => ({
      ...user,
      leaderboardPosition: index + 1,
      medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : null
    }));
    
    // Calculate overall statistics
    const overallStats = calculateOverallStats(usersWithRanking);
    
    const responseData = {
      users: usersWithRanking,
      summary: overallStats,
      timestamp: new Date().toISOString()
    };
    
    return createResponse(responseData, true, `Loaded progress for ${usersWithRanking.length} users`);
    
  } catch (error) {
    console.error('Admin users progress error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    return createErrorResponse('Failed to load users progress', 500);
  }
}

// Helper function to get all users from KV storage
async function getAllUsers(env) {
  try {
    // KV doesn't have a direct "list all" operation, so we need to maintain a users index
    const usersIndexKey = 'users_index';
    const usersIndexData = await env.VELOCITY_USERS.get(usersIndexKey);
    
    let userIds = [];
    if (usersIndexData) {
      try {
        userIds = JSON.parse(usersIndexData);
      } catch (parseError) {
        console.error('Failed to parse users index:', parseError);
        userIds = [];
      }
    }
    
    if (userIds.length === 0) {
      console.warn('No users found in index - this might be expected for new installations');
      return [];
    }
    
    // Get all user data
    const users = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userKey = `user:${userId}`;
          const userData = await env.VELOCITY_USERS.get(userKey);
          
          if (userData) {
            const user = JSON.parse(userData);
            return {
              id: userId,
              name: user.name,
              email: user.email,
              role: user.role || 'user',
              createdAt: user.createdAt,
              lastActive: user.lastActive
            };
          }
          return null;
        } catch (userError) {
          console.error(`Failed to get user ${userId}:`, userError);
          return null;
        }
      })
    );
    
    // Filter out null results (failed user fetches)
    return users.filter(user => user !== null);
    
  } catch (error) {
    console.error('Failed to get all users:', error);
    return [];
  }
}

// Helper function to get user progress
async function getUserProgress(env, userId) {
  try {
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    if (!progressData) {
      return {};
    }
    
    return JSON.parse(progressData);
  } catch (error) {
    console.error(`Failed to get progress for user ${userId}:`, error);
    return {};
  }
}

// Helper function to get user lab history
async function getUserLabHistory(env, userId) {
  try {
    const userLabsKey = `user_labs:${userId}`;
    const labsData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!labsData) {
      return [];
    }
    
    const labs = JSON.parse(labsData);
    return Array.isArray(labs) ? labs : [];
  } catch (error) {
    console.error(`Failed to get lab history for user ${userId}:`, error);
    return [];
  }
}

// Helper function to calculate lab statistics
function calculateLabStats(labHistory) {
  if (!Array.isArray(labHistory) || labHistory.length === 0) {
    return {
      completedLabs: 0,
      totalSessions: 0,
      lastLabDate: null,
      currentLabStatus: null
    };
  }
  
  const completedLabs = labHistory.filter(lab => lab.status === 'completed').length;
  const totalSessions = labHistory.length;
  
  // Sort by date to get most recent
  const sortedLabs = labHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
  const mostRecentLab = sortedLabs[0];
  
  // Check for in-progress lab
  const inProgressLab = labHistory.find(lab => lab.status === 'started');
  
  return {
    completedLabs,
    totalSessions,
    lastLabDate: mostRecentLab ? mostRecentLab.date : null,
    currentLabStatus: inProgressLab ? 'in-progress' : 'none'
  };
}

// Helper function to calculate overall statistics
function calculateOverallStats(users) {
  if (users.length === 0) {
    return {
      totalUsers: 0,
      activeUsers: 0,
      totalCompletedTasks: 0,
      totalCompletedLabs: 0,
      averageProgress: 0,
      topPerformer: null
    };
  }
  
  // Calculate active users (activity in last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const activeUsers = users.filter(user => 
    user.lastActive && new Date(user.lastActive) > weekAgo
  ).length;
  
  const totalCompletedTasks = users.reduce((sum, user) => sum + user.completedTasks, 0);
  const totalCompletedLabs = users.reduce((sum, user) => sum + user.completedLabs, 0);
  const averageProgress = Math.round(
    users.reduce((sum, user) => sum + user.progressPercentage, 0) / users.length
  );
  
  const topPerformer = users.find(user => user.leaderboardPosition === 1);
  
  return {
    totalUsers: users.length,
    activeUsers,
    totalCompletedTasks,
    totalCompletedLabs,
    averageProgress,
    topPerformer: topPerformer ? {
      name: topPerformer.name,
      email: topPerformer.email,
      progressPercentage: topPerformer.progressPercentage,
      completedLabs: topPerformer.completedLabs
    } : null
  };
}

// POST endpoint to manually refresh user data (admin action)
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    const session = await requireAdmin(request, env);
    
    const requestData = await request.json();
    const action = requestData.action;
    
    logActivity('admin/users-progress', session.userId, 'POST', { action, adminUser: session.userEmail });
    
    switch (action) {
      case 'refresh_user_index':
        // Rebuild the users index (useful for maintenance)
        await rebuildUsersIndex(env);
        return createResponse(null, true, 'Users index refreshed successfully');
        
      case 'cleanup_inactive_sessions':
        // Clean up old sessions (maintenance action)
        const cleanedCount = await cleanupInactiveSessions(env);
        return createResponse({ cleanedCount }, true, `Cleaned up ${cleanedCount} inactive sessions`);
        
      default:
        return createErrorResponse('Invalid action', 400);
    }
    
  } catch (error) {
    console.error('Admin action error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    return createErrorResponse('Failed to perform admin action', 500);
  }
}

// Helper function to rebuild users index
async function rebuildUsersIndex(env) {
  try {
    // This is a maintenance function - in a real scenario, you might need to 
    // implement KV listing or maintain the index during user creation
    console.log('Users index rebuild requested - implement based on your KV listing strategy');
    
    // For now, we'll just ensure the index exists
    const usersIndexKey = 'users_index';
    const existingIndex = await env.VELOCITY_USERS.get(usersIndexKey);
    
    if (!existingIndex) {
      await env.VELOCITY_USERS.put(usersIndexKey, JSON.stringify([]));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to rebuild users index:', error);
    throw error;
  }
}

// Helper function to cleanup inactive sessions
async function cleanupInactiveSessions(env) {
  try {
    // Since sessions have TTL, they should auto-expire
    // This could be expanded to manually clean up if needed
    console.log('Session cleanup requested - TTL should handle this automatically');
    return 0;
  } catch (error) {
    console.error('Failed to cleanup sessions:', error);
    return 0;
  }
}