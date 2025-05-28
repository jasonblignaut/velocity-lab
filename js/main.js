async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/csrf', { method: 'GET' });
    const data = await response.json();
    document.getElementById('csrf_token').value = data.csrf_token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
}

async function checkSession() {
  try {
    const response = await fetch('/api/session', {
      method: 'GET',
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
          usernameEl.textContent = `Welcome, ${data.user.name}`;
        }
        return data.user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking session:', error);
    return null;
  }
}

async function loadProgress(userId) {
  try {
    const response = await fetch(`/api/progress?userId=${userId}`, { method: 'GET' });
    const progress = await response.json();
    Object.keys(progress).forEach(week => {
      Object.keys(progress[week]).forEach(task => {
        const checkbox = document.querySelector(`input[data-task="${week}.${task}"]`);
        if (checkbox) {
          checkbox.checked = progress[week][task];
          if (checkbox.checked) {
            checkbox.parentElement.style.textDecoration = 'line-through';
            checkbox.parentElement.style.color = '#28a745';
          }
        }
      });
    });
  } catch (error) {
    console.error('Error loading progress:', error);
  }
}

function displayMessage(message, isError = false) {
  const messageEl = document.getElementById('message');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `message ${isError ? 'error' : 'success'}`;
    messageEl.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const logoutLink = document.getElementById('logout');

  if (registerForm || loginForm) {
    await fetchCSRFToken();
  }

  const user = await checkSession();
  if (user && (window.location.pathname === '/dashboard.html' || window.location.pathname === '/index.html')) {
    await loadProgress(user.id);
  } else if (user && (window.location.pathname === '/register.html' || window.location.pathname === '/login.html')) {
    window.location.href = '/dashboard.html';
  } else if (!user && window.location.pathname === '/dashboard.html') {
    window.location.href = '/login.html';
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(registerForm);
      try {
        const response = await fetch('/register', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.error) {
          displayMessage(data.error, true);
        } else {
          displayMessage(data.message);
          setTimeout(() => (window.location.href = '/login.html'), 2000);
        }
      } catch (error) {
        displayMessage('Server error', true);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      try {
        const response = await fetch('/login', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await response.json();
        if (data.error) {
          displayMessage(data.error, true);
        } else {
          displayMessage(data.message);
          localStorage.setItem('username', data.user.name);
          setTimeout(() => (window.location.href = '/dashboard.html'), 2000);
        }
      } catch (error) {
        displayMessage('Server error', true);
      }
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/logout', {
          method: 'POST',
          credentials: 'include',
        });
        localStorage.removeItem('username');
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Error logging out:', error);
      }
    });
  }

  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const user = await checkSession();
      if (!user) {
        window.location.href = '/login.html';
        return;
      }
      const taskPath = checkbox.dataset.task.split('.');
      const week = taskPath[0];
      const task = taskPath[1];
      const isChecked = checkbox.checked;

      try {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, week, task, completed: isChecked }),
        });
        checkbox.parentElement.style.textDecoration = isChecked ? 'line-through' : 'none';
        checkbox.parentElement.style.color = isChecked ? '#28a745' : '';
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    });
  });
});