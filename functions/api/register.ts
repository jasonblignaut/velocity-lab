import { validateCSRFToken } from '../utils';

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const role = formData.get('role')?.toString().trim();
    const csrfToken = formData.get('csrf_token')?.toString();
    if (!name || !email || !password || !role || !csrfToken) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }
    if (!(await validateCSRFToken(context.env, csrfToken))) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }
    const existingUser = await context.env.USERS.get(`user:${email}`);
    if (existingUser) {
      return jsonResponse({ error: 'Email already registered' }, 409);
    }
    const userId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();
    // Simple base64 encoding for demo; use bcrypt-wasm in production
    const encodedPassword = btoa(password);
    const userData = {
      id: userId,
      name,
      email,
      password: encodedPassword,
      role,
    };
    await context.env.USERS.put(`user:${email}`, JSON.stringify(userData));
    await context.env.USERS.put(`session:${sessionToken}`, userId, { expirationTtl: 86400 });
    return new Response(JSON.stringify({ name, role }), {
      status: 201,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};