import crypto from 'crypto';

// Helper function to authenticate user
async function authenticateUser(request, env) {
    const authHeader = request.headers.get('Authorization');
    const sessionToken = authHeader?.replace('Bearer ', '');
    
    if (!sessionToken) {
        throw new Error('No session token provided');
    }
    
    const sessionData = await env.SESSIONS.get(`session:${sessionToken}`);
    if (!sessionData) {
        throw new Error('Invalid or expired session');
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
        await env.SESSIONS.delete(`session:${sessionToken}`);
        throw new Error('Session expired');
    }
    
    return session;
}

export async function onRequestPost(context) {
    const { request, env } = context;
    
    try {
        // Set CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        // Handle preflight request
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Authenticate user
        const session = await authenticateUser(request, env);
        
        // Generate lab session ID
        const labId = `lab_${crypto.randomBytes(8).toString('hex')}`;
        const startTime = new Date().toISOString();
        
        // Lab session data
        const labSession = {
            id: labId,
            userId: session.userId,
            userEmail: session.email,
            userName: session.name,
            environment: 'Exchange Hybrid Lab',
            status: 'Active',
            statusIcon: '🔬',
            startTime,
            resources: {
                vm1: 'DC01 - Primary Domain Controller',
                vm2: 'DC02 - Secondary Domain Controller', 
                vm3: 'EX01 - Exchange Server 2019',
                vm4: 'CLIENT01 - Windows 10 Client'
            },
            endpoints: {
                rdp: `rdp.lab.${labId.split('_')[1]}.velocity.local`,
                exchange: `exchange.lab.${labId.split('_')[1]}.velocity.local`,
                owa: `owa.lab.${labId.split('_')[1]}.velocity.local`
            }
        };

        // Store lab session (24 hour expiry)
        const labKey = `lab:${session.userId}:${labId}`;
        await env.SESSIONS.put(labKey, JSON.stringify(labSession), {
            expirationTtl: 24 * 60 * 60 // 24 hours
        });

        // Store current active lab reference
        const activeLabKey = `active_lab:${session.userId}`;
        await env.SESSIONS.put(activeLabKey, labId, {
            expirationTtl: 24 * 60 * 60 // 24 hours
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Lab environment started successfully',
            data: {
                labId,
                status: 'Active',
                startTime,
                environment: 'Exchange Hybrid Lab',
                endpoints: labSession.endpoints
            }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Lab start error:', error);
        
        const status = error.message.includes('session') ? 401 : 500;
        const message = error.message.includes('session') ? 'Authentication required' : 'Internal server error';
        
        return new Response(JSON.stringify({
            success: false,
            message
        }), {
            status,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            }
        });
    }
}