/* ===================================================================
   Velocity Lab - Main Application Logic
   Coordinates all systems and handles application lifecycle
   =================================================================== */

// Global application state
const appState = {
    user: null,
    sessionToken: null,
    progress: {},
    authenticated: false,
    labHistory: [],
    tasks: [],
    categories: [],
    currentCategory: null,
    currentView: 'categories', // 'categories', 'lab', 'tutorial'
    isWelcomeShown: false,
    shownNotifications: new Set()
};

// API configuration
const API_BASE = '/api';

// Training categories configuration - HYBRID APPROACH
const TRAINING_CATEGORIES = {
    'exchange-lab': {
        id: 'exchange-lab',
        title: 'Exchange Hybrid LAB',
        type: 'lab', // Trackable progress
        description: 'The tasks set out in the Lab are structured to help you get a fundamental understanding of Concepts Like Windows Domains, DNS, SSL Certs, Office 365 Tenant setup, basic connectivity, AD Identity and cloud identity and the relationship between them. Exchange is a perfect candidate for a Lab like this, since it touches on ALL of these aspects, yet its far simpler and easier to setup that SharePoint as an example.... Exchange is also still a very relevant product in the market, and over the years has probably been implemented millions of times world wide, so there are lots and LOTS of resources online on how to get all of these systems working, and many smart people sharing decades of in depth knowledge... yes this is a Lab, but these core components are REAL systems that all of our customers use to different degrees, some use one or two of these building blocks, and others use more or ALL of them. Understanding how this all fits together will make you a smarter stronger IT worker.',
        courses: [
            'Week 1: Foundation & Domain Setup',
            'Week 2: Infrastructure & Updates', 
            'Week 3: Exchange & Mail Flow',
            'Week 4: Hybrid & External Access'
        ]
    },
    'networking': {
        id: 'networking',
        title: 'Networking Guides',
        type: 'tutorial', // Informational only
        courses: [
            'Setting up Zabbix monitoring server',
            'Monitoring with Zabbix advanced features',
            'Adding new hosts to Zabbix',
            'Cisco ISR voice router configuration',
            'Cisco monitored interfaces setup',
            'PRTG 100 sensors free setup',
            'DNS server configuration and management',
            'Creating network diagrams in Visio/draw.io',
            'Cisco backup automation via SSH/Telnet',
            'Grandstream PBX setup and configuration',
            'Grandstream RADIUS authentication for corporate WiFi',
            'PuTTY configuration backup with syntax highlighting'
        ]
    },
    'azure': {
        id: 'azure',
        title: 'Microsoft Azure Guides',
        type: 'tutorial',
        courses: [
            'Microsoft Defender for Servers deployment',
            'Microsoft Defender for Cloud configuration',
            'Microsoft Intune device management setup',
            'Microsoft Sentinel SIEM configuration',
            'Azure Firewall Standard vs Premium comparison',
            'Log Analytics workspace setup and queries',
            'Azure VM backup and restore procedures',
            'Azure Site Recovery disaster recovery',
            'Azure VPN setup: site-to-site vs point-to-site'
        ]
    },
    'microsoft365': {
        id: 'microsoft365',
        title: 'Microsoft 365 Guides',
        type: 'tutorial',
        courses: [
            'Creating new M365 tenant for customers',
            'Tenant migration and merger procedures',
            'Send-as permissions configuration in 365',
            'SharePoint Online landing page creation',
            'Power Automate: shared mailbox to SharePoint flow',
            'Exchange Online administration best practices'
        ]
    },
    'firewalls': {
        id: 'firewalls',
        title: 'Firewall Configuration Guides',
        type: 'tutorial',
        courses: [
            'Sophos firewall initial setup and configuration',
            'FortiGate firewall policy creation and management',
            'FortiGate SD-WAN zone and member configuration',
            'Custom IPsec VPN tunnel setup on FortiGate',
            'SSL VPN integration with Azure Enterprise apps',
            'FortiGate LDAP authentication configuration',
            'Static routing configuration and troubleshooting',
            'FortiGate setup from scratch - complete guide',
            'DDNS configuration for LTE WAN sites',
            'CLI debugging and diagnostics on FortiGate',
            'Advanced CLI commands: set source and exec options'
        ]
    },
    'backup': {
        id: 'backup',
        title: 'Backup & Recovery Guides',
        type: 'tutorial',
        courses: [
            'Veeam Backup & Replication setup and configuration',
            'Backup monitoring with Backup Radar platform',
            'Block64 reporting setup and automation'
        ]
    },
    'linux': {
        id: 'linux',
        title: 'Linux Administration Guides',
        type: 'tutorial',
        courses: [
            'Linux basics and system administration',
            'Server configuration and service management',
            'Shell scripting and task automation',
            'System monitoring and log analysis',
            'Package management across distributions',
            'Security hardening and best practices'
        ]
    },
    'tools': {
        id: 'tools',
        title: 'MSP Tools Guides',
        type: 'tutorial',
        courses: [
            'Atera: remote access via Splashtop integration',
            'Atera: script management and automation',
            'Atera: multi-customer environment management',
            'Atera: alerting system and reporting setup'
        ]
    }
};

