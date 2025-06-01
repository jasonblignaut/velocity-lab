// dashboard.ts

interface ProgressData {
  [week: string]: {
    [task: string]: boolean;
  };
}

const debounce = (func: Function, delay: number) => {
  let timeout: number | undefined;
  return (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const getProgressData = async (): Promise<ProgressData> => {
  const res = await fetch('/api/progress', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load progress data');
  return await res.json();
};

const saveProgressData = debounce(async (data: ProgressData) => {
  await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
}, 800);

const updateProgressBar = (total: number, completed: number) => {
  const percent = Math.round((completed / total) * 100);
  const progressBar = document.getElementById('progressBar')!;
  const progressText = document.getElementById('progressText')!;
  progressBar.style.width = `${percent}%`;
  progressBar.setAttribute('aria-valuenow', percent.toString());
  progressText.textContent = `${percent}% Completed`;
};

const initializeDashboard = async () => {
  try {
    // Load and display user info
    const userInfo = document.getElementById('userInfo');
    const res = await fetch('/api/session', { credentials: 'include' });
    if (res.ok) {
      const { username } = await res.json();
      if (userInfo) userInfo.textContent = `Welcome, ${username}`;
    }

    const progress = await getProgressData();

    const checkboxes = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    let totalTasks = checkboxes.length;
    let completedTasks = 0;

    const progressState: ProgressData = {};

    // Initialize checkbox states
    checkboxes.forEach(checkbox => {
      const week = checkbox.dataset.week!;
      const task = checkbox.dataset.task!;
      progressState[week] ??= {};
      if (progress[week]?.[task]) {
        checkbox.checked = true;
        completedTasks++;
        progressState[week][task] = true;
      }

      checkbox.addEventListener('change', () => {
        progressState[week][task] = checkbox.checked;
        completedTasks += checkbox.checked ? 1 : -1;
        updateProgressBar(totalTasks, completedTasks);
        saveProgressData(progressState);
      });
    });

    updateProgressBar(totalTasks, completedTasks);
  } catch (err) {
    console.error('Error initializing dashboard:', err);
    alert('There was a problem loading your progress. Please try again.');
  }
};

// Logout handler
document.getElementById('logout')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const res = await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include',
  });
  if (res.ok) {
    window.location.href = '/login.html';
  } else {
    alert('Logout failed.');
  }
});

window.addEventListener('DOMContentLoaded', initializeDashboard);
