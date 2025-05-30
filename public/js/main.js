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
const updateProgressBar = (progress) => {
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
  'week1-share': {
    title: 'Configure Network Share on DC',
    description: `
      <p>Create a centralized network share with secure access.</p>
      <h3>Steps</h3>
      <ol>
        <li>Create a folder (e.g., C:\\Shares\\Data).</li>
        <li>Share the folder with a hidden share (e.g., Data$).</li>
        <li>Configure NTFS permissions for specific users.</li>
        <li>Map drives using GPO, PowerShell, or logon scripts.</li>
      </ol>
      <p><strong>Example PowerShell:</strong></p>
      <pre>net use Z: \\\\DC\\Data$ /persistent:yes</pre>
    `,
  },
  'week1-group': {
    title: 'Create Security Group',
    description: `
      <p>Create a security group to restrict network share access.</p>
      <h3>Steps</h3>
      <ol>
        <li>Open Active Directory Users and Computers.</li>
        <li>Create a new security group (e.g., ShareAccess).</li>
        <li>Add authorized users to the group.</li>
        <li>Assign the group to the share’s NTFS permissions.</li>
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
        <li>Configure it as an additional Domain Controller.</li>
      </ol>
    `,
  },
  'week2-wsus': {
    title: 'Setup WSUS',
    description: `
      <p>Deploy Windows Server Update Services for update management.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install WSUS role on the second server.</li>
        <li>Configure WSUS to sync with Microsoft Update.</li>
        <li>Create computer groups and approve updates.</li>
      </ol>
    `,
  },
  'week2-time': {
    title: 'Configure Two Time Servers',
    description: `
      <p>Ensure time synchronization across the domain.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure the primary DC as an NTP server.</li>
        <li>Set the second server to sync with the primary DC.</li>
        <li>Use <code>w32tm</code> to verify time sync.</li>
      </ol>
      <p><strong>Command:</strong></p>
      <pre>w32tm /config /manualpeerlist:pool.ntp.org /syncfromflags:manual /update</pre>
    `,
  },
  'week3-upgrade': {
    title: 'Upgrade Servers to 2016',
    description: `
      <p>Upgrade both servers to Windows Server 2016.</p>
      <h3>Steps</h3>
      <ol>
        <li>Back up all data and configurations.</li>
        <li>Perform an in-place upgrade or migrate to new VMs.</li>
        <li>Verify Active Directory and DNS functionality post-upgrade.</li>
      </ol>
    `,
  },
  'week3-exchange': {
    title: 'Install Exchange Server 2019',
    description: `
      <p>Deploy Exchange Server 2019 on a third server.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install prerequisites (e.g., .NET Framework, UCMA).</li>
        <li>Run Exchange 2019 setup and install Mailbox role.</li>
        <li>Configure DNS records for mail services.</li>
      </ol>
    `,
  },
  'week3-mailbox': {
    title: 'Create User Mailboxes',
    description: `
      <p>Set up email accounts for users in Exchange.</p>
      <h3>Steps</h3>
      <ol>
        <li>Open Exchange Admin Center.</li>
        <li>Create mailboxes for domain users.</li>
        <li>Test email sending/receiving internally.</li>
      </ol>
    `,
  },
  'week3-mail': {
    title: 'Setup Internal Mail Flow',
    description: `
      <p>Enable email delivery between users.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure accepted domains in Exchange.</li>
        <li>Set up send/receive connectors.</li>
        <li>Test mail flow using Outlook or OWA.</li>
      </ol>
    `,
  },
  'week4-external': {
    title: 'Publish Mail Externally',
    description: `
      <p>Enable secure external email access.</p>
      <h3>Steps</h3>
      <ol>
        <li>Configure MX, SPF, DKIM, and DMARC records in DNS.</li>
        <li>Enable modern authentication (OAuth 2.0).</li>
        <li>Install TLS certificates and set up reverse DNS.</li>
      </ol>
      <p><strong>Example SPF:</strong></p>
      <pre>v=spf1 mx a:mail.lab.local ~all</pre>
    `,
  },
  'week4-hybrid': {
    title: 'Setup Microsoft 365 Hybrid Environment',
    description: `
      <p>Integrate on-premises Exchange with Microsoft 365.</p>
      <h3>Steps</h3>
      <ol>
        <li>Install Entra ID Connect for hybrid identity.</li>
        <li>Run the Hybrid Configuration Wizard.</li>
        <li>Verify mail flow and calendar sharing between on-premises and cloud.</li>
      </ol>
    `,
  },
  'week4-hosting': {
    title: 'Choose Hosting Environment',
    description: `
      <p>Select Azure or on-premises for your deployment.</p>
      <h3>Considerations</h3>
      <ul>
        <li><strong>Azure:</strong> Scalable, cloud-based, managed services.</li>
        <li><strong>On-Premises:</strong> Full control, lower recurring costs.</li>
      </ul>
    `,
  },
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

  // Apply dark theme based on user preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);