// Enhanced notification system with deduplication
const velocityNotifications = {
    notifications: [],
    
    success(message) {
        console.log('✅ Success:', message);
        this.show(message, 'success');
    },
    
    error(message) {
        console.log('❌ Error:', message);
        this.show(message, 'error');
    },
    
    info(message) {
        console.log('ℹ️ Info:', message);
        this.show(message, 'info');
    },
    
    show(message, type) {
        const notificationId = `${type}:${message}`;
        
        if (appState.shownNotifications.has(notificationId)) {
            console.log('🔄 Duplicate notification prevented:', message);
            return;
        }
        
        if (message.includes('Welcome back') || message.includes('Welcome to Velocity Lab')) {
            if (appState.isWelcomeShown) {
                console.log('🔄 Duplicate welcome notification prevented:', message);
                return;
            }
            appState.isWelcomeShown = true;
        }
        
        appState.shownNotifications.add(notificationId);
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const offset = this.notifications.length * 80;
        notification.style.top = `${90 + offset}px`;
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        setTimeout(() => {
            notification.remove();
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
                this.notifications.forEach((notif, i) => {
                    notif.style.top = `${90 + (i * 80)}px`;
                });
            }
            
            setTimeout(() => {
                appState.shownNotifications.delete(notificationId);
            }, 1000);
        }, 5000);
    },
    
    clearShownNotifications() {
        appState.shownNotifications.clear();
        appState.isWelcomeShown = false;
    }
};

/* ===================================================================
   Task and Progress Management
   =================================================================== */

// Load task definitions and categorize them
function loadTaskDefinitions() {
    if (typeof window !== 'undefined' && window.TASK_DEFINITIONS) {
        appState.tasks = [];
        Object.keys(window.TASK_DEFINITIONS).forEach(taskId => {
            const task = window.TASK_DEFINITIONS[taskId];
            appState.tasks.push({
                id: taskId,
                title: task.title,
                description: task.description || 'No description available',
                week: parseInt(taskId.split('-')[0].replace('week', '')) || 1,
                category: 'exchange-lab' // All task-definitions.js tasks belong to Exchange LAB
            });
        });
        console.log('📋 Exchange LAB task definitions loaded:', appState.tasks.length, 'tasks');
    } else {
        console.warn('⚠️ Task definitions not loaded from task-definitions.js - Exchange LAB will have fallback content');
        appState.tasks = generateFallbackTasks();
    }
    
    // Initialize categories
    appState.categories = Object.values(TRAINING_CATEGORIES);
}

function generateFallbackTasks() {
    // Generate basic Exchange lab tasks as fallback
    const weeks = [
        {
            title: 'Foundation & Domain Setup',
            description: '2012 Server promoted to DC, VM joined to domain, network shares with security groups',
            tasks: [
                'Install Windows Server 2012 R2',
                'Configure Domain Controller',
                'Create Organizational Units',
                'Add Domain Users'
            ]
        },
        {
            title: 'Infrastructure & Updates',
            description: 'Install 2nd server, setup WSUS, configure time servers',
            tasks: [
                'Install Exchange Server 2016',
                'Configure Exchange Organization',
                'Create Mailboxes',
                'Setup Distribution Groups'
            ]
        },
        {
            title: 'Exchange & Mail Flow',
            description: 'Upgrade to Server 2016, install Exchange, create mailboxes, internal mail flow',
            tasks: [
                'Create M365 Tenant',
                'Configure Domain',
                'Setup Exchange Online',
                'Create Cloud Users'
            ]
        },
        {
            title: 'Hybrid & External Access',
            description: 'Publish mail externally, setup Office 365 hybrid environment',
            tasks: [
                'Install Azure AD Connect',
                'Configure Directory Sync',
                'Setup Hybrid Exchange',
                'Configure Mail Flow'
            ]
        }
    ];

    const tasks = [];
    weeks.forEach((week, weekIndex) => {
        week.tasks.forEach((task, taskIndex) => {
            tasks.push({
                id: `week${weekIndex + 1}-task${taskIndex + 1}`,
                week: weekIndex + 1,
                title: task,
                description: `Complete ${task} as part of Week ${weekIndex + 1}`,
                category: 'exchange-lab'
            });
        });
    });

    return tasks;
}

