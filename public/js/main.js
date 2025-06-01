// Complete Main.js for Velocity Lab
// Handles client-side logic for authentication, progress tracking, modals, and animations

// Utility Functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Cookie management
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

// Enhanced notification system with better animations
const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = $('#notification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  
  // Add entrance animation
  notification.style.transform = 'translateY(-20px)';
  notification.style.opacity = '0';
  
  setTimeout(() => {
    notification.style.transform = 'translateY(0)';
    notification.style.opacity = '1';
  }, 50);
  
  setTimeout(() => {
    notification.style.transform = 'translateY(-20px)';
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.className = 'notification';
      notification.textContent = '';
      notification.style.transform = '';
      notification.style.opacity = '';
    }, 300);
  }, duration);
};

// Make showNotification globally available
window.showNotification = showNotification;

// Fetch CSRF token from server
const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    const csrfInput = $('#csrfToken');
    if (csrfInput) csrfInput.value = data.token;
    return data.token;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    showNotification('Failed to initialize form. Please try again.', 'error');
    return null;
  }
};

// Enhanced form submission with better loading states
const handleFormSubmit = async (form, endpoint, isRegister = false) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector('.spinner');
  const buttonText = submitButton.querySelector('span') || submitButton;
  const originalText = buttonText.textContent;
  
  // Enhanced loading state
  submitButton.disabled = true;
  spinner?.classList.add('active');
  buttonText.textContent = isRegister ? 'Creating Account...' : 'Signing In...';
  submitButton.style.opacity = '0.8';

  try {
    const formData = new FormData(form);
    if (isRegister && formData.get('password') !== formData.get('repeatPassword')) {
      showNotification('Passwords do not match.', 'error');
      return;
    }

    const token = await fetchCSRFToken();
    if (!token) return;
    formData.set('csrf_token', token);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');

    showNotification(`Welcome, ${data.name}!`, 'success');
    setCookie('user', JSON.stringify({ name: data.name, role: data.role }), 1);
    
    // Faster transition to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard.html';
    }, 300);
  } catch (error) {
    console.error(`${endpoint} error:`, error);
    showNotification(error.message || 'An error occurred.', 'error');
  } finally {
    submitButton.disabled = false;
    spinner?.classList.remove('active');
    buttonText.textContent = originalText;
    submitButton.style.opacity = '';
  }
};

// Enhanced password toggle with smooth animations
const setupPasswordToggle = () => {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      const svgPath = button.querySelector('svg path');
      
      // Smooth transition
      button.style.transform = 'scale(0.9)';
      setTimeout(() => {
        input.type = isPassword ? 'text' : 'password';
        svgPath.setAttribute(
          'd',
          isPassword
            ? 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
            : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
        );
        button.style.transform = '';
      }, 100);
    });
  });
};

// Initialize login form
const initLoginForm = () => {
  const loginForm = $('#loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, '/api/login');
  });
};

// Initialize register form
const initRegisterForm = () => {
  const registerForm = $('#registerForm');
  if (!registerForm) return;
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(registerForm, '/api/register', true);
  });
};

// Initialize profile password change form
const initProfilePasswordForm = () => {
  const passwordForm = $('#passwordForm');
  if (!passwordForm) return;
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner');
    const currentPassword = $('#currentPassword').value;
    const newPassword = $('#newPassword').value;
    const confirmPassword = $('#confirmPassword').value;
    
    // Client-side validation
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }
    
    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters', 'error');
      return;
    }
    
    submitButton.disabled = true;
    spinner?.classList.add('active');
    
    try {
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      if (response.ok) {
        showNotification('Password updated successfully', 'success');
        passwordForm.reset();
      } else {
        showNotification(data.error || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showNotification('Failed to update password', 'error');
    } finally {
      submitButton.disabled = false;
      spinner?.classList.remove('active');
    }
  });
};

