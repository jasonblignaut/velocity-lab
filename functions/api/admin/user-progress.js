// functions/api/admin/users-progress.js

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

// Helper function to get all users
async function getAllUsers(env) {
    const users = [];
    const userCountData = await env.USERS.get('meta:userCount');
    const userCount = userCountData ? parseInt(userCountData) : 0;
    
    // Get all users by checking known email patterns
    // This is a simplified approach - in production you might want a users index
    const list = await env.USERS.list({ prefix: 'user:' });
    
    for (const key of list.keys) {
        try {
            const userData = await env.USERS.get(key.name);
            if (userData) {
                const user = JSON.parse(userData);
                users.push(user);
            }
        } catch (error) {
            console.error(`Error parsing user data for ${key.name}:`, error);
        }
    }
    
    return users;
}

// Helper function to calculate user progress
async function calculateUserProgress(user, env) {
    try {
        // Get user's task progress
        const progressKey = `progress:${user.email}`;
        const progressData = await env.PROGRESS.get(progressKey);
        const progress = progressData ? JSON.parse(progressData) : {};
        
        // Count completed tasks
        const completedTasks = Object.values(progress).filter(task => task && task.completed).length;
        const totalTasks = 42; // Total tasks in the lab
        const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
        
        // Get user's notes
        const notesKey = `notes:${user.email}`;
        const notesData = await env.PROGRESS.get(notesKey);
        const allNotes = notesData ? JSON.parse(notesData) : {};
        
        // Count non-empty notes
        const notesCount = Object.keys(allNotes)
            .filter(key => !key.endsWith('_updatedAt') && allNotes[key] && allNotes[key].trim())
            .length;
        
        return {
            name: user.name,
            email: user.email,
            progress: progressPercentage,
            completedTasks: completedTasks,
            notesCount: notesCount,
            lastLogin: user.lastLogin || user.createdAt,
            role: user.role
        };
    } catch (error) {
        console.error(`Error calculating progress for ${user.email}:`, error);
        return {
            name: user.name,
            email: user.email,
            progress: 0,
            completedTasks: 0,
            notesCount: 0,
            lastLogin: user.lastLogin || user.createdAt,
            role: user.role
        };
    }
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
        
        // Check if user is admin
        if (user.role !== 'admin') {
            return new Response(JSON.stringify({
                success: false,
                message: 'Access denied. Admin role required.'
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        // Get all users
        const users = await getAllUsers(env);
        
        // Calculate progress for each user
        const usersWithProgress = await Promise.all(
            users.map(user => calculateUserProgress(user, env))
        );
        
        // Sort by completed tasks (descending) then by progress percentage
        usersWithProgress.sort((a, b) => {
            if (b.completedTasks !== a.completedTasks) {
                return b.completedTasks - a.completedTasks;
            }
            return b.progress - a.progress;
        });
        
        return new Response(JSON.stringify({
            success: true,
            data: usersWithProgress
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache' // Don't cache admin data
            }
        });
        
    } catch (error) {
        console.error('Get users progress error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Internal server error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}