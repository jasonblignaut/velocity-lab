// functions/api/user/progress.js
// User Progress Data Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  getUserProgress 
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get user progress from KV storage
    const progressData = await getUserProgress(session.userId, env);
    
    // Return progress data (tasks object or empty object if no progress exists)
    return createResponse(progressData.tasks || {}, true, 'Progress loaded successfully');
    
  } catch (error) {
    console.error('Progress load error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to view your progress', 401);
    }
    
    return createErrorResponse('Failed to load progress data', 500);
  }
}