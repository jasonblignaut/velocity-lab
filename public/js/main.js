// Enhanced Main.js for Velocity Lab
// Comprehensive task system with detailed sub-steps and reference links

// Utility Functions with Performance Optimizations
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Enhanced Cookie Management
const setCookie = (name, value, days) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? parts.pop().split(';').shift() : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
};

// COMPREHENSIVE TASK DEFINITIONS WITH REFERENCE LINKS
const TASK_DEFINITIONS = {
  // WEEK 1: Foundation Setup (8 tasks)
  'week1-dc-install': {
    title: 'Install Active Directory Domain Services Role',
    description: `
      <p><strong>Install the foundational role for domain services on Windows Server 2012.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Server Manager Dashboard</li>
        <li>Click "Add roles and features"</li>
        <li>Select "Role-based or feature-based installation"</li>
        <li>Choose your server from the server pool</li>
        <li>Select "Active Directory Domain Services" role</li>
        <li>Add required features when prompted</li>
        <li>Complete the installation wizard</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank">📖 MS Learn: Install Active Directory Domain Services</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/installing-active-directory-domain-services-on-windows-server/m-p/572305" target="_blank">💡 Tech Community: AD DS Installation Guide</a></li>
        <li><a href="https://alitajran.com/install-active-directory-windows-server-2019/" target="_blank">🔧 Alitajran: Step-by-Step AD Installation</a></li>
      </ul>
    `
  },

  'week1-dc-promote': {
    title: 'Promote Server to Domain Controller',
    description: `
      <p><strong>Configure the server as the primary domain controller with DNS services.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Click the notification flag in Server Manager</li>
        <li>Select "Promote this server to a domain controller"</li>
        <li>Choose "Add a new forest" and specify domain name (e.g., lab.local)</li>
        <li>Set Forest and Domain functional levels to Windows Server 2012</li>
        <li>Ensure "Domain Name System (DNS) server" is checked</li>
        <li>Set Directory Services Restore Mode (DSRM) password</li>
        <li>Review DNS options and NetBIOS domain name</li>
        <li>Specify database, log files, and SYSVOL paths</li>
        <li>Complete the promotion and restart when prompted</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-new-windows-server-2016-active-directory-forest--level-200-" target="_blank">📖 MS Learn: Install New AD Forest</a></li>
        <li><a href="https://alitajran.com/promote-windows-server-2019-to-domain-controller/" target="_blank">🔧 Alitajran: Promote to Domain Controller</a></li>
      </ul>
    `
  },

  'week1-vm-dns': {
    title: 'Configure VM DNS Settings',
    description: `
      <p><strong>Point the virtual machine to use the domain controller as its DNS server.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Network and Sharing Center on the VM</li>
        <li>Click "Change adapter settings"</li>
        <li>Right-click network adapter and select "Properties"</li>
        <li>Select "Internet Protocol Version 4 (TCP/IPv4)" and click "Properties"</li>
        <li>Select "Use the following DNS server addresses"</li>
        <li>Enter the Domain Controller's IP address as Preferred DNS</li>
        <li>Click "OK" to save settings</li>
        <li>Test connectivity with <code>nslookup lab.local</code></li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-clients" target="_blank">📖 MS Learn: Configure DNS Clients</a></li>
        <li><a href="https://alitajran.com/configure-dns-client-windows/" target="_blank">🔧 Alitajran: Configure DNS Client</a></li>
      </ul>
    `
  },

  'week1-vm-join': {
    title: 'Join VM to Domain',
    description: `
      <p><strong>Add the virtual machine to the newly created domain for centralized management.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Right-click "This PC" and select "Properties"</li>
        <li>Click "Change settings" next to Computer name</li>
        <li>Click "Change..." button</li>
        <li>Select "Domain" and enter your domain name (e.g., lab.local)</li>
        <li>Provide domain administrator credentials when prompted</li>
        <li>Welcome message confirms successful domain join</li>
        <li>Restart the computer when prompted</li>
        <li>Log in with domain account to verify</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/join-a-computer-to-a-domain" target="_blank">📖 MS Learn: Join Computer to Domain</a></li>
        <li><a href="https://alitajran.com/join-windows-server-2019-to-domain/" target="_blank">🔧 Alitajran: Join Computer to Domain</a></li>
      </ul>
    `
  },

  'week1-share-create': {
    title: 'Create Hidden Network Share',
    description: `
      <p><strong>Create a centralized file share with security and automatic mapping capabilities.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Create folder "C:\\CompanyData" on Domain Controller</li>
        <li>Right-click folder and select "Properties"</li>
        <li>Go to "Sharing" tab and click "Advanced Sharing"</li>
        <li>Check "Share this folder"</li>
        <li>Change share name to "CompanyData$" ($ makes it hidden)</li>
        <li>Click "Permissions" and set appropriate access</li>
        <li>Go to "Security" tab and configure NTFS permissions</li>
        <li>Test access from another machine using \\\\servername\\CompanyData$</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-resource-manager/file-server-resource-manager-overview" target="_blank">📖 MS Learn: File Server Management</a></li>
        <li><a href="https://alitajran.com/create-shared-folder-windows-server/" target="_blank">🔧 Alitajran: Create Shared Folders</a></li>
      </ul>
    `
  },

  'week1-share-gpo': {
    title: 'Map Drive via Group Policy',
    description: `
      <p><strong>Configure automatic drive mapping through Group Policy for Method 1.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Group Policy Management Console (gpmc.msc)</li>
        <li>Create new GPO named "Drive Mapping Policy"</li>
        <li>Right-click and "Edit" the GPO</li>
        <li>Navigate to User Configuration > Preferences > Windows Settings > Drive Maps</li>
        <li>Right-click and select "New > Mapped Drive"</li>
        <li>Set Action to "Create", Location to \\\\servername\\CompanyData$</li>
        <li>Set Drive Letter to "H:" and configure options</li>
        <li>Link GPO to appropriate OU and test</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn581922(v=ws.11)" target="_blank">📖 MS Learn: Group Policy Preferences</a></li>
        <li><a href="https://alitajran.com/map-network-drives-with-group-policy/" target="_blank">🔧 Alitajran: Map Drives with GPO</a></li>
      </ul>
    `
  },

  'week1-share-script': {
    title: 'Map Drive via Logon Script',
    description: `
      <p><strong>Create PowerShell logon script for automatic drive mapping - Method 2.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Create PowerShell script file "MapDrives.ps1" in SYSVOL</li>
        <li>Add command: <code>New-PSDrive -Name "S" -PSProvider FileSystem -Root "\\\\servername\\CompanyData$" -Persist</code></li>
        <li>Set execution policy if needed</li>
        <li>Open Group Policy Management Console</li>
        <li>Navigate to User Configuration > Policies > Windows Settings > Scripts</li>
        <li>Double-click "Logon" and add PowerShell script</li>
        <li>Configure script parameters and test deployment</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/new-psdrive" target="_blank">📖 MS Learn: New-PSDrive Cmdlet</a></li>
        <li><a href="https://alitajran.com/powershell-logon-script-group-policy/" target="_blank">🔧 Alitajran: PowerShell Logon Scripts</a></li>
      </ul>
    `
  },

  'week1-group-create': {
    title: 'Create Security Group for Share Access',
    description: `
      <p><strong>Implement role-based access control using Active Directory security groups.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Active Directory Users and Computers (dsa.msc)</li>
        <li>Navigate to appropriate OU or create new OU "Groups"</li>
        <li>Right-click and select "New > Group"</li>
        <li>Name the group "CompanyData_Access"</li>
        <li>Set Group scope to "Global" and type to "Security"</li>
        <li>Add users to the group who need share access</li>
        <li>Modify share and NTFS permissions to grant access only to this group</li>
        <li>Test access with group member and non-member accounts</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups" target="_blank">📖 MS Learn: Security Groups Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/active-directory-security-groups-best-practices/m-p/1145319" target="_blank">💡 Tech Community: Security Groups Best Practices</a></li>
        <li><a href="https://alitajran.com/create-active-directory-security-groups/" target="_blank">🔧 Alitajran: Create Security Groups</a></li>
      </ul>
    `
  },

  // WEEK 2: Infrastructure Expansion (6 tasks)
  'week2-server-install': {
    title: 'Install Second Windows Server 2012',
    description: `
      <p><strong>Deploy a second server to provide redundancy and load distribution.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Create new virtual machine with adequate resources</li>
        <li>Install Windows Server 2012 using installation media</li>
        <li>Configure basic network settings with static IP</li>
        <li>Set DNS server to point to first domain controller</li>
        <li>Install latest updates and configure Windows Firewall</li>
        <li>Join the new server to the existing domain</li>
        <li>Verify successful domain join and network connectivity</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank">📖 MS Learn: Server Installation</a></li>
        <li><a href="https://alitajran.com/install-windows-server-2019/" target="_blank">🔧 Alitajran: Install Windows Server</a></li>
      </ul>
    `
  },

  'week2-server-promote': {
    title: 'Promote Second Server to Additional Domain Controller',
    description: `
      <p><strong>Add redundancy by creating a second domain controller in the environment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Install Active Directory Domain Services role on second server</li>
        <li>Run "Promote this server to a domain controller"</li>
        <li>Select "Add a domain controller to an existing domain"</li>
        <li>Provide domain administrator credentials</li>
        <li>Ensure DNS server and Global Catalog options are selected</li>
        <li>Set Directory Services Restore Mode password</li>
        <li>Complete promotion and verify replication</li>
        <li>Test failover scenarios between domain controllers</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-replica-windows-server-2016-domain-controller-in-an-existing-domain--level-200-" target="_blank">📖 MS Learn: Install Replica Domain Controller</a></li>
        <li><a href="https://alitajran.com/install-additional-domain-controller/" target="_blank">🔧 Alitajran: Additional Domain Controller</a></li>
      </ul>
    `
  },

  'week2-wsus-install': {
    title: 'Install WSUS Role',
    description: `
      <p><strong>Deploy Windows Server Update Services for centralized update management.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Server Manager and click "Add roles and features"</li>
        <li>Select "Windows Server Update Services" role</li>
        <li>Choose WID (Windows Internal Database) for database</li>
        <li>Specify content location (recommend separate drive)</li>
        <li>Complete installation and run Post-Deployment Configuration</li>
        <li>Connect to Microsoft Update and synchronize</li>
        <li>Configure update classifications and products</li>
        <li>Create computer groups for different update schedules</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/get-started/windows-server-update-services-wsus" target="_blank">📖 MS Learn: WSUS Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/windows-server-update-services-wsus-best-practices/m-p/1096945" target="_blank">💡 Tech Community: WSUS Best Practices</a></li>
        <li><a href="https://alitajran.com/install-wsus-windows-server/" target="_blank">🔧 Alitajran: Install WSUS</a></li>
      </ul>
    `
  },

  'week2-wsus-configure': {
    title: 'Configure WSUS Client Policies',
    description: `
      <p><strong>Set up Group Policy to direct clients to use WSUS for updates.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Group Policy Management Console</li>
        <li>Create new GPO named "WSUS Client Configuration"</li>
        <li>Navigate to Computer Configuration > Policies > Administrative Templates</li>
        <li>Go to Windows Components > Windows Update</li>
        <li>Configure "Specify intranet Microsoft update service location"</li>
        <li>Set both URLs to http://WSUSServerName:8530</li>
        <li>Configure automatic update settings and schedule</li>
        <li>Link GPO to appropriate OUs and test client connectivity</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates" target="_blank">📖 MS Learn: Configure WSUS Group Policy</a></li>
        <li><a href="https://alitajran.com/configure-wsus-group-policy/" target="_blank">🔧 Alitajran: WSUS Group Policy Settings</a></li>
      </ul>
    `
  },

  'week2-time-primary': {
    title: 'Configure Primary Time Server',
    description: `
      <p><strong>Set up the PDC Emulator as the authoritative time source for the domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Identify PDC Emulator role holder with: <code>netdom query fsmo</code></li>
        <li>On PDC Emulator, configure external time source:</li>
        <li>Run: <code>w32tm /config /manualpeerlist:"time.nist.gov,pool.ntp.org" /syncfromflags:manual</code></li>
        <li>Run: <code>w32tm /config /reliable:yes</code></li>
        <li>Restart Windows Time service: <code>net stop w32time && net start w32time</code></li>
        <li>Force immediate sync: <code>w32tm /resync /rediscover</code></li>
        <li>Verify configuration: <code>w32tm /query /status</code></li>
        <li>Check time source: <code>w32tm /query /source</code></li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-top" target="_blank">📖 MS Learn: Windows Time Service</a></li>
        <li><a href="https://alitajran.com/configure-ntp-on-windows-server/" target="_blank">🔧 Alitajran: Configure NTP Server</a></li>
      </ul>
    `
  },

  'week2-time-secondary': {
    title: 'Configure Secondary Time Server',
    description: `
      <p><strong>Set up the second domain controller as backup time source.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>On second domain controller, configure time sync with PDC:</li>
        <li>Run: <code>w32tm /config /syncfromflags:domhier</code></li>
        <li>Run: <code>w32tm /config /reliable:no</code></li>
        <li>Restart Windows Time service</li>
        <li>Force sync with domain hierarchy: <code>w32tm /resync</code></li>
        <li>Verify sync status: <code>w32tm /query /status</code></li>
        <li>Test time synchronization across all domain members</li>
        <li>Configure monitoring for time drift issues</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/config-authoritative-time-server" target="_blank">📖 MS Learn: Configure Authoritative Time Server</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/time-synchronization-in-active-directory/m-p/395402" target="_blank">💡 Tech Community: Time Sync in AD</a></li>
      </ul>
    `
  },

  // WEEK 3: Email & Messaging (8 tasks)
  'week3-upgrade-prep': {
    title: 'Prepare for Server 2016 Upgrade',
    description: `
      <p><strong>Prepare the environment for upgrading from Windows Server 2012 to 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Run Windows Server 2016 compatibility check</li>
        <li>Create full system backups of all servers</li>
        <li>Document current server configurations and roles</li>
        <li>Verify hardware compatibility with Server 2016</li>
        <li>Check application compatibility requirements</li>
        <li>Plan upgrade sequence (secondary DC first, then primary)</li>
        <li>Download Windows Server 2016 installation media</li>
        <li>Schedule maintenance window for upgrades</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/upgrade/upgrade-2012-to-2016" target="_blank">📖 MS Learn: Upgrade to Server 2016</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/upgrading-from-windows-server-2012-r2-to-windows-server-2016/m-p/393194" target="_blank">💡 Tech Community: Server 2016 Upgrade</a></li>
      </ul>
    `
  },

  'week3-upgrade-execute': {
    title: 'Execute Server 2016 Upgrade',
    description: `
      <p><strong>Perform in-place upgrade of domain controllers to Windows Server 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Start with secondary domain controller upgrade</li>
        <li>Run Windows Server 2016 setup from installation media</li>
        <li>Choose "Keep personal files and apps" option</li>
        <li>Follow upgrade wizard and wait for completion</li>
        <li>Verify all roles and features are functioning</li>
        <li>Test Active Directory replication between DCs</li>
        <li>Upgrade primary domain controller using same process</li>
        <li>Raise domain and forest functional levels to 2016</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/upgrade/upgrade-2012-to-2016" target="_blank">📖 MS Learn: In-Place Upgrade Process</a></li>
        <li><a href="https://alitajran.com/upgrade-windows-server-2012-to-2016/" target="_blank">🔧 Alitajran: Server Upgrade Guide</a></li>
      </ul>
    `
  },

  'week3-exchange-prep': {
    title: 'Prepare Exchange Server Installation',
    description: `
      <p><strong>Prepare the third server for Exchange Server 2019 deployment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Install Windows Server 2016 on third server with minimum 16GB RAM</li>
        <li>Join server to domain and install latest updates</li>
        <li>Install required Windows features and .NET Framework</li>
        <li>Install Visual C++ Redistributable packages</li>
        <li>Download Exchange Server 2019 installation files</li>
        <li>Extend Active Directory schema for Exchange</li>
        <li>Prepare Active Directory domain for Exchange</li>
        <li>Verify all prerequisites are met before installation</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites?view=exchserver-2019" target="_blank">📖 MS Learn: Exchange 2019 Prerequisites</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-2019-setup-amp-deployment-guide/ba-p/1128616" target="_blank">💡 Tech Community: Exchange 2019 Setup</a></li>
      </ul>
    `
  },

  'week3-exchange-install': {
    title: 'Install Exchange Server 2019',
    description: `
      <p><strong>Deploy Exchange Server 2019 with Mailbox role on the prepared server.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Run Exchange setup.exe as administrator</li>
        <li>Accept license agreement and choose update options</li>
        <li>Select "Mailbox role" for installation</li>
        <li>Specify installation path and organization name</li>
        <li>Configure malware protection settings</li>
        <li>Review readiness checks and resolve any issues</li>
        <li>Complete installation (may take 60+ minutes)</li>
        <li>Install latest Exchange cumulative update</li>
        <li>Verify Exchange services are running properly</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/install-exchange-mailbox-role?view=exchserver-2019" target="_blank">📖 MS Learn: Install Exchange Mailbox Role</a></li>
        <li><a href="https://alitajran.com/install-exchange-server-2019/" target="_blank">🔧 Alitajran: Install Exchange 2019</a></li>
      </ul>
    `
  },

  'week3-exchange-config': {
    title: 'Configure Exchange Post-Installation',
    description: `
      <p><strong>Complete initial Exchange configuration and security settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Access Exchange Admin Center (EAC) via https://servername/ecp</li>
        <li>Configure accepted domains for your organization</li>
        <li>Set up email address policies for automatic address generation</li>
        <li>Configure receive connectors for SMTP traffic</li>
        <li>Set up send connectors for outbound mail routing</li>
        <li>Configure transport rules and message hygiene</li>
        <li>Set up certificates for secure communication</li>
        <li>Test basic Exchange functionality and services</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/architecture/mailbox-servers/manage-mailbox-servers?view=exchserver-2019" target="_blank">📖 MS Learn: Manage Mailbox Servers</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-post-installation-tasks/ba-p/1098432" target="_blank">💡 Tech Community: Post-Installation Tasks</a></li>
      </ul>
    `
  },

  'week3-mailbox-create': {
    title: 'Create User Mailboxes',
    description: `
      <p><strong>Provision mailboxes for domain users and configure mailbox settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Open Exchange Admin Center (EAC)</li>
        <li>Navigate to Recipients > Mailboxes</li>
        <li>Click "+" to create new user mailbox</li>
        <li>Choose "User mailbox" and select existing domain user</li>
        <li>Configure mailbox database and alias settings</li>
        <li>Set mailbox quota and message size limits</li>
        <li>Enable mailbox features (ActiveSync, OWA, etc.)</li>
        <li>Create additional test mailboxes for different scenarios</li>
        <li>Verify mailboxes appear in Exchange Management Shell</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/recipients/create-user-mailboxes?view=exchserver-2019" target="_blank">📖 MS Learn: Create User Mailboxes</a></li>
        <li><a href="https://alitajran.com/create-mailbox-exchange-server/" target="_blank">🔧 Alitajran: Create Exchange Mailboxes</a></li>
      </ul>
    `
  },

  'week3-mailbox-test': {
    title: 'Test Mailbox Functionality',
    description: `
      <p><strong>Verify mailbox creation and basic email functionality.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Test mailbox access via Outlook Web Access (OWA)</li>
        <li>Configure Outlook profile for test user</li>
        <li>Send test emails between created mailboxes</li>
        <li>Verify mail delivery and folder synchronization</li>
        <li>Test calendar functionality and meeting requests</li>
        <li>Check global address list (GAL) visibility</li>
        <li>Verify distribution group creation and membership</li>
        <li>Test mailbox permissions and delegation</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/clients/outlook-on-the-web/outlook-on-the-web?view=exchserver-2019" target="_blank">📖 MS Learn: Outlook on the Web</a></li>
        <li><a href="https://alitajran.com/test-exchange-mail-flow/" target="_blank">🔧 Alitajran: Test Mail Flow</a></li>
      </ul>
    `
  },

  'week3-mail-internal': {
    title: 'Configure Internal Mail Flow',
    description: `
      <p><strong>Set up and verify internal mail routing and delivery within the organization.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Configure default receive connector for internal SMTP traffic</li>
        <li>Set up Hub Transport service for message routing</li>
        <li>Configure message routing within the Exchange organization</li>
        <li>Test mail flow between different mailboxes</li>
        <li>Set up message tracking and logging</li>
        <li>Configure mailbox delivery options and restrictions</li>
        <li>Test large attachment handling and size limits</li>
        <li>Verify mail flow using Exchange Management Shell cmdlets</li>
        <li>Use Test-Mailflow cmdlet to verify routing</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/connectors?view=exchserver-2019" target="_blank">📖 MS Learn: Mail Flow Connectors</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/troubleshooting-mail-flow-in-exchange-server/ba-p/1087449" target="_blank">💡 Tech Community: Troubleshoot Mail Flow</a></li>
        <li><a href="https://alitajran.com/exchange-mail-flow-troubleshooting/" target="_blank">🔧 Alitajran: Mail Flow Troubleshooting</a></li>
      </ul>
    `
  },

  // WEEK 4: Cloud Integration (8 tasks)
  'week4-external-dns': {
    title: 'Configure DNS Records for External Mail',
    description: `
      <p><strong>Set up essential DNS records for external email delivery and authentication.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Create MX record pointing to your Exchange server's public IP</li>
        <li>Set up A record for mail server (mail.yourdomain.com)</li>
        <li>Configure reverse DNS (PTR) record with your ISP</li>
        <li>Create SPF record: "v=spf1 ip4:your.public.ip -all"</li>
        <li>Generate DKIM key pair using Exchange or third-party tool</li>
        <li>Publish DKIM public key in DNS as TXT record</li>
        <li>Create DMARC policy record for email authentication</li>
        <li>Test DNS propagation and validate records</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/external-mail-flow?view=exchserver-2019" target="_blank">📖 MS Learn: External Mail Flow</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/email-authentication-spf-dkim-and-dmarc/ba-p/1072258" target="_blank">💡 Tech Community: Email Authentication</a></li>
        <li><a href="https://alitajran.com/configure-spf-dkim-dmarc-records/" target="_blank">🔧 Alitajran: Configure Email Authentication</a></li>
      </ul>
    `
  },

  'week4-external-firewall': {
    title: 'Configure Firewall and Network Security',
    description: `
      <p><strong>Set up network security and firewall rules for external email access.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Configure router/firewall to forward SMTP port 25 to Exchange server</li>
        <li>Set up port forwarding for SMTPS (587) and HTTPS (443)</li>
        <li>Configure IMAPS (993) and POP3S (995) if required</li>
        <li>Set up Windows Firewall rules on Exchange server</li>
        <li>Configure network load balancing if using multiple servers</li>
        <li>Set up VPN access for remote administration</li>
        <li>Implement intrusion detection and prevention</li>
        <li>Test external connectivity from outside network</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/network-ports?view=exchserver-2019" target="_blank">📖 MS Learn: Exchange Network Ports</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-network-security-best-practices/ba-p/1095832" target="_blank">💡 Tech Community: Network Security</a></li>
      </ul>
    `
  },

  'week4-external-certificates': {
    title: 'Install and Configure SSL Certificates',
    description: `
      <p><strong>Secure external communications with proper SSL/TLS certificates.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Generate Certificate Signing Request (CSR) from Exchange</li>
        <li>Purchase SSL certificate from trusted Certificate Authority</li>
        <li>Install certificate on Exchange server</li>
        <li>Assign certificate to SMTP, IIS, and other services</li>
        <li>Configure virtual directories to use HTTPS</li>
        <li>Test certificate validation and trust chain</li>
        <li>Set up automatic certificate renewal process</li>
        <li>Verify secure connections for all external services</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/architecture/client-access/certificates?view=exchserver-2019" target="_blank">📖 MS Learn: Exchange Certificates</a></li>
        <li><a href="https://alitajran.com/install-ssl-certificate-exchange-server/" target="_blank">🔧 Alitajran: Install SSL Certificates</a></li>
      </ul>
    `
  },

  'week4-external-auth': {
    title: 'Configure Modern Authentication',
    description: `
      <p><strong>Implement OAuth 2.0 and modern authentication protocols for enhanced security.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Enable modern authentication in Exchange Online</li>
        <li>Configure Azure AD application registration</li>
        <li>Set up OAuth authentication endpoints</li>
        <li>Configure Exchange virtual directories for modern auth</li>
        <li>Disable legacy authentication protocols where possible</li>
        <li>Test modern authentication with Outlook clients</li>
        <li>Configure conditional access policies</li>
        <li>Verify multi-factor authentication integration</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/enable-or-disable-modern-authentication-in-exchange-online" target="_blank">📖 MS Learn: Modern Authentication</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/modern-authentication-in-exchange-server/ba-p/1087774" target="_blank">💡 Tech Community: Modern Auth in Exchange</a></li>
      </ul>
    `
  },

  'week4-hybrid-prepare': {
    title: 'Prepare for Hybrid Configuration',
    description: `
      <p><strong>Set up prerequisites for Microsoft 365 hybrid deployment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Create Microsoft 365 tenant and verify domain ownership</li>
        <li>Purchase appropriate Exchange Online licenses</li>
        <li>Install and configure Azure AD Connect</li>
        <li>Synchronize on-premises users to Azure AD</li>
        <li>Verify directory synchronization is working</li>
        <li>Configure UPN suffixes to match verified domains</li>
        <li>Set up service accounts for hybrid configuration</li>
        <li>Download and install Hybrid Configuration Wizard</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment-prerequisites" target="_blank">📖 MS Learn: Hybrid Prerequisites</a></li>
        <li><a href="https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-roadmap" target="_blank">📖 MS Learn: Azure AD Connect</a></li>
        <li><a href="https://alitajran.com/install-azure-ad-connect/" target="_blank">🔧 Alitajran: Install Azure AD Connect</a></li>
      </ul>
    `
  },

  'week4-hybrid-wizard': {
    title: 'Run Hybrid Configuration Wizard',
    description: `
      <p><strong>Execute the Hybrid Configuration Wizard to establish trust and mail routing.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Launch Hybrid Configuration Wizard from Exchange server</li>
        <li>Sign in with Global Administrator credentials</li>
        <li>Select Exchange organization and Office 365 tenant</li>
        <li>Choose hybrid features to enable (Free/Busy, Mail Tips, etc.)</li>
        <li>Configure mail routing and transport settings</li>
        <li>Set up organization relationship and sharing policies</li>
        <li>Review and apply configuration changes</li>
        <li>Monitor wizard progress and resolve any errors</li>
        <li>Verify hybrid configuration completion</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/deploy-hybrid" target="_blank">📖 MS Learn: Deploy Hybrid</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-hybrid-deployment-step-by-step-guide/ba-p/1044294" target="_blank">💡 Tech Community: Hybrid Step-by-Step</a></li>
        <li><a href="https://alitajran.com/exchange-hybrid-configuration/" target="_blank">🔧 Alitajran: Hybrid Configuration</a></li>
      </ul>
    `
  },

  'week4-hybrid-mailflow': {
    title: 'Configure Hybrid Mail Flow',
    description: `
      <p><strong>Set up bidirectional mail flow between on-premises and Exchange Online.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Configure inbound connector in Exchange Online</li>
        <li>Set up outbound connector for on-premises routing</li>
        <li>Configure mail routing rules and policies</li>
        <li>Test mail flow from on-premises to cloud</li>
        <li>Test mail flow from cloud to on-premises</li>
        <li>Verify external mail routing through correct path</li>
        <li>Set up mail flow monitoring and alerts</li>
        <li>Configure centralized mail transport if required</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/mail-flow-best-practices" target="_blank">📖 MS Learn: Mail Flow Best Practices</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/troubleshooting-hybrid-mail-flow/ba-p/1098753" target="_blank">💡 Tech Community: Troubleshoot Hybrid Mail Flow</a></li>
      </ul>
    `
  },

  'week4-hybrid-verify': {
    title: 'Verify Hybrid Functionality',
    description: `
      <p><strong>Test and validate all hybrid features and functionality.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <ol>
        <li>Test cross-premises free/busy calendar sharing</li>
        <li>Verify mail tips between on-premises and cloud users</li>
        <li>Test cross-premises message tracking</li>
        <li>Validate secure mail transport between environments</li>
        <li>Test mailbox moves between on-premises and cloud</li>
        <li>Verify single sign-on functionality</li>
        <li>Test mobile device management across environments</li>
        <li>Document hybrid configuration and create maintenance procedures</li>
        <li>Train users on hybrid functionality and features</li>
      </ol>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment" target="_blank">📖 MS Learn: Hybrid Deployment Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-hybrid-free-busy-troubleshooting/ba-p/1087623" target="_blank">💡 Tech Community: Hybrid Free/Busy</a></li>
        <li><a href="https://alitajran.com/test-exchange-hybrid-configuration/" target="_blank">🔧 Alitajran: Test Hybrid Configuration</a></li>
      </ul>
    `
  }
};

