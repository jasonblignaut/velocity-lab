// functions/api/progress.ts
// Progress tracking for 42-task Velocity Lab system - Cloudflare Compatible

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  getCurrentLabProgress,
  calculateProgress,
  calculateCompletedTasks,
  logActivity,
  TASK_STRUCTURE,
  TOTAL_TASKS
} from '../utils';
import type { Env, Progress } from '../utils';

// GET /api/progress - Load user's progress
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    console.log(`Loading progress for user: ${userId}`);

    // Get current lab progress
    const progress = await getCurrentLabProgress(env, userId);
    if (!progress) {
      return errorResponse('Failed to load progress', 500);
    }

    // Calculate statistics
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);

    // Return progress data in expected frontend format
    const responseData = {
      ...progress,
      lastUpdated: new Date().toISOString(),
      totalTasks: TOTAL_TASKS,
      completedTasks,
      progressPercentage
    };

    console.log(`Progress loaded for user ${userId}: ${completedTasks}/${TOTAL_TASKS} tasks (${progressPercentage}%)`);

    return jsonResponse(responseData);
  } catch (error) {
    console.error('Error loading progress:', error);
    return errorResponse('Failed to load progress', 500);
  }
};

// POST /api/progress - Save user's progress
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const formData = await request.formData();
    const task = formData.get('task') as string;
    const week = formData.get('week') as string;
    const checked = formData.get('checked') as string;
    const subtask = formData.get('subtask') as string;
    const subtask_checked = formData.get('subtask_checked') as string;

    if (!task || !week) {
      return errorResponse('Task and week are required', 400);
    }

    console.log(`Updating progress for user ${userId}: ${week}-${task}, checked: ${checked}, subtask: ${subtask}`);

    // Get current progress
    let progress = await getCurrentLabProgress(env, userId);
    if (!progress) {
      return errorResponse('Failed to load progress', 500);
    }

    // Initialize week data if doesn't exist
    if (!progress[week]) {
      progress[week] = {};
    }

    // Initialize task data if doesn't exist
    if (!progress[week][task]) {
      progress[week][task] = {
        completed: false,
        subtasks: {}
      };
    }

    const taskData = progress[week][task];

    // Update subtask if provided
    if (subtask !== null && subtask !== undefined && subtask !== '') {
      if (!taskData.subtasks) taskData.subtasks = {};
      taskData.subtasks[subtask] = subtask_checked === 'true';
      console.log(`Updated subtask ${subtask} for ${week}-${task}: ${subtask_checked}`);
    }

    // Update main task
    if (checked !== null && checked !== undefined && checked !== '') {
      const wasCompleted = taskData.completed;
      taskData.completed = checked === 'true';
      
      if (taskData.completed && !wasCompleted) {
        taskData.completedAt = new Date().toISOString();
      }
      
      console.log(`Updated task ${week}-${task}: ${checked}`);
    }

    // Save updated progress
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));

    // Calculate statistics
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);

    console.log(`Progress saved for user ${userId}. Total completed: ${completedTasks}/${TOTAL_TASKS} (${progressPercentage}%)`);

    // Log progress update
    await logActivity(env, userId, 'progress_updated', {
      task: `${week}-${task}`,
      completed: taskData.completed,
      subtask: subtask || null,
      completedTasks,
      progressPercentage
    });

    return jsonResponse({
      success: true,
      completedTasks,
      totalTasks: TOTAL_TASKS,
      progress: progressPercentage,
      message: taskData.completed ? 'Task completed!' : 'Progress saved'
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return errorResponse('Failed to save progress', 500);
  }
};

// PUT /api/progress - Bulk progress update
export const onRequestPut: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const requestData = await request.json() as { progress: Progress };
    const { progress } = requestData;

    if (!progress) {
      return errorResponse('Progress data is required', 400);
    }

    // Validate progress structure
    const validWeeks = Object.keys(TASK_STRUCTURE);
    for (const week of Object.keys(progress)) {
      if (!validWeeks.includes(week)) {
        return errorResponse(`Invalid week: ${week}`, 400);
      }
    }

    // Save updated progress
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));

    // Calculate statistics
    const completedTasks = calculateCompletedTasks(progress);
    const progressPercentage = calculateProgress(progress);

    // Log bulk update
    await logActivity(env, userId, 'progress_bulk_updated', {
      completedTasks,
      progressPercentage
    });

    return jsonResponse({
      success: true,
      completedTasks,
      totalTasks: TOTAL_TASKS,
      progress: progressPercentage,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating progress:', error);
    return errorResponse('Failed to update progress', 500);
  }
};

// DELETE /api/progress - Reset progress
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    // Initialize empty progress
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

    // Save empty progress
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(emptyProgress));

    // Log reset
    await logActivity(env, userId, 'progress_reset');

    return jsonResponse({
      success: true,
      completedTasks: 0,
      totalTasks: TOTAL_TASKS,
      progress: 0,
      message: 'Progress reset successfully'
    });
  } catch (error) {
    console.error('Error resetting progress:', error);
    return errorResponse('Failed to reset progress', 500);
  }
};