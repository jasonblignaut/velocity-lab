// Generate a secure random token
export function generateToken() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Hash password using Web Crypto API
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Verify password against hash
export async function verifyPassword(password, hashedPassword) {
    const hash = await hashPassword(password);
    return hash === hashedPassword;
}

// Verify session token
export async function verifySession(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const sessionData = await env.VELOCITY_SESSIONS.get(`session:${token}`);
    if (!sessionData) {
        return null;
    }

    const session = JSON.parse(sessionData);
    const now = new Date();
    if (new Date(session.expiresAt) < now) {
        await env.VELOCITY_SESSIONS.delete(`session:${token}`);
        await env.VELOCITY_SESSIONS.delete(`user:${session.userId}:session`);
        return null;
    }

    const userData = await env.VELOCITY_USERS.get(`user:${session.userId}`);
    if (!userData) {
        return null;
    }

    const user = JSON.parse(userData);
    return { ...session, role: user.role };
}