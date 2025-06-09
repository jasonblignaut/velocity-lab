// functions/api/task/notes.js
// Task Notes Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  validateTaskId,
  parseRequestJSON,
  sanitizeString,
  updateUserActivity,
  logActivity
} from '../../_middleware.js';

// GET endpoint to retrieve task notes
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const includeHistory = url.searchParams.get('includeHistory') === 'true';
    const search = url.searchParams.get('search');
    const format = url.searchParams.get('format') || 'json'; // json, text, html
    
    logActivity('task/notes', session.userId, 'GET', { 
      taskId, 
      includeHistory,
      search: search ? 'true' : 'false'
    });
    
    if (taskId) {
      // Get notes for specific task
      const validTaskId = validateTaskId(taskId);
      if (!validTaskId) {
        return createErrorResponse('Invalid task ID format', 400);
      }
      
      const taskNotes = await getTaskNotes(env, session.userId, validTaskId, includeHistory);
      
      if (!taskNotes) {
        return createErrorResponse('Task notes not found', 404);
      }
      
      // Format response based on requested format
      const formattedNotes = formatNotesResponse(taskNotes, format);
      
      return createResponse(formattedNotes, true, 'Task notes retrieved successfully');
      
    } else {
      // Get all notes for user
      const allNotes = await getAllUserNotes(env, session.userId, search);
      
      const responseData = {
        notes: allNotes,
        totalTasks: Object.keys(allNotes).length,
        tasksWithNotes: Object.values(allNotes).filter(note => note.content && note.content.trim()).length
      };
      
      return createResponse(responseData, true, 'All notes retrieved successfully');
    }
    
  } catch (error) {
    console.error('Notes retrieval error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to view notes', 401);
    }
    
    return createErrorResponse('Failed to retrieve notes', 500);
  }
}

// POST endpoint to create or update task notes
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const noteData = await parseRequestJSON(request);
    
    // Validate required fields
    if (!noteData.taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    const taskId = validateTaskId(noteData.taskId);
    if (!taskId) {
      return createErrorResponse('Invalid task ID format', 400);
    }
    
    if (!noteData.content || typeof noteData.content !== 'string') {
      return createErrorResponse('Note content is required', 400);
    }
    
    logActivity('task/notes', session.userId, 'POST', { 
      taskId,
      contentLength: noteData.content.length 
    });
    
    // Save note
    const savedNote = await saveTaskNote(env, session.userId, taskId, noteData);
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(savedNote, true, 'Note saved successfully');
    
  } catch (error) {
    console.error('Note save error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to save notes', 401);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    return createErrorResponse('Failed to save note', 500);
  }
}

// PUT endpoint to update existing task notes
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Parse request body
    const updateData = await parseRequestJSON(request);
    
    // Validate required fields
    if (!updateData.taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    const taskId = validateTaskId(updateData.taskId);
    if (!taskId) {
      return createErrorResponse('Invalid task ID format', 400);
    }
    
    logActivity('task/notes', session.userId, 'PUT', { taskId });
    
    // Update note
    const updatedNote = await updateTaskNote(env, session.userId, taskId, updateData);
    
    if (!updatedNote) {
      return createErrorResponse('Task note not found', 404);
    }
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(updatedNote, true, 'Note updated successfully');
    
  } catch (error) {
    console.error('Note update error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to update notes', 401);
    }
    
    return createErrorResponse('Failed to update note', 500);
  }
}

// DELETE endpoint to remove task notes
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const deleteAll = url.searchParams.get('deleteAll') === 'true';
    const keepHistory = url.searchParams.get('keepHistory') === 'true';
    
    logActivity('task/notes', session.userId, 'DELETE', { 
      taskId,
      deleteAll,
      keepHistory 
    });
    
    if (deleteAll) {
      // Delete all notes for user
      await deleteAllUserNotes(env, session.userId, keepHistory);
      await updateUserActivity(env, session.userId);
      
      return createResponse(null, true, 'All notes deleted successfully');
    }
    
    if (!taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    const validTaskId = validateTaskId(taskId);
    if (!validTaskId) {
      return createErrorResponse('Invalid task ID format', 400);
    }
    
    // Delete specific task note
    const deletedNote = await deleteTaskNote(env, session.userId, validTaskId, keepHistory);
    
    if (!deletedNote) {
      return createErrorResponse('Task note not found', 404);
    }
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    return createResponse(deletedNote, true, 'Note deleted successfully');
    
  } catch (error) {
    console.error('Note deletion error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to delete notes', 401);
    }
    
    return createErrorResponse('Failed to delete note', 500);
  }
}