// Progress management (enhanced with offline handling)
async function loadUserProgress() {
    try {
        if (!appState.sessionToken) {
            console.warn('⚠️ No session token available');
            appState.progress = velocityUtils.getStorage('velocity_progress', {});
            velocityUI.updateProgressDisplay();
            return;
        }

        console.log('📊 Loading progress from backend...');
        const response = await velocityAPI.getUserProgress(appState.sessionToken);
        
        if (response.success) {
            appState.progress = response.data || {};
            console.log('✅ Progress loaded from backend');
        } else {
            console.warn('⚠️ API returned error:', response.message);
            appState.progress = {};
        }
    } catch (error) {
        if (velocityAPI.isBackendUnavailable(error) || velocityAPI.isOfflineError(error)) {
            console.warn('💾 Using localStorage fallback for progress');
            appState.progress = velocityUtils.getStorage('velocity_progress', {});
        } else {
            console.warn('⚠️ Progress API unavailable:', error);
            appState.progress = velocityUtils.getStorage('velocity_progress', {});
        }
    }
    
    velocityUI.updateProgressDisplay();
    checkLabCompletion();
}

async function saveUserProgress(taskId, taskProgress) {
    try {
        if (!appState.sessionToken) {
            console.warn('⚠️ No session token, saving to localStorage');
            velocityUtils.setStorage('velocity_progress', appState.progress);
            return;
        }

        console.log(`💾 Saving progress for task ${taskId} to backend...`);
        const response = await velocityAPI.saveUserProgress(appState.sessionToken, {
            taskId: taskId,
            progress: taskProgress
        });
        
        if (response.success) {
            console.log('✅ Progress saved to backend');
        } else {
            console.warn('⚠️ Failed to save progress:', response.message);
        }
    } catch (error) {
        if (velocityAPI.isBackendUnavailable(error) || velocityAPI.isOfflineError(error)) {
            console.warn('💾 Saving progress to localStorage fallback');
            velocityUtils.setStorage('velocity_progress', appState.progress);
        } else {
            console.warn('⚠️ Progress save failed, using localStorage:', error);
            velocityUtils.setStorage('velocity_progress', appState.progress);
        }
    }
}

// Lab history management (enhanced with offline handling)
async function loadLabHistory() {
    try {
        if (!appState.sessionToken) {
            console.warn('⚠️ No session token available');
            appState.labHistory = velocityUtils.getStorage('velocity_lab_history', []);
            
            if (appState.labHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const defaultLab = {
                    session: 1,
                    date: today,
                    status: 'started',
                    labId: 'LAB001',
                    startedAt: new Date().toISOString(),
                    completedAt: null,
                    tasksCompleted: 0,
                    totalTasks: 43
                };
                appState.labHistory = [defaultLab];
                velocityUtils.setStorage('velocity_lab_history', appState.labHistory);
            }
            return;
        }

        console.log('📚 Loading lab history from backend...');
        const response = await velocityAPI.getLabHistory(appState.sessionToken);
        
        if (response.success) {
            appState.labHistory = response.data || [];
            console.log('✅ Lab history loaded from backend:', appState.labHistory.length, 'sessions');
            
            if (appState.labHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const defaultLab = {
                    session: 1,
                    date: today,
                    status: 'started',
                    labId: 'LAB001',
                    startedAt: new Date().toISOString(),
                    completedAt: null,
                    tasksCompleted: 0,
                    totalTasks: 43
                };
                appState.labHistory = [defaultLab];
                await saveLabHistory(appState.labHistory);
            }
        } else {
            console.warn('⚠️ API returned error:', response.message);
            appState.labHistory = [];
        }
    } catch (error) {
        if (velocityAPI.isBackendUnavailable(error) || velocityAPI.isOfflineError(error)) {
            console.warn('💾 Using localStorage fallback for lab history');
            appState.labHistory = velocityUtils.getStorage('velocity_lab_history', []);
            
            if (appState.labHistory.length === 0) {
                const today = new Date().toISOString().split('T')[0];
                const defaultLab = {
                    session: 1,
                    date: today,
                    status: 'started',
                    labId: 'LAB001',
                    startedAt: new Date().toISOString(),
                    completedAt: null,
                    tasksCompleted: 0,
                    totalTasks: 43
                };
                appState.labHistory = [defaultLab];
                velocityUtils.setStorage('velocity_lab_history', appState.labHistory);
            }
        } else {
            console.warn('⚠️ Lab history API unavailable:', error);
            appState.labHistory = velocityUtils.getStorage('velocity_lab_history', []);
        }
    }
}

