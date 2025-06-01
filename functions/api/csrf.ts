// functions/api/csrf.ts
// CSRF token generation endpoint

import { generateCSRFToken, jsonResponse, errorResponse } from './utils';
import type { Env } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Rate limiting check (optional)
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `csrf-limit:${clientIP}`;
    const requests = await env.USERS.get(rateLimitKey);
    
    if (requests) {
      const count = parseInt(requests);
      if (count > 20) { // Max 20 CSRF tokens per minute per IP
        return errorResponse('Too many requests', 429);
      }
      await env.USERS.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 60 });
    } else {
      await env.USERS.put(rateLimitKey, '1', { expirationTtl: 60 });
    }
    
    // Generate new CSRF token
    const token = await generateCSRFToken(env);
    
    // Set CORS headers if needed
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    };
    
    return jsonResponse(
      { 
        token,
        expires: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      }, 
      200, 
      headers
    );
  } catch (error) {
    console.error('CSRF generation error:', error);
    return errorResponse('Failed to generate CSRF token', 500);
  }
};

// Handle preflight requests
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
};

// Reject other methods
export const onRequestPost: PagesFunction<Env> = async () => {
  return errorResponse('Method not allowed', 405);
};

export const onRequestPut: PagesFunction<Env> = async () => {
  return errorResponse('Method not allowed', 405);
};

export const onRequestDelete: PagesFunction<Env> = async () => {
  return errorResponse('Method not allowed', 405);
};