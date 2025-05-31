// Utility Functions
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

function setCookie(name, value) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=86400; SameSite=Strict`;
}

function showNotification(message, type, notificationElement) {
  if (!notificationElement) return;
  notificationElement.textContent = message;
  notificationElement.className = `notification ${type} show`;
  setTimeout(() => {
    notificationElement.className = `notification ${type} hide`;
  }, 3000);
}

// Progress Bar Update
function updateProgressBar(progress) {
  const progressBar = document.querySelector('#progressBar');
  const progressText = document.querySelector('#progressText');
  if (!progressBar || !progressText) return; // Prevent error on pages without progress bar
  progressBar.style.setProperty('--progress', `${progress}%`);
  progressBar.setAttribute('aria-valuenow', progress);
  progressText.textContent = `${progress}% Completed`;
}

// Form Submission Handling
async function handleFormSubmission(form, url, successMessage, errorMessage, notificationElement, redirectUrl) {
  const formData = new FormData(form);
  const spinner = form.querySelector('.spinner');
  const button = form.querySelector('button[type="submit"]');
  
  button.disabled = true;
  spinner.classList.add('active');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin', // Ensure cookies are sent
    });

    if (response.ok) {
      const data = await response.json();
      showNotification(successMessage, 'success', notificationElement);
      if (url === '/api/register' || url === '/api/login') {
        setCookie('user', JSON.stringify(data));
      }
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1500);
    } else {
      const errorData = await response.json();
      showNotification(errorData.error || errorMessage, 'error', notificationElement);
    }
  } catch (error) {
    console.error(`${url} error:`, error);
    showNotification(errorMessage, 'error', notificationElement);
  } finally {
    button.disabled = false;
    spinner.classList.remove('active');
  }
}

// Fetch CSRF Token
async function fetchCsrfToken() {
  const response = await fetch('/api/csrf', {
    credentials: 'same-origin',
  });
  const data = await response.json();
  return data.token;
}

// Initialize Forms with CSRF Token
async function initForms() {
  const forms = document.querySelectorAll('#loginForm, #registerForm, #passwordForm');
  for (const form of forms) {
    const csrfInput = form.querySelector('#csrfToken');
    if (csrfInput) {
      csrfInput.value = await fetchCsrfToken();
    }
  }
}

// Dashboard Initialization
async function initDashboard() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  const userInfo = document.querySelector('#userInfo');
  userInfo.textContent = user.name;

  if (user.role === 'admin') {
    const adminLink = document.createElement('a');
    adminLink.href = '/admin.html';
    adminLink.textContent = 'Admin Dashboard';
    userInfo.parentElement.insertBefore(adminLink, userInfo.nextSibling);
  }

  // Fetch and display progress
  try {
    const response = await fetch('/api/progress', {
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Failed to fetch progress');
    const progressData = await response.json();
    const totalTasks = 14; // Total number of tasks
    let completedTasks = 0;

    Object.values(progressData).forEach(week => {
      completedTasks += Object.values(week).filter(Boolean).length;
    });

    const progress = Math.round((completedTasks / totalTasks) * 100);
    updateProgressBar(progress);

    // Populate checkboxes
    document.querySelectorAll('.task input[type="checkbox"]').forEach(checkbox => {
      const week = checkbox.dataset.week;
      const task = checkbox.dataset.task;
      if (progressData[week] && progressData[week][task]) {
        checkbox.checked = true;
      }

      checkbox.addEventListener('change', async () => {
        const formData = new FormData();
        formData.append('week', week);
        formData.append('task', task);
        formData.append('checked', checkbox.checked);

        await fetch('/api/progress', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
        });

        const newCompletedTasks = checkbox.checked ? completedTasks + 1 : completedTasks - 1;
        const newProgress = Math.round((newCompletedTasks / totalTasks) * 100);
        updateProgressBar(newProgress);
      });
    });

    // Animate timeline
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.week').forEach(week => observer.observe(week));

    // Task modal
    const modal = document.querySelector('#taskModal');
    const modalTitle = document.querySelector('#modalTitle');
    const modalDescription = document.querySelector('#modalDescription');
    const closeModal = document.querySelector('#closeModal');

    document.querySelectorAll('.task').forEach(task => {
      task.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') return;
        const taskId = task.dataset.task;
        const week = task.dataset.week;
        const content = taskModalContent[week][taskId];
        modalTitle.textContent = content.title;
        modalDescription.innerHTML = content.description;
        modal.style.display = 'flex';
      });
    });

    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Dashboard init error:', error);
  }
}

// Profile Initialization
async function initProfile() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  const userInfo = document.querySelector('#userInfo');
  const profileName = document.querySelector('#profileName');
  const profileEmail = document.querySelector('#profileEmail');
  const avatarPreview = document.querySelector('#avatarPreview');
  const uploadAvatarBtn = document.querySelector('#uploadAvatarBtn');
  const avatarInput = document.querySelector('#avatarInput');
  const notification = document.querySelector('#notification');

  userInfo.textContent = user.name;
  profileName.textContent = user.name;
  profileEmail.textContent = user.email;

  // Load existing avatar
  try {
    const response = await fetch('/api/avatar', {
      credentials: 'same-origin',
    });
    if (response.ok) {
      const blob = await response.blob();
      avatarPreview.src = URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error('Avatar load error:', error);
  }

  // Avatar upload
  uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    if (avatarInput.files.length === 0) return;
    const file = avatarInput.files[0];
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });
      if (response.ok) {
        const blob = await (await fetch('/api/avatar', { credentials: 'same-origin' })).blob();
        avatarPreview.src = URL.createObjectURL(blob);
        showNotification('Avatar uploaded successfully', 'success', notification);
      } else {
        throw new Error('Failed to upload avatar');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      showNotification('Failed to upload avatar', 'error', notification);
    }
  });

  // Password change form
  const passwordForm = document.querySelector('#passwordForm');
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = passwordForm.querySelector('#newPassword').value;
    const confirmPassword = passwordForm.querySelector('#confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match', 'error', notification);
      return;
    }

    await handleFormSubmission(
      passwordForm,
      '/api/change-password',
      'Password updated successfully',
      'Failed to update password',
      notification,
      '/profile.html'
    );
  });
}

// Admin Dashboard Initialization
async function initAdminDashboard() {
  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  const userInfo = document.querySelector('#userInfo');
  userInfo.textContent = user.name;

  const leaderboard = document.querySelector('#leaderboard');
  const notification = document.querySelector('#notification');

  try {
    const response = await fetch('/api/admin/users-progress', {
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Failed to fetch user progress');
    const usersProgress = await response.json();

    usersProgress.sort((a, b) => b.progress - a.progress);
    leaderboard.innerHTML = usersProgress.map((user, index) => `
      <div class="leaderboard-item">
        <div class="leaderboard-rank">${index + 1}</div>
        <div class="leaderboard-avatar">
          <img src="${user.avatar || '/assets/default-avatar.png'}" alt="${user.name}'s Avatar">
        </div>
        <div class="leaderboard-details">
          <h4>${user.name}</h4>
          <p>${user.progress}% Completed</p>
          <div class="progress-bar leaderboard-progress" style="--progress: ${user.progress}%"></div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Admin dashboard error:', error);
    showNotification('Failed to load leaderboard', 'error', notification);
  }
}

