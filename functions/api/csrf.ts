// functions/api/csrf.ts
// CSRF token generation endpoint

import { generateSecureToken, jsonResponse, errorResponse, checkRateLimit } from './utils';
import type { Env } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `csrf:${clientIP}`, 20, 60);
    
    if (!canProceed) {
      return errorResponse('Too many requests', 429);
    }
    
    // Generate CSRF token
    const token = generateSecureToken();
    const expirationTtl = 3600; // 1 hour
    
    // Store token
    await env.USERS.put(
      `csrf:${token}`, 
      JSON.stringify({
        created: new Date().toISOString(),
        ip: clientIP
      }), 
      { expirationTtl }
    );
    
    return jsonResponse({
      token,
      expires: new Date(Date.now() + expirationTtl * 1000).toISOString()
    });
  } catch (error) {
    console.error('CSRF generation error:', error);
    return errorResponse('Failed to generate CSRF token', 500);
  }
};

// Validate CSRF token
export async function validateCSRFToken(env: Env, token: string | null): Promise<boolean> {
  if (!token) return false;
  
  const data = await env.USERS.get(`csrf:${token}`);
  if (!data) return false;
  
  // Delete token after validation (one-time use)
  await env.USERS.delete(`csrf:${token}`);
  return true;
}