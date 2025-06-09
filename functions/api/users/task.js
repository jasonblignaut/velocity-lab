// functions/api/users/task.js
// Task Management Endpoint for Velocity Lab

import { 
  createResponse, 
  createErrorResponse, 
  requireAuth,
  requireAdmin,
  validateTaskId,
  parseRequestJSON,
  sanitizeString,
  updateUserActivity,
  logActivity
} from '../../_middleware.js';

// GET endpoint to retrieve task definitions and user-specific task data
export async function onRequestGet(context) {
  const { request, env } = context;
  
  try {
    // Require authentication
    const session = await requireAuth(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const category = url.searchParams.get('category');
    const week = url.searchParams.get('week');
    const includeProgress = url.searchParams.get('includeProgress') === 'true';
    
    logActivity('users/task', session.userId, 'GET', { 
      taskId, 
      category, 
      week,
      includeProgress 
    });
    
    // Get task definitions from KV storage
    const taskDefinitionsKey = 'task_definitions';
    const taskDefinitionsData = await env.VELOCITY_PROGRESS.get(taskDefinitionsKey);
    
    let taskDefinitions = {};
    if (taskDefinitionsData) {
      try {
        taskDefinitions = JSON.parse(taskDefinitionsData);
      } catch (parseError) {
        console.error('Failed to parse task definitions:', parseError);
        // Fallback to default task structure
        taskDefinitions = generateDefaultTaskDefinitions();
      }
    } else {
      // Initialize with default task definitions
      taskDefinitions = generateDefaultTaskDefinitions();
      await env.VELOCITY_PROGRESS.put(taskDefinitionsKey, JSON.stringify(taskDefinitions));
    }
    
    // Get user's progress if requested
    let userProgress = {};
    if (includeProgress) {
      const userProgressKey = `user_progress:${session.userId}`;
      const progressData = await env.VELOCITY_PROGRESS.get(userProgressKey);
      
      if (progressData) {
        try {
          userProgress = JSON.parse(progressData);
        } catch (parseError) {
          userProgress = {};
        }
      }
    }
    
    // Filter tasks based on parameters
    let filteredTasks = { ...taskDefinitions };
    
    if (taskId) {
      const validTaskId = validateTaskId(taskId);
      if (!validTaskId || !taskDefinitions[validTaskId]) {
        return createErrorResponse('Task not found', 404);
      }
      
      filteredTasks = { [validTaskId]: taskDefinitions[validTaskId] };
    }
    
    if (week) {
      const weekNum = parseInt(week);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 4) {
        return createErrorResponse('Invalid week number. Must be 1-4', 400);
      }
      
      filteredTasks = Object.keys(taskDefinitions)
        .filter(tid => tid.startsWith(`week${weekNum}-`))
        .reduce((acc, tid) => {
          acc[tid] = taskDefinitions[tid];
          return acc;
        }, {});
    }
    
    if (category) {
      filteredTasks = Object.keys(filteredTasks)
        .filter(tid => {
          const task = filteredTasks[tid];
          return task.category && task.category.toLowerCase().includes(category.toLowerCase());
        })
        .reduce((acc, tid) => {
          acc[tid] = filteredTasks[tid];
          return acc;
        }, {});
    }
    
    // Enhance tasks with user progress if requested
    if (includeProgress) {
      Object.keys(filteredTasks).forEach(tid => {
        filteredTasks[tid].userProgress = userProgress[tid] || {
          completed: false,
          completedAt: null,
          subtasks: {},
          notes: '',
          lastUpdated: null
        };
      });
    }
    
    // Calculate task statistics
    const taskStats = calculateTaskStatistics(filteredTasks, userProgress);
    
    // Update user activity
    await updateUserActivity(env, session.userId);
    
    const responseData = {
      tasks: filteredTasks,
      statistics: taskStats,
      totalTasks: Object.keys(filteredTasks).length
    };
    
    return createResponse(responseData, true, 'Task data retrieved successfully');
    
  } catch (error) {
    console.error('Task retrieval error:', error);
    
    if (error.message === 'Authentication required' || error.message.includes('session')) {
      return createErrorResponse('Please sign in to view tasks', 401);
    }
    
    return createErrorResponse('Failed to retrieve task data', 500);
  }
}