// TOTAL TASK COUNT: 30 tasks (8 + 6 + 8 + 8 = 30)
const TOTAL_TASKS = 30;

// Enhanced Notification System with Rich Animations
let notificationQueue = [];
let isNotificationActive = false;

const showNotification = (message, type = 'info', duration = 5000) => {
  const notification = $('#notification');
  if (!notification) return;
  
  const notificationData = { message, type, duration };
  notificationQueue.push(notificationData);
  
  if (!isNotificationActive) {
    processNotificationQueue();
  }
};

const processNotificationQueue = async () => {
  const notification = $('#notification');
  if (!notification || notificationQueue.length === 0) {
    isNotificationActive = false;
    return;
  }
  
  isNotificationActive = true;
  const { message, type, duration } = notificationQueue.shift();
  
  // Enhanced notification with micro-animations
  notification.textContent = message;
  notification.className = `notification show ${type}`;
  
  // Sophisticated entrance animation
  notification.style.transform = 'translateY(-30px) scale(0.95)';
  notification.style.opacity = '0';
  
  // Use requestAnimationFrame for smooth animations
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      notification.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      notification.style.transform = 'translateY(0) scale(1)';
      notification.style.opacity = '1';
      resolve();
    });
  });
  
  // Auto-dismiss with elegant exit animation
  setTimeout(async () => {
    notification.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    notification.style.transform = 'translateY(-20px) scale(0.95)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
      notification.className = 'notification';
      notification.textContent = '';
      notification.style.transform = '';
      notification.style.opacity = '';
      notification.style.transition = '';
      processNotificationQueue(); // Process next notification
    }, 300);
  }, duration);
};

