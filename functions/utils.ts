async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  const hashArray = Array.from(new Uint8Array(hash));
  const saltArray = Array.from(salt);
  return `${btoa(String.fromCharCode(...saltArray))}.${btoa(String.fromCharCode(...hashArray))}`;
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [saltB64, hashB64] = hashedPassword.split('.');
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const hash = Uint8Array.from(atob(hashB64), c => c.charCodeAt(0));
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedHash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    key,
    256
  );
  const derivedHashArray = Array.from(new Uint8Array(derivedHash));
  return derivedHashArray.every((byte, i) => byte === hash[i]);
}

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

export { hashPassword, verifyPassword };

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
}