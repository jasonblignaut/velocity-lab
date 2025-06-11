// /functions/api/user/lab-history.js
// Cloudflare Pages Function for user lab history management
// Handles GET (load lab history) and POST (save lab history)

// Load user lab history (GET)
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('🔬 Loading user lab history from Cloudflare KV...');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session and get user ID
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionData = JSON.parse(sessionDataRaw);
        
        // Check if session is expired
        if (new Date() > new Date(sessionData.expiresAt)) {
            console.log('❌ Session expired');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired. Please log in again.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Loading lab history for user:', sessionData.email);
        
        // Get user lab history from KV
        const labHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
        let labHistory = [];
        
        if (labHistoryRaw) {
            try {
                labHistory = JSON.parse(labHistoryRaw);
                console.log('✅ Lab history loaded from Cloudflare KV - Sessions:', labHistory.length);
                
                // Ensure it's an array
                if (!Array.isArray(labHistory)) {
                    console.warn('⚠️ Lab history is not an array, resetting to empty array');
                    labHistory = [];
                }
            } catch (parseError) {
                console.warn('⚠️ Failed to parse lab history data, starting fresh:', parseError);
                labHistory = [];
            }
        } else {
            console.log('🆕 No existing lab history found, will return empty array');
        }
        
        return new Response(JSON.stringify({
            success: true,
            data: labHistory
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
    } catch (error) {
        console.error('❌ Lab history load error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to load lab history from server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Save user lab history (POST)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('💾 Saving user lab history to Cloudflare KV...');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session and get user ID
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionData = JSON.parse(sessionDataRaw);
        
        // Check if session is expired
        if (new Date() > new Date(sessionData.expiresAt)) {
            console.log('❌ Session expired');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired. Please log in again.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Parse lab history data from request body
        let labHistoryData;
        try {
            labHistoryData = await request.json();
            
            // Ensure it's an array
            if (!Array.isArray(labHistoryData)) {
                console.log('❌ Lab history data is not an array');
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Lab history must be an array.'
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
            
        } catch (parseError) {
            console.log('❌ Failed to parse request body:', parseError);
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid lab history data format.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Saving lab history for user:', sessionData.email);
        console.log('🔬 Lab sessions to save:', labHistoryData.length);
        
        // Validate and normalize lab history entries
        const validatedHistory = labHistoryData.map((session, index) => {
            // Ensure required fields exist with defaults
            return {
                session: session.session || (index + 1),
                date: session.date || new Date().toISOString().split('T')[0],
                status: session.status || 'started',
                labId: session.labId || `LAB${String(index + 1).padStart(3, '0')}`,
                startedAt: session.startedAt || new Date().toISOString(),
                completedAt: session.completedAt || null,
                tasksCompleted: session.tasksCompleted || 0,
                totalTasks: session.totalTasks || 42
            };
        });
        
        // Sort by session number to maintain order
        validatedHistory.sort((a, b) => a.session - b.session);
        
        // Save lab history to KV
        await env.VELOCITY_LABS.put(
            `history:${sessionData.userId}`, 
            JSON.stringify(validatedHistory)
        );
        
        console.log('✅ Lab history saved successfully to Cloudflare KV');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Lab history saved successfully.',
            data: validatedHistory
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
    } catch (error) {
        console.error('❌ Lab history save error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to save lab history to server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}