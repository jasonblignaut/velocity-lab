// /functions/api/user/lab-history.js
// Cloudflare Pages Function for user lab history management
// Handles GET (load history) and POST (save history)

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('📊 Loading user lab history...');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session with KV
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        console.log('👤 Loading lab history for user:', sessionData.email);
        
        // Get user lab history from KV
        const labHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
        let labHistory = [];
        
        if (labHistoryRaw) {
            labHistory = JSON.parse(labHistoryRaw);
            console.log('✅ Lab history loaded:', labHistory.length, 'sessions');
        } else {
            console.log('📝 No lab history found, creating default lab');
            
            // Create default lab for new users
            const today = new Date().toISOString().split('T')[0];
            const defaultLab = {
                session: 1,
                date: today,
                status: 'started',
                labId: 'LAB001',
                startedAt: new Date().toISOString(),
                completedAt: null,
                tasksCompleted: 0,
                totalTasks: 43
            };
            
            labHistory = [defaultLab];
            
            // Save default lab
            await env.VELOCITY_LABS.put(`history:${sessionData.userId}`, JSON.stringify(labHistory));
            console.log('✅ Default lab created and saved');
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
            message: 'Failed to load lab history.'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('💾 Saving user lab history...');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session with KV
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        console.log('👤 Saving lab history for user:', sessionData.email);
        
        // Parse request body
        const body = await request.json();
        
        if (!Array.isArray(body)) {
            console.log('❌ Invalid lab history data - expected array');
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid lab history data.'
            }), {
                status: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        // Save lab history
        await env.VELOCITY_LABS.put(`history:${sessionData.userId}`, JSON.stringify(body));
        
        console.log('✅ Lab history saved:', body.length, 'sessions');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Lab history saved successfully.'
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
            message: 'Failed to save lab history.'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
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
