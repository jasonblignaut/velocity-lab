// /functions/api/admin/users-progress.js
// Cloudflare Pages Function for admin users progress
// Handles GET (load all users progress data) - REAL ADMIN ONLY

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('👑 Loading admin users progress...');
        
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
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        const sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
        
        // Validate session with KV (NO DEMO MODE)
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
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        // Check if user is admin - STRICT CHECK
        if (sessionData.role !== 'admin') {
            console.log('❌ Non-admin user attempted to access admin panel:', sessionData.email, 'Role:', sessionData.role);
            return new Response(JSON.stringify({
                success: false,
                message: 'Admin access required.'
            }), {
                status: 403,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
        console.log('👤 Admin access granted for:', sessionData.email);
        
        // 🔥 NEW: Get ALL users from KV store
        try {
            console.log('🔍 Enumerating all users from VELOCITY_USERS KV...');
            
            // Use KV list to get all user keys
            const usersList = await env.VELOCITY_USERS.list({ prefix: 'user:' });
            console.log('📊 Found', usersList.keys.length, 'users in KV store');
            
            const allUsers = [];
            
            // Process each user
            for (const userKey of usersList.keys) {
                try {
                    // Get user data
                    const userDataRaw = await env.VELOCITY_USERS.get(userKey.name);
                    if (!userDataRaw) continue;
                    
                    const userData = JSON.parse(userDataRaw);
                    console.log('👤 Processing user:', userData.name, '(' + userData.email + ')');
                    
                    // Get user progress
                    let completedTasks = 0;
                    let hasNotes = false;
                    let progressPercentage = 0;
                    
                    try {
                        const progressRaw = await env.VELOCITY_PROGRESS.get(`progress:${userData.id}`);
                        if (progressRaw) {
                            const progress = JSON.parse(progressRaw);
                            completedTasks = Object.values(progress).filter(task => task && task.completed).length;
                            progressPercentage = Math.round((completedTasks / 42) * 100);
                            
                            // Check if user has notes
                            hasNotes = Object.values(progress).some(task => 
                                task && task.notes && task.notes.trim().length > 0
                            );
                        }
                    } catch (progressError) {
                        console.warn('Failed to load progress for user:', userData.email, progressError);
                    }
                    
                    // Get lab history
                    let completedLabs = 0;
                    try {
                        const labHistoryRaw = await env.VELOCITY_LABS.get(`history:${userData.id}`);
                        if (labHistoryRaw) {
                            const labHistory = JSON.parse(labHistoryRaw);
                            completedLabs = labHistory.filter(lab => lab.status === 'completed').length;
                        }
                    } catch (labError) {
                        console.warn('Failed to load lab history for user:', userData.email, labError);
                    }
                    
                    // Add user to results
                    allUsers.push({
                        name: userData.name,
                        email: userData.email,
                        role: userData.role,
                        completedTasks: completedTasks,
                        progressPercentage: progressPercentage,
                        completedLabs: completedLabs,
                        hasNotes: hasNotes,
                        lastActive: userData.lastActive || userData.createdAt || new Date().toISOString()
                    });
                    
                } catch (userError) {
                    console.warn('Failed to process user:', userKey.name, userError);
                    continue;
                }
            }
            
            // Sort by progress (highest first)
            allUsers.sort((a, b) => {
                if (a.completedTasks !== b.completedTasks) {
                    return b.completedTasks - a.completedTasks; // More completed tasks first
                }
                return b.progressPercentage - a.progressPercentage; // Higher percentage first
            });
            
            console.log('✅ Admin data compiled successfully for', allUsers.length, 'users');
            console.log('📊 User breakdown:', allUsers.map(u => `${u.name} (${u.completedTasks}/42 tasks)`));
            
            return new Response(JSON.stringify({
                success: true,
                data: allUsers
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
            
        } catch (dataError) {
            console.error('❌ Error compiling admin data:', dataError);
            return new Response(JSON.stringify({
                success: false,
                message: 'Failed to compile user data.'
            }), {
                status: 500,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Admin users progress error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to load admin data from server.'
        }), {
            status: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}