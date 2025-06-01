// Enhanced Main.js for Velocity Lab
// Fixed password confirmation, admin portal stats, and mobile improvements

// Utility Functions with Performance Optimizations
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Enhanced Cookie Management
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
};

// Enhanced Notification System with Rich Animations
let notificationQueue = [];
let isNotificationActive = false;

const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = $('#notification');
  if (!notification) return;
  
  const notificationData = { message, type, duration };
  notificationQueue.push(notificationData);
  
  if (!isNotificationActive) {
    processNotificationQueue();
  }
};

const processNotificationQueue = async () => {
  const notification = $('#notification');
  if (!notification || notificationQueue.length === 0) {
    isNotificationActive = false;
    return;
  }
  
  isNotificationActive = true;
  const { message, type, duration } = notificationQueue.shift();
  
  // Enhanced notification with micro-animations
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  
  // Sophisticated entrance animation
  notification.style.transform = 'translateY(-30px) scale(0.95)';
  notification.style.opacity = '0';
  
  // Use requestAnimationFrame for smooth animations
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      notification.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      notification.style.transform = 'translateY(0) scale(1)';
      notification.style.opacity = '1';
      resolve();
    });
  });
  
  // Auto-dismiss with elegant exit animation
  setTimeout(async () => {
    notification.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    notification.style.transform = 'translateY(-20px) scale(0.95)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.className = 'notification';
      notification.textContent = '';
      notification.style.transform = '';
      notification.style.opacity = '';
      notification.style.transition = '';
      processNotificationQueue(); // Process next notification
    }, 300);
  }, duration);
};

// Enhanced CSRF Token Management
const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    const csrfInput = $('#csrfToken');
    if (csrfInput) csrfInput.value = data.token;
    return data.token;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    showNotification('Failed to initialize form. Please try again.', 'error');
    return null;
  }
};

// Advanced Form Submission with Rich Loading States
const handleFormSubmit = async (form, endpoint, isRegister = false) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector('.spinner');
  const buttonText = submitButton.querySelector('span') || submitButton;
  const originalText = buttonText.textContent;
  
  // Sophisticated loading state with micro-animations
  submitButton.disabled = true;
  submitButton.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  submitButton.style.transform = 'scale(0.98)';
  
  if (spinner) {
    spinner.classList.add('active');
    spinner.style.transform = 'scale(1.1)';
  }
  
  buttonText.textContent = isRegister ? 'Creating Account...' : 'Signing In...';
  
  // Add loading shimmer effect
  submitButton.style.background = 'linear-gradient(90deg, #007aff 25%, #5ac8fa 50%, #007aff 75%)';
  submitButton.style.backgroundSize = '200% 100%';
  submitButton.style.animation = 'shimmer 1.5s infinite';

  try {
    const formData = new FormData(form);
    
    // Enhanced client-side validation
    if (isRegister) {
      const password = formData.get('password');
      const repeatPassword = formData.get('repeatPassword');
      const email = formData.get('email');
      const name = formData.get('name');
      
      if (!name || name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (password !== repeatPassword) {
        throw new Error('Passwords do not match');
      }
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

    // Success animation with celebration
    submitButton.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
    submitButton.style.animation = 'none';
    buttonText.textContent = '✓ Success!';
    
    showNotification(`🎉 Welcome, ${data.name}!`, 'success', 3000);
    setCookie('user', JSON.stringify({ name: data.name, role: data.role }), 1);
    
    // Elegant page transition
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);
    }, 1500);
    
  } catch (error) {
    console.error(`${endpoint} error:`, error);
    
    // Error animation
    submitButton.style.background = 'linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)';
    submitButton.style.animation = 'shake 0.5s ease-in-out';
    buttonText.textContent = '✗ Error';
    
    showNotification(error.message || 'An error occurred.', 'error');
    
    // Reset button after error animation
    setTimeout(() => {
      resetButton();
    }, 2000);
  }
  
  function resetButton() {
    submitButton.disabled = false;
    submitButton.style.transform = '';
    submitButton.style.background = '';
    submitButton.style.animation = '';
    if (spinner) {
      spinner.classList.remove('active');
      spinner.style.transform = '';
    }
    buttonText.textContent = originalText;
  }
};

