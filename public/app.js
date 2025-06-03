// app.js - Premium application logic for Velocity Lab
'use strict';

// Task Structure - Matching backend exactly
const TASK_STRUCTURE = {
  week1: {
    title: "Foundation Setup",
    description: "Windows Server 2012 DC, domain joining, and network shares",
    taskCount: 12,
    tasks: [
      'install-server2012',
      'configure-static-ip', 
      'install-adds-role',
      'promote-to-dc',
      'configure-dns-server',
      'create-domain-users',
      'setup-vm-dns',
      'join-vm-domain',
      'create-hidden-share',
      'map-drive-gpo',
      'map-drive-script',
      'create-security-group'
    ]
  },
  week2: {
    title: "Infrastructure Expansion",
    description: "Second DC, WSUS, and time synchronization", 
    taskCount: 8,
    tasks: [
      'install-second-server',
      'promote-additional-dc',
      'install-wsus-role',
      'configure-wsus-settings',
      'setup-wsus-gpo',
      'configure-primary-time',
      'configure-secondary-time',
      'test-infrastructure'
    ]
  },
  week3: {
    title: "Email & Messaging",
    description: "Server 2016 upgrade and Exchange 2019 deployment",
    taskCount: 12,
    tasks: [
      'backup-servers',
      'upgrade-dc1-2016',
      'upgrade-dc2-2016', 
      'raise-functional-levels',
      'prepare-exchange-server',
      'install-exchange-prereqs',
      'extend-ad-schema',
      'install-exchange-2019',
      'configure-exchange-basic',
      'create-mailboxes',
      'test-mailbox-access',
      'configure-internal-mailflow'
    ]
  },
  week4: {
    title: "Cloud Integration", 
    description: "External mail publishing and Microsoft 365 hybrid setup",
    taskCount: 10,
    tasks: [
      'configure-external-dns',
      'setup-firewall-rules',
      'install-ssl-certificates',
      'configure-external-mailflow',
      'setup-modern-auth',
      'prepare-m365-tenant',
      'install-aad-connect',
      'run-hybrid-wizard',
      'configure-hybrid-mailflow',
      'verify-hybrid-functionality'
    ]
  }
};

const TOTAL_TASKS = Object.values(TASK_STRUCTURE).reduce((sum, week) => sum + week.taskCount, 0);

// Global state
const App = {
  user: null,
  progress: {},
  authenticated: false,
};

// Utilities
const $ = id => document.getElementById(id);
const show = el => el?.classList.remove('hidden');
const hide = el => el?.classList.add('hidden');
const toggle = el => el?.classList.toggle('hidden');

