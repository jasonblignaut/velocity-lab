// app.js

// Task data (extended with sample problematic task)
const TASKS = {
    tasks: [
        {
            week: 1,
            title: "Week 1: Environment Setup",
            tasks: [
                {
                    id: "1.1",
                    title: "Set Up Active Directory Domain",
                    description: "Deploy a Windows Server 2019 and configure Active Directory with a new forest and domain.",
                    steps: [
                        "Install Windows Server 2019 on a virtual machine.",
                        "Configure server hostname as 'DC01'.",
                        "Install Active Directory Domain Services role.",
                        "Promote server to domain controller with domain 'example.com'.",
                        "Verify DNS settings and connectivity.",
                        "Create user accounts in Active Directory.",
                        "After restart, login with domain account (VELOCITYLAB\\username)" // Problematic step
                    ]
                },
                {
                    id: "1.2",
                    title: "Configure DNS Records",
                    description: "Set up DNS records for Exchange hybrid connectivity.",
                    steps: [
                        "Create A and MX records for mail.exchanger.example.com.",
                        "Configure SPF records for spam prevention.",
                        "Verify DNS propagation using nslookup."
                    ]
                }
            ]
        },
        {
            week: 2,
            title: "Week 2: Exchange On-Premises Setup",
            tasks: [
                {
                    id: "2.1",
                    title: "Install Exchange Server 2019",
                    description: "Deploy Exchange Server 2019 in the on-premises environment.",
                    steps: [
                        "Install prerequisites for Exchange Server 2019.",
                        "Join server to example.com domain.",
                        "Run Exchange Server setup wizard.",
                        "Verify Exchange services are running."
                    ]
                },
                {
                    id: "2.2",
                    title: "Configure Mailboxes",
                    description: "Create and manage user mailboxes in Exchange.",
                    steps: [
                        "Create a new mailbox for user 'testuser'.",
                        "Configure mailbox quotas and permissions.",
                        "Test email sending/receiving internally."
                    ]
                }
            ]
        },
        {
            week: 3,
            title: "Week 3: Hybrid Configuration",
            tasks: [
                {
                    id: "3.1",
                    title: "Run Hybrid Configuration Wizard",
                    description: "Configure hybrid connectivity between on-premises Exchange and Microsoft 365.",
                    steps: [
                        "Install Azure AD Connect.",
                        "Run Hybrid Configuration Wizard in Exchange Admin Center.",
                        "Configure OAuth authentication.",
                        "Verify directory synchronization."
                    ]
                },
                {
                    id: "3.2",
                    title: "Migrate Mailboxes",
                    description: "Migrate mailboxes from on-premises to Microsoft 365.",
                    steps: [
                        "Create migration batch in Microsoft 365 admin center.",
                        "Move 'testuser' mailbox to the cloud.",
                        "Monitor migration status.",
                        "Verify mailbox access via Outlook."
                    ]
                }
            ]
        },
        {
            week: 4,
            title: "Week 4: Advanced Features and Testing",
            tasks: [
                {
                    id: "4.1",
                    title: "Configure Email Policies",
                    description: "Set up email address policies and retention policies.",
                    steps: [
                        "Create a new email address format.",
                        "Apply retention policy to mailboxes.",
                        "Test policy enforcement."
                    ]
                },
                {
                    id: "4.2",
                    title: "Perform Disaster Recovery Test",
                    description: "Simulate and recover from an Exchange server failure.",
                    steps: [
                        "Backup Exchange databases.",
                        "Simulate server failure.",
                        "Restore database from backup.",
                        "Verify mailbox access post-recovery."
                    ]
                }
            ]
        }
    ]
};

// State management
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];

// Utility functions
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show', type);
    setTimeout(() => notification.classList.remove('show', type), 3000);
}

function toggleModal(id, show) {
    document.getElementById(id).style.display = show ? 'flex' : 'none';
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/\\/g, "\\\\"); // Escape backslashes
}

// Modal handlers
function showLogin() {
    toggleModal('loginModal', true);
    toggleModal('registerModal', false);
    toggleModal('taskModal', false);
    toggleModal('adminPortalModal', false);
}

