const USERS = 'USERS'; // KV namespace for user data
const PROGRESS = 'PROGRESS'; // KV namespace for user progress
const AVATARS = 'AVATARS'; // New KV namespace for avatars

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, ''); // Remove "/api" prefix to match worker.js logic

  // Bind KV namespaces
  const USERS = env.USERS;
  const PROGRESS = env.PROGRESS;
  const AVATARS = env.AVATARS;

  if (path === '/register' && request.method === 'POST') {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password'); // Stored in plaintext as per requirement
    const role = 'user'; // Default role

    const userId = crypto.randomUUID();
    const user = { id: userId, name, email, password, role };

    await USERS.put(userId, JSON.stringify(user));
    return new Response(JSON.stringify({ name, role, email }), { status: 200 });
  }

  if (path === '/login' && request.method === 'POST') {
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');

    const users = await USERS.list();
    for (const { name: userId } of users.keys) {
      const userData = await USERS.get(userId);
      const user = JSON.parse(userData);
      if (user.email === email && user.password === password) {
        return new Response(JSON.stringify({ name: user.name, role: user.role, email: user.email }), { status: 200 });
      }
    }
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }

  if (path === '/logout' && request.method === 'POST') {
    return new Response(null, { status: 200 });
  }

  if (path === '/csrf' && request.method === 'GET') {
    const token = crypto.randomUUID();
    return new Response(JSON.stringify({ token }), { status: 200 });
  }

  if (path === '/progress' && request.method === 'GET') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const progress = await PROGRESS.get(user.id) || '{}';
    return new Response(progress, { status: 200 });
  }

  if (path === '/progress' && request.method === 'POST') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const formData = await request.formData();
    const week = formData.get('week');
    const task = formData.get('task');
    const checked = formData.get('checked') === 'true';

    let progress = JSON.parse(await PROGRESS.get(user.id) || '{}');
    progress[week] = progress[week] || {};
    progress[week][task] = checked;

    await PROGRESS.put(user.id, JSON.stringify(progress));
    return new Response(null, { status: 200 });
  }

  if (path === '/avatar' && request.method === 'GET') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const avatar = await AVATARS.get(user.id, { type: 'arrayBuffer' });
    if (!avatar) return new Response(null, { status: 404 });

    return new Response(avatar, {
      headers: { 'Content-Type': 'image/*' },
      status: 200,
    });
  }

  if (path === '/avatar' && request.method === 'POST') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const formData = await request.formData();
    const avatar = formData.get('avatar');
    const arrayBuffer = await avatar.arrayBuffer();

    await AVATARS.put(user.id, arrayBuffer);
    return new Response(null, { status: 200 });
  }

  if (path === '/change-password' && request.method === 'POST') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const formData = await request.formData();
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');

    const userData = await USERS.get(user.id);
    const userObj = JSON.parse(userData);

    if (userObj.password !== currentPassword) {
      return new Response(JSON.stringify({ error: 'Current password is incorrect' }), { status: 400 });
    }

    userObj.password = newPassword;
    await USERS.put(user.id, JSON.stringify(userObj));
    return new Response(null, { status: 200 });
  }

  if (path === '/admin/users-progress' && request.method === 'GET') {
    const user = JSON.parse(getCookie(request, 'user') || '{}');
    if (!user.id || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const users = await USERS.list();
    const usersProgress = [];

    for (const { name: userId } of users.keys) {
      const userData = await USERS.get(userId);
      const userObj = JSON.parse(userData);
      const progressData = JSON.parse(await PROGRESS.get(userId) || '{}');
      const totalTasks = 14; // Total number of tasks across all weeks
      let completedTasks = 0;

      Object.values(progressData).forEach(week => {
        completedTasks += Object.values(week).filter(Boolean).length;
      });

      const progress = Math.round((completedTasks / totalTasks) * 100);
      const avatar = await AVATARS.get(userId, { type: 'arrayBuffer' });
      const avatarUrl = avatar ? `/api/avatar?userId=${userId}` : null;

      usersProgress.push({
        name: userObj.name,
        progress,
        avatar: avatarUrl,
      });
    }

    return new Response(JSON.stringify(usersProgress), { status: 200 });
  }

  return new Response('Not Found', { status: 404 });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
  const cookie = cookies.find(c => c.startsWith(`${name}=`));
  return cookie ? cookie.split('=')[1] : null;
}