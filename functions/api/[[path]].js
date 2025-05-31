import { getUserFromSession } from '../utils';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '');

  const user = await getUserFromSession(env, request);

  if (path === '/avatar' && request.method === 'GET') {
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const avatar = await env.AVATARS.get(user.id, { type: 'arrayBuffer' });
    if (!avatar) return new Response(null, { status: 404 });

    return new Response(avatar, {
      headers: { 'Content-Type': 'image/*' },
      status: 200,
    });
  }

  if (path === '/avatar' && request.method === 'POST') {
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const formData = await request.formData();
    const avatar = formData.get('avatar');
    const arrayBuffer = await avatar.arrayBuffer();

    await env.AVATARS.put(user.id, arrayBuffer);
    return new Response(null, { status: 200 });
  }

  if (path === '/change-password' && request.method === 'POST') {
    if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const formData = await request.formData();
    const currentPassword = formData.get('currentPassword')?.toString();
    const newPassword = formData.get('newPassword')?.toString();

    if (!currentPassword || !newPassword) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const userData = await env.USERS.get(`user:${user.id}`);
    const userObj = JSON.parse(userData);

    if (userObj.password !== currentPassword) {
      return jsonResponse({ error: 'Current password is incorrect' }, 400);
    }

    userObj.password = newPassword;
    await env.USERS.put(`user:${user.id}`, JSON.stringify(userObj));
    await env.USERS.put(`user:${user.email}`, JSON.stringify(userObj));
    return new Response(null, { status: 200 });
  }

  if (path === '/admin/users-progress' && request.method === 'GET') {
    if (!user || user.role !== 'admin') {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const users = await env.USERS.list({ prefix: 'user:' });
    const usersProgress = [];

    for (const { name } of users.keys) {
      if (!name.startsWith('user:')) continue;
      const userId = name.replace('user:', '');
      const userData = await env.USERS.get(name);
      const userObj = JSON.parse(userData);
      const progressData = JSON.parse((await env.PROGRESS.get(userId)) || '{}');
      const totalTasks = 14; // Total number of tasks across all weeks
      let completedTasks = 0;

      Object.values(progressData).forEach((week) => {
        completedTasks += Object.values(week).filter(Boolean).length;
      });

      const progress = Math.round((completedTasks / totalTasks) * 100);
      const avatar = await env.AVATARS.get(userId, { type: 'arrayBuffer' });
      const avatarUrl = avatar ? `/api/avatar?userId=${userId}` : null;

      usersProgress.push({
        name: userObj.name,
        progress,
        avatar: avatarUrl,
      });
    }

    return new Response(JSON.stringify(usersProgress), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Not Found', { status: 404 });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}