// Sophisticated Password Toggle with Smooth Animations
const setupPasswordToggle = () => {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      const svgPath = button.querySelector('svg path');
      const svgCircle = button.querySelector('svg circle');
      
      // Smooth micro-animation
      button.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      button.style.transform = 'scale(0.9) rotate(180deg)';
      
      setTimeout(() => {
        input.type = isPassword ? 'text' : 'password';
        
        if (isPassword) {
          // Show eye with slash
          svgPath.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24');
          if (svgCircle) svgCircle.style.display = 'none';
          
          // Add slash line
          const svg = button.querySelector('svg');
          if (!svg.querySelector('.slash-line')) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'slash-line');
            line.setAttribute('x1', '1');
            line.setAttribute('y1', '1');
            line.setAttribute('x2', '23');
            line.setAttribute('y2', '23');
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
          }
        } else {
          // Show normal eye
          svgPath.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
          if (svgCircle) svgCircle.style.display = 'block';
          
          // Remove slash line
          const slashLine = button.querySelector('.slash-line');
          if (slashLine) slashLine.remove();
        }
        
        button.style.transform = 'scale(1) rotate(0deg)';
      }, 100);
    });
  });
};

// Enhanced Form Initialization
const initLoginForm = () => {
  const loginForm = $('#loginForm');
  if (!loginForm) return;
  
  // Add enhanced form interactions
  addFormEnhancements(loginForm);
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, '/api/login');
  });
};

const initRegisterForm = () => {
  const registerForm = $('#registerForm');
  if (!registerForm) return;
  
  // Add enhanced form interactions
  addFormEnhancements(registerForm);
  
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(registerForm, '/api/register', true);
  });
};

// Enhanced Form Interactions
const addFormEnhancements = (form) => {
  const inputs = form.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', () => {
      input.style.transform = 'translateY(-1px)';
      input.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)';
    });
    
    input.addEventListener('blur', () => {
      input.style.transform = '';
      input.style.boxShadow = '';
    });
    
    // Add typing animation feedback
    input.addEventListener('input', () => {
      if (input.value.length > 0) {
        input.style.background = 'rgba(0, 122, 255, 0.02)';
      } else {
        input.style.background = '';
      }
    });
  });
};

// FIXED: Enhanced Profile Password Form with Success Confirmation
const initProfilePasswordForm = () => {
  const passwordForm = $('#passwordForm');
  if (!passwordForm) return;
  
  addFormEnhancements(passwordForm);
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner');
    const buttonText = submitButton.querySelector('span') || submitButton;
    const originalText = buttonText.textContent;
    const currentPassword = $('#currentPassword').value;
    const newPassword = $('#newPassword').value;
    const confirmPassword = $('#confirmPassword').value;
    
    // Enhanced client-side validation with animations
    const errors = [];
    
    if (!currentPassword) errors.push('Current password is required');
    if (!newPassword) errors.push('New password is required');
    if (newPassword.length < 8) errors.push('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) errors.push('New passwords do not match');
    if (currentPassword === newPassword) errors.push('New password must be different from current password');
    
    if (errors.length > 0) {
      // Animate form shake for validation errors
      passwordForm.style.animation = 'shake 0.5s ease-in-out';
      showNotification(errors[0], 'error');
      setTimeout(() => {
        passwordForm.style.animation = '';
      }, 500);
      return;
    }
    
    // Enhanced loading state
    submitButton.disabled = true;
    submitButton.style.transform = 'scale(0.98)';
    buttonText.textContent = 'Updating...';
    
    if (spinner) {
      spinner.classList.add('active');
      spinner.style.transform = 'scale(1.1)';
    }
    
    try {
      const token = await fetchCSRFToken();
      if (!token) return;
      
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('csrf_token', token);
      
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // FIXED: Enhanced success animation with clear confirmation
        submitButton.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
        buttonText.textContent = '✓ Updated!';
        
        // Clear success confirmation message
        showNotification('🔒 Password updated successfully! Your account is now more secure.', 'success', 6000);
        
        // Reset form with animation
        setTimeout(() => {
          passwordForm.reset();
          
          // Reset form fields with animation
          const inputs = passwordForm.querySelectorAll('input');
          inputs.forEach(input => {
            input.style.background = '';
            input.style.transition = 'all 0.3s ease';
            input.style.transform = 'scale(0.98)';
            setTimeout(() => {
              input.style.transform = '';
            }, 200);
          });
        }, 500);
        
        // Reset button after success
        setTimeout(() => {
          submitButton.style.background = '';
          buttonText.textContent = originalText;
          submitButton.style.transform = '';
        }, 3000);
        
      } else {
        throw new Error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Error animation
      submitButton.style.background = 'linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)';
      submitButton.style.animation = 'shake 0.5s ease-in-out';
      buttonText.textContent = '✗ Failed';
      
      showNotification(error.message, 'error');
      
      setTimeout(() => {
        submitButton.style.background = '';
        submitButton.style.animation = '';
        buttonText.textContent = originalText;
      }, 2000);
    } finally {
      submitButton.disabled = false;
      submitButton.style.transform = '';
      if (spinner) {
        spinner.classList.remove('active');
        spinner.style.transform = '';
      }
    }
  });
};

