import { getUserFromSession } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const user = await getUserFromSession(context.env, context.request);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const progress = (await context.env.PROGRESS.get(user.id)) || '{}';
    return new Response(progress, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getUserFromSession(context.env, context.request);
    if (!user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const formData = await context.request.formData();
    const week = formData.get('week')?.toString();
    const task = formData.get('task')?.toString();
    const checked = formData.get('checked') === 'true';

    if (!week || !task) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    let progress = JSON.parse((await context.env.PROGRESS.get(user.id)) || '{}');
    progress[week] = progress[week] || {};
    progress[week][task] = checked;

    await context.env.PROGRESS.put(user.id, JSON.stringify(progress));
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Update progress error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}