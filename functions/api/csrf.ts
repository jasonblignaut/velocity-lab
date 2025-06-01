// functions/api/csrf.ts
import { getSession, generateCsrfToken, jsonResponse, errorResponse } from './utils';
import type { Env } from './utils';

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, request } = context;

  const session = await getSession(env, request);
  if (!session) {
    return errorResponse('Unauthorized - no valid session', 401);
  }

  const csrfToken = await generateCsrfToken(env, session.userId);

  return jsonResponse({
    token: csrfToken,
    expires: new Date(Date.now() + 3600 * 1000).toISOString(),
  });
};
