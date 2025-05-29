import { hashPassword } from './utils';

interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  csrf_token: string;
}

export async function handleRegister(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData();
  const { email, name, password, csrf_token } = Object.fromEntries(formData) as unknown as RegisterRequest;

  // Validate CSRF token
  const sessionToken = request.headers.get('X-CSRF-Token') || '';
  if (csrf_token !== sessionToken) {
    return new Response(JSON.stringify({ message: 'Invalid CSRF token' }), { status: 403 });
  }

  // Validate input
  if (!email || !name || !password) {
    return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
  }

  // Check if user exists
  const existingUser = await env.KV.get(`user:${email}`);
  if (existingUser) {
    return new Response(JSON.stringify({ message: 'User already exists' }), { status: 400 });
  }

  // Store user
  const hashedPassword = await hashPassword(password);
  const userData = JSON.stringify({ email, name, password: hashedPassword });
  await env.KV.put(`user:${email}`, userData);

  return new Response(JSON.stringify({ message: 'Registration successful' }), { status: 200 });
}