const API_BASE = '/api';
const NOTIFICATION_TIMEOUT = 5000;

function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.className = `notification hide ${type}`;
    setTimeout(() => { notification.style.display = 'none'; }, 300);
  }, NOTIFICATION_TIMEOUT);
}

function toggleSpinner(button, show) {
  const spinner = button.querySelector('.spinner');
  if (spinner) spinner.style.display = show ? 'inline-block' : 'none';
  button.disabled = show;
}

async function fetchCsrfToken() {
  const response = await fetch(`${API_BASE}/csrf`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch CSRF token');
  const { token } = await response.json();
  return token;
}

async function handleFormSubmit(event, endpoint, redirect, formId) {
  event.preventDefault();
  const form = document.getElementById(formId);
  const button = form.querySelector('button[type="submit"]');
  toggleSpinner(button, true);

  try {
    const formData = new FormData(form);
    const csrfToken = await fetchCsrfToken();
    formData.set('csrf_token', csrfToken);

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    toggleSpinner(button, false);

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    showNotification(`${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)} successful`, 'success');
    setTimeout(() => window.location.href = redirect, 1000);
  } catch (error) {
    toggleSpinner(button, false);
    showNotification(error.message || 'An error occurred', 'error');
  }
}

function setupPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.querySelector('svg').style.opacity = isPassword ? '0.5' : '1';
    });
  });
}

function setupThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  toggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  });

  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(savedTheme);
}

async function fetchUserInfo() {
  try {
    const response = await fetch(`${API_BASE}/progress`, { credentials: 'include' });
    if (!response.ok) throw new Error('Unauthorized');
    const progress = await response.json();
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      const user = await fetchUserData();
      userInfo.textContent = `Welcome, ${user.name}`;
      setupProgress(progress);
    }
  } catch (error) {
    window.location.href = '/login.html';
  }
}

async function fetchUserData() {
  const response = await fetch(`${API_BASE}/user`, { credentials: 'include' });
  if (!response.ok) throw new Error('Failed to fetch user data');
  return await response.json();
}

