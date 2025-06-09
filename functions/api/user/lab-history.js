// functions/api/user/lab-history.js
// User Lab History Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth 
} from '../../_middleware.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
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
      lastActivity: lab.lastActivity
    }));
    
    // Sort by date (newest first) but put in-progress labs at top
    const sortedLabs = formattedLabs.sort((a, b) => {
      // In-progress labs go to top
      if (a.status === 'started' && b.status !== 'started') return -1;
      if (b.status === 'started' && a.status !== 'started') return 1;
      
      // Otherwise sort by date (newest first)
      return new Date(b.date) - new Date(a.date);
    });
    
    return createResponse(sortedLabs, true, 'Lab history loaded successfully');
    
  } catch (error) {
    console.error('Lab history error:', error);
    
    if (error.message === 'Authentication required') {
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
    const labData = await request.json();
    
    // Validate required fields
    if (!labData.status || !labData.date) {
      return createErrorResponse('Missing required lab data', 400);
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
      completedAt: labData.completedAt || null,
      tasksCompleted: labData.tasksCompleted || 0,
      totalTasks: labData.totalTasks || 42,
      environment: labData.environment || 'Exchange Hybrid Lab',
      statusIcon: labData.status === 'completed' ? '✅' : '🚀',
      lastActivity: new Date().toISOString()
    };
    
    // Check if lab with same date and status already exists (prevent duplicates)
    const existingLab = labs.find(lab => 
      lab.date === newLab.date && lab.status === newLab.status
    );
    
    if (existingLab) {
      // Update existing lab instead of creating duplicate
      Object.assign(existingLab, newLab);
    } else {
      // Add new lab
      labs.push(newLab);
    }
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    return createResponse(newLab, true, 'Lab session added successfully');
    
  } catch (error) {
    console.error('Add lab session error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to add lab session', 401);
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
    const updateData = await request.json();
    
    // Validate required fields
    if (!updateData.labId) {
      return createErrorResponse('Lab ID is required', 400);
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
    
    // Find lab to update
    const labIndex = labs.findIndex(lab => lab.labId === updateData.labId);
    
    if (labIndex === -1) {
      return createErrorResponse('Lab session not found', 404);
    }
    
    // Update lab data
    labs[labIndex] = {
      ...labs[labIndex],
      ...updateData,
      lastActivity: new Date().toISOString(),
      statusIcon: updateData.status === 'completed' ? '✅' : '🚀'
    };
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    return createResponse(labs[labIndex], true, 'Lab session updated successfully');
    
  } catch (error) {
    console.error('Update lab session error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to update lab session', 401);
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
    
    if (!labId) {
      return createErrorResponse('Lab ID is required', 400);
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
    
    // Find and remove lab
    const labIndex = labs.findIndex(lab => lab.labId === labId);
    
    if (labIndex === -1) {
      return createErrorResponse('Lab session not found', 404);
    }
    
    const removedLab = labs.splice(labIndex, 1)[0];
    
    // Save updated lab history
    await env.VELOCITY_LABS.put(userLabsKey, JSON.stringify(labs));
    
    return createResponse(removedLab, true, 'Lab session deleted successfully');
    
  } catch (error) {
    console.error('Delete lab session error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to delete lab session', 401);
    }
    
    return createErrorResponse('Failed to delete lab session', 500);
  }
}