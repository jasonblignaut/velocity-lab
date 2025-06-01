// functions/api/avatar.ts
// Avatar upload and retrieval endpoints

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  checkRateLimit
} from './utils';
import type { Env } from './utils';

// GET avatar
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Get avatar
    const avatar = await env.AVATARS.get(userId, { type: 'arrayBuffer' });
    if (!avatar) {
      return new Response(null, { status: 404 });
    }
    
    return new Response(avatar, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Avatar GET error:', error);
    return errorResponse('Internal server error', 500);
  }
};

// POST avatar upload
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
    
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const canProceed = await checkRateLimit(env, `avatar:${clientIP}`, 5, 3600);
    
    if (!canProceed) {
      return errorResponse('Too many uploads. Please try again later.', 429);
    }
    
    const formData = await request.formData();
    const avatar = formData.get('avatar');
    
    if (!avatar || !(avatar instanceof File)) {
      return errorResponse('No file uploaded', 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(avatar.type)) {
      return errorResponse('Invalid file type. Only images are allowed.', 400);
    }
    
    // Validate file size (5MB limit)
    if (avatar.size > 5 * 1024 * 1024) {
      return errorResponse('File too large. Maximum size is 5MB.', 400);
    }
    
    // Save avatar
    const arrayBuffer = await avatar.arrayBuffer();
    await env.AVATARS.put(userId, arrayBuffer);
    
    // Log upload
    await env.USERS.put(
      `log:avatar:${new Date().toISOString()}:${userId}`,
      JSON.stringify({ 
        action: 'avatar_upload',
        size: avatar.size,
        type: avatar.type
      }),
      { expirationTtl: 86400 * 30 }
    );
    
    return jsonResponse({ message: 'Avatar uploaded successfully' });
  } catch (error) {
    console.error('Avatar POST error:', error);
    return errorResponse('Internal server error', 500);
  }
};