// Enhanced CSRF Token Management
const fetchCSRFToken = async () => {
  try {
    const response = await fetch('/api/csrf', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to fetch CSRF token');
    const data = await response.json();
    const csrfInput = $('#csrfToken');
    if (csrfInput) csrfInput.value = data.token;
    return data.token;
  } catch (error) {
    console.error('CSRF fetch error:', error);
    showNotification('Failed to initialize form. Please try again.', 'error');
    return null;
  }
};

// Advanced Form Submission with Rich Loading States
const handleFormSubmit = async (form, endpoint, isRegister = false) => {
  const submitButton = form.querySelector('button[type="submit"]');
  const spinner = submitButton.querySelector('.spinner');
  const buttonText = submitButton.querySelector('span') || submitButton;
  const originalText = buttonText.textContent;
  
  // Sophisticated loading state with micro-animations
  submitButton.disabled = true;
  submitButton.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  submitButton.style.transform = 'scale(0.98)';
  
  if (spinner) {
    spinner.classList.add('active');
    spinner.style.transform = 'scale(1.1)';
  }
  
  buttonText.textContent = isRegister ? 'Creating Account...' : 'Signing In...';
  
  // Add loading shimmer effect
  submitButton.style.background = 'linear-gradient(90deg, #007aff 25%, #5ac8fa 50%, #007aff 75%)';
  submitButton.style.backgroundSize = '200% 100%';
  submitButton.style.animation = 'shimmer 1.5s infinite';

  try {
    const formData = new FormData(form);
    
    // Enhanced client-side validation
    if (isRegister) {
      const password = formData.get('password');
      const repeatPassword = formData.get('repeatPassword');
      const email = formData.get('email');
      const name = formData.get('name');
      
      if (!name || name.length < 2) {
        throw new Error('Name must be at least 2 characters long');
      }
      
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      if (password !== repeatPassword) {
        throw new Error('Passwords do not match');
      }
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

    // Success animation with celebration
    submitButton.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
    submitButton.style.animation = 'none';
    buttonText.textContent = '✓ Success!';
    
    showNotification(`🎉 Welcome, ${data.name}!`, 'success', 3000);
    setCookie('user', JSON.stringify({ name: data.name, role: data.role }), 1);
    
    // Elegant page transition
    setTimeout(() => {
      document.body.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      document.body.style.opacity = '0';
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 500);
    }, 1500);
    
  } catch (error) {
    console.error(`${endpoint} error:`, error);
    
    // Error animation
    submitButton.style.background = 'linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)';
    submitButton.style.animation = 'shake 0.5s ease-in-out';
    buttonText.textContent = '✗ Error';
    
    showNotification(error.message || 'An error occurred.', 'error');
    
    // Reset button after error animation
    setTimeout(() => {
      resetButton();
    }, 2000);
  }
  
  function resetButton() {
    submitButton.disabled = false;
    submitButton.style.transform = '';
    submitButton.style.background = '';
    submitButton.style.animation = '';
    if (spinner) {
      spinner.classList.remove('active');
      spinner.style.transform = '';
    }
    buttonText.textContent = originalText;
  }
};

// Sophisticated Password Toggle with Smooth Animations
const setupPasswordToggle = () => {
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.previousElementSibling;
      const isPassword = input.type === 'password';
      const svgPath = button.querySelector('svg path');
      const svgCircle = button.querySelector('svg circle');
      
      // Smooth micro-animation
      button.style.transition = 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      button.style.transform = 'scale(0.9) rotate(180deg)';
      
      setTimeout(() => {
        input.type = isPassword ? 'text' : 'password';
        
        if (isPassword) {
          // Show eye with slash
          svgPath.setAttribute('d', 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24');
          if (svgCircle) svgCircle.style.display = 'none';
          
          // Add slash line
          const svg = button.querySelector('svg');
          if (!svg.querySelector('.slash-line')) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'slash-line');
            line.setAttribute('x1', '1');
            line.setAttribute('y1', '1');
            line.setAttribute('x2', '23');
            line.setAttribute('y2', '23');
            line.setAttribute('stroke', 'currentColor');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
          }
        } else {
          // Show normal eye
          svgPath.setAttribute('d', 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z');
          if (svgCircle) svgCircle.style.display = 'block';
          
          // Remove slash line
          const slashLine = button.querySelector('.slash-line');
          if (slashLine) slashLine.remove();
        }
        
        button.style.transform = 'scale(1) rotate(0deg)';
      }, 100);
    });
  });
};

