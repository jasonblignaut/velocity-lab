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
    
    // Smooth transition to dashboard
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 300);
    }, 1000);
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
      const token = await fetchCSRFToken();
      if (!token) return;
      
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('csrf_token', token);
      
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
      
      userInfo.textContent = `${profileData.name} (${profileData.role})`;
      
      // Show admin link for admin users
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    } else {
      userInfo.textContent = `${user.name} (${user.role})`;
      
      // Show admin link for admin users (fallback)
      const adminLink = $('#adminLink');
      if (adminLink && user.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = `${user.name} (${user.role})`;
    
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
          document.body.style.transition = 'opacity 0.5s ease';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 500);
        }, 1000);
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
      });
    });

    updateProgressBar();
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
      
      userInfo.textContent = `${profileData.name} (${profileData.role})`;
      
      // Show admin link for admin users
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    } else {
      userInfo.textContent = `${user.name} (${user.role})`;
      
      // Show admin link for admin users (fallback)
      const adminLink = $('#adminLink');
      if (adminLink && user.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = `${user.name} (${user.role})`;
    
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
          document.body.style.transition = 'opacity 0.5s ease';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 500);
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
    }
  });

  // Load profile data
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      
      // Update profile information (no avatar)
      const profileName = $('#profileName');
      const profileEmail = $('#profileEmail');
      const profileRole = $('#profileRole');
      const profileJoined = $('#profileJoined');
      const totalProgress = $('#totalProgress');
      const completedTasks = $('#completedTasks');
      const currentWeek = $('#currentWeek');
      
      if (profileName) profileName.textContent = profileData.name;
      if (profileEmail) profileEmail.textContent = profileData.email;
      if (profileRole) profileRole.textContent = profileData.role;
      if (profileJoined) profileJoined.textContent = new Date(profileData.createdAt).toLocaleDateString();
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

// Modal content for tasks
const taskModalContent = {
  'week1-dc': {
    title: 'Promote Server 2012 to Domain Controller',
    description: `
      <p>Promote your Windows Server 2012 to a Domain Controller to set up Active Directory and DNS services.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install Active Directory Domain Services role via Server Manager.</li>
        <li>Promote the server to a Domain Controller (new forest, e.g., lab.local).</li>
        <li>Configure DNS settings and verify replication.</li>
      </ol>
      <p><strong>Tip:</strong> Use <code>dcpromo</code> for automation if preferred.</p>
    `,
  },
  'week1-vm': {
    title: 'Join VM to Domain',
    description: `
      <p>Join a virtual machine to the domain for centralized management.</p>
      <h3>Steps</h3>
      <ol>
        <li>Ensure the VM has network access to the Domain Controller.</li>
        <li>Set the DNS server to the DC's IP address.</li>
        <li>Join the domain via System Properties (Computer Name).</li>
      </ol>
    `,
  },
  'week1-share': {
    title: 'Configure Network Share on DC',
    description: `
      <p>Create a centralized file storage with secure access on the Domain Controller.</p>
      <h3>Steps</h3>
      <ol>
        <li>Create a shared folder (e.g., \\\\DC\\Share$).</li>
        <li>Set NTFS and share permissions for the security group.</li>
        <li>Map drives using GPO, PowerShell, or logon scripts.</li>
      </ol>
      <p><strong>Tip:</strong> Use hidden shares (with $ suffix) for restricted access.</p>
    `,
  },
  'week1-group': {
    title: 'Create Security Group',
    description: `
      <p>Restrict network share access to authorized users via a security group.</p>
      <h3>Steps</h3>
      <ol>
        <li>Open Active Directory Users and Computers.</li>
        <li>Create a new security group (e.g., ShareAccess).</li>
        <li>Add users to the group and assign permissions to the share.</li>
      </ol>
    `,
  },
  'week2-server': {
    title: 'Install Second Server 2012',
    description: `
      <p>Add a second Windows Server 2012 for redundancy.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install Server 2012 on a new VM or hardware.</li>
        <li>Join it to the domain.</li>
        <li>Configure roles as needed (e.g., secondary DC).</li>
      </ol>
    `,
  },
  'week2-wsus': {
    title: 'Setup WSUS',
    description: `
      <p>Manage updates with Windows Server Update Services.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install WSUS role on a server.</li>
        <li>Configure update sources and client policies via GPO.</li>
        <li>Approve and test updates.</li>
      </ol>
    `,
  },
  'week2-time': {
    title: 'Configure Two Time Servers',
    description: `
      <p>Ensure time synchronization across the domain.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure the primary DC as the PDC Emulator to sync with an external NTP server.</li>
        <li>Set a secondary server as a backup time source.</li>
        <li>Verify time sync with <code>w32tm /query /status</code>.</li>
      </ol>
    `,
  },
  'week3-upgrade': {
    title: 'Upgrade Servers to 2016',
    description: `
      <p>Modernize infrastructure by upgrading to Server 2016.</p>
      <h3>Steps</h3>
      <ol>
        <li>Back up existing servers.</li>
        <li>Perform an in-place upgrade or migrate to new Server 2016 VMs.</li>
        <li>Verify AD and DNS functionality post-upgrade.</li>
      </ol>
    `,
  },
  'week3-exchange': {
    title: 'Install Exchange Server 2019',
    description: `
      <p>Deploy email services on a third server.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install Exchange Server 2019 prerequisites.</li>
        <li>Run the Exchange setup and configure mailbox roles.</li>
        <li>Test connectivity and services.</li>
      </ol>
    `,
  },
  'week3-mailbox': {
    title: 'Create User Mailboxes',
    description: `
      <p>Set up email accounts for users.</p>
      <h3>Steps</h3>
      <ol>
        <li>Open Exchange Admin Center.</li>
        <li>Create mailboxes for domain users.</li>
        <li>Test email sending/receiving.</li>
      </ol>
    `,
  },
  'week3-mail': {
    title: 'Setup Internal Mail Flow',
    description: `
      <p>Enable email delivery between users.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure accepted domains and email address policies.</li>
        <li>Set up send/receive connectors.</li>
        <li>Test internal mail flow.</li>
      </ol>
    `,
  },
  'week4-external': {
    title: 'Publish Mail Externally',
    description: `
      <p>Enable secure external email access.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure DNS records (MX, SPF, DKIM, DMARC).</li>
        <li>Enable modern authentication (OAuth 2.0).</li>
        <li>Install TLS certificates and set up reverse DNS.</li>
      </ol>
    `,
  },
  'week4-hybrid': {
    title: 'Setup Microsoft 365 Hybrid Environment',
    description: `
      <p>Integrate on-premises Exchange with Microsoft 365.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install and configure Entra ID Connect.</li>
        <li>Run the Hybrid Configuration Wizard.</li>
        <li>Verify mail flow and calendar sharing.</li>
      </ol>
    `,
  },
  'week4-hosting': {
    title: 'Choose Hosting Environment',
    description: `
      <p>Select Azure or on-premises for deployment.</p>
      <h3>Steps</h3>
      <ol>
        <li>Evaluate Azure vs. on-premises for your workload.</li>
        <li>Configure Azure resources or on-premises servers.</li>
        <li>Test deployment and connectivity.</li>
      </ol>
    `,
  },
};

