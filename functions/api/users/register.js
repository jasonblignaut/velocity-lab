import { hashPassword, generateToken } from './utils.js';

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
            const name = formData.get('name');
            const email = formData.get('email')?.toLowerCase();
            const password = formData.get('password');

            if (!name || !email || !password) {
                return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            if (password.length < 8) {
                return new Response(JSON.stringify({ success: false, message: 'Password must be at least 8 characters' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const existingUser = await env.VELOCITY_USERS.get(`user:${email}`);
            if (existingUser) {
                return new Response(JSON.stringify({ success: false, message: 'Email already registered' }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const hashedPassword = await hashPassword(password);
            const user = {
                name,
                email,
                password: hashedPassword,
                role: email.includes('admin') ? 'admin' : 'user', // Simple admin detection
                createdAt: new Date().toISOString()
            };

            await env.VELOCITY_USERS.put(`user:${email}`, JSON.stringify(user));

            const sessionToken = generateToken();
            const sessionData = {
                userId: email,
                token: sessionToken,
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };

            await env.VELOCITY_SESSIONS.put(`session:${sessionToken}`, JSON.stringify(sessionData));
            await env.VELOCITY_SESSIONS.put(`user:${email}:session`, sessionToken);

            return new Response(JSON.stringify({
                success: true,
                data: {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    sessionToken
                }
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Register error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};