// Enhanced Form Initialization
const initLoginForm = () => {
  const loginForm = $('#loginForm');
  if (!loginForm) return;
  
  // Add enhanced form interactions
  addFormEnhancements(loginForm);
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, '/api/login');
  });
};

const initRegisterForm = () => {
  const registerForm = $('#registerForm');
  if (!registerForm) return;
  
  // Add enhanced form interactions
  addFormEnhancements(registerForm);
  
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(registerForm, '/api/register', true);
  });
};

// Enhanced Form Interactions
const addFormEnhancements = (form) => {
  const inputs = form.querySelectorAll('input, select');
  
  inputs.forEach(input => {
    // Add floating label effect
    input.addEventListener('focus', () => {
      input.style.transform = 'translateY(-1px)';
      input.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)';
    });
    
    input.addEventListener('blur', () => {
      input.style.transform = '';
      input.style.boxShadow = '';
    });
    
    // Add typing animation feedback
    input.addEventListener('input', () => {
      if (input.value.length > 0) {
        input.style.background = 'rgba(0, 122, 255, 0.02)';
      } else {
        input.style.background = '';
      }
    });
  });
};

// FIXED: Enhanced Profile Password Form with Success Confirmation
const initProfilePasswordForm = () => {
  const passwordForm = $('#passwordForm');
  if (!passwordForm) return;
  
  addFormEnhancements(passwordForm);
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitButton = passwordForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner');
    const buttonText = submitButton.querySelector('span') || submitButton;
    const originalText = buttonText.textContent;
    const currentPassword = $('#currentPassword').value;
    const newPassword = $('#newPassword').value;
    const confirmPassword = $('#confirmPassword').value;
    
    // Enhanced client-side validation with animations
    const errors = [];
    
    if (!currentPassword) errors.push('Current password is required');
    if (!newPassword) errors.push('New password is required');
    if (newPassword.length < 8) errors.push('New password must be at least 8 characters');
    if (newPassword !== confirmPassword) errors.push('New passwords do not match');
    if (currentPassword === newPassword) errors.push('New password must be different from current password');
    
    if (errors.length > 0) {
      // Animate form shake for validation errors
      passwordForm.style.animation = 'shake 0.5s ease-in-out';
      showNotification(errors[0], 'error');
      setTimeout(() => {
        passwordForm.style.animation = '';
      }, 500);
      return;
    }
    
    // Enhanced loading state
    submitButton.disabled = true;
    submitButton.style.transform = 'scale(0.98)';
    buttonText.textContent = 'Updating...';
    
    if (spinner) {
      spinner.classList.add('active');
      spinner.style.transform = 'scale(1.1)';
    }
    
    try {
      const token = await fetchCSRFToken();
      if (!token) return;
      
      const formData = new FormData();
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
      formData.append('csrf_token', token);
      
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // FIXED: Enhanced success animation with clear confirmation
        submitButton.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
        buttonText.textContent = '✓ Updated!';
        
        // Clear success confirmation message
        showNotification('🔒 Password updated successfully! Your account is now more secure.', 'success', 6000);
        
        // Reset form with animation
        setTimeout(() => {
          passwordForm.reset();
          
          // Reset form fields with animation
          const inputs = passwordForm.querySelectorAll('input');
          inputs.forEach(input => {
            input.style.background = '';
            input.style.transition = 'all 0.3s ease';
            input.style.transform = 'scale(0.98)';
            setTimeout(() => {
              input.style.transform = '';
            }, 200);
          });
        }, 500);
        
        // Reset button after success
        setTimeout(() => {
          submitButton.style.background = '';
          buttonText.textContent = originalText;
          }, 3000);
        
      } else {
        throw new Error(data.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Error animation
      submitButton.style.background = 'linear-gradient(135deg, #ff3b30 0%, #ff453a 100%)';
      submitButton.style.animation = 'shake 0.5s ease-in-out';
      buttonText.textContent = '✗ Failed';
      
      showNotification(error.message, 'error');
      
      setTimeout(() => {
        submitButton.style.background = '';
        submitButton.style.animation = '';
        buttonText.textContent = originalText;
      }, 2000);
    } finally {
      submitButton.disabled = false;
      submitButton.style.transform = '';
      if (spinner) {
        spinner.classList.remove('active');
        spinner.style.transform = '';
      }
    }
  });
};