// Fetch user progress
const fetchProgress = async () => {
  try {
    const response = await fetch('/api/progress', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch progress');
    return await response.json();
  } catch (error) {
    console.error('Progress fetch error:', error);
    showNotification('Failed to load progress.', 'error');
    return {};
  }
};

// Enhanced progress bar with smooth animations
const updateProgressBar = () => {
  const tasks = document.querySelectorAll('.task input[type="checkbox"]');
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter((task) => task.checked).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');
  
  if (progressBar) {
    // Smooth animation
    progressBar.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
    progressBar.style.setProperty('--progress', `${percentage}%`);
    progressBar.setAttribute('aria-valuenow', percentage);
  }
  
  if (progressText) {
    progressText.textContent = `${percentage}% Completed`;
  }
  
  // Add celebration effect for milestones
  if (percentage === 100 && completedTasks === totalTasks) {
    showNotification('🎉 Congratulations! You completed all tasks!', 'success', 7000);
  } else if (percentage > 0 && percentage % 25 === 0) {
    showNotification(`Great progress! ${percentage}% complete`, 'success');
  }
};

// Sync progress with server
const syncProgress = async (week, task, checked) => {
  try {
    const formData = new FormData();
    formData.append('week', week);
    formData.append('task', task);
    formData.append('checked', checked);
    const response = await fetch('/api/progress', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Failed to update progress');
  } catch (error) {
    console.error('Progress sync error:', error);
    showNotification('Failed to save progress.', 'error');
  }
};

// Enhanced dashboard initialization
const initDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  // Check if we're on the dashboard page
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // Get fresh user data from server to check current role
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      // Update cookie with fresh data
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      userInfo.textContent = `${profileData.name}`;
      
      // Show admin link for admin users
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    } else {
      userInfo.textContent = `${user.name}`;
      
      // Show admin link for admin users (fallback)
      const adminLink = $('#adminLink');
      if (adminLink && user.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = `${user.name}`;
    
    // Show admin link for admin users (fallback)
    const adminLink = $('#adminLink');
    if (adminLink && user.role === 'admin') {
      adminLink.style.display = 'inline';
    }
  }
  
  // Enhanced logout with smooth transition to home
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Show loading state
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('Logged out successfully', 'success', 2000);
        
        // Smooth transition to home
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 500);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
    }
  });

  // Load and display progress
  try {
    const progress = await fetchProgress();
    const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
    
    // Safety check for dashboard elements
    if (checkboxes.length === 0) {
      console.log('No task checkboxes found - may not be on dashboard page');
      return;
    }
    
    checkboxes.forEach((checkbox) => {
      const week = checkbox.dataset.week;
      const task = checkbox.dataset.task;
      if (progress[week]?.[task]) {
        checkbox.checked = true;
      }
      
      // Enhanced checkbox interactions
      checkbox.addEventListener('change', (e) => {
        const taskElement = e.target.closest('.task');
        
        // Visual feedback
        if (e.target.checked) {
          taskElement.style.transform = 'scale(1.02)';
          setTimeout(() => {
            taskElement.style.transform = '';
          }, 200);
        }
        
        syncProgress(week, task, checkbox.checked);
        updateProgressBar();
        updateSubTaskProgress();
      });
    });

    updateProgressBar();
    updateSubTaskProgress();
  } catch (error) {
    console.error('Dashboard progress initialization error:', error);
  }

  // Enhanced timeline animation
  const weekElements = document.querySelectorAll('.week');
  if (weekElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate');
            }, index * 100); // Staggered animation
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    weekElements.forEach((week) => observer.observe(week));
  }
};

