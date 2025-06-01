// functions/api/register.ts
import { jsonResponse, errorResponse, checkRateLimit } from './utils';
import type { Env, User } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    const formData = await request.formData();

    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const name = formData.get('name')?.toString();

    if (!email || !password || !name) {
      return errorResponse('Missing required fields', 400);
    }

    // Rate limit per IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `register:${clientIP}`, 5, 3600); // max 5 per hour
    if (!canProceed) {
      return errorResponse('Too many registration attempts. Please try later.', 429);
    }

    // Check if user exists
    const existing = await env.USERS.get(`user:${email}`);
    if (existing) {
      return errorResponse('Email already registered', 409);
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      name,
      password, // WARNING: store hashed password in production
      role: 'user',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    await env.USERS.put(`user:${email}`, JSON.stringify(newUser));

    return jsonResponse({ message: 'User registered successfully' }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse('Internal server error', 500);
  }
};
