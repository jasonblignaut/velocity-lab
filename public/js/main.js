// Enhanced Main.js for Velocity Lab - FIXED VERSION
// Priority 1: Fixed logout error, modal positioning, hierarchical checkboxes, 30 tasks

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

// COMPREHENSIVE TASK DEFINITIONS WITH REFERENCE LINKS - 30 TASKS TOTAL
const TASK_DEFINITIONS = {
  // WEEK 1: Foundation Setup (8 tasks)
  'week1-dc-install': {
    title: 'Install Active Directory Domain Services Role',
    description: `
      <p><strong>Install the foundational role for domain services on Windows Server 2012.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Server Manager Dashboard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Add roles and features"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Role-based or feature-based installation"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose your server from the server pool</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select "Active Directory Domain Services" role</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Add required features when prompted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete the installation wizard</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services--level-100-" target="_blank">📖 MS Learn: Install Active Directory Domain Services</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/installing-active-directory-domain-services-on-windows-server/m-p/572305" target="_blank">💡 Tech Community: AD DS Installation Guide</a></li>
        <li><a href="https://www.youtube.com/watch?v=h4HbGvwFqzM" target="_blank">🎥 YouTube: Install Active Directory Domain Controller</a></li>
      </ul>
    `
  },

  'week1-dc-promote': {
    title: 'Promote Server to Domain Controller',
    description: `
      <p><strong>Configure the server as the primary domain controller with DNS services.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Click the notification flag in Server Manager</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Promote this server to a domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose "Add a new forest" and specify domain name (e.g., lab.local)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set Forest and Domain functional levels to Windows Server 2012</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Ensure "Domain Name System (DNS) server" is checked</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set Directory Services Restore Mode (DSRM) password</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Review DNS options and NetBIOS domain name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Specify database, log files, and SYSVOL paths</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Complete the promotion and restart when prompted</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-new-windows-server-2016-active-directory-forest--level-200-" target="_blank">📖 MS Learn: Install New AD Forest</a></li>
        <li><a href="https://www.youtube.com/watch?v=h4HbGvwFqzM" target="_blank">🎥 YouTube: Domain Controller Promotion</a></li>
      </ul>
    `
  },

  'week1-vm-dns': {
    title: 'Configure VM DNS Settings',
    description: `
      <p><strong>Point the virtual machine to use the domain controller as its DNS server.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Network and Sharing Center on the VM</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Change adapter settings"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click network adapter and select "Properties"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Internet Protocol Version 4 (TCP/IPv4)" and click "Properties"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select "Use the following DNS server addresses"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Enter the Domain Controller's IP address as Preferred DNS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Click "OK" to save settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test connectivity with <code>nslookup lab.local</code></label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/dns/troubleshoot/troubleshoot-dns-clients" target="_blank">📖 MS Learn: Configure DNS Clients</a></li>
        <li><a href="https://www.youtube.com/watch?v=WfCWqNb_4DI" target="_blank">🎥 YouTube: DNS Management</a></li>
      </ul>
    `
  },

  'week1-vm-join': {
    title: 'Join VM to Domain',
    description: `
      <p><strong>Add the virtual machine to the newly created domain for centralized management.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Right-click "This PC" and select "Properties"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Change settings" next to Computer name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Click "Change..." button</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Domain" and enter your domain name (e.g., lab.local)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Provide domain administrator credentials when prompted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Welcome message confirms successful domain join</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Restart the computer when prompted</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Log in with domain account to verify</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/join-a-computer-to-a-domain" target="_blank">📖 MS Learn: Join Computer to Domain</a></li>
      </ul>
    `
  },

  'week1-share-create': {
    title: 'Create Hidden Network Share',
    description: `
      <p><strong>Create a centralized file share with security and automatic mapping capabilities.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create folder "C:\\CompanyData" on Domain Controller</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Right-click folder and select "Properties"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Go to "Sharing" tab and click "Advanced Sharing"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Check "Share this folder"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Change share name to "CompanyData$" ($ makes it hidden)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Click "Permissions" and set appropriate access</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Go to "Security" tab and configure NTFS permissions</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test access from another machine using \\\\servername\\CompanyData$</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/storage/file-server/file-server-resource-manager/file-server-resource-manager-overview" target="_blank">📖 MS Learn: File Server Management</a></li>
      </ul>
    `
  },

  'week1-share-gpo': {
    title: 'Map Drive via Group Policy',
    description: `
      <p><strong>Configure automatic drive mapping through Group Policy for Method 1.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Group Policy Management Console (gpmc.msc)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new GPO named "Drive Mapping Policy"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click and "Edit" the GPO</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Navigate to User Configuration > Preferences > Windows Settings > Drive Maps</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Right-click and select "New > Mapped Drive"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set Action to "Create", Location to \\\\servername\\CompanyData$</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Set Drive Letter to "H:" and configure options</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Link GPO to appropriate OU and test</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/dn581922(v=ws.11)" target="_blank">📖 MS Learn: Group Policy Preferences</a></li>
      </ul>
    `
  },

  'week1-share-script': {
    title: 'Map Drive via Logon Script',
    description: `
      <p><strong>Create PowerShell logon script for automatic drive mapping - Method 2.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create PowerShell script file "MapDrives.ps1" in SYSVOL</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Add command: <code>New-PSDrive -Name "S" -PSProvider FileSystem -Root "\\\\servername\\CompanyData$" -Persist</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set execution policy if needed</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Open Group Policy Management Console</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Navigate to User Configuration > Policies > Windows Settings > Scripts</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Double-click "Logon" and add PowerShell script</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure script parameters and test deployment</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/new-psdrive" target="_blank">📖 MS Learn: New-PSDrive Cmdlet</a></li>
      </ul>
    `
  },

  'week1-group-create': {
    title: 'Create Security Group for Share Access',
    description: `
      <p><strong>Implement role-based access control using Active Directory security groups.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Active Directory Users and Computers (dsa.msc)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Navigate to appropriate OU or create new OU "Groups"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click and select "New > Group"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Name the group "CompanyData_Access"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set Group scope to "Global" and type to "Security"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Add users to the group who need share access</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Modify share and NTFS permissions to grant access only to this group</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test access with group member and non-member accounts</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups" target="_blank">📖 MS Learn: Security Groups Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/active-directory-security-groups-best-practices/m-p/1145319" target="_blank">💡 Tech Community: Security Groups Best Practices</a></li>
      </ul>
    `
  },

  // WEEK 2: Infrastructure Expansion (6 tasks)
  'week2-server-install': {
    title: 'Install Second Windows Server 2012',
    description: `
      <p><strong>Deploy a second server to provide redundancy and load distribution.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new virtual machine with adequate resources (minimum 4GB RAM)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2012 using installation media</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure basic network settings with static IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set DNS server to point to first domain controller</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Install latest updates and configure Windows Firewall</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Join the new server to the existing domain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify successful domain join and network connectivity</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank">📖 MS Learn: Server Installation</a></li>
      </ul>
    `
  },

  'week2-server-promote': {
    title: 'Promote Second Server to Additional Domain Controller',
    description: `
      <p><strong>Add redundancy by creating a second domain controller in the environment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Active Directory Domain Services role on second server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run "Promote this server to a domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Add a domain controller to an existing domain"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Provide domain administrator credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Ensure DNS server and Global Catalog options are selected</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set Directory Services Restore Mode password</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete promotion and verify replication</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test failover scenarios between domain controllers</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-replica-windows-server-2016-domain-controller-in-an-existing-domain--level-200-" target="_blank">📖 MS Learn: Install Replica Domain Controller</a></li>
      </ul>
    `
  },

  'week2-wsus-install': {
    title: 'Install WSUS Role',
    description: `
      <p><strong>Deploy Windows Server Update Services for centralized update management.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Server Manager and click "Add roles and features"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Windows Server Update Services" role</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose WID (Windows Internal Database) for database</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Specify content location (recommend separate drive)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Complete installation and run Post-Deployment Configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Connect to Microsoft Update and synchronize</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure update classifications and products</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Create computer groups for different update schedules</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/get-started/windows-server-update-services-wsus" target="_blank">📖 MS Learn: WSUS Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/windows-server-update-services-wsus-best-practices/m-p/1096945" target="_blank">💡 Tech Community: WSUS Best Practices</a></li>
      </ul>
    `
  },

  'week2-wsus-configure': {
    title: 'Configure WSUS Client Policies',
    description: `
      <p><strong>Set up Group Policy to direct clients to use WSUS for updates.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Group Policy Management Console</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new GPO named "WSUS Client Configuration"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Navigate to Computer Configuration > Policies > Administrative Templates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Go to Windows Components > Windows Update</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure "Specify intranet Microsoft update service location"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set both URLs to http://WSUSServerName:8530</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure automatic update settings and schedule</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Link GPO to appropriate OUs and test client connectivity</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates" target="_blank">📖 MS Learn: Configure WSUS Group Policy</a></li>
      </ul>
    `
  },

  'week2-time-primary': {
    title: 'Configure Primary Time Server',
    description: `
      <p><strong>Set up the PDC Emulator as the authoritative time source for the domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Identify PDC Emulator role holder with: <code>netdom query fsmo</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. On PDC Emulator, configure external time source</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Run: <code>w32tm /config /manualpeerlist:"time.nist.gov,pool.ntp.org" /syncfromflags:manual</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run: <code>w32tm /config /reliable:yes</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Restart Windows Time service: <code>net stop w32time && net start w32time</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Force immediate sync: <code>w32tm /resync /rediscover</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify configuration: <code>w32tm /query /status</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Check time source: <code>w32tm /query /source</code></label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-top" target="_blank">📖 MS Learn: Windows Time Service</a></li>
      </ul>
    `
  },

  'week2-time-secondary': {
    title: 'Configure Secondary Time Server',
    description: `
      <p><strong>Set up the second domain controller as backup time source.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On second domain controller, configure time sync with PDC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run: <code>w32tm /config /syncfromflags:domhier</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Run: <code>w32tm /config /reliable:no</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Restart Windows Time service</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Force sync with domain hierarchy: <code>w32tm /resync</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify sync status: <code>w32tm /query /status</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test time synchronization across all domain members</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure monitoring for time drift issues</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/troubleshoot/windows-server/identity/config-authoritative-time-server" target="_blank">📖 MS Learn: Configure Authoritative Time Server</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/windows-server-for-it-pros/time-synchronization-in-active-directory/m-p/395402" target="_blank">💡 Tech Community: Time Sync in AD</a></li>
      </ul>
    `
  },

  // WEEK 3: Email & Messaging (8 tasks) - Adding remaining tasks
  'week3-upgrade-prep': {
    title: 'Prepare for Server 2016 Upgrade',
    description: `
      <p><strong>Prepare the environment for upgrading from Windows Server 2012 to 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Windows Server 2016 compatibility check</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create full system backups of all servers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Document current server configurations and roles</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify hardware compatibility with Server 2016</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Check application compatibility requirements</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Plan upgrade sequence (secondary DC first, then primary)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Download Windows Server 2016 installation media</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Schedule maintenance window for upgrades</label>
        </div>
      </div>
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
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Start with secondary domain controller upgrade</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run Windows Server 2016 setup from installation media</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose "Keep personal files and apps" option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Follow upgrade wizard and wait for completion</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify all roles and features are functioning</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test Active Directory replication between DCs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Upgrade primary domain controller using same process</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Raise domain and forest functional levels to 2016</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/upgrade/upgrade-2012-to-2016" target="_blank">📖 MS Learn: In-Place Upgrade Process</a></li>
      </ul>
    `
  },

  'week3-exchange-prep': {
    title: 'Prepare Exchange Server Installation',
    description: `
      <p><strong>Prepare the third server for Exchange Server 2019 deployment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Windows Server 2016 on third server with minimum 16GB RAM</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Join server to domain and install latest updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install required Windows features and .NET Framework</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Install Visual C++ Redistributable packages</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Download Exchange Server 2019 installation files</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Extend Active Directory schema for Exchange</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Prepare Active Directory domain for Exchange</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify all prerequisites are met before installation</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites?view=exchserver-2019" target="_blank">📖 MS Learn: Exchange 2019 Prerequisites</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-2019-setup-amp-deployment-guide/ba-p/1128616" target="_blank">💡 Tech Community: Exchange 2019 Setup</a></li>
        <li><a href="https://www.youtube.com/watch?v=CiJW8yt_KnU" target="_blank">🎥 YouTube: Exchange 2019 Prerequisites</a></li>
      </ul>
    `
  },

  'week3-exchange-install': {
    title: 'Install Exchange Server 2019',
    description: `
      <p><strong>Deploy Exchange Server 2019 with Mailbox role on the prepared server.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Exchange setup.exe as administrator</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Accept license agreement and choose update options</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Mailbox role" for installation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Specify installation path and organization name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure malware protection settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Review readiness checks and resolve any issues</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete installation (may take 60+ minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Install latest Exchange cumulative update</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Verify Exchange services are running properly</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/install-exchange-mailbox-role?view=exchserver-2019" target="_blank">📖 MS Learn: Install Exchange Mailbox Role</a></li>
        <li><a href="https://www.youtube.com/watch?v=y6vQyr_b5kE" target="_blank">🎥 YouTube: Install Exchange Server 2019</a></li>
      </ul>
    `
  },

  'week3-exchange-config': {
    title: 'Configure Exchange Post-Installation',
    description: `
      <p><strong>Complete initial Exchange configuration and security settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Access Exchange Admin Center (EAC) via https://servername/ecp</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure accepted domains for your organization</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set up email address policies for automatic address generation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure receive connectors for SMTP traffic</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set up send connectors for outbound mail routing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure transport rules and message hygiene</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Set up certificates for secure communication</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test basic Exchange functionality and services</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/architecture/mailbox-servers/manage-mailbox-servers?view=exchserver-2019" target="_blank">📖 MS Learn: Manage Mailbox Servers</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-server-post-installation-tasks/ba-p/1098432" target="_blank">💡 Tech Community: Post-Installation Tasks</a></li>
        <li><a href="https://www.youtube.com/watch?v=lOYtbqJ9_aE" target="_blank">🎥 YouTube: Configure Exchange Post Installation</a></li>
      </ul>
    `
  },

  'week3-mailbox-create': {
    title: 'Create User Mailboxes',
    description: `
      <p><strong>Provision mailboxes for domain users and configure mailbox settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Exchange Admin Center (EAC)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Navigate to Recipients > Mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Click "+" to create new user mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose "User mailbox" and select existing domain user</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure mailbox database and alias settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set mailbox quota and message size limits</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Enable mailbox features (ActiveSync, OWA, etc.)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Create additional test mailboxes for different scenarios</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Verify mailboxes appear in Exchange Management Shell</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/recipients/create-user-mailboxes?view=exchserver-2019" target="_blank">📖 MS Learn: Create User Mailboxes</a></li>
        <li><a href="https://www.youtube.com/watch?v=kYqWaQZZG8I" target="_blank">🎥 YouTube: Create and Manage Recipients</a></li>
      </ul>
    `
  },

  'week3-mailbox-test': {
    title: 'Test Mailbox Functionality',
    description: `
      <p><strong>Verify mailbox creation and basic email functionality.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test mailbox access via Outlook Web Access (OWA)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure Outlook profile for test user</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Send test emails between created mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify mail delivery and folder synchronization</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test calendar functionality and meeting requests</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check global address list (GAL) visibility</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify distribution group creation and membership</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test mailbox permissions and delegation</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/clients/outlook-on-the-web/outlook-on-the-web?view=exchserver-2019" target="_blank">📖 MS Learn: Outlook on the Web</a></li>
      </ul>
    `
  },

  'week3-mail-internal': {
    title: 'Configure Internal Mail Flow',
    description: `
      <p><strong>Set up and verify internal mail routing and delivery within the organization.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure default receive connector for internal SMTP traffic</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Set up Hub Transport service for message routing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure message routing within the Exchange organization</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test mail flow between different mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set up message tracking and logging</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure mailbox delivery options and restrictions</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test large attachment handling and size limits</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify mail flow using Exchange Management Shell cmdlets</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Use Test-Mailflow cmdlet to verify routing</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/connectors?view=exchserver-2019" target="_blank">📖 MS Learn: Mail Flow Connectors</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/troubleshooting-mail-flow-in-exchange-server/ba-p/1087449" target="_blank">💡 Tech Community: Troubleshoot Mail Flow</a></li>
        <li><a href="https://www.youtube.com/watch?v=yKkgLTWQ8wI" target="_blank">🎥 YouTube: Mail Flow and Transport Pipeline</a></li>
      </ul>
    `
  },

  // WEEK 4: Cloud Integration (8 tasks)
  'week4-external-dns': {
    title: 'Configure DNS Records for External Mail',
    description: `
      <p><strong>Set up essential DNS records for external email delivery and authentication.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create MX record pointing to your Exchange server's public IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Set up A record for mail server (mail.yourdomain.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure reverse DNS (PTR) record with your ISP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create SPF record: "v=spf1 ip4:your.public.ip -all"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Generate DKIM key pair using Exchange or third-party tool</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Publish DKIM public key in DNS as TXT record</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create DMARC policy record for email authentication</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test DNS propagation and validate records</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/external-mail-flow?view=exchserver-2019" target="_blank">📖 MS Learn: External Mail Flow</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/email-authentication-spf-dkim-and-dmarc/ba-p/1072258" target="_blank">💡 Tech Community: Email Authentication</a></li>
        <li><a href="https://www.youtube.com/watch?v=lOYtbqJ9_aE" target="_blank">🎥 YouTube: Configure External Mail Flow</a></li>
      </ul>
    `
  },

  'week4-external-firewall': {
    title: 'Configure Firewall and Network Security',
    description: `
      <p><strong>Set up network security and firewall rules for external email access.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure router/firewall to forward SMTP port 25 to Exchange server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Set up port forwarding for SMTPS (587) and HTTPS (443)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure IMAPS (993) and POP3S (995) if required</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set up Windows Firewall rules on Exchange server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure network load balancing if using multiple servers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set up VPN access for remote administration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Implement intrusion detection and prevention</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test external connectivity from outside network</label>
        </div>
      </div>
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
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Generate Certificate Signing Request (CSR) from Exchange</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Purchase SSL certificate from trusted Certificate Authority</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install certificate on Exchange server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Assign certificate to SMTP, IIS, and other services</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure virtual directories to use HTTPS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test certificate validation and trust chain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Set up automatic certificate renewal process</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify secure connections for all external services</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/architecture/client-access/certificates?view=exchserver-2019" target="_blank">📖 MS Learn: Exchange Certificates</a></li>
        <li><a href="https://www.youtube.com/watch?v=aOYYNKt8RUo" target="_blank">🎥 YouTube: Install SSL Certificate Exchange</a></li>
      </ul>
    `
  },

  'week4-external-auth': {
    title: 'Configure Modern Authentication',
    description: `
      <p><strong>Implement OAuth 2.0 and modern authentication protocols for enhanced security.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Enable modern authentication in Exchange Online</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure Azure AD application registration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set up OAuth authentication endpoints</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure Exchange virtual directories for modern auth</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Disable legacy authentication protocols where possible</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test modern authentication with Outlook clients</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure conditional access policies</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify multi-factor authentication integration</label>
        </div>
      </div>
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
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create Microsoft 365 tenant and verify domain ownership</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Purchase appropriate Exchange Online licenses</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install and configure Azure AD Connect</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Synchronize on-premises users to Azure AD</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify directory synchronization is working</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure UPN suffixes to match verified domains</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Set up service accounts for hybrid configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Download and install Hybrid Configuration Wizard</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment-prerequisites" target="_blank">📖 MS Learn: Hybrid Prerequisites</a></li>
        <li><a href="https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-roadmap" target="_blank">📖 MS Learn: Azure AD Connect</a></li>
        <li><a href="https://www.youtube.com/watch?v=sKbhDnvLbgM" target="_blank">🎥 YouTube: Exchange Hybrid Prerequisites</a></li>
      </ul>
    `
  },

  'week4-hybrid-wizard': {
    title: 'Run Hybrid Configuration Wizard',
    description: `
      <p><strong>Execute the Hybrid Configuration Wizard to establish trust and mail routing.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Launch Hybrid Configuration Wizard from Exchange server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Sign in with Global Administrator credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select Exchange organization and Office 365 tenant</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose hybrid features to enable (Free/Busy, Mail Tips, etc.)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure mail routing and transport settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set up organization relationship and sharing policies</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Review and apply configuration changes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Monitor wizard progress and resolve any errors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Verify hybrid configuration completion</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/deploy-hybrid" target="_blank">📖 MS Learn: Deploy Hybrid</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-hybrid-deployment-step-by-step-guide/ba-p/1044294" target="_blank">💡 Tech Community: Hybrid Step-by-Step</a></li>
        <li><a href="https://www.youtube.com/watch?v=qQLCPYGCpAU" target="_blank">🎥 YouTube: Hybrid Configuration Wizard</a></li>
      </ul>
    `
  },

  'week4-hybrid-mailflow': {
    title: 'Configure Hybrid Mail Flow',
    description: `
      <p><strong>Set up bidirectional mail flow between on-premises and Exchange Online.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure inbound connector in Exchange Online</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Set up outbound connector for on-premises routing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure mail routing rules and policies</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test mail flow from on-premises to cloud</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test mail flow from cloud to on-premises</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify external mail routing through correct path</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Set up mail flow monitoring and alerts</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure centralized mail transport if required</label>
        </div>
      </div>
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
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test cross-premises free/busy calendar sharing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify mail tips between on-premises and cloud users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Test cross-premises message tracking</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Validate secure mail transport between environments</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test mailbox moves between on-premises and cloud</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify single sign-on functionality</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test mobile device management across environments</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document hybrid configuration and create maintenance procedures</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Train users on hybrid functionality and features</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment" target="_blank">📖 MS Learn: Hybrid Deployment Overview</a></li>
        <li><a href="https://techcommunity.microsoft.com/t5/exchange-team-blog/exchange-hybrid-free-busy-troubleshooting/ba-p/1087623" target="_blank">💡 Tech Community: Hybrid Free/Busy</a></li>
        <li><a href="https://www.youtube.com/watch?v=K2BXBiLLZ6Q" target="_blank">🎥 YouTube: Hybrid Migration Guide</a></li>
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