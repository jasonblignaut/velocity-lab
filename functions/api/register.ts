export async function onRequestPost({ env, request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const repeatPassword = formData.get('repeatPassword');
  const name = formData.get('name');
  const csrfToken = formData.get('csrf_token');
  const sessionId = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1];

  if (!sessionId || !csrfToken) {
    return new Response(JSON.stringify({ error: 'Invalid session or CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const session = await env.SESSIONS.get(sessionId);
  if (!session || JSON.parse(session).csrfToken !== csrfToken) {
    return new Response(JSON.stringify({ error: 'Invalid CSRF token' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (password !== repeatPassword) {
    return new Response(JSON.stringify({ error: 'Passwords do not match' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (await env.USERS.get(email)) {
    return new Response(JSON.stringify({ error: 'User already exists' }), {
      status: 409,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userData = {
    email,
    name,
    password, // Replace with hashed password in production
    role: 'user',
    createdAt: new Date().toISOString()
  };

  await env.USERS.put(email, JSON.stringify(userData));
  return new Response(JSON.stringify({ email, name, role: 'user' }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`
    }
  });
}