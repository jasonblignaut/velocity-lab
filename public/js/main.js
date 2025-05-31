// Main.js for Velocity Lab
// Handles client-side logic for authentication, progress tracking, modals, profile, and admin dashboard

// Utility Functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Cookie management
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
};
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
};

// Show notification with message, type, and duration
const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = $('#notification');
  if (!notification) return;
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  setTimeout(() => {
    notification.classList.replace('show', 'hide');
    setTimeout(() => {
      notification.className = 'notification';
      notification.textContent = '';
    }, 300);
  }, duration);
};

// Fetch CSRF token from server
const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    $('#csrfToken').value = data.token;
    return data.token;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    showNotification('Failed to initialize form. Please try again.', 'error');
    return null;
  }
};

// Handle form submissions (login/register)
const handleFormSubmit = async (form, endpoint, isRegister = false) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector('.spinner');
  submitButton.disabled = true;
  spinner.classList.add('active');

  try {
    const formData = new FormData(form);
    if (isRegister && formData.get('password') !== formData.get('repeatPassword')) {
      showNotification('Passwords do not match.', 'error');
      return;
    }

    const token = await fetchCSRFToken();
    if (!token) return;
    formData.set('csrf_token', token);

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');

    showNotification(`Welcome, ${data.name}!`, 'success');
    setCookie('user', JSON.stringify({ name: data.name, role: data.role, email: formData.get('email') }), 1);
    setTimeout(() => (window.location.href = '/dashboard.html'), 1000);
  } catch (error) {
    console.error(`${endpoint} error:`, error);
    showNotification(error.message || 'An error occurred.', 'error');
  } finally {
    submitButton.disabled = false;
    spinner.classList.remove('active');
  }
};

// Toggle password visibility
const setupPasswordToggle = () => {
  $$('.toggle-password').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      button.querySelector('svg path').setAttribute(
        'd',
        isPassword
          ? 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z'
          : 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z'
      );
    });
  });
};

// Initialize login form
const initLoginForm = () => {
  const loginForm = $('#loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, '/api/login');
  });
};

// Initialize register form
const initRegisterForm = () => {
  const registerForm = $('#registerForm');
  if (!registerForm) return;
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(registerForm, '/api/register', true);
  });
};

// Fetch user progress
const fetchProgress = async () => {
  try {
    const response = await fetch('/api/progress', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch progress');
    return await response.json();
  } catch (error) {
    console.error('Progress fetch error:', error);
    showNotification('Failed to load progress.', 'error');
    return {};
  }
};

// Update progress bar
const updateProgressBar = () => {
  const tasks = $$('.task input[type="checkbox"]');
  const totalTasks = tasks.length;
  const completedTasks = Array.from(tasks).filter((task) => task.checked).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const progressBar = $('#progressBar');
  progressBar.style.setProperty('--progress', `${percentage}%`);
  progressBar.setAttribute('aria-valuenow', percentage);
  $('#progressText').textContent = `${percentage}% Completed`;
};

// Sync progress with server
const syncProgress = async (week, task, checked) => {
  try {
    const formData = new FormData();
    formData.append('week', week);
    formData.append('task', task);
    formData.append('checked', checked);
    const response = await fetch('/api/progress', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });
    if (!response.ok) throw new Error('Failed to update progress');
  } catch (error) {
    console.error('Progress sync error:', error);
    showNotification('Failed to save progress.', 'error');
  }
};

// Initialize dashboard
const initDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  userInfo.textContent = user.name; // Display only the name
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (response.ok) {
        deleteCookie('user');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
    }
  });

  const progress = await fetchProgress();
  $$('.task input[type="checkbox"]').forEach((checkbox) => {
    const week = checkbox.dataset.week;
    const task = checkbox.dataset.task;
    if (progress[week]?.[task]) {
      checkbox.checked = true;
    }
    // Prevent modal opening when clicking checkbox
    checkbox.addEventListener('click', (e) => e.stopPropagation());
    checkbox.addEventListener('change', () => {
      syncProgress(week, task, checkbox.checked);
      updateProgressBar();
    });
  });

  updateProgressBar();

  // Animate timeline
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  $$('.week').forEach((week) => observer.observe(week));
};

