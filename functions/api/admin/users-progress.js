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
            if (!session || session.role !== 'admin') {
                return new Response(JSON.stringify({ success: false, message: 'Admin access required' }), {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const userKeys = await env.VELOCITY_USERS.list();
            const users = [];

            for (const key of userKeys.keys) {
                if (key.name.startsWith('user:')) {
                    const userId = key.name.replace('user:', '');
                    const userData = await env.VELOCITY_USERS.get(key.name);
                    const progressData = await env.VELOCITY_PROGRESS.get(`progress:${userId}`);
                    const user = JSON.parse(userData);
                    const progress = progressData ? JSON.parse(progressData) : {};

                    const completedTasks = Object.values(progress).filter(t => t.completed).length;
                    const totalTasks = 42; // Matches index.html default

                    users.push({
                        name: user.name,
                        email: user.email,
                        completedTasks,
                        totalTasks,
                        lastActive: progress[Object.keys(progress)[Object.keys(progress).length - 1]]?.updatedAt || user.createdAt
                    });
                }
            }

            return new Response(JSON.stringify({ success: true, data: { users } }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Admin users progress error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};