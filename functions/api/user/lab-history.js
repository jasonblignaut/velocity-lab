import { verifySession } from './utils.js';

export default {
    async fetch(request, env) {
        if (request.method !== 'GET') {
            return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        try {
            const session = await verifySession(request, env);
            if (!session) {
                return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const userId = session.userId;
            const labData = await env.VELOCITY_LABS.get(`labs:${userId}`);
            const labHistory = labData ? JSON.parse(labData) : [];

            return new Response(JSON.stringify({ success: true, data: labHistory }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Lab history error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};