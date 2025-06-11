// Cloudflare Workers API - Admin Users Progress
// File: /api/admin/users-progress.js

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Only allow GET requests
      if (request.method !== 'GET') {
        return new Response(JSON.stringify({
          success: false,
          message: 'Method not allowed'
        }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check authorization
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Authorization required'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const sessionToken = authHeader.replace('Bearer ', '');
      
      // Verify admin session
      const sessionData = await env.VELOCITY_KV.get(`session:${sessionToken}`, 'json');
      if (!sessionData) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid session'
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check if user is admin
      const userData = await env.VELOCITY_KV.get(`user:${sessionData.email}`, 'json');
      if (!userData || userData.role !== 'admin') {
        return new Response(JSON.stringify({
          success: false,
          message: 'Admin access required'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get all users
      const allKeys = await env.VELOCITY_KV.list({ prefix: 'user:' });
      const usersData = [];

      for (const key of allKeys.keys) {
        const user = await env.VELOCITY_KV.get(key.name, 'json');
        if (user && user.email) {
          // Get user progress
          const progressKey = `progress:${user.email}`;
          const userProgress = await env.VELOCITY_KV.get(progressKey, 'json') || {};
          
          // Get user lab history
          const historyKey = `lab-history:${user.email}`;
          const labHistory = await env.VELOCITY_KV.get(historyKey, 'json') || [];

          // Calculate progress stats
          const totalTasks = 42;
          const completedTasks = Object.values(userProgress).filter(task => task?.completed).length;
          const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
          
          // Calculate completed labs
          const completedLabs = labHistory.filter(lab => lab.status === 'completed').length;
          
          // Check if user has notes
          const hasNotes = Object.values(userProgress).some(task => task?.notes && task.notes.trim().length > 0);
          
          // Get last active time
          const lastActive = Math.max(
            ...Object.values(userProgress).map(task => task?.lastUpdated ? new Date(task.lastUpdated).getTime() : 0),
            ...labHistory.map(lab => lab?.startedAt ? new Date(lab.startedAt).getTime() : 0)
          );

          usersData.push({
            name: user.name,
            email: user.email,
            role: user.role,
            completedTasks,
            progressPercentage,
            completedLabs,
            hasNotes,
            lastActive: lastActive > 0 ? new Date(lastActive).toISOString() : null
          });
        }
      }

      // Sort by progress (completed tasks first, then percentage)
      usersData.sort((a, b) => {
        if (a.completedTasks !== b.completedTasks) {
          return b.completedTasks - a.completedTasks;
        }
        return b.progressPercentage - a.progressPercentage;
      });

      return new Response(JSON.stringify({
        success: true,
        data: usersData
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Admin users progress error:', error);
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};