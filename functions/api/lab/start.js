// functions/api/lab/start.js
// Lab Environment Start Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  generateToken 
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Generate unique lab session ID
    const labId = `lab_${Date.now()}_${generateToken().substring(0, 8)}`;
    
    // Get user's existing labs to determine session number
    const userLabsKey = `user_labs:${session.userId}`;
    const existingLabsData = await env.VELOCITY_LABS.get(userLabsKey);
    const existingLabs = existingLabsData ? JSON.parse(existingLabsData) : [];
    
    // Create new lab session object
    const newLab = {
      id: labId,
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      environment: 'Exchange Hybrid Lab',
      status: 'Active',
      statusIcon: '🚀',
      startTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      sessionNumber: existingLabs.length + 1
    };
    
    // Add new lab to user's lab list
    const updatedLabs = [newLab, ...existingLabs]; // Most recent first
    
    // Keep only last 10 lab sessions per user
    if (updatedLabs.length > 10) {
      updatedLabs.splice(10);
    }
    
    // Save updated lab list for user
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(updatedLabs));
    
    // Also save individual lab record for global admin access
    await env.VELOCITY_LABS.put(labId, JSON.stringify(newLab));
    
    // Update user's last active time
    try {
      const userData = await env.VELOCITY_USERS.get(`user:${session.email}`);
      if (userData) {
        const user = JSON.parse(userData);
        const updatedUser = {
          ...user,
          lastActive: new Date().toISOString()
        };
        await env.VELOCITY_USERS.put(`user:${session.email}`, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.warn('Failed to update user last active time:', error);
      // Don't fail lab start if this fails
    }
    
    return createResponse({
      labId: labId,
      sessionNumber: newLab.sessionNumber,
      startTime: newLab.startTime,
      environment: newLab.environment,
      status: newLab.status
    }, true, '🚀 New lab environment started successfully!');
    
  } catch (error) {
    console.error('Lab start error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to start a lab environment', 401);
    }
    
    return createErrorResponse('Failed to start lab environment. Please try again.', 500);
  }
}