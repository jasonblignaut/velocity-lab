// /functions/api/lab/start.js
exports.handler = async (event, context, { VELOCITY_SESSIONS, VELOCITY_LABS }) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  console.log(`[Lab Start] Request received: ${event.httpMethod} ${event.path}`);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    console.log('[Lab Start] Handling OPTIONS preflight');
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    console.log(`[Lab Start] Invalid method: ${event.httpMethod}`);
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
      console.log('[Lab Start] Missing or invalid authorization header');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Authorization header missing or invalid'
        })
      };
    }

    const sessionToken = authHeader.replace('Bearer /', '');
    console.log(`[Lab Start] Session token: ${sessionToken}`);

    // Check KV binding
    if (!VELOCITY_SESSIONS) {
      console.error('[Lab Start] VELOCITY_SESSIONS KV binding missing');
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
      console.log(`[Lab Start] Invalid session token: ${sessionToken}`);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Invalid session token'
        })
      };
    }
    console.log(`[Lab Start] Session data: ${JSON.stringify(sessionData)}`);

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { labId, config } = body;
    if (!labId) {
      console.log('[Lab Start] Missing labId in request body');
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
    if (!VELOCITY_LABS) {
      console.error('[Lab Start] VELOCITY_LABS KV binding missing');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Server configuration error'
        })
      };
    }

    const labSession = {
      labId,
      userEmail: sessionData.email,
      config: config || {},
      startedAt: new Date().toISOString(),
      status: 'running'
    };
    const labKey = `lab:${sessionToken}:${labId}:${Date.now()}`;
    console.log(`[Lab Start] Saving lab session: ${labKey}`);
    await VELOCITY_LABS.put(labKey, JSON.stringify(labSession));

    console.log(`[Lab Start] Lab started successfully for labId: ${labId}`);
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
    console.error(`[Lab Start] Error: ${error.message}`, error.stack);
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