// Enhanced Progress Management
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

// FIXED: Progress Bar with Correct Task Count (30 tasks)
const updateProgressBar = () => {
  const tasks = document.querySelectorAll('.task input[type="checkbox"]');
  const totalTasks = TOTAL_TASKS; // Use constant instead of DOM count
  const completedTasks = Array.from(tasks).filter((task) => task.checked).length;
  const percentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');
  
  if (progressBar) {
    // Smooth animated progress update
    progressBar.style.transition = 'all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1)';
    progressBar.style.setProperty('--progress', `${percentage}%`);
    progressBar.setAttribute('aria-valuenow', percentage);
    
    // Add glow effect for high progress
    if (percentage >= 75) {
      progressBar.style.filter = 'drop-shadow(0 0 8px rgba(0, 122, 255, 0.4))';
    } else {
      progressBar.style.filter = '';
    }
  }
  
  if (progressText) {
    // Animate the text change
    progressText.style.transition = 'all 0.3s ease';
    progressText.style.transform = 'scale(0.9)';
    progressText.style.opacity = '0.7';
    
    setTimeout(() => {
      progressText.textContent = `${percentage}% Completed`;
      progressText.style.transform = 'scale(1)';
      progressText.style.opacity = '1';
    }, 150);
  }
  
  // Milestone celebrations with confetti-like effects
  if (percentage === 100 && completedTasks === totalTasks) {
    triggerCelebration();
    showNotification('🎉 Outstanding! You completed all training modules!', 'success', 8000);
  } else if (percentage > 0 && percentage % 25 === 0) {
    triggerMilestone(percentage);
    showNotification(`🚀 Excellent progress! ${percentage}% complete`, 'success');
  }
};