// Enhanced modal with better animations
const initModal = () => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const closeModal = $('#closeModal');

  if (!modal || !modalTitle || !modalDescription || !closeModal) return;

  const taskElements = document.querySelectorAll('.task');
  
  // Safety check for task elements
  if (taskElements.length === 0) {
    console.log('No task elements found - may not be on dashboard page');
    return;
  }

  taskElements.forEach((task) => {
    task.addEventListener('click', (e) => {
      // Don't open modal if clicking checkbox
      if (e.target.type === 'checkbox') return;
      
      const weekElement = task.closest('.week');
      if (!weekElement) return;
      
      const week = weekElement.dataset.week;
      const taskId = task.dataset.task;
      const key = `${week}-${taskId}`;
      const content = taskModalContent[key] || {
        title: 'Task Details',
        description: '<p>No details available.</p>',
      };
      
      modalTitle.textContent = content.title;
      modalDescription.innerHTML = content.description;
      
      // Enhanced modal opening animation
      modal.style.display = 'flex';
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.style.opacity = '1';
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.transform = 'scale(1)';
        }
      }, 10);
      
      modal.focus();
    });

    // Enhanced keyboard accessibility
    task.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        task.click();
      }
    });
  });

  // Enhanced modal closing
  const closeModalFunction = () => {
    modal.style.opacity = '0';
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.transform = 'scale(0.95)';
    }
    setTimeout(() => {
      modal.style.display = 'none';
      if (modalContent) {
        modalContent.style.transform = '';
      }
    }, 200);
  };

  closeModal.addEventListener('click', closeModalFunction);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunction();
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModalFunction();
    }
  });
};

// Global VelocityLab object for admin functions
window.VelocityLab = {
  showNotification,
  refreshLeaderboard: () => {
    if (typeof loadUsersProgress === 'function') loadUsersProgress();
  },
  exportData: () => {
    if (typeof exportData === 'function') exportData();
  },
  addAdmin: () => {
    const email = prompt('Enter email address to grant admin access:');
    if (email) {
      showNotification('Admin access management available in user modal', 'info');
    }
  }
};

// Enhanced initialization
const init = () => {
  console.log('Initializing Velocity Lab...');
  
  try {
    setupPasswordToggle();
    console.log('Password toggle initialized');
  } catch (error) {
    console.error('Password toggle error:', error);
  }
  
  try {
    initLoginForm();
    console.log('Login form initialized');
  } catch (error) {
    console.error('Login form error:', error);
  }
  
  try {
    initRegisterForm();
    console.log('Register form initialized');
  } catch (error) {
    console.error('Register form error:', error);
  }
  
  try {
    initDashboard();
    console.log('Dashboard initialized');
  } catch (error) {
    console.error('Dashboard error:', error);
  }
  
  try {
    initProfile();
    console.log('Profile initialized');
  } catch (error) {
    console.error('Profile error:', error);
  }
  
  try {
    initModal();
    console.log('Modal initialized');
  } catch (error) {
    console.error('Modal error:', error);
  }
  
  // Add smooth page transitions
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 50);
  
  console.log('Velocity Lab initialization complete');
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);