// functions/api/progress.ts
// Fixed progress tracking endpoints - Enhanced checkbox persistence & 42-task support

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  logActivity,
  calculateProgress,
  calculateCompletedTasks,
  TASK_STRUCTURE,
  TOTAL_TASKS
} from '../utils';
import type { Env, Progress } from '../utils';

// GET user progress - FIXED: Proper initialization and structure
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Get progress data
    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    let progress: Progress;
    
    if (!progressData) {
      // FIXED: Initialize proper 42-task structure if no progress exists
      progress = initializeEmptyProgress();
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    } else {
      progress = JSON.parse(progressData) as Progress;
      
      // FIXED: Ensure all weeks and tasks exist (for upgrades)
      progress = ensureCompleteStructure(progress);
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    }
    
    return jsonResponse(progress);
  } catch (error) {
    console.error('Progress GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST update progress - FIXED: Enhanced persistence and subtask support
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    const formData = await request.formData();
    const task = formData.get('task')?.toString();
    const week = formData.get('week')?.toString();
    const checked = formData.get('checked') === 'true';
    const subtaskKey = formData.get('subtask')?.toString();
    const subtaskChecked = formData.get('subtask_checked') === 'true';
    
    // Validate input
    if (!task || !week) {
      return errorResponse('Missing task or week parameter', 400);
    }
    
    // Validate week format
    const validWeeks = ['week1', 'week2', 'week3', 'week4'];
    if (!validWeeks.includes(week)) {
      return errorResponse('Invalid week parameter', 400);
    }
    
    // FIXED: Validate task exists in our structure
    const weekStructure = TASK_STRUCTURE[week as keyof typeof TASK_STRUCTURE];
    if (!weekStructure || !weekStructure.tasks.includes(task)) {
      return errorResponse('Invalid task parameter', 400);
    }
    
    // Get current progress
    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    let progress: Progress;
    
    if (!progressData) {
      progress = initializeEmptyProgress();
    } else {
      progress = JSON.parse(progressData) as Progress;
      progress = ensureCompleteStructure(progress);
    }
    
    // Ensure week and task exist
    if (!progress[week]) {
      progress[week] = {};
    }
    if (!progress[week][task]) {
      progress[week][task] = {
        completed: false,
        subtasks: {}
      };
    }
    
    // Get previous state for logging
    const previousMainState = progress[week][task].completed;
    const previousSubtaskState = subtaskKey ? progress[week][task].subtasks?.[subtaskKey] : undefined;
    
    // FIXED: Handle subtask updates
    if (subtaskKey) {
      // Update subtask
      if (!progress[week][task].subtasks) {
        progress[week][task].subtasks = {};
      }
      progress[week][task].subtasks[subtaskKey] = subtaskChecked;
      
      // FIXED: Auto-complete main task when all subtasks are done
      const allSubtasksCompleted = Object.values(progress[week][task].subtasks).every(completed => completed === true);
      const hasSubtasks = Object.keys(progress[week][task].subtasks).length > 0;
      
      if (hasSubtasks && allSubtasksCompleted && !progress[week][task].completed) {
        progress[week][task].completed = true;
        progress[week][task].completedAt = new Date().toISOString();
      } else if (hasSubtasks && !allSubtasksCompleted && progress[week][task].completed) {
        progress[week][task].completed = false;
        delete progress[week][task].completedAt;
      }
    } else {
      // Update main task
      progress[week][task].completed = checked;
      
      if (checked) {
        progress[week][task].completedAt = new Date().toISOString();
        
        // FIXED: Auto-complete all subtasks when main task is checked
        if (progress[week][task].subtasks) {
          Object.keys(progress[week][task].subtasks).forEach(subtaskId => {
            progress[week][task].subtasks![subtaskId] = true;
          });
        }
      } else {
        delete progress[week][task].completedAt;
        
        // FIXED: Auto-uncheck all subtasks when main task is unchecked
        if (progress[week][task].subtasks) {
          Object.keys(progress[week][task].subtasks).forEach(subtaskId => {
            progress[week][task].subtasks![subtaskId] = false;
          });
        }
      }
    }
    
    // FIXED: Save updated progress with proper error handling
    try {
      await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    } catch (saveError) {
      console.error('Failed to save progress:', saveError);
      return errorResponse('Failed to save progress', 500);
    }
    
    // Calculate new statistics
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);
    
    // FIXED: Enhanced logging with both main task and subtask changes
    await logActivity(env, userId, 'progress_updated', {
      week,
      task,
      subtaskKey,
      mainTaskChecked: progress[week][task].completed,
      subtaskChecked: subtaskKey ? progress[week][task].subtasks?.[subtaskKey] : undefined,
      previousMainState,
      previousSubtaskState,
      completedTasks,
      totalTasks: TOTAL_TASKS,
      progressPercentage
    });
    
    return jsonResponse({ 
      success: true,
      message: 'Progress updated successfully',
      task,
      week,
      subtaskKey,
      mainTaskCompleted: progress[week][task].completed,
      subtaskCompleted: subtaskKey ? progress[week][task].subtasks?.[subtaskKey] : undefined,
      completedTasks,
      totalTasks: TOTAL_TASKS,
      progressPercentage,
      // FIXED: Return updated progress for immediate UI sync
      updatedProgress: progress
    });
  } catch (error) {
    console.error('Progress POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// PUT bulk update progress (for admin functionality)
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Get user to check if admin (only admins can bulk update)
    const user = await getUserById(env, userId);
    if (!user || user.role !== 'admin') {
      return errorResponse('Admin access required', 403);
    }
    
    const body = await request.json();
    const { targetUserId, progress } = body;
    
    if (!targetUserId || !progress) {
      return errorResponse('Missing targetUserId or progress data', 400);
    }
    
    // FIXED: Validate progress structure before saving
    const validatedProgress = ensureCompleteStructure(progress);
    
    // Save progress for target user
    await env.PROGRESS.put(`progress:${targetUserId}`, JSON.stringify(validatedProgress));
    
    // Log the bulk update
    await logActivity(env, userId, 'progress_bulk_updated', {
      targetUserId,
      progressPercentage: calculateProgress(validatedProgress)
    });
    
    return jsonResponse({ 
      success: true,
      message: 'Progress bulk updated successfully',
      progressPercentage: calculateProgress(validatedProgress)
    });
  } catch (error) {
    console.error('Progress PUT error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// DELETE reset progress - FIXED: Proper reset with structure
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userId');
    
    // If targetUserId is provided, check admin access
    if (targetUserId && targetUserId !== userId) {
      const user = await getUserById(env, userId);
      if (!user || user.role !== 'admin') {
        return errorResponse('Admin access required', 403);
      }
    }
    
    const userIdToReset = targetUserId || userId;
    
    // FIXED: Reset progress with proper 42-task structure
    const emptyProgress = initializeEmptyProgress();
    
    await env.PROGRESS.put(`progress:${userIdToReset}`, JSON.stringify(emptyProgress));
    
    // Log the reset
    await logActivity(env, userId, 'progress_reset', {
      targetUserId: userIdToReset,
      resetBy: userId === userIdToReset ? 'self' : 'admin'
    });
    
    return jsonResponse({ 
      success: true,
      message: 'Progress reset successfully',
      progressPercentage: 0,
      completedTasks: 0,
      totalTasks: TOTAL_TASKS
    });
  } catch (error) {
    console.error('Progress DELETE error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// FIXED: Helper function to initialize empty progress with proper 42-task structure
function initializeEmptyProgress(): Progress {
  const progress: Progress = {};
  
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    progress[weekKey] = {};
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    
    week.tasks.forEach(taskId => {
      progress[weekKey][taskId] = {
        completed: false,
        subtasks: {}
      };
    });
  });
  
  return progress;
}

// FIXED: Helper function to ensure progress has complete structure (for migrations/upgrades)
function ensureCompleteStructure(progress: Progress): Progress {
  const completeProgress = { ...progress };
  
  Object.keys(TASK_STRUCTURE).forEach(weekKey => {
    if (!completeProgress[weekKey]) {
      completeProgress[weekKey] = {};
    }
    
    const week = TASK_STRUCTURE[weekKey as keyof typeof TASK_STRUCTURE];
    week.tasks.forEach(taskId => {
      if (!completeProgress[weekKey][taskId]) {
        completeProgress[weekKey][taskId] = {
          completed: false,
          subtasks: {}
        };
      }
      
      // Ensure subtasks object exists
      if (!completeProgress[weekKey][taskId].subtasks) {
        completeProgress[weekKey][taskId].subtasks = {};
      }
    });
  });
  
  return completeProgress;
}