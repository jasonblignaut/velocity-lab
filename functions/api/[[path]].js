import { getCookie } from '../functions/utils';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Helper to return JSON responses
  const jsonResponse = (data, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });

  // Validate session and get userId
  const getUserId = async () => {
    const sessionToken = getCookie(request, 'session');
    if (!sessionToken) return null;
    return await env.USERS.get(`session:${sessionToken}`);
  };

  // GET /api/avatar
  if (path === '/api/avatar' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const avatar = await env.AVATARS.get(userId, { type: 'arrayBuffer' });
      if (!avatar) return new Response(null, { status: 404 });

      return new Response(avatar, {
        headers: { 'Content-Type': 'image/*' },
        status: 200,
      });
    } catch (error) {
      console.error('Avatar fetch error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // POST /api/avatar
  if (path === '/api/avatar' && request.method === 'POST') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const formData = await request.formData();
      const avatar = formData.get('avatar');
      const arrayBuffer = await avatar.arrayBuffer();

      await env.AVATARS.put(userId, arrayBuffer);
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // POST /api/change-password
  if (path === '/api/change-password' && request.method === 'POST') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const formData = await request.formData();
      const currentPassword = formData.get('currentPassword')?.toString();
      const newPassword = formData.get('newPassword')?.toString();
      const csrfToken = formData.get('csrf_token')?.toString();

      if (!currentPassword || !newPassword || !csrfToken) {
        return jsonResponse({ error: 'Missing required fields' }, 400);
      }

      const userData = await env.USERS.list({ prefix: `user:` });
      let userObj = null;
      for (const { name } of userData.keys) {
        const user = JSON.parse(await env.USERS.get(name));
        if (user.id === userId) {
          userObj = user;
          break;
        }
      }

      if (!userObj) return jsonResponse({ error: 'User not found' }, 404);
      if (userObj.password !== currentPassword) {
        return jsonResponse({ error: 'Current password is incorrect' }, 400);
      }

      userObj.password = newPassword;
      await env.USERS.put(`user:${userObj.email}`, JSON.stringify(userObj));
      return new Response(null, { status: 200 });
    } catch (error) {
      console.error('Password change error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  // GET /api/admin/users-progress
  if (path === '/api/admin/users-progress' && request.method === 'GET') {
    try {
      const userId = await getUserId();
      if (!userId) return jsonResponse({ error: 'Unauthorized' }, 401);

      const userData = await env.USERS.list({ prefix: `user:` });
      let currentUser = null;
      for (const { name } of userData.keys) {
        const user = JSON.parse(await env.USERS.get(name));
        if (user.id === userId) {
          currentUser = user;
          break;
        }
      }

      if (!currentUser || currentUser.role !== 'admin') {
        return jsonResponse({ error: 'Unauthorized' }, 401);
      }

      const usersProgress = [];
      const users = await env.USERS.list({ prefix: `user:` });

      for (const { name: userKey } of users.keys) {
        const user = JSON.parse(await env.USERS.get(userKey));
        const progressData = JSON.parse((await env.PROGRESS.get(user.id)) || '{}');
        const totalTasks = 14; // Total tasks across all weeks
        let completedTasks = 0;

        Object.values(progressData).forEach((week) => {
          completedTasks += Object.values(week).filter(Boolean).length;
        });

        const progress = Math.round((completedTasks / totalTasks) * 100);
        const avatar = await env.AVATARS.get(user.id, { type: 'arrayBuffer' });
        const avatarUrl = avatar ? `/api/avatar?userId=${user.id}` : null;

        usersProgress.push({
          name: user.name,
          progress,
          avatar: avatarUrl,
        });
      }

      return new Response(JSON.stringify(usersProgress), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Fetch users progress error:', error);
      return jsonResponse({ error: 'Internal server error' }, 500);
    }
  }

  return new Response('Not Found', { status: 404 });
}