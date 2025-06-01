// functions/api/progress.ts
// Progress tracking endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById
} from './utils';
import type { Env, Progress } from './utils';

// GET progress
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
    
    return jsonResponse(progress);
  } catch (error) {
    console.error('Progress GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST progress update
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    const formData = await request.formData();
    const week = formData.get('week')?.toString();
    const task = formData.get('task')?.toString();
    const checked = formData.get('checked') === 'true';
    
    // Validate input
    if (!week || !task) {
      return errorResponse('Missing week or task', 400);
    }
    
    // Validate week and task values
    const validWeeks = ['week1', 'week2', 'week3', 'week4'];
    const validTasks = {
      week1: ['dc', 'vm', 'share', 'group'],
      week2: ['server', 'wsus', 'time'],
      week3: ['upgrade', 'exchange', 'mailbox', 'mail'],
      week4: ['external', 'hybrid', 'hosting']
    };
    
    if (!validWeeks.includes(week) || !validTasks[week].includes(task)) {
      return errorResponse('Invalid week or task', 400);
    }
    
    // Get current progress
    const progressData = await env.PROGRESS.get(`progress:${userId}`);
    const progress: Progress = progressData ? JSON.parse(progressData) : {};
    
    // Update progress
    if (!progress[week]) {
      progress[week] = {};
    }
    progress[week][task] = checked;
    
    // Save progress
    await env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    
    // Log activity
    await env.USERS.put(
      `log:progress:${new Date().toISOString()}:${userId}`,
      JSON.stringify({ 
        action: 'progress_update',
        week,
        task,
        checked
      }),
      { expirationTtl: 86400 * 7 }
    );
    
    return jsonResponse({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Progress POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};