// Cookie management
const cookie = {
  get: name => document.cookie.match(`${name}=([^;]+)`)?.[1],
  set: (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Strict;Secure`;
  },
  delete: name => document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
};

// Notifications
const notify = (message, type = 'success', duration = 4000) => {
  const notification = $('notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.className = `notification ${type} show`;
  
  setTimeout(() => notification.classList.remove('show'), duration);
};

// API calls with CSRF protection
const api = async (endpoint, options = {}) => {
  try {
    const csrfResponse = await fetch('/api/csrf', { credentials: 'same-origin' });
    const { token } = await csrfResponse.json();
    
    if (options.body instanceof FormData) {
      options.body.append('csrf_token', token);
    }
    
    const response = await fetch(endpoint, {
      credentials: 'same-origin',
      ...options
    });
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication
const auth = {
  check() {
    const userCookie = cookie.get('user');
    if (userCookie) {
      try {
        App.user = JSON.parse(decodeURIComponent(userCookie));
        App.authenticated = true;
        if (App.user.role === 'admin') {
          show($('adminPortalBtn'));
        }
        ui.update();
        dashboard.load();
      } catch (e) {
        auth.logout();
      }
    } else {
      ui.showLanding();
    }
  },

  async login(formData) {
    try {
      const result = await api('/api/login', {
        method: 'POST',
        body: formData
      });
      
      const userData = { name: result.name, role: result.role };
      cookie.set('user', JSON.stringify(userData));
      App.user = userData;
      App.authenticated = true;
      if (App.user.role === 'admin') {
        show($('adminPortalBtn'));
      }
      ui.update();
      dashboard.load();
      modal.close();
      notify(`Welcome back, ${result.name}!`);
    } catch (error) {
      notify(error.message || 'Login failed. Please try again.', 'error');
    }
  },

  async register(formData) {
    try {
      const result = await api('/api/register', {
        method: 'POST',
        body: formData
      });
      
      const userData = { name: result.name, role: result.role };
      cookie.set('user', JSON.stringify(userData));
      App.user = userData;
      App.authenticated = true;
      if (App.user.role === 'admin') {
        show($('adminPortalBtn'));
      }
      ui.update();
      dashboard.load();
      modal.close();
      notify(`Welcome to Velocity Lab, ${result.name}!`);
    } catch (error) {
      notify(error.message || 'Registration failed. Please try again.', 'error');
    }
  },

  async logout() {
    try {
      await api('/api/logout', { method: 'POST' });
    } catch (e) {
      // Continue with logout
    }
    
    cookie.delete('user');
    App.user = null;
    App.authenticated = false;
    App.progress = {};
    hide($('adminPortalBtn'));
    ui.update();
    notify('Logged out successfully');
  }
};

// UI Management
const ui = {
  showLanding() {
    hide($('dashboardPage'));
    show($('landingPage'));
    hide($('userLinks'));
    show($('authLinks'));
  },

  showDashboard() {
    hide($('landingPage'));
    show($('dashboardPage'));
    show($('userLinks'));
    hide($('authLinks'));
  },

  update() {
    if (App.authenticated && App.user) {
      const userName = $('userName');
      if (userName) userName.textContent = `Welcome, ${App.user.name}`;
      ui.showDashboard();
    } else {
      ui.showLanding();
    }
  }
};

// Modal Management
const modal = {
  show(modalId) {
    const modal = $(modalId);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  hide(modalId) {
    const modal = $(modalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  close() {
    modal.hide('taskModal');
    modal.hide('loginModal');
    modal.hide('registerModal');
    modal.hide('adminPortalModal');
  },

  login() {
    modal.hide('registerModal');
    modal.show('loginModal');
  },

  register() {
    modal.hide('loginModal');
    modal.show('registerModal');
  },

  adminPortal() {
    modal.show('adminPortalModal');
  }
};

// Dashboard Functions
const dashboard = {
  async load() {
    if (!App.authenticated) return;
    
    try {
      const result = await api('/api/progress');
      App.progress = result.data;
      dashboard.updateProgress(result.data);
      dashboard.renderWeeks();
    } catch (error) {
      notify('Failed to load progress', 'error');
    }
  },

  updateProgress(data) {
    const completed = data.completedTasks || 0;
    const percentage = data.progressPercentage || 0;
    
    const ring = $('progressRing');
    if (ring) {
      const circumference = 2 * Math.PI * 78;
      const offset = circumference - (percentage / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }
    
    const progressText = $('progressText');
    const completedTasks = $('completedTasks');
    const currentWeek = $('currentWeek');
    
    if (progressText) progressText.textContent = `${Math.round(percentage)}%`;
    if (completedTasks) completedTasks.textContent = completed;
    
    if (currentWeek) {
      if (completed === 42) currentWeek.textContent = 'Complete!';
      else if (completed >= 32) currentWeek.textContent = 'Week 4';
      else if (completed >= 20) currentWeek.textContent = 'Week 3';
      else if (completed >= 12) currentWeek.textContent = 'Week 2';
      else currentWeek.textContent = 'Week 1';
    }
  },

  renderWeeks() {
    const container = $('weeksContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(TASK_STRUCTURE).forEach(([weekKey, week]) => {
      const weekProgress = App.progress[weekKey] || {};
      const completed = week.tasks.filter(task => weekProgress[task]?.completed).length;
      const percentage = Math.round((completed / week.taskCount) * 100);
      
      const weekCard = document.createElement('div');
      weekCard.className = 'week-card';
      weekCard.innerHTML = `
        <div class="week-header" onclick="this.nextElementSibling.classList.toggle('show')">
          <div class="week-info">
            <h3>${week.title}</h3>
            <p>${week.description}</p>
          </div>
          <div class="week-progress">
            <div class="progress-count">${completed}/${week.taskCount} tasks</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${percentage}%"></div>
            </div>
          </div>
        </div>
        <div class="tasks-grid" id="tasks-${weekKey}">
          ${week.tasks.map(task => {
            const isCompleted = weekProgress[task]?.completed || false;
            const taskTitle = task.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return `
              <div class="task ${isCompleted ? 'completed' : ''}" onclick="tasks.open('${weekKey}', '${task}')">
                <div class="task-header">
                  <input type="checkbox" class="task-checkbox" ${isCompleted ? 'checked' : ''} 
                         onchange="tasks.toggle('${weekKey}', '${task}', this.checked)" onclick="event.stopPropagation()">
                  <div>
                    <div class="task-title">${taskTitle}</div>
                    <div class="task-desc">Click to view task details</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
      
      container.appendChild(weekCard);
    });
  },

  async loadLeaderboard() {
    try {
      const result = await api('/api/admin/users-progress');
      const users = result.data;
      const leaderboardBody = $('leaderboardBody');
      if (!leaderboardBody) return;

      leaderboardBody.innerHTML = `
        <table class="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Progress</th>
              <th>Tasks</th>
              <th>Last Active</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((user, index) => {
              let medalClass = '';
              let medalIcon = '';
              
              if (index === 0) {
                medalClass = 'gold';
                medalIcon = '🥇';
              } else if (index === 1) {
                medalClass = 'silver';
                medalIcon = '🥈';
              } else if (index === 2) {
                medalClass = 'bronze';
                medalIcon = '🥉';
              }
              
              return `
                <tr class="${medalClass}">
                  <td>
                    ${medalIcon ? `
                      <div class="medal">
                        <div class="medal-icon">${medalIcon}</div>
                        ${index + 1}
                      </div>
                    ` : index + 1}
                  </td>
                  <td>${user.name}</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div class="progress-bar" style="width: 100px; flex-shrink: 0;">
                        <div class="progress-fill" style="width: ${user.progress}%"></div>
                      </div>
                      <span style="font-weight: 600;">${user.progress}%</span>
                    </div>
                  </td>
                  <td>${user.completedTasks}/${user.totalTasks}</td>
                  <td>${new Date(user.lastActivity).toLocaleDateString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      modal.adminPortal();
    } catch (error) {
      notify('Failed to load leaderboard', 'error');
    }
  }
};

// Task Management
const tasks = {
  async toggle(week, task, checked) {
    const formData = new FormData();
    formData.append('week', week);
    formData.append('task', task);
    formData.append('checked', checked);
    
    try {
      const result = await api('/api/progress', {
        method: 'POST',
        body: formData
      });
      
      if (!App.progress[week]) App.progress[week] = {};
      if (!App.progress[week][task]) App.progress[week][task] = {};
      App.progress[week][task].completed = checked;
      
      dashboard.updateProgress(result.data);
      dashboard.renderWeeks();
      
      if (checked) {
        notify('✅ Task completed! Great progress!');
      }
    } catch (error) {
      notify('Failed to update progress', 'error');
      // Revert checkbox state
      const checkbox = event.target;
      if (checkbox) checkbox.checked = !checked;
    }
  },

  async toggleSubtask(week, task, step, checked) {
    const formData = new FormData();
    formData.append('week', week);
    formData.append('task', task);
    formData.append('subtask', `step${step}`);
    formData.append('subtask_checked', checked);
    
    try {
      const result = await api('/api/progress', {
        method: 'POST',
        body: formData
      });
      
      if (!App.progress[week]) App.progress[week] = {};
      if (!App.progress[week][task]) App.progress[week][task] = { subtasks: {} };
      if (!App.progress[week][task].subtasks) App.progress[week][task].subtasks = {};
      App.progress[week][task].subtasks[`step${step}`] = checked;
      
      dashboard.updateProgress(result.data);
      
      if (checked) {
        notify('✅ Step completed!');
      }
    } catch (error) {
      notify('Failed to update subtask', 'error');
    }
  },

  open(week, task) {
    const taskKey = `${week}-${task}`;
    // Get task definition from the global TASK_DEFINITIONS loaded from task-definitions.js
    const taskData = window.TASK_DEFINITIONS?.[taskKey] || { 
      title: task.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), 
      description: '<p>Task details coming soon...</p>' 
    };
    const weekData = TASK_STRUCTURE[week];
    const progress = App.progress[week]?.[task]?.subtasks || {};
    
    const modalTitle = $('modalTitle');
    const modalBody = $('modalBody');
    
    if (modalTitle) modalTitle.textContent = taskData.title;
    if (modalBody) {
      modalBody.innerHTML = `
        <div style="margin-bottom: 24px; padding: 20px; background: var(--bg-secondary); border-radius: var(--radius);">
          <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Week ${week.slice(-1)}: ${weekData.title}</h4>
          <p style="color: var(--gray-600); font-size: 14px;">${weekData.description}</p>
        </div>
        <div style="padding: 0 4px;">
          ${taskData.description}
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-light);">
            <div>
              <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-600);">Category</strong>
              <div style="margin-top: 4px; font-weight: 500;">${tasks.getCategory(week)}</div>
            </div>
            <div>
              <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-600);">Estimated Time</strong>
              <div style="margin-top: 4px; font-weight: 500;">${tasks.getTime(task)}</div>
            </div>
          </div>
        </div>
      `;
      
      // Attach event listeners to subtasks
      setTimeout(() => {
        const checkboxes = modalBody.querySelectorAll('.subtask-checkbox');
        checkboxes.forEach(checkbox => {
          const step = checkbox.dataset.step;
          checkbox.checked = progress[`step${step}`] || false;
          checkbox.addEventListener('change', () => tasks.toggleSubtask(week, task, step, checkbox.checked));
        });
      }, 100);
    }
    
    modal.show('taskModal');
  },

  getCategory(week) {
    const categories = {
      week1: 'Foundation Setup',
      week2: 'Infrastructure Expansion', 
      week3: 'Email & Messaging',
      week4: 'Cloud Integration'
    };
    return categories[week] || 'Training';
  },

  getTime(task) {
    if (task.includes('install') || task.includes('upgrade')) return '30-45 min';
    if (task.includes('configure') || task.includes('setup')) return '20-30 min';
    if (task.includes('test') || task.includes('verify')) return '15-20 min';
    return '20-30 min';
  }
};

// Lab Management
const lab = {
  async startNew() {
    if (!confirm('Start a new lab? This will reset your progress and save current progress to history.')) {
      return;
    }
    
    try {
      const result = await api('/api/lab/start-new', { method: 'POST' });
      if (result.success) {
        notify('🚀 New lab started! Previous progress saved to history.');
        dashboard.load();
      }
    } catch (error) {
      notify('Failed to start new lab', 'error');
    }
  }
};

// Global Functions
window.showLogin = modal.login;
window.showRegister = modal.register;
window.closeModal = modal.close;
window.logout = auth.logout;
window.startNewLab = lab.startNew;
window.showAdminPortal = dashboard.loadLeaderboard;

// Form Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Check if TASK_DEFINITIONS loaded
  if (!window.TASK_DEFINITIONS) {
    console.error('⚠️ TASK_DEFINITIONS not loaded! Make sure task-definitions.js is included before app.js');
  } else {
    console.log('✅ Loaded', Object.keys(window.TASK_DEFINITIONS).length, 'task definitions');
  }

  const loginForm = $('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      auth.login(new FormData(e.target));
    });
  }

  const registerForm = $('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      auth.register(new FormData(e.target));
    });
  }

  // Click outside modal to close
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      modal.close();
    }
  });

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.close();
    }
  });

  // Initialize authentication
  auth.check();
  
  console.log('🚀 Velocity Lab - Premium Exchange Hybrid Migration Training Ready!');
});