// Modal content for tasks with subtask checkboxes and references
const taskModalContent = {
  'week1-dc': {
    title: 'Promote Server 2012 to Domain Controller',
    description: `
      <p>Promote your Windows Server 2012 to a Domain Controller to set up Active Directory and DNS services. Note: While Server 2012 is out of support as of October 2023, this lab uses it for educational purposes. For production, consider Server 2022.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week1" data-task="dc">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Install Active Directory Domain Services role via Server Manager.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Promote the server to a Domain Controller (new forest, e.g., lab.local).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Configure DNS settings and verify replication using <code>repadmin /replsummary</code>.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/step-by-step-guide-to-install-active-directory-domain-services/ba-p/123456" target="_blank" rel="noopener">TechCommunity: Installing AD DS</a></li>
        <li><a href="https://www.alitajran.com/verify-active-directory-replication/" target="_blank" rel="noopener">Ali Tajran: Verify AD Replication</a></li>
      </ul>
    `,
  },
  'week1-vm': {
    title: 'Join VM to Domain',
    description: `
      <p>Join a virtual machine to the domain for centralized management. Ensure network connectivity and DNS settings are correct.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week1" data-task="vm">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Ensure the VM has network access to the Domain Controller.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Set the DNS server to the DC’s IP address (e.g., 192.168.1.10).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Join the domain via System Properties (Computer Name) or use PowerShell: <code>Add-Computer -DomainName lab.local</code>.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/how-to-join-a-windows-client-to-a-domain/ba-p/789101" target="_blank" rel="noopener">TechCommunity: Join Windows Client to Domain</a></li>
        <li><a href="https://www.alitajran.com/join-computer-to-domain-with-powershell/" target="_blank" rel="noopener">Ali Tajran: Join Computer to Domain with PowerShell</a></li>
      </ul>
    `,
  },
  'week1-share': {
    title: 'Configure Network Share on DC',
    description: `
      <p>Create a centralized file storage with secure access on the Domain Controller. Use hidden shares and multiple mapping methods.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week1" data-task="share">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Create a hidden shared folder (e.g., \\\\DC\\Share$) using File Explorer or PowerShell: <code>New-SmbShare -Name "Share$" -Path "C:\\Shares\\Share" -Hidden</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Set NTFS and share permissions for the security group using <code>icacls</code> or File Explorer.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Map three drives using different methods:
          <ul>
            <li>GPO: Create a GPO to map drive (e.g., \\\\DC\\Share$ to Z:).</li>
            <li>PowerShell: Use <code>New-PSDrive -Name Z -PSProvider FileSystem -Root "\\\\DC\\Share$"</code>.</li>
            <li>Logon Script: Create a .bat file with <code>net use Z: \\\\DC\\Share$</code>.</li>
          </ul>
        </li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/creating-and-managing-file-shares-in-windows-server/ba-p/456789" target="_blank" rel="noopener">TechCommunity: Creating File Shares</a></li>
        <li><a href="https://www.alitajran.com/map-network-drive-with-group-policy/" target="_blank" rel="noopener">Ali Tajran: Map Network Drive with GPO</a></li>
      </ul>
    `,
  },
  'week1-group': {
    title: 'Create Security Group',
    description: `
      <p>Restrict network share access to authorized users via a security group.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week1" data-task="group">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Open Active Directory Users and Computers (ADUC).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Create a new security group (e.g., ShareAccess) using ADUC or PowerShell: <code>New-ADGroup -Name "ShareAccess" -GroupScope Global -GroupCategory Security</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Add users to the group and assign permissions to the share using <code>icacls</code> or File Explorer.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/managing-security-groups-in-active-directory/ba-p/234567" target="_blank" rel="noopener">TechCommunity: Managing Security Groups</a></li>
        <li><a href="https://www.alitajran.com/create-security-group-in-active-directory/" target="_blank" rel="noopener">Ali Tajran: Create Security Group in AD</a></li>
      </ul>
    `,
  },
  'week2-server': {
    title: 'Install Second Server 2012',
    description: `
      <p>Add a second Windows Server 2012 for redundancy. Note: Server 2012 is out of support; consider Server 2022 for production.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week2" data-task="server">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Install Server 2012 on a new VM or hardware using ISO or installation media.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Join it to the domain using System Properties or PowerShell: <code>Add-Computer -DomainName lab.local</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Configure roles as needed (e.g., secondary DC) using Server Manager.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/installing-windows-server-2012-as-a-secondary-dc/ba-p/345678" target="_blank" rel="noopener">TechCommunity: Installing Server 2012 as Secondary DC</a></li>
      </ul>
    `,
  },
  'week2-wsus': {
    title: 'Setup WSUS',
    description: `
      <p>Manage updates with Windows Server Update Services (WSUS) on Server 2012.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week2" data-task="wsus">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Install WSUS role on a server via Server Manager.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Configure update sources and client policies via GPO (e.g., specify WSUS server URL: http://wsus.lab.local:8530).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Approve and test updates in the WSUS console.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/deploying-wsus-in-windows-server/ba-p/567890" target="_blank" rel="noopener">TechCommunity: Deploying WSUS</a></li>
        <li><a href="https://www.alitajran.com/install-and-configure-wsus-on-windows-server/" target="_blank" rel="noopener">Ali Tajran: Install and Configure WSUS</a></li>
      </ul>
    `,
  },
  'week2-time': {
    title: 'Configure Two Time Servers',
    description: `
      <p>Ensure time synchronization across the domain using NTP servers.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week2" data-task="time">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Configure the primary DC as the PDC Emulator to sync with an external NTP server (e.g., time.windows.com) using: <code>w32tm /config /manualpeerlist:time.windows.com /syncfromflags:manual /reliable:yes /update</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Set a secondary server as a backup time source using: <code>w32tm /config /manualpeerlist:pool.ntp.org /syncfromflags:manual /update</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Verify time sync with <code>w32tm /query /status</code> on both servers.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/configuring-time-synchronization-in-a-windows-domain/ba-p/678901" target="_blank" rel="noopener">TechCommunity: Configuring Time Sync</a></li>
        <li><a href="https://www.alitajran.com/configure-time-sync-windows-server/" target="_blank" rel="noopener">Ali Tajran: Configure Time Sync</a></li>
      </ul>
    `,
  },
  'week3-upgrade': {
    title: 'Upgrade Servers to 2016',
    description: `
      <p>Modernize infrastructure by upgrading to Server 2016. Note: Server 2016 mainstream support ended in 2022, but extended support lasts until 2027.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week3" data-task="upgrade">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Back up existing servers using Windows Server Backup or a third-party tool.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Perform an in-place upgrade to Server 2016 using the ISO or migrate to new Server 2016 VMs.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Verify AD and DNS functionality post-upgrade using <code>repadmin /replsummary</code> and <code>nltest /dsgetdc:lab.local</code>.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/itops-talk-blog/upgrading-windows-server-2012-to-2016/ba-p/789012" target="_blank" rel="noopener">TechCommunity: Upgrading to Server 2016</a></li>
      </ul>
    `,
  },
  'week3-exchange': {
    title: 'Install Exchange Server 2019',
    description: `
      <p>Deploy email services on a third server with Exchange Server 2019. Note: Exchange 2019 is still supported in 2025 (mainstream support until 2029).</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week3" data-task="exchange">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Install Exchange Server 2019 prerequisites (e.g., .NET Framework 4.8, UCMA 4.0).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Run the Exchange setup and configure mailbox roles using the Exchange Admin Center (EAC).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Test connectivity and services (e.g., OWA, ActiveSync) at https://mail.lab.local/owa.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/installing-exchange-server-2019-step-by-step/ba-p/890123" target="_blank" rel="noopener">TechCommunity: Installing Exchange 2019</a></li>
        <li><a href="https://www.alitajran.com/install-exchange-server-2019/" target="_blank" rel="noopener">Ali Tajran: Install Exchange 2019</a></li>
      </ul>
    `,
  },
  'week3-mailbox': {
    title: 'Create User Mailboxes',
    description: `
      <p>Set up email accounts for users in Exchange Server 2019.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week3" data-task="mailbox">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Open Exchange Admin Center (EAC) at https://mail.lab.local/ecp.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Create mailboxes for domain users or use PowerShell: <code>New-Mailbox -Name "User1" -UserPrincipalName user1@lab.local</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Test email sending/receiving using Outlook or OWA.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/creating-user-mailboxes-in-exchange-server/ba-p/901234" target="_blank" rel="noopener">TechCommunity: Creating Mailboxes</a></li>
        <li><a href="https://www.alitajran.com/create-user-mailbox-in-exchange-server/" target="_blank" rel="noopener">Ali Tajran: Create User Mailbox</a></li>
      </ul>
    `,
  },
  'week3-mail': {
    title: 'Setup Internal Mail Flow',
    description: `
      <p>Enable email delivery between users in Exchange Server 2019.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week3" data-task="mail">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Configure accepted domains (e.g., lab.local) in EAC or PowerShell: <code>New-AcceptedDomain -Name "lab.local" -DomainType Authoritative</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Set up send/receive connectors in EAC or PowerShell: <code>New-SendConnector -Name "Internal" -AddressSpaces "lab.local"</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Test internal mail flow using Outlook or OWA between users.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/configuring-mail-flow-in-exchange-server/ba-p/912345" target="_blank" rel="noopener">TechCommunity: Configuring Mail Flow</a></li>
        <li><a href="https://www.alitajran.com/configure-mail-flow-exchange-server/" target="_blank" rel="noopener">Ali Tajran: Configure Mail Flow</a></li>
      </ul>
    `,
  },
  'week4-external': {
    title: 'Publish Mail Externally',
    description: `
      <p>Enable secure external email access for Exchange Server 2019.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week4" data-task="external">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Configure DNS records (MX, SPF, DKIM, DMARC) with your DNS provider (e.g., Cloudflare). Example SPF: <code>v=spf1 ip4:192.168.1.10 -all</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Enable modern authentication (OAuth 2.0) in Exchange using: <code>Set-OrganizationConfig -OAuth2ClientProfileEnabled $true</code>.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Install TLS certificates (e.g., from Let’s Encrypt) and set up reverse DNS with your ISP.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/publishing-exchange-server-externally/ba-p/923456" target="_blank" rel="noopener">TechCommunity: Publishing Exchange Externally</a></li>
        <li><a href="https://www.alitajran.com/configure-spf-dkim-dmarc-exchange-server/" target="_blank" rel="noopener">Ali Tajran: Configure SPF, DKIM, DMARC</a></li>
      </ul>
    `,
  },
  'week4-hybrid': {
    title: 'Setup Microsoft 365 Hybrid Environment',
    description: `
      <p>Integrate on-premises Exchange with Microsoft 365. Ensure external mail publishing is complete first.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week4" data-task="hybrid">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Install and configure Entra ID Connect to sync on-premises AD with Microsoft 365.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Run the Hybrid Configuration Wizard (HCW) from the Exchange Admin Center.</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Verify mail flow and calendar sharing between on-premises and Microsoft 365 users.</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-hybrid-deployment-with-microsoft-365/ba-p/934567" target="_blank" rel="noopener">TechCommunity: Exchange Hybrid Deployment</a></li>
        <li><a href="https://www.alitajran.com/exchange-hybrid-configuration-wizard/" target="_blank" rel="noopener">Ali Tajran: Exchange Hybrid Configuration Wizard</a></li>
      </ul>
    `,
  },
  'week4-hosting': {
    title: 'Choose Hosting Environment',
    description: `
      <p>Select Azure or on-premises for deployment. Azure offers scalability, while on-premises provides control.</p>
      <h3>Steps</h3>
      <ol class="subtask-list" data-week="week4" data-task="hosting">
        <li><input type="checkbox" class="subtask-checkbox" data-step="1"> Evaluate Azure vs. on-premises for your workload (e.g., cost, scalability, control).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="2"> Configure Azure resources (e.g., Azure VMs, ExpressRoute) or on-premises servers (e.g., Hyper-V).</li>
        <li><input type="checkbox" class="subtask-checkbox" data-step="3"> Test deployment and connectivity (e.g., RDP to Azure VMs or on-premises servers).</li>
      </ol>
      <p><strong>References:</strong></p>
      <ul>
        <li><a href="https://techcommunity.microsoft.com/t5/azure-migration/azure-vs-on-premises-hosting-decision-guide/ba-p/945678" target="_blank" rel="noopener">TechCommunity: Azure vs On-Premises Hosting</a></li>
      </ul>
    `,
  },
};

