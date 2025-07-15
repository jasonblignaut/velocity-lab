/* ===================================================================
   Velocity Lab - UI Management System
   Handles all user interface interactions, themes, and state management
   =================================================================== */

const velocityUI = {
    
    /* ===================================================================
       Theme Management
       =================================================================== */

    async setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        
        try {
            if (appState.sessionToken) {
                await velocityAPI.saveUserPreferences(appState.sessionToken, { theme: theme });
                console.log('✅ Theme preference saved to backend');
            } else {
                throw new Error('BACKEND_NOT_AVAILABLE');
            }
        } catch (error) {
            if (error.message === 'BACKEND_NOT_AVAILABLE' || error.message === 'OFFLINE') {
                console.warn('💾 Saving theme to localStorage fallback');
                velocityUtils.cookies.set('theme', theme);
            } else {
                console.warn('⚠️ Failed to save theme to backend, using client-side only:', error);
                velocityUtils.cookies.set('theme', theme);
            }
        }
        
        // Update theme option indicators
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('active');
            if ((theme === 'light' && option.classList.contains('jedi')) || 
                (theme === 'dark' && option.classList.contains('sith'))) {
                option.classList.add('active');
            }
        });
        
        // Show theme change notification
        if (window.velocityNotifications) {
            if (theme === 'light') {
                velocityNotifications.success('🌟 Light theme activated!');
            } else {
                velocityNotifications.success('🌙 Dark theme activated!');
            }
        }
    },

    async loadTheme() {
        try {
            if (appState.sessionToken) {
                const response = await velocityAPI.getUserPreferences(appState.sessionToken);
                
                if (response.success && response.data.theme) {
                    document.body.setAttribute('data-theme', response.data.theme);
                    console.log('✅ Theme loaded from backend:', response.data.theme);
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load theme from backend, using default:', error);
        }
        
        // Fallback to cookie or default
        const savedTheme = velocityUtils.cookies.get('theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        console.log('💾 Theme loaded from cookie:', savedTheme);
    },

    /* ===================================================================
       Screen State Management
       =================================================================== */

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
        
        document.body.classList.add('no-scroll', 'landing-page');
        
        const headerButtons = document.getElementById('headerButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (headerButtons) headerButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        
        // Handle mobile-specific styling
        if (window.innerWidth <= 768) {
            if (headerButtons) {
                headerButtons.style.display = 'none';
                headerButtons.style.visibility = 'hidden';
            }
            if (userMenu) {
                userMenu.style.display = 'none';
                userMenu.style.visibility = 'hidden';
                userMenu.style.pointerEvents = 'none';
                userMenu.style.position = 'fixed';
                userMenu.style.left = '-9999px';
                userMenu.style.top = '-9999px';
                userMenu.style.zIndex = '-1';
            }
            
            const userMenuDropdown = document.getElementById('userMenuDropdown');
            if (userMenuDropdown) {
                userMenuDropdown.style.display = 'none';
                userMenuDropdown.style.visibility = 'hidden';
                userMenuDropdown.style.pointerEvents = 'none';
            }
        } else {
            if (headerButtons) {
                headerButtons.style.display = '';
                headerButtons.style.visibility = '';
            }
        }
        
        this.closeMobileMenu();
        this.updateMobileMenuItems();
    },

    showDashboard() {
        document.getElementById('welcomeScreen').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        
        document.body.classList.remove('no-scroll', 'landing-page');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Close mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        const hamburger = document.querySelector('.hamburger');
        if (mobileMenu) {
            mobileMenu.classList.remove('show', 'active');
        }
        if (hamburger) {
            hamburger.classList.remove('active');
        }
        
        const headerButtons = document.getElementById('headerButtons');
        const userMenu = document.getElementById('userMenu');
        
        if (headerButtons) headerButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        
        // Update user menu for desktop
        if (window.innerWidth > 768) {
            const userNameEl = document.getElementById('userName');
            if (userNameEl && appState.user) {
                userNameEl.textContent = appState.user.name;
            }
            
            if (appState.user && appState.user.role === 'admin') {
                const adminBtn = document.getElementById('adminButton');
                if (adminBtn) adminBtn.style.display = 'block';
            }
        }
        
        // Show categories view by default
        this.showCategoriesView();
        this.closeMobileMenu();
        this.updateMobileMenuItems();
    },

    /* ===================================================================
       View Management
       =================================================================== */

    showCategoriesView() {
        appState.currentCategory = null;
        appState.currentView = 'categories';
        
        // Show categories, hide other views
        document.getElementById('categoriesContainer').classList.remove('hidden');
        document.getElementById('courseView').classList.add('hidden');
        document.getElementById('tutorialView').classList.add('hidden');
        
        // Generate category cards
        this.generateCategoryCards();
    },

    showCategoryView(categoryId) {
        const category = window.TRAINING_CATEGORIES[categoryId];
        
        if (!category) {
            if (window.velocityNotifications) {
                velocityNotifications.error('Category not found');
            }
            return;
        }
        
        if (category.type === 'lab') {
            // Show Exchange LAB interface with progress tracking
            appState.currentCategory = categoryId;
            appState.currentView = 'lab';
            
            // Show course view with progress tracking
            document.getElementById('categoriesContainer').classList.add('hidden');
            document.getElementById('courseView').classList.remove('hidden');
            document.getElementById('tutorialView').classList.add('hidden');
            
            // Generate week cards for Exchange LAB
            this.generateWeekCards();
            this.updateProgressDisplay();
            
        } else if (category.type === 'tutorial') {
            // Show tutorial interface (no progress tracking)
            this.showTutorialView(categoryId);
        }
    },

    showTutorialView(categoryId) {
        const category = window.TRAINING_CATEGORIES[categoryId];
        
        appState.currentCategory = categoryId;
        appState.currentView = 'tutorial';
        
        // Hide categories and course view, show tutorial view
        document.getElementById('categoriesContainer').classList.add('hidden');
        document.getElementById('courseView').classList.add('hidden');
        document.getElementById('tutorialView').classList.remove('hidden');
        
        // Generate tutorial content
        this.generateTutorialContent(categoryId);
    },

    /* ===================================================================
       Content Generation
       =================================================================== */

    generateCategoryCards() {
        const container = document.getElementById('categoriesContainer');
        if (!container) return;

        // Get Exchange Lab category
        const exchangeLabCategory = window.TRAINING_CATEGORIES['exchange-lab'];
        
        // Get tutorial categories
        const tutorialCategories = Object.values(window.TRAINING_CATEGORIES).filter(cat => cat.type === 'tutorial');

        // Generate progress info for Exchange Lab
        const categoryTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
        const completedTasks = categoryTasks.filter(task => 
            appState.progress[task.id] && appState.progress[task.id].completed
        ).length;
        const totalTasks = categoryTasks.length || 43;
        const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Create Exchange Lab container
        const exchangeLabHtml = `
            <div class="exchange-lab-container" onclick="velocityUI.showCategoryView('exchange-lab')">
                <div class="exchange-lab-header">
                    <div class="exchange-lab-image"></div>
                    <h2 class="exchange-lab-title">${exchangeLabCategory.title}</h2>
                </div>
                <div class="exchange-lab-description">${exchangeLabCategory.description}</div>
                <div class="exchange-lab-stats">
                    <div class="exchange-lab-count">${exchangeLabCategory.courses.length} weeks</div>
                    <div class="exchange-lab-progress">${progressPercentage}% complete</div>
                </div>
            </div>
        `;

        // Create tutorials grid
        const tutorialsHtml = `
            <div class="tutorials-grid">
                ${tutorialCategories.map(category => `
                    <div class="tutorial-category-card" onclick="velocityUI.showCategoryView('${category.id}')">
                        <div class="tutorial-header">
                            <div class="tutorial-image ${category.id}"></div>
                            <h3 class="tutorial-title">${category.title}</h3>
                        </div>
                        <div class="tutorial-count">${category.courses.length} guides</div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = exchangeLabHtml + tutorialsHtml;
    },

    generateWeekCards() {
        const container = document.getElementById('weeksContainer');
        if (!container) return;

        if (appState.currentCategory !== 'exchange-lab') {
            container.innerHTML = '<p>Week cards are only available for the Exchange Hybrid LAB.</p>';
            return;
        }

        const weekGroups = this.groupTasksByWeek();
        
        container.innerHTML = Object.keys(weekGroups).map(weekNum => {
            const week = weekGroups[weekNum];
            const completedTasks = week.tasks.filter(task => 
                appState.progress[task.id] && appState.progress[task.id].completed
            ).length;
            const progressPercentage = Math.round((completedTasks / week.tasks.length) * 100);
            
            return `
                <div class="week-card" onclick="toggleWeekExpansion(${weekNum}, event)">
                    <div class="week-header">
                        <div>
                            <div class="week-title">${week.title}</div>
                            <div class="week-tasks">${completedTasks}/${week.tasks.length} tasks</div>
                        </div>
                        <div class="expand-icon">▼</div>
                    </div>
                    <div class="week-progress">
                        <div class="week-progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                    <div class="week-description">${week.description}</div>
                    
                    <div class="task-list">
                        ${week.tasks.map(task => {
                            const isCompleted = appState.progress[task.id] && appState.progress[task.id].completed;
                            return `
                                <div class="task-item ${isCompleted ? 'completed' : ''}" onclick="event.stopPropagation()">
                                    <input type="checkbox" class="task-checkbox" 
                                           ${isCompleted ? 'checked' : ''} 
                                           onchange="toggleTaskCompletion('${task.id}')"
                                           onclick="event.stopPropagation()">
                                    <div class="task-content" onclick="event.stopPropagation(); showTaskDetail('${task.id}')">
                                        <div class="task-title">${task.title}</div>
                                        <div class="task-description">Click for details →</div>
                                    </div>
                                    <button class="task-detail-btn" onclick="event.stopPropagation(); showTaskDetail('${task.id}')">
                                        Details
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    generateTutorialContent(categoryId) {
        const category = window.TRAINING_CATEGORIES[categoryId];
        const tutorialView = document.getElementById('tutorialView');
        
        const tutorialHtml = `
            <div class="tutorial-container">
                <div class="tutorial-grid">
                    ${category.courses.map((course, index) => `
                        <div class="tutorial-card" onclick="showTutorialDetail('${categoryId}', ${index})">
                            <div class="tutorial-header">
                                <h3>${course}</h3>
                            </div>
                            <div class="tutorial-preview">
                                Click to view comprehensive step-by-step guide with examples and best practices.
                            </div>
                            <div class="tutorial-meta">
                                <span class="tutorial-arrow">→</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-secondary" onclick="velocityUI.showCategoriesView()">← Back to Categories</button>
                </div>
            </div>
        `;
        
        tutorialView.innerHTML = tutorialHtml;
    },

    /* ===================================================================
       Progress Management
       =================================================================== */

    updateProgressDisplay() {
        if (appState.currentCategory !== 'exchange-lab') return;
        
        const categoryTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
        const totalTasks = categoryTasks.length || 43;
        const completedTasks = categoryTasks.filter(task => 
            appState.progress[task.id] && appState.progress[task.id].completed
        ).length;
        const percentage = Math.round((completedTasks / totalTasks) * 100);
        
        // Update progress ring
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percentage / 100) * circumference;
        const progressRing = document.getElementById('progressRing');
        if (progressRing) {
            progressRing.style.strokeDasharray = `${circumference - offset} ${circumference}`;
        }
        
        // Update percentage text
        const progressPercentage = document.getElementById('progressPercentage');
        if (progressPercentage) {
            progressPercentage.textContent = `${percentage}%`;
        }
        
        // Regenerate week cards if in course view
        const courseView = document.getElementById('courseView');
        if (courseView && !courseView.classList.contains('hidden')) {
            this.generateWeekCards();
        }
    },

    groupTasksByWeek() {
        const weeks = {};
        
        // Define proper week descriptions for Exchange LAB
        const weekDescriptions = {
            1: {
                title: 'Week 1: Foundation & Domain Setup',
                description: '2012 Server promoted to DC, VM joined to domain, network shares with security groups'
            },
            2: {
                title: 'Week 2: Infrastructure & Updates', 
                description: 'Install 2nd server, setup WSUS, configure time servers'
            },
            3: {
                title: 'Week 3: Exchange & Mail Flow',
                description: 'Upgrade to Server 2016, install Exchange, create mailboxes, internal mail flow'
            },
            4: {
                title: 'Week 4: Hybrid & External Access',
                description: 'Publish mail externally, setup Office 365 hybrid environment'
            }
        };
        
        // Filter tasks for Exchange LAB only
        const labTasks = appState.tasks.filter(task => task.category === 'exchange-lab');
        
        labTasks.forEach(task => {
            const weekNum = task.week || 1;
            if (!weeks[weekNum]) {
                const weekInfo = weekDescriptions[weekNum] || {
                    title: `Week ${weekNum}: Training`,
                    description: `Complete ${labTasks.filter(t => t.week === weekNum).length} tasks in this week`
                };
                
                weeks[weekNum] = {
                    title: weekInfo.title,
                    description: weekInfo.description,
                    tasks: []
                };
            }
            weeks[weekNum].tasks.push(task);
        });
        
        return weeks;
    },

    /* ===================================================================
       Mobile Menu Management
       =================================================================== */

    toggleMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        this.updateMobileMenuItems();
    },

    closeMobileMenu() {
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (hamburger) hamburger.classList.remove('active');
        if (mobileMenu) mobileMenu.classList.remove('active');
        
        this.closeMobileThemeMenu();
        
        setTimeout(() => {
            this.updateMobileMenuItems();
        }, 100);
    },

    updateMobileMenuItems() {
        const mobileMenuItems = document.getElementById('mobileMenuItems');
        
        if (appState.authenticated && appState.user) {
            let adminItem = '';
            if (appState.user.role === 'admin') {
                adminItem = '<button class="mobile-menu-item" onclick="showAdminPanel(); velocityUI.closeMobileMenu();">Admin Panel</button>';
            }
            
            mobileMenuItems.innerHTML = `
                <div style="padding: 0.5rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.9rem; border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;">
                    Welcome, ${appState.user.name}
                </div>
                <button class="mobile-menu-item" onclick="startLabEnvironment(); velocityUI.closeMobileMenu();">Start New Lab</button>
                <button class="mobile-menu-item" onclick="showLabHistoryModal(); velocityUI.closeMobileMenu();">Lab History</button>
                ${adminItem}
                <button class="mobile-menu-item" onclick="toggleMobileThemeMenu(event)" id="mobileThemeToggle">
                    Theme ▶
                </button>
                <div id="mobileThemeOptions" style="display: none;">
                    <button class="mobile-menu-item" onclick="velocityUI.setTheme('light'); velocityUI.closeMobileMenu();">
                        Light Jedi
                    </button>
                    <button class="mobile-menu-item" onclick="velocityUI.setTheme('dark'); velocityUI.closeMobileMenu();">
                        Dark Sith
                    </button>
                </div>
                <button class="mobile-menu-item" onclick="logout(); velocityUI.closeMobileMenu();">Sign Out</button>
            `;
        } else {
            mobileMenuItems.innerHTML = `
                <button class="mobile-menu-item primary" onclick="showRequestAccessModal(); velocityUI.closeMobileMenu();">Request Access</button>
                <button class="mobile-menu-item" onclick="showSignInModal(); velocityUI.closeMobileMenu();">Sign In</button>
            `;
        }
    },

    closeMobileThemeMenu() {
        const themeOptions = document.getElementById('mobileThemeOptions');
        if (themeOptions) {
            themeOptions.style.display = 'none';
        }
    },

    /* ===================================================================
       Modal Management
       =================================================================== */

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        this.closeMobileMenu();
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    },

    /* ===================================================================
       Utility Functions
       =================================================================== */

    goHome() {
        if (appState.authenticated) {
            this.showCategoriesView();
        } else {
            this.showWelcomeScreen();
        }
    },

    toggleUserMenu() {
        const dropdown = document.getElementById('userMenuDropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    },

    /* ===================================================================
       Initialization
       =================================================================== */

    init() {
        console.log('🎨 Initializing UI system...');
        
        // Setup mobile menu handlers
        this.setupMobileMenuHandlers();
        
        // Setup modal click handlers
        this.setupModalHandlers();
        
        // Setup user menu handlers
        this.setupUserMenuHandlers();
        
        console.log('✅ UI system initialized');
    },

    setupMobileMenuHandlers() {
        document.addEventListener('click', (event) => {
            const mobileMenu = document.getElementById('mobileMenu');
            const hamburger = document.getElementById('hamburger');
            
            if (mobileMenu && hamburger && !mobileMenu.contains(event.target) && !hamburger.contains(event.target)) {
                this.closeMobileMenu();
            }
        });
    },

    setupModalHandlers() {
        // Close modals when clicking outside
        document.addEventListener('click', (event) => {
            const modals = document.querySelectorAll('.modal.active');
            modals.forEach(modal => {
                if (event.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        });
    },

    setupUserMenuHandlers() {
        document.addEventListener('click', (event) => {
            const userMenu = document.getElementById('userMenu');
            const dropdown = document.getElementById('userMenuDropdown');
            if (userMenu && dropdown && !userMenu.contains(event.target) && dropdown.classList.contains('active')) {
                dropdown.classList.remove('active');
            }
        });
    }
};

/* ===================================================================
   Global Functions for HTML Event Handlers
   =================================================================== */

// Make available globally
if (typeof window !== 'undefined') {
    window.velocityUI = velocityUI;
    
    // Global functions for HTML onclick handlers
    window.showModal = function(modalId) {
        velocityUI.showModal(modalId);
    };
    
    window.closeModal = function(modalId) {
        velocityUI.closeModal(modalId);
    };
    
    window.setTheme = function(theme) {
        velocityUI.setTheme(theme);
    };
    
    window.showCategoriesView = function() {
        velocityUI.showCategoriesView();
    };
    
    window.showCategoryView = function(categoryId) {
        velocityUI.showCategoryView(categoryId);
    };
    
    window.goHome = function() {
        velocityUI.goHome();
    };
    
    window.toggleMobileMenu = function() {
        velocityUI.toggleMobileMenu();
    };
    
    window.toggleUserMenu = function() {
        velocityUI.toggleUserMenu();
    };
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = velocityUI;
}