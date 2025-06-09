// functions/api/user/lab-history.js
// User Lab History Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  updateUserActivity,
  parseRequestJSON,
  logActivity
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    logActivity('user/lab-history', session.userId, 'GET');
    
    // Get user's lab history from KV storage
    const userLabsKey = `user_labs:${session.userId}`;
    const labsData = await env.VELOCITY_LABS.get(userLabsKey);
    
    let labs = [];
    if (labsData) {
      try {
        labs = JSON.parse(labsData);
      } catch (parseError) {
        console.error('Failed to parse lab history data:', parseError);
        labs = [];
      }
    }
    
    // Ensure labs is an array
    if (!Array.isArray(labs)) {
      labs = [];
    }
    
    // Format labs for frontend consumption matching the expected structure
    const formattedLabs = labs.map((lab, index) => ({
      session: lab.session || index + 1,
      date: lab.date || new Date().toISOString().split('T')[0],
      status: lab.status || 'completed',
      labId: lab.labId || `LAB${String(index + 1).padStart(3, '0')}`,
      startedAt: lab.startedAt || lab.startTime,
      completedAt: lab.completedAt || lab.endTime,
      tasksCompleted: lab.tasksCompleted || 42,
      totalTasks: lab.totalTasks || 42,
      environment: lab.environment || 'Exchange Hybrid Lab',
      statusIcon: lab.statusIcon || (lab.status === 'completed' ? '✅' : '🚀'),
      lastActivity: lab.lastActivity || lab.startedAt
    }));
    
    // Sort by date (newest first) but put in-progress labs at top
    const sortedLabs = formattedLabs.sort((a, b) => {
      // In-progress labs go to top
      if (a.status === 'started' && b.status !== 'started') return -1;
      if (b.status === 'started' && a.status !== 'started') return 1;
      
      // Otherwise sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(sortedLabs, true, 'Lab history loaded successfully');
    
  } catch (error) {
    console.error('Lab history error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to view lab history', 401);
    }
    
    return createErrorResponse('Failed to load lab history', 500);
  }
}

// POST endpoint to add new lab session
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const labData = await parseRequestJSON(request);
    
    logActivity('user/lab-history', session.userId, 'POST', { status: labData.status });
    
    // Validate required fields
    if (!labData.status || !labData.date) {
      return createErrorResponse('Missing required lab data (status and date)', 400);
    }
    
    // Validate status
    if (!['started', 'completed'].includes(labData.status)) {
      return createErrorResponse('Invalid lab status. Must be "started" or "completed"', 400);
    }
    
    // Get existing lab history
    const userLabsKey = `user_labs:${session.userId}`;
    const existingData = await env.VELOCITY_LABS.get(userLabsKey);
    
    let labs = [];
    if (existingData) {
      try {
        labs = JSON.parse(existingData);
      } catch (parseError) {
        console.error('Failed to parse existing lab history:', parseError);
        labs = [];
      }
    }
    
    // Ensure labs is an array
    if (!Array.isArray(labs)) {
      labs = [];
    }
    
    // Create new lab entry
    const newLab = {
      session: labData.session || labs.length + 1,
      date: labData.date,
      status: labData.status,
      labId: labData.labId || `LAB${String(labs.length + 1).padStart(3, '0')}`,
      startedAt: labData.startedAt || new Date().toISOString(),
      completedAt: labData.completedAt || (labData.status === 'completed' ? new Date().toISOString() : null),
      tasksCompleted: labData.tasksCompleted || (labData.status === 'completed' ? 42 : 0),
      totalTasks: labData.totalTasks || 42,
      environment: labData.environment || 'Exchange Hybrid Lab',
      statusIcon: labData.status === 'completed' ? '✅' : '🚀',
      lastActivity: new Date().toISOString()
    };
    
    // Check for duplicate lab sessions (same date and status)
    const existingLabIndex = labs.findIndex(lab => 
      lab.date === newLab.date && lab.status === newLab.status
    );
    
    if (existingLabIndex !== -1) {
      // Update existing lab instead of creating duplicate
      labs[existingLabIndex] = {
        ...labs[existingLabIndex],
        ...newLab,
        session: labs[existingLabIndex].session // Keep original session number
      };
      console.log(`Updated existing lab session for ${session.userEmail}`);
    } else {
      // Add new lab session
      labs.push(newLab);
      console.log(`Added new lab session for ${session.userEmail}`);
    }
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    const responseData = existingLabIndex !== -1 ? labs[existingLabIndex] : newLab;
    
    return createResponse(responseData, true, 'Lab session saved successfully');
    
  } catch (error) {
    console.error('Add lab session error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to add lab session', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    return createErrorResponse('Failed to add lab session', 500);
  }
}

