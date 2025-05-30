import sanitizeHtml from 'sanitize-html';

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

    const progress = await context.env.PROGRESS.get(`progress:${userId}`);
    return new Response(progress || '{}', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Progress GET error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
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

    const formData = await context.request.formData();
    const task = sanitizeHtml(formData.get('task')?.toString() || '');
    const week = sanitizeHtml(formData.get('week')?.toString() || '');
    const checked = formData.get('checked') === 'true';

    if (!task || !week) {
      return jsonResponse({ error: 'Missing task or week' }, 400);
    }

    let progress = JSON.parse((await context.env.PROGRESS.get(`progress:${userId}`)) || '{}');
    progress[week] = progress[week] || {};
    progress[week][task] = checked;

    await context.env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    return jsonResponse({ message: 'Progress updated' }, 200);
  } catch (error) {
    console.error('Progress POST error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}