// Initialize modal with subtask functionality
const initModal = () => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const closeModal = $('#closeModal');

  if (!modal || !modalTitle || !modalDescription || !closeModal) return;

  $$('.task').forEach((task) => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;

      const week = task.closest('.week').dataset.week;
      const taskId = task.dataset.task;
      const key = `${week}-${taskId}`;
      const content = taskModalContent[key] || {
        title: 'Task Details',
        description: '<p>No details available.</p>',
      };
      modalTitle.textContent = content.title;
      modalDescription.innerHTML = content.description;
      modal.style.display = 'flex';
      modal.focus();

      const subtaskList = modalDescription.querySelector('.subtask-list');
      if (subtaskList) {
        const subWeek = subtaskList.dataset.week;
        const subTask = subtaskList.dataset.task;
        const progress = JSON.parse(localStorage.getItem(`subtasks-${subWeek}-${subTask}`) || '{}');

        $$('.subtask-checkbox', subtaskList).forEach((subCheckbox) => {
          const step = subCheckbox.dataset.step;
          subCheckbox.checked = !!progress[step];

          subCheckbox.addEventListener('change', () => {
            progress[step] = subCheckbox.checked;
            localStorage.setItem(`subtasks-${subWeek}-${subTask}`, JSON.stringify(progress));

            const allChecked = Array.from($$('.subtask-checkbox', subtaskList)).every((cb) => cb.checked);
            const mainCheckbox = $(`input[data-week="${subWeek}"][data-task="${subTask}"]`);
            mainCheckbox.checked = allChecked;
            syncProgress(subWeek, subTask, allChecked);
            updateProgressBar();
          });
        });
      }
    });

    task.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        task.click();
      }
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
};

