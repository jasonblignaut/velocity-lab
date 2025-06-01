export async function onRequestGet({ env, request }) {
  const sessionId = request.headers.get('Cookie')?.match(/session=([^;]+)/)?.[1] || crypto.randomUUID();
  const token = crypto.randomUUID();
  await env.SESSIONS.put(sessionId, JSON.stringify({ csrfToken: token }));
  return new Response(JSON.stringify({ token }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`,
      'Access-Control-Allow-Origin': 'https://velocitylab.pages.dev',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
}