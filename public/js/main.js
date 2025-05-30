// Main.js for Velocity Lab
// Handles client-side logic for authentication, progress tracking, modals, and animations

// Utility Functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);
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

// Show notification with message, type, and duration
const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = $('#notification');
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  setTimeout(() => {
    notification.classList.replace('show', 'hide');
    setTimeout(() => {
      notification.className = 'notification';
      notification.textContent = '';
    }, 300);
  }, duration);
};

// Fetch CSRF token from server
const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    showNotification('Failed to initialize form. Please try again.', 'error');
    return null;
  }
};

// Handle form submissions (login/register)
const handleFormSubmit = async (form, endpoint, isRegister = false) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector('.spinner');
  submitButton.disabled = true;
  spinner.classList.add('active');

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
    setTimeout(() => (window.location.href = '/dashboard.html'), 1000);
  } catch (error) {
    console.error(`${endpoint} error:`, error);
    showNotification(error.message || 'An error occurred.', 'error');
  } finally {
    submitButton.disabled = false;
    spinner.classList.remove('active');
  }
};

// Toggle password visibility
const setupPasswordToggle = () => {
  $$('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.querySelector('svg path').setAttribute(
        'd',
        isPassword
          ? 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
          : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
      );
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

// Update progress bar
const updateProgressBar = () => {
  const tasks = $$('.task input[type="checkbox"]');
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter((task) => task.checked).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressBar = $('#progressBar');
  progressBar.style.setProperty('--progress', `${percentage}%`);
  progressBar.setAttribute('aria-valuenow', percentage);
  $('#progressText').textContent = `${percentage}% Completed`;
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

// Initialize dashboard
const initDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  userInfo.textContent = `${user.name} (${user.role})`;
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (response.ok) {
        deleteCookie('user');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
    }
  });

  const progress = await fetchProgress();
  $$('.task input[type="checkbox"]').forEach((checkbox) => {
    const week = checkbox.dataset.week;
    const task = checkbox.dataset.task;
    if (progress[week]?.[task]) {
      checkbox.checked = true;
    }
    checkbox.addEventListener('change', () => {
      syncProgress(week, task, checkbox.checked);
      updateProgressBar();
    });
  });

  updateProgressBar();

  // Animate timeline
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  $$('.week').forEach((week) => observer.observe(week));
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
        <li>Set the DNS server to the DC’s IP address.</li>
        <li>Join the domain via System Properties (Computer Name).</li>
      </ol>
    `,
  },
  // Add more modal content as needed
};

// Initialize modal
const initModal = () => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const closeModal = $('#closeModal');

  if (!modal || !modalTitle || !modalDescription || !closeModal) return;

  $$('.task').forEach((task) => {
    task.addEventListener('click', () => {
      const week = task.closest('.week').dataset.week;
      const taskId = task.dataset.task;
      const key = `${week}-${taskId}`;
      const content = taskModalContent[key] || {
        title: 'Task Details',
        description: '<p>No details available.</p>',
      };
      modalTitle.textContent = content.title;
      modalDescription.innerHTML = content.description;
      modal.style.display = 'flex';
      modal.focus();
    });

    // Keyboard accessibility
    task.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        task.click();
      }
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
};

// Initialize app
const init = () => {
  setupPasswordToggle();
  initLoginForm();
  initRegisterForm();
  initDashboard();
  initModal();
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);