// /functions/api/user/progress.js
// Cloudflare Pages Function for user progress management
// Handles GET (load progress) and POST (save progress)

// Load user progress (GET)
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('📊 Loading user progress from Cloudflare KV...');
        
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
        
        console.log('👤 Loading progress for user:', sessionData.email);
        
        // Get user progress from KV
        const progressDataRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
        let progressData = {};
        
        if (progressDataRaw) {
            try {
                progressData = JSON.parse(progressDataRaw);
                console.log('✅ Progress loaded from Cloudflare KV - Tasks:', Object.keys(progressData).length);
            } catch (parseError) {
                console.warn('⚠️ Failed to parse progress data, starting fresh:', parseError);
                progressData = {};
            }
        } else {
            console.log('🆕 No existing progress found, starting fresh');
        }
        
        return new Response(JSON.stringify({
            success: true,
            data: progressData
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
            message: 'Failed to load progress from server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Save user progress (POST)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('💾 Saving user progress to Cloudflare KV...');
        
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
        
        // Parse progress data from request body
        let progressData;
        try {
            const requestBody = await request.json();
            
            // Handle both full progress object and individual task updates
            if (requestBody.taskId && requestBody.progress) {
                // Individual task update
                console.log('🔄 Updating individual task:', requestBody.taskId);
                
                // Get existing progress
                const existingProgressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
                let existingProgress = {};
                
                if (existingProgressRaw) {
                    try {
                        existingProgress = JSON.parse(existingProgressRaw);
                    } catch (parseError) {
                        console.warn('⚠️ Failed to parse existing progress:', parseError);
                    }
                }
                
                // Update specific task
                existingProgress[requestBody.taskId] = requestBody.progress;
                progressData = existingProgress;
            } else {
                // Full progress update
                console.log('🔄 Updating full progress object');
                progressData = requestBody;
            }
        } catch (parseError) {
            console.log('❌ Failed to parse request body:', parseError);
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid progress data format.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Saving progress for user:', sessionData.email);
        console.log('📊 Progress tasks:', Object.keys(progressData).length);
        
        // Save progress to KV
        await env.VELOCITY_PROGRESS.put(
            `progress:${sessionData.userId}`, 
            JSON.stringify(progressData)
        );
        
        console.log('✅ Progress saved successfully to Cloudflare KV');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Progress saved successfully.',
            data: progressData
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
            message: 'Failed to save progress to server.'
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