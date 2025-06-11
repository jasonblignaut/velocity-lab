// Netlify/Vercel Functions API - User Lab History
// File: /functions/api/user/lab-history.js

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
    // 2. Get user ID from session
    // 3. Load/save user's lab history from database

    if (event.httpMethod === 'GET') {
      // Mock lab history data
      const mockLabHistory = [
        {
          session: 1,
          date: new Date().toISOString().split('T')[0],
          status: 'started',
          labId: 'LAB001',
          startedAt: new Date().toISOString(),
          tasksCompleted: 0,
          totalTasks: 42
        }
      ];
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: mockLabHistory
        })
      };

    } else if (event.httpMethod === 'POST') {
      // Add/update lab session entry
      const body = JSON.parse(event.body || '{}');
      const { session, date, status, labId, startedAt, completedAt, tasksCompleted, totalTasks } = body;
      
      if (!session || !date || !status || !labId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Missing required fields'
          })
        };
      }

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
      
      // In production: Save to database here
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Lab history updated successfully',
          data: newEntry
        })
      };

    } else {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Method not allowed'
        })
      };
    }

  } catch (error) {
    console.error('Lab history error:', error);
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