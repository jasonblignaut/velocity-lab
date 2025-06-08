// functions/api/user/progress.js
// User Progress Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth 
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get user's progress from KV storage
    const userProgressKey = `user_progress:${session.userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let progress = {};
    if (progressData) {
      try {
        progress = JSON.parse(progressData);
      } catch (parseError) {
        console.error('Failed to parse progress data:', parseError);
        progress = {};
      }
    }
    
    // Ensure progress is an object
    if (typeof progress !== 'object' || progress === null || Array.isArray(progress)) {
      progress = {};
    }
    
    // Validate and clean progress data structure
    const cleanedProgress = {};
    Object.keys(progress).forEach(taskId => {
      const taskProgress = progress[taskId];
      
      // Ensure each task has proper structure
      if (typeof taskProgress === 'object' && taskProgress !== null) {
        cleanedProgress[taskId] = {
          completed: Boolean(taskProgress.completed),
          completedAt: taskProgress.completedAt || null,
          subtasks: typeof taskProgress.subtasks === 'object' ? taskProgress.subtasks : {},
          notes: typeof taskProgress.notes === 'string' ? taskProgress.notes : '',
          lastUpdated: taskProgress.lastUpdated || new Date().toISOString()
        };
      }
    });
    
    // Calculate overall statistics
    const totalTasks = Object.keys(cleanedProgress).length;
    const completedTasks = Object.values(cleanedProgress).filter(task => task.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate weekly progress
    const weeklyProgress = calculateWeeklyProgress(cleanedProgress);
    
    const responseData = {
      progress: cleanedProgress,
      statistics: {
        totalTasks,
        completedTasks,
        progressPercentage,
        weeklyProgress,
        lastUpdated: getLastUpdatedTime(cleanedProgress)
      }
    };
    
    return createResponse(responseData, true, 'Progress loaded successfully');
    
  } catch (error) {
    console.error('Progress retrieval error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to view progress', 401);
    }
    
    return createErrorResponse('Failed to load progress', 500);
  }
}

// POST endpoint to save user progress
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    let newProgressData;
    try {
      newProgressData = await request.json();
    } catch (jsonError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    
    // Validate the progress data structure
    if (!newProgressData || typeof newProgressData !== 'object') {
      return createErrorResponse('Invalid progress data format', 400);
    }
    
    // Get existing progress for merging
    const userProgressKey = `user_progress:${session.userId}`;
    const existingData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let existingProgress = {};
    if (existingData) {
      try {
        existingProgress = JSON.parse(existingData);
      } catch (parseError) {
        console.error('Failed to parse existing progress:', parseError);
        existingProgress = {};
      }
    }
    
    // Merge progress data (new data takes precedence)
    const mergedProgress = mergeProgressData(existingProgress, newProgressData);
    
    // Validate and clean the merged progress
    const cleanedProgress = validateAndCleanProgress(mergedProgress);
    
    // Add server timestamp
    Object.keys(cleanedProgress).forEach(taskId => {
      cleanedProgress[taskId].lastUpdated = new Date().toISOString();
    });
    
    // Save to KV storage
    await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(cleanedProgress));
    
    // Update user's last activity
    await updateUserLastActivity(session.userId, env);
    
    // Calculate statistics for response
    const totalTasks = Object.keys(cleanedProgress).length;
    const completedTasks = Object.values(cleanedProgress).filter(task => task.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const responseData = {
      progress: cleanedProgress,
      statistics: {
        totalTasks,
        completedTasks,
        progressPercentage,
        weeklyProgress: calculateWeeklyProgress(cleanedProgress),
        lastUpdated: new Date().toISOString()
      }
    };
    
    return createResponse(responseData, true, 'Progress saved successfully');
    
  } catch (error) {
    console.error('Progress save error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to save progress', 401);
    }
    
    return createErrorResponse('Failed to save progress', 500);
  }
}

// PUT endpoint to update specific task progress
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    let updateData;
    try {
      updateData = await request.json();
    } catch (jsonError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    
    // Validate required fields
    if (!updateData.taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    // Get existing progress
    const userProgressKey = `user_progress:${session.userId}`;
    const existingData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let progress = {};
    if (existingData) {
      try {
        progress = JSON.parse(existingData);
      } catch (parseError) {
        progress = {};
      }
    }
    
    // Update specific task
    const taskId = updateData.taskId;
    const taskUpdate = updateData.taskProgress || {};
    
    // Merge with existing task data
    progress[taskId] = {
      ...progress[taskId],
      ...taskUpdate,
      lastUpdated: new Date().toISOString()
    };
    
    // Validate the updated task
    progress[taskId] = validateTaskProgress(progress[taskId]);
    
    // Save updated progress
    await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
    
    // Update user's last activity
    await updateUserLastActivity(session.userId, env);
    
    return createResponse(progress[taskId], true, 'Task progress updated successfully');
    
  } catch (error) {
    console.error('Task progress update error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to update progress', 401);
    }
    
    return createErrorResponse('Failed to update task progress', 500);
  }
}

// DELETE endpoint to reset progress
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const resetAll = url.searchParams.get('resetAll') === 'true';
    
    const userProgressKey = `user_progress:${session.userId}`;
    
    if (resetAll) {
      // Reset all progress
      await env.VELOCITY_PROGRESS.delete(userProgressKey);
      return createResponse({}, true, 'All progress reset successfully');
    } else if (taskId) {
      // Reset specific task
      const existingData = await env.VELOCITY_PROGRESS.get(userProgressKey);
      
      if (existingData) {
        let progress = JSON.parse(existingData);
        delete progress[taskId];
        
        if (Object.keys(progress).length > 0) {
          await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
        } else {
          await env.VELOCITY_PROGRESS.delete(userProgressKey);
        }
      }
      
      return createResponse({ taskId }, true, 'Task progress reset successfully');
    } else {
      return createErrorResponse('Either taskId or resetAll parameter is required', 400);
    }
    
  } catch (error) {
    console.error('Progress reset error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to reset progress', 401);
    }
    
    return createErrorResponse('Failed to reset progress', 500);
  }
}

// Helper function to merge progress data
function mergeProgressData(existing, newData) {
  const merged = { ...existing };
  
  Object.keys(newData).forEach(taskId => {
    const existingTask = merged[taskId] || {};
    const newTask = newData[taskId];
    
    if (typeof newTask === 'object' && newTask !== null) {
      merged[taskId] = {
        ...existingTask,
        ...newTask,
        subtasks: {
          ...(existingTask.subtasks || {}),
          ...(newTask.subtasks || {})
        }
      };
    }
  });
  
  return merged;
}

// Helper function to validate and clean progress structure
function validateAndCleanProgress(progress) {
  const cleaned = {};
  
  Object.keys(progress).forEach(taskId => {
    const task = progress[taskId];
    if (typeof task === 'object' && task !== null) {
      cleaned[taskId] = validateTaskProgress(task);
    }
  });
  
  return cleaned;
}

// Helper function to validate individual task progress
function validateTaskProgress(task) {
  return {
    completed: Boolean(task.completed),
    completedAt: task.completed && task.completedAt ? task.completedAt : null,
    subtasks: typeof task.subtasks === 'object' && task.subtasks !== null ? task.subtasks : {},
    notes: typeof task.notes === 'string' ? task.notes.trim() : '',
    lastUpdated: task.lastUpdated || new Date().toISOString()
  };
}

// Helper function to calculate weekly progress
function calculateWeeklyProgress(progress) {
  const weeklyStats = {
    week1: { total: 0, completed: 0 },
    week2: { total: 0, completed: 0 },
    week3: { total: 0, completed: 0 },
    week4: { total: 0, completed: 0 }
  };
  
  Object.keys(progress).forEach(taskId => {
    // Extract week number from task ID (e.g., "week1-task1" -> 1)
    const weekMatch = taskId.match(/week(\d+)/);
    if (weekMatch) {
      const weekNum = parseInt(weekMatch[1]);
      const weekKey = `week${weekNum}`;
      
      if (weeklyStats[weekKey]) {
        weeklyStats[weekKey].total++;
        if (progress[taskId].completed) {
          weeklyStats[weekKey].completed++;
        }
      }
    }
  });
  
  // Calculate percentages
  Object.keys(weeklyStats).forEach(week => {
    const stats = weeklyStats[week];
    stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  });
  
  return weeklyStats;
}

// Helper function to get last updated time
function getLastUpdatedTime(progress) {
  let lastUpdated = null;
  
  Object.values(progress).forEach(task => {
    if (task.lastUpdated) {
      if (!lastUpdated || new Date(task.lastUpdated) > new Date(lastUpdated)) {
        lastUpdated = task.lastUpdated;
      }
    }
  });
  
  return lastUpdated || new Date().toISOString();
}

// Helper function to update user's last activity
async function updateUserLastActivity(userId, env) {
  try {
    const userKey = `user:${userId}`;
    const userData = await env.VELOCITY_USERS.get(userKey);
    
    if (userData) {
      const user = JSON.parse(userData);
      user.lastActive = new Date().toISOString();
      await env.VELOCITY_USERS.put(userKey, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Failed to update user last activity:', error);
    // Don't throw error, as this is not critical
  }
}