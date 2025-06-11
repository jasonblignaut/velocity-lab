// /functions/api/lab/start.js
// Cloudflare Pages Function for starting new lab sessions
// Handles POST (start new lab session)

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('🚀 Starting new lab session...');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session and get user ID
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const sessionData = JSON.parse(sessionDataRaw);
        
        // Check if session is expired
        if (new Date() > new Date(sessionData.expiresAt)) {
            console.log('❌ Session expired');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired. Please log in again.'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('👤 Starting lab for user:', sessionData.email);
        
        // Get existing lab history
        const existingHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
        let labHistory = [];
        
        if (existingHistoryRaw) {
            try {
                labHistory = JSON.parse(existingHistoryRaw);
                if (!Array.isArray(labHistory)) {
                    labHistory = [];
                }
            } catch (parseError) {
                console.warn('⚠️ Failed to parse existing lab history:', parseError);
                labHistory = [];
            }
        }
        
        // Get current user progress to check if current lab is completed
        const currentProgressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
        let currentProgress = {};
        if (currentProgressRaw) {
            try {
                currentProgress = JSON.parse(currentProgressRaw);
            } catch (parseError) {
                console.warn('⚠️ Failed to parse current progress:', parseError);
                currentProgress = {};
            }
        }
        
        // Count completed tasks
        const completedTasks = Object.values(currentProgress).filter(task => task && task.completed).length;
        const totalTasks = 42;
        const isCurrentLabCompleted = completedTasks === totalTasks;
        
        console.log(`📊 Current progress: ${completedTasks}/${totalTasks} tasks completed`);
        
        // Find the current active lab (status = 'started')
        const currentActiveLab = labHistory.find(lab => lab.status === 'started');
        
        // If there's an active lab and it's completed, mark it as completed
        let previousLabCompleted = false;
        if (currentActiveLab && isCurrentLabCompleted) {
            console.log('✅ Marking current lab as completed');
            currentActiveLab.status = 'completed';
            currentActiveLab.completedAt = new Date().toISOString();
            currentActiveLab.tasksCompleted = completedTasks;
            currentActiveLab.totalTasks = totalTasks;
            previousLabCompleted = true;
        }
        
        // If there's still an active lab that's not completed, don't allow starting a new one
        const stillActiveLab = labHistory.find(lab => lab.status === 'started');
        if (stillActiveLab && !isCurrentLabCompleted) {
            console.log('⚠️ Active lab found that is not completed');
            return new Response(JSON.stringify({
                success: false,
                message: 'Please complete your current lab before starting a new one.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Create new lab session
        const today = new Date().toISOString().split('T')[0];
        const newLabSession = {
            session: labHistory.length + 1,
            date: today,
            status: 'started',
            labId: `LAB${String(labHistory.length + 1).padStart(3, '0')}`,
            startedAt: new Date().toISOString(),
            completedAt: null,
            tasksCompleted: 0,
            totalTasks: totalTasks
        };
        
        // Add new session to history
        labHistory.push(newLabSession);
        console.log('✅ Adding new lab session:', newLabSession.labId);
        
        // Reset user progress when starting new lab
        console.log('🔄 Resetting user progress for new lab...');
        await env.VELOCITY_PROGRESS.put(`progress:${sessionData.userId}`, JSON.stringify({}));
        
        // Save updated lab history
        await env.VELOCITY_LABS.put(
            `history:${sessionData.userId}`, 
            JSON.stringify(labHistory)
        );
        
        console.log('✅ Lab session started successfully in Cloudflare KV');
        
        return new Response(JSON.stringify({
            success: true,
            message: previousLabCompleted ? 'Previous lab completed! New lab started successfully!' : 'Lab session started successfully!',
            data: {
                session: newLabSession,
                totalSessions: labHistory.length,
                previousLabCompleted: previousLabCompleted,
                labId: newLabSession.labId
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
    } catch (error) {
        console.error('❌ Lab start error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to start lab session on server.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight requests
export async function onRequestOptions(context) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}