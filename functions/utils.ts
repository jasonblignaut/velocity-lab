import { nanoid } from 'nanoid';

export async function generateCSRFToken(env: Env): Promise<string> {
  const token = nanoid(32);
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
  return password; // Cleartext as requested
}

export interface Env {
  USERS: KVNamespace;
  PROGRESS: KVNamespace;
}