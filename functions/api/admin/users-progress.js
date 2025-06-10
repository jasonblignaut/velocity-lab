// /functions/api/admin/users-progress.js
// Cloudflare Pages Function for admin panel - user progress and statistics
// Handles GET (load all users progress for leaderboard)

export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        console.log('👑 Admin panel request - loading user progress data...');
        
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
        
        // Get admin user data to verify role
        const adminUserRaw = await env.VELOCITY_USERS.get(`user:${sessionData.email}`);
        if (!adminUserRaw) {
            console.log('❌ Admin user not found');
            return new Response(JSON.stringify({
                success: false,
                message: 'User account not found.'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const adminUser = JSON.parse(adminUserRaw);
        
        // Verify admin role
        if (adminUser.role !== 'admin') {
            console.log('❌ Non-admin user attempting to access admin panel:', adminUser.email);
            return new Response(JSON.stringify({
                success: false,
                message: 'Admin access required.'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log('✅ Admin access verified for:', adminUser.email);
        
        // Get all users from KV storage
        console.log('🔍 Fetching all users from VELOCITY_USERS...');
        const usersList = await env.VELOCITY_USERS.list({ prefix: 'user:' });
        
        if (!usersList.keys || usersList.keys.length === 0) {
            console.log('⚠️ No users found in system');
            return new Response(JSON.stringify({
                success: true,
                data: {
                    users: [],
                    summary: {
                        totalUsers: 0,
                        activeUsers: 0,
                        totalCompletedTasks: 0,
                        totalCompletedLabs: 0,
                        averageProgress: 0,
                        topPerformer: null
                    }
                }
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        console.log(`📊 Processing ${usersList.keys.length} users...`);
        
        const usersWithProgress = [];
        let totalCompletedTasks = 0;
        let totalCompletedLabs = 0;
        let activeUsersCount = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // Process each user
        for (const userKey of usersList.keys) {
            try {
                // Get user data
                const userDataRaw = await env.VELOCITY_USERS.get(userKey.name);
                if (!userDataRaw) continue;
                
                const userData = JSON.parse(userDataRaw);
                
                // Skip admin users from the leaderboard
                if (userData.role === 'admin') continue;
                
                // Get user progress
                const progressRaw = await env.VELOCITY_PROGRESS.get(`progress:${userData.id}`);
                let progress = {};
                let completedTasks = 0;
                let hasNotes = false;
                
                if (progressRaw) {
                    try {
                        progress = JSON.parse(progressRaw);
                        completedTasks = Object.values(progress).filter(task => task && task.completed).length;
                        hasNotes = Object.values(progress).some(task => task && task.notes && task.notes.trim().length > 0);
                    } catch (e) {
                        console.warn('Failed to parse progress for user:', userData.email);
                    }
                }
                
                // Get user lab history
                const labHistoryRaw = await env.VELOCITY_LABS.get(`history:${userData.id}`);
                let labHistory = [];
                let completedLabs = 0;
                
                if (labHistoryRaw) {
                    try {
                        labHistory = JSON.parse(labHistoryRaw);
                        if (Array.isArray(labHistory)) {
                            completedLabs = labHistory.filter(lab => lab.status === 'completed').length;
                        }
                    } catch (e) {
                        console.warn('Failed to parse lab history for user:', userData.email);
                    }
                }
                
                // Check if user is active (last active within a week)
                const lastActive = new Date(userData.lastActive || userData.createdAt);
                const isActive = lastActive > oneWeekAgo;
                if (isActive) activeUsersCount++;
                
                // Calculate progress percentage
                const progressPercentage = Math.round((completedTasks / 42) * 100);
                
                // Add to totals
                totalCompletedTasks += completedTasks;
                totalCompletedLabs += completedLabs;
                
                usersWithProgress.push({
                    id: userData.id,
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                    completedTasks,
                    progressPercentage,
                    completedLabs,
                    totalSessions: labHistory.length,
                    hasNotes,
                    lastActive: userData.lastActive,
                    createdAt: userData.createdAt
                });
                
            } catch (error) {
                console.warn('Error processing user:', userKey.name, error);
                continue;
            }
        }
        
        // Sort users by progress percentage (descending) and then by completed labs
        usersWithProgress.sort((a, b) => {
            if (a.progressPercentage !== b.progressPercentage) {
                return b.progressPercentage - a.progressPercentage;
            }
            return b.completedLabs - a.completedLabs;
        });
        
        // Add leaderboard positions and medals
        usersWithProgress.forEach((user, index) => {
            user.leaderboardPosition = index + 1;
            if (index === 0) user.medal = '🥇';
            else if (index === 1) user.medal = '🥈';
            else if (index === 2) user.medal = '🥉';
        });
        
        // Calculate summary statistics
        const averageProgress = usersWithProgress.length > 0 
            ? Math.round(totalCompletedTasks / usersWithProgress.length / 42 * 100)
            : 0;
            
        const topPerformer = usersWithProgress.length > 0 ? {
            name: usersWithProgress[0].name,
            progressPercentage: usersWithProgress[0].progressPercentage
        } : null;
        
        console.log('✅ Admin data compiled successfully');
        console.log('📊 Stats:', {
            totalUsers: usersWithProgress.length,
            activeUsers: activeUsersCount,
            averageProgress: averageProgress + '%'
        });
        
        return new Response(JSON.stringify({
            success: true,
            data: {
                users: usersWithProgress,
                summary: {
                    totalUsers: usersWithProgress.length,
                    activeUsers: activeUsersCount,
                    totalCompletedTasks,
                    totalCompletedLabs,
                    averageProgress,
                    topPerformer
                }
            }
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        });
        
    } catch (error) {
        console.error('❌ Admin panel error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Failed to load admin data from server.'
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
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    });
}