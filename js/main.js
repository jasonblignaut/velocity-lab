// main.js - Velocity Lab Training Platform
// Clean, modern design with white/light theme only

// ===== Utility Functions =====
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; Path=/; Expires=${expires}; SameSite=Strict`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

function showNotification(message, type = 'info', elementId = 'notification') {
  const notification = document.getElementById(elementId);
  if (!notification) return;
  
  notification.textContent = message;
  notification.className = `notification ${type}`;
  
  // Force reflow for animation
  void notification.offsetWidth;
  
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
    notification.classList.add('hide');
  }, 3000);
}

// Format date to readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ===== Progress Functions =====
function updateProgressBar(progress) {
  const progressBar = document.querySelector('#progressBar');
  const progressText = document.querySelector('#progressText');
  
  if (!progressBar || !progressText) return;
  
  progressBar.style.setProperty('--progress', `${progress}%`);
  progressBar.setAttribute('aria-valuenow', progress);
  progressText.textContent = `${progress}% Completed`;
}

function calculateProgress(progressData) {
  const totalTasks = 14; // Total tasks across all weeks
  let completedTasks = 0;

  Object.values(progressData).forEach(week => {
    completedTasks += Object.values(week).filter(Boolean).length;
  });

  return Math.round((completedTasks / totalTasks) * 100);
}

// ===== API Functions =====
async function apiCall(path, options = {}) {
  const baseUrl = location.origin; // dynamically gets https://your-current-subdomain.pages.dev
  const url = `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      credentials: 'include',
      redirect: 'follow',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API call failed: ${path}`, err);
    throw err;
  }
}

async function fetchCsrfToken() {
  try {
    const response = await apiCall('/api/csrf');
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
}

// ===== Form Handling =====
async function handleFormSubmission(form, url, successCallback) {
  const formData = new FormData(form);
  const spinner = form.querySelector('.spinner');
  const button = form.querySelector('button[type="submit"]');
  const notification = form.closest('.form-container')?.querySelector('.notification') || 
                       document.querySelector('#notification');
  
  button.disabled = true;
  if (spinner) spinner.classList.add('active');

  try {
    const response = await apiCall(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (successCallback) {
      successCallback(data);
    }
    
    return { success: true, data };
  } catch (error) {
    showNotification(error.message || 'An error occurred', 'error', notification?.id);
    return { success: false, error: error.message };
  } finally {
    button.disabled = false;
    if (spinner) spinner.classList.remove('active');
  }
}

// Initialize forms with CSRF token
async function initForms() {
  const token = await fetchCsrfToken();
  if (!token) return;
  
  document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
    input.value = token;
  });
}

// ===== Dashboard Functions =====
async function loadDashboardData() {
  try {
    const response = await apiCall('/api/progress');
    return await response.json();
  } catch (error) {
    showNotification('Failed to load progress data', 'error');
    return {};
  }
}

async function updateTaskProgress(week, task, checked) {
  const formData = new FormData();
  formData.append('week', week);
  formData.append('task', task);
  formData.append('checked', checked);

  try {
    await apiCall('/api/progress', {
      method: 'POST',
      body: formData
    });

    // Reload progress
    const progressData = await loadDashboardData();
    const progress = calculateProgress(progressData);
    updateProgressBar(progress);
    
    // Animate checkbox
    animateTaskCheck(week, task);
  } catch (error) {
    showNotification('Failed to update progress', 'error');
    // Revert checkbox
    const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
    if (checkbox) checkbox.checked = !checked;
  }
}

function animateTaskCheck(week, task) {
  const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
  if (!checkbox) return;
  
  const taskElement = checkbox.closest('.task');
  taskElement.style.animation = 'none';
  void taskElement.offsetWidth; // Force reflow
  taskElement.style.animation = 'checkBounce 0.5s ease-out';
}

// ===== Task Modal =====
const taskModalContent = {
  week1: {
    dc: {
      title: 'Promote Server 2012 to Domain Controller',
      description: `
        <p>Transform your Windows Server 2012 into a Domain Controller to establish centralized management for your network.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Configure Static IP</strong>
            <p>Access Server Manager → Local Server → Configure IPv4 settings with a static IP address</p>
          </li>
          <li>
            <strong>Install AD DS Role</strong>
            <p>Server Manager → Manage → Add Roles and Features → Select "Active Directory Domain Services"</p>
          </li>
          <li>
            <strong>Promote to DC</strong>
            <p>Click the notification flag → "Promote this server to a domain controller" → Add a new forest → Enter domain name (e.g., velocitylab.local)</p>
          </li>
          <li>
            <strong>Configure DNS</strong>
            <p>Ensure DNS is installed during promotion. Verify with <code>ipconfig /all</code></p>
          </li>
          <li>
            <strong>Verify Setup</strong>
            <p>Open Active Directory Users and Computers (dsa.msc) to confirm domain structure</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank" rel="noopener">
            Microsoft Learn: Install AD DS
          </a>
          <a href="https://www.alitajran.com/install-and-configure-active-directory-domain-controller/" target="_blank" rel="noopener">
            ALITajran's AD DS Guide
          </a>
        </div>
      `
    },
    vm: {
      title: 'Join VM to Domain',
      description: `
        <p>Connect your virtual machine to the domain for centralized authentication and management.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Configure Network</strong>
            <p>Set DNS server to your Domain Controller's IP (e.g., 192.168.1.10)</p>
          </li>
          <li>
            <strong>Join Domain</strong>
            <p>System Properties (sysdm.cpl) → Change → Domain → Enter domain name (velocitylab.local)</p>
          </li>
          <li>
            <strong>Restart VM</strong>
            <p>Reboot to apply domain membership changes</p>
          </li>
          <li>
            <strong>Verify Connection</strong>
            <p>Log in with domain account and run <code>nltest /dsgetdc:velocitylab.local</code></p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/join-a-windows-vm-to-an-active-directory-domain/ba-p/3266388" target="_blank" rel="noopener">
            TechCommunity: Join VM to Domain
          </a>
        </div>
      `
    },
    share: {
      title: 'Configure Network Share on DC',
      description: `
        <p>Create a hidden network share with multiple mapping methods for secure file sharing.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Create Hidden Share</strong>
            <p>Create folder C:\\HiddenShare$ ($ makes it hidden)</p>
          </li>
          <li>
            <strong>Share the Folder</strong>
            <p>Properties → Sharing → Advanced Sharing → Share as "HiddenShare$"</p>
          </li>
          <li>
            <strong>Manual Mapping</strong>
            <p>On client: Map network drive to <code>\\\\DC\\HiddenShare$</code></p>
          </li>
          <li>
            <strong>GPO Mapping</strong>
            <p>Create GPO → User Configuration → Preferences → Drive Maps</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://www.alitajran.com/create-network-share-windows-server/" target="_blank" rel="noopener">
            ALITajran's Network Share Tutorial
          </a>
        </div>
      `
    },
    group: {
      title: 'Create Security Group',
      description: `
        <p>Implement access control by creating a security group for share permissions.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Create Group</strong>
            <p>AD Users and Computers → New → Group → Name: "ShareAccessGroup"</p>
          </li>
          <li>
            <strong>Add Members</strong>
            <p>Double-click group → Members tab → Add users who need access</p>
          </li>
          <li>
            <strong>Set Permissions</strong>
            <p>Share Properties → Security → Remove "Everyone" → Add "ShareAccessGroup"</p>
          </li>
          <li>
            <strong>Test Access</strong>
            <p>Log in as group member and verify share access</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups" target="_blank" rel="noopener">
            Microsoft Learn: Security Groups
          </a>
        </div>
      `
    }
  },
  week2: {
    server: {
      title: 'Install Second Server 2012',
      description: `
        <p>Add redundancy to your infrastructure with a second Windows Server 2012.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Install Server</strong>
            <p>Create new VM → Install Server 2012 with GUI option</p>
          </li>
          <li>
            <strong>Network Configuration</strong>
            <p>Assign static IP → Set DNS to primary DC's IP</p>
          </li>
          <li>
            <strong>Domain Join</strong>
            <p>Join to velocitylab.local domain using domain admin credentials</p>
          </li>
          <li>
            <strong>Optional: Secondary DC</strong>
            <p>Install AD DS role and promote for redundancy</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://www.alitajran.com/add-additional-domain-controller-to-existing-domain/" target="_blank" rel="noopener">
            ALITajran: Adding Secondary DC
          </a>
        </div>
      `
    },
    wsus: {
      title: 'Setup WSUS',
      description: `
        <p>Centralize Windows updates management across your domain with WSUS.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Install WSUS Role</strong>
            <p>Add Roles → Windows Server Update Services → Include database</p>
          </li>
          <li>
            <strong>Configure WSUS</strong>
            <p>Choose local storage → Select products and classifications</p>
          </li>
          <li>
            <strong>Create Groups</strong>
            <p>WSUS Console → Computers → Create "Servers" and "Workstations" groups</p>
          </li>
          <li>
            <strong>Deploy via GPO</strong>
            <p>Create GPO to point clients to WSUS server</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/deploy-windows-server-update-services" target="_blank" rel="noopener">
            Microsoft Learn: Deploy WSUS
          </a>
        </div>
      `
    },
    time: {
      title: 'Configure Two Time Servers',
      description: `
        <p>Ensure accurate time synchronization for Kerberos authentication.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Configure PDC Emulator</strong>
            <p><code>w32tm /config /manualpeerlist:time.windows.com /syncfromflags:manual /reliable:YES /update</code></p>
          </li>
          <li>
            <strong>Restart Time Service</strong>
            <p><code>net stop w32time && net start w32time</code></p>
          </li>
          <li>
            <strong>Configure Secondary</strong>
            <p><code>w32tm /config /syncfromflags:domhier /update</code></p>
          </li>
          <li>
            <strong>Verify Sync</strong>
            <p><code>w32tm /query /status</code> on both servers</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/configuring-time-sync-for-windows-servers-in-a-domain/ba-p/3266400" target="_blank" rel="noopener">
            TechCommunity: Time Sync Guide
          </a>
        </div>
      `
    }
  },
  week3: {
    upgrade: {
      title: 'Upgrade Servers to 2016',
      description: `
        <p>Modernize your infrastructure by upgrading to Windows Server 2016.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Backup Everything</strong>
            <p>Use Windows Server Backup for system state and AD data</p>
          </li>
          <li>
            <strong>Upgrade Secondary</strong>
            <p>Run Server 2016 setup → Choose upgrade option</p>
          </li>
          <li>
            <strong>Verify Replication</strong>
            <p>Check AD health with <code>repadmin /replsummary</code></p>
          </li>
          <li>
            <strong>Upgrade Primary</strong>
            <p>After secondary is stable, upgrade primary DC</p>
          </li>
          <li>
            <strong>Post-Upgrade Checks</strong>
            <p>Run <code>dcdiag</code> on both DCs</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://www.alitajran.com/upgrade-domain-controllers-to-windows-server-2016/" target="_blank" rel="noopener">
            ALITajran: Upgrade to Server 2016
          </a>
        </div>
      `
    },
    exchange: {
      title: 'Install Exchange Server 2019',
      description: `
        <p>Deploy enterprise email services with Exchange Server 2019.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Prepare Server</strong>
            <p>Install Server 2016/2019 → Join domain → Install .NET 4.8</p>
          </li>
          <li>
            <strong>Prepare AD</strong>
            <p><code>Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms</code></p>
          </li>
          <li>
            <strong>Install Exchange</strong>
            <p><code>Setup.exe /Mode:Install /Roles:Mailbox /IAcceptExchangeServerLicenseTerms</code></p>
          </li>
          <li>
            <strong>Access EAC</strong>
            <p>Navigate to https://exchange.velocitylab.local/ecp</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/installation-procedures?view=exchserver-2019" target="_blank" rel="noopener">
            Microsoft Learn: Install Exchange 2019
          </a>
        </div>
      `
    },
    mailbox: {
      title: 'Create User Mailboxes',
      description: `
        <p>Enable email for your domain users by creating Exchange mailboxes.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Access EAC</strong>
            <p>Log in to Exchange Admin Center with domain admin account</p>
          </li>
          <li>
            <strong>Create Mailbox</strong>
            <p>Recipients → Mailboxes → + → User mailbox → Link to AD user</p>
          </li>
          <li>
            <strong>Configure Settings</strong>
            <p>Set mailbox alias and email address policy</p>
          </li>
          <li>
            <strong>Test Access</strong>
            <p>Configure Outlook and verify mailbox access</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://www.alitajran.com/create-user-mailbox-in-exchange-server/" target="_blank" rel="noopener">
            ALITajran: Create Mailboxes
          </a>
        </div>
      `
    },
    mail: {
      title: 'Setup Internal Mail Flow',
      description: `
        <p>Configure Exchange for internal email communication between users.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Verify Accepted Domains</strong>
            <p>Mail Flow → Accepted Domains → Ensure velocitylab.local is Authoritative</p>
          </li>
          <li>
            <strong>Check Send Connectors</strong>
            <p>Confirm default connector exists for internal routing</p>
          </li>
          <li>
            <strong>Test Mail Flow</strong>
            <p>Send test emails between users</p>
          </li>
          <li>
            <strong>Troubleshoot</strong>
            <p>Use Message Tracking or <code>Get-MessageTrackingLog</code></p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/mail-routing?view=exchserver-2019" target="_blank" rel="noopener">
            Microsoft Learn: Mail Flow
          </a>
        </div>
      `
    }
  },
  week4: {
    external: {
      title: 'Publish Mail Externally',
      description: `
        <p>Enable external email communication for your Exchange environment.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Configure DNS</strong>
            <p>Set up MX, SPF, DKIM, and DMARC records with your DNS provider</p>
          </li>
          <li>
            <strong>Firewall Rules</strong>
            <p>Forward port 25 (SMTP) to Exchange server</p>
          </li>
          <li>
            <strong>Receive Connector</strong>
            <p>Create Internet receive connector for anonymous connections</p>
          </li>
          <li>
            <strong>Test External Mail</strong>
            <p>Send to/from external addresses (Gmail, etc.)</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://www.alitajran.com/configure-exchange-server-to-send-and-receive-outside-mails/" target="_blank" rel="noopener">
            ALITajran: External Mail Configuration
          </a>
        </div>
      `
    },
    hybrid: {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <p>Integrate on-premises Exchange with Microsoft 365 for hybrid capabilities.</p>
        
        <h3>Key Steps</h3>
        <ol class="subtask-list">
          <li>
            <strong>Prepare M365</strong>
            <p>Add and verify your domain in Microsoft 365 admin center</p>
          </li>
          <li>
            <strong>Azure AD Connect</strong>
            <p>Install and configure directory synchronization</p>
          </li>
          <li>
            <strong>Hybrid Configuration Wizard</strong>
            <p>EAC → Hybrid → Configure → Follow wizard steps</p>
          </li>
          <li>
            <strong>Test Migration</strong>
            <p>Move test mailbox to Exchange Online</p>
          </li>
        </ol>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment-prerequisites?view=exchserver-2019" target="_blank" rel="noopener">
            Microsoft Learn: Hybrid Deployment
          </a>
        </div>
      `
    },
    hosting: {
      title: 'Choose Hosting Environment',
      description: `
        <p>Make an informed decision between Azure cloud and on-premises deployment.</p>
        
        <h3>Key Considerations</h3>
        <div class="comparison-grid">
          <div class="comparison-item">
            <h4>Azure Benefits</h4>
            <ul>
              <li>Scalability on demand</li>
              <li>Managed infrastructure</li>
              <li>Built-in disaster recovery</li>
              <li>Pay-as-you-go pricing</li>
            </ul>
          </div>
          <div class="comparison-item">
            <h4>On-Premises Benefits</h4>
            <ul>
              <li>Complete control</li>
              <li>Data sovereignty</li>
              <li>Predictable costs</li>
              <li>No internet dependency</li>
            </ul>
          </div>
        </div>
        
        <div class="resource-links">
          <h4>Resources</h4>
          <a href="https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-deployment-options" target="_blank" rel="noopener">
            Microsoft Learn: Hybrid Options
          </a>
          <a href="https://techcommunity.microsoft.com/t5/azure-infrastructure/choosing-between-azure-and-on-premises-for-your-infrastructure/ba-p/3266410" target="_blank" rel="noopener">
            TechCommunity: Azure vs On-Premises
          </a>
        </div>
      `
    }
  }
};

