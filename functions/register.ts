import { validateCSRFToken, hashPassword } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const repeatPassword = formData.get('repeat_password') as string;
    const name = formData.get('name') as string;
    const csrfToken = formData.get('csrf_token') as string;

    if (!email || !password || !repeatPassword || !name || !csrfToken) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password !== repeatPassword) {
      return new Response(JSON.stringify({ error: 'Passwords do not match' }), {
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

    const existingUser = await context.env.USERS.get(`user:${email}`);
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'Email already registered' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const id = crypto.randomUUID();
    const user = { id, email, name, password: await hashPassword(password) };
    await context.env.USERS.put(`user:${email}`, JSON.stringify(user));

    const progress = {
      week1: { dc: false, vm: false, share: false, group: false },
      week2: { server: false, wsus: false, time: false },
      week3: { upgrade: false, exchange: false, mailbox: false, mail: false },
      week4: { external: false, hybrid: false, hosting: false },
    };
    await context.env.PROGRESS.put(`progress:${id}`, JSON.stringify(progress));

    return new Response(JSON.stringify({ message: 'Registration successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};