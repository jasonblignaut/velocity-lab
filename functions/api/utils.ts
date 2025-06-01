// utils.ts

// Utility: Generate a cryptographically secure random token (CSRF or session)
export function generateToken(length: number = 48): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const crypto = globalThis.crypto || (self as any).crypto;
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += charset[array[i] % charset.length];
  }
  return token;
}

// Generate a CSRF token, store in KV tied to sessionId
export async function generateCSRFToken(env: Env, sessionId: string): Promise<string> {
  const token = generateToken(64);
  await env.USERS.put(`csrf:${sessionId}`, token, { expirationTtl: 3600 }); // 1 hour TTL
  return token;
}

// Validate submitted CSRF token matches stored one for sessionId
export async function validateCSRFToken(env: Env, token: string, sessionId: string): Promise<boolean> {
  if (!token || !sessionId) return false;
  const storedToken = await env.USERS.get(`csrf:${sessionId}`);
  return storedToken === token;
}

// Standardized JSON response helper
export function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// Standardized error response helper
export function errorResponse(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
