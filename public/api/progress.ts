export const onRequestGet: PagesFunction<Env> = async (context) => {
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

    const progress = await context.env.PROGRESS.get(`progress:${userId}`);
    return new Response(progress || '{}', {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
};