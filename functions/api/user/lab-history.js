// /functions/api/user/lab-history.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_LABS }) => {
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
    if (!sessionData) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid session token'
        })
      };
    }

    // Fetch lab history from KV
    const labHistoryList = [];
    const labKeys = await VELOCITY_LABS.list();
    for (const key of labKeys.keys) {
      if (key.name.startsWith(`lab:${sessionToken}:`)) {
        const labData = await VELOCITY_LABS.get(key.name, { type: 'json' });
        labHistoryList.push(labData);
      }
    }

    return {
      statusCode: 200,
      headers: {
        success: true,
        data: labHistoryList
      }
    });
  } catch (error) {
    console.log('Lab history error:', error);
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