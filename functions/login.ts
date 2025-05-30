import { validateCSRFToken, hashPassword } from '../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();

    if (!email || !password || !csrfToken) {
      return jsonResponse({ error: 'Missing fields' }, 400);
    }

    if (!(await validateCSRFToken(context.env, csrfToken))) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }

    const userData = await context.env.USERS.get(`user:${email}`);
    if (!userData) {
      return jsonResponse({ error: 'Email not found' }, 404);
    }

    const user = JSON.parse(userData);
    const hashedPassword = await hashPassword(password);
    if (user.password !== hashedPassword) {
      return jsonResponse({ error: 'Incorrect password' }, 401);
    }

    const sessionToken = crypto.randomUUID();
    await context.env.USERS.put(`session:${sessionToken}`, user.id, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ name: user.name, role: user.role }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}