function showTaskModal(week, taskId) {
  const modal = document.querySelector('#taskModal');
  const modalTitle = document.querySelector('#modalTitle');
  const modalDescription = document.querySelector('#modalDescription');
  const content = taskModalContent[week]?.[taskId];

  if (!content || !modal) return;

  modalTitle.textContent = content.title;
  modalDescription.innerHTML = content.description;
  
  modal.style.display = 'flex';
  void modal.offsetWidth; // Force reflow
  modal.classList.add('show');
}

function closeModal() {
  const modal = document.querySelector('#taskModal');
  if (!modal) return;
  
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// ===== Dashboard Initialization =====
async function initDashboard() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // Update navigation
  updateUserInfo(user);

  // Load progress
  const progressData = await loadDashboardData();
  const progress = calculateProgress(progressData);
  updateProgressBar(progress);

  // Setup checkboxes
  setupTaskCheckboxes(progressData);

  // Setup task click handlers
  setupTaskClickHandlers();

  // Animate timeline
  animateTimeline();
}

function updateUserInfo(user) {
  const userInfo = document.querySelector('#userInfo');
  if (userInfo) {
    userInfo.textContent = user.name;
    userInfo.style.display = 'inline';
  }

  // Add admin link if needed
  if (user.role === 'admin' && !document.querySelector('a[href="/admin.html"]')) {
    const adminLink = document.createElement('a');
    adminLink.href = '/admin.html';
    adminLink.textContent = 'Admin Dashboard';
    const authDiv = document.querySelector('.auth');
    authDiv.insertBefore(adminLink, document.querySelector('#logout'));
  }
}