// Helper function to get task notes
async function getTaskNotes(env, userId, taskId, includeHistory = false) {
  try {
    // First, check if notes exist in the main progress data
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let mainNote = '';
    if (progressData) {
      const progress = JSON.parse(progressData);
      if (progress[taskId] && progress[taskId].notes) {
        mainNote = progress[taskId].notes;
      }
    }
    
    // Get detailed notes if they exist
    const taskNotesKey = `task_notes:${userId}:${taskId}`;
    const notesData = await env.VELOCITY_PROGRESS.get(taskNotesKey);
    
    let noteDetails = {
      content: mainNote,
      lastUpdated: null,
      wordCount: 0,
      characterCount: 0,
      tags: [],
      format: 'text'
    };
    
    if (notesData) {
      try {
        const detailedNotes = JSON.parse(notesData);
        noteDetails = {
          ...noteDetails,
          ...detailedNotes
        };
      } catch (parseError) {
        console.error('Failed to parse detailed notes:', parseError);
      }
    }
    
    // Calculate content metrics
    noteDetails.wordCount = noteDetails.content ? noteDetails.content.trim().split(/\s+/).length : 0;
    noteDetails.characterCount = noteDetails.content ? noteDetails.content.length : 0;
    
    // Get history if requested
    if (includeHistory) {
      const historyKey = `note_history:${userId}:${taskId}`;
      const historyData = await env.VELOCITY_PROGRESS.get(historyKey);
      
      if (historyData) {
        try {
          noteDetails.history = JSON.parse(historyData);
        } catch (parseError) {
          noteDetails.history = [];
        }
      } else {
        noteDetails.history = [];
      }
    }
    
    return {
      taskId,
      ...noteDetails
    };
    
  } catch (error) {
    console.error('Failed to get task notes:', error);
    return null;
  }
}

// Helper function to get all user notes
async function getAllUserNotes(env, userId, searchTerm = null) {
  try {
    // Get main progress data
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let allNotes = {};
    
    if (progressData) {
      const progress = JSON.parse(progressData);
      
      // Extract notes from progress data
      Object.keys(progress).forEach(taskId => {
        if (progress[taskId].notes && progress[taskId].notes.trim()) {
          const content = progress[taskId].notes;
          
          // Apply search filter if provided
          if (!searchTerm || content.toLowerCase().includes(searchTerm.toLowerCase())) {
            allNotes[taskId] = {
              taskId,
              content,
              lastUpdated: progress[taskId].lastUpdated,
              wordCount: content.trim().split(/\s+/).length,
              characterCount: content.length,
              format: 'text'
            };
          }
        }
      });
    }
    
    return allNotes;
    
  } catch (error) {
    console.error('Failed to get all user notes:', error);
    return {};
  }
}

// Helper function to save task note
async function saveTaskNote(env, userId, taskId, noteData) {
  try {
    const content = sanitizeString(noteData.content, 10000); // Limit to 10k characters
    const timestamp = new Date().toISOString();
    
    // Save to main progress data
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    let progress = {};
    if (progressData) {
      try {
        progress = JSON.parse(progressData);
      } catch (parseError) {
        progress = {};
      }
    }
    
    // Initialize task if it doesn't exist
    if (!progress[taskId]) {
      progress[taskId] = {
        completed: false,
        completedAt: null,
        subtasks: {},
        notes: '',
        lastUpdated: timestamp
      };
    }
    
    // Save previous note to history if it's different
    if (progress[taskId].notes && progress[taskId].notes !== content) {
      await saveNoteHistory(env, userId, taskId, progress[taskId].notes, progress[taskId].lastUpdated);
    }
    
    // Update note content
    progress[taskId].notes = content;
    progress[taskId].lastUpdated = timestamp;
    
    // Save updated progress
    await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
    
    // Save detailed note metadata
    const noteDetails = {
      content,
      lastUpdated: timestamp,
      wordCount: content.trim().split(/\s+/).length,
      characterCount: content.length,
      tags: noteData.tags || [],
      format: noteData.format || 'text',
      createdAt: noteData.createdAt || timestamp
    };
    
    const taskNotesKey = `task_notes:${userId}:${taskId}`;
    await env.VELOCITY_PROGRESS.put(taskNotesKey, JSON.stringify(noteDetails));
    
    return {
      taskId,
      ...noteDetails
    };
    
  } catch (error) {
    console.error('Failed to save task note:', error);
    throw error;
  }
}

