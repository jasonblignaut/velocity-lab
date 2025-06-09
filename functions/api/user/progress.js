// functions/api/user/progress.js
// User Progress Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  updateUserActivity,
  parseRequestJSON,
  validateTaskId,
  calculateProgressStats,
  logActivity
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    logActivity('user/progress', session.userId, 'GET');
    
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
          completedAt: taskProgress.completed && taskProgress.completedAt ? taskProgress.completedAt : null,
          subtasks: typeof taskProgress.subtasks === 'object' && taskProgress.subtasks !== null ? taskProgress.subtasks : {},
          notes: typeof taskProgress.notes === 'string' ? taskProgress.notes.trim() : '',
          lastUpdated: taskProgress.lastUpdated || new Date().toISOString()
        };
      }
    });
    
    // Calculate overall statistics
    const stats = calculateProgressStats(cleanedProgress);
    
    // Calculate weekly progress breakdown
    const weeklyProgress = calculateWeeklyProgress(cleanedProgress);
    
    const responseData = cleanedProgress;
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(responseData, true, 'Progress loaded successfully');
    
  } catch (error) {
    console.error('Progress retrieval error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to view progress', 401);
    }
    
    return createErrorResponse('Failed to load progress', 500);
  }
}

// POST endpoint to save user progress (bulk update)
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    let newProgressData;
    try {
      newProgressData = await parseRequestJSON(request);
    } catch (jsonError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    
    logActivity('user/progress', session.userId, 'POST', { 
      tasksUpdated: Object.keys(newProgressData).length 
    });
    
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
    
    // Add server timestamp to all updated tasks
    const updateTimestamp = new Date().toISOString();
    Object.keys(newProgressData).forEach(taskId => {
      if (cleanedProgress[taskId]) {
        cleanedProgress[taskId].lastUpdated = updateTimestamp;
      }
    });
    
    // Save to KV storage
    await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(cleanedProgress));
    
    // Update user's last activity
    await updateUserActivity(env, session.userId);
    
    // Calculate statistics for response
    const stats = calculateProgressStats(cleanedProgress);
    
    const responseData = {
      progress: cleanedProgress,
      statistics: stats
    };
    
    return createResponse(responseData, true, 'Progress saved successfully');
    
  } catch (error) {
    console.error('Progress save error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to save progress', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
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
      updateData = await parseRequestJSON(request);
    } catch (jsonError) {
      return createErrorResponse('Invalid JSON in request body', 400);
    }
    
    // Validate required fields
    if (!updateData.taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    const taskId = validateTaskId(updateData.taskId);
    if (!taskId) {
      return createErrorResponse('Invalid task ID format', 400);
    }
    
    logActivity('user/progress', session.userId, 'PUT', { 
      taskId,
      completed: updateData.completed 
    });
    
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
    
    // Initialize task if it doesn't exist
    if (!progress[taskId]) {
      progress[taskId] = {
        completed: false,
        completedAt: null,
        subtasks: {},
        notes: '',
        lastUpdated: new Date().toISOString()
      };
    }
    
    // Merge with existing task data
    const updatedTask = {
      ...progress[taskId],
      ...updateData,
      lastUpdated: new Date().toISOString()
    };
    
    // Validate the updated task
    progress[taskId] = validateTaskProgress(updatedTask);
    
    // If task is being marked as completed, set timestamp
    if (updateData.completed === true && !progress[taskId].completedAt) {
      progress[taskId].completedAt = new Date().toISOString();
    } else if (updateData.completed === false) {
      progress[taskId].completedAt = null;
    }
    
    // Save updated progress
    await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
    
    // Update user's last activity
    await updateUserActivity(env, session.userId);
    
    // Calculate updated statistics
    const stats = calculateProgressStats(progress);
    
    const responseData = {
      task: progress[taskId],
      taskId,
      statistics: stats
    };
    
    return createResponse(responseData, true, 'Task progress updated successfully');
    
  } catch (error) {
    console.error('Task progress update error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to update progress', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
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
    const resetCompleted = url.searchParams.get('resetCompleted') === 'true';
    
    const userProgressKey = `user_progress:${session.userId}`;
    
    if (resetAll) {
      // Reset all progress
      logActivity('user/progress', session.userId, 'DELETE_ALL');
      
      await env.VELOCITY_PROGRESS.delete(userProgressKey);
      await updateUserActivity(env, session.userId);
      
      return createResponse(null, true, 'All progress reset successfully');
      
    } else if (resetCompleted) {
      // Reset only completed tasks
      logActivity('user/progress', session.userId, 'RESET_COMPLETED');
      
      const existingData = await env.VELOCITY_PROGRESS.get(userProgressKey);
      
      if (existingData) {
        let progress = JSON.parse(existingData);
        
        // Reset completion status but keep notes and subtasks
        Object.keys(progress).forEach(tid => {
          if (progress[tid].completed) {
            progress[tid].completed = false;
            progress[tid].completedAt = null;
            progress[tid].lastUpdated = new Date().toISOString();
          }
        });
        
        await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
      }
      
      await updateUserActivity(env, session.userId);
      return createResponse(null, true, 'Completed tasks reset successfully');
      
    } else if (taskId) {
      // Reset specific task
      const validTaskId = validateTaskId(taskId);
      if (!validTaskId) {
        return createErrorResponse('Invalid task ID format', 400);
      }
      
      logActivity('user/progress', session.userId, 'DELETE_TASK', { taskId: validTaskId });
      
      const existingData = await env.VELOCITY_PROGRESS.get(userProgressKey);
      
      if (existingData) {
        let progress = JSON.parse(existingData);
        delete progress[validTaskId];
        
        if (Object.keys(progress).length > 0) {
          await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
        } else {
          await env.VELOCITY_PROGRESS.delete(userProgressKey);
        }
      }
      
      await updateUserActivity(env, session.userId);
      return createResponse({ taskId: validTaskId }, true, 'Task progress reset successfully');
      
    } else {
      return createErrorResponse('Either taskId, resetAll, or resetCompleted parameter is required', 400);
    }
    
  } catch (error) {
    console.error('Progress reset error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
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
    const validTaskId = validateTaskId(taskId);
    if (validTaskId) {
      const task = progress[taskId];
      if (typeof task === 'object' && task !== null) {
        cleaned[validTaskId] = validateTaskProgress(task);
      }
    }
  });
  
  return cleaned;
}

// Helper function to validate individual task progress
function validateTaskProgress(task) {
  const validated = {
    completed: Boolean(task.completed),
    completedAt: null,
    subtasks: {},
    notes: '',
    lastUpdated: task.lastUpdated || new Date().toISOString()
  };
  
  // Set completedAt only if task is completed
  if (validated.completed && task.completedAt) {
    validated.completedAt = task.completedAt;
  } else if (validated.completed && !task.completedAt) {
    validated.completedAt = new Date().toISOString();
  }
  
  // Validate subtasks
  if (typeof task.subtasks === 'object' && task.subtasks !== null) {
    Object.keys(task.subtasks).forEach(stepId => {
      const subtask = task.subtasks[stepId];
      if (typeof subtask === 'object' && subtask !== null) {
        validated.subtasks[stepId] = {
          completed: Boolean(subtask.completed),
          completedAt: subtask.completed && subtask.completedAt ? subtask.completedAt : null
        };
      }
    });
  }
  
  // Validate notes
  if (typeof task.notes === 'string') {
    validated.notes = task.notes.trim().substring(0, 10000); // Limit note length
  }
  
  return validated;
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