// /functions/api/users/logout.js
// Cloudflare Pages Function for user logout
// Cleans up session tokens from KV storage

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('🚪 Logout request received');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'No valid session found.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        console.log('🔍 Logging out session token:', sessionToken.substring(0, 10) + '...');
        
        // Get session from KV to find user ID
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        
        if (sessionDataRaw) {
            const sessionData = JSON.parse(sessionDataRaw);
            console.log('👤 Found session for user:', sessionData.email);
            
            // Delete both session records
            console.log('🗑️ Deleting session records from VELOCITY_SESSIONS KV...');
            await env.VELOCITY_SESSIONS.delete(`session:${sessionToken}`);
            await env.VELOCITY_SESSIONS.delete(`user_session:${sessionData.userId}`);
            
            console.log('✅ Session cleaned up successfully');
        } else {
            console.log('⚠️ Session not found in KV (might be already expired)');
        }
        
        // Always return success for logout (even if session wasn't found)
        // This prevents frontend errors when users try to logout expired sessions
        return new Response(JSON.stringify({
            success: true,
            message: 'Logged out successfully.'
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
        console.error('❌ Logout error:', error);
        
        // Even if there's an error, return success for logout
        // The frontend should be able to clear its state regardless
        return new Response(JSON.stringify({
            success: true,
            message: 'Logged out successfully.'
        }), {
            status: 200,
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