// Enhanced Progress Management
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

// Sophisticated Progress Bar with Celebration Effects
const updateProgressBar = () => {
  const tasks = document.querySelectorAll('.task input[type="checkbox"]');
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter((task) => task.checked).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');
  
  if (progressBar) {
    // Smooth animated progress update
    progressBar.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    progressBar.style.setProperty('--progress', `${percentage}%`);
    progressBar.setAttribute('aria-valuenow', percentage);
    
    // Add glow effect for high progress
    if (percentage >= 75) {
      progressBar.style.filter = 'drop-shadow(0 0 8px rgba(0, 122, 255, 0.4))';
    } else {
      progressBar.style.filter = '';
    }
  }
  
  if (progressText) {
    // Animate the text change
    progressText.style.transition = 'all 0.3s ease';
    progressText.style.transform = 'scale(0.9)';
    progressText.style.opacity = '0.7';
    
    setTimeout(() => {
      progressText.textContent = `${percentage}% Completed`;
      progressText.style.transform = 'scale(1)';
      progressText.style.opacity = '1';
    }, 150);
  }
  
  // Milestone celebrations with confetti-like effects
  if (percentage === 100 && completedTasks === totalTasks) {
    triggerCelebration();
    showNotification('🎉 Outstanding! You completed all training modules!', 'success', 8000);
  } else if (percentage > 0 && percentage % 25 === 0) {
    triggerMilestone(percentage);
    showNotification(`🚀 Excellent progress! ${percentage}% complete`, 'success');
  }
};

// Celebration Effects
const triggerCelebration = () => {
  // Create confetti-like effect
  for (let i = 0; i < 50; i++) {
    createConfetti();
  }
  
  // Animate progress bar with celebration
  const progressBar = $('#progressBar');
  if (progressBar) {
    progressBar.style.animation = 'celebrate 2s ease-in-out';
    setTimeout(() => {
      progressBar.style.animation = '';
    }, 2000);
  }
};

const triggerMilestone = (percentage) => {
  // Create smaller celebration for milestones
  for (let i = 0; i < 20; i++) {
    createConfetti(true);
  }
};

const createConfetti = (small = false) => {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = small ? '4px' : '8px';
  confetti.style.height = small ? '4px' : '8px';
  confetti.style.background = ['#007aff', '#34c759', '#ff9500', '#ff3b30'][Math.floor(Math.random() * 4)];
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-10px';
  confetti.style.borderRadius = '50%';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.style.animation = `confetti ${2 + Math.random() * 2}s ease-out forwards`;
  
  document.body.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, 4000);
};

// Enhanced Progress Sync with Optimistic Updates
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
    
    // Trigger success micro-animation
    const taskElement = document.querySelector(`[data-week="${week}"][data-task="${task}"]`).closest('.task');
    if (taskElement && checked) {
      taskElement.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      taskElement.style.transform = 'scale(1.02)';
      taskElement.style.background = 'rgba(52, 199, 89, 0.1)';
      
      setTimeout(() => {
        taskElement.style.transform = '';
        taskElement.style.background = '';
      }, 300);
    }
    
  } catch (error) {
    console.error('Progress sync error:', error);
    showNotification('Failed to save progress. Changes may be lost.', 'error');
    
    // Revert the checkbox state on failure
    const checkbox = document.querySelector(`[data-week="${week}"][data-task="${task}"]`);
    if (checkbox) {
      checkbox.checked = !checked;
    }
  }
};