// Helper function to update task note
async function updateTaskNote(env, userId, taskId, updateData) {
  try {
    // Get existing note
    const existingNote = await getTaskNotes(env, userId, taskId);
    
    if (!existingNote || !existingNote.content) {
      return null;
    }
    
    // Prepare update data
    const updateFields = {};
    
    if (updateData.content !== undefined) {
      updateFields.content = sanitizeString(updateData.content, 10000);
    }
    
    if (updateData.tags !== undefined && Array.isArray(updateData.tags)) {
      updateFields.tags = updateData.tags.map(tag => sanitizeString(tag, 50)).slice(0, 10); // Max 10 tags
    }
    
    if (updateData.format !== undefined) {
      updateFields.format = ['text', 'markdown', 'html'].includes(updateData.format) ? updateData.format : 'text';
    }
    
    // Merge with existing note data
    const updatedNoteData = {
      ...existingNote,
      ...updateFields
    };
    
    // Save updated note
    return await saveTaskNote(env, userId, taskId, updatedNoteData);
    
  } catch (error) {
    console.error('Failed to update task note:', error);
    throw error;
  }
}

// Helper function to delete task note
async function deleteTaskNote(env, userId, taskId, keepHistory = false) {
  try {
    // Get existing note for return data
    const existingNote = await getTaskNotes(env, userId, taskId);
    
    if (!existingNote) {
      return null;
    }
    
    // Save to history if keeping history
    if (keepHistory && existingNote.content) {
      await saveNoteHistory(env, userId, taskId, existingNote.content, existingNote.lastUpdated);
    }
    
    // Remove from main progress data
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    if (progressData) {
      const progress = JSON.parse(progressData);
      if (progress[taskId]) {
        progress[taskId].notes = '';
        progress[taskId].lastUpdated = new Date().toISOString();
        await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
      }
    }
    
    // Remove detailed note metadata
    const taskNotesKey = `task_notes:${userId}:${taskId}`;
    await env.VELOCITY_PROGRESS.delete(taskNotesKey);
    
    return existingNote;
    
  } catch (error) {
    console.error('Failed to delete task note:', error);
    throw error;
  }
}

// Helper function to delete all user notes
async function deleteAllUserNotes(env, userId, keepHistory = false) {
  try {
    // Get all notes first if keeping history
    if (keepHistory) {
      const allNotes = await getAllUserNotes(env, userId);
      for (const taskId of Object.keys(allNotes)) {
        const note = allNotes[taskId];
        await saveNoteHistory(env, userId, taskId, note.content, note.lastUpdated);
      }
    }
    
    // Clear notes from main progress data
    const userProgressKey = `user_progress:${userId}`;
    const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
    
    if (progressData) {
      const progress = JSON.parse(progressData);
      const timestamp = new Date().toISOString();
      
      Object.keys(progress).forEach(taskId => {
        if (progress[taskId].notes) {
          progress[taskId].notes = '';
          progress[taskId].lastUpdated = timestamp;
        }
      });
      
      await env.VELOCITY_PROGRESS.put(userProgressKey, JSON.stringify(progress));
    }
    
    // Note: In a real implementation, you might want to use KV list operations
    // to delete all task_notes keys for the user, but for now we'll rely on
    // the main progress data cleanup
    
  } catch (error) {
    console.error('Failed to delete all user notes:', error);
    throw error;
  }
}

// Helper function to save note history
async function saveNoteHistory(env, userId, taskId, content, timestamp) {
  try {
    const historyKey = `note_history:${userId}:${taskId}`;
    const existingHistoryData = await env.VELOCITY_PROGRESS.get(historyKey);
    
    let history = [];
    if (existingHistoryData) {
      try {
        history = JSON.parse(existingHistoryData);
      } catch (parseError) {
        history = [];
      }
    }
    
    // Add new history entry
    history.unshift({
      content,
      timestamp: timestamp || new Date().toISOString(),
      wordCount: content.trim().split(/\s+/).length,
      characterCount: content.length
    });
    
    // Keep only last 10 versions
    history = history.slice(0, 10);
    
    // Save updated history
    await env.VELOCITY_PROGRESS.put(historyKey, JSON.stringify(history));
    
  } catch (error) {
    console.error('Failed to save note history:', error);
  }
}

// Helper function to format notes response
function formatNotesResponse(notes, format) {
  switch (format) {
    case 'text':
      return {
        taskId: notes.taskId,
        content: notes.content,
        metadata: {
          wordCount: notes.wordCount,
          characterCount: notes.characterCount,
          lastUpdated: notes.lastUpdated
        }
      };
      
    case 'html':
      // Convert text to basic HTML
      const htmlContent = notes.content
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
      return {
        taskId: notes.taskId,
        content: htmlContent,
        format: 'html',
        metadata: {
          wordCount: notes.wordCount,
          characterCount: notes.characterCount,
          lastUpdated: notes.lastUpdated
        }
      };
      
    case 'json':
    default:
      return notes;
  }
}