// functions/api/users/logout.js
// User Logout Endpoint for Velocity Lab

import { createResponse, createErrorResponse } from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (sessionToken) {
      // Try different KV binding names
      let sessionsKV = env.VELOCITY_SESSIONS || env.velocity_sessions || env.sessions;
      
      if (sessionsKV) {
        // Delete session from KV storage
        await sessionsKV.delete(sessionToken);
        console.log('Session deleted from KV');
      }
    }
    
    // Always return success (even if session wasn't found)
    return createResponse(null, true, 'Signed out successfully');
    
  } catch (error) {
    console.error('Logout error:', error);
    return createErrorResponse('Logout failed', 500);
  }
}