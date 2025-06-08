// functions/api/lab/history.js
// Lab Environment History Endpoint for Velocity Lab

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
    
    // Get user's lab history from KV storage
    const userLabsKey = `user_labs:${session.userId}`;
    const labsData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!labsData) {
      // Return empty array if no lab history exists
      return createResponse([], true, 'Lab history loaded successfully');
    }
    
    const labs = JSON.parse(labsData);
    
    // Format labs for frontend consumption
    const formattedLabs = labs.map(lab => ({
      id: lab.id,
      statusIcon: lab.statusIcon || '🔬',
      startTime: lab.startTime,
      environment: lab.environment || 'Exchange Hybrid Lab',
      status: lab.status || 'Completed',
      sessionNumber: lab.sessionNumber || 1,
      lastActivity: lab.lastActivity
    }));
    
    return createResponse(formattedLabs, true, 'Lab history loaded successfully');
    
  } catch (error) {
    console.error('Lab history error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to view lab history', 401);
    }
    
    return createErrorResponse('Failed to load lab history', 500);
  }
}