// Enhanced Dashboard with Sophisticated Animations
const initDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    // Smooth redirect with transition
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 300);
    return;
  }

  // FIXED: Enhanced user info display without role in brackets
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      // Animate user info update - REMOVED role display
      userInfo.style.transition = 'all 0.3s ease';
      userInfo.style.opacity = '0';
      setTimeout(() => {
        userInfo.textContent = profileData.name; // FIXED: No role in brackets
        userInfo.style.opacity = '1';
      }, 150);
      
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
        adminLink.style.animation = 'fadeIn 0.5s ease';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = user.name; // FIXED: No role in brackets
  }
  
  // Enhanced logout with smooth transitions
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Loading state for logout
    logoutLink.style.transition = 'all 0.3s ease';
    logoutLink.style.transform = 'scale(0.95)';
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('✓ Logged out successfully', 'success', 2000);
        
        // Elegant page transition
        setTimeout(() => {
          document.body.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 800);
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout properly', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
      logoutLink.style.transform = '';
    }
  });

  // Load and display progress with enhanced interactions
  try {
    const progress = await fetchProgress();
    const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
    
    if (checkboxes.length === 0) {
      console.log('No task checkboxes found - may not be on dashboard page');
      return;
    }
    
    checkboxes.forEach((checkbox) => {
      const week = checkbox.dataset.week;
      const task = checkbox.dataset.task;
      if (progress[week]?.[task]) {
        checkbox.checked = true;
      }
      
      // Enhanced checkbox interactions with micro-animations
      checkbox.addEventListener('change', (e) => {
        const taskElement = e.target.closest('.task');
        
        // Sophisticated visual feedback
        if (e.target.checked) {
          // Success animation
          taskElement.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          taskElement.style.transform = 'scale(1.03)';
          taskElement.style.background = 'rgba(52, 199, 89, 0.08)';
          
          // Add completion checkmark animation
          const taskIcon = taskElement.querySelector('.task-icon');
          if (taskIcon) {
            taskIcon.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
            taskIcon.style.transform = 'scale(1.1) rotate(5deg)';
          }
          
          setTimeout(() => {
            taskElement.style.transform = '';
            taskElement.style.background = '';
            if (taskIcon) {
              taskIcon.style.transform = '';
              setTimeout(() => {
                taskIcon.style.background = '';
              }, 200);
            }
          }, 400);
        } else {
          // Unchecked animation
          taskElement.style.transition = 'all 0.2s ease';
          taskElement.style.transform = 'scale(0.98)';
          setTimeout(() => {
            taskElement.style.transform = '';
          }, 200);
        }
        
        syncProgress(week, task, checkbox.checked);
        updateProgressBar();
      });
    });

    updateProgressBar();
  } catch (error) {
    console.error('Dashboard progress initialization error:', error);
  }

  // Enhanced timeline animation with staggered reveals
  const weekElements = document.querySelectorAll('.week');
  if (weekElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate');
              // Add additional animation for the week badge
              const badge = entry.target.querySelector('.week-badge');
              if (badge) {
                badge.style.animation = 'bounceIn 0.6s ease-out';
              }
            }, index * 150); // Staggered animation
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );
    
    weekElements.forEach((week) => observer.observe(week));
  }
};

// Enhanced Profile Initialization
const initProfile = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // FIXED: Similar enhanced user info logic as dashboard - no role in brackets
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      userInfo.textContent = profileData.name; // FIXED: No role in brackets
      
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = user.name; // FIXED: No role in brackets
  }
  
  // Enhanced logout for profile page (same as dashboard)
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    logoutLink.style.transition = 'all 0.3s ease';
    logoutLink.style.transform = 'scale(0.95)';
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('✓ Logged out successfully', 'success', 2000);
        
        setTimeout(() => {
          document.body.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 800);
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout properly', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
      logoutLink.style.transform = '';
    }
  });

  // Load profile data with enhanced animations
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      
      // Animate profile data loading
      const profileElements = [
        { id: 'profileName', value: profileData.name },
        { id: 'profileEmail', value: profileData.email },
        { id: 'profileRole', value: profileData.role },
        { id: 'profileJoined', value: new Date(profileData.createdAt).toLocaleDateString() },
        { id: 'totalProgress', value: `${profileData.progress}%` },
        { id: 'completedTasks', value: `${profileData.completedTasks}/${profileData.totalTasks}` }
      ];
      
      profileElements.forEach((element, index) => {
        const el = $(`#${element.id}`);
        if (el) {
          setTimeout(() => {
            el.style.transition = 'all 0.3s ease';
            el.style.opacity = '0';
            setTimeout(() => {
              el.textContent = element.value;
              el.style.opacity = '1';
            }, 150);
          }, index * 100);
        }
      });
      
      // Animate current week calculation
      const currentWeek = $('#currentWeek');
      if (currentWeek) {
        const weekNumber = Math.min(Math.floor(profileData.completedTasks / 3.5) + 1, 4);
        setTimeout(() => {
          currentWeek.style.transition = 'all 0.3s ease';
          currentWeek.style.opacity = '0';
          setTimeout(() => {
            currentWeek.textContent = `Week ${weekNumber}`;
            currentWeek.style.opacity = '1';
          }, 150);
        }, 600);
      }
    }
  } catch (error) {
    console.error('Profile load error:', error);
    showNotification('Failed to load profile data', 'error');
  }
  
  // Initialize password change form
  initProfilePasswordForm();
};

