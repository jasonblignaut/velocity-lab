export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const email = context.request.headers.get('X-User-Email');
    if (!email) {
      return new Response('User email not provided in headers', { status: 401 });
    }

    const progressData = await context.env.PROGRESS.get(email, { type: 'json' }) as Record<string, boolean> | null;

    return new Response(JSON.stringify(progressData || {}), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Get progress error:', error);
    return new Response('Failed to retrieve progress', { status: 500 });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const email = context.request.headers.get('X-User-Email');
    if (!email) {
      return new Response('User email not provided in headers', { status: 401 });
    }

    const formData = await context.request.formData();
    const taskId = formData.get('taskId') as string;
    const completed = formData.get('completed') === 'true';

    if (!taskId) {
      return new Response('Missing taskId', { status: 400 });
    }

    const progressData = await context.env.PROGRESS.get(email, { type: 'json' }) as Record<string, boolean> | null || {};
    progressData[taskId] = completed;

    await context.env.PROGRESS.put(email, JSON.stringify(progressData));

    return new Response(JSON.stringify({ message: 'Progress updated successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Update progress error:', error);
    return new Response('Failed to update progress', { status: 500 });
  }
};