// Main Initialization
function init() {
  const user = JSON.parse(getCookie('user') || '{}');
  const path = window.location.pathname;

  if (path === '/login.html' || path === '/register.html') {
    if (user.name) {
      window.location.href = '/dashboard.html';
      return;
    }
  } else if (!user.name && path !== '/index.html') {
    window.location.href = '/login.html';
    return;
  }

  // Initialize forms with CSRF token
  initForms();

  // Page-specific initialization
  if (path === '/dashboard.html') initDashboard();
  if (path === '/profile.html') initProfile();
  if (path === '/admin.html') initAdminDashboard();

  // Login form
  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleFormSubmission(
        loginForm,
        '/api/login',
        'Login successful! Redirecting...',
        'Login failed. Please check your credentials.',
        document.querySelector('#notification'),
        '/dashboard.html'
      );
    });
  }

  // Register form
  const registerForm = document.querySelector('#registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = registerForm.querySelector('#password').value;
      const repeatPassword = registerForm.querySelector('#repeatPassword').value;
      const notification = document.querySelector('#notification');

      if (password !== repeatPassword) {
        showNotification('Passwords do not match', 'error', notification);
        return;
      }

      handleFormSubmission(
        registerForm,
        '/api/register',
        'Registration successful! Redirecting...',
        'Registration failed. Please try again.',
        notification,
        '/dashboard.html'
      );
    });
  }

  // Logout
  const logoutLink = document.querySelector('#logout');
  if (logoutLink) {
    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      document.cookie = 'session=; Max-Age=0; Path=/; SameSite=Strict';
      document.cookie = 'user=; Max-Age=0; Path=/; SameSite=Strict';
      window.location.href = '/login.html';
    });
  }
}

