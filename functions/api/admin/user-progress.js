// functions/api/admin/users-progress.js
// Admin Users Progress Endpoint for Velocity Lab

import { createResponse, createErrorResponse } from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return createErrorResponse('Authorization required', 401);
    }
    
    // Try different KV binding names
    let sessionsKV = env.VELOCITY_SESSIONS || env.velocity_sessions || env.sessions;
    let usersKV = env.VELOCITY_USERS || env.velocity_users || env.users;
    let progressKV = env.VELOCITY_PROGRESS || env.velocity_progress || env.progress;
    
    if (!sessionsKV || !usersKV) {
      return createErrorResponse('Database configuration error', 500);
    }
    
    // Validate session and check admin role
    const sessionData = await sessionsKV.get(sessionToken);
    if (!sessionData) {
      return createErrorResponse('Invalid or expired session', 401);
    }
    
    const session = JSON.parse(sessionData);
    if (session.role !== 'admin') {
      return createErrorResponse('Admin access required', 403);
    }
    
    // Get all users
    const usersList = await usersKV.list({ prefix: 'user:' });
    const users = [];
    
    // Process each user
    for (const key of usersList.keys) {
      try {
        const userData = await usersKV.get(key.name);
        if (userData) {
          const user = JSON.parse(userData);
          
          // Get user progress
          let completedTasks = 0;
          let h