// POST endpoint to create or update task definitions (admin only)
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    const session = await requireAdmin(request, env);
    
    // Parse request body
    const taskData = await parseRequestJSON(request);
    
    logActivity('users/task', session.userId, 'POST', { 
      adminUser: session.userEmail,
      tasksUpdated: Object.keys(taskData.tasks || {}).length 
    });
    
    // Validate task data structure
    if (!taskData.tasks || typeof taskData.tasks !== 'object') {
      return createErrorResponse('Invalid task data structure. Expected "tasks" object', 400);
    }
    
    // Validate each task
    const validatedTasks = {};
    const validationErrors = [];
    
    Object.keys(taskData.tasks).forEach(taskId => {
      const validTaskId = validateTaskId(taskId);
      if (!validTaskId) {
        validationErrors.push(`Invalid task ID: ${taskId}`);
        return;
      }
      
      const task = taskData.tasks[taskId];
      const validationResult = validateTaskDefinition(task, validTaskId);
      
      if (validationResult.isValid) {
        validatedTasks[validTaskId] = validationResult.task;
      } else {
        validationErrors.push(`Task ${taskId}: ${validationResult.errors.join(', ')}`);
      }
    });
    
    if (validationErrors.length > 0) {
      return createErrorResponse('Task validation failed', 400, validationErrors);
    }
    
    // Get existing task definitions
    const taskDefinitionsKey = 'task_definitions';
    const existingData = await env.VELOCITY_PROGRESS.get(taskDefinitionsKey);
    
    let existingTasks = {};
    if (existingData) {
      try {
        existingTasks = JSON.parse(existingData);
      } catch (parseError) {
        existingTasks = {};
      }
    }
    
    // Merge with existing tasks (new tasks override existing)
    const updatedTasks = {
      ...existingTasks,
      ...validatedTasks
    };
    
    // Save updated task definitions
    await env.VELOCITY_PROGRESS.put(taskDefinitionsKey, JSON.stringify(updatedTasks));
    
    const responseData = {
      updatedTasks: validatedTasks,
      totalTasks: Object.keys(updatedTasks).length,
      timestamp: new Date().toISOString()
    };
    
    return createResponse(responseData, true, `Updated ${Object.keys(validatedTasks).length} task definitions`);
    
  } catch (error) {
    console.error('Task update error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    if (error.message.includes('JSON')) {
      return createErrorResponse('Invalid request data format', 400);
    }
    
    return createErrorResponse('Failed to update task definitions', 500);
  }
}

// PUT endpoint to update specific task definition (admin only)
export async function onRequestPut(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    const session = await requireAdmin(request, env);
    
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
    
    logActivity('users/task', session.userId, 'PUT', { 
      taskId,
      adminUser: session.userEmail 
    });
    
    // Get existing task definitions
    const taskDefinitionsKey = 'task_definitions';
    const existingData = await env.VELOCITY_PROGRESS.get(taskDefinitionsKey);
    
    let tasks = {};
    if (existingData) {
      try {
        tasks = JSON.parse(existingData);
      } catch (parseError) {
        tasks = generateDefaultTaskDefinitions();
      }
    } else {
      tasks = generateDefaultTaskDefinitions();
    }
    
    // Check if task exists
    if (!tasks[taskId]) {
      return createErrorResponse('Task not found', 404);
    }
    
    // Validate updated task data
    const taskUpdate = updateData.task || {};
    const validationResult = validateTaskDefinition(taskUpdate, taskId);
    
    if (!validationResult.isValid) {
      return createErrorResponse('Task validation failed', 400, validationResult.errors);
    }
    
    // Update task
    tasks[taskId] = {
      ...tasks[taskId],
      ...validationResult.task,
      lastModified: new Date().toISOString(),
      modifiedBy: session.userEmail
    };
    
    // Save updated task definitions
    await env.VELOCITY_PROGRESS.put(taskDefinitionsKey, JSON.stringify(tasks));
    
    const responseData = {
      taskId,
      task: tasks[taskId]
    };
    
    return createResponse(responseData, true, 'Task definition updated successfully');
    
  } catch (error) {
    console.error('Task update error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    return createErrorResponse('Failed to update task definition', 500);
  }
}

