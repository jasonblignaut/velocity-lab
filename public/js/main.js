const notification = document.getElementById('notification');
const userInfo = document.getElementById('userInfo');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const logoutLink = document.getElementById('logout');
const timeline = document.getElementById('timeline');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalSubtasks = document.getElementById('modalSubtasks');
const modalResources = document.getElementById('modalResources');
const closeModalBtn = document.querySelector('.close-btn');
const avatarInput = document.getElementById('avatarInput');
const changeAvatarBtn = document.getElementById('changeAvatar');
const avatarImg = document.getElementById('avatar');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const leaderboard = document.getElementById('leaderboard');

const showNotification = (message, type) => {
  notification.textContent = message;
  notification.classList.remove('success', 'error', 'info');
  notification.classList.add(type, 'show');
  setTimeout(() => notification.classList.remove('show'), 3000);
};

const updateProgressBar = (progress) => {
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');
  if (progressBar && progressText) {
    progressBar.style.setProperty('--progress', `${progress}%`);
    progressText.textContent = `${progress}% Complete`;
  }
};

const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

const clearUser = () => {
  localStorage.removeItem('user');
};

const checkAuth = () => {
  const user = getUser();
  if (!user) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
};

const initDashboard = async () => {
  if (!checkAuth()) return;
  const user = getUser();
  userInfo.textContent = user.name;

  try {
    const response = await fetch('/api/progress');
    if (!response.ok) throw new Error('Failed to fetch progress');
    const progressData = await response.json();

    let totalTasks = 0;
    let completedTasks = 0;
    Object.values(progressData).forEach((week) => {
      Object.values(week).forEach((task) => {
        totalTasks++;
        if (task) completedTasks++;
      });
    });

    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    updateProgressBar(progress);

    timeline.innerHTML = '';
    weeks.forEach((week, weekIndex) => {
      const weekDiv = document.createElement('div');
      weekDiv.classList.add('week');
      weekDiv.innerHTML = `
        <div class="week-content">
          <div class="week-badge">${weekIndex + 1}</div>
          <div class="week-card">
            <div class="week-title">
              <span class="week-icon">${week.icon}</span>
              <h3>${week.title}</h3>
            </div>
            ${week.tasks
              .map(
                (task, taskIndex) => `
                  <div class="task" data-week="${weekIndex}" data-task="${taskIndex}">
                    <input type="checkbox" ${progressData[weekIndex]?.[taskIndex] ? 'checked' : ''}>
                    <span class="task-icon">${task.icon}</span>
                    <div class="task-content">
                      <h4>${task.title}</h4>
                      <p class="task-details">${task.details}</p>
                    </div>
                  </div>`
              )
              .join('')}
          </div>
        </div>
      `;
      timeline.appendChild(weekDiv);

      setTimeout(() => weekDiv.classList.add('animate'), 100 * weekIndex);
    });

    document.querySelectorAll('.task input[type="checkbox"]').forEach((checkbox) => {
      checkbox.addEventListener('change', async (e) => {
        const taskDiv = e.target.closest('.task');
        const weekIndex = taskDiv.dataset.week;
        const taskIndex = taskDiv.dataset.task;
        const checked = e.target.checked;

        try {
          await fetch('/api/progress', {
            method: 'POST',
            body: new URLSearchParams({ week: weekIndex, task: taskIndex, checked: checked.toString() }),
          });
          const response = await fetch('/api/progress');
          const updatedProgress = await response.json();
          let total = 0;
          let completed = 0;
          Object.values(updatedProgress).forEach((week) => {
            Object.values(week).forEach((task) => {
              total++;
              if (task) completed++;
            });
          });
          const progress = total ? Math.round((completed / total) * 100) : 0;
          updateProgressBar(progress);
        } catch (error) {
          console.error('Progress update error:', error);
          showNotification('Failed to update progress', 'error');
        }
      });
    });

    document.querySelectorAll('.task').forEach((task) => {
      task.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        const weekIndex = task.dataset.week;
        const taskIndex = task.dataset.task;
        const taskData = weeks[weekIndex].tasks[taskIndex];
        modalTitle.textContent = taskData.title;
        modalDescription.textContent = taskData.description || 'No description available.';
        modalSubtasks.innerHTML = taskData.subtasks
          ? taskData.subtasks.map((subtask, i) => `<li>${subtask}</li>`).join('')
          : '';
        modalResources.innerHTML = taskData.resources
          ? taskData.resources.map((res) => `<a href="${res.url}" target="_blank">${res.name}</a>`).join('<br>')
          : 'No resources available.';
        modal.style.display = 'flex';
      });
    });
  } catch (error) {
    console.error('Dashboard init error:', error);
    showNotification('Failed to load dashboard', 'error');
  }
};

