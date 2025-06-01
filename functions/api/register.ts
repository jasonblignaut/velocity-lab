// functions/api/register.ts
import { 
  jsonResponse, 
  errorResponse, 
  createSession, 
  createCookie,
  isValidEmail,
  isValidPassword,
  generateSecureToken
} from './utils';
import { validateCSRFToken } from './csrf';
import type { Env, User } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const formData = await request.formData();

    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const role = formData.get('role')?.toString() || 'user';
    const csrfToken = formData.get('csrf_token')?.toString();

    if (!name || !email || !password || !csrfToken) {
      return errorResponse('Missing required fields', 400);
    }

    const isValidCSRF = await validateCSRFToken(env, csrfToken);
    if (!isValidCSRF) {
      return errorResponse('Invalid CSRF token', 403);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    if (!isValidPassword(password)) {
      return errorResponse('Password must be at least 8 characters with uppercase, lowercase, and numbers', 400);
    }

    if (name.length < 2 || name.length > 100) {
      return errorResponse('Name must be between 2 and 100 characters', 400);
    }

    const existingUser = await env.USERS.get(`user:${email}`);
    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    const userId = generateSecureToken();
    const user: User = {
      id: userId,
      name,
      email,
      password, // NOTE: use hashing in production
      role: role === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    await env.USERS.put(`user:${email}`, JSON.stringify(user));

    const sessionToken = await createSession(env, userId);

    await env.USERS.put(
      `log:register:${new Date().toISOString()}:${userId}`,
      JSON.stringify({ action: 'user_registered', email }),
      { expirationTtl: 86400 * 30 }
    );

    return jsonResponse(
      { name: user.name, role: user.role },
      201,
      { 'Set-Cookie': createCookie('session', sessionToken) }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
};
