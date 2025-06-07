// functions/api/users/register.js
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const formData = await request.formData();
        
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        
        if (!name || !email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Name, email, and password are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (password.length < 8) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Password must be at least 8 characters long'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if user already exists
        const userKey = `user:${email}`;
        const existingUser = await env.USERS.get(userKey);
        
        if (existingUser) {
            return new Response(JSON.stringify({
                success: false,
                message: 'User with this email already exists'
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Check if this is the first user (make them admin)
        const userCountKey = 'meta:userCount';
        const userCountData = await env.USERS.get(userCountKey);
        const userCount = userCountData ? parseInt(userCountData) : 0;
        const isFirstUser = userCount === 0;
        
        // Create new user
        const userId = crypto.randomUUID();
        const newUser = {
            id: userId,
            name: name,
            email: email,
            password: password, // In production, hash this!
            role: isFirstUser ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
            lastLogin: null
        };
        
        // Store user in KV
        await env.USERS.put(userKey, JSON.stringify(newUser));
        
        // Update user count
        await env.USERS.put(userCountKey, (userCount + 1).toString());
        
        // Generate session token
        const sessionToken = crypto.randomUUID();
        const sessionData = {
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            createdAt: new Date().toISOString()
        };
        
        // Store session
        await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
            expirationTtl: 86400 // 24 hours
        });
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                sessionToken: sessionToken
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}