// /functions/api/user/lab-history.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_LABS }) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  console.log(`[Lab History] Request received: ${event.httpMethod} ${event.path}`);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('[Lab History] Handling OPTIONS preflight');
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    console.log(`[Lab History] Invalid method: ${event.httpMethod}`);
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
      console.log('[Lab History] Missing or invalid Authorization header');
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
    console.log(`[Lab History] Session token: ${sessionToken}`);

    // Check KV binding
    if (!VELOCITY_SESSIONS) {
      console.error('[Lab History] VELOCITY_SESSIONS KV binding missing');
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
    if (!sessionData) {
      console.log(`[Lab History] Invalid session token: ${sessionToken}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid session token'
        })
      };
    }
    console.log(`[Lab History] Session data: ${JSON.stringify(sessionData)}`);

    // Fetch lab history from KV
    if (!VELOCITY_LABS) {
      console.error('[Lab History] VELOCITY_LABS KV binding missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error'
        })
      };
    }

    const labHistoryList = [];
    const labKeys = await VELOCITY_LABS.list();
    console.log(`[Lab History] Found ${labKeys.keys.length} keys in VELOCITY_LABS`);
    for (const key of labKeys.keys) {
      if (key.name.startsWith(`lab:${sessionToken}:`)) {
        const labData = await VELOCITY_LABS.get(key.name, { type: 'json' });
        if (labData) {
          labHistoryList.push(labData);
        }
      }
    }
    console.log(`[Lab History] Returning ${labHistoryList.length} lab history items`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: labHistoryList
      })
    };
  } catch (error) {
    console.error(`[Lab History] Error: ${error.message}`, error.stack);
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