// Enhanced Modal with Sophisticated Animations
const initModal = () => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const closeModal = $('#closeModal');

  if (!modal || !modalTitle || !modalDescription || !closeModal) return;

  const taskElements = document.querySelectorAll('.task');
  
  if (taskElements.length === 0) {
    console.log('No task elements found - may not be on dashboard page');
    return;
  }

  // Enhanced task modal content
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
          <li>Set the DNS server to the DC's IP address.</li>
          <li>Join the domain via System Properties (Computer Name).</li>
        </ol>
      `,
    },
    'week1-share': {
      title: 'Configure Network Share on DC',
      description: `
        <p>Create a centralized file storage with secure access on the Domain Controller.</p>
        <h3>Steps</h3>
        <ol>
          <li>Create a shared folder (e.g., \\\\DC\\Share$).</li>
          <li>Set NTFS and share permissions for the security group.</li>
          <li>Map drives using GPO, PowerShell, or logon scripts.</li>
        </ol>
        <p><strong>Tip:</strong> Use hidden shares (with $ suffix) for restricted access.</p>
      `,
    },
    'week1-group': {
      title: 'Create Security Group',
      description: `
        <p>Restrict network share access to authorized users via a security group.</p>
        <h3>Steps</h3>
        <ol>
          <li>Open Active Directory Users and Computers.</li>
          <li>Create a new security group (e.g., ShareAccess).</li>
          <li>Add users to the group and assign permissions to the share.</li>
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
          <li>Configure roles as needed (e.g., secondary DC).</li>
        </ol>
      `,
    },
    'week2-wsus': {
      title: 'Setup WSUS',
      description: `
        <p>Manage updates with Windows Server Update Services.</p>
        <h3>Steps</h3>
        <ol>
          <li>Install WSUS role on a server.</li>
          <li>Configure update sources and client policies via GPO.</li>
          <li>Approve and test updates.</li>
        </ol>
      `,
    },
    'week2-time': {
      title: 'Configure Two Time Servers',
      description: `
        <p>Ensure time synchronization across the domain.</p>
        <h3>Steps</h3>
        <ol>
          <li>Configure the primary DC as the PDC Emulator to sync with an external NTP server.</li>
          <li>Set a secondary server as a backup time source.</li>
          <li>Verify time sync with <code>w32tm /query /status</code>.</li>
        </ol>
      `,
    },
    'week3-upgrade': {
      title: 'Upgrade Servers to 2016',
      description: `
        <p>Modernize infrastructure by upgrading to Server 2016.</p>
        <h3>Steps</h3>
        <ol>
          <li>Back up existing servers.</li>
          <li>Perform an in-place upgrade or migrate to new Server 2016 VMs.</li>
          <li>Verify AD and DNS functionality post-upgrade.</li>
        </ol>
      `,
    },
    'week3-exchange': {
      title: 'Install Exchange Server 2019',
      description: `
        <p>Deploy email services on a third server.</p>
        <h3>Steps</h3>
        <ol>
          <li>Install Exchange Server 2019 prerequisites.</li>
          <li>Run the Exchange setup and configure mailbox roles.</li>
          <li>Test connectivity and services.</li>
        </ol>
      `,
    },
    'week3-mailbox': {
      title: 'Create User Mailboxes',
      description: `
        <p>Set up email accounts for users.</p>
        <h3>Steps</h3>
        <ol>
          <li>Open Exchange Admin Center.</li>
          <li>Create mailboxes for domain users.</li>
          <li>Test email sending/receiving.</li>
        </ol>
      `,
    },
    'week3-mail': {
      title: 'Setup Internal Mail Flow',
      description: `
        <p>Enable email delivery between users.</p>
        <h3>Steps</h3>
        <ol>
          <li>Configure accepted domains and email address policies.</li>
          <li>Set up send/receive connectors.</li>
          <li>Test internal mail flow.</li>
        </ol>
      `,
    },
    'week4-external': {
      title: 'Publish Mail Externally',
      description: `
        <p>Enable secure external email access.</p>
        <h3>Steps</h3>
        <ol>
          <li>Configure DNS records (MX, SPF, DKIM, DMARC).</li>
          <li>Enable modern authentication (OAuth 2.0).</li>
          <li>Install TLS certificates and set up reverse DNS.</li>
        </ol>
      `,
    },
    'week4-hybrid': {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <p>Integrate on-premises Exchange with Microsoft 365.</p>
        <h3>Steps</h3>
        <ol>
          <li>Install and configure Entra ID Connect.</li>
          <li>Run the Hybrid Configuration Wizard.</li>
          <li>Verify mail flow and calendar sharing.</li>
        </ol>
      `,
    },
  };

  taskElements.forEach((task) => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      
      const weekElement = task.closest('.week');
      if (!weekElement) return;
      
      const week = weekElement.dataset.week;
      const taskId = task.dataset.task;
      const key = `${week}-${taskId}`;
      const content = taskModalContent[key] || {
        title: 'Task Details',
        description: '<p>No details available.</p>',
      };
      
      modalTitle.textContent = content.title;
      modalDescription.innerHTML = content.description;
      
      // Sophisticated modal opening animation
      modal.style.display = 'flex';
      modal.style.opacity = '0';
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.transform = 'scale(0.9) translateY(20px)';
      }
      
      requestAnimationFrame(() => {
        modal.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        modal.style.opacity = '1';
        if (modalContent) {
          modalContent.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          modalContent.style.transform = 'scale(1) translateY(0)';
        }
      });
      
      modal.focus();
    });

    // Enhanced keyboard accessibility
    task.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        task.click();
      }
    });
  });

  // Enhanced modal closing with animation
  const closeModalFunction = () => {
    const modalContent = modal.querySelector('.modal-content');
    
    modal.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    modal.style.opacity = '0';
    
    if (modalContent) {
      modalContent.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      modalContent.style.transform = 'scale(0.95) translateY(10px)';
    }
    
    setTimeout(() => {
      modal.style.display = 'none';
      if (modalContent) {
        modalContent.style.transform = '';
      }
      modal.style.transition = '';
    }, 300);
  };

  closeModal.addEventListener('click', closeModalFunction);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunction();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModalFunction();
    }
  });
};