function setupTaskCheckboxes(progressData) {
  document.querySelectorAll('.task input[type="checkbox"]').forEach(checkbox => {
    const week = checkbox.dataset.week;
    const task = checkbox.dataset.task;
    
    // Set initial state
    if (progressData[week] && progressData[week][task]) {
      checkbox.checked = true;
    }

    // Add change listener
    checkbox.addEventListener('change', async (e) => {
      await updateTaskProgress(week, task, e.target.checked);
    });
  });
}

function setupTaskClickHandlers() {
  document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      
      const week = task.closest('.week').dataset.week;
      const taskId = task.dataset.task;
      showTaskModal(week, taskId);
    });
  });
}

function animateTimeline() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { 
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.week').forEach(week => {
    observer.observe(week);
  });
}

// ===== Profile Functions =====
async function initProfile() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  updateUserInfo(user);
  
  // Load profile data
  await loadProfileData();
  
  // Setup avatar upload
  setupAvatarUpload();
  
  // Setup password form
  setupPasswordForm();
}

async function loadProfileData() {
  try {
    const response = await apiCall('/api/user/profile');
    const data = await response.json();
    
    // Update profile display
    document.querySelector('#profileName').textContent = data.name;
    document.querySelector('#profileEmail').textContent = data.email;
    document.querySelector('#profileRole').textContent = data.role;
    document.querySelector('#profileJoined').textContent = formatDate(data.createdAt);
    
    // Update progress stats
    document.querySelector('#totalProgress').textContent = data.progress + '%';
    document.querySelector('#completedTasks').textContent = `${data.completedTasks}/${data.totalTasks}`;
    
    // Calculate current week
    const currentWeek = data.completedTasks <= 4 ? 'Week 1' :
                       data.completedTasks <= 7 ? 'Week 2' :
                       data.completedTasks <= 11 ? 'Week 3' : 'Week 4';
    document.querySelector('#currentWeek').textContent = currentWeek;
    
    // Load avatar
    await loadAvatar();
  } catch (error) {
    console.error('Profile load error:', error);
    showNotification('Failed to load profile data', 'error');
  }
}

