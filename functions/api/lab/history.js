// functions/api/lab/history.js

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
        
        // Get user's lab history
        const historyKey = `lab_history:${user.email}`;
        const historyData = await env.PROGRESS.get(historyKey);
        const history = historyData ? JSON.parse(historyData) : [];
        
        // If no history exists, create a sample entry
        if (history.length === 0) {
            const sampleLab = {
                id: `lab_${Date.now()}_sample`,
                startTime: new Date().toISOString(),
                status: 'Completed',
                environment: 'Exchange Hybrid Lab (Demo)',
                duration: '3 weeks',
                tasksCompleted: 0
            };
            
            history.push(sampleLab);
            await env.PROGRESS.put(historyKey, JSON.stringify(history));
        }
        
        // Enhance history with additional details
        const enhancedHistory = history.map(lab => ({
            ...lab,
            formattedDate: new Date(lab.startTime).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            statusIcon: lab.status === 'Active' ? '🟢' : lab.status === 'Completed' ? '✅' : '⏸️',
            environment: lab.environment || 'Exchange Hybrid Lab'
        }));
        
        return new Response(JSON.stringify({
            success: true,
            data: enhancedHistory
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Get lab history error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}