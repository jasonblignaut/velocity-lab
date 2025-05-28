import { createClient } from './utils';

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const repeatPassword = formData.get('repeat_password') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!name || !email || !password || !repeatPassword || !csrfToken) {
      return new Response('Missing required fields', { status: 400 });
    }

    if (password !== repeatPassword) {
      return new Response('Passwords do not match', { status: 400 });
    }

    const db = createClient(env);
    const existingUser = await db
      .prepare('SELECT email FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingUser) {
      return new Response('User already exists', { status: 400 });
    }

    await db
      .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
      .bind(name, email, password)
      .run();

    return new Response('Registration successful', { status: 200 });
  },
};