async function saveLabHistory(newSession) {
    try {
        if (!appState.sessionToken) {
            console.warn('⚠️ No session token, saving to localStorage');
            velocityUtils.setStorage('velocity_lab_history', appState.labHistory);
            return;
        }

        console.log('💾 Saving lab history to backend...');
        const response = await velocityAPI.saveLabHistory(appState.sessionToken, Array.isArray(newSession) ? newSession : appState.labHistory);
        
        if (response.success) {
            console.log('✅ Lab history saved to backend');
            await loadLabHistory();
        } else {
            console.warn('⚠️ Failed to save lab history:', response.message);
        }
    } catch (error) {
        if (velocityAPI.isBackendUnavailable(error) || velocityAPI.isOfflineError(error)) {
            console.warn('💾 Saving lab history to localStorage fallback');
            velocityUtils.setStorage('velocity_lab_history', appState.labHistory);
        } else {
            console.warn('⚠️ Lab history save failed, using localStorage:', error);
            velocityUtils.setStorage('velocity_lab_history', appState.labHistory);
        }
    }
}

function checkLabCompletion() {
    if (appState.currentCategory !== 'exchange-lab') return;
    
    const categoryTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
    const totalTasks = categoryTasks.length;
    const completedTasks = categoryTasks.filter(task => 
        appState.progress[task.id] && appState.progress[task.id].completed
    ).length;
    
    if (completedTasks === totalTasks && totalTasks > 0 && appState.labHistory.length > 0) {
        const currentLab = appState.labHistory.find(lab => lab.status === 'started');
        
        if (currentLab && currentLab.status === 'started') {
            const completionEntry = {
                ...currentLab,
                status: 'completed',
                completedAt: new Date().toISOString(),
                tasksCompleted: completedTasks,
                totalTasks: totalTasks
            };
            
            const labIndex = appState.labHistory.findIndex(lab => lab.labId === currentLab.labId);
            if (labIndex >= 0) {
                appState.labHistory[labIndex] = completionEntry;
                saveLabHistory(completionEntry);
                velocityNotifications.success('🎉 Exchange Hybrid LAB completed successfully!');
            }
        }
    }
}

/* ===================================================================
   Global Functions for HTML Event Handlers
   =================================================================== */

// Lab environment management
window.startLabEnvironment = async function() {
    try {
        console.log('🧪 Starting new Exchange Hybrid lab environment...');
        
        const response = await velocityAPI.startLab(appState.sessionToken, {});
        
        if (response.success) {
            console.log('✅ Lab started successfully with backend');
            
            appState.progress = {};
            velocityUI.updateProgressDisplay();
            await loadLabHistory();
            
            if (response.data.previousLabCompleted) {
                velocityNotifications.success(`🎉 Previous lab completed! New ${response.data.labId} started!`);
            } else {
                velocityNotifications.success(`🧪 New Exchange LAB ${response.data.labId} started!`);
            }
        }
        
    } catch (error) {
        console.error('❌ Failed to start lab:', error);
        
        if (velocityAPI.isBackendUnavailable(error)) {
            velocityNotifications.error('Backend API not available. Please deploy the functions first.');
        } else if (velocityAPI.isOfflineError(error)) {
            velocityNotifications.error('You are offline. Please check your internet connection.');
        } else {
            velocityNotifications.error('Failed to start lab environment. Please try again.');
        }
    }
};

