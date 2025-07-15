/* ===================================================================
   Velocity Lab - Main Application Logic
   Core functionality for MSP training platform
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

/* ===================================================================
   Task Management & Progress System
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
        console.log('Exchange LAB task definitions loaded:', appState.tasks.length, 'tasks');
    } else {
        console.warn('Task definitions not loaded from task-definitions.js - Exchange LAB will have fallback content');
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

// Progress management
async function loadUserProgress() {
    try {
        if (!appState.sessionToken) {
            console.warn('No session token available');
            appState.progress = JSON.parse(localStorage.getItem('velocity_progress') || '{}');
            updateProgressDisplay();
            return;
        }

        console.log('Loading progress from backend APIs...');
        const response = await velocityAPI.call('/api/user/progress', {
            headers: {
                'Authorization': `Bearer ${appState.sessionToken}`
            }
        });
        
        if (response.success) {
            appState.progress = response.data || {};
            console.log('Progress loaded from backend APIs');
        } else {
            console.warn('API returned error:', response.message);
            appState.progress = {};
        }
    } catch (error) {
        if (error.message === 'BACKEND_NOT_AVAILABLE' || error.message === 'OFFLINE') {
            console.warn('Using localStorage fallback for progress');
            appState.progress = JSON.parse(localStorage.getItem('velocity_progress') || '{}');
        } else {
            console.warn('Progress API unavailable:', error);
            appState.progress = JSON.parse(localStorage.getItem('velocity_progress') || '{}');
        }
    }
    
    updateProgressDisplay();
    checkLabCompletion();
}

async function saveUserProgress(taskId, taskProgress) {
    try {
        if (!appState.sessionToken) {
            console.warn('No session token, saving to localStorage');
            localStorage.setItem('velocity_progress', JSON.stringify(appState.progress));
            return;
        }

        console.log(`Saving progress for task ${taskId} to backend APIs...`);
        const response = await velocityAPI.call('/api/user/progress', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appState.sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskId: taskId,
                progress: taskProgress
            })
        });
        
        if (response.success) {
            console.log('Progress saved to backend APIs');
        } else {
            console.warn('Failed to save progress:', response.message);
        }
    } catch (error) {
        if (error.message === 'BACKEND_NOT_AVAILABLE' || error.message === 'OFFLINE') {
            console.warn('Saving progress to localStorage fallback');
            localStorage.setItem('velocity_progress', JSON.stringify(appState.progress));
        } else {
            console.warn('Progress save failed, using localStorage:', error);
            localStorage.setItem('velocity_progress', JSON.stringify(appState.progress));
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
                velocityNotifications.success('Exchange Hybrid LAB completed successfully!');
            }
        }
    }
}

/* ===================================================================
   Lab History Management
   =================================================================== */

async function loadLabHistory() {
    try {
        if (!appState.sessionToken) {
            console.warn('No session token available');
            appState.labHistory = JSON.parse(localStorage.getItem('velocity_lab_history') || '[]');
            
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
                localStorage.setItem('velocity_lab_history', JSON.stringify(appState.labHistory));
            }
            return;
        }

        console.log('Loading lab history from backend APIs...');
        const response = await velocityAPI.call('/api/user/lab-history', {
            headers: {
                'Authorization': `Bearer ${appState.sessionToken}`
            }
        });
        
        if (response.success) {
            appState.labHistory = response.data || [];
            console.log('Lab history loaded from backend APIs:', appState.labHistory.length, 'sessions');
            
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
            console.warn('API returned error:', response.message);
            appState.labHistory = [];
        }
    } catch (error) {
        if (error.message === 'BACKEND_NOT_AVAILABLE' || error.message === 'OFFLINE') {
            console.warn('Using localStorage fallback for lab history');
            appState.labHistory = JSON.parse(localStorage.getItem('velocity_lab_history') || '[]');
            
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
                localStorage.setItem('velocity_lab_history', JSON.stringify(appState.labHistory));
            }
        } else {
            console.warn('Lab history API unavailable:', error);
            appState.labHistory = JSON.parse(localStorage.getItem('velocity_lab_history') || '[]');
        }
    }
}

