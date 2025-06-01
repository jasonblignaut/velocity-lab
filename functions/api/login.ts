export async function onRequestPost({ env, request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
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

  const user = await env.USERS.get(email);
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const userData = JSON.parse(user);
  // Simplified password check (update with your hashing logic)
  if (password !== userData.password) {
    return new Response(JSON.stringify({ error: 'Invalid password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({ email, name: userData.name, role: userData.role }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`
    }
  });
}