// Task management
window.toggleTaskCompletion = async function(taskId) {
    try {
        if (!appState.progress[taskId]) {
            appState.progress[taskId] = {
                completed: false,
                subtasks: {},
                notes: ''
            };
        }
        
        const isCompleted = appState.progress[taskId].completed;
        
        appState.progress[taskId].completed = !isCompleted;
        appState.progress[taskId].completedAt = !isCompleted ? new Date().toISOString() : null;
        appState.progress[taskId].lastUpdated = new Date().toISOString();
        
        const taskCheckbox = document.querySelector(`input[onchange="toggleTaskCompletion('${taskId}')"]`);
        const taskItem = taskCheckbox?.closest('.task-item');
        
        if (taskCheckbox && taskItem) {
            taskCheckbox.checked = !isCompleted;
            if (!isCompleted) {
                taskItem.classList.add('completed');
            } else {
                taskItem.classList.remove('completed');
            }
        }
        
        await saveUserProgress(taskId, appState.progress[taskId]);
        
        velocityUI.updateProgressDisplay();
        checkLabCompletion();
        
    } catch (error) {
        console.error('❌ Failed to toggle task completion:', error);
        velocityNotifications.error('Failed to save progress. Please try again.');
    }
};

window.toggleWeekExpansion = function(weekNum, event) {
    if (event && event.target) {
        const taskItem = event.target.closest('.task-item');
        const taskList = event.target.closest('.task-list');
        
        if (taskItem || taskList) {
            return;
        }
    }
    
    const weekCards = document.querySelectorAll('.week-card');
    const targetCard = weekCards[weekNum - 1];
    
    if (targetCard) {
        targetCard.classList.toggle('expanded');
    }
};

// Task detail management
window.showTaskDetail = function(taskId) {
    const taskDefinition = window.TASK_DEFINITIONS && window.TASK_DEFINITIONS[taskId];
    
    if (taskDefinition) {
        document.getElementById('taskDetailTitle').textContent = taskDefinition.title;
        
        if (!appState.progress[taskId]) {
            appState.progress[taskId] = {
                completed: false,
                subtasks: {},
                notes: ''
            };
        }
        
        const taskProgress = appState.progress[taskId];
        const hasNotes = taskProgress.notes && taskProgress.notes.trim().length > 0;
        
        const notesSection = `
            <div class="notes-container">
                <div class="notes-header">
                    <h4 class="notes-title">Your Notes</h4>
                    <button class="save-note-btn" id="saveNoteBtn_${taskId}" onclick="saveTaskNotes('${taskId}')">
                        Save Note
                    </button>
                </div>
                <textarea 
                    id="taskNotes_${taskId}" 
                    class="notes-textarea ${hasNotes ? 'has-content' : ''}"
                    placeholder="Add your notes, observations, or troubleshooting steps here..."
                    ${hasNotes ? 'title="Click to edit your notes"' : ''}
                >${taskProgress.notes || ''}</textarea>
                <div class="notes-tip">
                    Tip: Document any issues, solutions, or key learnings for future reference
                    ${hasNotes ? ' • Click the textarea to edit your saved notes' : ''}
                </div>
            </div>
        `;
        
        document.getElementById('taskDetailContent').innerHTML = taskDefinition.description + notesSection;
        
        // Setup event handlers after content is loaded
        setTimeout(() => {
            setupTaskDetailHandlers(taskId);
        }, 100);
        
        velocityUI.showModal('taskDetailModal');
    } else {
        velocityNotifications.error('Task details not available');
    }
};

function setupTaskDetailHandlers(taskId) {
    // Setup subtask handlers
    const subtaskItems = document.querySelectorAll('.subtask-item');
    subtaskItems.forEach(item => {
        const checkbox = item.querySelector('.subtask-checkbox');
        const label = item.querySelector('label');
        const step = checkbox ? checkbox.getAttribute('data-step') : null;
        
        if (step && checkbox && label) {
            const taskProgress = appState.progress[taskId];
            if (taskProgress.subtasks && taskProgress.subtasks[step]) {
                checkbox.checked = taskProgress.subtasks[step].completed;
                if (checkbox.checked) {
                    item.classList.add('completed');
                }
            }
            
            const clickHandler = function(e) {
                if (e.target === checkbox) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                checkbox.checked = !checkbox.checked;
                handleSubtaskChange(taskId, step, checkbox.checked);
            };
            
            item.addEventListener('click', clickHandler);
            label.addEventListener('click', clickHandler);
            
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                handleSubtaskChange(taskId, step, this.checked);
            });
        }
    });

    // Setup notes handlers
    const notesTextarea = document.getElementById(`taskNotes_${taskId}`);
    const saveBtn = document.getElementById(`saveNoteBtn_${taskId}`);
    
    if (notesTextarea && saveBtn) {
        let saveTimeout;
        notesTextarea.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveBtn.textContent = 'Save Note';
            saveBtn.classList.remove('saved');
            
            saveTimeout = setTimeout(() => {
                saveTaskNotes(taskId);
            }, 2000);
        });

        const hasNotes = notesTextarea.value.trim().length > 0;
        if (hasNotes) {
            notesTextarea.addEventListener('click', function() {
                this.focus();
                this.setSelectionRange(this.value.length, this.value.length);
            });
        }
    }
}

