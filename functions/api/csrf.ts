// functions/api/csrf.ts
// CSRF token generation endpoint with CORS support

import { generateSecureToken, checkRateLimit } from './utils';
import type { Env } from './utils';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',  // In production, replace '*' with your exact frontend origin, e.g. 'https://velocityvtglab.pages.dev'
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight requests (CORS)
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;

    // 1) Rate limiting by IP
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `csrf:${clientIP}`, 20, 60);
    if (!canProceed) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }

    // 2) Generate a one‐hour CSRF token
    const token = generateSecureToken();
    const expirationTtl = 3600; // 1 hour in seconds

    // 3) Store token in KV for one‐time validation
    await env.USERS.put(
      `csrf:${token}`,
      JSON.stringify({
        created: new Date().toISOString(),
        ip: clientIP,
      }),
      { expirationTtl }
    );

    // 4) Return JSON with token + expiry
    return new Response(
      JSON.stringify({
        token,
        expires: new Date(Date.now() + expirationTtl * 1000).toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      }
    );
  } catch (error) {
    console.error('CSRF generation error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate CSRF token' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...CORS_HEADERS,
      },
    });
  }
};

// One-time validation helper (imported by login.ts / register.ts)
export async function validateCSRFToken(env: Env, token: string | null): Promise<boolean> {
  if (!token) return false;
  const data = await env.USERS.get(`csrf:${token}`);
  if (!data) return false;

  // Delete immediately (one‐time use)
  await env.USERS.delete(`csrf:${token}`);
  return true;
}
