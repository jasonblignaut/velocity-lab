// functions/api/lab/start-new.ts
// Lab management endpoint for starting new lab sessions

import { 
  jsonResponse, 
  errorResponse, 
  validateSession,
  getUserById,
  startNewLab,
  logActivity
} from '../../utils';
import type { Env } from '../../utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { env, request } = context;
    
    // Validate session
    const userId = await validateSession(env, request);
    if (!userId) {
      return errorResponse('Authentication required', 401);
    }

    const user = await getUserById(env, userId);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    console.log(`Starting new lab for user: ${user.email}`);

    // Start new lab (this will save current progress to history)
    const labId = await startNewLab(env, userId);

    // Log lab start activity
    await logActivity(env, userId, 'lab_started', { 
      labId,
      userName: user.name,
      userEmail: user.email
    });

    console.log(`New lab started successfully for user ${user.email}, labId: ${labId}`);

    return jsonResponse({
      success: true,
      labId,
      message: 'New lab started successfully! Your previous progress has been saved to history.',
      totalTasks: 42
    });
  } catch (error) {
    console.error('Start new lab error:', error);
    return errorResponse('Failed to start new lab. Please try again.', 500);
  }
};