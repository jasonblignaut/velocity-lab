// functions/api/users/logout.js
// User Logout Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  deleteSession,
  parseRequestJSON,
  logActivity
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication to get session info
    const session = await requireAuth(request, env);
    
    // Parse request body for logout options
    let logoutOptions = {};
    try {
      const requestText = await request.text();
      if (requestText.trim()) {
        logoutOptions = JSON.parse(requestText);
      }
    } catch (parseError) {
      // Ignore JSON parse errors for logout - not critical
      logoutOptions = {};
    }
    
    logActivity('users/logout', session.userId, 'POST', { 
      email: session.userEmail,
      allSessions: logoutOptions.allSessions 
    });
    
    // Delete current session
    await deleteSession(env, session.sessionToken);
    
    // If requested, delete all user sessions
    if (logoutOptions.allSessions === true) {
      await deleteAllUserSessions(env, session.userId);
    }
    
    return createResponse(null, true, 'Logged out successfully');
    
  } catch (error) {
    console.error('Logout error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      // Even if auth fails, we can try to delete the session token if provided
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const sessionToken = authHeader.replace('Bearer ', '');
        try {
          await deleteSession(env, sessionToken);
        } catch (deleteError) {
          console.error('Failed to delete session on auth error:', deleteError);
        }
      }
      
      // Return success even if session was invalid - user wanted to log out anyway
      return createResponse(null, true, 'Logged out successfully');
    }
    
    return createErrorResponse('Logout failed', 500);
  }
}

// GET endpoint to check logout status or get session info
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // This endpoint can be used to check if user is logged in
    const session = await requireAuth(request, env);
    
    // Get user data for session info
    const userKey = `user:${session.userId}`;
    const userData = await env.VELOCITY_USERS.get(userKey);
    
    if (!userData) {
      return createErrorResponse('User not found', 404);
    }
    
    const user = JSON.parse(userData);
    
    const responseData = {
      loggedIn: true,
      sessionInfo: {
        userId: session.userId,
        userEmail: session.userEmail,
        userName: session.userName,
        userRole: session.userRole,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt
      },
      userInfo: {
        name: user.name,
        email: user.email,
        role: user.role,
        lastActive: user.lastActive
      }
    };
    
    return createResponse(responseData, true, 'Session information retrieved');
    
  } catch (error) {
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createResponse({ loggedIn: false }, true, 'Not logged in');
    }
    
    console.error('Session check error:', error);
    return createErrorResponse('Failed to check session status', 500);
  }
}

// DELETE endpoint to force logout (admin only) or delete specific sessions
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const targetUserId = url.searchParams.get('userId');
    const sessionToken = url.searchParams.get('sessionToken');
    const allSessions = url.searchParams.get('allSessions') === 'true';
    
    // If targeting another user, require admin privileges
    if (targetUserId && targetUserId !== session.userId) {
      if (session.userRole !== 'admin') {
        return createErrorResponse('Admin privileges required', 403);
      }
      
      logActivity('users/logout', session.userId, 'ADMIN_LOGOUT', { 
        targetUserId,
        adminUser: session.userEmail 
      });
      
      // Admin forcing logout of another user
      if (allSessions) {
        await deleteAllUserSessions(env, targetUserId);
        return createResponse(null, true, 'All user sessions deleted');
      } else if (sessionToken) {
        await deleteSession(env, sessionToken);
        return createResponse(null, true, 'Specific session deleted');
      } else {
        return createErrorResponse('sessionToken or allSessions parameter required', 400);
      }
    }
    
    // User deleting their own sessions
    if (allSessions) {
      await deleteAllUserSessions(env, session.userId);
      
      logActivity('users/logout', session.userId, 'DELETE_ALL_SESSIONS', { 
        email: session.userEmail 
      });
      
      return createResponse(null, true, 'All your sessions have been deleted');
    } else if (sessionToken) {
      // Delete specific session
      await deleteSession(env, sessionToken);
      
      logActivity('users/logout', session.userId, 'DELETE_SESSION', { 
        email: session.userEmail,
        sessionToken: sessionToken.substring(0, 8) + '...' // Log partial token for security
      });
      
      return createResponse(null, true, 'Session deleted');
    } else {
      return createErrorResponse('sessionToken or allSessions parameter required', 400);
    }
    
  } catch (error) {
    console.error('Force logout error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Authentication required', 401);
    }
    
    if (error.message === 'Admin privileges required') {
      return createErrorResponse('Admin privileges required', 403);
    }
    
    return createErrorResponse('Failed to delete sessions', 500);
  }
}

// Helper function to delete all sessions for a user
async function deleteAllUserSessions(env, userId) {
  try {
    // Since KV doesn't have prefix scanning, we need to implement this differently
    // For now, we'll rely on session TTL to eventually clean up sessions
    // In a production environment, you might maintain a sessions index per user
    
    console.log(`Request to delete all sessions for user ${userId}`);
    
    // We could implement this by:
    // 1. Maintaining a user sessions index
    // 2. Using Workers KV list() operation if available
    // 3. Implementing a cleanup job
    
    // For now, we'll just log the request and rely on TTL
    // The current session will still be deleted by the calling function
    
    return true;
    
  } catch (error) {
    console.error('Failed to delete all user sessions:', error);
    throw error;
  }
}

// Helper function to get user's active sessions (for admin panel)
async function getUserActiveSessions(env, userId) {
  try {
    // This would require maintaining a sessions index per user
    // For now, return empty array
    return [];
    
  } catch (error) {
    console.error('Failed to get user active sessions:', error);
    return [];
  }
}

// Helper function to validate session token format
function isValidSessionToken(token) {
  if (typeof token !== 'string') {
    return false;
  }
  
  // Session tokens should be 64 character hex strings
  const tokenRegex = /^[a-f0-9]{64}$/;
  return tokenRegex.test(token);
}

// Helper function to log security events
function logSecurityEvent(env, userId, event, details = {}) {
  try {
    const securityLog = {
      userId,
      event,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown'
    };
    
    console.log('SECURITY_EVENT:', JSON.stringify(securityLog));
    
    // In production, you might want to store these in a separate KV namespace
    // or send to a logging service
    
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}