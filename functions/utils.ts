function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

export async function generateCSRFToken(env: Env): Promise<string> {
  const token = generateRandomString(32);
  await env.USERS.put(`csrf:${token}`, 'valid', { expirationTtl: 3600 });
  return token;
}

export async function validateCSRFToken(env: Env, token: string): Promise<boolean> {
  const value = await env.USERS.get(`csrf:${token}`);
  if (value === 'valid') {
    await env.USERS.delete(`csrf:${token}`);
    return true;
  }
  return false;
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
}