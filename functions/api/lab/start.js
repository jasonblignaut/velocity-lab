// functions/api/lab/start.js
// Lab Environment Start Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  updateUserActivity,
  parseRequestJSON,
  logActivity
} from '../../_middleware.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const labData = await parseRequestJSON(request);
    
    logActivity('lab/start', session.userId, 'POST', { 
      status: labData.status,
      date: labData.date 
    });
    
    // Validate required fields
    if (!labData.status || !labData.date) {
      return createErrorResponse('Missing required lab data (status and date)', 400);
    }
    
    // Validate status - should be 'started' for new labs
    if (labData.status !== 'started') {
      return createErrorResponse('Invalid lab status. Must be "started" for new labs', 400);
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(labData.date)) {
      return createErrorResponse('Invalid date format. Use YYYY-MM-DD', 400);
    }
    
    // Check if user already has a lab in progress today
    const existingLabSession = await checkExistingLabSession(env, session.userId, labData.date);
    
    if (existingLabSession && existingLabSession.status === 'started') {
      // User already has a lab in progress today, return the existing session
      return createResponse(existingLabSession, true, 'Lab session already in progress for today');
    }
    
    // Reset user progress when starting new lab
    const progressResetResult = await resetUserProgress(env, session.userId);
    
    // Create new lab session
    const newLabSession = await createNewLabSession(env, session.userId, labData);
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    const responseData = {
      labSession: newLabSession,
      progressReset: progressResetResult,
      message: 'New lab environment started successfully'
    };
    
    return createResponse(responseData, true, 'Lab environment started successfully');
    
  } catch (error) {
    console.error('Lab start error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to start lab environment', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    return createErrorResponse('Failed to start lab environment', 500);
  }
}

