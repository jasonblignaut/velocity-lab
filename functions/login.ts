import { hashPassword } from './utils';

interface LoginRequest {
  email: string;
  password: string;
  csrf_token: string;
}

export async function handleLogin(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData();
  const { email, password, csrf_token } = Object.fromEntries(formData) as unknown as LoginRequest;

  // Validate CSRF token
  const sessionToken = request.headers.get('X-CSRF-Token') || '';
  if (csrf_token !== sessionToken) {
    return new Response(JSON.stringify({ message: 'Invalid CSRF token' }), { status: 403 });
  }

  // Validate input
  if (!email || !password) {
    return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
  }

  // Check if user exists
  const userData = await env.KV.get(`user:${email}`);
  if (!userData) {
    return new Response(JSON.stringify({ message: 'User not found' }), { status: 400 });
  }

  // Verify password
  const user = JSON.parse(userData);
  if (user.password !== await hashPassword(password)) {
    return new Response(JSON.stringify({ message: 'Incorrect password' }), { status: 400 });
  }

  // Set session cookie
  const sessionId = crypto.randomUUID();
  await env.KV.put(`session:${sessionId}`, email, { expirationTtl: 86400 });

  return new Response(JSON.stringify({ message: 'Login successful', userName: user.name }), {
    status: 200,
    headers: {
      'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`,
    },
  });
}