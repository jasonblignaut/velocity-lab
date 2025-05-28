import { validateCSRFToken } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!email || !password || !csrfToken) {
      return new Response('Missing fields', { status: 400 });
    }

    if (!await validateCSRFToken(context.env, csrfToken)) {
      return new Response('Invalid CSRF token', { status: 403 });
    }

    const userData = await context.env.USERS.get(`user:${email}`);
    if (!userData) {
      return new Response('Email not found', { status: 400 });
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
      return new Response('Incorrect password', { status: 400 });
    }

    const sessionToken = crypto.randomUUID();
    await context.env.USERS.put(`session:${sessionToken}`, user.id, { expirationTtl: 86400 });

    return new Response(JSON.stringify({ message: 'Login successful', name: user.name }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
};