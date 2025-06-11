// Cloudflare Workers API - User Lab History
// File: /api/user/lab-history.js

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
      
      // Verify session
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

      const userEmail = sessionData.email;

      if (request.method === 'GET') {
        // Get lab history
        const historyKey = `lab-history:${userEmail}`;
        let labHistory = await env.VELOCITY_KV.get(historyKey, 'json') || [];
        
        // If no history exists, create default first lab
        if (labHistory.length === 0) {
          const today = new Date().toISOString().split('T')[0];
          const defaultLab = {
            session: 1,
            date: today,
            status: 'started',
            labId: 'LAB001',
            startedAt: new Date().toISOString(),
            tasksCompleted: 0,
            totalTasks: 42
          };
          
          labHistory = [defaultLab];
          await env.VELOCITY_KV.put(historyKey, JSON.stringify(labHistory));
        }
        
        // Update current lab progress
        const progressKey = `progress:${userEmail}`;
        const userProgress = await env.VELOCITY_KV.get(progressKey, 'json') || {};
        const completedTasks = Object.values(userProgress).filter(task => task?.completed).length;
        
        // Update the current lab's task count
        const currentLab = labHistory.find(lab => lab.status === 'started');
        if (currentLab) {
          currentLab.tasksCompleted = completedTasks;
          
          // Auto-complete if all tasks are done
          if (completedTasks === 42) {
            currentLab.status = 'completed';
            currentLab.completedAt = new Date().toISOString();
          }
          
          await env.VELOCITY_KV.put(historyKey, JSON.stringify(labHistory));
        }

        return new Response(JSON.stringify({
          success: true,
          data: labHistory
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else if (request.method === 'POST') {
        // Add new lab session entry
        const body = await request.json();
        const { session, date, status, labId, startedAt, completedAt, tasksCompleted, totalTasks } = body;
        
        if (!session || !date || !status || !labId) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Missing required fields'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const historyKey = `lab-history:${userEmail}`;
        let labHistory = await env.VELOCITY_KV.get(historyKey, 'json') || [];
        
        // Create new lab entry
        const newEntry = {
          session,
          date,
          status,
          labId,
          startedAt: startedAt || new Date().toISOString(),
          ...(completedAt && { completedAt }),
          ...(tasksCompleted !== undefined && { tasksCompleted }),
          ...(totalTasks !== undefined && { totalTasks })
        };
        
        // Check if entry with same labId already exists
        const existingIndex = labHistory.findIndex(entry => entry.labId === labId);
        if (existingIndex >= 0) {
          // Update existing entry
          labHistory[existingIndex] = { ...labHistory[existingIndex], ...newEntry };
        } else {
          // Add new entry
          labHistory.push(newEntry);
        }
        
        // Sort by session number
        labHistory.sort((a, b) => a.session - b.session);
        
        await env.VELOCITY_KV.put(historyKey, JSON.stringify(labHistory));

        return new Response(JSON.stringify({
          success: true,
          message: 'Lab history updated successfully',
          data: newEntry
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } else {
        return new Response(JSON.stringify({
          success: false,
          message: 'Method not allowed'
        }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

    } catch (error) {
      console.error('Lab history error:', error);
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