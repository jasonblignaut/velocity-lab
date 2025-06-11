// Cloudflare Workers API - Start New Lab
// File: /api/lab/start.js

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
      // Only allow POST requests
      if (request.method !== 'POST') {
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
      
      // Get current lab history
      const historyKey = `lab-history:${userEmail}`;
      let labHistory = await env.VELOCITY_KV.get(historyKey, 'json') || [];
      
      // Get current progress to check if current lab should be marked as completed
      const progressKey = `progress:${userEmail}`;
      const userProgress = await env.VELOCITY_KV.get(progressKey, 'json') || {};
      
      const totalTasks = 42;
      const completedTasks = Object.values(userProgress).filter(task => task?.completed).length;
      const isCurrentLabCompleted = completedTasks === totalTasks;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Check for existing in-progress lab today
      const todayInProgressLab = labHistory.find(lab => 
        lab.date === today && lab.status === 'started'
      );
      
      if (todayInProgressLab) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Lab already started today',
          data: {
            labId: todayInProgressLab.labId,
            session: todayInProgressLab.session,
            startedAt: todayInProgressLab.startedAt
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Mark current lab as completed if all tasks are done
      if (labHistory.length > 0 && isCurrentLabCompleted) {
        const currentLab = labHistory[labHistory.length - 1];
        if (currentLab.status === 'started') {
          currentLab.status = 'completed';
          currentLab.completedAt = new Date().toISOString();
          currentLab.tasksCompleted = completedTasks;
          currentLab.totalTasks = totalTasks;
        }
      }
      
      // Create new lab session
      const newSession = {
        session: labHistory.length + 1,
        date: today,
        status: 'started',
        labId: `LAB${String(labHistory.length + 1).padStart(3, '0')}`,
        startedAt: new Date().toISOString(),
        tasksCompleted: 0,
        totalTasks: totalTasks
      };
      
      // Add new session to history
      labHistory.push(newSession);
      
      // Save updated lab history
      await env.VELOCITY_KV.put(historyKey, JSON.stringify(labHistory));
      
      // Reset user progress for new lab
      await env.VELOCITY_KV.put(progressKey, JSON.stringify({}));
      
      return new Response(JSON.stringify({
        success: true,
        message: 'New lab started successfully',
        data: {
          labId: newSession.labId,
          session: newSession.session,
          startedAt: newSession.startedAt,
          previousLabCompleted: isCurrentLabCompleted
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Start lab error:', error);
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