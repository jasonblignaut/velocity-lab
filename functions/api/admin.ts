import { Env } from '../utils';

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const cookies = context.request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }
    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return jsonResponse({ error: 'Session expired' }, 401);
    }
    const userData = await context.env.USERS.get(`user:${userId}`);
    if (!userData) {
      return jsonResponse({ error: 'User not found' }, 404);
    }
    const user = JSON.parse(userData);
    if (user.role !== 'admin') {
      return jsonResponse({ error: 'Forbidden' }, 403);
    }

    // Fetch all users and their progress
    const usersList = await context.env.USERS.list({ prefix: 'user:' });
    const users = await Promise.all(
      usersList.keys.map(async (key) => {
        const data = await context.env.USERS.get(key.name);
        const user = JSON.parse(data);
        const progressData = await context.env.PROGRESS.get(`progress:${user.id}`);
        const progress = JSON.parse(progressData || '{}');
        let completedTasks = 0;
        let totalTasks = 0;
        Object.values(progress).forEach(week => {
          const tasks = Object.values(week);
          completedTasks += tasks.filter(Boolean).length;
          totalTasks += tasks.length;
        });
        return {
          name: user.name,
          email: user.email,
          progress: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
          completedTasks,
          totalTasks,
        };
      })
    );
    return jsonResponse(users, 200);
  } catch (error) {
    console.error('Admin GET error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};