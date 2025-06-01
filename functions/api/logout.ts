// functions/api/logout.ts
// User logout endpoint

import { jsonResponse, getCookie } from './utils';
import type { Env } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Get session token
    const sessionToken = getCookie(request, 'session');
    
    if (sessionToken) {
      // Delete session from KV
      await env.USERS.delete(`session:${sessionToken}`);
    }
    
    // Clear session cookie
    return jsonResponse(
      { message: 'Logged out successfully' },
      200,
      { 
        'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return jsonResponse({ message: 'Logout completed' }, 200, {
      'Set-Cookie': 'session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    });
  }
};