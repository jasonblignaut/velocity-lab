import { getCookie } from '../functions/utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const sessionToken = getCookie(context.request, 'session');
    if (!sessionToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const progress = await context.env.PROGRESS.get(userId) || '{}';
    return new Response(progress, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const sessionToken = getCookie(context.request, 'session');
    if (!sessionToken) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const formData = await context.request.formData();
    const week = formData.get('week')?.toString();
    const task = formData.get('task')?.toString();
    const checked = formData.get('checked') === 'true';

    if (!week || !task) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    let progress = JSON.parse((await context.env.PROGRESS.get(userId)) || '{}');
    progress[week] = progress[week] || {};
    progress[week][task] = checked;

    await context.env.PROGRESS.put(userId, JSON.stringify(progress));
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Progress update error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}