// /functions/api/users/register.js
// Cloudflare Pages Function for user registration
// Uses KV storage with plain text passwords (no bcrypt/Node.js dependencies)

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('📝 Registration request received');
        
        // Parse FormData from frontend
        const formData = await request.formData();
        const name = formData.get('name')?.toString().trim();
        const email = formData.get('email')?.toString().trim().toLowerCase();
        const password = formData.get('password')?.toString();
        
        console.log('📋 Registration data:', { name, email, passwordLength: password?.length });
        
        // Validation
        if (!name || !email || !password) {
            console.log('❌ Missing required fields');
            return new Response(JSON.stringify({
                success: false,
                message: 'Please fill in all required fields.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (password.length < 8) {
            console.log('❌ Password too short');
            return new Response(JSON.stringify({
                success: false,
                message: 'Password must be at least 8 characters long.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format');
            return new Response(JSON.stringify({
                success: false,
                message: 'Please enter a valid email address.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if user already exists
        console.log('🔍 Checking if user exists...');
        const existingUser = await env.VELOCITY_USERS.get(`user:${email}`);
        if (existingUser) {
            console.log('❌ User already exists');
            return new Response(JSON.stringify({
                success: false,
                message: 'An account with this email already exists.'
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate unique user ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 Generated user ID:', userId);
        
        // Create user object
        const userData = {
            id: userId,
            email: email,
            name: name,
            password: password, // Plain text storage as requested
            role: 'user', // New users are regular users, not admins
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            preferences: {
                theme: 'dark'
            }
        };
        
        // Generate session token
        const sessionToken = generateSessionToken();
        const sessionExpiry = new Date();
        sessionExpiry.setDate(sessionExpiry.getDate() + 30); // 30 days
        
        const sessionData = {
            userId: userId,
            email: email,
            token: sessionToken,
            createdAt: new Date().toISOString(),
            expiresAt: sessionExpiry.toISOString(),
            rememberMe: true
        };
        
        // Store user in KV
        console.log('💾 Storing user in VELOCITY_USERS KV...');
        await env.VELOCITY_USERS.put(`user:${email}`, JSON.stringify(userData));
        await env.VELOCITY_USERS.put(`userid:${userId}`, email); // Reverse lookup
        
        // Store session in KV
        console.log('💾 Storing session in VELOCITY_SESSIONS KV...');
        await env.VELOCITY_SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData));
        await env.VELOCITY_SESSIONS.put(`user_session:${userId}`, sessionToken); // User to session lookup
        
        // Initialize empty progress and lab history
        console.log('💾 Initializing user progress and lab history...');
        await env.VELOCITY_PROGRESS.put(`progress:${userId}`, JSON.stringify({}));
        await env.VELOCITY_LABS.put(`history:${userId}`, JSON.stringify([]));
        
        console.log('✅ User registration completed successfully');
        
        // Return success response with user data and session token
        return new Response(JSON.stringify({
            success: true,
            message: 'Account created successfully!',
            data: {
                id: userId,
                name: userData.name,
                email: userData.email,
                role: userData.role,
                sessionToken: sessionToken
            }
        }), {
            status: 201,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Registration failed. Please try again.'
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
            'Access-Control-Allow-Headers': 'Content-Type'
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