function setupProgress(progress) {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  let totalTasks = checkboxes.length;
  let completedTasks = 0;

  checkboxes.forEach(checkbox => {
    const week = checkbox.dataset.week;
    const task = checkbox.dataset.task;
    if (progress[week]?.[task]) {
      checkbox.checked = true;
      completedTasks++;
    }

    checkbox.addEventListener('change', async () => {
      try {
        const formData = new FormData();
        formData.append('week', week);
        formData.append('task', task);
        formData.append('checked', checkbox.checked.toString());
        formData.append('csrf_token', await fetchCsrfToken());

        const response = await fetch(`${API_BASE}/progress`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to update progress');

        completedTasks += checkbox.checked ? 1 : -1;
        updateProgressBar(completedTasks, totalTasks);
      } catch (error) {
        showNotification('Failed to update progress', 'error');
        checkbox.checked = !checkbox.checked;
      }
    });
  });

  updateProgressBar(completedTasks, totalTasks);
}

function updateProgressBar(completed, total) {
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const percentage = Math.round((completed / total) * 100);
  progressBar.style.setProperty('--progress', `${percentage}%`);
  progressText.textContent = `${percentage}% Completed`;
}

function setupTaskModal() {
  const tasks = document.querySelectorAll('.task');
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const closeBtn = document.getElementById('closeModal');

  const taskDetails = {
    dc: {
      title: 'Promote Server 2012 to Domain Controller',
      description: `
        <p>Configure a Windows Server 2012 as a Domain Controller with Active Directory and DNS.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Install Active Directory Domain Services role.</li>
          <li>Promote server to Domain Controller using dcpromo.</li>
          <li>Configure DNS with forward and reverse lookup zones.</li>
        </ol>
      `
    },
    vm: {
      title: 'Join VM to Domain',
      description: `
        <p>Join a virtual machine to the Active Directory domain for centralized management.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Set DNS server to Domain Controller’s IP.</li>
          <li>Join domain via System Properties.</li>
          <li>Verify domain membership with <code>nltest /dsgetdc</code>.</li>
        </ol>
      `
    },
    share: {
      title: 'Configure Network Share on DC',
      description: `
        <p>Create a secure network share on the Domain Controller.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Create a folder (e.g., C:\\Shares\\Data).</li>
          <li>Share folder with specific permissions.</li>
          <li>Map drives using GPO, PowerShell, and logon scripts.</li>
          <li>Use hidden share with $ suffix (e.g., Data$).</li>
        </ol>
      `
    },
    group: {
      title: 'Create Security Group',
      description: `
        <p>Create a security group to restrict access to the network share.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Open Active Directory Users and Computers.</li>
          <li>Create a new security group (e.g., ShareAccess).</li>
          <li>Add users and assign permissions to the share.</li>
        </ol>
      `
    },
    server: {
      title: 'Install Second Server 2012',
      description: `
        <p>Deploy a second Windows Server 2012 for redundancy.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Install Server 2012 on a new VM.</li>
          <li>Configure static IP and join to domain.</li>
          <li>Install required roles (e.g., File Services).</li>
        </ol>
      `
    },
    wsus: {
      title: 'Setup WSUS',
      description: `
        <p>Configure Windows Server Update Services for update management.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Install WSUS role on the second server.</li>
          <li>Configure WSUS to sync with Microsoft Update.</li>
          <li>Create GPOs to direct clients to WSUS.</li>
        </ol>
      `
    },
    time: {
      title: 'Configure Two Time Servers',
      description: `
        <p>Ensure time synchronization across the domain.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Configure PDC emulator as primary time source.</li>
          <li>Set second server as backup time server.</li>
          <li>Use <code>w32tm /config</code> to sync with external NTP.</li>
        </ol>
      `
    },
    upgrade: {
      title: 'Upgrade Servers to 2016',
      description: `
        <p>Upgrade both servers to Windows Server 2016.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Backup critical data and configurations.</li>
          <li>Perform in-place upgrade or migrate roles.</li>
          <li>Verify AD and DNS functionality post-upgrade.</li>
        </ol>
      `
    },
    exchange: {
      title: 'Install Exchange Server 2019',
      description: `
        <p>Deploy Exchange Server 2019 on a third server.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Prepare AD schema for Exchange.</li>
          <li>Install Exchange Server 2019.</li>
          <li>Configure basic settings via Exchange Admin Center.</li>
        </ol>
      `
    },
    mailbox: {
      title: 'Create User Mailboxes',
      description: `
        <p>Create mailboxes for users in Exchange.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Open Exchange Admin Center.</li>
          <li>Create mailboxes for existing AD users.</li>
          <li>Verify access via Outlook or OWA.</li>
        </ol>
      `
    },
    mail: {
      title: 'Setup Internal Mail Flow',
      description: `
        <p>Configure email delivery between users.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Configure Send and Receive Connectors.</li>
          <li>Test internal mail flow with test emails.</li>
          <li>Verify delivery reports in Exchange Admin Center.</li>
        </ol>
      `
    },
    external: {
      title: 'Publish Mail Externally',
      description: `
        <p>Enable secure external email access.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Configure MX, SPF, DKIM, and DMARC records.</li>
          <li>Enable modern authentication (OAuth 2.0).</li>
          <li>Setup TLS certificates and reverse DNS.</li>
        </ol>
      `
    },
    hybrid: {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <p>Integrate on-premises Exchange with Microsoft 365.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Configure Entra ID Connect for hybrid identity.</li>
          <li>Run Hybrid Configuration Wizard.</li>
          <li>Verify mail flow and calendar sharing.</li>
        </ol>
      `
    },
    hosting: {
      title: 'Choose Hosting Environment',
      description: `
        <p>Select Azure or on-premises for deployment.</p>
        <h3>Steps:</h3>
        <ol>
          <li>Evaluate Azure vs. on-premises costs.</li>
          <li>Configure Azure VMs or maintain on-premises setup.</li>
          <li>Migrate services if choosing Azure.</li>
        </ol>
      `
    }
  };

  tasks.forEach(task => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      const taskId = task.dataset.task;
      modalTitle.textContent = taskDetails[taskId].title;
      modalDescription.innerHTML = taskDetails[taskId].description;
      modal.style.display = 'flex';
      modal.focus();
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
    }
  });
}

function animateTimeline() {
  const weeks = document.querySelectorAll('.week');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  weeks.forEach(week => observer.observe(week));
}

function setupLogout() {
  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_BASE}/logout`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          window.location.href = '/login.html';
        }
      } catch (error) {
        showNotification('Logout failed', 'error');
      }
    });
  }
}

function validateRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    const password = form.querySelector('#password').value;
    const repeatPassword = form.querySelector('#repeatPassword').value;
    const email = form.querySelector('#email').value;

    if (password !== repeatPassword) {
      e.preventDefault();
      showNotification('Passwords do not match', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      e.preventDefault();
      showNotification('Password must be at least 8 characters with uppercase, lowercase, and numbers', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      e.preventDefault();
      showNotification('Invalid email format', 'error');
      return;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => handleFormSubmit(e, 'login', '/dashboard.html', 'loginForm'));
    setupPasswordToggle();
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (e) => handleFormSubmit(e, 'register', '/dashboard.html', 'registerForm'));
    setupPasswordToggle();
    validateRegisterForm();
  }

  if (document.querySelector('.timeline')) {
    fetchUserInfo();
    setupTaskModal();
    animateTimeline();
    setupLogout();
  }

  setupThemeToggle();

  if (loginForm || registerForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      showNotification(decodeURIComponent(error), 'error');
      history.replaceState(null, '', window.location.pathname);
    }

    fetchCsrfToken().then(token => {
      const csrfInput = document.getElementById('csrfToken');
      if (csrfInput) csrfInput.value = token;
    }).catch(() => showNotification('Failed to initialize form security', 'error'));
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (document.querySelector('.timeline')) {
        animateTimeline();
      }
    }, 200);
  });

  const modal = document.getElementById('taskModal');
  if (modal) {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  const images = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    });
    images.forEach(img => imageObserver.observe(img));
  }

  window.addEventListener('online', () => showNotification('Back online', 'success'));
  window.addEventListener('offline', () => showNotification('You are offline', 'error'));

  if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
  }
});