// PUT endpoint to update existing lab session
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const updateData = await parseRequestJSON(request);
    
    logActivity('user/lab-history', session.userId, 'PUT', { labId: updateData.labId });
    
    // Validate required fields
    if (!updateData.labId) {
      return createErrorResponse('Lab ID is required for updates', 400);
    }
    
    // Get existing lab history
    const userLabsKey = `user_labs:${session.userId}`;
    const existingData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!existingData) {
      return createErrorResponse('No lab history found', 404);
    }
    
    let labs = [];
    try {
      labs = JSON.parse(existingData);
    } catch (parseError) {
      return createErrorResponse('Invalid lab history data', 500);
    }
    
    if (!Array.isArray(labs)) {
      return createErrorResponse('Invalid lab history format', 500);
    }
    
    // Find lab to update
    const labIndex = labs.findIndex(lab => lab.labId === updateData.labId);
    
    if (labIndex === -1) {
      return createErrorResponse('Lab session not found', 404);
    }
    
    // Validate status if provided
    if (updateData.status && !['started', 'completed'].includes(updateData.status)) {
      return createErrorResponse('Invalid lab status. Must be "started" or "completed"', 400);
    }
    
    // Update lab data
    const updatedLab = {
      ...labs[labIndex],
      ...updateData,
      lastActivity: new Date().toISOString(),
      statusIcon: (updateData.status || labs[labIndex].status) === 'completed' ? '✅' : '🚀'
    };
    
    // If status changed to completed, set completedAt
    if (updateData.status === 'completed' && !updatedLab.completedAt) {
      updatedLab.completedAt = new Date().toISOString();
    }
    
    labs[labIndex] = updatedLab;
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(updatedLab, true, 'Lab session updated successfully');
    
  } catch (error) {
    console.error('Update lab session error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to update lab session', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    return createErrorResponse('Failed to update lab session', 500);
  }
}

// DELETE endpoint to remove lab session
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get lab ID from URL parameters
    const url = new URL(request.url);
    const labId = url.searchParams.get('labId');
    const deleteAll = url.searchParams.get('deleteAll') === 'true';
    
    logActivity('user/lab-history', session.userId, 'DELETE', { labId, deleteAll });
    
    const userLabsKey = `user_labs:${session.userId}`;
    
    if (deleteAll) {
      // Delete all lab history
      await env.VELOCITY_LABS.delete(userLabsKey);
      await updateUserActivity(env, session.userId);
      return createResponse(null, true, 'All lab history deleted successfully');
    }
    
    if (!labId) {
      return createErrorResponse('Lab ID is required for deletion', 400);
    }
    
    // Get existing lab history
    const existingData = await env.VELOCITY_LABS.get(userLabsKey);
    
    if (!existingData) {
      return createErrorResponse('No lab history found', 404);
    }
    
    let labs = [];
    try {
      labs = JSON.parse(existingData);
    } catch (parseError) {
      return createErrorResponse('Invalid lab history data', 500);
    }
    
    if (!Array.isArray(labs)) {
      return createErrorResponse('Invalid lab history format', 500);
    }
    
    // Find and remove lab
    const labIndex = labs.findIndex(lab => lab.labId === labId);
    
    if (labIndex === -1) {
      return createErrorResponse('Lab session not found', 404);
    }
    
    const removedLab = labs.splice(labIndex, 1)[0];
    
    // Save updated lab history
    if (labs.length > 0) {
      await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    } else {
      // If no labs left, delete the key entirely
      await env.VELOCITY_LABS.delete(userLabsKey);
    }
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(removedLab, true, 'Lab session deleted successfully');
    
  } catch (error) {
    console.error('Delete lab session error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to delete lab session', 401);
    }
    
    return createErrorResponse('Failed to delete lab session', 500);
  }
}

// Helper function to validate lab data structure
function validateLabData(labData) {
  const errors = [];
  
  if (!labData.status) {
    errors.push('Status is required');
  } else if (!['started', 'completed'].includes(labData.status)) {
    errors.push('Status must be "started" or "completed"');
  }
  
  if (!labData.date) {
    errors.push('Date is required');
  } else {
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(labData.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }
  
  if (labData.tasksCompleted !== undefined) {
    const tasks = parseInt(labData.tasksCompleted);
    if (isNaN(tasks) || tasks < 0 || tasks > 42) {
      errors.push('Tasks completed must be a number between 0 and 42');
    }
  }
  
  return errors;
}