// functions/api/[[path]].ts
// Centralized API router for Velocity Lab - ADMIN INITIALIZATION REMOVED

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  checkRateLimit
} from '../utils';
import type { Env } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  console.log('API GET request to:', path);

  try {
    // CSRF token generation
    if (path === '/api/csrf') {
      const { onRequestGet: handleCsrf } = await import('../api/csrf');
      return handleCsrf(context);
    }

    // Profile endpoints
    if (path === '/api/profile') {
      const { onRequestGet: handleProfile } = await import('../api/profile');
      return handleProfile(context);
    }

    // Progress endpoints
    if (path === '/api/progress') {
      const { onRequestGet: handleProgress } = await import('../api/progress');
      return handleProgress(context);
    }

    // Admin endpoints
    if (path.startsWith('/api/admin/')) {
      const { onRequestGet: handleAdmin } = await import('../api/admin');
      return handleAdmin(context);
    }

    return errorResponse('API endpoint not found', 404);
  } catch (error) {
    console.error('API GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  console.log('API POST request to:', path);

  try {
    // Rate limiting
    const ip = request.headers.get('cf-connecting-ip') || 'unknown';
    if (!(await checkRateLimit(env, ip, 30))) {
      return errorResponse('Too many requests', 429);
    }

    // Login
    if (path === '/api/login') {
      const { onRequestPost: handleLogin } = await import('../api/login');
      return handleLogin(context);
    }

    // Register
    if (path === '/api/register') {
      const { onRequestPost: handleRegister } = await import('../api/register');
      return handleRegister(context);
    }

    // Logout
    if (path === '/api/logout') {
      const { onRequestPost: handleLogout } = await import('../api/logout');
      return handleLogout(context);
    }

    // Progress endpoints
    if (path === '/api/progress') {
      const { onRequestPost: handleProgress } = await import('../api/progress');
      return handleProgress(context);
    }

    // Profile endpoints
    if (path.startsWith('/api/profile/')) {
      const { onRequestPost: handleProfile } = await import('../api/profile');
      return handleProfile(context);
    }

    // Admin endpoints
    if (path.startsWith('/api/admin/')) {
      const { onRequestPost: handleAdmin } = await import('../api/admin');
      return handleAdmin(context);
    }

    return errorResponse('API endpoint not found', 404);
  } catch (error) {
    console.error('API POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Progress bulk update
    if (path === '/api/progress') {
      const { onRequestPut: handleProgress } = await import('../api/progress');
      return handleProgress(context);
    }

    return errorResponse('API endpoint not found', 404);
  } catch (error) {
    console.error('API PUT error:', error);
    return errorResponse('Internal server error', 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    // Progress reset
    if (path === '/api/progress') {
      const { onRequestDelete: handleProgress } = await import('../api/progress');
      return handleProgress(context);
    }

    return errorResponse('API endpoint not found', 404);
  } catch (error) {
    console.error('API DELETE error:', error);
    return errorResponse('Internal server error', 500);
  }
};