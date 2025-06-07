// functions/api/task/notes.js

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

// GET - Retrieve task notes
export async function onRequestGet(context) {
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
        
        const url = new URL(request.url);
        const week = url.searchParams.get('week');
        const task = url.searchParams.get('task');
        
        if (!week || !task) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Week and task parameters are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get user notes from KV
        const notesKey = `notes:${user.email}`;
        const notesData = await env.PROGRESS.get(notesKey);
        const allNotes = notesData ? JSON.parse(notesData) : {};
        
        const taskKey = `week${week}-${task}`;
        const notes = allNotes[taskKey] || '';
        
        return new Response(JSON.stringify({
            success: true,
            data: { notes }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get notes error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// POST - Save task notes
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
        const notes = formData.get('notes');
        
        if (!week || !task) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Week and task are required'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get current notes
        const notesKey = `notes:${user.email}`;
        const notesData = await env.PROGRESS.get(notesKey);
        const allNotes = notesData ? JSON.parse(notesData) : {};
        
        // Update notes for this task
        const taskKey = `week${week}-${task}`;
        allNotes[taskKey] = notes || '';
        allNotes[`${taskKey}_updatedAt`] = new Date().toISOString();
        
        // Save updated notes
        await env.PROGRESS.put(notesKey, JSON.stringify(allNotes));
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                task: taskKey,
                notes: notes
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Save notes error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}