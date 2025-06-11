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
        
        // Get all user data from KV stores
        try {
            // Start with the current admin user
            const adminUser = {
                name: sessionData.name,
                email: sessionData.email,
                role: sessionData.role,
                completedTasks: 0,
                progressPercentage: 0,
                completedLabs: 0,
                hasNotes: false,
                lastActive: new Date().toISOString()
            };
            
            // Try to get actual admin user progress
            try {
                const adminProgressRaw = await env.VELOCITY_PROGRESS.get(`progress:${sessionData.userId}`);
                const adminLabHistoryRaw = await env.VELOCITY_LABS.get(`history:${sessionData.userId}`);
                
                if (adminProgressRaw) {
                    const adminProgress = JSON.parse(adminProgressRaw);
                    const completedTasks = Object.values(adminProgress).filter(task => task && task.completed).length;
                    const progressPercentage = Math.round((completedTasks / 42) * 100);
                    
                    let completedLabs = 0;
                    let hasNotes = false;
                    
                    if (adminLabHistoryRaw) {
                        const labHistory = JSON.parse(adminLabHistoryRaw);
                        completedLabs = labHistory.filter(lab => lab.status === 'completed').length;
                    }
                    
                    // Check if admin has notes
                    hasNotes = Object.values(adminProgress).some(task => task && task.notes && task.notes.trim().length > 0);
                    
                    // Update admin user data
                    adminUser.completedTasks = completedTasks;
                    adminUser.progressPercentage = progressPercentage;
                    adminUser.completedLabs = completedLabs;
                    adminUser.hasNotes = hasNotes;
                }
            } catch (progressError) {
                console.warn('Failed to load admin progress:', progressError);
            }
            
            // In a real implementation, you would:
            // 1. Maintain a user registry in KV
            // 2. Or iterate through all user sessions
            // 3. Or use a separate database for user management
            
            // For now, we'll return just the admin user with sample data
            // You should implement proper user enumeration based on your needs
            const allUsers = [
                adminUser,
                // Add other real users here when you implement user enumeration
                // Example of how you'd add real users:
                // ...await getAllRealUsersFromKV(env)
            ];
            
            // Sort by progress
            allUsers.sort((a, b) => {
                if (a.completedTasks !== b.completedTasks) {
                    return b.completedTasks - a.completedTasks;
                }
                return b.progressPercentage - a.progressPercentage;
            });
            
            console.log('✅ Admin data compiled successfully for', allUsers.length, 'users');
            
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