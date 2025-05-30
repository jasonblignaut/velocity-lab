import { validateCSRFToken } from './utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();

    // Validate inputs
    if (!name || !email || !password || !csrfToken) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const isValidCSRF = await validateCSRFToken(context.env, csrfToken);
    if (!isValidCSRF) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }

    // Check if user already exists
    const existingUser = await context.env.USERS.get(`user:${email}`);
    if (existingUser) {
      return jsonResponse({ error: 'Email already registered' }, 409);
    }

    // Generate user ID and session token
    const userId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();

    // You should hash the password in production using bcrypt or similar
    const userData = {
      id: userId,
      name,
      email,
      password, // ⚠️ Store hashed password in production
    };

    // Store user and session
    await context.env.USERS.put(`user:${email}`, JSON.stringify(userData));
    await context.env.USERS.put(`session:${sessionToken}`, userId, {
      expirationTtl: 86400,
    });

    return new Response(JSON.stringify({ name }), {
      status: 201,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict`,
        'Content-Type': 'application/json',
      },
    });

  } catch (err) {
    console.error('Register error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

// Reusable JSON response helper
function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
