/* ===================================================================
   Velocity Lab - API Interface
   Cloudflare Workers integration and API communication layer
   =================================================================== */

/* ===================================================================
   API Configuration
   =================================================================== */
const API_CONFIG = {
    baseURL: '/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    endpoints: {
        // Authentication
        login: '/users/login',
        logout: '/users/logout',
        register: '/users/register',
        
        // User Management
        progress: '/user/progress',
        preferences: '/user/preferences',
        labHistory: '/user/lab-history',
        profile: '/user/profile',
        
        // Lab Management
        labStart: '/lab/start',
        labComplete: '/lab/complete',
        labReset: '/lab/reset',
        
        // Admin
        adminUsers: '/admin/users-progress',
        adminStats: '/admin/stats'
    }
};

/* ===================================================================
   Main API Class
   =================================================================== */
const velocityAPI = {
    
    /* ===================================================================
       Core API Methods
       =================================================================== */

    /**
     * Make API call with comprehensive error handling
     * @param {string} url - API endpoint URL
     * @param {object} options - Request options
     * @returns {Promise<object>} API response
     */
    async call(url, options = {}) {
        const startTime = performance.now();
        let attempt = 0;

        while (attempt < API_CONFIG.retryAttempts) {
            try {
                console.log(`API Call [Attempt ${attempt + 1}]:`, options.method || 'GET', url);
                
                // Log request body for debugging (safely)
                if (options.body) {
                    if (options.body instanceof FormData) {
                        console.log('FormData contents:');
                        for (let [key, value] of options.body.entries()) {
                            if (key === 'password') {
                                console.log(`  ${key}: [${value.length} characters]`);
                            } else {
                                console.log(`  ${key}:`, value);
                            }
                        }
                    } else if (typeof options.body === 'string') {
                        try {
                            const bodyObj = JSON.parse(options.body);
                            const safeBody = { ...bodyObj };
                            if (safeBody.password) safeBody.password = '[REDACTED]';
                            console.log('Request body:', safeBody);
                        } catch {
                            console.log('Request body: [Non-JSON string]');
                        }
                    }
                }

                // Check network connectivity
                if (!navigator.onLine) {
                    throw new APIError('OFFLINE', 'You are offline. Please check your internet connection.');
                }

                // Make the request with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

                const response = await fetch(url, {
                    method: options.method || 'GET',
                    body: options.body,
                    headers: {
                        ...this.getDefaultHeaders(),
                        ...options.headers
                    },
                    signal: controller.signal,
                    credentials: 'same-origin'
                });

                clearTimeout(timeoutId);

                console.log(`Response [${performance.now() - startTime}ms]:`, response.status, response.statusText);

                // Handle different response types
                const contentType = response.headers.get('content-type');
                let result;

                if (!contentType || !contentType.includes('application/json')) {
                    if (contentType && contentType.includes('text/html')) {
                        console.warn('Backend API not deployed - received HTML response');
                        throw new APIError('BACKEND_NOT_AVAILABLE', 'Backend API is not deployed. Please deploy the Cloudflare Workers functions.');
                    }
                    
                    const responseText = await response.text();
                    console.error('Expected JSON response but got:', contentType);
                    console.error('Response body:', responseText.substring(0, 500));
                    throw new APIError('INVALID_RESPONSE', `API returned ${response.status}: Expected JSON response but got ${contentType}`);
                }

                result = await response.json();
                console.log('Response data:', result);

                // Handle HTTP error status codes
                if (!response.ok) {
                    const errorMessage = result.message || result.error || `HTTP ${response.status}: ${response.statusText}`;
                    throw new APIError('HTTP_ERROR', errorMessage, response.status);
                }

                // Handle API-level errors
                if (!result.success) {
                    throw new APIError('API_ERROR', result.message || 'API call failed');
                }

                return result;

            } catch (error) {
                attempt++;
                
                // Handle specific error types
                if (error.name === 'AbortError') {
                    console.error('Request timeout:', url);
                    if (attempt >= API_CONFIG.retryAttempts) {
                        throw new APIError('TIMEOUT', 'Request timed out. Please try again.');
                    }
                } else if (error instanceof APIError) {
                    // Don't retry API errors or backend unavailable
                    if (error.code === 'BACKEND_NOT_AVAILABLE' || error.code === 'OFFLINE' || error.code === 'API_ERROR') {
                        throw error;
                    }
                    if (attempt >= API_CONFIG.retryAttempts) {
                        throw error;
                    }
                } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                    console.error('Network error:', error);
                    if (attempt >= API_CONFIG.retryAttempts) {
                        throw new APIError('NETWORK_ERROR', 'Network connection failed. Please check your internet connection.');
                    }
                } else {
                    console.error('Unexpected error:', error);
                    if (attempt >= API_CONFIG.retryAttempts) {
                        throw new APIError('UNKNOWN_ERROR', error.message || 'An unexpected error occurred');
                    }
                }

                // Wait before retry
                if (attempt < API_CONFIG.retryAttempts) {
                    console.log(`Retrying in ${API_CONFIG.retryDelay}ms...`);
                    await this.delay(API_CONFIG.retryDelay * attempt);
                }
            }
        }
    },

    /**
     * Get default headers for API requests
     * @returns {object} Default headers
     */
    getDefaultHeaders() {
        const headers = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Client-Version': '1.0.0'
        };

        // Add CSRF token if available
        const csrfToken = velocityUtils.cookies.get('csrf_token');
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }

        return headers;
    },

    /**
     * Delay utility for retries
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /* ===================================================================
       Authentication API Methods
       =================================================================== */

    /**
     * User login
     * @param {FormData|object} credentials - Login credentials
     * @returns {Promise<object>} Login response
     */
    async login(credentials) {
        try {
            const body = credentials instanceof FormData ? credentials : this.createFormData(credentials);
            
            const response = await this.call(API_CONFIG.endpoints.login, {
                method: 'POST',
                body: body
            });

            // Store session info securely
            if (response.success && response.data) {
                const { sessionToken, user } = response.data;
                if (sessionToken && user) {
                    velocityUtils.cookies.set('session', sessionToken, 30);
                    velocityUtils.cookies.set('user', JSON.stringify(user), 30);
                    console.log('Session stored successfully');
                }
            }

            return response;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },

    /**
     * User logout
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Logout response
     */
    async logout(sessionToken) {
        try {
            const response = await this.call(API_CONFIG.endpoints.logout, {
                method: 'POST',
                headers: sessionToken ? { 'Authorization': `Bearer ${sessionToken}` } : {}
            });

            // Clear session info
            velocityUtils.cookies.delete('session');
            velocityUtils.cookies.delete('user');
            console.log('Session cleared');

            return response;
        } catch (error) {
            // Always clear local session on logout, even if API fails
            velocityUtils.cookies.delete('session');
            velocityUtils.cookies.delete('user');
            console.warn('Logout API failed, but session cleared locally:', error);
            return { success: true, message: 'Logged out locally' };
        }
    },

    /* ===================================================================
       User Data API Methods
       =================================================================== */

    /**
     * Load user progress
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Progress data
     */
    async loadProgress(sessionToken) {
        try {
            return await this.call(API_CONFIG.endpoints.progress, {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
        } catch (error) {
            console.warn('Failed to load progress from API:', error);
            throw error;
        }
    },

    /**
     * Save user progress
     * @param {string} sessionToken - Session token
     * @param {string} taskId - Task ID
     * @param {object} progress - Progress data
     * @returns {Promise<object>} Save response
     */
    async saveProgress(sessionToken, taskId, progress) {
        try {
            return await this.call(API_CONFIG.endpoints.progress, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskId, progress })
            });
        } catch (error) {
            console.warn('Failed to save progress to API:', error);
            throw error;
        }
    },

    /**
     * Load user preferences
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Preferences data
     */
    async loadPreferences(sessionToken) {
        try {
            return await this.call(API_CONFIG.endpoints.preferences, {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
        } catch (error) {
            console.warn('Failed to load preferences from API:', error);
            throw error;
        }
    },

    /**
     * Save user preferences
     * @param {string} sessionToken - Session token
     * @param {object} preferences - Preferences data
     * @returns {Promise<object>} Save response
     */
    async savePreferences(sessionToken, preferences) {
        try {
            return await this.call(API_CONFIG.endpoints.preferences, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });
        } catch (error) {
            console.warn('Failed to save preferences to API:', error);
            throw error;
        }
    },

    /* ===================================================================
       Lab Management API Methods
       =================================================================== */

    /**
     * Load lab history
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Lab history data
     */
    async loadLabHistory(sessionToken) {
        try {
            return await this.call(API_CONFIG.endpoints.labHistory, {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
        } catch (error) {
            console.warn('Failed to load lab history from API:', error);
            throw error;
        }
    },

    /**
     * Save lab history
     * @param {string} sessionToken - Session token
     * @param {array|object} historyData - Lab history data
     * @returns {Promise<object>} Save response
     */
    async saveLabHistory(sessionToken, historyData) {
        try {
            return await this.call(API_CONFIG.endpoints.labHistory, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(historyData)
            });
        } catch (error) {
            console.warn('Failed to save lab history to API:', error);
            throw error;
        }
    },

    /**
     * Start new lab environment
     * @param {string} sessionToken - Session token
     * @param {object} labConfig - Lab configuration
     * @returns {Promise<object>} Lab start response
     */
    async startLab(sessionToken, labConfig = {}) {
        try {
            return await this.call(API_CONFIG.endpoints.labStart, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(labConfig)
            });
        } catch (error) {
            console.warn('Failed to start lab via API:', error);
            throw error;
        }
    },

    /* ===================================================================
       Admin API Methods
       =================================================================== */

    /**
     * Get admin users progress data
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Users progress data
     */
    async getAdminUsersProgress(sessionToken) {
        try {
            return await this.call(API_CONFIG.endpoints.adminUsers, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.warn('Failed to load admin data from API:', error);
            throw error;
        }
    },

    /**
     * Get admin statistics
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Admin statistics
     */
    async getAdminStats(sessionToken) {
        try {
            return await this.call(API_CONFIG.endpoints.adminStats, {
                headers: {
                    'Authorization': `Bearer ${sessionToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.warn('Failed to load admin stats from API:', error);
            throw error;
        }
    },

    /* ===================================================================
       Utility Methods
       =================================================================== */

    /**
     * Create FormData from object
     * @param {object} data - Data object
     * @returns {FormData} FormData instance
     */
    createFormData(data) {
        const formData = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        }
        return formData;
    },

    /**
     * Check API health
     * @returns {Promise<boolean>} True if API is healthy
     */
    async checkHealth() {
        try {
            const response = await this.call('/health', {
                method: 'GET'
            });
            return response.success === true;
        } catch (error) {
            console.warn('API health check failed:', error);
            return false;
        }
    },

    /**
     * Get API status information
     * @returns {Promise<object>} API status
     */
    async getStatus() {
        try {
            return await this.call('/status', {
                method: 'GET'
            });
        } catch (error) {
            console.warn('Failed to get API status:', error);
            return {
                success: false,
                status: 'unknown',
                message: error.message
            };
        }
    },

    /* ===================================================================
       Request Caching (Simple In-Memory Cache)
       =================================================================== */

    cache: new Map(),
    cacheTimeout: 5 * 60 * 1000, // 5 minutes

    /**
     * Get cached response if valid
     * @param {string} key - Cache key
     * @returns {any|null} Cached data or null
     */
    getCached(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            console.log('Using cached response for:', key);
            return cached.data;
        }
        return null;
    },

    /**
     * Set cache entry
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    setCached(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
        
        // Simple cache cleanup - remove old entries
        if (this.cache.size > 100) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
    },

    /**
     * Clear cache
     * @param {string} pattern - Optional pattern to match keys
     */
    clearCache(pattern = null) {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
        console.log('Cache cleared:', pattern || 'all');
    }
};

/* ===================================================================
   Custom API Error Class
   =================================================================== */
class APIError extends Error {
    constructor(code, message, status = null) {
        super(message);
        this.name = 'APIError';
        this.code = code;
        this.status = status;
        this.timestamp = new Date().toISOString();
    }

    toString() {
        return `APIError [${this.code}]: ${this.message}`;
    }
}

/* ===================================================================
   Offline Support System
   =================================================================== */
const velocityOffline = {
    isOnline: navigator.onLine,
    
    /**
     * Initialize offline detection
     */
    init() {
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        this.updateStatus();
    },

    /**
     * Handle online event
     */
    handleOnline() {
        this.isOnline = true;
        this.updateStatus();
        console.log('Connection restored');
        
        // Clear API cache to force fresh data
        velocityAPI.clearCache();
        
        // Notify user
        if (window.velocityNotifications) {
            velocityNotifications.success('Connection restored!');
        }
    },

    /**
     * Handle offline event
     */
    handleOffline() {
        this.isOnline = false;
        this.updateStatus();
        console.log('Connection lost');
        
        // Notify user
        if (window.velocityNotifications) {
            velocityNotifications.error('You are offline - some features may be limited');
        }
    },

    /**
     * Update UI offline indicator
     */
    updateStatus() {
        const indicator = velocityUtils.getId('offlineIndicator');
        if (indicator) {
            indicator.style.display = this.isOnline ? 'none' : 'block';
        }
    }
};

/* ===================================================================
   Global Registration
   =================================================================== */

// Make API available globally
if (typeof window !== 'undefined') {
    window.velocityAPI = velocityAPI;
    window.velocityOffline = velocityOffline;
    window.APIError = APIError;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { velocityAPI, velocityOffline, APIError };
}