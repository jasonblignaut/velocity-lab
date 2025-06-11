// /functions/api/lab/start.js
// Cloudflare Pages Function for starting new lab sessions
// Handles POST (start new lab session)

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('🚀 Starting new lab session...');
        
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
        
        // Parse new lab session data from request body
        let newLabSession;
        try {
            newLabSession = await request.json();
        } catch (parseError) {
            console.log('❌ Failed to parse request body:', parseError);
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid lab session data format.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Starting lab for user:', sessionData.email);
        console.log('🔬 Lab session:', newLabSession.labId);
        
        // Get existing lab history
        const existingHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
        let labHistory = [];
        
        if (existingHistoryRaw) {
            try {
                labHistory = JSON.parse(existingHistoryRaw);
                if (!Array.isArray(labHistory)) {
                    labHistory = [];
                }
            } catch (parseError) {
                console.warn('⚠️ Failed to parse existing lab history:', parseError);
                labHistory = [];
            }
        }
        
        // Validate and normalize the new lab session
        const today = new Date().toISOString().split('T')[0];
        const normalizedSession = {
            session: newLabSession.session || (labHistory.length + 1),
            date: newLabSession.date || today,
            status: 'started', // Always 'started' for new labs
            labId: newLabSession.labId || `LAB${String(labHistory.length + 1).padStart(3, '0')}`,
            startedAt: newLabSession.startedAt || new Date().toISOString(),
            completedAt: null, // New labs are not completed yet
            tasksCompleted: 0, // Start with 0 tasks completed
            totalTasks: 42 // Standard total
        };
        
        // Check if there's already a session started today
        const todaySession = labHistory.find(session => 
            session.date === today && session.status === 'started'
        );
        
        if (todaySession) {
            console.log('⚠️ Lab session already started today, updating existing session');
            // Update existing session instead of creating a new one
            const sessionIndex = labHistory.findIndex(s => s.labId === todaySession.labId);
            if (sessionIndex !== -1) {
                labHistory[sessionIndex] = { ...todaySession, startedAt: new Date().toISOString() };
            }
        } else {
            // Add new session to history
            console.log('✅ Adding new lab session to history');
            labHistory.push(normalizedSession);
        }
        
        // Reset user progress when starting new lab (as per frontend logic)
        console.log('🔄 Resetting user progress for new lab...');
        await env.VELOCITY_PROGRESS.put(`progress:${sessionData.userId}`, JSON.stringify({}));
        
        // Save updated lab history
        await env.VELOCITY_LABS.put(
            `history:${sessionData.userId}`, 
            JSON.stringify(labHistory)
        );
        
        console.log('✅ Lab session started successfully in Cloudflare KV');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Lab session started successfully!',
            data: {
                session: normalizedSession,
                totalSessions: labHistory.length
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
    } catch (error) {
        console.error('❌ Lab start error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to start lab session on server.'
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}