// GET endpoint to check current lab status
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    logActivity('lab/start', session.userId, 'GET');
    
    // Get current lab sessions
    const userLabsKey = `user_labs:${session.userId}`;
    const labsData = await env.VELOCITY_LABS.get(userLabsKey);
    
    let labs = [];
    if (labsData) {
      try {
        labs = JSON.parse(labsData);
      } catch (parseError) {
        console.error('Failed to parse lab data:', parseError);
        labs = [];
      }
    }
    
    // Find current in-progress lab
    const currentLab = labs.find(lab => lab.status === 'started');
    
    // Get current progress
    const userProgressKey = `user_progress:${session.userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let progress = {};
    if (progressData) {
      try {
        progress = JSON.parse(progressData);
      } catch (parseError) {
        progress = {};
      }
    }
    
    // Calculate progress statistics
    const totalTasks = Object.keys(progress).length;
    const completedTasks = Object.values(progress).filter(task => task && task.completed).length;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const responseData = {
      currentLab: currentLab || null,
      hasLabInProgress: !!currentLab,
      progressStats: {
        totalTasks,
        completedTasks,
        progressPercentage
      },
      canStartNewLab: !currentLab || currentLab.status !== 'started'
    };
    
    return createResponse(responseData, true, 'Lab status retrieved successfully');
    
  } catch (error) {
    console.error('Lab status check error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to check lab status', 401);
    }
    
    return createErrorResponse('Failed to check lab status', 500);
  }
}

// PUT endpoint to update lab session (e.g., mark as completed)
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const updateData = await parseRequestJSON(request);
    
    logActivity('lab/start', session.userId, 'PUT', { 
      labId: updateData.labId,
      status: updateData.status 
    });
    
    // Validate required fields
    if (!updateData.labId) {
      return createErrorResponse('Lab ID is required', 400);
    }
    
    // Get existing lab history
    const userLabsKey = `user_labs:${session.userId}`;
    const existingData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!existingData) {
      return createErrorResponse('No lab sessions found', 404);
    }
    
    let labs = [];
    try {
      labs = JSON.parse(existingData);
    } catch (parseError) {
      return createErrorResponse('Invalid lab data', 500);
    }
    
    // Find lab to update
    const labIndex = labs.findIndex(lab => lab.labId === updateData.labId);
    
    if (labIndex === -1) {
      return createErrorResponse('Lab session not found', 404);
    }
    
    // Update lab session
    const updatedLab = {
      ...labs[labIndex],
      ...updateData,
      lastActivity: new Date().toISOString()
    };
    
    // If marking as completed, set completion timestamp and task count
    if (updateData.status === 'completed') {
      updatedLab.completedAt = new Date().toISOString();
      updatedLab.statusIcon = '✅';
      
      // Get current progress to set tasks completed
      if (!updateData.tasksCompleted) {
        const currentProgress = await getCurrentUserProgress(env, session.userId);
        updatedLab.tasksCompleted = currentProgress.completedTasks;
        updatedLab.totalTasks = currentProgress.totalTasks;
      }
    }
    
    labs[labIndex] = updatedLab;
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(updatedLab, true, 'Lab session updated successfully');
    
  } catch (error) {
    console.error('Lab update error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to update lab session', 401);
    }
    
    return createErrorResponse('Failed to update lab session', 500);
  }
}

// Helper function to check for existing lab session
async function checkExistingLabSession(env, userId, date) {
  try {
    const userLabsKey = `user_labs:${userId}`;
    const labsData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!labsData) {
      return null;
    }
    
    const labs = JSON.parse(labsData);
    
    // Find lab session for the given date
    return labs.find(lab => lab.date === date) || null;
    
  } catch (error) {
    console.error('Failed to check existing lab session:', error);
    return null;
  }
}

// Helper function to reset user progress
async function resetUserProgress(env, userId) {
  try {
    const userProgressKey = `user_progress:${userId}`;
    
    // Get current progress to calculate what's being reset
    const currentProgressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    let resetStats = { tasksReset: 0, notesPreserved: 0 };
    
    if (currentProgressData) {
      const currentProgress = JSON.parse(currentProgressData);
      resetStats.tasksReset = Object.values(currentProgress).filter(task => task && task.completed).length;
      resetStats.notesPreserved = Object.values(currentProgress).filter(task => task && task.notes && task.notes.trim()).length;
    }
    
    // Delete the progress data to reset
    await env.VELOCITY_PROGRESS.delete(userProgressKey);
    
    return {
      success: true,
      ...resetStats,
      resetAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Failed to reset user progress:', error);
    return {
      success: false,
      error: 'Failed to reset progress',
      tasksReset: 0,
      notesPreserved: 0
    };
  }
}

// Helper function to create new lab session
async function createNewLabSession(env, userId, labData) {
  try {
    // Get existing lab history to determine session number
    const userLabsKey = `user_labs:${userId}`;
    const existingData = await env.VELOCITY_LABS.get(userLabsKey);
    
    let labs = [];
    if (existingData) {
      try {
        labs = JSON.parse(existingData);
      } catch (parseError) {
        console.error('Failed to parse existing lab data:', parseError);
        labs = [];
      }
    }
    
    // Create new lab session
    const newLab = {
      session: labData.session || labs.length + 1,
      date: labData.date,
      status: 'started',
      labId: labData.labId || `LAB${String(labs.length + 1).padStart(3, '0')}`,
      startedAt: labData.startedAt || new Date().toISOString(),
      completedAt: null,
      tasksCompleted: 0,
      totalTasks: 42,
      environment: labData.environment || 'Exchange Hybrid Lab',
      statusIcon: '🚀',
      lastActivity: new Date().toISOString()
    };
    
    // Add to lab history
    labs.push(newLab);
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    return newLab;
    
  } catch (error) {
    console.error('Failed to create new lab session:', error);
    throw new Error('Failed to create lab session');
  }
}

// Helper function to get current user progress
async function getCurrentUserProgress(env, userId) {
  try {
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    if (!progressData) {
      return { totalTasks: 0, completedTasks: 0 };
    }
    
    const progress = JSON.parse(progressData);
    const totalTasks = Object.keys(progress).length;
    const completedTasks = Object.values(progress).filter(task => task && task.completed).length;
    
    return { totalTasks, completedTasks };
    
  } catch (error) {
    console.error('Failed to get current progress:', error);
    return { totalTasks: 0, completedTasks: 0 };
  }
}

// Helper function to validate lab start data
function validateLabStartData(labData) {
  const errors = [];
  
  if (!labData.status) {
    errors.push('Status is required');
  } else if (labData.status !== 'started') {
    errors.push('Status must be "started" for new labs');
  }
  
  if (!labData.date) {
    errors.push('Date is required');
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(labData.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }
  
  // Validate future dates (optional - you might want to allow this)
  if (labData.date) {
    const labDate = new Date(labData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates
    
    if (labDate > today) {
      // Allow future dates but log for monitoring
      console.log('Lab started for future date:', labData.date);
    }
  }
  
  return errors;
}