import { generateCSRFToken } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const token = await generateCSRFToken(context.env);
    return new Response(JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};