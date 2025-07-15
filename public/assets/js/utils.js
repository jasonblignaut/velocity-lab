/* ===================================================================
   Velocity Lab - Utility Functions
   Core helper functions for DOM manipulation, storage, validation, etc.
   =================================================================== */

const velocityUtils = {
    
    /* ===================================================================
       DOM Manipulation Utilities
       =================================================================== */

    /**
     * Get element by ID (shorthand)
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null
     */
    getId(id) {
        return document.getElementById(id);
    },

    /**
     * Query selector (shorthand)
     * @param {string} selector - CSS selector
     * @returns {HTMLElement|null} Element or null
     */
    qs(selector) {
        return document.querySelector(selector);
    },

    /**
     * Query selector all (shorthand)
     * @param {string} selector - CSS selector
     * @returns {NodeList} NodeList of elements
     */
    qsa(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * Add event listener with error handling
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} event - Event type
     * @param {function} handler - Event handler
     * @param {object} options - Event options
     */
    on(element, event, handler, options = {}) {
        const el = typeof element === 'string' ? this.getId(element) : element;
        if (el) {
            el.addEventListener(event, (e) => {
                try {
                    handler(e);
                } catch (error) {
                    console.error('Event handler error:', error);
                }
            }, options);
        } else {
            console.warn('Element not found for event binding:', element);
        }
    },

    /**
     * Create element with attributes
     * @param {string} tag - HTML tag name
     * @param {object} attributes - Element attributes
     * @param {string} content - Inner content
     * @returns {HTMLElement} Created element
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'dataset') {
                Object.keys(attributes[key]).forEach(dataKey => {
                    element.dataset[dataKey] = attributes[key][dataKey];
                });
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.innerHTML = content;
        }
        
        return element;
    },

    /**
     * Show element with optional animation
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} animationClass - CSS animation class
     */
    show(element, animationClass = '') {
        const el = typeof element === 'string' ? this.getId(element) : element;
        if (el) {
            el.classList.remove('hidden');
            if (animationClass) {
                el.classList.add(animationClass);
            }
        }
    },

    /**
     * Hide element with optional animation
     * @param {HTMLElement|string} element - Element or ID
     * @param {string} animationClass - CSS animation class
     */
    hide(element, animationClass = '') {
        const el = typeof element === 'string' ? this.getId(element) : element;
        if (el) {
            if (animationClass) {
                el.classList.add(animationClass);
                setTimeout(() => {
                    el.classList.add('hidden');
                    el.classList.remove(animationClass);
                }, 300); // Assuming 300ms animation
            } else {
                el.classList.add('hidden');
            }
        }
    },

    /**
     * Toggle element visibility
     * @param {HTMLElement|string} element - Element or ID
     */
    toggle(element) {
        const el = typeof element === 'string' ? this.getId(element) : element;
        if (el) {
            el.classList.toggle('hidden');
        }
    },

    /* ===================================================================
       Cookie Management
       =================================================================== */

    cookies: {
        /**
         * Set cookie with expiration
         * @param {string} name - Cookie name
         * @param {string} value - Cookie value
         * @param {number} days - Days until expiration
         */
        set(name, value, days = 30) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure`;
        },

        /**
         * Get cookie value
         * @param {string} name - Cookie name
         * @returns {string|null} Cookie value or null
         */
        get(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        },

        /**
         * Delete cookie
         * @param {string} name - Cookie name
         */
        delete(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
        },

        /**
         * Check if cookie exists
         * @param {string} name - Cookie name
         * @returns {boolean} True if cookie exists
         */
        exists(name) {
            return this.get(name) !== null;
        }
    },

    /* ===================================================================
       Local Storage Management
       =================================================================== */

    /**
     * Set localStorage item with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} Success status
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to set localStorage:', error);
            return false;
        }
    },

    /**
     * Get localStorage item with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Stored value or default
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to get localStorage:', error);
            return defaultValue;
        }
    },

    /**
     * Remove localStorage item
     * @param {string} key - Storage key
     */
    removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove localStorage:', error);
        }
    },

    /**
     * Clear all localStorage
     */
    clearStorage() {
        try {
            localStorage.clear();
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    },

    /* ===================================================================
       Validation Utilities
       =================================================================== */

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Validation result with score and feedback
     */
    validatePassword(password) {
        const result = {
            isValid: false,
            score: 0,
            feedback: []
        };

        if (!password) {
            result.feedback.push('Password is required');
            return result;
        }

        if (password.length < 8) {
            result.feedback.push('Password must be at least 8 characters long');
        } else {
            result.score += 1;
        }

        if (!/[a-z]/.test(password)) {
            result.feedback.push('Password must contain lowercase letters');
        } else {
            result.score += 1;
        }

        if (!/[A-Z]/.test(password)) {
            result.feedback.push('Password must contain uppercase letters');
        } else {
            result.score += 1;
        }

        if (!/\d/.test(password)) {
            result.feedback.push('Password must contain numbers');
        } else {
            result.score += 1;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.feedback.push('Password must contain special characters');
        } else {
            result.score += 1;
        }

        result.isValid = result.score >= 4;
        return result;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    },

    /**
     * Escape HTML entities
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /* ===================================================================
       Formatting Utilities
       =================================================================== */

    /**
     * Format date for display
     * @param {Date|string} date - Date to format
     * @param {object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
    },

    /**
     * Format time for display
     * @param {Date|string} time - Time to format
     * @param {boolean} includeSeconds - Include seconds in output
     * @returns {string} Formatted time
     */
    formatTime(time, includeSeconds = false) {
        const timeObj = time instanceof Date ? time : new Date(time);
        const options = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (includeSeconds) {
            options.second = '2-digit';
        }
        
        return new Intl.DateTimeFormat('en-US', options).format(timeObj);
    },

    /**
     * Format number with thousands separator
     * @param {number} num - Number to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted number
     */
    formatNumber(num, decimals = 0) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    /**
     * Format file size in human readable format
     * @param {number} bytes - File size in bytes
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted file size
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    /* ===================================================================
       URL and Query Utilities
       =================================================================== */

    /**
     * Get URL parameter value
     * @param {string} param - Parameter name
     * @returns {string|null} Parameter value or null
     */
    getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Set URL parameter without page reload
     * @param {string} param - Parameter name
     * @param {string} value - Parameter value
     */
    setUrlParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },

    /**
     * Remove URL parameter without page reload
     * @param {string} param - Parameter name
     */
    removeUrlParam(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    },

    /* ===================================================================
       Utility Functions
       =================================================================== */

    /**
     * Generate random ID
     * @param {number} length - ID length
     * @returns {string} Random ID
     */
    generateId(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Debounce function execution
     * @param {function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {function} Debounced function
     */
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function execution
     * @param {function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone object
     * @param {object} obj - Object to clone
     * @returns {object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Check if device is in dark mode
     * @returns {boolean} True if dark mode
     */
    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Failed to copy to clipboard:', error);
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackError) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement|string} element - Element or selector
     * @param {number} offset - Offset from top
     */
    scrollTo(element, offset = 0) {
        const el = typeof element === 'string' ? this.qs(element) : element;
        if (el) {
            const top = el.offsetTop - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        }
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @param {number} threshold - Visibility threshold (0-1)
     * @returns {boolean} True if in viewport
     */
    isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        const vertInView = (rect.top <= windowHeight * (1 - threshold)) && ((rect.top + rect.height) >= windowHeight * threshold);
        const horInView = (rect.left <= windowWidth * (1 - threshold)) && ((rect.left + rect.width) >= windowWidth * threshold);
        
        return vertInView && horInView;
    }
};

/* ===================================================================
   Global Export
   =================================================================== */

// Make available globally
if (typeof window !== 'undefined') {
    window.velocityUtils = velocityUtils;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = velocityUtils;
}