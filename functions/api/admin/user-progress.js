// functions/api/admin/users-progress.js
// Admin Users Progress Leaderboard Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAdmin 
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    await requireAdmin(request, env);
    
    // Get all users from KV storage
    const userKeys = await env.VELOCITY_USERS.list({ prefix: 'user:' });
    const users = [];
    
    // Fetch user data and progress for each user
    for (const key of userKeys.keys) {
      try {
        const userData = await env.VELOCITY_USERS.get(key.name);
        if (!userData) continue;
        
        const user = JSON.parse(userData);
        
        // Skip inactive users
        if (!user.isActive) continue;
        
        // Get user progress
        const progressData = await env.VELOCITY_PROGRESS.get(`progress:${user.id}`);
        const progress = progressData ? JSON.parse(progressData) : { tasks: {} };
        
        // Calculate completed tasks (total is 42 based on task definitions)
        const tasks = progress.tasks || {};
        const completedTasks = Object.values(tasks).filter(task => task.completed).length;
        const progressPercentage = Math.round((completedTasks / 42) * 100);
        
        // Check if user has any notes
        const notesKeys = await env.VELOCITY_PROGRESS.list({ prefix: `notes:${user.id}:` });
        const hasNotes = notesKeys.keys.length > 0;
        
        // Add user to results
        users.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          completedTasks: completedTasks,
          progressPercentage: progressPercentage,
          hasNotes: hasNotes,
          lastActive: user.lastActive,
          createdAt: user.createdAt
        });
        
      } catch (error) {
        console.warn(`Failed to process user ${key.name}:`, error);
        // Continue processing other users
      }
    }
    
    // Sort users by progress percentage (descending), then by completed tasks, then by creation date
    users.sort((a, b) => {
      if (b.progressPercentage !== a.progressPercentage) {
        return b.progressPercentage - a.progressPercentage;
      }
      if (b.completedTasks !== a.completedTasks) {
        return b.completedTasks - a.completedTasks;
      }
      return new Date(a.createdAt) - new Date(b.createdAt); // Earlier users rank higher if tied
    });
    
    return createResponse(users, true, 'Users progress loaded successfully');
    
  } catch (error) {
    console.error('Admin users progress error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin access required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    return createErrorResponse('Failed to load users progress', 500);
  }
}