// Celebration Effects
const triggerCelebration = () => {
  // Create confetti-like effect
  for (let i = 0; i < 50; i++) {
    createConfetti();
  }
  
  // Animate progress bar with celebration
  const progressBar = $('#progressBar');
  if (progressBar) {
    progressBar.style.animation = 'celebrate 2s ease-in-out';
    setTimeout(() => {
      progressBar.style.animation = '';
    }, 2000);
  }
};

const triggerMilestone = (percentage) => {
  // Create smaller celebration for milestones
  for (let i = 0; i < 20; i++) {
    createConfetti(true);
  }
};

const createConfetti = (small = false) => {
  const confetti = document.createElement('div');
  confetti.style.position = 'fixed';
  confetti.style.width = small ? '4px' : '8px';
  confetti.style.height = small ? '4px' : '8px';
  confetti.style.background = ['#007aff', '#34c759', '#ff9500', '#ff3b30'][Math.floor(Math.random() * 4)];
  confetti.style.left = Math.random() * 100 + 'vw';
  confetti.style.top = '-10px';
  confetti.style.borderRadius = '50%';
  confetti.style.pointerEvents = 'none';
  confetti.style.zIndex = '9999';
  confetti.style.animation = `confetti ${2 + Math.random() * 2}s ease-out forwards`;
  
  document.body.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, 4000);
};

