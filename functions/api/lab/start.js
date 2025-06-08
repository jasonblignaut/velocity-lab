// functions/api/lab/start.js
// Lab Environment Start Endpoint for Velocity Lab

import { createResponse, createErrorResponse, generateToken } from '../../_middleware.js';

export async function onRequestPost(context) {
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
    let labsKV = env.VELOCITY_LABS || env.velocity_labs || env.labs;
    
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
    const userName = session.name;
    
    // Generate lab ID
    const labId = generateToken().substring(0, 8).toUpperCase();
    
    // Get or create lab session counter
    let sessionNumber = 1;
    if (labsKV) {
      const userLabData = await labsKV.get(`labs:${userId}`);
      if (userLabData) {
        const labData = JSON.parse(userLabData);
        sessionNumber = (labData.sessionCount || 0) + 1;
      }
      
      // Save updated lab data
      const labData = {
        userId: userId,
        userName: userName,
        sessionCount: sessionNumber,
        lastLabId: labId,
        lastStarted: new Date().toISOString()
      };
      
      await labsKV.put(`labs:${userId}`, JSON.stringify(labData));
    }
    
    // Return success response
    return createResponse({
      labId: labId,
      sessionNumber: sessionNumber,
      userName: userName
    }, true, `Lab environment started successfully! 🚀`);
    
  } catch (error) {
    console.error('Lab start error:', error);
    return createErrorResponse('Failed to start lab environment', 500);
  }
}