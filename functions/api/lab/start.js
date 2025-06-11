// /functions/api/lab/start.js
// Cloudflare Pages Function for starting new lab sessions
// Handles lab creation and completion detection

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        console.log('🚀 Lab start request received');
        
        // Get Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('❌ Missing or invalid Authorization header');
            return new Response(JSON.stringify({
                success: false,
                message: 'Authentication required.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session with KV
        const sessionDataRaw = await env.VELOCITY_SESSIONS.get(`session:${sessionToken}`);
        if (!sessionDataRaw) {
            console.log('❌ Invalid session token');
            return new Response(JSON.stringify({
                success: false,
                message: 'Session expired or invalid.'
            }), {
                status: 401,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
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
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        console.log('👤 Lab start request from user:', sessionData.email);
        
        // Get current lab history
        const labHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
        let labHistory = [];
        let previousLabCompleted = false;
        
        if (labHistoryRaw) {
            labHistory = JSON.parse(labHistoryRaw);
            console.log('📊 Current lab history:', labHistory.length, 'sessions');
        }
        
        // Check for active (in-progress) lab
        const activeLab = labHistory.find(lab => lab.status === 'started');
        
        if (activeLab) {
            // Check if the active lab should be completed first
            // Get user's current progress
            const progressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
            let completedTasks = 0;
            
            if (progressRaw) {
                const progress = JSON.parse(progressRaw);
                completedTasks = Object.values(progress).filter(task => task && task.completed).length;
            }
            
            const totalTasks = 42;
            const isLabCompleted = completedTasks === totalTasks;
            
            if (isLabCompleted) {
                // Mark current lab as completed
                console.log('🎉 Marking current lab as completed');
                activeLab.status = 'completed';
                activeLab.completedAt = new Date().toISOString();
                activeLab.tasksCompleted = completedTasks;
                activeLab.totalTasks = totalTasks;
                previousLabCompleted = true;
                
                // Save updated history
                await env.VELOCITY_LABS.put(`history:${sessionData.userId}`, JSON.stringify(labHistory));
            } else {
                // Active lab exists and not completed - don't allow new lab
                console.log('⚠️ Active lab exists and not completed');
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Please complete your current lab before starting a new one.',
                    data: {
                        currentLab: activeLab,
                        completedTasks: completedTasks,
                        totalTasks: totalTasks,
                        progressPercentage: Math.round((completedTasks / totalTasks) * 100)
                    }
                }), {
                    status: 400,
                    headers: { 
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                    }
                });
            }
        }
        
        // Create new lab session
        const today = new Date().toISOString().split('T')[0];
        const newSessionNumber = labHistory.length + 1;
        const newLabId = `LAB${String(newSessionNumber).padStart(3, '0')}`;
        
        const newLab = {
            session: newSessionNumber,
            date: today,
            status: 'started',
            labId: newLabId,
            startedAt: new Date().toISOString(),
            completedAt: null,
            tasksCompleted: 0,
            totalTasks: 42
        };
        
        // Add new lab to history
        labHistory.push(newLab);
        
        // Reset user progress for new lab
        console.log('🔄 Resetting user progress for new lab');
        await env.VELOCITY_PROGRESS.put(`progress:${sessionData.userId}`, JSON.stringify({}));
        
        // Save updated lab history
        console.log('💾 Saving new lab session to VELOCITY_LABS KV...');
        await env.VELOCITY_LABS.put(`history:${sessionData.userId}`, JSON.stringify(labHistory));
        
        console.log('✅ New lab started successfully:', newLabId);
        
        return new Response(JSON.stringify({
            success: true,
            message: previousLabCompleted ? 'Previous lab completed! New lab started.' : 'New lab started successfully!',
            data: {
                labId: newLabId,
                sessionNumber: newSessionNumber,
                startedAt: newLab.startedAt,
                previousLabCompleted: previousLabCompleted,
                totalSessions: labHistory.length
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
            message: 'Failed to start lab. Please try again.'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
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