async function loadAvatar() {
  try {
    const response = await apiCall('/api/avatar');
    if (response.ok) {
const blob = await response.blob();
     document.querySelector('#avatarPreview').src = URL.createObjectURL(blob);
   }
 } catch (error) {
   console.error('Avatar load error:', error);
 }
}

function setupAvatarUpload() {
 const avatarInput = document.querySelector('#avatarInput');
 const uploadBtn = document.querySelector('#uploadAvatarBtn');
 
 uploadBtn.addEventListener('click', () => avatarInput.click());
 
 avatarInput.addEventListener('change', async (e) => {
   const file = e.target.files[0];
   if (!file) return;

   // Validate file
   if (!file.type.startsWith('image/')) {
     showNotification('Please select an image file', 'error');
     return;
   }

   if (file.size > 5 * 1024 * 1024) {
     showNotification('File size must be less than 5MB', 'error');
     return;
   }

   // Show preview
   const preview = document.querySelector('#avatarPreview');
   preview.src = URL.createObjectURL(file);

   // Upload
   const formData = new FormData();
   formData.append('avatar', file);

   try {
     await apiCall('/api/avatar', {
       method: 'POST',
       body: formData
     });
     showNotification('Avatar uploaded successfully', 'success');
   } catch (error) {
     showNotification('Failed to upload avatar', 'error');
     // Revert preview
     loadAvatar();
   }
 });
}