// Enhanced profile initialization
const initProfile = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // Get fresh user data from server to check current role
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      // Update cookie with fresh data
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      userInfo.textContent = `${profileData.name}`;
      
      // Show admin link for admin users
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    } else {
      userInfo.textContent = `${user.name}`;
      
      // Show admin link for admin users (fallback)
      const adminLink = $('#adminLink');
      if (adminLink && user.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = `${user.name}`;
    
    // Show admin link for admin users (fallback)
    const adminLink = $('#adminLink');
    if (adminLink && user.role === 'admin') {
      adminLink.style.display = 'inline';
    }
  }
  
  // Enhanced logout for profile page
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('Logged out successfully', 'success', 2000);
        
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 500);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
    }
  });

  // Load profile data faster
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      
      // Update profile information
      const profileName = $('#profileName');
      const profileEmail = $('#profileEmail');
      const profileRole = $('#profileRole');
      const profileJoined = $('#profileJoined');
      const profileLastLogin = $('#profileLastLogin');
      const totalProgress = $('#totalProgress');
      const completedTasks = $('#completedTasks');
      const currentWeek = $('#currentWeek');
      
      if (profileName) profileName.textContent = profileData.name;
      if (profileEmail) profileEmail.textContent = profileData.email;
      if (profileRole) profileRole.textContent = profileData.role;
      if (profileJoined) {
        if (profileData.createdAt) {
          const joinedDate = new Date(profileData.createdAt);
          if (!isNaN(joinedDate.getTime())) {
            profileJoined.textContent = joinedDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          } else {
            profileJoined.textContent = 'Registration date unavailable';
          }
        } else {
          profileJoined.textContent = 'Registration date unavailable';
        }
      }
      if (profileLastLogin) {
        if (profileData.lastLogin) {
          const lastLoginDate = new Date(profileData.lastLogin);
          if (!isNaN(lastLoginDate.getTime())) {
            profileLastLogin.textContent = lastLoginDate.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }) + ' at ' + lastLoginDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            profileLastLogin.textContent = 'Unknown';
          }
        } else {
          profileLastLogin.textContent = 'Never';
        }
      }
      if (totalProgress) totalProgress.textContent = `${profileData.progress}%`;
      if (completedTasks) completedTasks.textContent = `${profileData.completedTasks}/${profileData.totalTasks}`;
      if (currentWeek) {
        const weekNumber = Math.min(Math.floor(profileData.completedTasks / 3.5) + 1, 4);
        currentWeek.textContent = `Week ${weekNumber}`;
      }
    }
  } catch (error) {
    console.error('Profile load error:', error);
    showNotification('Failed to load profile data', 'error');
  }
  
  // Initialize password change form
  initProfilePasswordForm();
};

// Store subtask states in memory
let subTaskStates = {};

// Function to update sub-task progress counter
const updateSubTaskProgress = () => {
  document.querySelectorAll('.task').forEach(task => {
    const weekElement = task.closest('.week');
    if (!weekElement) return;
    
    const week = weekElement.dataset.week;
    const taskId = task.dataset.task;
    const key = `${week}-${taskId}`;
    
    // Find existing counter or create one
    let counter = task.querySelector('.subtask-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'subtask-counter';
      counter.style.cssText = `
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-top: 0.25rem;
        font-weight: 500;
      `;
      task.querySelector('.task-content').appendChild(counter);
    }
    
    // Count subtasks based on task content
    const subtaskCounts = {
      'week1-share': 6, // Map drives automatically, Share not visible, Use different methods (GPO, PowerShell, logon), auto map, set permissions, create share
      'week4-external': 7, // MX, SPF, DKIM, DMARC, OAuth, TLS, reverse DNS
      'week4-hybrid': 5, // Install Connect, sync identities, wizard, verify flow, test sharing
      'week1-dc': 3,
      'week1-vm': 3,
      'week1-group': 4,
      'week2-server': 3,
      'week2-wsus': 3,
      'week2-time': 3,
      'week3-upgrade': 3,
      'week3-exchange': 3,
      'week3-mailbox': 3,
      'week3-mail': 3,
      'week4-hosting': 3
    };
    
    const totalSubtasks = subtaskCounts[key] || 0;
    if (totalSubtasks > 0) {
      const completed = subTaskStates[key] || 0;
      counter.textContent = `${completed}/${totalSubtasks} steps`;
      
      if (completed === totalSubtasks) {
        counter.style.color = 'var(--success)';
        counter.textContent += ' ✓';
      } else {
        counter.style.color = 'var(--text-tertiary)';
      }
    } else {
      counter.style.display = 'none';
    }
  });
};

// Function to handle sub-task checkbox changes
const updateSubTaskState = (week, task, subtask, checked) => {
  const key = `${week}-${task}`;
  if (!subTaskStates[key]) subTaskStates[key] = 0;
  
  const currentState = localStorage.getItem(`subtask-${key}-${subtask}`) === 'true';
  
  if (checked && !currentState) {
    subTaskStates[key]++;
    localStorage.setItem(`subtask-${key}-${subtask}`, 'true');
  } else if (!checked && currentState) {
    subTaskStates[key]--;
    localStorage.removeItem(`subtask-${key}-${subtask}`);
  }
  
  updateSubTaskProgress();
};

