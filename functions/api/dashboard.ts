// functions/api/auth/dashboard.ts
import { validateSession, errorResponse } from '../utils';
import type { Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    // Return success response for dashboard access
    return new Response(JSON.stringify({ 
      success: true, 
      userId,
      message: 'Dashboard access granted' 
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Dashboard auth error:', error);
    return errorResponse('Internal server error', 500);
  }
};