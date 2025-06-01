// functions/api/dashboard.ts
import { jsonResponse, errorResponse, getSession } from './utils';
import type { Env } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;

    // Get cookies
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => {
      const [key, ...v] = c.trim().split('=');
      return [key, decodeURIComponent(v.join('='))];
    }));

    const sessionToken = cookies.session;
    if (!sessionToken) {
      return errorResponse('Not authenticated', 401);
    }

    // Validate session
    const session = await getSession(env, sessionToken);
    if (!session || !session.userId) {
      return errorResponse('Invalid session', 401);
    }

    // Get user data
    const userData = await env.USERS.get(`user:${session.userId}`);
    if (!userData) {
      return errorResponse('User not found', 404);
    }

    const user = JSON.parse(userData);

    // Return user info
    return jsonResponse({
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse('Internal server error', 500);
  }
};
