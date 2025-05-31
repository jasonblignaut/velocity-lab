// Utility Functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() || null;
}

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  if (notification) {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    setTimeout(() => (notification.className = 'notification'), 3000);
  }
}

async function fetchWithAuth(url, options = {}) {
  const session = getCookie('session');
  if (!session) {
    window.location.href = '/login.html';
    return;
  }
  options.headers = {
    ...options.headers,
    'X-CSRF-Token': getCookie('csrf_token') || '',
  };
  const response = await fetch(url, options);
  if (response.status === 401) {
    window.location.href = '/login.html';
  }
  return response;
}

// Initialize Page
async function init() {
  const session = getCookie('session');
  if (!session) {
    if (!['/login.html', '/register.html'].includes(window.location.pathname)) {
      window.location.href = '/login.html';
    }
    return;
  }

  // Fetch user info
  const response = await fetchWithAuth('/api/login');
  if (response.ok) {
    const { name, role } = await response.json();
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
      userInfo.textContent = `Welcome, ${name}`;
    }
    if (role === 'admin') {
      const adminLink = document.getElementById('adminLink');
      if (adminLink) adminLink.style.display = 'block';
    }
  }

  // Fetch CSRF token
  const csrfResponse = await fetch('/api/csrf');
  if (csrfResponse.ok) {
    const { csrf_token } = await csrfResponse.json();
    document.cookie = `csrf_token=${csrf_token}; Path=/; SameSite=Strict`;
    const csrfInputs = document.querySelectorAll('input[name="csrf_token"]');
    csrfInputs.forEach(input => (input.value = csrf_token));
  }
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const button = loginForm.querySelector('button');
    button.disabled = true;
    button.querySelector('.spinner').classList.add('active');
    const formData = new FormData(loginForm);
    const response = await fetch('/api/login', {
      method: 'POST',
      body: formData,
    });
    button.disabled = false;
    button.querySelector('.spinner').classList.remove('active');
    if (response.ok) {
      window.location.href = '/dashboard.html';
    } else {
      const { error } = await response.json();
      showNotification(error, 'error');
    }
  });
}

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const password = registerForm.querySelector('#password').value;
    const repeatPassword = registerForm.querySelector('#repeatPassword').value;
    if (password !== repeatPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    const button = registerForm.querySelector('button');
    button.disabled = true;
    button.querySelector('.spinner').classList.add('active');
    const formData = new FormData(registerForm);
    const response = await fetch('/api/register', {
      method: 'POST',
      body: formData,
    });
    button.disabled = false;
    button.querySelector('.spinner').classList.remove('active');
    if (response.ok) {
      window.location.href = '/dashboard.html';
    } else {
      const { error } = await response.json();
      showNotification(error, 'error');
    }
  });
}

// Logout
const logoutLink = document.getElementById('logout');
if (logoutLink) {
  logoutLink.addEventListener('click', async e => {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login.html';
  });
}

// Dashboard Progress
const timeline = document.querySelector('.timeline');
if (timeline) {
  const response = await fetchWithAuth('/api/progress');
  if (response.ok) {
    const progress = await response.json();
    document.querySelectorAll('.week').forEach(weekEl => {
      const week = weekEl.dataset.week;
      const tasks = weekEl.querySelectorAll('input[type="checkbox"]');
      let completed = 0;
      tasks.forEach(task => {
        const taskId = task.dataset.task;
        task.checked = progress[week]?.[taskId] || false;
        if (task.checked) completed++;
        task.addEventListener('change', async () => {
          const formData = new FormData();
          formData.append('week', week);
          formData.append('task', taskId);
          formData.append('checked', task.checked);
          await fetchWithAuth('/api/progress', {
            method: 'POST',
            body: formData,
          });
          // Update progress bar
          const progressBar = weekEl.querySelector('.progress');
          const newCompleted = weekEl.querySelectorAll('input[type="checkbox"]:checked').length;
          progressBar.style.width = `${(newCompleted / tasks.length) * 100}%`;
        });
      });
      const progressBar = weekEl.querySelector('.progress');
      progressBar.style.width = `${(completed / tasks.length) * 100}%`;
    });
  }
}

// Admin Dashboard
const leaderboardBody = document.getElementById('leaderboardBody');
if (leaderboardBody) {
  const response = await fetchWithAuth('/api/admin/users');
  if (response.ok) {
    const users = await response.json();
    leaderboardBody.innerHTML = users
      .map(user => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.progress}%</td>
          <td>${user.completedTasks}/${user.totalTasks}</td>
        </tr>
      `)
      .join('');
  }
}

const addAdminForm = document.getElementById('addAdminForm');
if (addAdminForm) {
  addAdminForm.addEventListener('submit', async e => {
    e.preventDefault();
    const button = addAdminForm.querySelector('button');
    button.disabled = true;
    button.querySelector('.spinner').classList.add('active');
    const formData = new FormData(addAdminForm);
    formData.append('role', 'admin');
    const response = await fetchWithAuth('/api/register', {
      method: 'POST',
      body: formData,
    });
    button.disabled = false;
    button.querySelector('.spinner').classList.remove('active');
    if (response.ok) {
      showNotification('Admin added successfully', 'success');
      addAdminForm.reset();
    } else {
      const { error } = await response.json();
      showNotification(error, 'error');
    }
  });
}

// Profile Page
const avatarForm = document.getElementById('avatarForm');
if (avatarForm) {
  const avatarInput = document.getElementById('avatarInput');
  const uploadBtn = document.getElementById('uploadAvatarBtn');
  uploadBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetchWithAuth('/api/avatar', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const { url } = await response.json();
        document.getElementById('avatarPreview').src = url;
        showNotification('Avatar updated', 'success');
      } else {
        showNotification('Failed to upload avatar', 'error');
      }
    }
  });

  const profileResponse = await fetchWithAuth('/api/profile');
  if (profileResponse.ok) {
    const { name, email, avatar } = await profileResponse.json();
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileEmail').textContent = email;
    if (avatar) {
      document.getElementById('avatarPreview').src = avatar;
    }
  }
}

const passwordForm = document.getElementById('passwordForm');
if (passwordForm) {
  passwordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const newPassword = passwordForm.querySelector('#newPassword').value;
    const confirmPassword = passwordForm.querySelector('#confirmPassword').value;
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }
    const button = passwordForm.querySelector('button');
    button.disabled = true;
    button.querySelector('.spinner').classList.add('active');
    const formData = new FormData(passwordForm);
    const response = await fetchWithAuth('/api/profile/password', {
      method: 'POST',
      body: formData,
    });
    button.disabled = false;
    button.querySelector('.spinner').classList.remove('active');
    if (response.ok) {
      showNotification('Password updated', 'success');
      passwordForm.reset();
    } else {
      const { error } = await response.json();
      showNotification(error, 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', init);