import { validateCSRFToken } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();

    // Validate fields
    if (!email || !password || !csrfToken) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    // CSRF token check
    const validCSRF = await validateCSRFToken(context.env, csrfToken);
    if (!validCSRF) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }

    // Look up user by email
    const userData = await context.env.USERS.get(`user:${email}`);
    if (!userData) {
      return jsonResponse({ error: 'Email not found' }, 400);
    }

    const user = JSON.parse(userData);
    if (user.password !== password) {
      return jsonResponse({ error: 'Incorrect password' }, 400);
    }

    // Generate session token
    const sessionToken = crypto.randomUUID();
    await context.env.USERS.put(`session:${sessionToken}`, user.id, {
      expirationTtl: 86400, // 24 hours
    });

    // Return success with cookie
    return new Response(JSON.stringify({ name: user.name }), {
      status: 200,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    console.error('Login error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

// Helper function to return JSON responses
function jsonResponse(obj: Record<string, any>, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