function setupPasswordForm() {
 const passwordForm = document.querySelector('#passwordForm');
 
 passwordForm.addEventListener('submit', async (e) => {
   e.preventDefault();
   
   const newPassword = passwordForm.querySelector('#newPassword').value;
   const confirmPassword = passwordForm.querySelector('#confirmPassword').value;

   if (newPassword !== confirmPassword) {
     showNotification('Passwords do not match', 'error');
     return;
   }

   if (newPassword.length < 8) {
     showNotification('Password must be at least 8 characters', 'error');
     return;
   }

   await handleFormSubmission(
     passwordForm,
     '/api/profile/change-password',
     () => {
       showNotification('Password updated successfully', 'success');
       passwordForm.reset();
     }
   );
 });
}

// ===== Admin Functions =====
async function initAdminDashboard() {
 const user = JSON.parse(getCookie('user') || '{}');
 if (!user.name || user.role !== 'admin') {
   window.location.href = '/dashboard.html';
   return;
 }

 updateUserInfo(user);
 
 // Load statistics
 await loadAdminStats();
 
 // Load leaderboard
 await loadLeaderboard();
}

async function loadAdminStats() {
 try {
   const response = await apiCall('/api/admin/stats');
   const stats = await response.json();
   
   document.querySelector('#totalUsers').textContent = stats.totalUsers;
   document.querySelector('#averageProgress').textContent = stats.averageProgress + '%';
   document.querySelector('#completedUsers').textContent = stats.completedUsers;
   document.querySelector('#activeToday').textContent = stats.activeToday;
 } catch (error) {
   console.error('Admin stats error:', error);
 }
}