// Initialize profile page
const initProfile = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  const avatarForm = $('#avatarForm');
  const avatarInput = $('#avatarInput');
  const uploadAvatarBtn = $('#uploadAvatarBtn');
  const avatarPreview = $('#avatarPreview');
  const profileName = $('#profileName');
  const profileEmail = $('#profileEmail');
  const passwordForm = $('#passwordForm');

  if (userInfo && logoutLink) {
    const user = JSON.parse(getCookie('user') || '{}');
    if (!user.name) {
      window.location.href = '/login.html';
      return;
    }

    userInfo.textContent = user.name;
    profileName.textContent = user.name;
    profileEmail.textContent = user.email;

    // Fetch avatar if exists
    try {
      const response = await fetch('/api/avatar', { credentials: 'same-origin' });
      if (response.ok) {
        const blob = await response.blob();
        avatarPreview.src = URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Avatar fetch error:', error);
    }

    logoutLink.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          credentials: 'same-origin',
        });
        if (response.ok) {
          deleteCookie('user');
          window.location.href = '/login.html';
        }
      } catch (error) {
        console.error('Logout error:', error);
        showNotification('Failed to logout.', 'error');
      }
    });
  }

  if (avatarForm && avatarInput && uploadAvatarBtn) {
    uploadAvatarBtn.addEventListener('click', () => avatarInput.click());
    avatarInput.addEventListener('change', async () => {
      const file = avatarInput.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showNotification('Please upload an image file.', 'error');
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showNotification('Image size must be less than 2MB.', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await fetch('/api/avatar', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error('Failed to upload avatar');
        avatarPreview.src = URL.createObjectURL(file);
        showNotification('Avatar uploaded successfully!', 'success');
      } catch (error) {
        console.error('Avatar upload error:', error);
        showNotification('Failed to upload avatar.', 'error');
      }
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitButton = passwordForm.querySelector('button[type="submit"]');
      const spinner = submitButton.querySelector('.spinner');
      submitButton.disabled = true;
      spinner.classList.add('active');

      try {
        const formData = new FormData(passwordForm);
        if (formData.get('newPassword') !== formData.get('confirmPassword')) {
          showNotification('New passwords do not match.', 'error');
          return;
        }

        const token = await fetchCSRFToken();
        if (!token) return;
        formData.set('csrf_token', token);

        const response = await fetch('/api/change-password', {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to change password');

        showNotification('Password changed successfully!', 'success');
        passwordForm.reset();
      } catch (error) {
        console.error('Password change error:', error);
        showNotification(error.message || 'Failed to change password.', 'error');
      } finally {
        submitButton.disabled = false;
        spinner.classList.remove('active');
      }
    });
  }
};

// Fetch all users' progress for admin dashboard
const fetchAllUsersProgress = async () => {
  try {
    const response = await fetch('/api/admin/users-progress', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch users progress');
    return await response.json();
  } catch (error) {
    console.error('Fetch users progress error:', error);
    showNotification('Failed to load users progress.', 'error');
    return [];
  }
};

// Initialize admin dashboard
const initAdminDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  const leaderboard = $('#leaderboard');

  if (!userInfo || !logoutLink || !leaderboard) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  if (user.role !== 'admin') {
    window.location.href = '/dashboard.html';
    return;
  }

  userInfo.textContent = user.name;
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (response.ok) {
        deleteCookie('user');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout.', 'error');
    }
  });

  const usersProgress = await fetchAllUsersProgress();
  usersProgress.sort((a, b) => b.progress - a.progress); // Sort by progress descending

  leaderboard.innerHTML = usersProgress.map((user, index) => `
    <div class="leaderboard-item">
      <div class="leaderboard-rank">${index + 1}</div>
      <div class="leaderboard-avatar">
        <img src="${user.avatar || '/images/default-avatar.png'}" alt="${user.name}'s Avatar">
      </div>
      <div class="leaderboard-details">
        <h4>${user.name}</h4>
        <p>${user.progress}% Completed</p>
        <div class="progress-bar leaderboard-progress" style="--progress: ${user.progress}%"></div>
      </div>
    </div>
  `).join('');
};

// Initialize app
const init = () => {
  setupPasswordToggle();
  initLoginForm();
  initRegisterForm();
  initDashboard();
  initModal();
  initProfile();
  initAdminDashboard();
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', init);