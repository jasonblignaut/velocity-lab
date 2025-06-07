// functions/api/lab/start.js

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
        
        // Generate a unique lab ID
        const labId = `lab_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
        const currentTime = new Date().toISOString();
        
        // Create lab session data
        const labSession = {
            id: labId,
            userId: user.userId,
            userEmail: user.email,
            userName: user.name,
            startTime: currentTime,
            status: 'Active',
            environment: 'Velocity Exchange Hybrid Lab',
            resources: {
                vms: [
                    { name: 'DC01', type: 'Domain Controller', status: 'Ready' },
                    { name: 'DC02', type: 'Secondary DC', status: 'Ready' },
                    { name: 'EX01', type: 'Exchange Server', status: 'Ready' },
                    { name: 'CLIENT01', type: 'Windows Client', status: 'Ready' }
                ],
                network: {
                    subnet: '192.168.1.0/24',
                    gateway: '192.168.1.1',
                    dns: ['192.168.1.10', '192.168.1.11']
                }
            },
            metadata: {
                createdAt: currentTime,
                lastAccessed: currentTime,
                totalTasks: 42,
                estimatedDuration: '4 weeks'
            }
        };
        
        // Store lab session in KV (using PROGRESS namespace for lab data)
        const labKey = `lab:${user.email}:${labId}`;
        await env.PROGRESS.put(labKey, JSON.stringify(labSession));
        
        // Update user's lab history
        const historyKey = `lab_history:${user.email}`;
        const historyData = await env.PROGRESS.get(historyKey);
        const history = historyData ? JSON.parse(historyData) : [];
        
        // Add new lab to history (keep last 10 labs)
        history.unshift({
            id: labId,
            startTime: currentTime,
            status: 'Active',
            environment: 'Exchange Hybrid Lab'
        });
        
        // Keep only the 10 most recent labs
        if (history.length > 10) {
            history.splice(10);
        }
        
        await env.PROGRESS.put(historyKey, JSON.stringify(history));
        
        // Return lab session info
        return new Response(JSON.stringify({
            success: true,
            data: {
                labId: labId,
                status: 'Active',
                environment: 'Velocity Exchange Hybrid Lab',
                startTime: currentTime,
                resources: labSession.resources,
                message: 'Lab environment started successfully! Your virtual machines are ready.',
                nextSteps: [
                    'Begin with Week 1: Foundation Setup',
                    'Start by installing Windows Server 2012 R2',
                    'Follow the task checklist for guided progress'
                ]
            }
        }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('Start lab error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to start lab environment. Please try again.'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}