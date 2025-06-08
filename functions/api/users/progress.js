// functions/api/user/progress.js
// User Progress Endpoint for Velocity Lab

import { createResponse, createErrorResponse } from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return createErrorResponse('Authorization required', 401);
    }
    
    // Try different KV binding names
    let sessionsKV = env.VELOCITY_SESSIONS || env.velocity_sessions || env.sessions;
    let progressKV = env.VELOCITY_PROGRESS || env.velocity_progress || env.progress;
    
    if (!sessionsKV) {
      return createErrorResponse('Database configuration error', 500);
    }
    
    // Validate session
    const sessionData = await sessionsKV.get(sessionToken);
    if (!sessionData) {
      return createErrorResponse('Invalid or expired session', 401);
    }
    
    const session = JSON.parse(sessionData);
    const userId = session.userId;
    
    // Get user progress
    let userProgress = {};
    if (progressKV) {
      const progressData = await progressKV.get(`progress:${userId}`);
      if (progressData) {
        userProgress = JSON.parse(progressData);
      }
    }
    
    // Return user progress data
    return createResponse(userProgress, true, 'Progress loaded successfully');
    
  } catch (error) {
    console.error('Progress loading error:', error);
    return createErrorResponse('Failed to load progress', 500);
  }
}