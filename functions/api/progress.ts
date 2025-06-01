// functions/api/progress.ts
// Enhanced progress tracking endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  logActivity,
  calculateProgress
} from './utils';
import type { Env, Progress } from './utils';

// GET user progress
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
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Ensure all weeks exist with default empty objects
    const defaultProgress: Progress = {
      week1: progress.week1 || {},
      week2: progress.week2 || {},
      week3: progress.week3 || {},
      week4: progress.week4 || {}
    };
    
    return jsonResponse(defaultProgress);
  } catch (error) {
    console.error('Progress GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST update progress
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
    
    // Validate input
    if (!task || !week) {
      return errorResponse('Missing task or week parameter', 400);
    }
    
    // Validate week format
    const validWeeks = ['week1', 'week2', 'week3', 'week4'];
    if (!validWeeks.includes(week)) {
      return errorResponse('Invalid week parameter', 400);
    }
    
    // Validate task format (basic validation)
    if (task.length < 1 || task.length > 50) {
      return errorResponse('Invalid task parameter', 400);
    }
    
    // Get current progress
    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    let progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Ensure week exists
    if (!progress[week]) {
      progress[week] = {};
    }
    
    // Get previous state for logging
    const previousState = progress[week][task] || false;
    
    // Update progress
    progress[week][task] = checked;
    
    // Save updated progress
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    
    // Log the progress change
    await logActivity(env, userId, 'progress_updated', {
      week,
      task,
      checked,
      previousState,
      progressPercentage: calculateProgress(progress)
    });
    
    // Calculate new statistics for response
    const completedTasks = Object.values(progress).reduce((total, weekTasks) => {
      return total + Object.values(weekTasks).filter(Boolean).length;
    }, 0);
    
    const progressPercentage = calculateProgress(progress);
    
    return jsonResponse({ 
      message: 'Progress updated successfully',
      task,
      week,
      checked,
      completedTasks,
      totalTasks: 14,
      progressPercentage
    });
  } catch (error) {
    console.error('Progress POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// PUT bulk update progress (for admin or import functionality)
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
    
    // Validate progress structure
    const validWeeks = ['week1', 'week2', 'week3', 'week4'];
    for (const week of validWeeks) {
      if (progress[week] && typeof progress[week] !== 'object') {
        return errorResponse(`Invalid progress data for ${week}`, 400);
      }
    }
    
    // Save progress for target user
    await env.PROGRESS.put(`progress:${targetUserId}`, JSON.stringify(progress));
    
    // Log the bulk update
    await logActivity(env, userId, 'progress_bulk_updated', {
      targetUserId,
      progressPercentage: calculateProgress(progress)
    });
    
    return jsonResponse({ 
      message: 'Progress bulk updated successfully',
      progressPercentage: calculateProgress(progress)
    });
  } catch (error) {
    console.error('Progress PUT error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// DELETE reset progress
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
    
    // Reset progress
    const emptyProgress: Progress = {
      week1: {},
      week2: {},
      week3: {},
      week4: {}
    };
    
    await env.PROGRESS.put(`progress:${userIdToReset}`, JSON.stringify(emptyProgress));
    
    // Log the reset
    await logActivity(env, userId, 'progress_reset', {
      targetUserId: userIdToReset,
      resetBy: userId === userIdToReset ? 'self' : 'admin'
    });
    
    return jsonResponse({ 
      message: 'Progress reset successfully',
      progressPercentage: 0
    });
  } catch (error) {
    console.error('Progress DELETE error:', error);
    return errorResponse('Internal server error', 500);
  }
};