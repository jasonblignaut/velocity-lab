// functions/api/dashboard.ts
import { jsonResponse, errorResponse, getSession, getUserById } from './utils';

export const onRequestGet: PagesFunction = async (context) => {
  const { request, env } = context;

  const session = await getSession(env, request);
  if (!session) {
    return errorResponse('Not authenticated', 401);
  }

  const user = await getUserById(env, session.userId);
  if (!user) {
    return errorResponse('User not found', 404);
  }

  return jsonResponse({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  });
};