async function loadLeaderboard() {
 const leaderboard = document.querySelector('#leaderboard');
 
 try {
   // Show loading
   leaderboard.innerHTML = `
     <div class="leaderboard-item skeleton" style="height: 100px;"></div>
     <div class="leaderboard-item skeleton" style="height: 100px;"></div>
     <div class="leaderboard-item skeleton" style="height: 100px;"></div>
   `;
   
   const response = await apiCall('/api/admin/users-progress');
   const usersProgress = await response.json();
   
   // Sort by progress
   usersProgress.sort((a, b) => b.progress - a.progress);
   
   // Render leaderboard
   leaderboard.innerHTML = usersProgress.map((user, index) => `
     <div class="leaderboard-item" style="animation-delay: ${index * 0.1}s">
       <div class="leaderboard-rank">${index + 1}</div>
       <div class="leaderboard-avatar">
         <img src="${user.avatar || '/assets/default-avatar.png'}" 
              alt="${user.name}'s Avatar"
              onerror="this.src='/assets/default-avatar.png'">
       </div>
       <div class="leaderboard-details">
         <h4>${user.name}</h4>
         <p>${user.progress}% Completed</p>
         <div class="leaderboard-progress" style="--progress: ${user.progress}%"></div>
       </div>
     </div>
   `).join('');
 } catch (error) {
   console.error('Leaderboard error:', error);
   showNotification('Failed to load leaderboard', 'error');
 }
}

