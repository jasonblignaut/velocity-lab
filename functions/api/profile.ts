import { Env, validateCSRFToken } from '../utils';

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const cookies = context.request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return jsonResponse({ error: 'Session expired' }, 401);
    }
    const userData = await context.env.USERS.get(`user:${userId}`);
    if (!userData) {
      return jsonResponse({ error: 'User not found' }, 404);
    }
    const user = JSON.parse(userData);
    const avatar = await context.env.AVATARS.get(`avatar:${userId}`);
    return jsonResponse({ name: user.name, email: user.email, avatar }, 200);
  } catch (error) {
    console.error('Profile GET error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const cookies = context.request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return jsonResponse({ error: 'Session expired' }, 401);
    }
    const formData = await context.request.formData();
    const currentPassword = formData.get('currentPassword')?.toString();
    const newPassword = formData.get('newPassword')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();
    if (!currentPassword || !newPassword || !csrfToken) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }
    if (!(await validateCSRFToken(context.env, csrfToken))) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }
    const userData = await context.env.USERS.get(`user:${userId}`);
    if (!userData) {
      return jsonResponse({ error: 'User not found' }, 404);
    }
    const user = JSON.parse(userData);
    if (user.password !== currentPassword) {
      return jsonResponse({ error: 'Incorrect current password' }, 401);
    }
    user.password = newPassword;
    await context.env.USERS.put(`user:${userId}`, JSON.stringify(user));
    return jsonResponse({ message: 'Password updated' }, 200);
  } catch (error) {
    console.error('Profile POST error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};