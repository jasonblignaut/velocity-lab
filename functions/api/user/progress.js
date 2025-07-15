// /functions/api/user/progress.js
// Cloudflare Pages Function for user progress management
// Handles GET (load progress) and POST (save progress)

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('📊 Loading user progress...');
        
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
        
        console.log('👤 Loading progress for user:', sessionData.email);
        
        // Get user progress from KV
        const progressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
        let progress = {};
        
        if (progressRaw) {
            progress = JSON.parse(progressRaw);
            console.log('✅ Progress loaded:', Object.keys(progress).length, 'tasks');
        } else {
            console.log('📝 No progress found, returning empty object');
        }
        
        return new Response(JSON.stringify({
            success: true,
            data: progress
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
        console.error('❌ Progress load error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to load progress.'
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
        console.log('💾 Saving user progress...');
        
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
        
        console.log('👤 Saving progress for user:', sessionData.email);
        
        // Parse request body
        const body = await request.json();
        const { taskId, progress: taskProgress } = body;
        
        if (!taskId || !taskProgress) {
            console.log('❌ Missing taskId or progress data');
            return new Response(JSON.stringify({
                success: false,
                message: 'Missing taskId or progress data.'
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
        
        // Get current progress
        const currentProgressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
        let currentProgress = {};
        
        if (currentProgressRaw) {
            currentProgress = JSON.parse(currentProgressRaw);
        }
        
        // Update task progress
        currentProgress[taskId] = {
            ...taskProgress,
            lastUpdated: new Date().toISOString()
        };
        
        // Save updated progress
        await env.VELOCITY_PROGRESS.put(`progress:${sessionData.userId}`, JSON.stringify(currentProgress));
        
        console.log('✅ Progress saved for task:', taskId);
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Progress saved successfully.'
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
        console.error('❌ Progress save error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to save progress.'
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