// Admin action functions
async function refreshLeaderboard() {
 await loadLeaderboard();
 showNotification('Leaderboard refreshed', 'success');
}

async function exportData() {
 try {
   const response = await apiCall('/api/admin/export/all-progress');
   const blob = await response.blob();
   
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = `velocity-lab-progress-${new Date().toISOString().split('T')[0]}.csv`;
   a.click();
   URL.revokeObjectURL(url);
   
   showNotification('Report exported successfully', 'success');
 } catch (error) {
   showNotification('Failed to export data', 'error');
 }
}

async function addAdmin() {
 const email = prompt('Enter the email address of the user to grant admin access:');
 
 if (!email) return;
 
 const formData = new FormData();
 formData.append('email', email);
 
 try {
   await apiCall('/api/admin/grant-admin', {
     method: 'POST',
     body: formData
   });
   
   showNotification('Admin access granted successfully', 'success');
   await loadLeaderboard();
 } catch (error) {
   showNotification(error.message || 'Failed to grant admin access', 'error');
 }
}

// ===== Authentication Functions =====
async function handleLogin(form) {
 await handleFormSubmission(
   form,
   '/api/login',
   (data) => {
     setCookie('user', JSON.stringify(data));
     showNotification('Login successful! Redirecting...', 'success');
     setTimeout(() => {
       window.location.href = '/dashboard.html';
     }, 1500);
   }
 );
}

async function handleRegister(form) {
 const password = form.querySelector('#password').value;
 const repeatPassword = form.querySelector('#repeatPassword').value;
 
 if (password !== repeatPassword) {
   showNotification('Passwords do not match', 'error');
   return;
 }

 if (password.length < 8) {
   showNotification('Password must be at least 8 characters', 'error');
   return;
 }

 await handleFormSubmission(
   form,
   '/api/register',
   (data) => {
     setCookie('user', JSON.stringify(data));
     showNotification('Registration successful! Redirecting...', 'success');
     setTimeout(() => {
       window.location.href = '/dashboard.html';
     }, 1500);
   }
 );
}

async function logout() {
 try {
   await apiCall('/api/logout', { method: 'POST' });
 } catch (error) {
   console.error('Logout error:', error);
 } finally {
   deleteCookie('session');
   deleteCookie('user');
   window.location.href = '/login.html';
 }
}

// ===== Form Setup Functions =====
function setupFormHandlers() {
 // Login Form
 const loginForm = document.querySelector('#loginForm');
 if (loginForm) {
   loginForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     await handleLogin(loginForm);
   });
 }

 // Register Form
 const registerForm = document.querySelector('#registerForm');
 if (registerForm) {
   registerForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     await handleRegister(registerForm);
   });
 }

 // Logout Link
 const logoutLink = document.querySelector('#logout');
 if (logoutLink) {
   logoutLink.addEventListener('click', async (e) => {
     e.preventDefault();
     await logout();
   });
 }
}

// ===== Modal Setup =====
function setupModalHandlers() {
 const modal = document.querySelector('#taskModal');
 const closeBtn = document.querySelector('#closeModal');
 
 if (closeBtn) {
   closeBtn.addEventListener('click', closeModal);
 }
 
 if (modal) {
   modal.addEventListener('click', (e) => {
     if (e.target === modal) {
       closeModal();
     }
   });
 }

 // Escape key to close
 document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape') {
     closeModal();
   }
 });
}

// ===== Scroll Effects =====
function setupScrollEffects() {
 let lastScroll = 0;
 const nav = document.querySelector('.nav-glass');
 
 if (!nav) return;
 
 window.addEventListener('scroll', throttle(() => {
   const currentScroll = window.pageYOffset;
   
   if (currentScroll > 50) {
     nav.classList.add('scrolled');
   } else {
     nav.classList.remove('scrolled');
   }
   
   lastScroll = currentScroll;
 }, 100));
}

