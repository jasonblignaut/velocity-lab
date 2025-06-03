// public/js/utils.js
// Shared utility functions for Velocity Lab

// Only declare functions if they don't already exist
if (typeof window.VelocitySharedUtils === 'undefined') {
  window.VelocitySharedUtils = {
    // Cookie utilities
    getCookie: function(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    },

    setCookie: function(name, value, days = 7) {
      const expires = new Date();
      expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
      document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },

    deleteCookie: function(name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    },

    // API utilities
    apiCall: async function(endpoint, options = {}) {
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        }
      };

      const csrfToken = this.getCookie('csrf_token');
      if (csrfToken) {
        defaultOptions.headers['X-CSRF-Token'] = csrfToken;
      }

      const mergedOptions = { ...defaultOptions, ...options };
      if (options.headers) {
        mergedOptions.headers = { ...defaultOptions.headers, ...options.headers };
      }

      try {
        const response = await fetch(endpoint, mergedOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('API call failed:', error);
        throw error;
      }
    },

    // Session utilities
    checkSession: async function() {
      try {
        const response = await this.apiCall('/api/profile');
        return response.success;
      } catch (error) {
        console.error('Session check failed:', error);
        return false;
      }
    },

    logout: async function() {
      try {
        await this.apiCall('/api/logout', { method: 'POST' });
        this.deleteCookie('session');
        this.deleteCookie('csrf_token');
        window.location.href = '/login.html';
      } catch (error) {
        console.error('Logout failed:', error);
        // Force logout on client side even if server fails
        this.deleteCookie('session');
        this.deleteCookie('csrf_token');
        window.location.href = '/login.html';
      }
    },

    // UI utilities
    showNotification: function(message, type = 'info', duration = 5000) {
      // Remove existing notifications
      const existing = document.querySelectorAll('.velocity-notification');
      existing.forEach(n => n.remove());

      const notification = document.createElement('div');
      notification.className = `velocity-notification velocity-notification-${type}`;
      notification.innerHTML = `
        <div class="velocity-notification-content">
          <span class="velocity-notification-message">${message}</span>
          <button class="velocity-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;

      // Add styles if not already present
      if (!document.getElementById('velocity-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'velocity-notification-styles';
        styles.textContent = `
          .velocity-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            max-width: 500px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: slideIn 0.3s ease-out;
          }
          .velocity-notification-info {
            background: #3b82f6;
            color: white;
          }
          .velocity-notification-success {
            background: #10b981;
            color: white;
          }
          .velocity-notification-warning {
            background: #f59e0b;
            color: white;
          }
          .velocity-notification-error {
            background: #ef4444;
            color: white;
          }
          .velocity-notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .velocity-notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin-left: 16px;
          }
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `;
        document.head.appendChild(styles);
      }

      document.body.appendChild(notification);

      if (duration > 0) {
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, duration);
      }
    },

    // Form utilities
    validateEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    validatePassword: function(password) {
      if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
      }
      return { valid: true };
    },

    // Progress utilities
    updateProgressBar: function(elementId, percentage) {
      const progressBar = document.getElementById(elementId);
      if (progressBar) {
        const progressFill = progressBar.querySelector('.progress-fill') || progressBar.querySelector('.progress-bar-fill');
        if (progressFill) {
          progressFill.style.width = `${percentage}%`;
        }
        
        const progressText = progressBar.querySelector('.progress-text');
        if (progressText) {
          progressText.textContent = `${percentage}%`;
        }
      }
    },

    // Date utilities
    formatDate: function(dateString) {
      if (!dateString) return 'Never';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      
      return date.toLocaleDateString();
    },

    formatDateTime: function(dateString) {
      if (!dateString) return 'Never';
      const date = new Date(dateString);
      return date.toLocaleString();
    },

    // Loading utilities
    showLoading: function(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="velocity-loading">
            <div class="velocity-spinner"></div>
            <span>Loading...</span>
          </div>
        `;
        
        // Add loading styles if not present
        if (!document.getElementById('velocity-loading-styles')) {
          const styles = document.createElement('style');
          styles.id = 'velocity-loading-styles';
          styles.textContent = `
            .velocity-loading {
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              color: #6b7280;
            }
            .velocity-spinner {
              width: 20px;
              height: 20px;
              border: 2px solid #e5e7eb;
              border-top: 2px solid #3b82f6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-right: 10px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `;
          document.head.appendChild(styles);
        }
      }
    },

    hideLoading: function(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const loading = element.querySelector('.velocity-loading');
        if (loading) {
          loading.remove();
        }
      }
    },

    // Navigation utilities
    setActiveNavItem: function(currentPage) {
      const navItems = document.querySelectorAll('.nav-item');
      navItems.forEach(item => {
        item.classList.remove('active');
        const link = item.querySelector('a');
        if (link && link.getAttribute('href').includes(currentPage)) {
          item.classList.add('active');
        }
      });
    },

    // Redirect utilities
    redirectIfNotAuthenticated: async function() {
      const isAuthenticated = await this.checkSession();
      if (!isAuthenticated) {
        window.location.href = '/login.html';
        return false;
      }
      return true;
    },

    redirectIfAuthenticated: async function() {
      const isAuthenticated = await this.checkSession();
      if (isAuthenticated) {
        window.location.href = '/dashboard.html';
        return false;
      }
      return true;
    }
  };

  // Legacy compatibility - expose functions globally for existing code
  window.getCookie = window.VelocitySharedUtils.getCookie;
  window.setCookie = window.VelocitySharedUtils.setCookie;
  window.deleteCookie = window.VelocitySharedUtils.deleteCookie;
  window.apiCall = window.VelocitySharedUtils.apiCall;
  window.checkSession = window.VelocitySharedUtils.checkSession;
  window.logout = window.VelocitySharedUtils.logout;
  window.showNotification = window.VelocitySharedUtils.showNotification;
  window.validateEmail = window.VelocitySharedUtils.validateEmail;
  window.validatePassword = window.VelocitySharedUtils.validatePassword;
  window.formatDate = window.VelocitySharedUtils.formatDate;
  window.redirectIfNotAuthenticated = window.VelocitySharedUtils.redirectIfNotAuthenticated;
  window.redirectIfAuthenticated = window.VelocitySharedUtils.redirectIfAuthenticated;
}