function showRegister() {
    toggleModal('registerModal', true);
    toggleModal('loginModal', false);
    toggleModal('taskModal', false);
    toggleModal('adminPortalModal', false);
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

function showAdminPortal() {
    toggleModal('adminPortalModal', true);
    renderLeaderboard();
}

// Authentication handlers
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (email && password) {
        currentUser = { email, name: email.split('@')[0], isAdmin: email === 'admin@example.com' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Signed in successfully!', 'success');
        updateUI();
        closeModal();
    } else {
        showNotification('Invalid credentials', 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    if (name && email && password.length >= 8) {
        currentUser = { email, name, isAdmin: false };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showNotification('Account created successfully!', 'success');
        updateUI();
        closeModal();
    } else {
        showNotification('Please fill all fields correctly', 'error');
    }
});

function logout() {
    currentUser = null;
    completedTasks = [];
    localStorage.removeItem('currentUser');
    localStorage.removeItem('completedTasks');
    showNotification('Signed out successfully!', 'success');
    updateUI();
}

// Dashboard rendering
function updateDashboard() {
    const weeksContainer = document.getElementById('weeksContainer');
    const progressRing = document.getElementById('progressRing');
    const progressText = document.getElementById('progressText');
    const completedTasksEl = document.getElementById('completedTasks');
    const currentWeekEl = document.getElementById('currentWeek');

    weeksContainer.innerHTML = '';

    // Calculate total tasks and progress
    let totalTasks = 0;
    let completedCount = 0;
    TASKS.tasks.forEach(week => {
        totalTasks += week.tasks.length;
        completedCount += week.tasks.filter(task => completedTasks.includes(task.id)).length;
    });

    const progressPercent = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;
    progressText.textContent = `${progressPercent}%`;
    progressRing.style.strokeDashoffset = 490 - (490 * progressPercent / 100);
    completedTasksEl.textContent = completedCount;

    // Determine current week
    const completedTaskIds = new Set(completedTasks);
    let currentWeek = 1;
    TASKS.tasks.forEach(week => {
        const weekTasks = week.tasks.map(t => t.id);
        if (weekTasks.some(id => !completedTaskIds.has(id))) {
            currentWeek = Math.max(currentWeek, week.week);
        }
    });
    currentWeekEl.textContent = `Week ${currentWeek}`;

    // Render weeks
    TASKS.tasks.forEach((week, index) => {
        const weekTasks = week.tasks;
        const weekCompleted = weekTasks.filter(task => completedTasks.includes(task.id)).length;
        const weekCard = document.createElement('div');
        weekCard.className = 'week-card';
        weekCard.innerHTML = `
            <div class="week-header" onclick="toggleWeek(${index})">
                <div class="week-info">
                    <h3>${escapeHtml(week.title)}</h3>
                    <p>${weekTasks.length} Tasks</p>
                </div>
                <div class="week-progress">
                    <div class="progress-count">${weekCompleted}/${weekTasks.length} Completed</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(weekCompleted / weekTasks.length) * 100}%"></div>
                    </div>
                </div>
            </div>
            <div id="tasksGrid-${index}" class="tasks-grid">
                ${weekTasks.map(task => `
                    <div class="task ${completedTasks.includes(task.id) ? 'completed' : ''}" onclick="showTask('${task.id}')">
                        <div class="task-header">
                            <input type="checkbox" class="task-checkbox" ${completedTasks.includes(task.id) ? 'checked' : ''} onchange="toggleTask('${task.id}', this.checked)">
                            <div>
                                <div class="task-title">${escapeHtml(task.title)}</div>
                                <div class="task-desc">${escapeHtml(task.description)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        weeksContainer.appendChild(weekCard);
    });
}

function toggleWeek(index) {
    document.getElementById(`tasksGrid-${index}`).classList.toggle('show');
}

function showTask(taskId) {
    const task = TASKS.tasks.flatMap(week => week.tasks).find(t => t.id === taskId);
    if (!task) return;
    document.getElementById('modalTitle').textContent = task.title;
    document.getElementById('modalBody').innerHTML = `
        <p>${escapeHtml(task.description)}</p>
        <div class="subtask-container">
            ${task.steps.map((step, i) => `
                <div class="subtask-item">
                    <input type="checkbox" class="subtask-checkbox" id="subtask-${task.id}-${i}" data-step="${i + 1}" ${completedTasks.includes(task.id) ? 'checked' : ''}>
                    <label for="subtask-${task.id}-${i}">${i + 1}. ${escapeHtml(step)}</label>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-primary" style="width: 100%;" onclick="toggleTask('${task.id}', true)">Mark as ${completedTasks.includes(task.id) ? 'Incomplete' : 'Complete'}</button>
    `;
    toggleModal('taskModal', true);
}

function toggleTask(taskId, isChecked) {
    if (isChecked && !completedTasks.includes(taskId)) {
        completedTasks.push(taskId);
        showNotification('Task completed!', 'success');
    } else if (!isChecked && completedTasks.includes(taskId)) {
        completedTasks = completedTasks.filter(id => id !== taskId);
        showNotification('Task marked incomplete', 'success');
    }
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    updateDashboard();
}

function startNewLab() {
    showNotification('Starting new lab environment... (mock action)', 'success');
}

function renderLeaderboard() {
    const leaderboardBody = document.getElementById('leaderboardBody');
    const leaderboard = [
        { name: 'John Doe', tasks: 40, rank: 1 },
        { name: 'Jane Smith', tasks: 35, rank: 2 },
        { name: 'Admin User', tasks: 30, rank: 3 },
    ];
    leaderboardBody.innerHTML = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Tasks Completed</th>
                </tr>
            </thead>
            <tbody>
                ${leaderboard.map(user => `
                    <tr>
                        <td>
                            <span class="medal ${user.rank === 1 ? 'gold' : user.rank === 2 ? 'silver' : 'bronze'}">
                                <span class="medal-icon">${user.rank}</span>
                            </span>
                        </td>
                        <td>${escapeHtml(user.name)}</td>
                        <td>${user.tasks}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Update UI
function updateUI() {
    const authLinks = document.getElementById('authLinks');
    const userLinks = document.getElementById('userLinks');
    const userName = document.getElementById('userName');
    const adminPortalBtn = document.getElementById('adminPortalBtn');
    const landingPage = document.getElementById('landingPage');
    const dashboardPage = document.getElementById('dashboardPage');

    if (currentUser) {
        authLinks.classList.add('hidden');
        userLinks.classList.remove('hidden');
        userName.textContent = currentUser.name;
        adminPortalBtn.classList.toggle('hidden', !currentUser.isAdmin);
        landingPage.classList.add('hidden');
        dashboardPage.classList.remove('hidden');
        updateDashboard();
    } else {
        authLinks.classList.remove('hidden');
        userLinks.classList.add('hidden');
        landingPage.classList.remove('hidden');
        dashboardPage.classList.add('hidden');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

// Complete Task Definitions for all 42 tasks
const TASK_DEFINITIONS = {
  // Week 1 - Foundation Setup (12 tasks) - Already provided
  'week1-install-server2012': {
    title: 'Install Windows Server 2012 R2',
    description: `
      <p><strong>Set up the foundation server for your domain controller with proper VM configuration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM with minimum 4GB RAM, 60GB disk (preferably 8GB RAM for Exchange later)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Boot from Windows Server 2012 R2 ISO (Datacenter or Standard edition)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Complete Windows installation wizard with GUI experience</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set strong administrator password (min 12 characters with complexity)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Install VM integration services/tools (VMware Tools or Hyper-V Integration)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Rename server to DC01 or similar meaningful name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Enable Remote Desktop for administration</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Server Installation Guide
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/watch?v=_3sGvvUYAzI" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Install Active Directory Domain Controller on Windows Server 2019
          </a>
        </li>
      </ul>
    `
  },
  'week1-configure-static-ip': {
    title: 'Configure Static IP Address',
    description: `
      <p><strong>Set up reliable static IP addressing for domain controller communication.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Network and Sharing Center from Server Manager</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Change adapter settings" on the left panel</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click network adapter, select Properties</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select IPv4 properties and configure static IP (e.g., 192.168.1.10)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set subnet mask (255.255.255.0) and default gateway (192.168.1.1)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure DNS servers - Primary: 127.0.0.1, Secondary: 8.8.8.8</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test connectivity: ping google.com and ping 8.8.8.8</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Run ipconfig /all to verify settings</label>
        </div>
      </div>
      <h3>💡 Pro Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Always use static IPs for domain controllers<br>
        • Document your IP scheme for future reference<br>
        • Consider using 10.x.x.x or 172.16.x.x for larger labs
      </p>
    `
  },
  'week1-install-adds-role': {
    title: 'Install Active Directory Domain Services Role',
    description: `
      <p><strong>Install the AD DS role to prepare for domain controller promotion.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Server Manager and click "Add roles and features"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click Next through the wizard until "Server Roles"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Check "Active Directory Domain Services"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Click "Add Features" when prompted for required features</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Continue through wizard accepting defaults</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check "Restart the destination server automatically if required"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Click Install and wait for completion</label>
        </div>
      </div>
      <h3>📚 Why AD DS is Required for Exchange</h4>
      <p style="background: var(--bg-secondary); padding: #12px; border-radius: 8px; margin-top: 16px;">
        Exchange Server relies heavily on Active Directory for:<br>
        • User authentication and authorization<br>
        • Global Address List (GAL) functionality<br>
        • Distribution groups and mail-enabled security groups<br>
        • Configuration data storage<br>
        • Site and routing topology
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.youtube.com/watch?v=JgqMSgGPwOg" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Why Active Directory is required for Exchange Server
          </a>
        </li>
      </ul>
    `
  },
  'week1-promote-to-dc': {
    title: 'Promote Server to Domain Controller',
    description: `
      <p><strong>Create a new Active Directory forest and promote the server to domain controller.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In Server Manager, click the flag icon and "Promote this server to a domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Add a new forest" and enter root domain name (e.g., velocitylab.local)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set Forest/Domain functional level to Windows Server 2012 R2</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Check "Domain Name System (DNS) server" and "Global Catalog (GC)"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set Directory Services Restore Mode (DSRM) password</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Accept default NetBIOS domain name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Accept default paths for AD DS database, log files, and SYSVOL</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Review options and click Install (server will restart automatically)</label>
        </div>
      </div>
      <h3>⚠️ Important Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use a .local domain for lab environments only<br>
        • For production, use a subdomain of your public domain<br>
        • Document your DSRM password securely<br>
        • The server will restart after promotion
      </p>
    `
  },
  'week1-configure-dns-server': {
    title: 'Configure DNS Server Settings',
    description: `
      <p><strong>Properly configure DNS for Active Directory and future Exchange deployment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open DNS Manager from Server Manager > Tools</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Expand server name and verify Forward and Reverse Lookup Zones</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click server name, select Properties</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. On Forwarders tab, add external DNS servers (8.8.8.8, 8.8.4.4)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create Reverse Lookup Zone for your subnet (e.g., 192.168.1.x)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Enable DNS scavenging on all zones (7 days no-refresh, 7 days refresh)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test DNS resolution: nslookup google.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify SRV records exist in _msdcs zone</label>
        </div>
      </div>
      <h3>📚 DNS Best Practices for Exchange</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Always configure forwarders for external resolution<br>
        • Enable scavenging to prevent stale records<br>
        • Create PTR records for all Exchange servers<br>
        • Prepare for split-brain DNS (internal vs external)
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.youtube.com/watch?v=nM_aMpYlkNw" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Domain Name System (DNS) management
          </a>
        </li>
      </ul>
    `
  },
  'week1-create-domain-users': {
    title: 'Create Domain Users and Groups',
    description: `
      <p><strong>Create user accounts and groups that will be used throughout the lab.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Active Directory Users and Computers (ADUC)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create Organizational Units: IT, Sales, Finance, Shared Resources</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create test users: John Smith (IT), Jane Doe (Sales), Bob Johnson (Finance)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set passwords to never expire for lab purposes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create security groups: IT-Staff, Sales-Team, Finance-Dept</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Add users to appropriate groups</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create an Exchange Admin account for future use</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document all usernames and passwords created</label>
        </div>
      </div>
      <h3>💡 User Creation Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use a consistent naming convention (firstname.lastname)<br>
        • Create service accounts for Exchange later<br>
        • Enable "User must change password at next logon" in production<br>
        • Use groups for permissions, not individual users
      </p>
    `
  },
  'week1-setup-vm-dns': {
    title: 'Setup Client VM and Configure DNS',
    description: `
      <p><strong>Create a Windows client VM and configure it to use the domain controller for DNS.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM with Windows 10/11 (2GB RAM minimum, 40GB disk)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows and complete initial setup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set computer name to CLIENT01 or similar</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure static IP in same subnet (e.g., 192.168.1.50)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set DNS server to domain controller IP (192.168.1.10)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify DNS resolution: nslookup velocitylab.local</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Ping domain controller by name and IP</label>
        </div>
      </div>
      <h3>⚠️ Common Issues</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure VM is on same network/VLAN as DC<br>
        • Disable Windows Firewall temporarily for testing<br>
        • Check for typos in DNS server IP address<br>
        • Flush DNS cache if needed: ipconfig /flushdns
      </p>
    `
  },
  'week1-join-vm-domain': {
    title: 'Join Client VM to Domain',
    description: `
      <p><strong>Join the Windows client to your Active Directory domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Right-click Start button, select System</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Rename this PC (advanced)" or "Domain or workgroup settings"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Click "Change" button next to computer name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Domain" and enter your domain name (velocitylab.local)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Enter domain admin credentials when prompted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Click OK through success messages and restart</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. After restart, login with domain account (VELOCITYLAB\username)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify domain membership in System properties</label>
        </div>
      </div>
      <h3>📌 Post-Join Tasks</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Add domain users to local administrators if needed<br>
        • Configure Windows Update to use WSUS (later)<br>
        • Test Group Policy application: gpupdate /force<br>
        • Install RSAT tools for remote administration
      </p>
    `
  },
  'week1-create-hidden-share': {
    title: 'Create Hidden Network Share',
    description: `
      <p><strong>Create a hidden share on the domain controller that won't be visible in network browsing.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On DC, create folder C:\SharedData\HiddenShare</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Right-click folder, select Properties > Sharing tab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Click "Advanced Sharing" and check "Share this folder"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set share name to "HiddenShare$" ($ makes it hidden)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Click Permissions, remove Everyone, add Domain Users with Change permission</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. On Security tab, ensure NTFS permissions match share permissions</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test access from client: \\\\DC01\\HiddenShare$</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify share is not visible when browsing \\\\DC01</label>
        </div>
      </div>
      <h3>💡 Hidden Share Facts</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Any share name ending with $ is hidden<br>
        • Users need to know exact path to access<br>
        • Administrative shares (C$, ADMIN$) exist by default<br>
        • Hidden shares still appear in net share command
      </p>
    `
  },
  'week1-map-drive-gpo': {
    title: 'Map Network Drive via Group Policy',
    description: `
      <p><strong>Create a GPO to automatically map network drives for users.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Group Policy Management Console (GPMC)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Right-click domain, select "Create a GPO in this domain"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Name it "Drive Mappings - GPO Method"</label>
        </div>
        <div class="subtask-item">
          <label for="register-checkbox">Register</label>
          <input type="checkbox" id="register-checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Right-click new GPO, select Edit</label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="5">
          <label>5. Navigate to User Configuration > Preferences > Windows Settings > Drive Maps</label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="6">
          <label>6. Right-click, New > Mapped Drive. Action: Create, Location: \\\\DC01\\HiddenShare$, Drive Letter: H:</label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="7">
          <label>7. Check "Reconnect" and set label to "Hidden Share (GPO)"</label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="8">
          <label>8: On Common tab, check "Run in logged-on user's security context"></label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="9">
          <label>9. Link GPO to domain or specific OU</label>
        </div>
        <div class="subtask-item">
          <input type="subtask-checkbox" data-step="10">
          <label>10. On client, run gpupdate /force and log off/on to test</label>
        </div>
      </div>
      <h3>🎯 GPO Drive Mapping Benefits</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 4px; margin-top: 16px;">
        • Centrally managed drive mappings<br>
        • Can target specific users or groups or computers<br>
        • Supports item-level targeting<br>
        • Easy to modify or remove mappings
      </p>
    `
  },
  'week1-map-drive-script': {
    title: 'Map Network Drive via Login Script',
    description: `
      <p><strong>Create login scripts to map drives using different methods.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create batch script in SYSVOL: \\\\velocitylab.local\\SYSVOL\\velocitylab.local\\scripts\\mapdrive.bat</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Add command: net use I: \\\\DC01\\HiddenShare$ /persistent:yes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create PowerShell script: mapdrive.ps1</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Add PowerShell command: New-PSDrive -Name "J" -PSProvider FileSystem -Root "\\\DC01\HiddenShare$" -Persist</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. In ADUC, edit user properties > Profile tab</label>
        </div>
        <div class="subtask-checkbox" data-step="6">
          <div class="sub-task-item">
            <input type="checkbox" id="checkbox" class="task-checkbox" data-step="6">
          <label>6. Set Logon script to mapdrive.bat</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create GPO for PowerShell scripts execution</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test both methods by logging in as different users</label>
        </div>
      </div>
      <h3>📝 Script Examples</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code>REM Batch Script Method
@echo off
net use I: \\DC01\HiddenShare$ /persistent:yes

# PowerShell Method
$credential = Get-Credential
New-PSDrive -Name "J" -PSProvider FileSystem -Root "\\DC01\HiddenShare$" -Credential $credential -Persist</code>
      </pre>
    `
  },
  'week1-create-security-group': {
    title: 'Create Security Group for Share Access',
    description: `
      <p><strong>Implement security groups to control access to network shares.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Active Directory Users and Computers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new Security Group: "SharedData-Access"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set Group scope: Global, Group type: Security</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Add specific users to group (not all domain users)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Modify share permissions: Remove Domain Users, Add SharedData-Access</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set NTFS permissions to match (SharedData-Access: Modify)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test access with user in group vs user not in group</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document group membership and permissions</label>
        </div>
      </div>
      <h3>🔐 Security Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use groups for permissions, never individual users<br>
        • Follow least privilege principle<br>
        • Use descriptive group names<br>
        • Regular audit group memberships<br>
        • Document all security changes
      </p>
    `
  },

  // Week 2 - Infrastructure Expansion (8 tasks) - Already provided
  'week2-install-second-server': {
    title: 'Install Second Windows Server 2012 R2',
    description: `
      <p><strong>Deploy a second server for redundancy and additional services.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM: 4GB RAM, 60GB disk for DC02</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2012 R2 with GUI</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure static IP (e.g., 192.168.1.11)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set DNS to point to first DC (192.168.1.10)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Rename server to DC02</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Join server to domain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Install latest Windows updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure Windows Firewall for domain profile</label>
        </div>
      </div>
      <h3>💡 Second DC Benefits</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Provides AD redundancy and fault tolerance<br>
        • Load balancing for authentication<br>
        • Can host additional services (WSUS)<br>
        • Disaster recovery capabilities
      </p>
    `
  },
  'week2-promote-additional-dc': {
    title: 'Promote Second Server to Additional Domain Controller',
    description: `
      <p><strong>Add redundancy by promoting the second server to a domain controller.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Active Directory DS role on DC02 via DC01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
        <label>2. Click "Promote this server to a domain controller" server</label>
      </div>
      <div class="subtask-item">
        <input type="checkbox" class="subtask-checkbox" data-step="3">
        <label>S3. Select "Add a new domain controller to an existing domain"</label>
      </div>
      
      <div class="sub-task-item">
        <input type="checkbox" id="checkbox-checkbox" class="checkbox" data-step="4">
        <label>4. Enter domain name</label>
      </div>

      
      <div class="subtask-item">
        <input type="checkbox" name="checkbox" data-step="5">
        <div>5. Select both DNS servers and Global Catalog options</label>
      </div>

      
      <div class="subtask-item">
        <input type="checkbox" name="checkbox" id="checkbox" data-step="6">
        <div>6.2 Set DNSR2 password (can be same as DC01)</label>
      </div>

      <div class="subitem-item">
        <div>7. Choose "Replicate from: "Replicate from: Any domain from""</label>
      </div>
      
      <div class="subtask-item">
        <div>8. Complete installation and verify</label>
        </div>
      <div class="subtask-item">
        <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>9. Update DNS to include DC02 as secondary</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>10. Test DNS and replication</label>
        </div>
      </div>
      <h3>✅ Verification Steps</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top Gypsy: 16px;">
        ✓ Check DNS records for replication errors<br>
        • Verify DNS records replicated to DC02 DC<br>2
        • Check user authentication for DNS<br>2 • DNS records
          <span id="dns"></span>
        </div>
    </div>
  },
  'week2-install-wsus-role': {
    title: 'Install Windows Server Update Services (WSUS)',
    description: `
      <p><strong>Deploy WSUS to centrally manage Windows updates in your environment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On DC02, open Server Manager > Add Roles</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Windows Server Update Services"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Add required features when prompted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select both WSUS Services and Database</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Choose WID (Windows Internal Database) for lab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Create update folder: C:\\WSUS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete installation (may take 10-15 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Note: Post-installation tasks required next</label>
        </div>
      </div>
      <h3>🎯 WSUS Benefits</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Central update management<br>
        • Bandwidth savings<br>
        • Update authentication workflow<br>
        • Reporting on update compliance issues<br>
        • Critical updates for Exchange updates
      </p>
    `
  },
  'week2-configure-wsus-settings': {
    title: 'Configure WSUS Settings and Synchronization',
    description: `
      <p><strong>Complete WSUS configuration and set up automatic synchronization.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>L1. Launch WSUS console US console from Server Manager > Manager Tools > Servers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" name="checkbox" class="subtask-checkbox" data-step="2">
          <label>L2</label>
        </label>
      </div>
      <div class="subtask-item">
        <input type="checkbox" name="checkbox" id="subtask-checkbox" data-step="3">
        <label>S3. Select "Synchronize from Microsoft Update" to Update</label>
      </div>
      
      <div class="subtask-item">
        <label for="checkbox">4. Select Products: Select products: Windows Server 2012, 2012 R2, 2016, 2019,  Windows Server 2019, Windows 2016/10</label>
      </div>
      
      <div class="sub-task-item">
      <div>5. Classify: Select Classifications: C, Critical, Definition Updates, Security Updates Updates</label>
      </div>

      
      <div class="subtask-item">
        <div id="6">6. Set schedule: sync schedule: daily at 3:00 AM AM</label>
        </div>
      </div class="subtask-item">
        <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Begin initial synchronization synchronization (may take hours)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Create computer groups: Servers, Workstations</label>
          </div>
          <div class="subtask-item">
            <input type="checkbox" class="subtask-checkbox" data-step="9">
            <label>9. Set approval rules for critical updates</label>
          </div>
      </div>
      <h3>⚠️ Important Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Initial sync downloads metadata only<br>
        • Updates download when approved<br>
        • Plan for significant disk space (20-50GB)<br>
        • Consider limiting products for lab environment
      </p>
    </div>
  },
  'week2-setup-wsus-gpo': {
    title: 'Configure WSUS Client Settings via GPO',
    description: `
      <p><strong>Create Group Policy to point clients to your WSUS server.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Group Policy Management Console</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new GPO: "WSUS Client Settings"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Edit GPO > Computer Config > Policies > Admin Templates > Windows Components > Windows Update</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure "Specify intranet Microsoft update service location"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set both URLs to: http://DC02:8530</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Enable "Configure Automatic Updates" - Set to option 4 (Auto download and schedule)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7</label>
        </div>
      <div class="subtask-item">
        <input type="checkbox" name="checkbox" id="subtask-checkbox" data-step="8">
        <label>8. Enable "Enable client-side targeting" - Set target group to Workstations</label>
      </div>
      
      <div class="subtask-item">
      <input type="submit" name="checkbox" class="checkbox" data-step="2">
      <label>L2</label>
        </div>
      </div class="subtask-item">
        <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>10.</label>
      </div>
      
      </div>
    </div>
    <h3>✅ Verification</h3>
    <p style="background: var(--label); padding: 2px; border-radius: 2px; margin-top: auto;">
      <p style="background-color: var(--bg-secondary); padding: 12px auto; border-radius: auto 2px;">
        ✓ Check WSUS clients for checking client check-ins for<br>
        • Review all Windows clients on clients for<br>
        • Check registry for: HKLM\ HKLM\\Software\Microsoft\Windows\Policies\\Microsoft\\WindowsUpdate\Scripts\\WindowsUpdate<br>\Scripts
        • Test all update installations for test updates on test machines
        </p>
      </div>
    </div>
  'week2-configure-primary-time': {
    title: 'Configure Primary time Server Time (PDT)',
    description': '`
      <p><strong>Configure time synchronization for authoritative time in your domain.</strong></p>
      <h3>📋 Steps to sync for</h3>
      <div class="subtask-container">
      <div class="subtask-item">
        <input type="checkbox" name="checkbox" class="subtask-checkbox" id="subtask-step1" data-step="1">
      <label>I1. Identify PDC: net PDC</label>
      </div>
      <div class="item-item">
        <label for="checkbox">2. On PC, open C:</label>
        </div>
      >
<div class="subtask-item">
      <div id="3">3. Stop WS: ws</div>
      </div>
      
      <div class="subtask-item">
      <input type="checkbox" name="checkbox" class="checkbox" id="subtask-checkbox" data-step="4">
      </div>
      <label>4. Config WSUS: w /config /synchronize /manualpeerlist:/label>
      </label>
      
      <div class="subtask">
">
      <div class="subtask">">5. Start time service: start time</label>
      </div>

      
      <div class="subtask-item">
      <div id="task">6. Resync sync</div>
      </div>
      </div>
      <div class="divider"></div>
      <div class="item">
        <div class="item">7</div>
        <div class="divider"></div>
        <div class="item">8</div>
      </div>
      <h3>🕖</h3>
    </div>
  },
  'week2-configure-secondary-time-server': {
    title': 'Configure Second DC time Server',
    description': '`
      </div>
      <p style="font-weight: bold; color: var(--text-primary);"><strong>Ensure proper time synchronization for secondary DC time with PDC.</strong></p>
    <h3 style="font-size: bold; margin-top: 24px; color: var(--text-primary);">📋 Steps to </strong></h3>
      <div class="tasks">
      <div style="task-item">
        <input type="checkbox" name="checkbox" class="checkbox" id="subtask-step1" data-step="1">
        <label for="checkbox">O1</label>
        </div>
      <div style="subtask">
        <input type="checkbox" name="checkbox" class="subtask" id="2">
        <label>2</label>
      </div>

      
      <div style="subtask-item">
      <input type="checkbox" name="checkbox" class="checkbox" id="subtask-checkbox" data-step="3">
      </div style="label">3</label>
      </div>

      
      <div style="subtask">
        <input type="checkbox" name="checkbox" class="checkbox" id="checkbox" id-step="4">
        <label></div>4</label>
      </div>

      
      <div style="subtask">5 <label>
      </div>
      </div>

      
      <div class="style="subtask">">
      <div id="6">6</div>
      </div>
      </div>
      
      <div style="divider"></div>

      <div style="item">2
      </div></div>
      <h3 style="border-radius: 1">⚠️</h3>
      </div>
    </div>
  },
  'week2-test': {
    title': 'Test Infrastructure and Redundancy',
    description': ' '
      <p style="color: var(--text-primary); font-weight: bold;"><strong>**Verify all infrastructure is functioning correctly.</strong>**</p>
      <h3 style="margin-top: 20px; color: var(--font-weight: bold;">📋 Steps to</h3>
      <div style="list">
      <div style="list-item">
        <input type="checkbox" name="checkbox" style="checkbox" id="subtask-item-checkbox" data-step="0">
        <label>T0</label>
      </div>
      <div style="label">L</div>
      <div style="list-item">2
      </div>      
      </div>

      <div style="list-item">
        <input type="checkbox" name="checkbox" style="checkbox" id="checkbox-checkbox" style-step="0">
        <label style="color: var(--text-primary);">S</label>
      </div>
      
      <div style="list">
        <input type="checkbox" name="checkbox" style="checkbox" id="checkbox" id="4">
        <label>4</label>
      </div>

      
      <div style="list">5
      </div>
      </div>

      
      <div style="list-style:">
        >div id="list">6</div>
      </div>

      
      <div style="divider"></div>
      <div style="item">2</div>
      <h3 style="font-size: 18px; margin-top: 20px;">✓</h3>
      </div>
    </div>

  // Week 3 - Email & Messaging (12 tasks)
  'week3-backup-servers': {
    title: 'Backup Servers Before Upgrade',
    description: `
      <p><strong>Create backups before upgrading to Windows Server 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Windows Server Backup feature on DC01 and DC02 via Server Manager</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create backup location (e.g., external drive or network share at \\\\DC01\\Backup$)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Perform System State backup of DC01 using wbadmin</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Perform System State backup of DC02 using wbadmin</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Backup all GPOs: Backup-GPO -All -Path C:\\GPOBackup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Export DHCP configuration if applicable: Export-DhcpServer -File C:\\DHCPBackup.xml</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Document server configurations, IP settings, and roles</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Take VM snapshots if in virtual environment (Hyper-V/VMware)</label>
        </div>
      </div>
      <h3>🔐 Backup Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Always backup before major changes<br>
        • Test restore procedures regularly<br>
        • Store backups in a secure, separate location<br>
        • Document backup passwords and locations<br>
        • Verify backup integrity with wbadmin
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/wbadmin" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Windows Server Backup
          </a>
        </li>
      </ul>
    `
  },
  'week3-upgrade-dc1-2016': {
    title: 'Upgrade DC01 to Windows Server 2016',
    description: `
      <p><strong>Perform in-place upgrade of first domain controller to Server 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Transfer FSMO roles to DC02: Move-ADDirectoryServerOperationMasterRole -Identity DC02 -OperationMasterRole 0,1,2,3,4</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Mount Windows Server 2016 ISO on DC01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Run setup.exe from mounted ISO</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose "Download updates" option in setup wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select "Keep personal files and apps"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Complete upgrade process (1-2 hours)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify DC services: dcdiag /v</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Install latest Windows Server 2016 updates via WSUS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test AD replication and DNS: repadmin /replsummary</label>
        </div>
      </div>
      <h3>⚠️ Upgrade Considerations</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Cannot upgrade from 2012 to 2019 directly<br>
        • 2016 is a required stepping stone<br>
        • Ensure 20GB free disk space minimum<br>
        • Plan for 2-3 hour maintenance window
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Server Upgrade Guide
          </a>
        </li>
      </ul>
    `
  },
  'week3-upgrade-dc2-2016': {
    title: 'Upgrade DC02 to Windows Server 2016',
    description: `
      <p><strong>Complete infrastructure upgrade by upgrading second domain controller.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify DC01 is fully functional: dcdiag /v</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Transfer FSMO roles back to DC01 if needed: Move-ADDirectoryServerOperationMasterRole -Identity DC01 -OperationMasterRole 0,1,2,3,4</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Mount Windows Server 2016 ISO on DC02</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run setup.exe from mounted ISO</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Choose "Download updates" option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Select "Keep personal files and apps"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete upgrade process (1-2 hours)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify DC services: dcdiag /v</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Install latest Windows Server 2016 updates via WSUS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Test AD replication and DNS: repadmin /replsummary</label>
        </div>
      </div>
      <h3>⚠️ Upgrade Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Upgrade one DC at a time<br>
        • Monitor Event Viewer for errors<br>
        • Verify replication after upgrade<br>
        • Keep backups accessible
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Server Upgrade Guide
          </a>
        </li>
      </ul>
    `
  },
  'week3-raise-functional-levels': {
    title: 'Raise Domain and Forest Functional Levels',
    description: `
      <p><strong>Upgrade domain and forest functional levels to Windows Server 2016 for enhanced features.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On DC01, open Active Directory Domains and Trusts</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Right-click the domain (velocitylab.local), select "Raise Domain Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Windows Server 2016" and click Raise</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Confirm warning about irreversible action</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Right-click "Active Directory Domains and Trusts" root, select "Raise Forest Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Select "Windows Server 2016" and click Raise</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify levels: Get-ADDomain | fl Name,DomainMode and Get-ADForest | fl Name,ForestMode</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Check Event Viewer for errors related to functional level changes</label>
        </div>
      </div>
      <h3>⚠️ Important Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Raising functional levels is irreversible<br>
        • Ensure all DCs are running Windows Server 2016 or higher<br>
        • Required for Exchange 2019 deployment<br>
        • Backup AD before proceeding
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Functional Levels
          </a>
        </li>
      </ul>
    `
  },
  'week3-install-exchange-vm': {
    title: 'Install Windows Server 2016 for Exchange',
    description: `
      <p><strong>Deploy a new server to host Exchange Server 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM: 8GB RAM, 100GB disk, 2 vCPUs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2016 Standard/Datacenter with GUI</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure static IP (e.g., 192.168.1.12)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set DNS to point to DC01 (192.168.1.10) and DC02 (192.168.1.11)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Rename server to EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Join server to domain (velocitylab.local)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Install latest Windows updates via WSUS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Enable Remote Desktop and configure firewall for domain profile</label>
        </div>
      </div>
      <h3>💡 Exchange Server Requirements</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Minimum 8GB RAM for Exchange 2019<br>
        • Do not install Exchange on a domain controller<br>
        • Ensure .NET Framework 4.8 is installed<br>
        • Document server configuration
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Exchange Prerequisites
          </a>
        </li>
      </ul>
    `
  },
  'week3-prepare-ad-exchange': {
    title: 'Prepare Active Directory for Exchange',
    description: `
      <p><strong>Extend AD schema and prepare domain for Exchange Server 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On EX01, download Exchange 2019 ISO and mount it</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Log in to DC01 with Schema Admin/Enterprise Admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Copy Exchange setup files to DC01 (e.g., D:\\Setup to C:\\ExchangeSetup)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run: Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Run: Setup.exe /PrepareAD /OrganizationName:"VelocityLab" /IAcceptExchangeServerLicenseTerms</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Run: Setup.exe /PrepareDomain /IAcceptExchangeServerLicenseTerms</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify schema extension: Get-ADObject -LDAPFilter "(objectClass=msExchSchemaVersion)"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Check replication status: repadmin /replsummary</label>
        </div>
      </div>
      <h3>⚠️ AD Preparation Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Schema changes are irreversible<br>
        • Ensure replication is healthy before proceeding<br>
        • Use an account with Schema Admins rights<br>
        • Run commands on Schema Master DC
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/prepare-active-directory-for-exchange-server-2019/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran: Prepare AD for Exchange
          </a>
        </li>
      </ul>
    `
  },
  'week3-install-exchange-prerequisites': {
    title: 'Install Exchange 2019 Prerequisites',
    description: `
      <p><strong>Install required software and roles for Exchange Server 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On EX01, install .NET Framework 4.8</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Visual C++ Redistributable 2012 and 2013</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install Unified Communications Managed API 4.0 Runtime</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run: Install-WindowsFeature Server-Media-Foundation, NET-Framework-45-Features, RPC-over-HTTP-proxy, RSAT-ADDS, Web-Mgmt-Console, WAS-Process-Model, Web-Asp-Net45, Web-Basic-Auth, Web-Client-Auth, Web-Digest-Auth, Web-Dir-Browsing, Web-Dyn-Compression, Web-Http-Errors, Web-Http-Logging, Web-Http-Redirect, Web-Http-Tracing, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Metabase, Web-Net-Ext45, Web-Request-Monitor, Web-Server, Web-Stat-Compression, Web-Static-Content, Web-Windows-Auth, Web-WMI</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Install Microsoft Edge or another supported browser</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Disable TLS 1.0 and 1.1: Update registry settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Restart EX01 to apply changes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify prerequisites: Get-WindowsFeature | Where-Object {$_.Installed}</label>
        </div>
      </div>
      <h3>💡 Prerequisite Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Install prerequisites before Exchange setup<br>
        • Use PowerShell for role installation to avoid errors<br>
        • Ensure all updates are applied<br>
        • Document installed components
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Exchange 2019 Prerequisites
          </a>
        </li>
      </ul>
    `
  },
  'week3-install-exchange-2019': {
    title: 'Install Exchange Server 2019',
    description: `
      <p><strong>Deploy Exchange Server 2019 on EX01.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On EX01, mount Exchange 2019 ISO</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run Setup.exe as Administrator</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Don't check for updates" for lab environment</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose "Mailbox role" and accept default paths</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Disable malware scanning for lab (optional)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Complete installation (30-60 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Restart EX01 after installation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify installation: Get-ExchangeServer | fl Name,Edition,AdminDisplayVersion</label>
        </div>
      </div>
      <h3>⚠️ Installation Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure AD preparation is complete<br>
        • Use an account with Organization Management role<br>
        • Monitor setup logs at C:\\ExchangeSetupLogs<br>
        • Apply latest Cumulative Update post-install
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/install-exchange-server-2019/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran: Install Exchange 2019
          </a>
        </li>
      </ul>
    `
  },
  'week3-configure-mailboxes': {
    title: 'Create and Configure Mailboxes',
    description: `
      <p><strong>Create mailboxes for test users and configure settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Exchange Admin Center (EAC) at https://EX01/ecp</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Navigate to Recipients > Mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Enable mailboxes for existing users (John Smith, Jane Doe, Bob Johnson)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create a new mailbox for Exchange Admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set mailbox quotas (e.g., 2GB warning, 3GB prohibit send)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure email address policy: @velocitylab.local</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify mailboxes: Get-Mailbox | fl Name,PrimarySmtpAddress</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test mailbox access via Outlook or OWA</label>
        </div>
      </div>
      <h3>💡 Mailbox Management Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use PowerShell for bulk mailbox creation<br>
        • Apply email address policies consistently<br>
        • Test mailbox access before proceeding<br>
        • Document mailbox configurations
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/recipients/user-mailboxes/create-user-mailboxes?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Create Mailboxes
          </a>
        </li>
      </ul>
    `
  },
  'week3-configure-internal-mailflow': {
    title: 'Configure Internal Mail Flow',
    description: `
      <p><strong>Set up internal mail flow between users.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify default Receive Connector: Get-ReceiveConnector</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure DNS A record for mail.velocitylab.local pointing to EX01 (192.168.1.12)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set Accepted Domains: Set-AcceptedDomain -Identity velocitylab.local -DomainType Authoritative</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure Send Connector for internal routing if needed</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test internal mail flow: Send email from John Smith to Jane Doe via Outlook</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check message tracking logs: Get-MessageTrackingLog -Sender john.smith@velocitylab.local</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify mail delivery in EAC or Outlook</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Troubleshoot any delivery issues using Queue Viewer</label>
        </div>
      </div>
      <h3>⚠️ Mail Flow Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure DNS resolution for internal mail<br>
        • Check firewall rules for SMTP (port 25)<br>
        • Monitor transport service logs<br>
        • Single Exchange server typically doesn’t need Send Connector for internal mail
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/mail-routing?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Mail Flow
          </a>
        </li>
      </ul>
    `
  },
  'week3-test-owa-access': {
    title: 'Test Outlook Web Access (OWA)',
    description: `
      <p><strong>Configure and test OWA for user access.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure DNS A record for owa.velocitylab.local pointing to EX01 (192.168.1.12)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify OWA virtual directory: Get-OwaVirtualDirectory</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set external and internal URL: Set-OwaVirtualDirectory -Identity "EX01\\owa (Default Web Site)" -ExternalUrl https://owa.velocitylab.local/owa -InternalUrl https://owa.velocitylab.local/owa</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Restart IIS: iisreset</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Access OWA from CLIENT01: https://owa.velocitylab.local/owa</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Log in as John Smith and send test email</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Check certificate warnings (self-signed cert in lab)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Troubleshoot access issues in IIS logs: C:\\inetpub\\logs\\LogFiles</label>
        </div>
      </div>
      <h3>💡 OWA Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use split DNS for internal/external access<br>
        • Install trusted certificate in production<br>
        • Test from multiple browsers<br>
        • Monitor OWA performance in EAC
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/clients/outlook-on-the-web/outlook-on-the-web?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Outlook on the Web
          </a>
        </li>
      </ul>
    `
  },
  'week3-backup-exchange-config': {
    title: 'Backup Exchange Configuration',
    description: `
      <p><strong>Create a backup of Exchange configuration before external mail setup.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Export Exchange config: Get-ExchangeServer | Export-Clixml C:\\ExchangeBackup\\ServerConfig.xml</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Backup virtual directories: Get-OwaVirtualDirectory, Get-EcpVirtualDirectory | Export-Clixml C:\\ExchangeBackup\\VirtualDirs.xml</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Backup Send/Receive Connectors: Get-SendConnector, Get-ReceiveConnector | Export-Clixml C:\\ExchangeBackup\\Connectors.xml</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Copy Exchange setup logs: C:\\ExchangeSetupLogs to \\\\DC01\\Backup$</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Perform System State backup of EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Take VM snapshot of EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Document backup locations and commands used</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify backup integrity by checking exported XML files</label>
        </div>
      </div>
      <h3>🔐 Backup Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Backup before major configuration changes<br>
        • Test restore procedures<br>
        • Store backups securely<br>
        • Automate backups in production
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/high-availability/disaster-recovery/backup-restore?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Exchange Backup
          </a>
        </li>
      </ul>
    `
  },
  'week3-verify-exchange-health': {
    title: 'Verify Exchange Server Health',
    description: `
      <p><strong>Ensure Exchange Server is healthy before external mail configuration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Check service status: Get-Service | Where-Object {$_.Name -like "MSExchange*"}</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify database status: Get-MailboxDatabase | fl Name,Mounted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Run health check: Test-ServiceHealth</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test mail flow: Test-Mailflow -TargetMailbox john.smith@velocitylab.local</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Check connectivity: Test-MAPIConnectivity</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Review Event Viewer for Exchange-related errors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify replication status: Get-MailboxDatabaseCopyStatus</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document any issues and resolve before proceeding</label>
        </div>
      </div>
      <h3>✅ Health Checklist</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        ✓ All Exchange services running<br>
        ✓ Databases mounted and healthy<br>
        ✓ Mail flow successful<br>
        ✓ No critical errors in Event Viewer<br>
        ✓ Ready for external mail setup
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/management/administration/troubleshoot-health?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Troubleshoot Exchange Health
          </a>
        </li>
      </ul>
    `
  },
  // Week 4 - Cloud Integration (10 tasks)
  'week4-configure-external-dns': {
    title: 'Configure External DNS Records',
    description: `
      <p><strong>Set up DNS records for external mail flow and services.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Register a public domain (e.g., velocitylab.com) for lab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create MX record pointing to mail.velocitylab.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create A record for mail.velocitylab.com to EX01 public IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Add Autodiscover record: autodiscover.velocitylab.com to EX01 public IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create SPF record: v=spf1 ip4:<EX01_public_IP> -all</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify DNS propagation: nslookup -type=mx velocitylab.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test external DNS: ping mail.velocitylab.com from external network</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document DNS records and registrar details</label>
        </div>
      </div>
      <h3>⚠️ SMTP Gotchas</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Azure labs may require public IP or NAT rules<br>
        • Ensure port 25 is open externally<br>
        • SPF is critical to prevent spoofing<br>
        • DNS propagation may take 24-48 hours
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/exchange-server-dns-records/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran: Exchange DNS Records
          </a>
        </li>
      </ul>
    `
  },
  'week4-configure-send-connector': {
    title: 'Configure Send Connector for External Mail',
    description: `
      <p><strong>Create a Send Connector for outbound external mail.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In EAC, navigate to Mail Flow > Send Connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new Send Connector named "Outbound to Internet"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set type to "Internet" and route via MX records</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Add address space: * (all domains)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select EX01 as source server</label>
        </div>
        <div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test outbound mail: Send email to external address (e.g., Gmail)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Check message tracking: Get-MessageTrackingLog -EventId SEND</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="checkbox" data-step="8">
          <label>8. Troubleshoot issues in transport logs or firewall settings</label>
        </div>
      </div>
      <h3>⚠️ Send Connector Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure port 25 outbound is allowed<br>
        • Verify reverse DNS for EX01 public IP<br>
        • Monitor for blacklisting issues<br>
        • Use smart host if ISP blocks port 25
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/send-connectors?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Send Connectors
          </a>
        </li>
      </ul>
    `
  },
  'week4-configure-receive-connector': {
    title: 'Configure Receive Connector for External Mail',
    description: `
      <p><strong>Configure Receive Connector to accept external SMTP traffic.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In EAC, navigate to Mail Flow > Receive Connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify default Frontend Transport connector on port 25</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set permissions to allow anonymous relay if needed: Set-ReceiveConnector -Identity "EX01\\Default Frontend EX01" -PermissionGroups AnonymousUsers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Ensure firewall allows inbound port 25 to EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test external mail receipt: Send email from external account to john.smith@velocitylab.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check message tracking: Get-MessageTrackingLog -EventId RECEIVE</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify delivery in user’s mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Troubleshoot using protocol logs: C:\\Program Files\\Microsoft\\Exchange Server\\V15\\TransportRoles\\Logs\\ProtocolLog</label>
        </div>
      </div>
      <h3>⚠️ Receive Connector Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Avoid open relay configurations<br>
        • Monitor for spam or abuse<br>
        • Ensure MX record points to correct IP<br>
        • Test from multiple external sources
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/receive-connectors?view=exchserver-2019" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Receive Connectors
          </a>
        </li>
      </ul>
    `
  },
  'week4-install-hybrid-agent': {
    title: 'Install Microsoft 365 Hybrid Configuration Agent',
    description: `
      <p><strong>Install the Hybrid Configuration Wizard (HCW) agent for M365 integration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Obtain M365 trial or lab subscription</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Log in to M365 Admin Center with Global Admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Navigate to Exchange Admin Center > Hybrid</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Download Hybrid Configuration Wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Run HCW on EX01 with Exchange Admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Install required components (e.g., Azure AD Connect)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify agent installation: Check HCW logs at C:\\ProgramData\\Microsoft\\Exchange Hybrid Configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Ensure EX01 has internet access for M365 connectivity</label>
        </div>
      </div>
      <h3>⚠️ Hybrid Agent Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Requires M365 tenant with valid licenses<br>
        • Ensure ports 80 and 443 are open<br>
        • Use dedicated service account for HCW<br>
        • Backup configuration before running HCW
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/exchange-hybrid-configuration-wizard/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran: Hybrid Configuration Wizard
          </a>
        </li>
      </ul>
    `
  },
  'week4-run-hybrid-wizard': {
    title: 'Run Hybrid Configuration Wizard',
    description: `
      <p><strong>Configure hybrid deployment between Exchange and M365.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Launch HCW on EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Classic Hybrid" for lab environment</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Enter M365 and on-premises admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure mail flow: Select centralized mail transport if needed</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select EX01 for send/receive connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Complete HCW and save configuration report</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify hybrid config: Get-HybridConfiguration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Check HCW logs for errors</label>
        </div>
      </div>
      <h3>⚠️ Hybrid Setup Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure DNS records are propagated<br>
        • Verify certificate covers hybrid namespaces<br>
        • Test connectivity to M365 endpoints<br>
        • Re-run HCW if errors occur
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-agent" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Hybrid Configuration
          </a>
        </li>
      </ul>
    `
  },
  'week4-configure-aad-connect': {
    title: 'Configure Azure AD Connect',
    description: `
      <p><strong>Sync on-premises AD with Azure AD for hybrid identity.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Download Azure AD Connect from M365 Admin Center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Azure AD Connect on EX01 (or separate server)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose "Express Settings" for lab environment</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Enter Azure AD Global Admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Enter on-premises AD Enterprise Admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Enable password hash synchronization</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Start initial sync: Start-ADSyncSyncCycle -PolicyType Initial</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify sync in M365: Get-MsolUser -All | Select UserPrincipalName,LastDirSyncTime</label>
        </div>
      </div>
      <h3>⚠️ Azure AD Connect Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Sync only required OUs for lab<br>
        • Avoid syncing service accounts<br>
        • Monitor sync errors in Event Viewer<br>
        • Ensure connectivity to Azure AD
      </div>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Azure AD Connect
          </a>
        </li>
      </ul>
    `
  },
  'week4-test-hybrid-mailflow': {
    title: 'Test Hybrid Mail Flow',
    description: `
      <p><strong>Verify mail flow between on-premises Exchange and M365.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create test user mailbox in Exchange Online</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Send email from John Smith (on-premises) to Exchange Online user</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Send email from Exchange Online user to Jane Doe (on-premises)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Check on-premises message tracking: Get-MessageTrackingLog -EventId SEND,RECEIVE</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Check M365 message trace in Exchange Admin Center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify delivery in both directions</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test Autodiscover functionality for hybrid users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Troubleshoot issues using HCW logs and M365 trace</label>
        </div>
      </div>
      <h3>⚠️ Hybrid Mailflow Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Ensure hybrid connectors are active<br>
        • Verify SPF, DKIM, and DMARC records<br>
        • Check certificate validity<br>
        • Monitor for delivery delays
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/mail-flow" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Hybrid Mail Flow
          </a>
        </li>
      </ul>
    `
  },
  'week4-migrate-mailbox': {
    title: 'Migrate Mailbox to Exchange Online',
    description: `
      <p><strong>Move a test mailbox to Exchange Online.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In M365 EAC, navigate to Migration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new migration batch for John Smith’s mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Remote move migration" type</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Specify on-premises endpoint created by HCW</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Start migration and monitor progress</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify mailbox in Exchange Online: Get-OnlineMailbox -Identity john.smith@velocitylab.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test access via Outlook and OWA in M365</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Complete migration batch and verify data integrity</label>
        </div>
      </div>
      <h3>⚠️ Migration Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Test with small mailboxes first<br>
        • Monitor migration performance<br>
        • Ensure sufficient bandwidth<br>
        • Backup mailboxes before migration
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/move-mailboxes" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Mailbox Migration
          </a>
        </li>
      </ul>
    `
  },
  'week4-test-freebusy': {
    title: 'Test Free/Busy Sharing',
    description: `
      <p><strong>Verify calendar sharing between on-premises and Exchange Online.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify organization relationship: Get-OrganizationRelationship</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Ensure free/busy sharing is enabled in HCW settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. From Jane Doe (on-premises), view John Smith’s (M365) calendar</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. From John Smith (M365), view Jane Doe’s (on-premises) calendar</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Schedule a meeting across environments</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify calendar permissions: Get-MailboxFolderPermission</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Check free/busy logs if issues occur</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document test results</label>
        </div>
      </div>
      <h3>⚠️ Free/Busy Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Requires proper Autodiscover configuration<br>
        • Ensure EWS is accessible externally<br>
        • Check firewall for port 443<br>
        • Test with multiple users
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/sharing" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Free/Busy Sharing
          </a>
        </li>
      </ul>
    `
  },
  'week4-document-hybrid': {
    title: 'Document Hybrid Deployment',
    description: `
      <p><strong>Document the hybrid lab setup for future reference.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Document server configurations (DC01, DC02, EX01)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Record DNS settings (internal and external)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. List Exchange connectors and settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Document hybrid configuration details (HCW settings)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Save Azure AD Connect configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Include backup locations and procedures</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Store documentation in a secure location (e.g., \\\\DC01\\Docs$)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Share documentation with lab team</label>
        </div>
      </div>
      <h3>📝 Documentation Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use templates for consistency<br>
        • Include screenshots and diagrams<br>
        • Update after changes<br>
        • Restrict access to sensitive info
      </p>
      <h3>🔗 Reference</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/exchange-hybrid-deployment/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran: Exchange Hybrid Deployment
          </a>
        </li>
      </ul>
    `
  }
};