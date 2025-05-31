import { Env } from '../utils';

function jsonResponse(data: Record<string, any>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

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
    const avatar = formData.get('avatar');
    if (!(avatar instanceof File)) {
      return jsonResponse({ error: 'No avatar file provided' }, 400);
    }
    const arrayBuffer = await avatar.arrayBuffer();
    const url = `data:${avatar.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
    await context.env.AVATARS.put(`avatar:${userId}`, url);
    return jsonResponse({ url }, 200);
  } catch (error) {
    console.error('Avatar POST error:', error);
    return jsonResponse({ error: 'Server error' }, 500);
  }
};