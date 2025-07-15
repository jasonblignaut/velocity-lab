/* ===================================================================
   Velocity Lab - Authentication System
   Optimized for index.html integration
   =================================================================== */

const AUTH_CONFIG = {
    sessionDuration: 30, // days
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    rememberMeDuration: 30, // days
    sessionCheckInterval: 5 * 60 * 1000 // 5 minutes
};

const velocityAuth = {
    loginAttempts: new Map(),
    sessionCheckTimer: null,

    /* ===================================================================
       Core Authentication Methods
       =================================================================== */

    async login(formData) {
        const submitBtn = document.querySelector('#signInForm .password-toggle');
        
        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.innerHTML = '⏳';
            }
            
            // Extract credentials
            const email = formData.get ? formData.get('email') : formData.email;
            const password = formData.get ? formData.get('password') : formData.password;
            const remember = formData.get ? formData.get('remember') : formData.remember;
            
            // Validate input
            const validation = this.validateLoginInput(email, password);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Check rate limiting
            this.checkRateLimit(email);

            console.log('Attempting login with backend API...');
            
            // API login call
            const response = await velocityAPI.login({ email, password, remember });
            
            if (response.success && response.data) {
                console.log('✅ Login successful');
                
                const { name, role, email: userEmail, sessionToken } = response.data;
                
                // Store session data
                const sessionDuration = remember ? AUTH_CONFIG.rememberMeDuration : 1;
                velocityUtils.cookies.set('user', JSON.stringify({ name, role, email: userEmail }), sessionDuration);
                velocityUtils.cookies.set('session', sessionToken, sessionDuration);
                
                // Update application state
                if (window.appState) {
                    appState.user = { name, role, email: userEmail };
                    appState.sessionToken = sessionToken;
                    appState.authenticated = true;
                }
                
                // Clear failed attempts
                this.clearLoginAttempts(email);
                
                // Setup session monitoring
                this.startSessionMonitoring();
                
                // Handle admin role
                if (role === 'admin') {
                    const adminBtn = velocityUtils.getId('adminButton');
                    if (adminBtn) adminBtn.style.display = 'block';
                }
                
                // Update UI
                velocityUI.showDashboard();
                velocityUI.closeMobileMenu();
                
                // Load user data
                await this.loadUserData();
                
                // Close modal and cleanup
                closeModal('signInModal');
                this.resetLoginForm();
                
                // Scroll to top
                setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                
                // Welcome notification
                if (window.velocityNotifications && !appState.isWelcomeShown) {
                    velocityNotifications.success(`Welcome back, ${name}! 🎉`);
                    appState.isWelcomeShown = true;
                }
                
                return { success: true, user: { name, role, email: userEmail } };
                
            } else {
                throw new Error(response.error || 'Invalid response from server');
            }
            
        } catch (err) {
            console.error('❌ Login failed:', err);
            
            // Track failed attempt
            this.trackLoginAttempt(email || 'unknown', false);
            
            // Handle specific errors
            let errorMessage = this.getLoginErrorMessage(err);
            
            // Show error notification
            if (window.velocityNotifications) {
                velocityNotifications.error(errorMessage);
            }
            
            // Update form error display
            this.showFormError('signInMessage', errorMessage);
            
            return { success: false, error: errorMessage };
            
        } finally {
            // Remove loading state
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.innerHTML = '→';
            }
        }
    },

    async logout() {
        try {
            const sessionToken = appState?.sessionToken || velocityUtils.cookies.get('session');
            
            // Attempt API logout
            if (sessionToken) {
                try {
                    await velocityAPI.logout(sessionToken);
                } catch (err) {
                    console.log('Logout API call failed (optional):', err);
                }
            }
        } catch (err) {
            console.warn('Logout API error:', err);
        }
        
        // Clear all session data
        this.clearSession();
        
        // Update UI
        velocityUI.closeMobileMenu();
        velocityUI.showWelcomeScreen();
        
        // Clear notifications
        if (window.velocityNotifications) {
            velocityNotifications.clearShownNotifications();
            velocityNotifications.info('Signed out successfully 👋');
        }
    },

    /* ===================================================================
       Session Management
       =================================================================== */

    async checkExistingSession() {
        try {
            const userCookie = velocityUtils.cookies.get('user');
            const sessionCookie = velocityUtils.cookies.get('session');
            
            if (!userCookie || !sessionCookie) {
                console.log('No existing session found');
                this.handleNoSession();
                return false;
            }

            // Parse user data
            let user;
            try {
                user = JSON.parse(userCookie);
            } catch (error) {
                console.error('Invalid user cookie data');
                this.clearSession();
                this.handleNoSession();
                return false;
            }

            // Validate user data
            if (!user.name || !user.email) {
                console.error('Invalid user data structure');
                this.clearSession();
                this.handleNoSession();
                return false;
            }

            // Update application state
            if (window.appState) {
                appState.user = user;
                appState.sessionToken = sessionCookie;
                appState.authenticated = true;
                appState.isWelcomeShown = true;
            }
            
            console.log('✅ Found existing session for:', user.name);
            
            // Update UI
            velocityUI.showDashboard();
            velocityUI.updateMobileMenuItems();
            
            // Load user data
            await this.loadUserData();
            
            // Load theme
            if (window.velocityTheme) {
                await velocityTheme.loadTheme();
            }
            
            // Start session monitoring
            this.startSessionMonitoring();
            
            // Scroll to top
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            
            return true;
            
        } catch (error) {
            console.error('Session validation failed:', error);
            this.clearSession();
            this.handleNoSession();
            return false;
        }
    },

    handleNoSession() {
        if (window.velocityNotifications) {
            velocityNotifications.clearShownNotifications();
        }
        
        velocityUI.showWelcomeScreen();
        
        if (window.velocityTheme) {
            velocityTheme.loadTheme();
        }
        
        // Start welcome notification fade timer
        setTimeout(() => {
            const welcomeNotification = velocityUtils.getId('welcomeNotification');
            if (welcomeNotification) {
                welcomeNotification.classList.add('fade-out');
            }
        }, 30000);
    },

    clearSession() {
        // Clear cookies
        velocityUtils.cookies.delete('user');
        velocityUtils.cookies.delete('session');
        
        // Clear application state
        if (window.appState) {
            appState.user = null;
            appState.progress = {};
            appState.authenticated = false;
            appState.sessionToken = null;
            appState.labHistory = [];
            appState.currentCategory = null;
            appState.currentView = 'categories';
            appState.isWelcomeShown = false;
        }
        
        // Clear local storage
        velocityUtils.removeStorage('velocity_progress');
        velocityUtils.removeStorage('velocity_lab_history');
        
        // Hide admin button
        const adminBtn = velocityUtils.getId('adminButton');
        if (adminBtn) adminBtn.style.display = 'none';
        
        // Stop session monitoring
        this.stopSessionMonitoring();
        
        console.log('Session cleared');
    },

    startSessionMonitoring() {
        this.stopSessionMonitoring();
        
        this.sessionCheckTimer = setInterval(() => {
            this.validateCurrentSession();
        }, AUTH_CONFIG.sessionCheckInterval);
        
        console.log('Session monitoring started');
    },

    stopSessionMonitoring() {
        if (this.sessionCheckTimer) {
            clearInterval(this.sessionCheckTimer);
            this.sessionCheckTimer = null;
        }
    },

    async validateCurrentSession() {
        try {
            const sessionToken = velocityUtils.cookies.get('session');
            if (!sessionToken) {
                console.log('No session token found during validation');
                this.logout();
                return;
            }

            // Optional: Validate with server
            // const isValid = await velocityAPI.validateSession(sessionToken);
            // if (!isValid) this.logout();
            
        } catch (error) {
            console.error('Session validation failed:', error);
            this.logout();
        }
    },

    /* ===================================================================
       User Data Loading
       =================================================================== */

    async loadUserData() {
        try {
            // Load user progress
            if (window.loadUserProgress) {
                await loadUserProgress();
            }
            
            // Load lab history
            if (window.loadLabHistory) {
                await loadLabHistory();
            }
            
            console.log('User data loaded successfully');
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    },

    /* ===================================================================
       Rate Limiting & Security
       =================================================================== */

    trackLoginAttempt(email, success) {
        const key = email.toLowerCase();
        const now = Date.now();
        
        if (!this.loginAttempts.has(key)) {
            this.loginAttempts.set(key, { attempts: 0, lastAttempt: now, lockedUntil: null });
        }
        
        const record = this.loginAttempts.get(key);
        record.lastAttempt = now;
        
        if (success) {
            record.attempts = 0;
            record.lockedUntil = null;
        } else {
            record.attempts++;
            
            if (record.attempts >= AUTH_CONFIG.maxLoginAttempts) {
                record.lockedUntil = now + AUTH_CONFIG.lockoutDuration;
                console.warn(`🔒 Account locked for ${email} due to failed attempts`);
            }
        }
    },

    checkRateLimit(email) {
        const key = email.toLowerCase();
        const record = this.loginAttempts.get(key);
        
        if (!record) return;
        
        const now = Date.now();
        
        if (record.lockedUntil && now < record.lockedUntil) {
            const remainingTime = Math.ceil((record.lockedUntil - now) / 60000);
            const error = new Error(`Too many failed login attempts. Please try again in ${remainingTime} minute(s).`);
            error.code = 'RATE_LIMITED';
            throw error;
        }
        
        // Clear old lockout
        if (record.lockedUntil && now >= record.lockedUntil) {
            record.attempts = 0;
            record.lockedUntil = null;
        }
    },

    clearLoginAttempts(email) {
        const key = email.toLowerCase();
        this.loginAttempts.delete(key);
    },

    /* ===================================================================
       Input Validation
       =================================================================== */

    validateLoginInput(email, password) {
        const errors = [];
        
        // Email validation
        if (!email || typeof email !== 'string') {
            errors.push('Email is required');
        } else if (!velocityUtils.isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Password validation
        if (!password || typeof password !== 'string') {
            errors.push('Password is required');
        } else if (password.length < AUTH_CONFIG.passwordMinLength) {
            errors.push(`Password must be at least ${AUTH_CONFIG.passwordMinLength} characters long`);
        }
        
        return {
            valid: errors.length === 0,
            message: errors.join('. ')
        };
    },

    getLoginErrorMessage(err) {
        if (err.message === 'BACKEND_NOT_AVAILABLE') {
            return 'Backend service unavailable. Please try again later.';
        } else if (err.message === 'OFFLINE') {
            return 'You are offline. Please check your internet connection.';
        } else if (err.code === 'RATE_LIMITED') {
            return err.message;
        } else if (err.message.includes('Invalid') || err.message.includes('credentials')) {
            return 'Invalid email or password. Please try again.';
        } else if (err.message.includes('Unauthorized') || err.message.includes('401')) {
            return 'Invalid credentials. Please check your email and password.';
        } else if (err.message.includes('500') || err.message.includes('server')) {
            return 'Server error. Please try again later.';
        } else if (err.message) {
            return err.message;
        }
        return 'Login failed. Please check your credentials and try again.';
    },

    /* ===================================================================
       Form Handling
       =================================================================== */

    setupFormHandlers() {
        const loginForm = velocityUtils.getId('signInForm');
        if (loginForm) {
            this.setupLoginForm(loginForm);
        }

        const requestForm = velocityUtils.getId('requestAccessForm');
        if (requestForm) {
            this.setupRequestForm(requestForm);
        }
    },

    setupLoginForm(loginForm) {
        const emailInput = velocityUtils.getId('signInEmail');
        
        if (emailInput) {
            // Handle Enter key and auto-progression
            velocityUtils.on(emailInput, 'keypress', (e) => {
                if (e.key === 'Enter' && emailInput.value.length > 0) {
                    e.preventDefault();
                    this.showPasswordField();
                }
            });
            
            velocityUtils.on(emailInput, 'blur', () => {
                if (emailInput.value.length > 0 && (emailInput.value.includes('@') || emailInput.value.length > 3)) {
                    setTimeout(() => this.showPasswordField(), 100);
                }
            });
        }
        
        // Form submission
        velocityUtils.on(loginForm, 'submit', async (event) => {
            event.preventDefault();
            
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');
            
            if (!email || !password) {
                if (window.velocityNotifications) {
                    velocityNotifications.error('Please fill in all required fields.');
                }
                return;
            }
            
            console.log('🔑 Login attempt for:', email);
            await this.login(formData);
        });
    },

    showPasswordField() {
        const passwordGroup = velocityUtils.getId('passwordGroup');
        const rememberGroup = velocityUtils.getId('rememberGroup');
        const emailInput = velocityUtils.getId('signInEmail');
        const modalBody = document.querySelector('#signInModal .modal-body');
        
        if (passwordGroup && passwordGroup.classList.contains('hidden')) {
            emailInput.classList.add('loading');
            
            setTimeout(() => {
                emailInput.classList.remove('loading');
                passwordGroup.classList.remove('hidden');
                rememberGroup.classList.remove('hidden');
                if (modalBody) modalBody.classList.remove('initial-state');
                
                const passwordInput = velocityUtils.getId('signInPassword');
                if (passwordInput) passwordInput.focus();
            }, 600);
        }
    },

    resetLoginForm() {
        const passwordGroup = velocityUtils.getId('passwordGroup');
        const rememberGroup = velocityUtils.getId('rememberGroup');
        const emailInput = velocityUtils.getId('signInEmail');
        const passwordInput = velocityUtils.getId('signInPassword');
        const submitBtn = document.querySelector('#signInForm .password-toggle');
        const modalBody = document.querySelector('#signInModal .modal-body');
        const messageContainer = velocityUtils.getId('signInMessage');
        
        // Reset form state
        if (passwordGroup) passwordGroup.classList.add('hidden');
        if (rememberGroup) rememberGroup.classList.add('hidden');
        if (emailInput) {
            emailInput.value = '';
            emailInput.classList.remove('loading');
        }
        if (passwordInput) {
            passwordInput.value = '';
        }
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.innerHTML = '→';
        }
        if (modalBody) modalBody.classList.add('initial-state');
        if (messageContainer) messageContainer.innerHTML = '';
    },

    setupRequestForm(requestForm) {
        velocityUtils.on(requestForm, 'submit', (event) => {
            const submitBtn = event.target.querySelector('.form-submit');
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.textContent = 'Submitting...';
            }
        });
    },

    showFormError(containerId, message) {
        const container = velocityUtils.getId(containerId);
        if (container) {
            container.innerHTML = `<div class="message error">${velocityUtils.escapeHTML(message)}</div>`;
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
    },

    /* ===================================================================
       Cleanup & Initialization
       =================================================================== */

    cleanupOldAttempts() {
        const now = Date.now();
        const oldCutoff = now - (24 * 60 * 60 * 1000); // 24 hours
        
        for (const [email, record] of this.loginAttempts.entries()) {
            if (record.lastAttempt < oldCutoff) {
                this.loginAttempts.delete(email);
            }
        }
    },

    init() {
        console.log('🚀 Initializing authentication system...');
        
        // Setup form handlers
        this.setupFormHandlers();
        
        // Cleanup old attempts periodically
        setInterval(() => {
            this.cleanupOldAttempts();
        }, 60 * 60 * 1000); // Every hour
        
        console.log('✅ Authentication system initialized');
    }
};

/* ===================================================================
   Global Functions for HTML Event Handlers
   =================================================================== */

// Make available globally
if (typeof window !== 'undefined') {
    window.velocityAuth = velocityAuth;
    
    // Global functions for HTML onclick handlers
    window.showSignInModal = function() {
        velocityAuth.resetLoginForm();
        if (window.showModal) showModal('signInModal');
    };
    
    window.logout = function() {
        velocityAuth.logout();
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = velocityAuth;
}