// functions/api/user/task.js
// Task Progress Update Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  getUserProgress,
  saveUserProgress,
  sanitizeInput 
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse form data
    const formData = await request.formData();
    const week = sanitizeInput(formData.get('week'));
    const task = sanitizeInput(formData.get('task'));
    const completed = formData.get('completed') === 'true';
    
    // Validate required fields
    if (!week || !task) {
      return createErrorResponse('Week and task are required', 400);
    }
    
    // Validate week format (should be 1-4)
    const weekNum = parseInt(week);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 4) {
      return createErrorResponse('Invalid week number', 400);
    }
    
    // Get current user progress
    const progressData = await getUserProgress(session.userId, env);
    const tasks = progressData.tasks || {};
    
    // Create task key (matches frontend format: week{number}-{taskId})
    const taskKey = `week${week}-${task}`;
    
    // Update task progress
    tasks[taskKey] = {
      completed: completed,
      updatedAt: new Date().toISOString(),
      completedBy: session.userId
    };
    
    // Save updated progress
    const updatedProgress = {
      ...progressData,
      tasks: tasks,
      lastUpdated: new Date().toISOString()
    };
    
    const saveSuccess = await saveUserProgress(session.userId, updatedProgress, env);
    if (!saveSuccess) {
      return createErrorResponse('Failed to save task progress', 500);
    }
    
    // Return success response
    const message = completed ? 'Task marked as completed' : 'Task marked as incomplete';
    return createResponse({ taskKey, completed }, true, message);
    
  } catch (error) {
    console.error('Task update error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to update task progress', 401);
    }
    
    return createErrorResponse('Failed to update task status', 500);
  }
}