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
            let existingLabs = await env.VELOCITY_LABS.get(`labs:${userId}`);
            existingLabs = existingLabs ? JSON.parse(existingLabs) : [];

            const today = new Date().toISOString().split('T')[0];
            const existingToday = existingLabs.find(l => l.date === today && l.status === 'started');

            if (existingToday) {
                return new Response(JSON.stringify({
                    success: true,
                    data: { labId: existingToday.labId, previousLabCompleted: false }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            let previousLabCompleted = true;
            if (existingLabs.length > 0) {
                const lastLab = existingLabs[existingLabs.length - 1];
                const progressData = await env.VELOCITY_PROGRESS.get(`progress:${userId}`);
                const progress = progressData ? JSON.parse(progressData) : {};
                const totalTasks = 42; // Matches index.html default
                const completedTasks = Object.values(progress).filter(t => t.completed).length;
                previousLabCompleted = completedTasks >= totalTasks;
                if (previousLabCompleted && lastLab.status === 'started') {
                    lastLab.status = 'completed';
                    lastLab.completedAt = new Date().toISOString();
                    lastLab.tasksCompleted = completedTasks;
                    lastLab.totalTasks = totalTasks;
                    await env.VELOCITY_LABS.put(`labs:${userId}`, JSON.stringify(existingLabs));
                }
            }

            const newLab = {
                session: existingLabs.length + 1,
                date: today,
                status: 'started',
                labId: `LAB${String(existingLabs.length + 1).padStart(3, '0')}`,
                startedAt: new Date().toISOString(),
                tasksCompleted: 0,
                totalTasks: 42
            };

            existingLabs.push(newLab);
            await env.VELOCITY_LABS.put(`labs:${userId}`, JSON.stringify(existingLabs));

            // Reset progress for new lab
            await env.VELOCITY_PROGRESS.delete(`progress:${userId}`);

            return new Response(JSON.stringify({
                success: true,
                data: { labId: newLab.labId, previousLabCompleted }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (error) {
            console.error('Lab start error:', error);
            return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};