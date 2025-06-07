// functions/api/user/progress.js

// Helper function to get user from session
async function getUserFromSession(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const sessionToken = authHeader.substring(7);
    const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);
    
    if (!sessionData) {
        return null;
    }
    
    return JSON.parse(sessionData);
}

export async function onRequestGet(context) {
    try {
        const { request, env } = context;
        
        // Get user from session
        const user = await getUserFromSession(request, env);
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get user progress from KV
        const progressKey = `progress:${user.email}`;
        const progressData = await env.PROGRESS.get(progressKey);
        
        const progress = progressData ? JSON.parse(progressData) : {};
        
        return new Response(JSON.stringify({
            success: true,
            data: progress
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get progress error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}