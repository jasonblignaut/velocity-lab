/**
 * Velocity Lab - User Progress Tracking Worker
 * Cloudflare Worker for handling user training progress
 * 
 * Features:
 * - Load/save user progress for Exchange LAB tasks
 * - Track task completion, subtasks, and notes
 * - Automatic progress calculations and statistics
 * - JWT authentication and authorization
 * - Comprehensive error handling and logging
 * - CORS support for web app integration
 */

// Import JWT validation utility
import { validateJWT } from '../users/login.js';

export default {
  async fetch(request, env, ctx) {
    // CORS headers for all responses
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    try {
      // Check if required environment variables are available
      if (!env.VELOCITY_USERS || !env.JWT_SECRET) {
        console.error('Missing required environment variables');
        return new Response(JSON.stringify({
          success: false,
          message: 'Server configuration error'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Authentication required'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const userPayload = await validateJWT(token, env.JWT_SECRET);
      
      if (!userPayload) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Invalid or expired session'
        }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      const userId = userPayload.userId;
      const userEmail = userPayload.email;

      // Route based on HTTP method
      switch (request.method) {
        case 'GET':
          return await handleGetProgress(env, userId, userEmail, corsHeaders);
        
        case 'POST':
          return await handleSaveProgress(request, env, userId, userEmail, corsHeaders);
        
        case 'PUT':
          return await handleUpdateProgress(request, env, userId, userEmail, corsHeaders);
        
        case 'DELETE':
          return await handleResetProgress(request, env, userId, userEmail, corsHeaders);
        
        default:
          return new Response(JSON.stringify({
            success: false,
            message: 'Method not allowed'
          }), {
            status: 405,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
      }

    } catch (error) {
      console.error('Progress handler error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        message: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

/**
 * Handle GET request - Load user progress
 */
async function handleGetProgress(env, userId, userEmail, corsHeaders) {
  try {
    const progressKey = `progress:${userId}`;
    const progressJson = await env.VELOCITY_USERS.get(progressKey);
    
    let progressData = {};
    if (progressJson) {
      progressData = JSON.parse(progressJson);
    }

    // Calculate statistics
    const stats = calculateProgressStats(progressData);
    
    console.log(`Progress loaded for user: ${userEmail}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: progressData,
      stats: stats,
      lastUpdated: progressData.lastUpdated || null
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Failed to load progress:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to load progress data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Handle POST request - Save specific task progress
 */
async function handleSaveProgress(request, env, userId, userEmail, corsHeaders) {
  try {
    const requestData = await request.json();
    const { taskId, progress: taskProgress } = requestData;

    if (!taskId || !taskProgress) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Task ID and progress data are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Validate task progress structure
    if (typeof taskProgress !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid progress data format'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Load existing progress
    const progressKey = `progress:${userId}`;
    const existingProgressJson = await env.VELOCITY_USERS.get(progressKey);
    let progressData = existingProgressJson ? JSON.parse(existingProgressJson) : {};

    // Update specific task progress
    progressData[taskId] = {
      ...taskProgress,
      lastUpdated: new Date().toISOString()
    };

    // Add overall metadata
    progressData.lastUpdated = new Date().toISOString();
    progressData.userId = userId;

    // Save back to KV store
    await env.VELOCITY_USERS.put(progressKey, JSON.stringify(progressData));

    // Calculate updated statistics
    const stats = calculateProgressStats(progressData);

    console.log(`Progress saved for user: ${userEmail}, task: ${taskId}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Progress saved successfully',
      data: progressData[taskId],
      stats: stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Failed to save progress:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to save progress data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Handle PUT request - Update entire progress data
 */
async function handleUpdateProgress(request, env, userId, userEmail, corsHeaders) {
  try {
    const requestData = await request.json();
    const { progress: newProgressData } = requestData;

    if (!newProgressData || typeof newProgressData !== 'object') {
      return new Response(JSON.stringify({
        success: false,
        message: 'Valid progress data is required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Add metadata
    const progressData = {
      ...newProgressData,
      lastUpdated: new Date().toISOString(),
      userId: userId
    };

    // Save to KV store
    const progressKey = `progress:${userId}`;
    await env.VELOCITY_USERS.put(progressKey, JSON.stringify(progressData));

    // Calculate statistics
    const stats = calculateProgressStats(progressData);

    console.log(`Progress updated for user: ${userEmail}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Progress updated successfully',
      data: progressData,
      stats: stats
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Failed to update progress:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update progress data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Handle DELETE request - Reset user progress
 */
async function handleResetProgress(request, env, userId, userEmail, corsHeaders) {
  try {
    const url = new URL(request.url);
    const confirmReset = url.searchParams.get('confirm') === 'true';

    if (!confirmReset) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Progress reset requires confirmation. Add ?confirm=true to URL.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Delete progress data
    const progressKey = `progress:${userId}`;
    await env.VELOCITY_USERS.delete(progressKey);

    console.log(`Progress reset for user: ${userEmail}`);

    return new Response(JSON.stringify({
      success: true,
      message: 'Progress reset successfully',
      data: {},
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        progressPercentage: 0,
        tasksWithNotes: 0,
        lastActivity: null
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Failed to reset progress:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to reset progress data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

/**
 * Calculate progress statistics
 */
function calculateProgressStats(progressData) {
  try {
    // Filter out metadata to get only task data
    const taskEntries = Object.entries(progressData).filter(([key]) => 
      !['lastUpdated', 'userId'].includes(key)
    );

    const totalTasks = taskEntries.length;
    let completedTasks = 0;
    let tasksWithNotes = 0;
    let lastActivity = null;

    for (const [taskId, taskData] of taskEntries) {
      if (taskData && typeof taskData === 'object') {
        // Count completed tasks
        if (taskData.completed === true) {
          completedTasks++;
        }

        // Count tasks with notes
        if (taskData.notes && taskData.notes.trim().length > 0) {
          tasksWithNotes++;
        }

        // Track latest activity
        if (taskData.lastUpdated) {
          const taskTime = new Date(taskData.lastUpdated);
          if (!lastActivity || taskTime > new Date(lastActivity)) {
            lastActivity = taskData.lastUpdated;
          }
        }
      }
    }

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate subtask statistics
    let totalSubtasks = 0;
    let completedSubtasks = 0;

    for (const [taskId, taskData] of taskEntries) {
      if (taskData && taskData.subtasks && typeof taskData.subtasks === 'object') {
        const subtaskEntries = Object.entries(taskData.subtasks);
        totalSubtasks += subtaskEntries.length;
        
        for (const [subtaskId, subtaskData] of subtaskEntries) {
          if (subtaskData && subtaskData.completed === true) {
            completedSubtasks++;
          }
        }
      }
    }

    return {
      totalTasks,
      completedTasks,
      progressPercentage,
      tasksWithNotes,
      lastActivity,
      subtasks: {
        total: totalSubtasks,
        completed: completedSubtasks,
        percentage: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
      },
      weeklyBreakdown: calculateWeeklyBreakdown(taskEntries),
      engagementScore: calculateEngagementScore(taskEntries, tasksWithNotes, totalTasks)
    };

  } catch (error) {
    console.error('Error calculating progress stats:', error);
    
    return {
      totalTasks: 0,
      completedTasks: 0,
      progressPercentage: 0,
      tasksWithNotes: 0,
      lastActivity: null,
      subtasks: { total: 0, completed: 0, percentage: 0 },
      weeklyBreakdown: {},
      engagementScore: 0
    };
  }
}

/**
 * Calculate weekly breakdown of progress
 */
function calculateWeeklyBreakdown(taskEntries) {
  const weeklyStats = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const [taskId, taskData] of taskEntries) {
    if (taskData && taskData.completed === true) {
      // Extract week number from task ID (assumes format like "week1-task1")
      const weekMatch = taskId.match(/week(\d+)/);
      if (weekMatch) {
        const weekNum = parseInt(weekMatch[1]);
        if (weekNum >= 1 && weekNum <= 4) {
          weeklyStats[weekNum]++;
        }
      }
    }
  }

  return weeklyStats;
}

/**
 * Calculate user engagement score (0-100)
 */
function calculateEngagementScore(taskEntries, tasksWithNotes, totalTasks) {
  if (totalTasks === 0) return 0;

  let score = 0;
  const weights = {
    completion: 60,    // 60% weight for task completion
    notes: 25,         // 25% weight for taking notes
    consistency: 15    // 15% weight for consistent activity
  };

  // Completion score
  const completedTasks = taskEntries.filter(([_, taskData]) => taskData.completed === true).length;
  score += (completedTasks / totalTasks) * weights.completion;

  // Notes score
  score += (tasksWithNotes / totalTasks) * weights.notes;

  // Consistency score (based on activity distribution)
  const activeDays = new Set();
  for (const [taskId, taskData] of taskEntries) {
    if (taskData.lastUpdated) {
      const day = taskData.lastUpdated.split('T')[0];
      activeDays.add(day);
    }
  }
  
  const consistencyScore = Math.min(activeDays.size / 7, 1); // Up to 7 days
  score += consistencyScore * weights.consistency;

  return Math.round(Math.min(score, 100));
}