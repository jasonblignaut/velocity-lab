import { validateCSRFToken } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!email || !password || !csrfToken) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!await validateCSRFToken(context.env, csrfToken)) {
      return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userData = await context.env.USERS.get(`user:${email}`);
    if (!userData) {
      return new Response(JSON.stringify({ error: 'Email not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
      return new Response(JSON.stringify({ error: 'Incorrect password' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionToken = crypto.randomUUID();
    await context.env.USERS.put(`session:${sessionToken}`, JSON.stringify({ id: user.id, name: user.name }), { expirationTtl: 86400 });

    const response = new Response(JSON.stringify({ message: 'Login successful', user: { id: user.id, name: user.name } }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
      },
    });
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};