import { verifySession } from './utils.js';

export default {
    async fetch(request, env) {
        try {
            const session = await verifySession(request, env);
            if (!session) {
                return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const userId = session.userId;

            if (request.method === 'GET') {
                const userData = await env.VELOCITY_USERS.get(`user:${userId}`);
                const user = userData ? JSON.parse(userData) : {};
                return new Response(JSON.stringify({ success: true, data: { theme: user.theme || 'dark' } }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'POST') {
                const { theme } = await request.json();
                if (!theme) {
                    return new Response(JSON.stringify({ success: false, message: 'Missing theme' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                let userData = await env.VELOCITY_USERS.get(`user:${userId}`);
                if (!userData) {
                    return new Response(JSON.stringify({ success: false, message: 'User not found' }), {
                        status: 404,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                const user = JSON.parse(userData);
                user.theme = theme;
                await env.VELOCITY_USERS.put(`user:${userId}`, JSON.stringify(user));

                return new Response(JSON.stringify({ success: true, message: 'Preferences updated' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else {
                return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
                    status: 405,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            console.error('Preferences error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};