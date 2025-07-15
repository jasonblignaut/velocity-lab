/* ===================================================================
   Velocity Lab - Utility Functions
   Core utilities for cookie management, DOM helpers, and common functions
   =================================================================== */

/* ===================================================================
   Cookie Management System
   =================================================================== */
const velocityUtils = {
    cookies: {
        /**
         * Set a cookie with secure defaults
         * @param {string} name - Cookie name
         * @param {string} value - Cookie value
         * @param {number} days - Expiration in days (default: 30)
         */
        set(name, value, days = 30) {
            try {
                const expires = new Date();
                expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
                
                const cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict; Secure=${location.protocol === 'https:'}`;
                document.cookie = cookieString;
                
                console.log('Cookie set:', name);
            } catch (error) {
                console.error('Failed to set cookie:', name, error);
            }
        },

        /**
         * Get a cookie value
         * @param {string} name - Cookie name
         * @returns {string|null} Cookie value or null if not found
         */
        get(name) {
            try {
                const nameEQ = encodeURIComponent(name) + "=";
                const cookies = document.cookie.split(';');
                
                for (let i = 0; i < cookies.length; i++) {
                    let cookie = cookies[i];
                    while (cookie.charAt(0) === ' ') {
                        cookie = cookie.substring(1, cookie.length);
                    }
                    if (cookie.indexOf(nameEQ) === 0) {
                        return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
                    }
                }
                return null;
            } catch (error) {
                console.error('Failed to get cookie:', name, error);
                return null;
            }
        },

        /**
         * Delete a cookie
         * @param {string} name - Cookie name to delete
         */
        delete(name) {
            try {
                document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
                console.log('Cookie deleted:', name);
            } catch (error) {
                console.error('Failed to delete cookie:', name, error);
            }
        },

        /**
         * Check if cookies are enabled
         * @returns {boolean} True if cookies are enabled
         */
        isEnabled() {
            try {
                const testCookie = 'velocity_test';
                this.set(testCookie, 'test', 1);
                const enabled = this.get(testCookie) === 'test';
                this.delete(testCookie);
                return enabled;
            } catch (error) {
                return false;
            }
        }
    },

    /* ===================================================================
       DOM Manipulation Helpers
       =================================================================== */

    /**
     * Get element by ID with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} Element or null if not found
     */
    getId(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn('Element not found:', id);
            }
            return element;
        } catch (error) {
            console.error('Error getting element:', id, error);
            return null;
        }
    },

    /**
     * Get elements by class name
     * @param {string} className - Class name
     * @param {HTMLElement} parent - Parent element (optional)
     * @returns {HTMLElement[]} Array of elements
     */
    getByClass(className, parent = document) {
        try {
            return Array.from(parent.getElementsByClassName(className));
        } catch (error) {
            console.error('Error getting elements by class:', className, error);
            return [];
        }
    },

    /**
     * Get elements by query selector
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     * @returns {HTMLElement[]} Array of elements
     */
    query(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (error) {
            console.error('Error querying elements:', selector, error);
            return [];
        }
    },

    /**
     * Get single element by query selector
     * @param {string} selector - CSS selector
     * @param {HTMLElement} parent - Parent element (optional)
     * @returns {HTMLElement|null} Element or null if not found
     */
    queryOne(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error('Error querying element:', selector, error);
            return null;
        }
    },

    /**
     * Add event listener with error handling
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {boolean|object} options - Event options
     */
    on(element, event, handler, options = false) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            if (el && typeof handler === 'function') {
                el.addEventListener(event, handler, options);
            } else {
                console.warn('Invalid element or handler for event:', event);
            }
        } catch (error) {
            console.error('Error adding event listener:', event, error);
        }
    },

    /**
     * Remove event listener with error handling
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {boolean|object} options - Event options
     */
    off(element, event, handler, options = false) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            if (el && typeof handler === 'function') {
                el.removeEventListener(event, handler, options);
            }
        } catch (error) {
            console.error('Error removing event listener:', event, error);
        }
    },

    /**
     * Add or remove CSS class
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} className - Class name
     * @param {boolean} add - True to add, false to remove
     */
    toggleClass(element, className, add = null) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            if (el) {
                if (add === null) {
                    el.classList.toggle(className);
                } else if (add) {
                    el.classList.add(className);
                } else {
                    el.classList.remove(className);
                }
            }
        } catch (error) {
            console.error('Error toggling class:', className, error);
        }
    },

    /**
     * Check if element has class
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} className - Class name
     * @returns {boolean} True if element has class
     */
    hasClass(element, className) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            return el ? el.classList.contains(className) : false;
        } catch (error) {
            console.error('Error checking class:', className, error);
            return false;
        }
    },

    /**
     * Set element text content safely
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} text - Text content
     */
    setText(element, text) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            if (el) {
                el.textContent = String(text || '');
            }
        } catch (error) {
            console.error('Error setting text:', error);
        }
    },

    /**
     * Set element HTML content safely
     * @param {HTMLElement|string} element - Element or element ID
     * @param {string} html - HTML content
     */
    setHTML(element, html) {
        try {
            const el = typeof element === 'string' ? this.getId(element) : element;
            if (el) {
                el.innerHTML = this.sanitizeHTML(html);
            }
        } catch (error) {
            console.error('Error setting HTML:', error);
        }
    },

    /* ===================================================================
       Validation & Sanitization
       =================================================================== */

    /**
     * Basic HTML sanitization
     * @param {string} html - HTML string to sanitize
     * @returns {string} Sanitized HTML
     */
    sanitizeHTML(html) {
        if (typeof html !== 'string') return '';
        
        // Basic XSS prevention - remove script tags and javascript: protocols
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    },

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        if (typeof email !== 'string') return false;
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    },

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {object} Validation result with score and feedback
     */
    validatePassword(password) {
        if (typeof password !== 'string') {
            return { valid: false, score: 0, feedback: 'Password must be a string' };
        }

        const result = {
            valid: false,
            score: 0,
            feedback: []
        };

        // Length check
        if (password.length >= 8) {
            result.score += 2;
        } else {
            result.feedback.push('Password must be at least 8 characters long');
        }

        // Character variety checks
        if (/[a-z]/.test(password)) result.score += 1;
        if (/[A-Z]/.test(password)) result.score += 1;
        if (/[0-9]/.test(password)) result.score += 1;
        if (/[^a-zA-Z0-9]/.test(password)) result.score += 1;

        // Determine validity
        result.valid = result.score >= 4;
        
        if (result.score < 3) {
            result.feedback.push('Password should include uppercase, lowercase, numbers, and special characters');
        }

        return result;
    },

    /* ===================================================================
       Data Manipulation Utilities
       =================================================================== */

    /**
     * Deep clone an object
     * @param {any} obj - Object to clone
     * @returns {any} Cloned object
     */
    deepClone(obj) {
        try {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const cloned = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        cloned[key] = this.deepClone(obj[key]);
                    }
                }
                return cloned;
            }
            return obj;
        } catch (error) {
            console.error('Error cloning object:', error);
            return obj;
        }
    },

    /**
     * Merge objects deeply
     * @param {object} target - Target object
     * @param {...object} sources - Source objects
     * @returns {object} Merged object
     */
    deepMerge(target, ...sources) {
        try {
            if (!sources.length) return target;
            const source = sources.shift();

            if (this.isObject(target) && this.isObject(source)) {
                for (const key in source) {
                    if (this.isObject(source[key])) {
                        if (!target[key]) Object.assign(target, { [key]: {} });
                        this.deepMerge(target[key], source[key]);
                    } else {
                        Object.assign(target, { [key]: source[key] });
                    }
                }
            }

            return this.deepMerge(target, ...sources);
        } catch (error) {
            console.error('Error merging objects:', error);
            return target;
        }
    },

    /**
     * Check if value is an object
     * @param {any} item - Value to check
     * @returns {boolean} True if object
     */
    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    },

    /* ===================================================================
       String & Formatting Utilities
       =================================================================== */

    /**
     * Escape HTML characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Generate random string
     * @param {number} length - String length
     * @param {string} chars - Character set
     * @returns {string} Random string
     */
    randomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    },

    /**
     * Slugify a string for URLs
     * @param {string} str - String to slugify
     * @returns {string} Slugified string
     */
    slugify(str) {
        if (typeof str !== 'string') return '';
        
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Capitalize first letter
     * @param {string} str - String to capitalize
     * @returns {string} Capitalized string
     */
    capitalize(str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Truncate text with ellipsis
     * @param {string} text - Text to truncate
     * @param {number} maxLength - Maximum length
     * @param {string} suffix - Suffix to append
     * @returns {string} Truncated text
     */
    truncate(text, maxLength = 100, suffix = '...') {
        if (typeof text !== 'string') return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    },

    /* ===================================================================
       Date & Time Utilities
       =================================================================== */

    /**
     * Format date to readable string
     * @param {Date|string} date - Date to format
     * @param {string} format - Format type ('short', 'long', 'iso')
     * @returns {string} Formatted date
     */
    formatDate(date, format = 'short') {
        try {
            const d = new Date(date);
            if (isNaN(d.getTime())) return 'Invalid Date';

            switch (format) {
                case 'short':
                    return d.toLocaleDateString();
                case 'long':
                    return d.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                case 'iso':
                    return d.toISOString();
                case 'time':
                    return d.toLocaleTimeString();
                case 'datetime':
                    return d.toLocaleString();
                default:
                    return d.toLocaleDateString();
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    },

    /**
     * Get relative time string
     * @param {Date|string} date - Date to compare
     * @returns {string} Relative time string
     */
    getRelativeTime(date) {
        try {
            const now = new Date();
            const target = new Date(date);
            const diffMs = now - target;
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffSecs < 60) return 'just now';
            if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
            if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
            if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
            
            return this.formatDate(date, 'short');
        } catch (error) {
            console.error('Error getting relative time:', error);
            return 'Unknown';
        }
    },

    /* ===================================================================
       Performance & Throttling
       =================================================================== */

    /**
     * Debounce function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    /**
     * Throttle function execution
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /* ===================================================================
       Browser & Device Detection
       =================================================================== */

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        try {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                || window.innerWidth <= 768;
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if device is iOS
     * @returns {boolean} True if iOS device
     */
    isIOS() {
        try {
            return /iPad|iPhone|iPod/.test(navigator.userAgent);
        } catch (error) {
            return false;
        }
    },

    /**
     * Check if browser supports feature
     * @param {string} feature - Feature to check
     * @returns {boolean} True if supported
     */
    supports(feature) {
        try {
            switch (feature) {
                case 'localStorage':
                    return typeof Storage !== 'undefined';
                case 'sessionStorage':
                    return typeof sessionStorage !== 'undefined';
                case 'serviceWorker':
                    return 'serviceWorker' in navigator;
                case 'fetch':
                    return typeof fetch !== 'undefined';
                case 'webgl':
                    return !!window.WebGLRenderingContext;
                case 'webrtc':
                    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
                case 'geolocation':
                    return !!navigator.geolocation;
                case 'notifications':
                    return 'Notification' in window;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error checking feature support:', feature, error);
            return false;
        }
    },

    /* ===================================================================
       Local Storage Helpers
       =================================================================== */

    /**
     * Set localStorage item with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {boolean} True if successful
     */
    setStorage(key, value) {
        try {
            if (!this.supports('localStorage')) return false;
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', key, error);
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
            if (!this.supports('localStorage')) return defaultValue;
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting localStorage:', key, error);
            return defaultValue;
        }
    },

    /**
     * Remove localStorage item
     * @param {string} key - Storage key
     * @returns {boolean} True if successful
     */
    removeStorage(key) {
        try {
            if (!this.supports('localStorage')) return false;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', key, error);
            return false;
        }
    },

    /* ===================================================================
       Error Handling & Logging
       =================================================================== */

    /**
     * Safe function execution with error handling
     * @param {Function} func - Function to execute
     * @param {any} defaultReturn - Default return value on error
     * @param {...any} args - Function arguments
     * @returns {any} Function result or default value
     */
    safeExecute(func, defaultReturn = null, ...args) {
        try {
            if (typeof func !== 'function') return defaultReturn;
            return func.apply(this, args);
        } catch (error) {
            console.error('Error in safeExecute:', error);
            return defaultReturn;
        }
    },

    /**
     * Log with level and timestamp
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {...any} data - Additional data
     */
    log(level, message, ...data) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level.toLowerCase()) {
            case 'error':
                console.error(logMessage, ...data);
                break;
            case 'warn':
                console.warn(logMessage, ...data);
                break;
            case 'info':
                console.info(logMessage, ...data);
                break;
            default:
                console.log(logMessage, ...data);
        }
    }
};

// Make velocityUtils globally available
if (typeof window !== 'undefined') {
    window.velocityUtils = velocityUtils;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = velocityUtils;
}