// DELETE endpoint to remove task definition (admin only)
export async function onRequestDelete(context) {
  const { request, env } = context;
  
  try {
    // Require admin authentication
    const session = await requireAdmin(request, env);
    
    // Get URL parameters
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');
    const resetToDefaults = url.searchParams.get('resetToDefaults') === 'true';
    
    logActivity('users/task', session.userId, 'DELETE', { 
      taskId,
      resetToDefaults,
      adminUser: session.userEmail 
    });
    
    const taskDefinitionsKey = 'task_definitions';
    
    if (resetToDefaults) {
      // Reset all task definitions to defaults
      const defaultTasks = generateDefaultTaskDefinitions();
      await env.VELOCITY_PROGRESS.put(taskDefinitionsKey, JSON.stringify(defaultTasks));
      
      return createResponse(null, true, 'Task definitions reset to defaults');
    }
    
    if (!taskId) {
      return createErrorResponse('Task ID is required', 400);
    }
    
    const validTaskId = validateTaskId(taskId);
    if (!validTaskId) {
      return createErrorResponse('Invalid task ID format', 400);
    }
    
    // Get existing task definitions
    const existingData = await env.VELOCITY_PROGRESS.get(taskDefinitionsKey);
    
    if (!existingData) {
      return createErrorResponse('No task definitions found', 404);
    }
    
    let tasks = {};
    try {
      tasks = JSON.parse(existingData);
    } catch (parseError) {
      return createErrorResponse('Invalid task definitions data', 500);
    }
    
    if (!tasks[validTaskId]) {
      return createErrorResponse('Task not found', 404);
    }
    
    const deletedTask = tasks[validTaskId];
    delete tasks[validTaskId];
    
    // Save updated task definitions
    await env.VELOCITY_PROGRESS.put(taskDefinitionsKey, JSON.stringify(tasks));
    
    const responseData = {
      deletedTaskId: validTaskId,
      deletedTask
    };
    
    return createResponse(responseData, true, 'Task definition deleted successfully');
    
  } catch (error) {
    console.error('Task deletion error:', error);
    
    if (error.message === 'Authentication required' || error.message === 'Admin privileges required') {
      return createErrorResponse('Admin access required', 403);
    }
    
    return createErrorResponse('Failed to delete task definition', 500);
  }
}

// Helper function to generate default task definitions
function generateDefaultTaskDefinitions() {
  const weeks = [
    {
      title: 'Foundation Setup',
      category: 'Infrastructure',
      tasks: [
        'Install Windows Server 2012 R2',
        'Configure Domain Controller',
        'Create Organizational Units',
        'Add Domain Users',
        'Configure DNS Services',
        'Setup DHCP Server',
        'Join Client Machine to Domain',
        'Test Domain Authentication',
        'Configure Group Policy Objects',
        'Create Security Groups',
        'Configure File Shares',
        'Verify Network Services'
      ]
    },
    {
      title: 'Exchange On-Premises',
      category: 'Email Infrastructure', 
      tasks: [
        'Install Exchange Server 2016',
        'Configure Exchange Organization',
        'Create User Mailboxes',
        'Setup Distribution Groups',
        'Configure Public Folders',
        'Setup Outlook Web Access',
        'Configure SMTP Connectors',
        'Setup Message Routing',
        'Configure Anti-Spam Filtering',
        'Test Internal Mail Flow'
      ]
    },
    {
      title: 'Microsoft 365 Setup',
      category: 'Cloud Services',
      tasks: [
        'Create Microsoft 365 Tenant',
        'Configure Custom Domain',
        'Setup Exchange Online',
        'Create Cloud User Accounts',
        'Configure User Licensing',
        'Setup Microsoft Teams',
        'Configure SharePoint Online',
        'Setup OneDrive for Business',
        'Configure Compliance Policies',
        'Test Cloud Services'
      ]
    },
    {
      title: 'Hybrid Configuration',
      category: 'Integration',
      tasks: [
        'Install Azure AD Connect',
        'Configure Directory Synchronization',
        'Setup Exchange Hybrid Configuration',
        'Configure Hybrid Mail Flow',
        'Test Hybrid Connectivity',
        'Migrate Test Mailbox',
        'Configure Hybrid Features',
        'Setup Single Sign-On',
        'Test End-User Experience',
        'Document Final Configuration'
      ]
    }
  ];

  const taskDefinitions = {};
  
  weeks.forEach((week, weekIndex) => {
    week.tasks.forEach((taskTitle, taskIndex) => {
      const taskId = `week${weekIndex + 1}-task${taskIndex + 1}`;
      
      taskDefinitions[taskId] = {
        title: taskTitle,
        description: `<div class="task-overview">
          <h3>${taskTitle}</h3>
          <p>Complete this task as part of Week ${weekIndex + 1}: ${week.title}</p>
          
          <div class="subtask-container">
            <h4>Steps to Complete:</h4>
            <div class="subtask-item">
              <input type="checkbox" class="subtask-checkbox" data-step="step1" id="${taskId}-step1">
              <label for="${taskId}-step1">Review task requirements and prerequisites</label>
            </div>
            <div class="subtask-item">
              <input type="checkbox" class="subtask-checkbox" data-step="step2" id="${taskId}-step2">
              <label for="${taskId}-step2">Follow implementation guidelines</label>
            </div>
            <div class="subtask-item">
              <input type="checkbox" class="subtask-checkbox" data-step="step3" id="${taskId}-step3">
              <label for="${taskId}-step3">Test and verify configuration</label>
            </div>
            <div class="subtask-item">
              <input type="checkbox" class="subtask-checkbox" data-step="step4" id="${taskId}-step4">
              <label for="${taskId}-step4">Document the completed configuration</label>
            </div>
          </div>
        </div>`,
        category: week.category,
        week: weekIndex + 1,
        estimatedTime: '30-60 minutes',
        difficulty: 'intermediate',
        prerequisites: weekIndex > 0 ? [`week${weekIndex}-task${week.tasks.length}`] : [],
        createdAt: new Date().toISOString()
      };
    });
  });
  
  return taskDefinitions;
}

