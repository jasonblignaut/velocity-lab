export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const cookies = context.request.headers.get('Cookie');
    const sessionToken = cookies?.match(/session=([^;]+)/)?.[1];
    if (!sessionToken) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userId = await context.env.USERS.get(`session:${sessionToken}`);
    if (!userId) {
      return new Response('Session expired', { status: 401 });
    }

    const formData = await context.request.formData();
    const task = formData.get('task') as string;
    const week = formData.get('week') as string;
    const checked = formData.get('checked') === 'true';

    let progress = JSON.parse(await context.env.PROGRESS.get(`progress:${userId}`) || '{}');
    progress[week] = progress[week] || {};
    progress[week][task] = checked;

    await context.env.PROGRESS.put(`progress:${userId}`, JSON.stringify(progress));
    return new Response('Progress updated', { status: 200 });
  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
};