// functions/api/login.ts
import { 
  jsonResponse, 
  errorResponse, 
  createSession, 
  createCookie,
  checkRateLimit
} from './utils';
import type { Env, User } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const formData = await request.formData();

    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return errorResponse('Missing required fields', 400);
    }

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `login:${clientIP}`, 5, 300);

    if (!canProceed) {
      return errorResponse('Too many login attempts. Please try again later.', 429);
    }

    const userData = await env.USERS.get(`user:${email}`);
    if (!userData) {
      return errorResponse('Invalid email or password', 401);
    }

    const user: User = JSON.parse(userData);
    if (user.password !== password) {
      return errorResponse('Invalid email or password', 401);
    }

    user.lastLogin = new Date().toISOString();
    await env.USERS.put(`user:${email}`, JSON.stringify(user));

    const sessionToken = await createSession(env, user.id);

    await env.USERS.put(
      `log:login:${new Date().toISOString()}:${user.id}`,
      JSON.stringify({ action: 'user_login', ip: clientIP }),
      { expirationTtl: 86400 * 7 }
    );

    return jsonResponse(
      { name: user.name, role: user.role },
      200,
      { 'Set-Cookie': createCookie('session', sessionToken) }
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Internal server error', 500);
  }
};