// Helper function to validate task definition
function validateTaskDefinition(task, taskId) {
  const errors = [];
  const validated = {};
  
  // Validate title
  if (!task.title || typeof task.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else {
    validated.title = sanitizeString(task.title, 200);
  }
  
  // Validate description
  if (!task.description || typeof task.description !== 'string') {
    errors.push('Description is required and must be a string');
  } else {
    validated.description = task.description.trim();
  }
  
  // Validate category
  validated.category = typeof task.category === 'string' ? sanitizeString(task.category, 100) : 'General';
  
  // Validate week
  const weekMatch = taskId.match(/week(\d+)/);
  validated.week = weekMatch ? parseInt(weekMatch[1]) : 1;
  
  // Optional fields with defaults
  validated.estimatedTime = typeof task.estimatedTime === 'string' ? sanitizeString(task.estimatedTime, 50) : '30-60 minutes';
  validated.difficulty = ['easy', 'intermediate', 'hard'].includes(task.difficulty) ? task.difficulty : 'intermediate';
  validated.prerequisites = Array.isArray(task.prerequisites) ? task.prerequisites.filter(validateTaskId) : [];
  
  // Timestamps
  validated.createdAt = task.createdAt || new Date().toISOString();
  validated.lastModified = new Date().toISOString();
  
  return {
    isValid: errors.length === 0,
    task: validated,
    errors
  };
}

// Helper function to calculate task statistics
function calculateTaskStatistics(tasks, userProgress = {}) {
  const stats = {
    total: Object.keys(tasks).length,
    byWeek: { week1: 0, week2: 0, week3: 0, week4: 0 },
    byCategory: {},
    byDifficulty: { easy: 0, intermediate: 0, hard: 0 },
    completed: 0,
    completionRate: 0
  };
  
  Object.keys(tasks).forEach(taskId => {
    const task = tasks[taskId];
    
    // Count by week
    if (task.week && stats.byWeek[`week${task.week}`] !== undefined) {
      stats.byWeek[`week${task.week}`]++;
    }
    
    // Count by category
    const category = task.category || 'General';
    stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    
    // Count by difficulty
    const difficulty = task.difficulty || 'intermediate';
    if (stats.byDifficulty[difficulty] !== undefined) {
      stats.byDifficulty[difficulty]++;
    }
    
    // Count completed tasks
    if (userProgress[taskId] && userProgress[taskId].completed) {
      stats.completed++;
    }
  });
  
  // Calculate completion rate
  stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  return stats;
}