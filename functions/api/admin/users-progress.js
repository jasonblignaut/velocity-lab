// Netlify/Vercel Functions API - Admin Users Progress
// File: /functions/api/admin/users-progress.js

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
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
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
    
    // For demo purposes, create mock admin data
    // In production, you'd verify the session and check if user is admin
    // and fetch real user data from your database
    
    const mockUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        completedTasks: 35,
        progressPercentage: 83,
        completedLabs: 2,
        hasNotes: true,
        lastActive: new Date().toISOString()
      },
      {
        name: 'Jane Smith', 
        email: 'jane@example.com',
        role: 'user',
        completedTasks: 28,
        progressPercentage: 67,
        completedLabs: 1,
        hasNotes: false,
        lastActive: new Date(Date.now() - 86400000).toISOString() // 1 day ago
      },
      {
        name: 'Admin User',
        email: 'admin@example.com', 
        role: 'admin',
        completedTasks: 42,
        progressPercentage: 100,
        completedLabs: 3,
        hasNotes: true,
        lastActive: new Date().toISOString()
      }
    ];

    // Sort by progress (completed tasks first, then percentage)
    mockUsers.sort((a, b) => {
      if (a.completedTasks !== b.completedTasks) {
        return b.completedTasks - a.completedTasks;
      }
      return b.progressPercentage - a.progressPercentage;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: mockUsers
      })
    };

  } catch (error) {
    console.error('Admin users progress error:', error);
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