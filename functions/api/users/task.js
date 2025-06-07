// functions/api/user/task.js

// Helper function to get user from session
async function getUserFromSession(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    
    const sessionToken = authHeader.substring(7);
    const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);
    
    if (!sessionData) {
        return null;
    }
    
    return JSON.parse(sessionData);
}

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // Get user from session
        const user = await getUserFromSession(request, env);
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const formData = await request.formData();
        const week = formData.get('week');
        const task = formData.get('task');
        const completed = formData.get('completed') === 'true';
        
        if (!week || !task) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Week and task are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get current progress
        const progressKey = `progress:${user.email}`;
        const progressData = await env.PROGRESS.get(progressKey);
        const progress = progressData ? JSON.parse(progressData) : {};
        
        // Update task status
        const taskKey = `week${week}-${task}`;
        progress[taskKey] = {
            completed: completed,
            updatedAt: new Date().toISOString()
        };
        
        // Save updated progress
        await env.PROGRESS.put(progressKey, JSON.stringify(progress));
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                task: taskKey,
                completed: completed
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Update task error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}