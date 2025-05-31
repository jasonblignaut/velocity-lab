import { getCookie } from '../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const userData = await context.env.USERS.get(`user:${email}`);
    if (!userData) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    const sessionToken = crypto.randomUUID();
    await context.env.USERS.put(`session:${sessionToken}`, user.id, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ name: user.name, email: user.email }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}