// Enhanced Progress Sync with Optimistic Updates
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
    
    // Trigger success micro-animation
    const taskElement = document.querySelector(`[data-week="${week}"][data-task="${task}"]`).closest('.task');
    if (taskElement && checked) {
      taskElement.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      taskElement.style.transform = 'scale(1.02)';
      taskElement.style.background = 'rgba(52, 199, 89, 0.1)';
      
      setTimeout(() => {
        taskElement.style.transform = '';
        taskElement.style.background = '';
      }, 300);
    }
    
  } catch (error) {
    console.error('Progress sync error:', error);
    showNotification('Failed to save progress. Changes may be lost.', 'error');
    
    // Revert the checkbox state on failure
    const checkbox = document.querySelector(`[data-week="${week}"][data-task="${task}"]`);
    if (checkbox) {
      checkbox.checked = !checked;
    }
  }
};

// Enhanced Dashboard with Sophisticated Animations
const initDashboard = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    // Smooth redirect with transition
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 300);
    return;
  }

  // FIXED: Enhanced user info display without role in brackets
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      // Animate user info update - REMOVED role display
      userInfo.style.transition = 'all 0.3s ease';
      userInfo.style.opacity = '0';
      setTimeout(() => {
        userInfo.textContent = profileData.name; // FIXED: No role in brackets
        userInfo.style.opacity = '1';
      }, 150);
      
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
        adminLink.style.animation = 'fadeIn 0.5s ease';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = user.name; // FIXED: No role in brackets
  }
  
  // Enhanced logout with smooth transitions
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    // Loading state for logout
    logoutLink.style.transition = 'all 0.3s ease';
    logoutLink.style.transform = 'scale(0.95)';
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('✓ Logged out successfully', 'success', 2000);
        
        // Elegant page transition
        setTimeout(() => {
          document.body.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 800);
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout properly', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
      logoutLink.style.transform = '';
    }
  });

  // Load and display progress with enhanced interactions
  try {
    const progress = await fetchProgress();
    const checkboxes = document.querySelectorAll('.task input[type="checkbox"]');
    
    if (checkboxes.length === 0) {
      console.log('No task checkboxes found - may not be on dashboard page');
      return;
    }
    
    checkboxes.forEach((checkbox) => {
      const week = checkbox.dataset.week;
      const task = checkbox.dataset.task;
      if (progress[week]?.[task]) {
        checkbox.checked = true;
      }
      
      // Enhanced checkbox interactions with micro-animations
      checkbox.addEventListener('change', (e) => {
        const taskElement = e.target.closest('.task');
        
        // Sophisticated visual feedback
        if (e.target.checked) {
          // Success animation
          taskElement.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          taskElement.style.transform = 'scale(1.03)';
          taskElement.style.background = 'rgba(52, 199, 89, 0.08)';
          
          // Add completion checkmark animation
          const taskIcon = taskElement.querySelector('.task-icon');
          if (taskIcon) {
            taskIcon.style.background = 'linear-gradient(135deg, #34c759 0%, #30d158 100%)';
            taskIcon.style.transform = 'scale(1.1) rotate(5deg)';
          }
          
          setTimeout(() => {
            taskElement.style.transform = '';
            taskElement.style.background = '';
            if (taskIcon) {
              taskIcon.style.transform = '';
              setTimeout(() => {
                taskIcon.style.background = '';
              }, 200);
            }
          }, 400);
        } else {
          // Unchecked animation
          taskElement.style.transition = 'all 0.2s ease';
          taskElement.style.transform = 'scale(0.98)';
          setTimeout(() => {
            taskElement.style.transform = '';
          }, 200);
        }
        
        syncProgress(week, task, checkbox.checked);
        updateProgressBar();
      });
    });

    updateProgressBar();
  } catch (error) {
    console.error('Dashboard progress initialization error:', error);
  }

  // Enhanced timeline animation with staggered reveals
  const weekElements = document.querySelectorAll('.week');
  if (weekElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate');
              // Add additional animation for the week badge
              const badge = entry.target.querySelector('.week-badge');
              if (badge) {
                badge.style.animation = 'bounceIn 0.6s ease-out';
              }
            }, index * 150); // Staggered animation
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );
    
    weekElements.forEach((week) => observer.observe(week));
  }
};

