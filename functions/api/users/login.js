// functions/api/users/login.js
export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const formData = await request.formData();
        
        const email = formData.get('email');
        const password = formData.get('password');
        
        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email and password are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get user from KV
        const userKey = `user:${email}`;
        const userData = await env.USERS.get(userKey);
        
        if (!userData) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email or password'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const user = JSON.parse(userData);
        
        // Simple password check (in production, use proper hashing)
        if (user.password !== password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid email or password'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Generate session token
        const sessionToken = crypto.randomUUID();
        const sessionData = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: new Date().toISOString()
        };
        
        // Store session in KV (expires in 24 hours)
        await env.SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData), {
            expirationTtl: 86400 // 24 hours
        });
        
        // Update last login
        user.lastLogin = new Date().toISOString();
        await env.USERS.put(userKey, JSON.stringify(user));
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                sessionToken: sessionToken
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}