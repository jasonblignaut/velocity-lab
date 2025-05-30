import { generateCSRFToken } from '../utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const token = await generateCSRFToken(context.env);
    return new Response(JSON.stringify({ token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('CSRF token error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};