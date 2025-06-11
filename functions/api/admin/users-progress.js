// /functions/api/admin/users-progress.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_PROGRESS }) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method Not Allowed'
      })
    };
  }

  try {
    // Extract and validate authorization token
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Authorization header missing or invalid'
        })
      };
    }

    const sessionToken = authHeader.replace('Bearer ', '');
    const sessionData = await VELOCITY_SESSIONS.get(`session:${sessionToken}`, { type: 'json' });
    if (!sessionData || sessionData.role !== 'admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Admin access required'
        })
      };
    }

    // Fetch all user progress from KV
    const progressList = await VELOCITY_PROGRESS.list();
    const progressData = [];
    for (const key of progressList.keys) {
      if (key.name.startsWith('progress:')) {
        const data = await VELOCITY_PROGRESS.get(key.name, { type: 'json' });
        progressData.push(data);
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: progressData
      })
    };
  } catch (error) {
    console.error('Users progress error:', error);
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