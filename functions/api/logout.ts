// functions/api/logout.ts
// Enhanced user logout endpoint

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  deleteSession,
  getUserById,
  logActivity
} from './utils';
import type { Env } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Get session token from cookie
    const cookies = request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    
    if (sessionToken) {
      // Validate session and get user for logging
      const userId = await validateSession(env, request);
      
      if (userId) {
        const user = await getUserById(env, userId);
        
        // Log logout activity
        await logActivity(env, userId, 'logout', {
          email: user?.email,
          ip: request.headers.get('cf-connecting-ip') || 'unknown'
        });
      }
      
      // Delete session
      await deleteSession(env, sessionToken);
    }
    
    // Return success response with expired cookie
    return new Response(JSON.stringify({ 
      message: 'Logged out successfully' 
    }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error, we should still clear the session cookie
    return new Response(JSON.stringify({ 
      message: 'Logged out successfully' 
    }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
      },
    });
  }
};