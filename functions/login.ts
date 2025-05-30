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

    if (!await validateCSRFToken(context.request, csrfToken)) {
      return new Response('Invalid CSRF token', { status: 403 });
    }

    const users = await context.env.USERS.get('users', { type: 'json' }) as Record<string, { passwordHash: string, name: string }> | null;
    const userData = users?.[email];

    if (!userData) {
      return new Response('Invalid credentials', { status: 401 });
    }

    const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const passwordHex = Array.from(new Uint8Array(passwordHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (passwordHex === userData.passwordHash) {
      // Successful login, you might want to set a session cookie here in a real application
      return new Response(JSON.stringify({ message: 'Login successful', name: userData.name }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response('Invalid credentials', { status: 401 });
    }

  } catch (error) {
    console.error('Login error:', error);
    return new Response('Login failed', { status: 500 });
  }
};