async function saveLabHistory(newSession) {
    try {
        if (!appState.sessionToken) {
            console.warn('No session token, saving to localStorage');
            localStorage.setItem('velocity_lab_history', JSON.stringify(appState.labHistory));
            return;
        }

        console.log('Saving lab history to backend APIs...');
        const response = await velocityAPI.call('/api/user/lab-history', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appState.sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Array.isArray(newSession) ? newSession : appState.labHistory)
        });
        
        if (response.success) {
            console.log('Lab history saved to backend APIs');
            await loadLabHistory();
        } else {
            console.warn('Failed to save lab history:', response.message);
        }
    } catch (error) {
        if (error.message === 'BACKEND_NOT_AVAILABLE' || error.message === 'OFFLINE') {
            console.warn('Saving lab history to localStorage fallback');
            localStorage.setItem('velocity_lab_history', JSON.stringify(appState.labHistory));
        } else {
            console.warn('Lab history save failed, using localStorage:', error);
            localStorage.setItem('velocity_lab_history', JSON.stringify(appState.labHistory));
        }
    }
}

/* ===================================================================
   View Management System
   =================================================================== */

// Category management functions
function showCategoryView(categoryId) {
    const category = TRAINING_CATEGORIES[categoryId];
    
    if (!category) {
        velocityNotifications.error('Category not found');
        return;
    }
    
    if (category.type === 'lab') {
        // Show Exchange LAB interface with progress tracking
        appState.currentCategory = categoryId;
        appState.currentView = 'lab';
        
        // Show course view with progress tracking
        velocityUtils.getId('categoriesContainer').classList.add('hidden');
        velocityUtils.getId('courseView').classList.remove('hidden');
        velocityUtils.getId('tutorialView').classList.add('hidden');
        
        // Generate week cards for Exchange LAB
        generateWeekCards();
        updateProgressDisplay();
        
    } else if (category.type === 'tutorial') {
        // Show tutorial interface (no progress tracking)
        showTutorialView(categoryId);
    }
}

function showTutorialView(categoryId) {
    const category = TRAINING_CATEGORIES[categoryId];
    
    appState.currentCategory = categoryId;
    appState.currentView = 'tutorial';
    
    // Hide categories and course view, show tutorial view
    velocityUtils.getId('categoriesContainer').classList.add('hidden');
    velocityUtils.getId('courseView').classList.add('hidden');
    velocityUtils.getId('tutorialView').classList.remove('hidden');
    
    // Generate tutorial content
    generateTutorialContent(categoryId);
}

function showCategoriesView() {
    appState.currentCategory = null;
    appState.currentView = 'categories';
    
    // Show categories, hide other views
    velocityUtils.getId('categoriesContainer').classList.remove('hidden');
    velocityUtils.getId('courseView').classList.add('hidden');
    velocityUtils.getId('tutorialView').classList.add('hidden');
    
    // Generate category cards
    generateCategoryCards();
}

/* ===================================================================
   Content Generation Functions
   =================================================================== */

function generateCategoryCards() {
    const container = velocityUtils.getId('categoriesContainer');
    if (!container) return;

    // Get Exchange Lab category
    const exchangeLabCategory = TRAINING_CATEGORIES['exchange-lab'];
    
    // Get tutorial categories
    const tutorialCategories = Object.values(TRAINING_CATEGORIES).filter(cat => cat.type === 'tutorial');

    // Generate progress info for Exchange Lab
    const categoryTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
    const completedTasks = categoryTasks.filter(task => 
        appState.progress[task.id] && appState.progress[task.id].completed
    ).length;
    const totalTasks = categoryTasks.length || 43;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Create Exchange Lab container
    const exchangeLabHtml = `
        <div class="exchange-lab-container" onclick="showCategoryView('exchange-lab')">
            <div class="exchange-lab-header">
                <div class="exchange-lab-image"></div>
                <h2 class="exchange-lab-title">${exchangeLabCategory.title}</h2>
            </div>
            <div class="exchange-lab-description">${exchangeLabCategory.description}</div>
            <div class="exchange-lab-stats">
                <div class="exchange-lab-count">${exchangeLabCategory.courses.length} weeks</div>
                <div class="exchange-lab-progress">${progressPercentage}% complete</div>
            </div>
        </div>
    `;

    // Create tutorials grid
    const tutorialsHtml = `
        <div class="tutorials-grid">
            ${tutorialCategories.map(category => `
                <div class="tutorial-category-card" onclick="showCategoryView('${category.id}')">
                    <div class="tutorial-header">
                        <div class="tutorial-image ${category.id}"></div>
                        <h3 class="tutorial-title">${category.title}</h3>
                    </div>
                    <div class="tutorial-count">${category.courses.length} guides</div>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = exchangeLabHtml + tutorialsHtml;
}

