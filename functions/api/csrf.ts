import { generateCSRFToken } from '../utils';

export const onRequestGet: PagesFunction = async (context) => {
  const token = await generateCSRFToken(context.env);
  return new Response(token, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