// Task Modal Content
const taskModalContent = {
  week1: {
    dc: {
      title: 'Promote Server 2012 to Domain Controller',
      description: `
        <p>Promoting a Windows Server 2012 to a Domain Controller (DC) sets up Active Directory Domain Services (AD DS) and DNS for centralized management.</p>
        <ul class="subtask-list">
          <li>Ensure the server has a static IP address. Open Server Manager, go to Local Server, and configure the IPv4 settings.</li>
          <li>Add the AD DS role: In Server Manager, click "Manage" > "Add Roles and Features." Select "Active Directory Domain Services" and install. (<a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank">Learn more on Microsoft Learn</a>)</li>
          <li>Promote to Domain Controller: After installation, click the notification flag in Server Manager and select "Promote this server to a domain controller." Choose "Add a new forest," enter your domain name (e.g., velocitylab.local), and follow the wizard.</li>
          <li>Configure DNS: During promotion, ensure DNS is installed. Post-promotion, verify DNS settings by running <code>ipconfig /all</code> to confirm the server points to itself as the primary DNS server.</li>
          <li>Verify the setup: Open "Active Directory Users and Computers" (dsa.msc) to confirm the domain structure. For detailed steps, see <a href="https://www.alitajran.com/install-and-configure-active-directory-domain-controller/" target="_blank">ALITajran's guide</a>.</li>
        </ul>
      `,
    },
    vm: {
      title: 'Join VM to Domain',
      description: `
        <p>Joining a virtual machine (VM) to the domain enables centralized authentication and management via Active Directory.</p>
        <ul class="subtask-list">
          <li>Configure the VM’s network: Set the DNS server to the IP address of your Domain Controller (e.g., 192.168.1.10). Open Network and Sharing Center, update the adapter settings, and restart the network service.</li>
          <li>Join the domain: On the VM, open System Properties (sysdm.cpl), click "Change," select "Domain," and enter your domain name (e.g., velocitylab.local). Provide domain admin credentials when prompted.</li>
          <li>Restart the VM: After joining, reboot the VM to apply changes.</li>
          <li>Verify the join: Log in with a domain account (e.g., velocitylab\\admin). Run <code>nltest /dsgetdc:velocitylab.local</code> to confirm the VM can contact the DC. For more details, refer to <a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/join-a-windows-vm-to-an-active-directory-domain/ba-p/3266388" target="_blank">TechCommunity’s guide</a>.</li>
        </ul>
      `,
    },
    share: {
      title: 'Configure Network Share on DC',
      description: `
        <p>Setting up a hidden network share on the Domain Controller allows secure file sharing with multiple mapping methods.</p>
        <ul class="subtask-list">
          <li>Create a folder: On the DC, create a folder (e.g., C:\\HiddenShare$). The $ suffix makes the share hidden.</li>
          <li>Share the folder: Right-click the folder, go to Properties > Sharing > Advanced Sharing. Check "Share this folder," name it "HiddenShare$," and set permissions for "Everyone" to Read/Write temporarily.</li>
          <li>Map the share manually: On a client VM, open File Explorer, click "Map network drive," and enter <code>\\\\DC\\HiddenShare$</code>. Use domain credentials if prompted.</li>
          <li>Map via Group Policy: On the DC, open Group Policy Management (gpedit.msc), create a GPO, and under User Configuration > Preferences > Drive Maps, create a new drive mapping to <code>\\\\DC\\HiddenShare$</code>. Link the GPO to the appropriate OU. For a step-by-step guide, see <a href="https://www.alitajran.com/create-network-share-windows-server/" target="_blank">ALITajran’s tutorial</a>.</li>
        </ul>
      `,
    },
    group: {
      title: 'Create Security Group',
      description: `
        <p>Restricting network share access to a security group ensures only authorized users can access the share.</p>
        <ul class="subtask-list">
          <li>Create the group: On the DC, open "Active Directory Users and Computers" (dsa.msc). Right-click your domain, select New > Group, name it "ShareAccessGroup," and set it as a Security Group (Global scope).</li>
          <li>Add users: Double-click the group, go to the Members tab, click Add, and select the users who need access (e.g., domain users).</li>
          <li>Update share permissions: On the DC, right-click the HiddenShare$ folder, go to Properties > Security, click Edit, remove "Everyone," and add "ShareAccessGroup" with Read/Write permissions.</li>
          <li>Verify access: Log in to a client VM as a user in the group and confirm access to the share. Deny access for a user not in the group to test. See <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups" target="_blank">Microsoft Learn on Security Groups</a> for more details.</li>
        </ul>
      `,
    },
  },
  week2: {
    server: {
      title: 'Install Second Server 2012',
      description: `
        <p>Adding a second Windows Server 2012 provides redundancy and supports additional roles.</p>
        <ul class="subtask-list">
          <li>Install Server 2012: Set up a new VM in your hypervisor (e.g., Hyper-V). Boot from the Server 2012 ISO, follow the installation wizard, and select "Server with a GUI."</li>
          <li>Configure networking: Assign a static IP and set the DNS to the primary DC’s IP (e.g., 192.168.1.10). Verify connectivity by pinging the DC.</li>
          <li>Join the domain: Follow the same steps as joining a VM (System Properties > Change > Domain > velocitylab.local). Use domain admin credentials.</li>
          <li>Promote to secondary DC (optional): Install the AD DS role and promote it to a Domain Controller for redundancy. Check <a href="https://www.alitajran.com/add-additional-domain-controller-to-existing-domain/" target="_blank">ALITajran’s guide on adding a secondary DC</a>.</li>
        </ul>
      `,
    },
    wsus: {
      title: 'Setup WSUS',
      description: `
        <p>Windows Server Update Services (WSUS) centralizes patch management for domain-joined devices.</p>
        <ul class="subtask-list">
          <li>Install WSUS role: On the second server, open Server Manager, go to "Add Roles and Features," select "Windows Server Update Services," and install. Include the WSUS Services and Database components.</li>
          <li>Configure WSUS: Run the post-installation tasks from Server Manager. Choose to store updates locally (e.g., D:\\WSUS), select products (e.g., Windows Server 2012), and classifications (e.g., Critical Updates).</li>
          <li>Create computer groups: In the WSUS console (wsus.msc), under "Computers," create groups like "Servers" and "Workstations."</li>
          <li>Apply Group Policy: On the DC, create a GPO to point clients to the WSUS server (e.g., http://wsus.velocitylab.local:8530). Link it to the domain OU. For detailed steps, see <a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/deploy-windows-server-update-services" target="_blank">Microsoft Learn’s WSUS deployment guide</a>.</li>
        </ul>
      `,
    },
    time: {
      title: 'Configure Two Time Servers',
      description: `
        <p>Time synchronization ensures accurate timestamps for domain operations like Kerberos authentication.</p>
        <ul class="subtask-list">
          <li>Configure the PDC Emulator: On the primary DC (PDC Emulator), run <code>w32tm /config /manualpeerlist:time.windows.com /syncfromflags:manual /reliable:YES /update</code>. Restart the time service: <code>net stop w32time && net start w32time</code>.</li>
          <li>Sync the second server: On the second server, run <code>w32tm /config /syncfromflags:domhier /update</code> to sync with the PDC Emulator. Restart the time service.</li>
          <li>Verify synchronization: On both servers, run <code>w32tm /query /status</code> to confirm the time source and sync status.</li>
          <li>Ensure clients sync: Domain-joined devices automatically sync with the PDC Emulator. For troubleshooting, see <a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/configuring-time-sync-for-windows-servers-in-a-domain/ba-p/3266400" target="_blank">TechCommunity’s time sync guide</a>.</li>
        </ul>
      `,
    },
  },
  week3: {
    upgrade: {
      title: 'Upgrade Servers to 2016',
      description: `
        <p>Upgrading to Windows Server 2016 provides improved security and features.</p>
        <ul class="subtask-list">
          <li>Backup everything: Use Windows Server Backup to back up both servers, including system state and AD data. Verify backups before proceeding.</li>
          <li>Upgrade the secondary server: Insert the Server 2016 ISO, run setup.exe, and choose "Upgrade: Install Windows and keep files, settings, and applications." Follow the wizard.</li>
          <li>Upgrade the primary DC: After verifying the secondary server’s stability (check AD replication with <code>repadmin /replsummary</code>), upgrade the primary DC using the same process.</li>
          <li>Verify AD health: Post-upgrade, run <code>dcdiag</code> on both DCs to ensure Active Directory is healthy. For best practices, see <a href="https://www.alitajran.com/upgrade-domain-controllers-to-windows-server-2016/" target="_blank">ALITajran’s upgrade guide</a>.</li>
        </ul>
      `,
    },
    exchange: {
      title: 'Install Exchange Server 2019',
      description: `
        <p>Exchange Server 2019 provides enterprise-grade email and calendaring services.</p>
        <ul class="subtask-list">
          <li>Prepare the server: Install Server 2016 or 2019 (Exchange 2019 doesn’t support 2012). Join the server to the domain and install prerequisites like .NET Framework 4.8 and Visual C++ Redistributable.</li>
          <li>Prepare Active Directory: Mount the Exchange 2019 ISO, open a PowerShell prompt, and run <code>Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms</code>, followed by <code>Setup.exe /PrepareAD /IAcceptExchangeServerLicenseTerms</code>.</li>
          <li>Install Exchange: Run <code>Setup.exe /Mode:Install /Roles:Mailbox /IAcceptExchangeServerLicenseTerms</code>. This installs the Mailbox role (includes Client Access services).</li>
          <li>Verify installation: Access the Exchange Admin Center (EAC) at <code>https://exchange.velocitylab.local/ecp</code>. For detailed steps, refer to <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/installation-procedures?view=exchserver-2019" target="_blank">Microsoft Learn’s Exchange 2019 installation guide</a>.</li>
        </ul>
      `,
    },
    mailbox: {
      title: 'Create User Mailboxes',
      description: `
        <p>Mailboxes enable users to send and receive emails via Exchange Server.</p>
        <ul class="subtask-list">
          <li>Access EAC: Log in to the Exchange Admin Center (e.g., https://exchange.velocitylab.local/ecp) using a domain admin account.</li>
          <li>Create a mailbox: Go to Recipients > Mailboxes, click the "+" icon, select "User mailbox," and link it to an existing AD user. Specify the mailbox alias (e.g., user@velocitylab.local).</li>
          <li>Repeat for all users: Create mailboxes for each domain user who needs email access.</li>
          <li>Test access: Configure Outlook on a client VM, log in with the user’s credentials, and confirm the mailbox is accessible. For more, see <a href="https://www.alitajran.com/create-user-mailbox-in-exchange-server/" target="_blank">ALITajran’s mailbox creation guide</a>.</li>
        </ul>
      `,
    },
    mail: {
      title: 'Setup Internal Mail Flow',
      description: `
        <p>Internal mail flow ensures users can send emails within the domain.</p>
        <ul class="subtask-list">
          <li>Configure Accepted Domains: In EAC, go to Mail Flow > Accepted Domains, and ensure "velocitylab.local" is listed as Authoritative.</li>
          <li>Verify Send Connectors: Exchange 2019 automatically creates a default Send Connector for internal mail. Confirm it exists under Mail Flow > Send Connectors.</li>
          <li>Test mail flow: Use Outlook to send an email from one user (e.g., user1@velocitylab.local) to another (e.g., user2@velocitylab.local). Verify receipt.</li>
          <li>Troubleshoot if needed: Check the message tracking logs in EAC (Mail Flow > Message Tracking) or use PowerShell: <code>Get-MessageTrackingLog</code>. See <a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/mail-routing?view=exchserver-2019" target="_blank">Microsoft Learn on mail flow</a>.</li>
        </ul>
      `,
    },
  },
  week4: {
    external: {
      title: 'Publish Mail Externally',
      description: `
        <p>Publishing mail externally allows users to send and receive emails outside the domain.</p>
        <ul class="subtask-list">
          <li>Configure DNS records: In your DNS provider, set up an MX record (e.g., mail.velocitylab.local), an SPF record (e.g., v=spf1 ip4:192.168.1.100 -all), and DKIM/DMARC for security. Use a public IP for your Exchange server.</li>
          <li>Update firewall: On your router/firewall, forward port 25 (SMTP) to the Exchange server’s internal IP. Enable port 443 if using Outlook on the web.</li>
          <li>Configure Receive Connector: In EAC, go to Mail Flow > Receive Connectors, create a new connector for "Internet" (type: Frontend Transport), and allow anonymous users for external mail.</li>
          <li>Test external mail: Send an email to an external address (e.g., Gmail) and reply back to confirm two-way mail flow. For detailed steps, see <a href="https://www.alitajran.com/configure-exchange-server-to-send-and-receive-outside-mails/" target="_blank">ALITajran’s external mail guide</a>.</li>
        </ul>
      `,
    },
    hybrid: {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <p>A hybrid environment integrates on-premises Exchange with Microsoft 365 for seamless mail flow and user management.</p>
        <ul class="subtask-list">
          <li>Prepare Microsoft 365: Ensure you have a Microsoft 365 subscription with Exchange Online. Add your domain (velocitylab.local) in the Microsoft 365 admin center and verify ownership.</li>
          <li>Install Azure AD Connect: On a domain-joined server, install Azure AD Connect to sync AD users to Microsoft 365. Configure it to sync passwords and enable hybrid deployment.</li>
          <li>Run Hybrid Configuration Wizard: In EAC, go to Hybrid, click "Configure," and sign in to Microsoft 365. Follow the wizard to set up connectors for mail flow and autodiscover.</li>
          <li>Test hybrid setup: Move a test mailbox to Exchange Online via EAC (Recipients > Migration) and verify access via Outlook. For best practices, see <a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment-prerequisites?view=exchserver-2019" target="_blank">Microsoft Learn’s hybrid deployment guide</a>.</li>
        </ul>
      `,
    },
    hosting: {
      title: 'Choose Hosting Environment',
      description: `
        <p>Selecting a hosting environment balances scalability, cost, and control for your infrastructure.</p>
        <ul class="subtask-list">
          <li>Evaluate Azure: Azure offers scalability, managed services, and integration with Microsoft 365. Consider costs (e.g., VM pricing) and compliance needs. See <a href="https://techcommunity.microsoft.com/t5/azure-infrastructure/choosing-between-azure-and-on-premises-for-your-infrastructure/ba-p/3266410" target="_blank">TechCommunity’s comparison</a>.</li>
          <li>Evaluate on-premises: On-premises gives full control but requires hardware maintenance and higher upfront costs. Ensure redundancy with UPS and backups.</li>
          <li>Document your choice: Write a pros/cons list. For Azure, consider services like Azure Virtual Machines and Azure AD; for on-premises, focus on hardware reliability.</li>
          <li>Implement: If choosing Azure, deploy a VM via the Azure portal, migrate services, and configure networking. If on-premises, ensure proper cooling and power for servers. Refer to <a href="https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-deployment-options" target="_blank">Microsoft Learn on hybrid deployments</a>.</li>
        </ul>
      `,
    },
  },
};

// Run initialization
document.addEventListener('DOMContentLoaded', init);