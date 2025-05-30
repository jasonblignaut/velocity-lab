import { validateCSRFToken } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const repeatPassword = formData.get('repeat_password') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!email || !password || !repeatPassword || !csrfToken) {
      return new Response('Missing fields', { status: 400 });
    }

    if (password !== repeatPassword) {
      return new Response('Passwords do not match', { status: 400 });
    }

    if (!await validateCSRFToken(context.request, csrfToken)) {
      return new Response('Invalid CSRF token', { status: 403 });
    }

    const users = await context.env.USERS.get('users', { type: 'json' }) as Record<string, { passwordHash: string, name: string }> | null;
    const usersData = users || {};

    if (usersData[email]) {
      return new Response('Email already registered', { status: 409 });
    }

    const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const passwordHex = Array.from(new Uint8Array(passwordHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const name = email.substring(0, email.indexOf('@')); // Extract name from email

    usersData[email] = { passwordHash: passwordHex, name: name };
    await context.env.USERS.put('users', JSON.stringify(usersData));

    return new Response(JSON.stringify({ message: 'Registration successful' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 201,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response('Registration failed', { status: 500 });
  }
};