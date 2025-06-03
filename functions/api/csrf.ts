// functions/api/csrf.ts
// Enhanced CSRF token generation and validation

import { 
  generateCSRFToken,
  validateCSRFToken as utilsValidateCSRFToken
} from '../utils';
import type { Env } from '../utils';

// Export the validateCSRFToken function for use in other modules
export const validateCSRFToken = utilsValidateCSRFToken;

// GET endpoint for CSRF token generation
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env } = context;
    
    // Generate new CSRF token
    const token = await generateCSRFToken(env);
    
    return new Response(JSON.stringify({ 
      token,
      expiresIn: 3600 // 1 hour
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
    });
    
  } catch (error) {
    console.error('CSRF token generation failed:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate CSRF token' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};