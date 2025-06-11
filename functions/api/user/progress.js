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
                const progressData = await env.VELOCITY_PROGRESS.get(`progress:${userId}`);
                const progress = progressData ? JSON.parse(progressData) : {};

                return new Response(JSON.stringify({ success: true, data: progress }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            } else if (request.method === 'POST') {
                const { taskId, progress } = await request.json();
                if (!taskId || !progress) {
                    return new Response(JSON.stringify({ success: false, message: 'Missing taskId or progress data' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                let existingProgress = await env.VELOCITY_PROGRESS.get(`progress:${userId}`);
                existingProgress = existingProgress ? JSON.parse(existingProgress) : {};
                existingProgress[taskId] = {
                    ...progress,
                    updatedAt: new Date().toISOString()
                };

                await env.VELOCITY_PROGRESS.put(`progress:${userId}`, JSON.stringify(existingProgress));

                return new Response(JSON.stringify({ success: true, message: 'Progress updated' }), {
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
            console.error('Progress error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};