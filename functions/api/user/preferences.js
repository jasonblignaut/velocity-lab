// /functions/api/users/preferences.js
// Cloudflare Pages Function for user preferences (correct path for frontend)
// Handles GET (load preferences) and POST (save preferences)

// Load user preferences (GET)
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('⚙️ Loading user preferences from Cloudflare KV...');
        
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
        
        console.log('👤 Loading preferences for user:', sessionData.email);
        
        // Get user data from KV (preferences are stored with user data)
        const userDataRaw = await env.VELOCITY_USERS.get(`user:${sessionData.email}`);
        if (!userDataRaw) {
            console.log('❌ User not found');
            return new Response(JSON.stringify({
                success: false,
                message: 'User account not found.'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const userData = JSON.parse(userDataRaw);
        
        // Get preferences or set defaults
        const preferences = userData.preferences || {
            theme: 'dark'
        };
        
        console.log('✅ Preferences loaded from Cloudflare KV:', preferences);
        
        return new Response(JSON.stringify({
            success: true,
            data: preferences
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
        console.error('❌ Preferences load error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to load preferences from server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Save user preferences (POST)
export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('💾 Saving user preferences to Cloudflare KV...');
        
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
        
        // Parse preferences data from request body
        let newPreferences;
        try {
            newPreferences = await request.json();
        } catch (parseError) {
            console.log('❌ Failed to parse request body:', parseError);
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid preferences data format.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Saving preferences for user:', sessionData.email);
        console.log('⚙️ New preferences:', newPreferences);
        
        // Get existing user data
        const userDataRaw = await env.VELOCITY_USERS.get(`user:${sessionData.email}`);
        if (!userDataRaw) {
            console.log('❌ User not found');
            return new Response(JSON.stringify({
                success: false,
                message: 'User account not found.'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const userData = JSON.parse(userDataRaw);
        
        // Validate and merge preferences
        const validatedPreferences = {
            theme: newPreferences.theme === 'light' ? 'light' : 'dark', // Only allow 'light' or 'dark'
            // Add more preference validations here as needed
            ...userData.preferences, // Keep existing preferences
            ...newPreferences // Override with new preferences
        };
        
        // Update user data with new preferences
        userData.preferences = validatedPreferences;
        userData.lastActive = new Date().toISOString();
        
        // Save updated user data to KV
        await env.VELOCITY_USERS.put(`user:${sessionData.email}`, JSON.stringify(userData));
        
        console.log('✅ Preferences saved successfully to Cloudflare KV');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Preferences saved successfully.',
            data: validatedPreferences
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
        console.error('❌ Preferences save error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to save preferences to server.'
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