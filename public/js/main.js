// main.js - Velocity Lab Training Platform

// Utility Functions
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

// Progress Bar Update
function updateProgressBar(progress) {
  const progressBar = document.querySelector('#progressBar');
  const progressText = document.querySelector('#progressText');
  
  if (!progressBar || !progressText) return;
  
  progressBar.style.setProperty('--progress', `${progress}%`);
  progressBar.setAttribute('aria-valuenow', progress);
  progressText.textContent = `${progress}% Completed`;
}

// Form Submission Handler
async function handleFormSubmission(form, url, successCallback) {
  const formData = new FormData(form);
  const spinner = form.querySelector('.spinner');
  const button = form.querySelector('button[type="submit"]');
  const notification = form.closest('.form-container')?.querySelector('.notification') || 
                       document.querySelector('#notification');
  
  button.disabled = true;
  if (spinner) spinner.classList.add('active');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    const data = await response.json();

    if (response.ok) {
      if (successCallback) {
        successCallback(data);
      }
      return { success: true, data };
    } else {
      showNotification(data.error || 'An error occurred', 'error', notification?.id);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error(`${url} error:`, error);
    showNotification('Network error. Please try again.', 'error', notification?.id);
    return { success: false, error: error.message };
  } finally {
    button.disabled = false;
    if (spinner) spinner.classList.remove('active');
  }
}

async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/csrf');  // Adjust to your actual endpoint
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    const csrfInput = document.querySelector('#csrfToken');
    if (csrfInput) {
      csrfInput.value = data.token;
    }
  } catch (error) {
    console.error('CSRF token fetch error:', error);
  }
}

// Initialize Forms with CSRF Token
async function initForms() {
  const token = await fetchCsrfToken();
  if (!token) return;
  
  const csrfInputs = document.querySelectorAll('input[name="csrf_token"]');
  csrfInputs.forEach(input => {
    input.value = token;
  });
}