const initAdminDashboard = async () => {
  if (!checkAuth()) return;
  const user = getUser();
  if (user.role !== 'admin') {
    window.location.href = '/dashboard.html';
    return;
  }
  userInfo.textContent = user.name;

  try {
    const response = await fetch('/api/admin/users-progress');
    if (!response.ok) throw new Error('Failed to fetch users progress');
    const usersProgress = await response.json();

    leaderboard.innerHTML = '';
    usersProgress
      .sort((a, b) => b.progress - a.progress)
      .forEach((user, index) => {
        const item = document.createElement('div');
        item.classList.add('leaderboard-item');
        item.innerHTML = `
          <div class="leaderboard-rank">${index + 1}</div>
          <div class="leaderboard-avatar">
            <img src="${user.avatar || '/assets/default-avatar.png'}" alt="${user.name}'s avatar">
          </div>
          <div class="leaderboard-details">
            <h4>${user.name}</h4>
            <p>Progress: ${user.progress}%</p>
            <div class="progress-bar" style="--progress: ${user.progress}%"></div>
          </div>
        `;
        leaderboard.appendChild(item);
      });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    showNotification('Failed to load leaderboard', 'error');
  }
};

const initProfile = async () => {
  if (!checkAuth()) return;
  const user = getUser();
  userInfo.textContent = user.name;
  profileName.textContent = user.name;
  profileEmail.textContent = user.email;

  try {
    const response = await fetch('/api/avatar');
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      avatarImg.src = url;
    }
  } catch (error) {
    console.error('Avatar fetch error:', error);
  }

  changeAvatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload avatar');
      const blob = await fetch('/api/avatar').then((res) => res.blob());
      avatarImg.src = URL.createObjectURL(blob);
      showNotification('Avatar updated successfully', 'success');
    } catch (error) {
      console.error('Avatar upload error:', error);
      showNotification('Failed to upload avatar', 'error');
    }
  });

  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = changePasswordForm.querySelector('button');
    const spinner = button.querySelector('.spinner');
    button.disabled = true;
    spinner.classList.add('active');

    const formData = new FormData(changePasswordForm);
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to change password');
      showNotification('Password changed successfully', 'success');
      changePasswordForm.reset();
    } catch (error) {
      console.error('Change password error:', error);
      showNotification(error.message || 'Failed to change password', 'error');
    } finally {
      button.disabled = false;
      spinner.classList.remove('active');
    }
  });
};

const weeks = [
  {
    title: 'Week 1: Ideation',
    icon: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>',
    tasks: [
      {
        title: 'Brainstorm Ideas',
        details: 'Come up with 5 potential project ideas.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm1 15h-2v-2h2zm0-4h-2V7h2z"/></svg>',
        description: 'Generate a list of 5 project ideas that align with your goals.',
        subtasks: ['Identify your interests', 'Research market needs', 'List 5 ideas'],
        resources: [
          { name: 'Ideation Guide', url: 'https://example.com/ideation' },
        ],
      },
      {
        title: 'Validate Ideas',
        details: 'Select the top 2 ideas and validate them.',
        icon: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-10 10 10 10 0 0010 10 10 10 0 0010-10A10 10 0 0012 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z"/></svg>',
      },
    ],
  },
  // Add more weeks as needed (total 14 tasks)
];

const init = () => {
  const path = window.location.pathname;
  if (path === '/dashboard.html') {
    initDashboard();
  } else if (path === '/admin.html') {
    initAdminDashboard();
  } else if (path === '/profile.html') {
    initProfile();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = loginForm.querySelector('button');
      const spinner = button.querySelector('.spinner');
      button.disabled = true;
      spinner.classList.add('active');

      const formData = new FormData(loginForm);
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Invalid credentials');
        const user = await response.json();
        setUser(user);
        window.location.href = '/dashboard.html';
      } catch (error) {
        showNotification(error.message || 'Login failed', 'error');
      } finally {
        button.disabled = false;
        spinner.classList.remove('active');
      }
    });
  }

  if (registerForm) {
    fetch('/api/csrf')
      .then((res) => res.json())
      .then((data) => {
        document.getElementById('csrf_token').value = data.token;
      });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = registerForm.querySelector('button');
      const spinner = button.querySelector('.spinner');
      button.disabled = true;
      spinner.classList.add('active');

      const formData = new FormData(registerForm);
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Registration failed');
        }
        const user = await response.json();
        setUser(user);
        window.location.href = '/dashboard.html';
      } catch (error) {
        showNotification(error.message || 'Registration failed', 'error');
      } finally {
        button.disabled = false;
        spinner.classList.remove('active');
      }
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('/api/logout', { method: 'POST' });
        clearUser();
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
      }
    });
  }

  if (modal) {
    closeModalBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
};

document.addEventListener('DOMContentLoaded', init);