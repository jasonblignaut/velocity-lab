import { validateCSRFToken, hashPassword } from './utils';
import sanitizeHtml from 'sanitize-html';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const name = sanitizeHtml(formData.get('name')?.toString().trim() || '');
    const email = sanitizeHtml(formData.get('email')?.toString().trim().toLowerCase() || '');
    const password = formData.get('password')?.toString();
    const csrfToken = formData.get('csrf_token')?.toString();

    // Input validation
    if (!name || !email || !password || !csrfToken) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ error: 'Invalid email format' }, 400);
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      return jsonResponse({ error: 'Password must be at least 8 characters with uppercase, lowercase, and numbers' }, 400);
    }

    if (!await validateCSRFToken(context.env, csrfToken)) {
      return jsonResponse({ error: 'Invalid CSRF token' }, 403);
    }

    // Check if user exists
    const existingUser = await context.env.USERS.get(`user:${email}`);
    if (existingUser) {
      return jsonResponse({ error: 'Email already registered' }, 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password, context.env.BCRYPT_SALT_ROUNDS);

    // Generate user ID and session token
    const userId = crypto.randomUUID();
    const sessionToken = crypto.randomUUID();

    const userData = {
      id: userId,
      name,
      email,
      password: hashedPassword,
    };

    // Store user and session
    await Promise.all([
      context.env.USERS.put(`user:${email}`, JSON.stringify(userData)),
      context.env.USERS.put(`session:${sessionToken}`, userId, { expirationTtl: 86400 }),
    ]);

    return new Response(JSON.stringify({ name }), {
      status: 201,
      headers: {
        'Set-Cookie': `session=${sessionToken}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}