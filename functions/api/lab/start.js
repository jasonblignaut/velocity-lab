// Netlify/Vercel Functions API - Start New Lab
// File: /functions/api/lab/start.js

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Method not allowed'
        })
      };
    }

    // Check authorization
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Authorization required'
        })
      };
    }

    const sessionToken = authHeader.replace('Bearer ', '');
    
    // For demo purposes - in production you'd:
    // 1. Verify the session token
    // 2. Get user from database
    // 3. Load their actual lab history and progress
    // 4. Save to database
    
    // Mock lab creation logic
    const today = new Date().toISOString().split('T')[0];
    
    // Simulate getting existing lab history (in production, load from database)
    const mockLabHistory = JSON.parse(context.clientContext?.custom?.labHistory || '[]');
    
    // Check for existing in-progress lab today
    const todayInProgressLab = mockLabHistory.find(lab => 
      lab.date === today && lab.status === 'started'
    );
    
    if (todayInProgressLab) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Lab already started today',
          data: {
            labId: todayInProgressLab.labId,
            session: todayInProgressLab.session,
            startedAt: todayInProgressLab.startedAt
          }
        })
      };
    }
    
    // Check if current lab should be marked as completed
    // (In production, check actual user progress)
    const isCurrentLabCompleted = false; // Mock value
    
    // Mark current lab as completed if needed
    if (mockLabHistory.length > 0 && isCurrentLabCompleted) {
      const currentLab = mockLabHistory[mockLabHistory.length - 1];
      if (currentLab.status === 'started') {
        currentLab.status = 'completed';
        currentLab.completedAt = new Date().toISOString();
        currentLab.tasksCompleted = 42;
        currentLab.totalTasks = 42;
      }
    }
    
    // Create new lab session
    const newSession = {
      session: mockLabHistory.length + 1,
      date: today,
      status: 'started',
      labId: `LAB${String(mockLabHistory.length + 1).padStart(3, '0')}`,
      startedAt: new Date().toISOString(),
      tasksCompleted: 0,
      totalTasks: 42
    };
    
    // In production: Save to database here
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'New lab started successfully',
        data: {
          labId: newSession.labId,
          session: newSession.session,
          startedAt: newSession.startedAt,
          previousLabCompleted: isCurrentLabCompleted
        }
      })
    };

  } catch (error) {
    console.error('Start lab error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Internal server error'
      })
    };
  }
};