function generateWeekCards() {
    const container = velocityUtils.getId('weeksContainer');
    if (!container) return;

    if (appState.currentCategory !== 'exchange-lab') {
        container.innerHTML = '<p>Week cards are only available for the Exchange Hybrid LAB.</p>';
        return;
    }

    const weekGroups = groupTasksByWeek();
    
    container.innerHTML = Object.keys(weekGroups).map(weekNum => {
        const week = weekGroups[weekNum];
        const completedTasks = week.tasks.filter(task => 
            appState.progress[task.id] && appState.progress[task.id].completed
        ).length;
        const progressPercentage = Math.round((completedTasks / week.tasks.length) * 100);
        
        return `
            <div class="week-card" onclick="toggleWeekExpansion(${weekNum}, event)">
                <div class="week-header">
                    <div>
                        <div class="week-title">${week.title}</div>
                        <div class="week-tasks">${completedTasks}/${week.tasks.length} tasks</div>
                    </div>
                    <div class="expand-icon">▼</div>
                </div>
                <div class="week-progress">
                    <div class="week-progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="week-description">${week.description}</div>
                
                <div class="task-list">
                    ${week.tasks.map(task => {
                        const isCompleted = appState.progress[task.id] && appState.progress[task.id].completed;
                        return `
                            <div class="task-item ${isCompleted ? 'completed' : ''}" onclick="event.stopPropagation()">
                                <input type="checkbox" class="task-checkbox" 
                                       ${isCompleted ? 'checked' : ''} 
                                       onchange="toggleTaskCompletion('${task.id}')"
                                       onclick="event.stopPropagation()">
                                <div class="task-content" onclick="event.stopPropagation(); showTaskDetail('${task.id}')">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-description">Click for details →</div>
                                </div>
                                <button class="task-detail-btn" onclick="event.stopPropagation(); showTaskDetail('${task.id}')">
                                    Details
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function groupTasksByWeek() {
    const weeks = {};
    
    // Define proper week descriptions for Exchange LAB
    const weekDescriptions = {
        1: {
            title: 'Week 1: Foundation & Domain Setup',
            description: '2012 Server promoted to DC, VM joined to domain, network shares with security groups'
        },
        2: {
            title: 'Week 2: Infrastructure & Updates', 
            description: 'Install 2nd server, setup WSUS, configure time servers'
        },
        3: {
            title: 'Week 3: Exchange & Mail Flow',
            description: 'Upgrade to Server 2016, install Exchange, create mailboxes, internal mail flow'
        },
        4: {
            title: 'Week 4: Hybrid & External Access',
            description: 'Publish mail externally, setup Office 365 hybrid environment'
        }
    };
    
    // Filter tasks for Exchange LAB only
    const labTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
    
    labTasks.forEach(task => {
        const weekNum = task.week || 1;
        if (!weeks[weekNum]) {
            const weekInfo = weekDescriptions[weekNum] || {
                title: `Week ${weekNum}: Training`,
                description: `Complete ${labTasks.filter(t => t.week === weekNum).length} tasks in this week`
            };
            
            weeks[weekNum] = {
                title: weekInfo.title,
                description: weekInfo.description,
                tasks: []
            };
        }
        weeks[weekNum].tasks.push(task);
    });
    
    return weeks;
}

// Tutorial content generation
function generateTutorialContent(categoryId) {
    const category = TRAINING_CATEGORIES[categoryId];
    const tutorialView = velocityUtils.getId('tutorialView');
    
    const tutorialHtml = `
        <div class="tutorial-container">
            <div class="tutorial-grid">
                ${category.courses.map((course, index) => `
                    <div class="tutorial-card" onclick="showTutorialDetail('${categoryId}', ${index})">
                        <div class="tutorial-header">
                            <h3>${course}</h3>
                        </div>
                        <div class="tutorial-preview">
                            Click to view comprehensive step-by-step guide with examples and best practices.
                        </div>
                        <div class="tutorial-meta">
                            <span class="tutorial-arrow">→</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="navigation-controls">
                <button class="btn btn-secondary" onclick="showCategoriesView()">← Back to Categories</button>
            </div>
        </div>
    `;
    
    tutorialView.innerHTML = tutorialHtml;
}

function updateProgressDisplay() {
    if (appState.currentCategory !== 'exchange-lab') return;
    
    const categoryTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
    const totalTasks = categoryTasks.length || 43;
    const completedTasks = categoryTasks.filter(task => 
        appState.progress[task.id] && appState.progress[task.id].completed
    ).length;
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percentage / 100) * circumference;
    const progressRing = velocityUtils.getId('progressRing');
    if (progressRing) {
        progressRing.style.strokeDasharray = `${circumference - offset} ${circumference}`;
    }
    
    const progressPercentage = velocityUtils.getId('progressPercentage');
    if (progressPercentage) {
        progressPercentage.textContent = `${percentage}%`;
    }
    
    const courseView = velocityUtils.getId('courseView');
    if (courseView && !courseView.classList.contains('hidden')) {
        generateWeekCards();
    }
    
    if (appState.authenticated) {
        checkLabCompletion();
    }
}

/* ===================================================================
   Session Management
   =================================================================== */

// Check for existing session
function checkExistingSession() {
    const userCookie = velocityUtils.cookies.get('user');
    const sessionCookie = velocityUtils.cookies.get('session');
    
    if (userCookie && sessionCookie) {
        try {
            appState.user = JSON.parse(userCookie);
            appState.sessionToken = sessionCookie;
            appState.authenticated = true;
            
            appState.isWelcomeShown = true;
            
            console.log('Found existing session for:', appState.user.name);
            velocityUI.showDashboard();
            loadUserProgress();
            loadLabHistory();
            velocityTheme.loadTheme();
            
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
            
            velocityUI.updateMobileMenuItems();
        } catch (error) {
            console.error('Session validation failed:', error);
            velocityUtils.cookies.delete('user');
            velocityUtils.cookies.delete('session');
            velocityNotifications.clearShownNotifications();
            velocityUI.showWelcomeScreen();
            velocityTheme.loadTheme();
            
            // Start welcome notification fade timer
            setTimeout(() => {
                const welcomeNotification = velocityUtils.getId('welcomeNotification');
                if (welcomeNotification) {
                    welcomeNotification.classList.add('fade-out');
                }
            }, 30000);
        }
    } else {
        console.log('No existing session found');
        velocityNotifications.clearShownNotifications();
        velocityUI.showWelcomeScreen();
        velocityTheme.loadTheme();
        
        // Start welcome notification fade timer
        setTimeout(() => {
            const welcomeNotification = velocityUtils.getId('welcomeNotification');
            if (welcomeNotification) {
                welcomeNotification.classList.add('fade-out');
            }
        }, 30000);
    }
}

/* ===================================================================
   Global Functions for HTML Event Handlers
   =================================================================== */

// Make functions globally available
window.showCategoryView = showCategoryView;
window.showTutorialView = showTutorialView;
window.showCategoriesView = showCategoriesView;
window.goHome = function() {
    if (appState.authenticated) {
        showCategoriesView();
    } else {
        velocityUI.showWelcomeScreen();
    }
};

/* ===================================================================
   Application Initialization
   =================================================================== */

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing Velocity Lab...');
    
    try {
        // Initialize systems in order
        loadTaskDefinitions();
        velocityOffline.init();
        checkExistingSession();
        velocityUI.setupMobileMenuHandlers();
        velocityAuth.setupFormHandlers();
        
        // Clean up mobile menu state
        const mobileMenu = velocityUtils.getId('mobileMenu');
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
        
        console.log('Velocity Lab initialized successfully');
        
    } catch (error) {
        console.error('Failed to initialize Velocity Lab:', error);
        velocityNotifications.error('Failed to initialize application. Please refresh the page.');
    }
});

// Global error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error, e.filename, e.lineno);
    velocityNotifications.error('An unexpected error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    velocityNotifications.error('A network error occurred. Please check your connection.');
});

// Performance monitoring
window.addEventListener('load', function() {
    if ('performance' in window) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log('Velocity Lab load time:', loadTime + 'ms');
    }
});