// Navigation Enhancement with Smooth Scrolling
const enhanceNavigation = () => {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// Add CSS animations via JavaScript
const addCustomAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes confetti {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    @keyframes celebrate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

// FIXED: Global VelocityLab object for admin functions
window.VelocityLab = {
  showNotification,
  refreshLeaderboard: () => {
    if (typeof loadUsersProgress === 'function') loadUsersProgress();
  },
  exportData: () => {
    if (typeof exportData === 'function') exportData();
  },
  addAdmin: () => {
    const email = prompt('Enter email address to grant admin access:');
    if (email) {
      showNotification('Admin access management available in user modal', 'info');
    }
  },
  triggerCelebration: () => triggerCelebration(),
  triggerMilestone: (percentage) => triggerMilestone(percentage)
};

// FIXED: Make showNotification globally available
window.showNotification = showNotification;

// Enhanced Initialization with Performance Optimization
const init = () => {
  console.log('🚀 Initializing Velocity Lab with enhanced UX...');
  
  // Add custom animations
  addCustomAnimations();
  
  // Initialize components with error handling
  const components = [
    { name: 'Password Toggle', fn: setupPasswordToggle },
    { name: 'Login Form', fn: initLoginForm },
    { name: 'Register Form', fn: initRegisterForm },
    { name: 'Dashboard', fn: initDashboard },
    { name: 'Profile', fn: initProfile },
    { name: 'Modal', fn: initModal },
    { name: 'Navigation', fn: enhanceNavigation }
  ];
  
  components.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✅ ${name} initialized`);
    } catch (error) {
      console.warn(`⚠️  ${name} initialization failed:`, error);
    }
  });
  
  // Sophisticated page entrance animation
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  });
  
  // Initialize performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`🎯 Velocity Lab loaded in ${Math.round(loadTime)}ms`);
    });
  }
  
  console.log('✨ Velocity Lab initialization complete with enhanced UX');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}