// Enhanced Profile Initialization
const initProfile = async () => {
  const userInfo = $('#userInfo');
  const logoutLink = $('#logout');
  
  if (!userInfo || !logoutLink) return;

  const user = JSON.parse(getCookie('user') || '{}');
  if (!user.name) {
    window.location.href = '/login.html';
    return;
  }

  // FIXED: Similar enhanced user info logic as dashboard - no role in brackets
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      setCookie('user', JSON.stringify({ 
        name: profileData.name, 
        role: profileData.role 
      }), 1);
      
      userInfo.textContent = profileData.name; // FIXED: No role in brackets
      
      const adminLink = $('#adminLink');
      if (adminLink && profileData.role === 'admin') {
        adminLink.style.display = 'inline';
      }
    }
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    userInfo.textContent = user.name; // FIXED: No role in brackets
  }
  
  // Enhanced logout for profile page (same as dashboard)
  logoutLink.addEventListener('click', async (e) => {
    e.preventDefault();
    
    logoutLink.style.transition = 'all 0.3s ease';
    logoutLink.style.transform = 'scale(0.95)';
    logoutLink.textContent = 'Logging out...';
    logoutLink.style.opacity = '0.6';
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      
      if (response.ok) {
        deleteCookie('user');
        showNotification('✓ Logged out successfully', 'success', 2000);
        
        setTimeout(() => {
          document.body.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          document.body.style.opacity = '0';
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 800);
        }, 1000);
      }
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Failed to logout properly', 'error');
      logoutLink.textContent = 'Logout';
      logoutLink.style.opacity = '';
      logoutLink.style.transform = '';
    }
  });

  // Load profile data with enhanced animations
  try {
    const response = await fetch('/api/profile', { credentials: 'same-origin' });
    if (response.ok) {
      const profileData = await response.json();
      
      // Animate profile data loading
      const profileElements = [
        { id: 'profileName', value: profileData.name },
        { id: 'profileEmail', value: profileData.email },
        { id: 'profileRole', value: profileData.role },
        { id: 'profileJoined', value: new Date(profileData.createdAt).toLocaleDateString() },
        { id: 'totalProgress', value: `${profileData.progress}%` },
        { id: 'completedTasks', value: `${profileData.completedTasks}/${TOTAL_TASKS}` }
      ];
      
      profileElements.forEach((element, index) => {
        const el = $(`#${element.id}`);
        if (el) {
          setTimeout(() => {
            el.style.transition = 'all 0.3s ease';
            el.style.opacity = '0';
            setTimeout(() => {
              el.textContent = element.value;
              el.style.opacity = '1';
            }, 150);
          }, index * 100);
        }
      });
      
      // Animate current week calculation
      const currentWeek = $('#currentWeek');
      if (currentWeek) {
        const weekNumber = Math.min(Math.floor(profileData.completedTasks / 7.5) + 1, 4);
        setTimeout(() => {
          currentWeek.style.transition = 'all 0.3s ease';
          currentWeek.style.opacity = '0';
          setTimeout(() => {
            currentWeek.textContent = `Week ${weekNumber}`;
            currentWeek.style.opacity = '1';
          }, 150);
        }, 600);
      }
    }
  } catch (error) {
    console.error('Profile load error:', error);
    showNotification('Failed to load profile data', 'error');
  }
  
  // Initialize password change form
  initProfilePasswordForm();
};

// Enhanced Modal with Comprehensive Task Details
const initModal = () => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  const closeModal = $('#closeModal');

  if (!modal || !modalTitle || !modalDescription || !closeModal) return;

  const taskElements = document.querySelectorAll('.task');
  
  if (taskElements.length === 0) {
    console.log('No task elements found - may not be on dashboard page');
    return;
  }

  taskElements.forEach((task) => {
    task.addEventListener('click', (e) => {
      if (e.target.type === 'checkbox') return;
      
      const weekElement = task.closest('.week');
      if (!weekElement) return;
      
      const week = weekElement.dataset.week;
      const taskId = task.dataset.task;
      const key = `${week}-${taskId}`;
      const content = TASK_DEFINITIONS[key] || {
        title: 'Task Details',
        description: '<p>No details available for this task.</p>',
      };
      
      modalTitle.textContent = content.title;
      modalDescription.innerHTML = content.description;
      
      // Sophisticated modal opening animation
      modal.style.display = 'flex';
      modal.style.opacity = '0';
      const modalContent = modal.querySelector('.modal-content');
      if (modalContent) {
        modalContent.style.transform = 'scale(0.9) translateY(20px)';
      }
      
      requestAnimationFrame(() => {
        modal.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        modal.style.opacity = '1';
        if (modalContent) {
          modalContent.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
          modalContent.style.transform = 'scale(1) translateY(0)';
        }
      });
      
      modal.focus();
    });

    // Enhanced keyboard accessibility
    task.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        task.click();
      }
    });
  });

  // Enhanced modal closing with animation
  const closeModalFunction = () => {
    const modalContent = modal.querySelector('.modal-content');
    
    modal.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    modal.style.opacity = '0';
    
    if (modalContent) {
      modalContent.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      modalContent.style.transform = 'scale(0.95) translateY(10px)';
    }
    
    setTimeout(() => {
      modal.style.display = 'none';
      if (modalContent) {
        modalContent.style.transform = '';
      }
      modal.style.transition = '';
    }, 300);
  };

  closeModal.addEventListener('click', closeModalFunction);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunction();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModalFunction();
    }
  });
};

// Navigation Enhancement with Smooth Scrolling
const enhanceNavigation = () => {
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
};

// Add CSS animations via JavaScript
const addCustomAnimations = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes confetti {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    @keyframes celebrate {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    @keyframes bounceIn {
      0% { opacity: 0; transform: scale(0.3); }
      50% { opacity: 1; transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
};

// FIXED: Global VelocityLab object for admin functions
window.VelocityLab = {
  showNotification,
  refreshLeaderboard: () => {
    if (typeof loadUsersProgress === 'function') loadUsersProgress();
  },
  exportData: () => {
    if (typeof exportData === 'function') exportData();
  },
  addAdmin: () => {
    const email = prompt('Enter email address to grant admin access:');
    if (email) {
      showNotification('Admin access management available in user modal', 'info');
    }
  },
  triggerCelebration: () => triggerCelebration(),
  triggerMilestone: (percentage) => triggerMilestone(percentage),
  TOTAL_TASKS: TOTAL_TASKS,
  TASK_DEFINITIONS: TASK_DEFINITIONS
};

// FIXED: Make showNotification globally available
window.showNotification = showNotification;

// Enhanced Initialization with Performance Optimization
const init = () => {
  console.log('🚀 Initializing Velocity Lab with enhanced UX...');
  console.log(`📊 Total Tasks Configured: ${TOTAL_TASKS}`);
  
  // Add custom animations
  addCustomAnimations();
  
  // Initialize components with error handling
  const components = [
    { name: 'Password Toggle', fn: setupPasswordToggle },
    { name: 'Login Form', fn: initLoginForm },
    { name: 'Register Form', fn: initRegisterForm },
    { name: 'Dashboard', fn: initDashboard },
    { name: 'Profile', fn: initProfile },
    { name: 'Modal', fn: initModal },
    { name: 'Navigation', fn: enhanceNavigation }
  ];
  
  components.forEach(({ name, fn }) => {
    try {
      fn();
      console.log(`✅ ${name} initialized`);
    } catch (error) {
      console.warn(`⚠️  ${name} initialization failed:`, error);
    }
  });
  
  // Sophisticated page entrance animation
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(20px)';
  
  requestAnimationFrame(() => {
    document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  });
  
  // Initialize performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`🎯 Velocity Lab loaded in ${Math.round(loadTime)}ms`);
    });
  }
  
  console.log('✨ Velocity Lab initialization complete with enhanced UX');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}