// CSRF Token Fetch
async function fetchToken() {
  const response = await fetch('/api/auth/csrf', { method: 'GET' });
  const data = await response.json();
  document.getElementById('csrf_token').value = data.token;
}

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  fetchToken();
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(registerForm);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      messageDiv.className = 'message';
      if (response.ok) {
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Registration successful! Redirecting to login...';
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      } else {
        messageDiv.classList.add('error');
        messageDiv.textContent = await response.text();
      }
    } catch (error) {
      messageDiv.classList.add('error');
      messageDiv.textContent = 'Server error occurred';
    }
  });
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  fetchToken();
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    const formData = new FormData(loginForm);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: formData,
      });

      messageDiv.className = 'message';
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('username', data.name);
        messageDiv.classList.add('success');
        messageDiv.textContent = 'Login successful! Redirecting to dashboard...';
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 2000);
      } else {
        messageDiv.classList.add('error');
        messageDiv.textContent = await response.text();
      }
    } catch (error) {
      messageDiv.classList.add('error');
      messageDiv.textContent = 'Server error occurred';
    }
  });
}

// Dashboard
if (window.location.pathname.includes('dashboard.html')) {
  const username = localStorage.getItem('username');
  const userInfo = document.querySelector('.user-info');
  if (username && userInfo) {
    userInfo.textContent = `Welcome, ${username}`;
  }

  const logout = document.querySelector('.logout');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      document.cookie = 'session=; Max-Age=0; Path=/;';
      localStorage.removeItem('username');
      window.location.href = '/';
    });
  }

  // Progress Tracking
  async function loadProgress() {
    const response = await fetch('/api/progress', { method: 'GET' });
    if (response.ok) {
      const progress = await response.json();
      Object.keys(progress).forEach(week => {
        Object.keys(progress[week]).forEach(task => {
          const taskElement = document.querySelector(`.task-${task}`);
          if (taskElement) {
            taskElement.checked = progress[week][task];
            taskElement.parentElement.classList.toggle('completed', progress[week][task]);
          }
        });
      });
    }
  }

  async function updateProgress(taskId, checked) {
    const week = taskId.split('-')[0];
    const task = taskId.split('-')[1];
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week, task, checked }),
    });
  }

  document.querySelectorAll('.task input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const taskId = checkbox.id;
      const checked = checkbox.checked;
      checkbox.parentElement.classList.toggle('completed', checked);
      updateProgress(taskId, checked);
    });
  });

  loadProgress();

  // Timeline Animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.week').forEach(week => observer.observe(week));

  // Modal
  const modal = document.getElementById('taskModal');
  const modalTitle = document.getElementById('modal-title');
  const modalDescription = document.getElementById('modal-description');
  const closeModal = document.getElementById('closeModal');

  const taskDetails = {
    dc: {
      title: 'Promote Server 2012 to Domain Controller',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Promoting a Windows Server 2012 to a Domain Controller (DC) establishes Active Directory (AD) and DNS services for centralized management.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Windows Server 2012 with updates.</li>
            <li>Static IP address.</li>
            <li>Administrator credentials.</li>
            <li>Network connectivity.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Log in as administrator. Open Server Manager.</li>
            <li>Click "Add roles and features." Install "Active Directory Domain Services."</li>
            <li>Post-installation, promote the server to a DC via the notification flag.</li>
            <li>Create a new forest (e.g., corp.example.com). Set functional levels to 2012.</li>
            <li>Configure DNS and DSRM password. Reboot after completion.</li>
            <li>Verify AD and DNS using AD Users and Computers and DNS Manager.</li>
            <li>Optional: Use PowerShell: <code>Install-WindowsFeature AD-Domain-Services -IncludeManagementTools</code>, then <code>Install-ADDSForest -DomainName corp.example.com</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Verify static IP: <code>ipconfig /all</code>.</li>
            <li>Run <code>dcdiag</code> for AD diagnostics. Check Event Viewer for errors.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds-deploy/install-active-directory-domain-services--ad-ds--in-windows-server">Microsoft Learn: Install AD DS</a></li>
            <li><a href="https://www.alitajran.com/install-and-configure-active-directory-domain-services/">ALI TAJRAN: Configure AD DS</a></li>
          </ul>
        </section>
      `
    },
    vm: {
      title: 'Join VM to Domain',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Joining a VM to the domain enables centralized management and authentication via Active Directory.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>VM with Windows Server or Windows 10/11.</li>
            <li>Operational DC with DNS.</li>
            <li>Domain admin credentials.</li>
            <li>DNS settings pointing to DC.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Open System Properties (Right-click Start > System).</li>
            <li>Click "Change" under Computer Name. Select "Domain" and enter corp.example.com.</li>
            <li>Provide domain admin credentials. Reboot.</li>
            <li>Verify in AD Users and Computers under Computers.</li>
            <li>Optional: Use PowerShell: <code>Add-Computer -DomainName corp.example.com -Credential (Get-Credential)</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <li>Check DNS settings: <code>ipconfig /all</code>.</li>
            <li>Test resolution: <code>nslookup corp.example.com</code>. Review Event Viewer.</li>
          </li>
        </ul>
        <section>
          <h3>References</h3>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/join-a-computer-to-a-domain">Microsoft Learn: Join a Domain</a></li>
            <li><a href="https://www.alitajran.com/join-computer-to-domain/">ALI TAJRAN: Join Computer to Domain</a></li>
          </ul>
        </section>
      `
    },
    share: {
      title: 'Configure Network Share on DC',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Create network shares for centralized file storage, mapped automatically on logon using three methods (GPO, PowerShell, logon script) with hidden shares ($).</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>DC with sufficient disk space.</li>
            <li>Domain admin credentials.</li>
            <li>Group Policy Management installed.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Create folders: C:\\Shares\\HR$, C:\\Shares\\PWD$, C:\\Shares\\Public.</li>
            <li>Share folders via Properties > Sharing. Add "Authenticated Users" with Read/Write.</li>
            <li>Set NTFS permissions via Security tab for hidden shares (e.g., HR_Access group).</li>
            <li>Create GPO "Drive Mapping" in Group Policy Management.</li>
            <li>Map drives under User Configuration > Preferences > Drive Maps (e.g., H: to \\[DCName]\\HR$).</li>
            <li>Create PowerShell script (map_drives.ps1):
              <pre><code>
net use H: \\[DCName]\\HR$
              h3>net use P: \\[DCName]\\PWD$
              li>net use S: \\[DCName]\\Public
              </code></pre>
            </li>
            <li>Create logon script (map_public.bat): <code>net use S: \\[DCName]\\Public</code>.</li>
            <li>Link scripts to GPO under User Configuration > Scripts > Logon.</li>
            <li>Test drive mapping with a domain user.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Run <code>gpupdate /force</code> if drives don’t map.</li>
            <li>Verify GPO application: <code>gpresult /r</code>. Check share permissions.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/storage/file-server/share-and-ntfs-permissions">Microsoft Learn: File Shares</a></li>
            <li><a href="https://www.alitajran.com/map-network-drive-with-group-policy/">ALI T</a></li>
          </ul>
        </section>
      `
    },
    group: {
      title: 'Create Security Group',
      description: `
        <div>
          <section>
            <h3>Overview</h3>
            <p>Create a security group to restrict access to network shares, ensuring only authorized users can connect.</p>
          </section>
          <section>
            <h3>Prerequisites</h3>
            <ul>
              <li>Active Directory domain.</li>
              <li>Domain admin privileges.</li>
              <li>Network shares configured.</li>
            </ul>
          </section>
          <section>
            <h3>Step-by-Step Instructions</h3>
            <ol>
              <li>Open Active Directory Users and Computers.</li>
              <li>Create a group in an OU (e.g., "HR_Access," Security, Global).</li>
              <li>Add users to group via Members tab.</li>
              <li>Assign permissions to HR$ share via Properties > Security > Add HR_Access.</li>
              <li>Optional: Use PowerShell: <code>New-ADGroup -Name HR_Access -GroupCategory Security -GroupScope Global -Path "OU=Shares,DC=corp,DC=example,DC=com"</code>.</li>
              <li>Test access with a group member account.</li>
            </ol>
          </section>
          <section>
            <h3>Troubleshooting Tips</h3>
            <ul>
              <li>Verify group membership in AD Users and Computers.</li>
              <li>Check permissions: <code>Get-Acl \\[Server]\\HR$ | Format-List</code>.</li>
            </ul>
          </section>
          <section>
            <h3>References</h3>
            <ul>
              <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups">Microsoft Learn: Security Groups</a></li>
              <li><a href="https://www.alitajran.com/create-security-group-in-active-directory/">ALI TAJRAN: Create Security Group</a></li>
            </ul>
          </section>
        </div>
      `
    },
    server: {
      title: 'Install Second Server 2012',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Install a second Windows Server 2012 to enhance redundancy and distribute load.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Windows Server 2012 ISO.</li>
            <li>Server or VM (4GB RAM, 40GB disk).</li>
            <li>Network connectivity.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Boot with Windows Server 2012 ISO.</li>
            <li>Install "Standard Edition (GUI)."</li>
            <li>Configure static IP in Network Settings.</li>
            <li>Join to domain (see "Join VM to Domain").</li>
            <li>Install updates via Server Manager.</li>
            <li>Verify connectivity: <code>ping [DCName]</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Check ISO integrity if installation fails.</li>
            <li>Verify network settings: <code>ipconfig /all</code>.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/install-windows-server">Microsoft Learn: Install Windows Server</a></li>
            <li><a href="https://www.alitajran.com/install-windows-server-2012-r2/">ALI TAJRAN: Install Windows Server 2012</a></li>
          </ul>
        </section>
      `
    },
    wsus: {
      title: 'Setup WSUS',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Configure Windows Server Update Services (WSUS) to manage and distribute updates across the network.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Windows Server 2012.</li>
            <li>Internet connectivity.</li>
            <li>10GB+ disk space for updates.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>In Server Manager, add "Windows Server Update Services" role.</li>
            <li>Run WSUS Configuration Wizard.</li>
            <li>Store updates locally, select products (e.g., Windows, Office) and languages.</li>
            <li>Enable automatic synchronization daily.</li>
            <li>Approve updates in WSUS console under Updates > All Updates.</li>
            <li>Configure GPO: Set WSUS server in "Specify intranet Microsoft update service location."</li>
            <li>Test client update retrieval.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Verify GPO application: <code>gpresult /r</code>.</li>
            <li>Check WSUS connectivity: <code>netstat -an</code>. Review WSUS logs in Event Viewer.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/deploy-windows-server-update-services">Microsoft Learn: Deploy WSUS</a></li>
            <li><a href="https://www.alitajran.com/install-and-configure-wsus-on-windows-server/">ALI TAJRAN: Configure WSUS</a></li>
          </ul>
        </section>
      `
    },
    time: {
      title: 'Configure Two Time Servers',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Configure two Network Time Protocol (NTP) servers to ensure accurate time synchronization across the domain.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Two servers with internet access.</li>
            <li>UDP port 123 open.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>On the DC, open PowerShell as administrator.</li>
            <li>Configure NTP: <code>w32tm /config /manualpeerlist:"0.pool.ntp.org,0x8 1.pool.ntp.org,0x8" /syncfromflags:manual /reliable:yes /update</code>.</li>
            <li>Restart time service: <code>net stop w32time && net start w32time</code>.</li>
            <li>On the second server, set DC as time source: <code>w32tm /config /manualpeerlist:[DCName] /syncfromflags:manual /update</code>.</li>
            <li>Verify status: <code>w32tm /query /status</code>.</li>
            <li>Open firewall: <code>New-NetFirewallRule -DisplayName "NTP" -Direction Inbound -Protocol UDP -LocalPort 123 -Action Allow</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Check NTP connectivity: <code>w32tm /stripchart /computer:0.pool.ntp.org</code>.</li>
            <li>Verify firewall rules: <code>Get-NetFirewallRule -DisplayName "NTP"</code>.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-tools-and-settings">Microsoft Learn: Windows Time Service</a></li>
            <li><a href="https://www.alitajran.com/configure-time-sync-windows-server/">ALI TAJRAN: Configure Time Sync</a></li>
          </ul>
        </section>
      `
    },
    upgrade: {
      title: 'Upgrade Servers to 2016',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Upgrade both Windows Server 2012 instances to Windows Server 2016 for improved features and security.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Windows Server 2016 ISO.</li>
            <li>Full backup of servers.</li>
            <li>8GB RAM, 40GB disk space.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Back up all data and AD configuration.</li>
            <li>Run setup.exe from Server 2016 ISO. Select "Upgrade."</li>
            <li>Choose the same edition (e.g., Standard).</li>
            <li>Complete upgrade and reboot.</li>
            <li>Verify AD roles in Server Manager.</li>
            <li>Install latest updates.</li>
            <li>Check AD health: <code>dcdiag</code>, <code>repadmin /replsummary</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Ensure hardware compatibility with Server 2016.</li>
            <li>Review Event Viewer for upgrade errors.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/upgrade-windows-server">Microsoft Learn: Upgrade Windows Server</a></li>
            <li><a href="https://www.alitajran.com/upgrade-windows-server-2012-to-2016/">ALI TAJRAN: Upgrade to Server 2016</a></li>
          </ul>
        </section>
      `
    },
    exchange: {
      title: 'Install Exchange Server 2019',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Deploy Exchange Server 2019 on a third server to provide email services, supporting hybrid integration.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Windows Server 2019 (Standard or Datacenter).</li>
            <li>Exchange Server 2019 ISO.</li>
            <li>Domain and schema admin privileges.</li>
            <li>.NET Framework 4.8, Visual C++ Redistributable.</li>
            <li>16GB RAM, 30GB disk space.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Install Windows Server 2019, join domain.</li>
            <li>Prepare AD: <code>Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms_DiagnosticDataON</code>.</li>
            <li>Prepare domain: <code>Setup.exe /PrepareAD /OrganizationName:"[OrgName]" /IAcceptExchangeServerLicenseTerms_DiagnosticDataON</code>.</li>
            <li>Install prerequisites: .NET Framework, UCMA 4.0, etc.</li>
            <li>Run Exchange setup, select "Mailbox role."</li>
            <li>Configure via Exchange Admin Center (EAC): https://[Server]/ecp.</li>
            <li>Verify installation in EAC.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Ensure all prerequisites are installed.</li>
            <li>Check AD replication: <code>repadmin /replsummary</code>.</li>
            <li>Review setup logs: C:\\ExchangeSetupLogs.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/deployment-ref">Microsoft Learn: Exchange 2019 Deployment</a></li>
            <li><a href="https://www.alitajran.com/install-exchange-server-2019/">ALI TAJRAN: Install Exchange 2019</a></li>
            <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-2019-deployment-best-practices/ba-p/3928374">Tech Community: Exchange 2019 Best Practices</a></li>
          </ul>
        </section>
      `
    },
    mailbox: {
      title: 'Create User Mailboxes',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Create mailboxes in Exchange Server 2019 to enable email access for users.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Exchange Server 2019 operational.</li>
            <li>Active Directory user accounts.</li>
            <li>Access to Exchange Admin Center (EAC).</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Log in to EAC: https://[ExchangeServer]/ecp.</li>
            <li>Navigate to Recipients > Mailboxes > Add > User mailbox.</li>
            <li>Select or create an AD user, set email address (e.g., user@corp.example.com).</li>
            <li>Save and wait for mailbox creation.</li>
            <li>Optional: Use PowerShell: <code>New-Mailbox -Name "UserName" -UserPrincipalName user@corp.example.com -Password (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force)</code>.</li>
            <li>Test access via Outlook or Outlook Web App (OWA).</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Ensure user exists in AD Users and Computers.</li>
            <li>Verify Exchange services: <code>Get-Service MSExchange*</code>.</li>
            <li>Check mailbox status in EAC.</li>
          </ul>
		          <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/exchange/recipients/user-mailboxes/create-user-mailboxes">Microsoft Learn: Create Mailboxes</a></li>
            <li><a href="https://www.alitajran.com/create-user-mailbox-in-exchange/">ALI TAJRAN: Create Mailbox</a></li>
          </ul>
        </section>
      `
    },
    mail: {
      title: 'Setup Internal Mail Flow',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Configure Exchange Server 2019 to enable reliable internal email delivery between users.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Exchange Server 2019 with mailboxes.</li>
            <li>Internal DNS configured.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>In EAC, verify domain under Mail Flow > Accepted Domains (e.g., corp.example.com).</li>
            <li>Ensure send/receive connectors are configured (default for internal).</li>
            <li>Test email between two mailboxes using Outlook or OWA.</li>
            <li>Optional: Verify mail flow: <code>Test-Mailflow [ServerName]</code>.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Check mailbox status in EAC.</li>
            <li>Review message tracking: <code>Get-MessageTrackingLog -EventId DELIVER</code>.</li>
            <li>Ensure DNS resolves: <code>nslookup mail.corp.example.com</code>.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/mail-routing">Microsoft Learn: Mail Flow</a></li>
            <li><a href="https://www.alitajran.com/configure-mail-flow-in-exchange-server/">ALI TAJRAN: Configure Mail Flow</a></li>
          </ul>
        </section>
      `
    },
    external: {
      title: 'Publish Mail Externally',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Enable secure external email access by configuring DNS records, modern authentication, and TLS certificates.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Exchange Server 2019.</li>
            <li>Public domain with DNS access.</li>
            <li>Public IP address.</li>
            <li>TLS certificate (e.g., from Let’s Encrypt).</li>
            <li>Ports 25, 443 open.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Add MX record in DNS provider (e.g., mail.example.com, priority 10).</li>
            <li>Add SPF record: <code>v=spf1 ip4:[PublicIP] include:spf.protection.outlook.com -all</code>.</li>
            <li>Enable DKIM in EAC, add two CNAME records (e.g., selector1._domainkey).</li>
            <li>Add DMARC: <code>_dmarc.example.com TXT v=DMARC1; p=none; rua=mailto:dmarc@example.com;</code>.</li>
            <li>Install TLS certificate in EAC for SMTP and IIS services.</li>
            <li>Enable OAuth 2.0: <code>Set-OrganizationConfig -OAuth2ClientProfileEnabled $true</code>.</li>
            <li>Configure reverse DNS with ISP (PTR record).</li>
            <li>Test external email send/receive using an external account.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Verify DNS records using tools like MXToolbox.</li>
            <li>Check certificate status: <code>Test-ServiceHealth</code>.</li>
            <li>Review SMTP logs: C:\\Program Files\\Microsoft\\Exchange Server\\V15\\TransportRoles\\Logs.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/use-dns-to-configure-mail-flow">Microsoft Learn: DNS for Mail Flow</a></li>
            <li><a href="https://www.alitajran.com/configure-dkim-exchange-server-2019/">ALI TAJRAN: Configure DKIM for Exchange 2019</a></li>
            <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/securing-exchange-mail-flow/ba-p/3928375">Tech Community: Secure Mail Flow</a></li>
          </ul>
        </section>
      `
    },
    hybrid: {
      title: 'Setup Microsoft 365 Hybrid Environment',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Integrate on-premises Exchange Server 2019 with Microsoft 365 for a hybrid environment, enabling seamless mail flow and management.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Exchange Server 2019 with external mail configured.</li>
            <li>Microsoft 365 tenant with E3/E5 licenses.</li>
            <li>Verified domain in Microsoft 365.</li>
            <li>Windows Server for Entra ID Connect.</li>
            <li>Public TLS certificate.</li>
            <li>Ports 80, 443, 25 open.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Verify domain in Microsoft 365 admin center (add TXT record).</li>
            <li>Install Entra ID Connect on a server, enable Password Hash Synchronization and SSO.</li>
            <li>Confirm user synchronization in Microsoft 365 admin center.</li>
            <li>Run Hybrid Configuration Wizard (HCW) from EAC, select "Full Hybrid."</li>
            <li>Configure mail flow (bidirectional) and certificates in HCW.</li>
            <li>Test mail flow between on-premises and cloud mailboxes.</li>
            <li>Verify calendar sharing and free/busy in Outlook.</li>
            <li>Optional: Migrate a test mailbox to Microsoft 365 via EAC.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Check Entra ID Connect sync status in Synchronization Service Manager.</li>
            <li>Review HCW logs: C:\\ProgramData\\Microsoft\\Exchange Hybrid Configuration.</li>
            <li>Enable MRSProxy for free/busy: <code>Set-WebServicesVirtualDirectory -Identity "EWS (Default Web Site)" -MRSProxyEnabled $true</code>.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/exchange/exchange-hybrid">Microsoft Learn: Exchange Hybrid</a></li>
            <li><a href="https://www.alitajran.com/exchange-hybrid-configuration-wizard-2019/">ALI TAJRAN: Hybrid Configuration Wizard</a></li>
            <li><a href="https://techcommunity.microsoft.com/t5/exchange-hybrid-cloud/exchange-hybrid-deployment-best-practices/ba-p/3876930">Microsoft Tech Community: Exchange Hybrid Best Practices</a></li>
          </ul>
        </section>
      `
    },
    hosting: {
      title: 'Choose Hosting Environment',
      description: `
        <section>
          <h3>Overview</h3>
          <p>Evaluate Azure versus on-premises hosting for the hybrid environment, considering scalability, cost, and control.</p>
        </section>
        <section>
          <h3>Prerequisites</h3>
          <ul>
            <li>Microsoft 365 hybrid environment configured.</li>
            <li>Azure account with portal access.</li>
            <li>Details of on-premises infrastructure.</li>
          </ul>
        </section>
        <section>
          <h3>Step-by-Step Instructions</h3>
          <ol>
            <li>Log in to Azure portal (portal.azure.com).</li>
            <li>Explore Azure services (e.g., Azure Virtual Machines, Azure Active Directory).</li>
            <li>Estimate costs using Azure Pricing Calculator.</li>
            <li>Document on-premises hardware (CPU, RAM, storage).</li>
            <li>Assess on-premises control, security, and compliance requirements.</li>
            <li>Compare Azure’s scalability and certifications with on-premises constraints.</li>
            <li>Document recommendation: Azure for scalability or on-premises for control.</li>
          </ol>
        </section>
        <section>
          <h3>Troubleshooting Tips</h3>
          <ul>
            <li>Use Azure Cost Management for cost insights.</li>
            <li>Review Azure compliance: <a href="https://azure.microsoft.com/en-us/explore/global-infrastructure/compliance">Azure Compliance</a>.</li>
          </ul>
        </section>
        <section>
          <h3>References</h3>
          <ul>
            <li><a href="https://learn.microsoft.com/en-us/azure/architecture/hybrid/hybrid-deployment-options">Microsoft Learn: Hybrid Options</a></li>
            <li><a href="https://techcommunity.microsoft.com/t5/azure/choosing-between-azure-and-on-premises/ba-p/1876930">Tech Community: Azure vs. On-Premises</a></li>
          </ul>
        </section>
      `
    }
  };

  // Add checkboxes to tasks for progress tracking
  document.querySelectorAll('.task').forEach(task => {
    const taskId = task.dataset.task;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `week${task.dataset.week}-${taskId}`;
    checkbox.className = `task-${taskId}`;
    task.prepend(checkbox);
  });

  // Modal handling
  document.querySelectorAll('.task-content').forEach(task => {
    task.addEventListener('click', () => {
      const taskId = task.parentElement.dataset.task;
      const details = taskDetails[taskId];
      if (details) {
        modalTitle.textContent = details.title;
        modalDescription.innerHTML = details.description;
        modal.style.display = 'flex';
        modal.focus();
      }
    });
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Keyboard accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });
}
       