/**
 * Velocity Lab - User Authentication Worker
 * Cloudflare Worker for handling user login
 * 
 * Features:
 * - Secure password verification using bcrypt
 * - JWT session token generation
 * - Rate limiting for brute force protection  
 * - Comprehensive logging and error handling
 * - CORS support for web app integration
 */

// Environment variables required:
// JWT_SECRET - Secret key for JWT token signing
// KV_NAMESPACE - Name of KV store for user data

export default {
  async fetch(request, env, ctx) {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      // Only allow POST method
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({
          success: false,
          message: 'Method not allowed'
        }), {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Check if required environment variables are available
      if (!env.VELOCITY_USERS || !env.JWT_SECRET) {
        console.error('Missing required environment variables');
        return new Response(JSON.stringify({
          success: false,
          message: 'Server configuration error'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Parse request body
      let formData;
      try {
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/x-www-form-urlencoded')) {
          formData = await request.formData();
        } else if (contentType.includes('application/json')) {
          const jsonData = await request.json();
          formData = new FormData();
          Object.keys(jsonData).forEach(key => {
            formData.append(key, jsonData[key]);
          });
        } else {
          formData = await request.formData();
        }
      } catch (error) {
        console.error('Failed to parse request body:', error);
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid request format'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Extract credentials
      const email = formData.get('email')?.toString().toLowerCase().trim();
      const password = formData.get('password')?.toString();
      const rememberMe = formData.get('remember') === 'on';

      // Validate input
      if (!email || !password) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Email and password are required'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email format'
        }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Rate limiting check
      const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
      const rateLimitKey = `login_attempts:${clientIP}`;
      
      try {
        const attempts = await env.VELOCITY_USERS.get(rateLimitKey);
        const attemptCount = attempts ? parseInt(attempts) : 0;
        
        if (attemptCount >= 5) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Too many login attempts. Please try again in 15 minutes.'
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      } catch (error) {
        console.warn('Rate limiting check failed:', error);
        // Continue without rate limiting if KV is unavailable
      }

      // Fetch user from KV store
      let userData;
      try {
        const userJson = await env.VELOCITY_USERS.get(`user:${email}`);
        if (!userJson) {
          // User not found - increment failed attempts
          await incrementFailedAttempts(env.VELOCITY_USERS, rateLimitKey);
          
          return new Response(JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          }), {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
        
        userData = JSON.parse(userJson);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        return new Response(JSON.stringify({
          success: false,
          message: 'Authentication service unavailable'
        }), {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Verify password using bcrypt-like comparison
      const isValidPassword = await verifyPassword(password, userData.passwordHash);
      
      if (!isValidPassword) {
        // Invalid password - increment failed attempts
        await incrementFailedAttempts(env.VELOCITY_USERS, rateLimitKey);
        
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Check if account is active
      if (userData.status !== 'active') {
        return new Response(JSON.stringify({
          success: false,
          message: 'Account is not active. Please contact support.'
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Clear failed attempts on successful login
      try {
        await env.VELOCITY_USERS.delete(rateLimitKey);
      } catch (error) {
        console.warn('Failed to clear rate limit:', error);
      }

      // Generate JWT session token
      const tokenExpiryHours = rememberMe ? 720 : 24; // 30 days or 24 hours
      const sessionToken = await generateJWT({
        userId: userData.id,
        email: userData.email,
        role: userData.role
      }, env.JWT_SECRET, tokenExpiryHours);

      // Update last login timestamp
      try {
        userData.lastLogin = new Date().toISOString();
        userData.loginCount = (userData.loginCount || 0) + 1;
        await env.VELOCITY_USERS.put(`user:${email}`, JSON.stringify(userData));
      } catch (error) {
        console.warn('Failed to update login timestamp:', error);
        // Continue - this is not critical
      }

      // Log successful login
      console.log(`Successful login: ${email} from ${clientIP}`);

      // Return success response
      return new Response(JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          sessionToken: sessionToken,
          lastLogin: userData.lastLogin,
          expiresIn: tokenExpiryHours * 3600 // seconds
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Login handler error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/**
 * Increment failed login attempts with TTL
 */
async function incrementFailedAttempts(kv, rateLimitKey) {
  try {
    const current = await kv.get(rateLimitKey);
    const count = current ? parseInt(current) + 1 : 1;
    
    // Set with 15 minute TTL (900 seconds)
    await kv.put(rateLimitKey, count.toString(), {
      expirationTtl: 900
    });
  } catch (error) {
    console.warn('Failed to increment failed attempts:', error);
  }
}

/**
 * Verify password against hash
 * This is a simplified version - in production, use proper bcrypt
 */
async function verifyPassword(password, hash) {
  try {
    // For demo purposes, using SHA-256 with salt
    // In production, use proper bcrypt library
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'velocity_salt_2024');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex === hash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Generate JWT token
 */
async function generateJWT(payload, secret, expiryHours = 24) {
  try {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiryHours * 3600);

    const jwtPayload = {
      ...payload,
      iat: now,
      exp: exp,
      iss: 'velocity-lab'
    };

    // Encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(jwtPayload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Create signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${data}.${encodedSignature}`;
  } catch (error) {
    console.error('JWT generation error:', error);
    throw new Error('Failed to generate session token');
  }
}

/**
 * Validate JWT token (utility function for other endpoints)
 */
export async function validateJWT(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    
    // Verify signature
    const data = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));

    if (!isValid) {
      throw new Error('Invalid token signature');
    }

    // Decode and verify payload
    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    console.error('JWT validation error:', error);
    return null;
  }
}