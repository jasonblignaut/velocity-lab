// /functions/api/lab/start.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_LABS }) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
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

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { labId, config } = body;
    if (!labId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Lab ID is required'
        })
      };
    }

    // Store lab session in KV
    const labSession = {
      labId,
      userEmail: sessionData.email,
      config: config || {},
      startedAt: new Date().toISOString(),
      status: 'running'
    };
    const labKey = `lab:${sessionToken}:${labId}:${Date.now()}`;
    await VELOCITY_LABS.put(labKey, JSON.stringify(labSession));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Lab started successfully',
        data: labSession
      })
    };
  } catch (error) {
    console.error('Lab start error:', error);
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