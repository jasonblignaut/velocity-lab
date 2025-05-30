// public/js/main.js
document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
  const progressBar = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  const modal = document.getElementById('taskModal');
  const closeModal = document.querySelector('.close-button');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const totalTasks = checkboxes.length;

  const taskDetails = {
    task1Modal: { title: 'Introduction to the Course', description: '<p>Welcome to the course! This introductory module will cover the basics and what you can expect to learn.</p>' },
    task2Modal: { title: 'Core Concepts', description: '<p>Delve into the fundamental principles that underpin this subject. Understanding these concepts is crucial for आगे बढ़ने.</p>' },
    task3Modal: { title: 'Intermediate Concepts', description: '<p>Building on the basics, this section explores more complex ideas and their applications.</p>' },
    task4Modal: { title: 'Practice Exercises', description: '<p>Reinforce your learning with these hands-on exercises. Practice makes perfect!</p>' },
    task5Modal: { title: 'Advanced Topics', description: '<p>Explore the cutting edge of this field. This module covers the most recent developments and theories.</p>' },
    task6Modal: { title: 'Project Start', description: '<p>It\'s time to apply what you\'ve learned! This section outlines the initial steps for your project.</p>' },
  };

  const taskIdToModalId = {
    task1: 'task1Modal',
    task2: 'task2Modal',
    task3: 'task3Modal',
    task4: 'task4Modal',
    task5: 'task5Modal',
    task6: 'task6Modal',
  };

  // Function to update the progress bar
  function updateProgress(checkboxes, totalTasks, progressBar, progressText) {
    const completedTasks = Array.from(checkboxes).filter(cb => cb.checked).length;
    const progressPercentage = (completedTasks / totalTasks) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressText.textContent = `${Math.round(progressPercentage)}%`;
  }

  // Function to load progress from the server
  async function loadProgress(checkboxes, callback) {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      const response = await fetch('/functions/progress', {
        method: 'GET',
        headers: {
          'X-User-Email': userEmail
        }
      });

      if (response.ok) {
        const progressData = await response.json();
        checkboxes.forEach(checkbox => {
          const taskId = checkbox.parentElement.dataset.task;
          if (progressData && progressData[taskId]) {
            checkbox.checked = true;
          }
        });
        if (callback) {
          callback();
        }
      } else {
        console.error('Failed to load progress');
        // Optionally display an error message to the user
      }
    }
  }

  // Event listener for saving progress on checkbox change
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', async (event) => {
      const taskId = event.target.parentElement.dataset.task;
      const completed = event.target.checked;
      const userEmail = localStorage.getItem('userEmail');

      if (userEmail) {
        const formData = new FormData();
        formData.append('taskId', taskId);
        formData.append('completed', completed);

        const response = await fetch('/functions/progress', {
          method: 'POST',
          headers: {
            'X-User-Email': userEmail
          },
          body: formData,
        });

        if (!response.ok) {
          console.error('Failed to update progress');
          // Optionally display an error message to the user
        }
        updateProgress(checkboxes, totalTasks, progressBar, progressText);
      } else {
        console.error('User email not found, cannot save progress.');
        // Optionally redirect to login or display an error
      }
    });
  });

  // Modal functionality
  document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      const taskId = task.dataset.task;
      const modalId = taskIdToModalId[taskId];
      const details = taskDetails[modalId];
      if (details) {
        modalTitle.textContent = details.title;
        modalDescription.innerHTML = details.description;
        modal.style.display = 'flex';
        modal.focus();
      }
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });

  // Load progress on page load
  loadProgress(checkboxes, () => updateProgress(checkboxes, totalTasks, progressBar, progressText));

  // Animate weeks on scroll
  const weeks = document.querySelectorAll('.week');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    },
    { threshold: 0.2 }
  );
  weeks.forEach(week => observer.observe(week));
});