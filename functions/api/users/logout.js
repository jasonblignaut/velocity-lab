// functions/api/users/logout.js
// User Logout Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  validateSession 
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createResponse(null, true, 'Logout successful');
    }
    
    const token = authHeader.substring(7);
    
    // Validate session exists
    const session = await validateSession(request, env);
    if (session) {
      // Delete session from KV storage
      await env.VELOCITY_SESSIONS.delete(token);
      
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
        // Don't fail logout if this fails
      }
    }
    
    // Always return success for logout (even if session was invalid)
    return createResponse(null, true, 'Logout successful');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even on error, return success for logout to prevent client-side issues
    return createResponse(null, true, 'Logout successful');
  }
}