function handleSubtaskChange(taskId, step, isCompleted) {
    if (!appState.progress[taskId].subtasks) {
        appState.progress[taskId].subtasks = {};
    }
    
    appState.progress[taskId].subtasks[step] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
    };
    
    const checkbox = document.querySelector(`[data-step="${step}"]`);
    const subtaskItem = checkbox?.closest('.subtask-item');
    
    if (subtaskItem) {
        if (isCompleted) {
            subtaskItem.classList.add('completed');
        } else {
            subtaskItem.classList.remove('completed');
        }
    }
    
    // Check if all subtasks are completed
    const allSubtaskCheckboxes = document.querySelectorAll('.subtask-checkbox');
    const completedSubtasks = Array.from(allSubtaskCheckboxes).filter(cb => cb.checked);
    
    if (completedSubtasks.length === allSubtaskCheckboxes.length && allSubtaskCheckboxes.length > 0) {
        appState.progress[taskId].completed = true;
        appState.progress[taskId].completedAt = new Date().toISOString();
        
        velocityNotifications.success(`✅ Task completed: ${window.TASK_DEFINITIONS[taskId].title}`);
        
        const mainTaskCheckbox = document.querySelector(`input[onchange="toggleTaskCompletion('${taskId}')"]`);
        if (mainTaskCheckbox) {
            mainTaskCheckbox.checked = true;
            const taskItem = mainTaskCheckbox.closest('.task-item');
            if (taskItem) {
                taskItem.classList.add('completed');
            }
        }
        
        velocityUI.updateProgressDisplay();
    } else if (appState.progress[taskId].completed && completedSubtasks.length < allSubtaskCheckboxes.length) {
        appState.progress[taskId].completed = false;
        
        const mainTaskCheckbox = document.querySelector(`input[onchange="toggleTaskCompletion('${taskId}')"]`);
        if (mainTaskCheckbox) {
            mainTaskCheckbox.checked = false;
            const taskItem = mainTaskCheckbox.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('completed');
            }
        }
        
        velocityUI.updateProgressDisplay();
    }
    
    saveUserProgress(taskId, appState.progress[taskId]);
}

window.saveTaskNotes = function(taskId) {
    const notesTextarea = document.getElementById(`taskNotes_${taskId}`);
    const saveBtn = document.getElementById(`saveNoteBtn_${taskId}`);
    
    if (notesTextarea && appState.progress[taskId]) {
        appState.progress[taskId].notes = notesTextarea.value;
        appState.progress[taskId].lastUpdated = new Date().toISOString();
        saveUserProgress(taskId, appState.progress[taskId]);
        
        if (saveBtn) {
            saveBtn.textContent = 'Saved!';
            saveBtn.classList.add('saved');
            
            setTimeout(() => {
                saveBtn.textContent = 'Save Note';
                saveBtn.classList.remove('saved');
            }, 2000);
        }
        
        const hasContent = notesTextarea.value.trim().length > 0;
        if (hasContent) {
            notesTextarea.classList.add('has-content');
            notesTextarea.title = 'Click to edit your notes';
        } else {
            notesTextarea.classList.remove('has-content');
            notesTextarea.title = '';
        }
        
        console.log('📝 Notes saved for task:', taskId);
        
        if (hasContent) {
            velocityNotifications.success('📝 Notes saved successfully!');
        } else {
            velocityNotifications.info('🗑️ Notes cleared');
        }
    }
};

