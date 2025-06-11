import { verifySession } from './utils.js';

export default {
    async fetch(request, env) {
        if (request.method !== 'POST') {
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
            const labSession = await request.json();

            if (!labSession || !labSession.labId) {
                return new Response(JSON.stringify({ success: false, message: 'Missing lab session data' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            let existingLabs = await env.VELOCITY_LABS.get(`labs:${userId}`);
            existingLabs = existingLabs ? JSON.parse(existingLabs) : [];

            const index = existingLabs.findIndex(l => l.labId === labSession.labId);
            if (index !== -1) {
                existingLabs[index] = { ...existingLabs[index], ...labSession, updatedAt: new Date().toISOString() };
            } else {
                existingLabs.push({ ...labSession, createdAt: new Date().toISOString() });
            }

            await env.VELOCITY_LABS.put(`labs:${userId}`, JSON.stringify(existingLabs));

            return new Response(JSON.stringify({ success: true, message: 'Lab progress updated' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Lab progress error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};