// functions/api/users/logout.js
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const sessionToken = authHeader.substring(7);
            
            // Delete session from KV
            await env.SESSIONS.delete(`session:${sessionToken}`);
        }
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Logged out successfully'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}