// Tutorial detail display
window.showTutorialDetail = function(categoryId, courseIndex) {
    const category = TRAINING_CATEGORIES[categoryId];
    const courseName = category.courses[courseIndex];
    
    // Get tutorial content from loaded tutorial files
    let tutorialContent = null;
    
    // Try to get content from tutorial modules
    switch(categoryId) {
        case 'networking':
            tutorialContent = window.NETWORKING_TUTORIALS && window.NETWORKING_TUTORIALS[Object.keys(window.NETWORKING_TUTORIALS)[courseIndex]];
            break;
        case 'azure':
            tutorialContent = window.AZURE_TUTORIALS && window.AZURE_TUTORIALS[Object.keys(window.AZURE_TUTORIALS)[courseIndex]];
            break;
        case 'microsoft365':
            tutorialContent = window.MICROSOFT365_TUTORIALS && window.MICROSOFT365_TUTORIALS[Object.keys(window.MICROSOFT365_TUTORIALS)[courseIndex]];
            break;
        case 'firewalls':
            tutorialContent = window.FIREWALL_TUTORIALS && window.FIREWALL_TUTORIALS[Object.keys(window.FIREWALL_TUTORIALS)[courseIndex]];
            break;
        case 'backup':
            tutorialContent = window.BACKUP_TUTORIALS && window.BACKUP_TUTORIALS[Object.keys(window.BACKUP_TUTORIALS)[courseIndex]];
            break;
        case 'linux':
            tutorialContent = window.LINUX_TUTORIALS && window.LINUX_TUTORIALS[Object.keys(window.LINUX_TUTORIALS)[courseIndex]];
            break;
        case 'tools':
            tutorialContent = window.TOOLS_TUTORIALS && window.TOOLS_TUTORIALS[Object.keys(window.TOOLS_TUTORIALS)[courseIndex]];
            break;
    }
    
    // Set modal content
    document.getElementById('tutorialDetailTitle').textContent = courseName;
    
    if (tutorialContent && tutorialContent.content) {
        document.getElementById('tutorialDetailContent').innerHTML = tutorialContent.content;
    } else {
        document.getElementById('tutorialDetailContent').innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                <h3>Tutorial Available</h3>
                <p>This tutorial contains step-by-step instructions for:</p>
                <p><strong>${courseName}</strong></p>
                <p style="margin-top: 2rem; font-size: 0.9rem;">
                    Tutorial content loaded from <code>/assets/tutorials/${categoryId}.js</code>
                </p>
            </div>
        `;
    }
    
    velocityUI.showModal('tutorialDetailModal');
};

/* ===================================================================
   Application Initialization
   =================================================================== */

// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Velocity Lab - Starting application...');
    
    try {
        // Initialize core systems
        loadTaskDefinitions();
        
        // Initialize UI system
        velocityUI.init();
        
        // Initialize authentication
        velocityAuth.init();
        
        // Check for existing session
        velocityAuth.checkExistingSession();
        
        // Clean up mobile menu state
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburger = document.querySelector('.hamburger');
        if (mobileMenu) {
            mobileMenu.classList.remove('show', 'active');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        
        // Handle window resize
        window.addEventListener('resize', function() {
            velocityUI.closeMobileMenu();
        });
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        velocityNotifications.error('Application failed to start. Please refresh the page.');
    }
});

// Global error handling
window.addEventListener('error', function(e) {
    console.error('💥 Global error:', e.error, e.filename, e.lineno);
    velocityNotifications.error('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('💥 Unhandled promise rejection:', e.reason);
    velocityNotifications.error('A network error occurred. Please check your connection.');
});

// Performance monitoring
window.addEventListener('load', function() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('⚡ Page load time:', loadTime + 'ms');
    }
});

// Offline detection system
const offlineSystem = {
    init() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        this.updateStatus();
    },

    handleOnline() {
        this.updateStatus();
        velocityNotifications.success('🌐 Connection restored!');
    },

    handleOffline() {
        this.updateStatus();
        velocityNotifications.error('📡 You are offline - some features may be limited');
    },

    updateStatus() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            if (navigator.onLine) {
                indicator.style.display = 'none';
            } else {
                indicator.style.display = 'block';
            }
        }
    }
};

// Initialize offline detection
offlineSystem.init();

// Make global objects available
window.appState = appState;
window.velocityNotifications = velocityNotifications;
window.TRAINING_CATEGORIES = TRAINING_CATEGORIES;