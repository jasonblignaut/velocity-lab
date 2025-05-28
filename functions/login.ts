import { createClient, generateSessionId } from './utils';

export default {
  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!email || !password || !csrfToken) {
      return new Response('Missing required fields', { status: 400 });
    }

    const db = createClient(env);
    const user = await db
      .prepare('SELECT name, password FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user || user.password !== password) {
      return new Response('Invalid email or password', { status: 401 });
    }

    const sessionId = generateSessionId();
    await env.KV.put(`session:${sessionId}`, email, { expirationTtl: 86400 });

    const headers = new Headers();
    headers.append('Set-Cookie', `session=${sessionId}; Path=/; HttpOnly; Max-Age=86400`);
    return new Response(JSON.stringify({ name: user.name }), {
      status: 200,
      headers,
    });
  },
};