// Load subtask states from localStorage
const loadSubTaskStates = () => {
  subTaskStates = {};
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('subtask-')) {
      const value = localStorage.getItem(key);
      if (value === 'true') {
        // Extract week-task from key
        const match = key.match(/subtask-(week\d+-\w+)-/);
        if (match) {
          const taskKey = match[1];
          if (!subTaskStates[taskKey]) subTaskStates[taskKey] = 0;
          subTaskStates[taskKey]++;
        }
      }
    }
  }
};

// Modal content for tasks with updated content and reference links
const taskModalContent = {
  'week1-dc': {
    title: 'Promote Server 2012 to Domain Controller',
    description: `
      <p>Promote your Windows Server 2012 to a Domain Controller to set up Active Directory and DNS services.</p>
      
      <h3>Prerequisites</h3>
      <p><strong>TIP:</strong> For first-time users - Where you decide to host this is up to you. Azure has some benefits, whereas an on-prem virtual lab has others. We suggest going through this lab at least once a year, especially the Exchange Hybrid portion.</p>
      
      <h3>Steps</h3>
      <ol>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'dc', 'install-adds', this.checked)"> Install Active Directory Domain Services role via Server Manager.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'dc', 'promote-dc', this.checked)"> Promote the server to a Domain Controller (new forest, e.g., lab.local).</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'dc', 'configure-dns', this.checked)"> Configure DNS settings and verify replication.</li>
      </ol>
      
      <h3>Reference Links</h3>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/blog/itopstalk/how-to-install-and-configure-active-directory-domain-services-on-windows-server-2012-r2/259064" target="_blank">Install and Configure Active Directory - Microsoft Tech Community</a></li>
        <li><a href="https://alitajran.com/install-active-directory-windows-server-2019/" target="_blank">Active Directory Installation Guide - Ali Tajran</a></li>
      </ul>
      
      <p><strong>Tip:</strong> Use <code>dcpromo</code> for automation if preferred.</p>
    `,
  },
  'week1-vm': {
    title: 'Join VM to Domain',
    description: `
      <p>Join a virtual machine to the domain for centralized management.</p>
      
      <h3>Steps</h3>
      <ol>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'vm', 'network-access', this.checked)"> Ensure the VM has network access to the Domain Controller.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'vm', 'dns-config', this.checked)"> Set the DNS server to the DC's IP address.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'vm', 'join-domain', this.checked)"> Join the domain via System Properties (Computer Name).</li>
      </ol>
      
      <h3>Reference Links</h3>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/blog/itopstalk/how-to-join-a-computer-to-a-domain/341911" target="_blank">Join Computer to Domain - Microsoft Tech Community</a></li>
        <li><a href="https://alitajran.com/join-computer-to-active-directory-domain/" target="_blank">Join Computer to Domain - Ali Tajran</a></li>
      </ul>
    `,
  },
  'week1-share': {
    title: 'Configure Network Share on DC',
    description: `
      <p>Create a centralized file storage with secure access on the Domain Controller.</p>
      
      <h3>Steps</h3>
      <ol>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'create-share', this.checked)"> Create a shared folder (e.g., \\\\DC\\Share$) - Share must not be visible (hidden share).</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'set-permissions', this.checked)"> Set NTFS and share permissions for the security group.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'map-gpo', this.checked)"> Map drive using Group Policy Object (GPO).</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'map-powershell', this.checked)"> Map drive using PowerShell script.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'map-logon', this.checked)"> Map drive using logon script.</li>
        <li><input type="checkbox" onchange="updateSubTaskState('week1', 'share', 'auto-map', this.checked)"> Ensure drives automatically map to machine on logon.</li>
      </ol>
      
      <h3>Reference Links</h3>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/blog/itopstalk/how-to-create-and-share-a-folder-in-windows-server/259088" target="_blank">Create Network Shares - Microsoft Tech Community</a></li>
        <li><a href="https://alitajran.com/how-to-create-shared-folder-windows-server/" target="_blank">Network Share Configuration - Ali Tajran</a></li>
      </ul>
      
      <p><strong>Tip:</strong> Use hidden shares (with $ suffix) for restricted access. Create three drives using different methods.</p>
    `,
  },
  'week1-group': {
    title: 'Create Security Group',
    description: `
      <p>Restrict network share access to authorized users via a security group.</p>
      
      <h3>Steps</h3>
      <ol>