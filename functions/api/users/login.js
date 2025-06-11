import { generateToken, hashPassword, verifyPassword } from './utils.js';

export default {
    async fetch(request, env) {
        if (request.method !== 'POST') {
            return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const formData = await request.formData();
            const email = formData.get('email')?.toLowerCase();
            const password = formData.get('password');
            const rememberMe = formData.get('remember') === 'on';

            if (!email || !password) {
                return new Response(JSON.stringify({ success: false, message: 'Missing email or password' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const userData = await env.VELOCITY_USERS.get(`user:${email}`);
            if (!userData) {
                return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const user = JSON.parse(userData);
            const isValid = await verifyPassword(password, user.password);
            if (!isValid) {
                return new Response(JSON.stringify({ success: false, message: 'Invalid credentials' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const sessionToken = generateToken();
            const sessionData = {
                userId: email,
                token: sessionToken,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000).toISOString()
            };

            await env.VELOCITY_SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData));
            await env.VELOCITY_SESSIONS.put(`user:${email}:session`, sessionToken);

            return new Response(JSON.stringify({
                success: true,
                data: {
                    name: user.name,
                    email: user.email,
                    role: user.role || 'user',
                    sessionToken
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Login error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};