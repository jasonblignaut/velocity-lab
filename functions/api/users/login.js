// /functions/api/users/login.js
// Cloudflare Pages Function for user login
// Uses KV storage with plain text password comparison

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('🔐 Login request received');
        
        // Parse FormData from frontend
        const formData = await request.formData();
        const email = formData.get('email')?.toString().trim().toLowerCase();
        const password = formData.get('password')?.toString();
        const rememberMe = formData.get('remember') === 'on' || formData.get('remember') === 'true';
        
        console.log('📋 Login data:', { email, passwordLength: password?.length, rememberMe });
        
        // Validation
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return new Response(JSON.stringify({
                success: false,
                message: 'Please fill in all required fields.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get user from KV storage
        console.log('🔍 Looking up user in VELOCITY_USERS KV...');
        const userDataRaw = await env.VELOCITY_USERS.get(`user:${email}`);
        
        if (!userDataRaw) {
            console.log('❌ User not found');
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email or password.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const userData = JSON.parse(userDataRaw);
        console.log('👤 User found:', userData.name, '- Role:', userData.role);
        
        // Verify password (plain text comparison)
        if (userData.password !== password) {
            console.log('❌ Password mismatch');
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email or password.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('✅ Password verified');
        
        // Check if user already has an active session and invalidate it
        const existingSessionToken = await env.VELOCITY_SESSIONS.get(`user_session:${userData.id}`);
        if (existingSessionToken) {
            console.log('🗑️ Invalidating existing session');
            await env.VELOCITY_SESSIONS.delete(`session:${existingSessionToken}`);
        }
        
        // Generate new session token
        const sessionToken = generateSessionToken();
        const sessionExpiry = new Date();
        
        // Set expiry based on remember me option
        if (rememberMe) {
            sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days
        } else {
            sessionExpiry.setHours(sessionExpiry.getHours() + 24); // 24 hours
        }
        
        const sessionData = {
            userId: userData.id,
            email: userData.email,
            token: sessionToken,
            createdAt: new Date().toISOString(),
            expiresAt: sessionExpiry.toISOString(),
            rememberMe: rememberMe
        };
        
        // Update user's last active timestamp
        userData.lastActive = new Date().toISOString();
        
        // Store updated user data and new session
        console.log('💾 Storing session in VELOCITY_SESSIONS KV...');
        await env.VELOCITY_SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData));
        await env.VELOCITY_SESSIONS.put(`user_session:${userData.id}`, sessionToken);
        
        console.log('💾 Updating user last active in VELOCITY_USERS KV...');
        await env.VELOCITY_USERS.put(`user:${email}`, JSON.stringify(userData));
        
        console.log('✅ Login completed successfully');
        
        // Return success response with user data and session token
        return new Response(JSON.stringify({
            success: true,
            message: 'Login successful!',
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                sessionToken: sessionToken,
                lastActive: userData.lastActive
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
        console.error('❌ Login error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Login failed. Please try again.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle session validation (for existing sessions)
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('🔍 Session validation request');
        
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
        
        // Get session from KV
        console.log('🔍 Looking up session in VELOCITY_SESSIONS KV...');
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        
        if (!sessionDataRaw) {
            console.log('❌ Session not found');
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
            // Clean up expired session
            await env.VELOCITY_SESSIONS.delete(`session:${sessionToken}`);
            await env.VELOCITY_SESSIONS.delete(`user_session:${sessionData.userId}`);
            
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired. Please log in again.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get user data
        console.log('👤 Session valid, getting user data...');
        const userDataRaw = await env.VELOCITY_USERS.get(`user:${sessionData.email}`);
        
        if (!userDataRaw) {
            console.log('❌ User not found for valid session');
            return new Response(JSON.stringify({
                success: false,
                message: 'User account not found.'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const userData = JSON.parse(userDataRaw);
        
        // Update last active
        userData.lastActive = new Date().toISOString();
        await env.VELOCITY_USERS.put(`user:${sessionData.email}`, JSON.stringify(userData));
        
        console.log('✅ Session validation successful');
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                sessionToken: sessionToken,
                lastActive: userData.lastActive
            }
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
        console.error('❌ Session validation error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Session validation failed.'
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

// Utility function to generate session tokens
function generateSessionToken() {
    // Generate a secure random token using Web Crypto API (available in Cloudflare Workers)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}