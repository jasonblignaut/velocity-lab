// functions/api/csrf.ts
// CSRF token generation endpoint

import { generateCSRFToken, jsonResponse, errorResponse, checkRateLimit } from './utils';
import type { Env } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;

    // Rate limiting check
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(env, `csrf:${clientIP}`, 20, 60)) {
      return errorResponse('Too many requests', 429);
    }

    // Generate new CSRF token
    const token = await generateCSRFToken(env);

    // Set CORS headers
    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Access-Control-Allow-Origin': '*' // Adjust for production to specific origins
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
      'Access-Control-Allow-Origin': '*', // Adjust for production to specific origins
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
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