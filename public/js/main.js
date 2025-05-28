async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/csrf', { method: 'GET' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const { token } = await response.json();
    document.getElementById('csrfToken').value = token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    alert('Error initializing form. Try refreshing the page.');
  }
}

async function handleFormSubmit(event, url) {
  event.preventDefault();
  try {
    const formData = new FormData(event.target);
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const message = await response.text();
    alert(message);
    if (response.ok && url === '/register') {
      window.location.href = '/login.html';
    } else if (response.ok && url === '/login') {
      window.location.href = '/dashboard.html';
    } else {
      throw new Error('Request failed');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    alert('An error occurred. Please try again.');
  }
}

if (document.getElementById('registerForm')) {
  fetchCSRFToken();
  document.getElementById('registerForm').addEventListener('submit', (event) => handleFormSubmit(event, '/register'));
}

if (document.getElementById('loginForm')) {
  fetchCSRFToken();
  document.getElementById('loginForm').addEventListener('submit', (event) => handleFormSubmit(event, '/login'));
}

if (document.getElementById('logout')) {
  document.getElementById('logout').addEventListener('click', async () => {
    document.cookie = 'session=; Max-Age=0; Path=/; SameSite=Strict';
    window.location.href = '/index.html';
  });
}

if (document.querySelector('.timeline')) {
  async function loadProgress() {
    try {
      const response = await fetch('/api/progress', { credentials: 'include' });
      if (response.ok) {
        const progress = await response.json();
        Object.keys(progress).forEach((week) => {
          Object.keys(progress[week]).forEach((task) => {
            const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
            if (checkbox) {
              checkbox.checked = progress[week][task];
            }
          });
        });
      } else {
        console.error('Failed to load progress:', response.statusText);
        alert('Please log in to view progress.');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      alert('Error loading progress. Please try again.');
    }
  }

  async function updateProgress(checkbox) {
    try {
      const formData = new FormData();
      formData.append('week', checkbox.dataset.week);
      formData.append('task', checkbox.dataset.task);
      formData.append('checked', checkbox.checked.toString());
      const response = await fetch('/progress', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Error saving progress. Please try again.');
      checkbox.checked = !checkbox.checked;
    }
  }

  loadProgress();
  document.querySelectorAll('.task input[type="checkbox"]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => updateProgress(checkbox));
  });
}