// Dashboard Functions
async function loadDashboardData() {
  try {
    const response = await fetch('/api/progress', {
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }
    
    const progressData = await response.json();
    return progressData;
  } catch (error) {
    console.error('Dashboard data error:', error);
    showNotification('Failed to load dashboard data', 'error');
    return {};
  }
}

function calculateProgress(progressData) {
  const totalTasks = 14; // Total number of tasks across all weeks
  let completedTasks = 0;

  Object.values(progressData).forEach(week => {
    completedTasks += Object.values(week).filter(Boolean).length;
  });

  return Math.round((completedTasks / totalTasks) * 100);
}

async function updateTaskProgress(week, task, checked) {
  const formData = new FormData();
  formData.append('week', week);
  formData.append('task', task);
  formData.append('checked', checked);

  try {
    const response = await fetch('/api/progress', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    // Recalculate and update progress bar
    const progressData = await loadDashboardData();
    const progress = calculateProgress(progressData);
    updateProgressBar(progress);
    
    // Visual feedback
    const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
    if (checkbox) {
      const taskElement = checkbox.closest('.task');
      taskElement.style.animation = 'checkBounce 0.5s ease-out';
      setTimeout(() => {
        taskElement.style.animation = '';
      }, 500);
    }
  } catch (error) {
    console.error('Progress update error:', error);
    showNotification('Failed to update progress', 'error');
    
    // Revert checkbox state
    const checkbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
    if (checkbox) checkbox.checked = !checked;
  }
}

// Task Modal Content
const taskModalContent = {
  week1: {
    dc: {
      title: 'Promote Server 2012 to Domain Controller',
      description: `
        <p>Promoting a Windows Server 2012 to a Domain Controller (DC) sets up Active Directory Domain Services (AD DS) and DNS for centralized management.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Ensure the server has a static IP address. Open Server Manager, go to Local Server, and configure the IPv4 settings.</li>
          <li>Add the AD DS role: In Server Manager, click "Manage" > "Add Roles and Features." Select "Active Directory Domain Services" and install.</li>
          <li>Promote to Domain Controller: After installation, click the notification flag in Server Manager and select "Promote this server to a domain controller." Choose "Add a new forest," enter your domain name (e.g., velocitylab.local), and follow the wizard.</li>
          <li>Configure DNS: During promotion, ensure DNS is installed. Post-promotion, verify DNS settings by running <code>ipconfig /all</code> to confirm the server points to itself as the primary DNS server.</li>
          <li>Verify the setup: Open "Active Directory Users and Computers" (dsa.msc) to confirm the domain structure.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank" rel="noopener">Microsoft Learn: Install AD DS</a></li>
          <li><a href="https://www.alitajran.com/install-and-configure-active-directory-domain-controller/" target="_blank" rel="noopener">ALITajran's AD DS Guide</a></li>
        </ul>
      `
    },
    vm: {
      title: 'Join VM to Domain',
      description: `
        <p>Joining a virtual machine (VM) to the domain enables centralized authentication and management via Active Directory.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Configure the VM's network: Set the DNS server to the IP address of your Domain Controller (e.g., 192.168.1.10). Open Network and Sharing Center, update the adapter settings, and restart the network service.</li>
          <li>Join the domain: On the VM, open System Properties (sysdm.cpl), click "Change," select "Domain," and enter your domain name (e.g., velocitylab.local). Provide domain admin credentials when prompted.</li>
          <li>Restart the VM: After joining, reboot the VM to apply changes.</li>
          <li>Verify the join: Log in with a domain account (e.g., velocitylab\\admin). Run <code>nltest /dsgetdc:velocitylab.local</code> to confirm the VM can contact the DC.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/join-a-windows-vm-to-an-active-directory-domain/ba-p/3266388" target="_blank" rel="noopener">TechCommunity: Join VM to Domain</a></li>
        </ul>
      `
    },
    share: {
      title: 'Configure Network Share on DC',
      description: `
        <p>Setting up a hidden network share on the Domain Controller allows secure file sharing with multiple mapping methods.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Create a folder: On the DC, create a folder (e.g., C:\\HiddenShare$). The $ suffix makes the share hidden.</li>
          <li>Share the folder: Right-click the folder, go to Properties > Sharing > Advanced Sharing. Check "Share this folder," name it "HiddenShare$," and set permissions.</li>
          <li>Map the share manually: On a client VM, open File Explorer, click "Map network drive," and enter <code>\\\\DC\\HiddenShare$</code>.</li>
          <li>Map via Group Policy: On the DC, open Group Policy Management (gpedit.msc), create a GPO, and under User Configuration > Preferences > Drive Maps, create a new drive mapping.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://www.alitajran.com/create-network-share-windows-server/" target="_blank" rel="noopener">ALITajran's Network Share Tutorial</a></li>
        </ul>
      `
    },
    group: {
      title: 'Create Security Group',
      description: `
        <p>Restricting network share access to a security group ensures only authorized users can access the share.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Create the group: On the DC, open "Active Directory Users and Computers" (dsa.msc). Right-click your domain, select New > Group, name it "ShareAccessGroup," and set it as a Security Group (Global scope).</li>
          <li>Add users: Double-click the group, go to the Members tab, click Add, and select the users who need access.</li>
          <li>Update share permissions: On the DC, right-click the HiddenShare$ folder, go to Properties > Security, click Edit, remove "Everyone," and add "ShareAccessGroup" with Read/Write permissions.</li>
          <li>Verify access: Log in to a client VM as a user in the group and confirm access to the share.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups" target="_blank" rel="noopener">Microsoft Learn: Security Groups</a></li>
        </ul>
      `
    }
  },
  week2: {
    server: {
      title: 'Install Second Server 2012',
      description: `
        <p>Adding a second Windows Server 2012 provides redundancy and supports additional roles.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Install Server 2012: Set up a new VM in your hypervisor (e.g., Hyper-V). Boot from the Server 2012 ISO and select "Server with a GUI."</li>
          <li>Configure networking: Assign a static IP and set the DNS to the primary DC's IP. Verify connectivity by pinging the DC.</li>
          <li>Join the domain: Follow the same steps as joining a VM (System Properties > Change > Domain > velocitylab.local).</li>
          <li>Promote to secondary DC (optional): Install the AD DS role and promote it to a Domain Controller for redundancy.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://www.alitajran.com/add-additional-domain-controller-to-existing-domain/" target="_blank" rel="noopener">ALITajran: Adding Secondary DC</a></li>
        </ul>
      `
    },
    wsus: {
      title: 'Setup WSUS',
      description: `
        <p>Windows Server Update Services (WSUS) centralizes patch management for domain-joined devices.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Install WSUS role: On the second server, open Server Manager, go to "Add Roles and Features," select "Windows Server Update Services."</li>
          <li>Configure WSUS: Run the post-installation tasks. Choose to store updates locally, select products (e.g., Windows Server 2012), and classifications.</li>
          <li>Create computer groups: In the WSUS console (wsus.msc), under "Computers," create groups like "Servers" and "Workstations."</li>
          <li>Apply Group Policy: On the DC, create a GPO to point clients to the WSUS server.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/deploy-windows-server-update-services" target="_blank" rel="noopener">Microsoft Learn: Deploy WSUS</a></li>
        </ul>
      `
    },
    time: {
      title: 'Configure Two Time Servers',
      description: `
        <p>Time synchronization ensures accurate timestamps for domain operations like Kerberos authentication.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Configure the PDC Emulator: On the primary DC, run <code>w32tm /config /manualpeerlist:time.windows.com /syncfromflags:manual /reliable:YES /update</code>.</li>
          <li>Restart the time service: <code>net stop w32time && net start w32time</code>.</li>
          <li>Sync the second server: On the second server, run <code>w32tm /config /syncfromflags:domhier /update</code>.</li>
          <li>Verify synchronization: Run <code>w32tm /query /status</code> on both servers.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/configuring-time-sync-for-windows-servers-in-a-domain/ba-p/3266400" target="_blank" rel="noopener">TechCommunity: Time Sync Guide</a></li>
        </ul>
      `
    }
  },
  week3: {
    upgrade: {
      title: 'Upgrade Servers to 2016',
      description: `
        <p>Upgrading to Windows Server 2016 provides improved security and features.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Backup everything: Use Windows Server Backup to back up both servers, including system state and AD data.</li>
          <li>Upgrade the secondary server: Insert the Server 2016 ISO, run setup.exe, and choose "Upgrade: Install Windows and keep files, settings, and applications."</li>
          <li>Upgrade the primary DC: After verifying the secondary server's stability, upgrade the primary DC.</li>
          <li>Verify AD health: Post-upgrade, run <code>dcdiag</code> on both DCs.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://www.alitajran.com/upgrade-domain-controllers-to-windows-server-2016/" target="_blank" rel="noopener">ALITajran: Upgrade to Server 2016</a></li>
        </ul>
      `
    },
    exchange: {
      title: 'Install Exchange Server 2019',
      description: `
        <p>Exchange Server 2019 provides enterprise-grade email and calendaring services.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Prepare the server: Install Server 2016 or 2019. Join the server to the domain and install prerequisites like .NET Framework 4.8.</li>
          <li>Prepare Active Directory: Mount the Exchange 2019 ISO and run <code>Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms</code>.</li>
          <li>Install Exchange: Run <code>Setup.exe /Mode:Install /Roles:Mailbox /IAcceptExchangeServerLicenseTerms</code>.</li>
          <li>Verify installation: Access the Exchange Admin Center at <code>https://exchange.velocitylab.local/ecp</code>.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/installation-procedures?view=exchserver-2019" target="_blank" rel="noopener">Microsoft Learn: Install Exchange 2019</a></li>
        </ul>
      `
    },
    mailbox: {
      title: 'Create User Mailboxes',
      description: `
        <p>Mailboxes enable users to send and receive emails via Exchange Server.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Access EAC: Log in to the Exchange Admin Center using a domain admin account.</li>
          <li>Create a mailbox: Go to Recipients > Mailboxes, click the "+" icon, select "User mailbox," and link it to an existing AD user.</li>
          <li>Repeat for all users: Create mailboxes for each domain user who needs email access.</li>
          <li>Test access: Configure Outlook on a client VM and confirm the mailbox is accessible.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://www.alitajran.com/create-user-mailbox-in-exchange-server/" target="_blank" rel="noopener">ALITajran: Create Mailboxes</a></li>
        </ul>
      `
    },
    mail: {
      title: 'Setup Internal Mail Flow',
      description: `
        <p>Internal mail flow ensures users can send emails within the domain.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Configure Accepted Domains: In EAC, go to Mail Flow > Accepted Domains, ensure your domain is listed as Authoritative.</li>
          <li>Verify Send Connectors: Exchange 2019 automatically creates a default Send Connector for internal mail.</li>
          <li>Test mail flow: Use Outlook to send an email between users and verify receipt.</li>
          <li>Troubleshoot if needed: Check the message tracking logs in EAC or use PowerShell: <code>Get-MessageTrackingLog</code>.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/mail-routing?view=exchserver-2019" target="_blank" rel="noopener">Microsoft Learn: Mail Flow</a></li>
        </ul>
      `
    }
  },
  week4: {
    external: {
      title: 'Publish Mail Externally',
      description: `
        <p>Publishing mail externally allows users to send and receive emails outside the domain.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Configure DNS records: Set up MX, SPF, DKIM, and DMARC records with your DNS provider.</li>
          <li>Update firewall: Forward port 25 (SMTP) to the Exchange server's internal IP.</li>
          <li>Configure Receive Connector: In EAC, create a new connector for "Internet" (Frontend Transport).</li>
          <li>Test external mail: Send an email to an external address and confirm two-way mail flow.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://www.alitajran.com/configure-exchange-server-to-send-and-receive-outside-mails/" target="_blank" rel="noopener">ALITajran: External Mail Configuration</a></li>
        </ul>
      `
    },
    hybrid: {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <p>A hybrid environment integrates on-premises Exchange with Microsoft 365 for seamless mail flow and user management.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Prepare Microsoft 365: Ensure you have a subscription with Exchange Online. Add and verify your domain.</li>
          <li>Install Azure AD Connect: Sync AD users to Microsoft 365 with password synchronization.</li>
          <li>Run Hybrid Configuration Wizard: In EAC, go to Hybrid, click "Configure," and follow the wizard.</li>
          <li>Test hybrid setup: Move a test mailbox to Exchange Online and verify access.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment-prerequisites?view=exchserver-2019" target="_blank" rel="noopener">Microsoft Learn: Hybrid Deployment</a></li>
        </ul>
      `
    },
    hosting: {
      title: 'Choose Hosting Environment',
      description: `
        <p>Selecting a hosting environment balances scalability, cost, and control for your infrastructure.</p>
        <h3>Steps to Complete:</h3>
        <ol class="subtask-list">
          <li>Evaluate Azure: Consider scalability, managed services, and integration with Microsoft 365.</li>
          <li>Evaluate on-premises: Full control but requires hardware maintenance and higher upfront costs.</li>
          <li>Document your choice: Create a pros/cons list for each option.</li>
          <li>Implement: Deploy according to your chosen approach with proper networking and security.</li>
        </ol>
        <h3>Resources:</h3>
        <ul>
          <li><a href="https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-deployment-options" target="_blank" rel="noopener">Microsoft Learn: Hybrid Options</a></li>
          <li><a href="https://techcommunity.microsoft.com/t5/azure-infrastructure/choosing-between-azure-and-on-premises-for-your-infrastructure/ba-p/3266410" target="_blank" rel="noopener">TechCommunity: Azure vs On-Premises</a></li>
        </ul>
      `
    }
  }
};

// Initialize Dashboard
async function initDashboard() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // Update user info
  const userInfo = document.querySelector('#userInfo');
  if (userInfo) userInfo.textContent = user.name;

  // Add admin link if user is admin
  if (user.role === 'admin') {
    const adminLink = document.createElement('a');
    adminLink.href = '/admin.html';
    adminLink.textContent = 'Admin Dashboard';
    const authDiv = document.querySelector('.auth');
    authDiv.insertBefore(adminLink, document.querySelector('#logout'));
  }

  // Load progress data
  const progressData = await loadDashboardData();
  const progress = calculateProgress(progressData);
  updateProgressBar(progress);

  // Setup checkboxes
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

  // Setup task click handlers
  document.querySelectorAll('.task').forEach(task => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      
      const week = task.closest('.week').dataset.week;
      const taskId = task.dataset.task;
      showTaskModal(week, taskId);
    });
  });

  // Animate timeline on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.week').forEach(week => {
    observer.observe(week);
  });
}

// Show Task Modal
function showTaskModal(week, taskId) {
  const modal = document.querySelector('#taskModal');
  const modalTitle = document.querySelector('#modalTitle');
  const modalDescription = document.querySelector('#modalDescription');
  const content = taskModalContent[week]?.[taskId];

  if (!content) return;

  modalTitle.textContent = content.title;
  modalDescription.innerHTML = content.description;
  
  modal.style.display = 'flex';
  void modal.offsetWidth; // Force reflow
  modal.classList.add('show');
}

// Close Modal
function closeModal() {
  const modal = document.querySelector('#taskModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// Initialize Profile
async function initProfile() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // Update user info
  document.querySelector('#userInfo').textContent = user.name;
  document.querySelector('#profileName').textContent = user.name;
  document.querySelector('#profileEmail').textContent = user.email;

  // Load avatar
  try {
    const response = await fetch('/api/avatar', {
      credentials: 'same-origin'
    });
    
    if (response.ok) {
      const blob = await response.blob();
      document.querySelector('#avatarPreview').src = URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error('Avatar load error:', error);
  }

  // Handle avatar upload
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

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });

      if (response.ok) {
        const preview = document.querySelector('#avatarPreview');
        preview.src = URL.createObjectURL(file);
        showNotification('Avatar uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showNotification('Failed to upload avatar', 'error');
    }
  });

  // Initialize password form
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

    const result = await handleFormSubmission(
      passwordForm,
      '/api/change-password',
      () => {
        showNotification('Password updated successfully', 'success');
        passwordForm.reset();
      }
    );
  });
}

// Initialize Admin Dashboard
async function initAdminDashboard() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name || user.role !== 'admin') {
    window.location.href = '/dashboard.html';
    return;
  }

  document.querySelector('#userInfo').textContent = user.name;
  
  // Load user progress
  await loadLeaderboard();
}

// Load Leaderboard
async function loadLeaderboard() {
  const leaderboard = document.querySelector('#leaderboard');
  
  try {
    const response = await fetch('/api/admin/users-progress', {
      credentials: 'same-origin'
    });
    
    if (!response.ok) throw new Error('Failed to fetch user progress');
    
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

// Main Initialization
async function init() {
  const user = JSON.parse(getCookie('user') || '{}');
  const path = window.location.pathname;

  // Update navigation based on user state
  if (user.name) {
    document.querySelector('#userInfo').textContent = user.name;
    document.querySelector('#userInfo').style.display = 'inline';
    document.querySelectorAll('.auth a[href="/login.html"], .auth a[href="/register.html"]').forEach(el => {
      el.style.display = 'none';
    });
  } else {
    const logoutEl = document.querySelector('#logout');
    if (logoutEl) logoutEl.style.display = 'none';

    if (path === '/dashboard.html' || path === '/profile.html' || path === '/admin.html') {
      window.location.href = '/login.html';
      return;
    }
  }
}

(async () => {
  const path = window.location.pathname;

  // Initialize CSRF tokens
  await initForms();

  // Page-specific initialization
  if (path === '/dashboard.html') {
    await initDashboard();
  } else if (path === '/profile.html') {
    await initProfile();
  } else if (path === '/admin.html') {
    await initAdminDashboard();
  }
})();


 // Setup form handlers
 setupFormHandlers();

 // Setup logout handler
 const logoutLink = document.querySelector('#logout');
 if (logoutLink) {
   logoutLink.addEventListener('click', async (e) => {
     e.preventDefault();
     await logout();
   });
 }

 // Setup modal handlers
 setupModalHandlers();

 // Setup scroll effects
 setupScrollEffects();

// Setup Form Handlers
function setupFormHandlers() {
 // Login Form
 const loginForm = document.querySelector('#loginForm');
 if (loginForm) {
   loginForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const result = await handleFormSubmission(
       loginForm,
       '/api/login',
       (data) => {
         setCookie('user', JSON.stringify(data));
         showNotification('Login successful! Redirecting...', 'success');
         setTimeout(() => {
           window.location.href = '/dashboard.html';
         }, 1500);
       }
     );
   });
 }

 // Register Form
 const registerForm = document.querySelector('#registerForm');
 if (registerForm) {
   registerForm.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const password = registerForm.querySelector('#password').value;
     const repeatPassword = registerForm.querySelector('#repeatPassword').value;
     
     if (password !== repeatPassword) {
       showNotification('Passwords do not match', 'error');
       return;
     }

     if (password.length < 8) {
       showNotification('Password must be at least 8 characters', 'error');
       return;
     }

     const result = await handleFormSubmission(
       registerForm,
       '/api/register',
       (data) => {
         setCookie('user', JSON.stringify(data));
         showNotification('Registration successful! Redirecting...', 'success');
         setTimeout(() => {
           window.location.href = '/dashboard.html';
         }, 1500);
       }
     );
   });
 }
}

// Setup Modal Handlers
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

 // Escape key to close modal
 document.addEventListener('keydown', (e) => {
   if (e.key === 'Escape') {
     closeModal();
   }
 });
}

// Setup Scroll Effects
function setupScrollEffects() {
 let lastScroll = 0;
 const nav = document.querySelector('.nav-glass');
 
 window.addEventListener('scroll', () => {
   const currentScroll = window.pageYOffset;
   
   if (currentScroll > 50) {
     nav.classList.add('scrolled');
   } else {
     nav.classList.remove('scrolled');
   }
   
   lastScroll = currentScroll;
 });
}

// Logout Function
async function logout() {
 try {
   await fetch('/api/logout', {
     method: 'POST',
     credentials: 'same-origin'
   });
   
   deleteCookie('session');
   deleteCookie('user');
   
   window.location.href = '/login.html';
 } catch (error) {
   console.error('Logout error:', error);
   // Force redirect even if API call fails
   deleteCookie('session');
   deleteCookie('user');
   window.location.href = '/login.html';
 }
}

// Export Data Function (Admin)
function exportData() {
 const leaderboardItems = document.querySelectorAll('.leaderboard-item');
 const data = [];
 
 leaderboardItems.forEach((item, index) => {
   const name = item.querySelector('h4').textContent;
   const progress = item.querySelector('p').textContent;
   data.push({
     rank: index + 1,
     name: name,
     progress: progress
   });
 });
 
 // Convert to CSV
 const csv = [
   ['Rank', 'Name', 'Progress'],
   ...data.map(row => [row.rank, row.name, row.progress])
 ].map(row => row.join(',')).join('\n');
 
 // Download CSV
 const blob = new Blob([csv], { type: 'text/csv' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = `velocity-lab-progress-${new Date().toISOString().split('T')[0]}.csv`;
 a.click();
 URL.revokeObjectURL(url);
 
 showNotification('Report exported successfully', 'success');
}

// Refresh Leaderboard Function (Admin)
async function refreshLeaderboard() {
 const leaderboard = document.querySelector('#leaderboard');
 
 // Show loading state
 leaderboard.innerHTML = `
   <div class="leaderboard-item skeleton" style="height: 100px;"></div>
   <div class="leaderboard-item skeleton" style="height: 100px;"></div>
   <div class="leaderboard-item skeleton" style="height: 100px;"></div>
 `;
 
 // Reload data
 await loadLeaderboard();
 showNotification('Leaderboard refreshed', 'success');
}

// Add Admin Function
async function addAdmin() {
 const email = prompt('Enter the email address of the user to grant admin access:');
 
 if (!email) return;
 
 const formData = new FormData();
 formData.append('email', email);
 
 try {
   const response = await fetch('/api/admin/grant-admin', {
     method: 'POST',
     body: formData,
     credentials: 'same-origin'
   });
   
   const data = await response.json();
   
   if (response.ok) {
     showNotification(`Admin access granted to ${data.user.name}`, 'success');
     await refreshLeaderboard();
   } else {
     showNotification(data.error || 'Failed to grant admin access', 'error');
   }
 } catch (error) {
   console.error('Add admin error:', error);
   showNotification('Failed to grant admin access', 'error');
 }
}

// Debounce Function
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

// Throttle Function
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

// Preload Images
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

// Service Worker Registration (Optional)
if ('serviceWorker' in navigator) {
 window.addEventListener('load', () => {
   navigator.serviceWorker.register('/sw.js').catch(err => {
     console.log('Service Worker registration failed:', err);
   });
 });
}

// Performance Monitoring
function measurePerformance() {
 if (window.performance && window.performance.timing) {
   window.addEventListener('load', () => {
     setTimeout(() => {
       const timing = window.performance.timing;
       const loadTime = timing.loadEventEnd - timing.navigationStart;
       console.log(`Page load time: ${loadTime}ms`);
     }, 0);
   });
 }
}

// Error Handling
window.addEventListener('error', (e) => {
 console.error('Global error:', e.error);
 // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
 console.error('Unhandled promise rejection:', e.reason);
 // You could send this to an error tracking service
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', init);
} else {
 init();
}

// Preload resources
preloadImages();
measurePerformance();

// Export functions for global use
window.VelocityLab = {
 showNotification,
 exportData,
 refreshLeaderboard,
 addAdmin,
 logout
};