// ===== Utility Functions =====
function throttle(func, limit) {
 let inThrottle;
 return function(...args) {
   if (!inThrottle) {
     func.apply(this, args);
     inThrottle = true;
     setTimeout(() => inThrottle = false, limit);
   }
 };
}

function debounce(func, wait) {
 let timeout;
 return function executedFunction(...args) {
   const later = () => {
     clearTimeout(timeout);
     func(...args);
   };
   clearTimeout(timeout);
   timeout = setTimeout(later, wait);
 };
}

// ===== Resource Preloading =====
function preloadImages() {
 const images = [
   '/assets/Velocity-Logo.png',
   '/assets/default-avatar.png',
   '/assets/favicon.ico'
 ];
 
 images.forEach(src => {
   const img = new Image();
   img.src = src;
 });
}

// ===== Main Initialization =====
async function init() {
 const user = JSON.parse(getCookie('user') || '{}');
 const path = window.location.pathname;

 // Handle authentication state
 if (!user.name && !['/index.html', '/login.html', '/register.html', '/'].includes(path)) {
   window.location.href = '/login.html';
   return;
 }

 // Redirect logged-in users from auth pages
 if (user.name && ['/login.html', '/register.html'].includes(path)) {
   window.location.href = '/dashboard.html';
   return;
 }

 // Initialize CSRF tokens
 await initForms();

 // Page-specific initialization
 switch (path) {
   case '/dashboard.html':
     await initDashboard();
     break;
   case '/profile.html':
     await initProfile();
     break;
   case '/admin.html':
     await initAdminDashboard();
     break;
 }

 // Setup common handlers
 setupFormHandlers();
 setupModalHandlers();
 setupScrollEffects();

 // Update navigation visibility
 updateNavigationVisibility(user);
}

function updateNavigationVisibility(user) {
 const authLinks = document.querySelectorAll('.auth a');
 const userInfo = document.querySelector('#userInfo');
 
 if (user.name) {
   // Show user info
   if (userInfo) {
     userInfo.textContent = user.name;
     userInfo.style.display = 'inline';
   }
   
   // Hide login/register links
   authLinks.forEach(link => {
     if (link.href.includes('/login.html') || link.href.includes('/register.html')) {
       link.style.display = 'none';
     }
   });
 } else {
   // Hide user-specific links
   if (userInfo) userInfo.style.display = 'none';
   
   authLinks.forEach(link => {
     if (link.href.includes('/dashboard.html') || 
         link.href.includes('/profile.html') || 
         link.href.includes('/admin.html') ||
         link.id === 'logout') {
       link.style.display = 'none';
     }
   });
 }
}

// ===== Performance Monitoring =====
function measurePerformance() {
 if (window.performance && window.performance.timing) {
   window.addEventListener('load', () => {
     setTimeout(() => {
       const timing = window.performance.timing;
       const loadTime = timing.loadEventEnd - timing.navigationStart;
       console.log(`Page load time: ${loadTime}ms`);
       
       // Log to analytics if needed
       if (loadTime > 3000) {
         console.warn('Slow page load detected');
       }
     }, 0);
   });
 }
}

// ===== Error Handling =====
window.addEventListener('error', (e) => {
 console.error('Global error:', e.error);
 // Could send to error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
 console.error('Unhandled promise rejection:', e.reason);
 // Could send to error tracking service
});

// ===== Service Worker Registration =====
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
 window.addEventListener('load', () => {
   navigator.serviceWorker.register('/sw.js').catch(err => {
     console.log('Service Worker registration failed:', err);
   });
 });
}

// ===== Export Global Functions =====
window.VelocityLab = {
 showNotification,
 exportData,
 refreshLeaderboard,
 addAdmin,
 logout,
 formatDate
};

// ===== Initialize Application =====
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
} else {
 init();
}

// Preload resources
preloadImages();
measurePerformance();

// Add smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
 document.body.style.opacity = '0';
 document.body.style.transition = 'opacity 0.3s ease-in-out';
 
 requestAnimationFrame(() => {
   document.body.style.opacity = '1';
 });
});