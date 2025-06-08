// functions/api/task/notes.js
// Task Notes Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  sanitizeInput 
} from '../../_middleware.js';

// GET - Load task notes
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse query parameters
    const url = new URL(request.url);
    const week = sanitizeInput(url.searchParams.get('week'));
    const task = sanitizeInput(url.searchParams.get('task'));
    
    // Validate required parameters
    if (!week || !task) {
      return createErrorResponse('Week and task parameters are required', 400);
    }
    
    // Validate week format
    const weekNum = parseInt(week);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 4) {
      return createErrorResponse('Invalid week number', 400);
    }
    
    // Create notes key
    const notesKey = `notes:${session.userId}:week${week}-${task}`;
    
    // Get notes from KV storage
    const notesData = await env.VELOCITY_PROGRESS.get(notesKey);
    const notes = notesData ? JSON.parse(notesData) : { notes: '', updatedAt: null };
    
    return createResponse(notes, true, 'Notes loaded successfully');
    
  } catch (error) {
    console.error('Notes load error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to view task notes', 401);
    }
    
    return createErrorResponse('Failed to load task notes', 500);
  }
}

// POST - Save task notes
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse form data
    const formData = await request.formData();
    const week = sanitizeInput(formData.get('week'));
    const task = sanitizeInput(formData.get('task'));
    let notes = sanitizeInput(formData.get('notes'));
    
    // Validate required fields
    if (!week || !task) {
      return createErrorResponse('Week and task are required', 400);
    }
    
    // Validate week format
    const weekNum = parseInt(week);
    if (isNaN(weekNum) || weekNum < 1 || weekNum > 4) {
      return createErrorResponse('Invalid week number', 400);
    }
    
    // Validate notes length (500 character limit)
    if (notes && notes.length > 500) {
      notes = notes.substring(0, 500);
    }
    
    // Create notes key
    const notesKey = `notes:${session.userId}:week${week}-${task}`;
    
    // Create notes object
    const notesData = {
      notes: notes || '',
      updatedAt: new Date().toISOString(),
      userId: session.userId,
      taskKey: `week${week}-${task}`
    };
    
    // Save notes to KV storage
    await env.VELOCITY_PROGRESS.put(notesKey, JSON.stringify(notesData));
    
    return createResponse({ 
      notes: notesData.notes, 
      updatedAt: notesData.updatedAt 
    }, true, 'Notes saved successfully');
    
  } catch (error) {
    console.error('Notes save error:', error);
    
    if (error.message === 'Authentication required') {
      return createErrorResponse('Please sign in to save task notes', 401);
    }
    
    return createErrorResponse('Failed to save task notes', 500);
  }
}