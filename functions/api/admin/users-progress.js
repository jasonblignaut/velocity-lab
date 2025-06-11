// /functions/api/admin/users-progress.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_PROGRESS }) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  console.log(`[Users Progress] Request received: ${event.httpMethod} ${event.path}`);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('[Users Progress] Handling OPTIONS preflight');
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    console.log(`[Users Progress] Invalid method: ${event.httpMethod}`);
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
      console.log('[Users Progress] Missing or invalid Authorization header');
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
    console.log(`[Users Progress] Session token: ${sessionToken}`);

    // Check KV binding
    if (!VELOCITY_SESSIONS) {
      console.error('[Users Progress] VELOCITY_SESSIONS KV binding missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error'
        })
      };
    }

    const sessionData = await VELOCITY_SESSIONS.get(`session:${sessionToken}`, { type: 'json' });
    if (!sessionData || sessionData.role !== 'admin') {
      console.log(`[Users Progress] Invalid session or role: ${JSON.stringify(sessionData)}`);
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Admin access required'
        })
      };
    }
    console.log(`[Users Progress] Session data: ${JSON.stringify(sessionData)}`);

    // Fetch all user progress from KV
    if (!VELOCITY_PROGRESS) {
      console.error('[Users Progress] VELOCITY_PROGRESS KV binding missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error'
        })
      };
    }

    const progressList = await VELOCITY_PROGRESS.list();
    const progressData = [];
    console.log(`[Users Progress] Found ${progressList.keys.length} keys in VELOCITY_PROGRESS`);
    for (const key of progressList.keys) {
      if (key.name.startsWith('progress:')) {
        const data = await VELOCITY_PROGRESS.get(key.name, { type: 'json' });
        if (data) {
          progressData.push(data);
        }
      }
    }
    console.log(`[Users Progress] Returning ${progressData.length} progress items`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: progressData
      })
    };
  } catch (error) {
    console.error(`[Users Progress] Error: ${error.message}`, error.stack);
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