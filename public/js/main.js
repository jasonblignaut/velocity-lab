// Function to show notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Fetch CSRF token for form submissions
async function fetchCSRFToken() {
    try {
        const response = await fetch('/csrf-token');
        const { csrfToken } = await response.json();
        document.querySelectorAll('input[name="ta.csrf_token"]').forEach(input => {
            input.value = csrfToken;
        });
    } catch (error) {
        showNotification('Error initializing form. Try refreshing the page.', 'error');
        throw error;
    }
}

// Handle form submission with notification
async function handleFormSubmit(event, url) {
    event.preventDefault();
    showNotification('Processing...', 'loading');

    if (url === '/register') {
        const password = event.target.querySelector('#password').value;
        const repeatPassword = event.target.querySelector('#repeatPassword').value;
        if (password !== repeatPassword) {
            document.getElementById('passwordMatchError').style.display = 'block';
            return;
        } else {
            document.getElementById('passwordMatchError').style.display = 'none';
        }
    }

    try {
        const formData = new FormData(event.target);
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (url === '/register') {
            showNotification('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else if (url === '/login') {
            localStorage.setItem('userName', data.name);
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
        }
    } catch (error) {
        showNotification(error.message || 'An error occurred. Please try again.', 'error');
    }
}

// Initialize forms
if (document.getElementById('registerForm')) {
    fetchCSRFToken();
    document.getElementById('registerForm').addEventListener('submit', (event) => handleFormSubmit(event, '/register'));
}

if (document.getElementById('loginForm')) {
    fetchCSRFToken();
    document.getElementById('loginForm').addEventListener('submit', (event) => handleFormSubmit(event, '/login'));
}

// Handle logout
if (document.getElementById('logout')) {
    document.getElementById('logout').addEventListener('click', () => {
        document.cookie = 'session=; Max-Age=0; Path=/; SameSite=Strict';
        localStorage.removeItem('userName');
        window.location.href = '/index.html';
    });
}

// Display user name on dashboard
if (document.getElementById('userInfo')) {
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('userInfo').textContent = `Welcome, ${userName}`;
    } else {
        window.location.href = '/login.html';
    }
}

// Dashboard-specific functions
function updateProgress(checkboxes, totalTasks, progressBar, progressText) {
    const checkedTasks = document.querySelectorAll('.task input[type="checkbox"]:checked').length;
    const percentage = Math.round((checkedTasks / totalTasks) * 100);
    progressBar.style.setProperty('--progress', `${percentage}%`);
    progressText.textContent = `${percentage}% Completed`;
}

async function loadProgress(checkboxes, updateProgressCallback) {
    try {
        const response = await fetch('/api/progress', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to load progress');
        const progress = await response.json();
        Object.keys(progress).forEach(week => {
            Object.keys(progress[week]).forEach(task => {
                const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
                if (checkbox) checkbox.checked = progress[week][task];
            });
        });
        updateProgressCallback();
    } catch (error) {
        showNotification('Failed to load progress. Please try again.', 'error');
    }
}

// Dashboard functionality
if (document.querySelector('.timeline')) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
    const totalTasks = checkboxes.length;

    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeModal = document.getElementById('closeModal');

    const taskIdToModalId = {
        'dc': 'promote-dc',
        'vm': 'join-vm',
        'share': 'network-share',
        'group': 'security-group',
        // Add more mappings as necessary
    };

    const taskDetails = {
        // Add task details as per your original code
    };

    // Save progress on checkbox change
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async () => {
            const week = checkbox.dataset.week;
            const task = checkbox.dataset.task;
            try {
                const formData = new FormData();
                formData.append('week', week);
                formData.append('task', task);
                formData.append('checked', checkbox.checked.toString());
                const response = await fetch('/api/progress', {
                    method: 'POST',
                    body: formData,
                });
                if (!response.ok) throw new Error('Failed to save progress');
                updateProgress(checkboxes, totalTasks, progressBar, progressText);
            } catch (error) {
                checkbox.checked = !checkbox.checked; // Revert on error
                showNotification('Failed to save progress. Please try again.', 'error');
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
}