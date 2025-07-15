/* ===================================================================
   Velocity Lab - API Client System
   Handles all backend communication with error handling and offline detection
   =================================================================== */

const API_CONFIG = {
    baseUrl: '/api',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};

const velocityAPI = {
    
    /* ===================================================================
       Core API Communication
       =================================================================== */

    /**
     * Make API call with comprehensive error handling
     * @param {string} endpoint - API endpoint
     * @param {object} options - Request options
     * @returns {Promise<object>} API response
     */
    async call(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`;
        
        try {
            console.log('🌐 API Call:', options.method || 'GET', url);
            
            // Log FormData contents for debugging
            if (options.body instanceof FormData) {
                console.log('📝 FormData contents:');
                for (let [key, value] of options.body.entries()) {
                    if (key === 'password') {
                        console.log(`  ${key}: [${value.length} characters]`);
                    } else {
                        console.log(`  ${key}:`, value);
                    }
                }
            } else if (options.body && typeof options.body === 'string') {
                try {
                    const bodyData = JSON.parse(options.body);
                    console.log('📝 Request body:', bodyData);
                } catch (e) {
                    console.log('📝 Request body (string):', options.body);
                }
            }
            
            // Check if offline
            if (!navigator.onLine) {
                throw new Error('OFFLINE');
            }
            
            // Make the request
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...options.headers
                },
                body: options.body,
                signal: this.createTimeoutSignal(options.timeout || API_CONFIG.timeout)
            });

            console.log('📡 Response status:', response.status, response.statusText);

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                if (contentType && contentType.includes('text/html')) {
                    console.warn('❌ Backend API not deployed - received HTML instead of JSON');
                    throw new Error('BACKEND_NOT_AVAILABLE');
                }
                
                console.error('❌ Expected JSON response but got:', contentType);
                const responseText = await response.text();
                console.error('Response body:', responseText);
                throw new Error(`API returned ${response.status}: Expected JSON response but got ${contentType}`);
            }

            // Parse JSON response
            const result = await response.json();
            console.log('✅ Response data:', result);
            
            // Check for API-level errors
            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            if (!result.success) {
                throw new Error(result.message || result.error || 'API call failed');
            }
            
            return result;
            
        } catch (error) {
            console.error('❌ API call failed:', error);
            
            // Handle specific error types
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - please try again');
            }
            
            if (!navigator.onLine) {
                throw new Error('OFFLINE');
            }
            
            // Re-throw the error for caller to handle
            throw error;
        }
    },

    /**
     * Create timeout signal for fetch requests
     * @param {number} timeout - Timeout in milliseconds
     * @returns {AbortSignal} Abort signal
     */
    createTimeoutSignal(timeout) {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller.signal;
    },

    /**
     * Retry API call with exponential backoff
     * @param {function} apiCall - API call function
     * @param {number} attempts - Number of retry attempts
     * @returns {Promise<object>} API response
     */
    async retryCall(apiCall, attempts = API_CONFIG.retryAttempts) {
        for (let i = 0; i < attempts; i++) {
            try {
                return await apiCall();
            } catch (error) {
                if (i === attempts - 1) throw error;
                
                // Don't retry certain errors
                if (error.message === 'BACKEND_NOT_AVAILABLE' || 
                    error.message === 'OFFLINE' ||
                    error.message.includes('401') ||
                    error.message.includes('403')) {
                    throw error;
                }
                
                const delay = API_CONFIG.retryDelay * Math.pow(2, i);
                console.log(`🔄 Retrying API call in ${delay}ms (attempt ${i + 1}/${attempts})`);
                await this.sleep(delay);
            }
        }
    },

    /**
     * Sleep utility for retry delays
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /* ===================================================================
       Authentication API Calls
       =================================================================== */

    /**
     * User login
     * @param {object} credentials - Login credentials
     * @returns {Promise<object>} Login response
     */
    async login(credentials) {
        const formData = new FormData();
        
        if (credentials instanceof FormData) {
            return this.call('/auth/login', {
                method: 'POST',
                body: credentials
            });
        } else {
            formData.append('email', credentials.email);
            formData.append('password', credentials.password);
            if (credentials.remember) {
                formData.append('remember', credentials.remember);
            }
            
            return this.call('/auth/login', {
                method: 'POST',
                body: formData
            });
        }
    },

    /**
     * User logout
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Logout response
     */
    async logout(sessionToken) {
        return this.call('/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Validate session
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Validation response
     */
    async validateSession(sessionToken) {
        return this.call('/auth/validate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /* ===================================================================
       User Data API Calls
       =================================================================== */

    /**
     * Get user progress
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Progress data
     */
    async getUserProgress(sessionToken) {
        return this.call('/user/progress', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Save user progress
     * @param {string} sessionToken - Session token
     * @param {object} progressData - Progress data to save
     * @returns {Promise<object>} Save response
     */
    async saveUserProgress(sessionToken, progressData) {
        return this.call('/user/progress', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
        });
    },

    /**
     * Get user lab history
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} Lab history data
     */
    async getLabHistory(sessionToken) {
        return this.call('/user/lab-history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Save lab history
     * @param {string} sessionToken - Session token
     * @param {object} historyData - History data to save
     * @returns {Promise<object>} Save response
     */
    async saveLabHistory(sessionToken, historyData) {
        return this.call('/user/lab-history', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historyData)
        });
    },

    /**
     * Get user preferences
     * @param {string} sessionToken - Session token
     * @returns {Promise<object>} User preferences
     */
    async getUserPreferences(sessionToken) {
        return this.call('/user/preferences', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Save user preferences
     * @param {string} sessionToken - Session token
     * @param {object} preferences - Preferences to save
     * @returns {Promise<object>} Save response
     */
    async saveUserPreferences(sessionToken, preferences) {
        return this.call('/user/preferences', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
    },

    /* ===================================================================
       Lab Management API Calls
       =================================================================== */

    /**
     * Start new lab session
     * @param {string} sessionToken - Session token
     * @param {object} labData - Lab configuration
     * @returns {Promise<object>} Lab start response
     */
    async startLab(sessionToken, labData = {}) {
        return this.call('/lab/start', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(labData)
        });
    },

    /**
     * Complete lab session
     * @param {string} sessionToken - Session token
     * @param {string} labId - Lab ID
     * @param {object} completionData - Completion data
     * @returns {Promise<object>} Lab completion response
     */
    async completeLab(sessionToken, labId, completionData) {
        return this.call('/lab/complete', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                labId,
                ...completionData
            })
        });
    },

    /* ===================================================================
       Admin API Calls
       =================================================================== */

    /**
     * Get all users progress (admin only)
     * @param {string} sessionToken - Admin session token
     * @returns {Promise<object>} Users progress data
     */
    async getAdminUsersProgress(sessionToken) {
        return this.call('/admin/users-progress', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Get admin dashboard data
     * @param {string} sessionToken - Admin session token
     * @returns {Promise<object>} Dashboard data
     */
    async getAdminDashboard(sessionToken) {
        return this.call('/admin/dashboard', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionToken}`
            }
        });
    },

    /**
     * Manage user account (admin only)
     * @param {string} sessionToken - Admin session token
     * @param {string} userId - User ID to manage
     * @param {object} userData - User data updates
     * @returns {Promise<object>} Management response
     */
    async manageUser(sessionToken, userId, userData) {
        return this.call('/admin/users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${sessionToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId,
                ...userData
            })
        });
    },

    /* ===================================================================
       Utility Functions
       =================================================================== */

    /**
     * Check API health
     * @returns {Promise<object>} Health check response
     */
    async healthCheck() {
        return this.call('/health', {
            method: 'GET'
        });
    },

    /**
     * Get API version
     * @returns {Promise<object>} Version response
     */
    async getVersion() {
        return this.call('/version', {
            method: 'GET'
        });
    },

    /**
     * Test connection to backend
     * @returns {Promise<boolean>} True if backend is available
     */
    async testConnection() {
        try {
            await this.healthCheck();
            return true;
        } catch (error) {
            console.warn('Backend connection test failed:', error.message);
            return false;
        }
    },

    /* ===================================================================
       Error Handling Helpers
       =================================================================== */

    /**
     * Check if error is due to backend not being available
     * @param {Error} error - Error to check
     * @returns {boolean} True if backend not available
     */
    isBackendUnavailable(error) {
        return error.message === 'BACKEND_NOT_AVAILABLE' ||
               error.message.includes('Failed to fetch') ||
               error.message.includes('NetworkError');
    },

    /**
     * Check if error is due to being offline
     * @param {Error} error - Error to check
     * @returns {boolean} True if offline
     */
    isOfflineError(error) {
        return error.message === 'OFFLINE' || !navigator.onLine;
    },

    /**
     * Check if error is authentication related
     * @param {Error} error - Error to check
     * @returns {boolean} True if auth error
     */
    isAuthError(error) {
        return error.message.includes('401') ||
               error.message.includes('403') ||
               error.message.includes('Unauthorized') ||
               error.message.includes('Invalid token');
    },

    /**
     * Get user-friendly error message
     * @param {Error} error - Error to process
     * @returns {string} User-friendly error message
     */
    getErrorMessage(error) {
        if (this.isOfflineError(error)) {
            return 'You are offline. Please check your internet connection.';
        }
        
        if (this.isBackendUnavailable(error)) {
            return 'Backend service is unavailable. Please try again later.';
        }
        
        if (this.isAuthError(error)) {
            return 'Authentication failed. Please sign in again.';
        }
        
        if (error.message.includes('timeout')) {
            return 'Request timed out. Please try again.';
        }
        
        if (error.message.includes('500')) {
            return 'Server error. Please try again later.';
        }
        
        // Return the original error message if it's user-friendly
        if (error.message && !error.message.includes('fetch')) {
            return error.message;
        }
        
        return 'An unexpected error occurred. Please try again.';
    }
};

/* ===================================================================
   Global Export
   =================================================================== */

// Make available globally
if (typeof window !== 'undefined') {
    window.velocityAPI = velocityAPI;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = velocityAPI;
}