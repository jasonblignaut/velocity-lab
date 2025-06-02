// ===================================================================
// Velocity Lab - Complete Application JavaScript
// Apple/Unifi Cloud Inspired - 42-Task Exchange Hybrid Migration Training
// ===================================================================

'use strict';

// ===================================================================
// 1. UTILITY FUNCTIONS & CONSTANTS
// ===================================================================

// DOM Utilities with Performance Optimization
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => context.querySelectorAll(selector);

// Enhanced Cookie Management with Security
const setCookie = (name, value, days = 7) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  return parts.length === 2 ? decodeURIComponent(parts.pop().split(';').shift()) : null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict;Secure`;
};

// Debounce utility for performance
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Date formatting utility
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// ===================================================================
// 2. COMPLETE 42-TASK STRUCTURE & DEFINITIONS
// ===================================================================

// COMPLETE 42-TASK STRUCTURE - Matching backend exactly
const TASK_STRUCTURE = {
  week1: {
    title: "Foundation Setup",
    description: "Windows Server 2012 DC, domain joining, and network shares",
    taskCount: 12,
    tasks: [
      'install-server2012',
      'configure-static-ip', 
      'install-adds-role',
      'promote-to-dc',
      'configure-dns-server',
      'create-domain-users',
      'setup-vm-dns',
      'join-vm-domain',
      'create-hidden-share',
      'map-drive-gpo',
      'map-drive-script',
      'create-security-group'
    ]
  },
  week2: {
    title: "Infrastructure Expansion",
    description: "Second DC, WSUS, and time synchronization", 
    taskCount: 8,
    tasks: [
      'install-second-server',
      'promote-additional-dc',
      'install-wsus-role',
      'configure-wsus-settings',
      'setup-wsus-gpo',
      'configure-primary-time',
      'configure-secondary-time',
      'test-infrastructure'
    ]
  },
  week3: {
    title: "Email & Messaging",
    description: "Server 2016 upgrade and Exchange 2019 deployment",
    taskCount: 12,
    tasks: [
      'backup-servers',
      'upgrade-dc1-2016',
      'upgrade-dc2-2016', 
      'raise-functional-levels',
      'prepare-exchange-server',
      'install-exchange-prereqs',
      'extend-ad-schema',
      'install-exchange-2019',
      'configure-exchange-basic',
      'create-mailboxes',
      'test-mailbox-access',
      'configure-internal-mailflow'
    ]
  },
  week4: {
    title: "Cloud Integration", 
    description: "External mail publishing and Microsoft 365 hybrid setup",
    taskCount: 10,
    tasks: [
      'configure-external-dns',
      'setup-firewall-rules',
      'install-ssl-certificates',
      'configure-external-mailflow',
      'setup-modern-auth',
      'prepare-m365-tenant',
      'install-aad-connect',
      'run-hybrid-wizard',
      'configure-hybrid-mailflow',
      'verify-hybrid-functionality'
    ]
  }
};

// TOTAL TASK COUNT: 42 tasks (12 + 8 + 12 + 10)
const TOTAL_TASKS = Object.values(TASK_STRUCTURE).reduce((sum, week) => sum + week.taskCount, 0);

// COMPLETE TASK DEFINITIONS - All 42 Tasks with MSP-focused content
const TASK_DEFINITIONS = {
  // ================================
  // WEEK 1: Foundation Setup (12 tasks)
  // ================================
  
  'week1-install-server2012': {
    title: 'Install Windows Server 2012',
    description: `
      <p><strong>Set up the foundation server for your domain controller with proper VM configuration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM with minimum 4GB RAM, 60GB disk</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Boot from Windows Server 2012 R2 ISO</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Complete Windows installation wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set administrator password</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Install VM integration services/tools</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank">📖 MS Learn: Server Installation</a></li>
        <li><a href="https://www.youtube.com/watch?v=h4HbGvwFqzM" target="_blank">🎥 YouTube: Install Windows Server 2012</a></li>
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
          <label>1. Open Network and Sharing Center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Change adapter settings"</label>
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
          <label>5. Set subnet mask (255.255.255.0) and default gateway</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure DNS servers (initially use ISP DNS)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test connectivity with ping commands</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/technologies/ipam/ipam-top" target="_blank">📖 MS Learn: IP Address Management</a></li>
      </ul>
    `
  },

  'week1-install-adds-role': {
    title: 'Install Active Directory Domain Services Role',
    description: `
      <p><strong>Install the foundational AD DS role on Windows Server 2012.</strong></p>
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
      </ul>
    `
  },

  'week1-promote-to-dc': {
    title: 'Promote Server to Domain Controller',
    description: `
      <p><strong>Configure as primary DC with DNS services and create new forest (lab.local).</strong></p>
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
      </ul>
    `
  },

  'week1-configure-dns-server': {
    title: 'Configure DNS Server Settings',
    description: `
      <p><strong>Set up DNS zones and ensure proper name resolution for the domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open DNS Manager from Server Manager Tools</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify forward lookup zone for your domain exists</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create reverse lookup zone for your subnet</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure DNS forwarders for external resolution</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test DNS resolution with nslookup commands</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify _msdcs and other SRV records are created</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-top" target="_blank">📖 MS Learn: DNS Server Overview</a></li>
      </ul>
    `
  },

  'week1-create-domain-users': {
    title: 'Create Domain Users and OUs',
    description: `
      <p><strong>Set up organizational units and create test user accounts for the domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Active Directory Users and Computers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create OU structure (Users, Computers, Groups)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create test user accounts (TestUser1, TestUser2)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set strong passwords and configure account options</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Add users to appropriate groups</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test user logon from domain controller</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/reviewing-ou-design-concepts" target="_blank">📖 MS Learn: OU Design Concepts</a></li>
      </ul>
    `
  },

  'week1-setup-vm-dns': {
    title: 'Configure VM DNS Settings',
    description: `
      <p><strong>Point virtual machine to use domain controller as DNS server.</strong></p>
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
      </ul>
    `
  },

  'week1-join-vm-domain': {
    title: 'Join VM to Domain',
    description: `
      <p><strong>Add virtual machine to domain for centralized management.</strong></p>
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

  'week1-create-hidden-share': {
    title: 'Create Hidden Network Share',
    description: `
      <p><strong>Set up centralized file storage with hidden share (CompanyData$).</strong></p>
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

  'week1-map-drive-gpo': {
    title: 'Map Drive via Group Policy (Method 1)',
    description: `
      <p><strong>Configure automatic drive mapping through Group Policy preferences for H: drive.</strong></p>
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

  'week1-map-drive-script': {
    title: 'Map Drive via Logon Script (Method 2)',
    description: `
      <p><strong>Create PowerShell logon script for automatic drive mapping to S: drive.</strong></p>
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

  'week1-create-security-group': {
    title: 'Create Security Group for Share Access',
    description: `
      <p><strong>Implement role-based access control using AD security groups.</strong></p>
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
      </ul>
    `
  },

  // ================================
  // WEEK 2: Infrastructure Expansion (8 tasks)
  // ================================

  'week2-install-second-server': {
    title: 'Install Second Windows Server 2012',
    description: `
      <p><strong>Deploy second server for redundancy and load distribution.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM with adequate resources (4GB RAM, 60GB disk)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2012 R2</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure network settings with static IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Point DNS to existing domain controller</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Join server to domain</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-replica-windows-server-2016-domain-controller-in-an-existing-domain--level-200-" target="_blank">📖 MS Learn: Multiple Domain Controllers</a></li>
      </ul>
    `
  },

  'week2-promote-additional-dc': {
    title: 'Promote to Additional Domain Controller',
    description: `
      <p><strong>Add redundancy with second domain controller in environment.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install AD DS role on second server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run domain controller promotion wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Add a domain controller to an existing domain"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure DNS and Global Catalog options</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test replication between domain controllers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify SYSVOL replication is working</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-replica-windows-server-2016-domain-controller-in-an-existing-domain--level-200-" target="_blank">📖 MS Learn: Additional Domain Controller</a></li>
      </ul>
    `
  },

  'week2-install-wsus-role': {
    title: 'Install WSUS Role',
    description: `
      <p><strong>Deploy Windows Server Update Services for centralized updates.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Add WSUS role in Server Manager on second DC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure database location (WID or SQL)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set content storage location</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run post-deployment configuration wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure update languages and products</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Perform initial synchronization with Microsoft Update</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/get-started/windows-server-update-services-wsus" target="_blank">📖 MS Learn: WSUS Overview</a></li>
      </ul>
    `
  },

  'week2-configure-wsus-settings': {
    title: 'Configure WSUS Settings',
    description: `
      <p><strong>Set up update approval and client targeting policies.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open WSUS Administration Console</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create computer groups for different server types</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure automatic approvals for critical updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set up email notifications for administrators</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure update storage and cleanup options</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates" target="_blank">📖 MS Learn: WSUS Configuration</a></li>
      </ul>
    `
  },

  'week2-setup-wsus-gpo': {
    title: 'Setup WSUS Group Policy',
    description: `
      <p><strong>Configure client update policies and automatic update settings.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Group Policy Management Console</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create or edit WSUS Client Configuration policy</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure intranet update service location</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set automatic update configuration and install schedule</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Enable client-side targeting</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Link policy to appropriate OUs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test client connectivity to WSUS server</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/deploy/4-configure-group-policy-settings-for-automatic-updates" target="_blank">📖 MS Learn: WSUS Group Policy</a></li>
      </ul>
    `
  },

  'week2-configure-primary-time': {
    title: 'Configure Primary Time Server',
    description: `
      <p><strong>Set PDC Emulator as authoritative time source with external NTP.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Identify PDC Emulator with <code>netdom query fsmo</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure external time source: <code>w32tm /config /manualpeerlist:"time.nist.gov,0x1" /syncfromflags:manual</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Set as reliable time server: <code>w32tm /config /reliable:yes</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Restart Windows Time service: <code>net stop w32time && net start w32time</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Force time synchronization: <code>w32tm /resync</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify configuration: <code>w32tm /query /status</code></label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-top" target="_blank">📖 MS Learn: Windows Time Service</a></li>
      </ul>
    `
  },

  'week2-configure-secondary-time': {
    title: 'Configure Secondary Time Server',
    description: `
      <p><strong>Set second DC as backup time source with domain hierarchy sync.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On second DC, configure domain hierarchy sync: <code>w32tm /config /syncfromflags:domhier</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Set as non-reliable time source: <code>w32tm /config /reliable:no</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Restart Windows Time service</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Force synchronization with PDC: <code>w32tm /resync</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify time sync across domain: <code>w32tm /monitor</code></label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/networking/windows-time-service/windows-time-service-top" target="_blank">📖 MS Learn: Time Service Configuration</a></li>
      </ul>
    `
  },

  'week2-test-infrastructure': {
    title: 'Test Infrastructure Setup',
    description: `
      <p><strong>Verify all services, replication, and connectivity before proceeding.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test AD replication: <code>repadmin /replsummary</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify WSUS client connectivity</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Check time synchronization across all servers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Validate DNS resolution from all DCs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test user logon from both domain controllers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify network shares are accessible</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/troubleshoot/troubleshooting-active-directory-replication-problems" target="_blank">📖 MS Learn: AD Troubleshooting</a></li>
      </ul>
    `
  },

  // ================================
  // WEEK 3: Email & Messaging (12 tasks)
  // ================================

  'week3-backup-servers': {
    title: 'Backup Domain Controllers',
    description: `
      <p><strong>Create system state backups before major upgrades.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Windows Server Backup feature on both DCs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create system state backup of primary DC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create system state backup of secondary DC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Document backup locations and procedures</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test backup verification and integrity</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/ad-ds-backup-and-recovery" target="_blank">📖 MS Learn: AD DS Backup and Recovery</a></li>
      </ul>
    `
  },

  'week3-upgrade-dc1-2016': {
    title: 'Upgrade DC1 to Server 2016',
    description: `
      <p><strong>Perform in-place upgrade of primary domain controller.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Windows Server 2016 setup on DC1</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Choose "Upgrade" installation option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Complete upgrade process and reboot</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify AD services started correctly</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test replication with remaining 2012 DC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify all FSMO roles are accessible</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank">📖 MS Learn: Server 2016 Upgrade</a></li>
      </ul>
    `
  },

  'week3-upgrade-dc2-2016': {
    title: 'Upgrade DC2 to Server 2016',
    description: `
      <p><strong>Complete domain controller upgrade to Windows Server 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Windows Server 2016 setup on DC2</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Choose "Upgrade" installation option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Complete upgrade process and reboot</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify AD replication between both 2016 DCs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test WSUS functionality on upgraded server</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/get-started/installation-and-upgrade" target="_blank">📖 MS Learn: Server 2016 Upgrade Process</a></li>
      </ul>
    `
  },

  'week3-raise-functional-levels': {
    title: 'Raise Domain/Forest Functional Levels',
    description: `
      <p><strong>Enable Server 2016 features by raising functional levels.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Active Directory Domains and Trusts</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Right-click domain and select "Raise Domain Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Raise to Windows Server 2016 level</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Right-click root and select "Raise Forest Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Raise to Windows Server 2016 level</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify changes replicated across all DCs</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels" target="_blank">📖 MS Learn: AD Functional Levels</a></li>
      </ul>
    `
  },

  'week3-prepare-exchange-server': {
    title: 'Prepare Exchange Server VM',
    description: `
      <p><strong>Deploy and configure Windows Server 2016 for Exchange 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM with 8GB RAM, 120GB disk for Exchange</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2016</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure static IP and join to domain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Install latest Windows updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Rename computer to EXCHANGE01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure DNS settings to point to domain controllers</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/system-requirements" target="_blank">📖 MS Learn: Exchange System Requirements</a></li>
      </ul>
    `
  },

  'week3-install-exchange-prereqs': {
    title: 'Install Exchange Prerequisites',
    description: `
      <p><strong>Install required Windows features and components for Exchange 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install .NET Framework 4.8</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Visual C++ Redistributable 2013</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install Windows features via PowerShell: <code>Install-WindowsFeature AS-HTTP-Activation, Desktop-Experience, NET-Framework-45-Features, RPC-over-HTTP-proxy, RSAT-Clustering, RSAT-Clustering-CmdInterface, RSAT-Clustering-Mgmt, RSAT-Clustering-PowerShell, Web-Mgmt-Console, WAS-Process-Model, Web-Asp-Net45, Web-Basic-Auth, Web-Client-Auth, Web-Digest-Auth, Web-Dir-Browsing, Web-Dyn-Compression, Web-Http-Errors, Web-Http-Logging, Web-Http-Redirect, Web-Http-Tracing, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Lgcy-Mgmt-Console, Web-Metabase, Web-Mgmt-Console, Web-Mgmt-Service, Web-Net-Ext45, Web-Request-Monitor, Web-Server, Web-Stat-Compression, Web-Static-Content, Web-Windows-Auth, Web-WMI, Windows-Identity-Foundation, RSAT-ADDS</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Restart server after feature installation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify all prerequisites are installed</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites" target="_blank">📖 MS Learn: Exchange Prerequisites</a></li>
      </ul>
    `
  },

  'week3-extend-ad-schema': {
    title: 'Extend Active Directory Schema',
    description: `
      <p><strong>Prepare Active Directory for Exchange 2019 installation.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Download Exchange 2019 installation files</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run as Schema Admin: <code>Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Verify schema extension completed successfully</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run AD preparation: <code>Setup.exe /PrepareAD /OrganizationName:"Velocity Lab" /IAcceptExchangeServerLicenseTerms</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Prepare all domains: <code>Setup.exe /PrepareAllDomains /IAcceptExchangeServerLicenseTerms</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify replication completed across all DCs</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prepare-ad-and-domains" target="_blank">📖 MS Learn: Prepare AD for Exchange</a></li>
      </ul>
    `
  },

  'week3-install-exchange-2019': {
    title: 'Install Exchange Server 2019',
    description: `
      <p><strong>Deploy Exchange 2019 with Mailbox and Client Access roles.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Exchange 2019 Setup.exe as Administrator</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Choose "Install a new Exchange Server" option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Accept license terms and choose installation path</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Automatically install Windows Server roles and features"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Choose "Mailbox role" (includes Client Access services)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Specify installation space and location</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure malware scanning (disable for lab environment)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Complete installation and restart server</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/install-mailbox-role" target="_blank">📖 MS Learn: Install Exchange Mailbox Role</a></li>
      </ul>
    `
  },

  'week3-configure-exchange-basic': {
    title: 'Configure Basic Exchange Settings',
    description: `
      <p><strong>Set up Exchange organization and initial configuration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Exchange Admin Center (EAC) via https://localhost/ecp</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure accepted domains for lab.local</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create email address policies</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure receive connectors for SMTP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set up default send connector</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure virtual directories and URLs</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/architecture/client-access/client-access" target="_blank">📖 MS Learn: Exchange Client Access</a></li>
      </ul>
    `
  },

  'week3-create-mailboxes': {
    title: 'Create Test Mailboxes',
    description: `
      <p><strong>Set up user mailboxes for testing Exchange functionality.</strong></p>
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
          <label>3. Create mailbox for existing TestUser1</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create mailbox for existing TestUser2</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create administrator mailbox for testing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify mailboxes are created and functional</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/recipients/create-user-mailboxes" target="_blank">📖 MS Learn: Create User Mailboxes</a></li>
      </ul>
    `
  },

  'week3-test-mailbox-access': {
    title: 'Test Mailbox Access',
    description: `
      <p><strong>Verify Outlook Web Access and internal client connectivity.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test OWA access via https://exchange01.lab.local/owa</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Log in with TestUser1 credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Send test email to TestUser2</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify email delivery and receipt</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test EAC access from admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure Outlook client for one test user</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/clients/outlook-on-the-web/outlook-on-the-web" target="_blank">📖 MS Learn: Outlook on the Web</a></li>
      </ul>
    `
  },

  'week3-configure-internal-mailflow': {
    title: 'Configure Internal Mail Flow',
    description: `
      <p><strong>Set up proper mail routing and transport within the organization.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure default Receive Connector settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create and configure Send Connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Test internal mail flow between mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure message tracking and logging</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify transport service is running properly</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test mail queue and delivery mechanisms</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-flow" target="_blank">📖 MS Learn: Exchange Mail Flow</a></li>
      </ul>
    `
  },

  // ================================
  // WEEK 4: Cloud Integration (10 tasks)
  // ================================

  'week4-configure-external-dns': {
    title: 'Configure External DNS Records',
    description: `
      <p><strong>Set up public DNS records for external mail flow and hybrid.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Access public DNS provider control panel</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create MX record pointing to Exchange server public IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create A record for mail.yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure SPF record for email authentication</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set up autodiscover CNAME record</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify DNS propagation with nslookup</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/mail-routing/external-postmaster" target="_blank">📖 MS Learn: External DNS for Exchange</a></li>
      </ul>
    `
  },

  'week4-setup-firewall-rules': {
    title: 'Setup Firewall Rules',
    description: `
      <p><strong>Configure network firewall for Exchange external access.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Windows Firewall with Advanced Security</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create inbound rule for SMTP (port 25)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create inbound rule for HTTPS (port 443)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create inbound rule for HTTP (port 80) for redirection</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure NAT/port forwarding on router/firewall</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test external connectivity to Exchange services</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/post-installation-tasks/configure-mail-flow-and-client-access" target="_blank">📖 MS Learn: Configure Client Access</a></li>
      </ul>
    `
  },

  'week4-install-ssl-certificates': {
    title: 'Install SSL Certificates',
    description: `
      <p><strong>Deploy SSL certificates for secure external communication.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Generate Certificate Signing Request (CSR) via EAC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Submit CSR to Certificate Authority or use Let's Encrypt</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Download and install SSL certificate</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Assign certificate to Exchange services (IIS, SMTP)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure virtual directories to use HTTPS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test SSL connectivity via browser</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/post-installation-tasks/digital-certificates" target="_blank">📖 MS Learn: Exchange Digital Certificates</a></li>
      </ul>
    `
  },

  'week4-configure-external-mailflow': {
    title: 'Configure External Mail Flow',
    description: `
      <p><strong>Enable secure email communication with external organizations.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Configure Internet Send Connector for outbound mail</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Modify Default Frontend Receive Connector</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Test inbound mail flow from external sources</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test outbound mail flow to external recipients</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure TLS encryption for SMTP connections</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Monitor message tracking logs for delivery</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/connectors" target="_blank">📖 MS Learn: Exchange Connectors</a></li>
      </ul>
    `
  },

  'week4-setup-modern-auth': {
    title: 'Setup Modern Authentication',
    description: `
      <p><strong>Enable OAuth and modern authentication for Office 365 integration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Run Exchange management shell as administrator</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Enable OAuth authentication: <code>Set-AuthConfig -NewCertThumbprint (Get-ExchangeCertificate).Thumbprint -NewCertEffectiveDate (Get-Date)</code></label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure OAuth for partner applications</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Enable modern authentication on virtual directories</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test OAuth token generation and validation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify authentication policies are applied</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/post-installation-tasks/configure-oauth-authentication" target="_blank">📖 MS Learn: Configure OAuth Authentication</a></li>
      </ul>
    `
  },

  'week4-prepare-m365-tenant': {
    title: 'Prepare Microsoft 365 Tenant',
    description: `
      <p><strong>Set up Office 365 tenant and verify domain ownership.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Sign up for Microsoft 365 tenant (trial or demo)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Access Microsoft 365 admin center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Add and verify custom domain name</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure DNS TXT record for domain verification</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Assign Exchange Online licenses to users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Create matching user accounts in Office 365</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain" target="_blank">📖 MS Learn: Add Domain to Microsoft 365</a></li>
      </ul>
    `
  },

  'week4-install-aad-connect': {
    title: 'Install Azure AD Connect',
    description: `
      <p><strong>Deploy directory synchronization between on-premises AD and Azure AD.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Download Azure AD Connect from Microsoft</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run AzureADConnect.msi on domain controller</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose "Use express settings" for basic setup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Provide Azure AD Global Administrator credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Provide on-premises Enterprise Admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Complete configuration and start initial sync</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify user accounts synchronized to Azure AD</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/azure/active-directory/hybrid/how-to-connect-install-express" target="_blank">📖 MS Learn: Azure AD Connect Express Installation</a></li>
      </ul>
    `
  },

  'week4-run-hybrid-wizard': {
    title: 'Run Exchange Hybrid Configuration Wizard',
    description: `
      <p><strong>Configure Exchange hybrid deployment for coexistence.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Download and install Hybrid Configuration Wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Launch Hybrid Configuration Wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Connect to Office 365 with Global Admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select on-premises Exchange server for hybrid</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure federation trust and organization relationship</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set up hybrid send and receive connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Complete wizard and verify configuration</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-configuration-wizard" target="_blank">📖 MS Learn: Hybrid Configuration Wizard</a></li>
      </ul>
    `
  },

  'week4-configure-hybrid-mailflow': {
    title: 'Configure Hybrid Mail Flow',
    description: `
      <p><strong>Set up mail routing between on-premises and cloud environments.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify hybrid send connector configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify hybrid receive connector in Office 365</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure centralized mail transport (if required)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test mail flow from on-premises to cloud mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test mail flow from cloud to on-premises mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify message tracking across both environments</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/mail-flow-best-practices" target="_blank">📖 MS Learn: Hybrid Mail Flow</a></li>
      </ul>
    `
  },

  'week4-verify-hybrid-functionality': {
    title: 'Verify Hybrid Functionality',
    description: `
      <p><strong>Test and validate all hybrid features and functionality.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test calendar free/busy sharing between environments</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify cross-premises mailbox moves</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Test unified GAL and address book functionality</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify message tracking across both environments</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test Outlook Anywhere connectivity</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Validate single sign-on functionality</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Perform end-to-end mail flow testing</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document hybrid configuration for future reference</label>
        </div>
      </div>
      <h3>📚 Reference Links</h3>
      <ul>
        <li><a href="https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-deployment" target="_blank">📖 MS Learn: Exchange Hybrid Deployments</a></li>
        <li><a href="https://testconnectivity.microsoft.com/" target="_blank">🔧 Microsoft Remote Connectivity Analyzer</a></li>
      </ul>
    `
  }
};

// ===================================================================
// 3. STATE MANAGEMENT & PROGRESS TRACKING
// ===================================================================

// Enhanced task state management with immediate persistence
let taskStates = new Map();
let isUpdatingProgress = false;

// Notification queue for smooth UX
let notificationQueue = [];
let isNotificationActive = false;

// ===================================================================
// 4. NOTIFICATION SYSTEM
// ===================================================================

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

// ===================================================================
// 5. CSRF TOKEN MANAGEMENT
// ===================================================================

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

// ===================================================================
// 6. TASK PROGRESS MANAGEMENT
// ===================================================================

// ENHANCED: Task state management with immediate persistence
const updateTaskProgress = async (week, task, checked, subtaskKey = null) => {
  // Prevent multiple concurrent updates
  if (isUpdatingProgress) return;
  
  try {
    isUpdatingProgress = true;
    
    // Optimistic update - immediately reflect change in UI
    const taskKey = `${week}-${task}`;
    if (!taskStates.has(taskKey)) {
      taskStates.set(taskKey, { completed: false, subtasks: {} });
    }
    
    const taskState = taskStates.get(taskKey);
    
    if (subtaskKey) {
      // Update subtask
      taskState.subtasks[subtaskKey] = checked;
      
      // Check if all subtasks are completed to auto-complete main task
      const subtaskCheckboxes = document.querySelectorAll(`[data-task="${task}"] .subtask-checkbox`);
      const allSubtasksCompleted = Array.from(subtaskCheckboxes).every(cb => cb.checked);
      
      if (allSubtasksCompleted && !taskState.completed) {
        // Auto-complete main task
        const mainCheckbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
        if (mainCheckbox) {
          mainCheckbox.checked = true;
          taskState.completed = true;
        }
      } else if (!allSubtasksCompleted && taskState.completed) {
        // Auto-uncheck main task if not all subtasks are completed
        const mainCheckbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
        if (mainCheckbox) {
          mainCheckbox.checked = false;
          taskState.completed = false;
        }
      }
    } else {
      // Update main task
      taskState.completed = checked;
      
      // If main task is checked, check all subtasks
      if (checked) {
        const subtaskCheckboxes = document.querySelectorAll(`[data-task="${task}"] .subtask-checkbox`);
        subtaskCheckboxes.forEach(cb => {
          cb.checked = true;
          const stepKey = cb.getAttribute('data-step');
          if (stepKey) taskState.subtasks[stepKey] = true;
        });
      } else {
        // If main task is unchecked, uncheck all subtasks
        const subtaskCheckboxes = document.querySelectorAll(`[data-task="${task}"] .subtask-checkbox`);
        subtaskCheckboxes.forEach(cb => {
          cb.checked = false;
          const stepKey = cb.getAttribute('data-step');
          if (stepKey) taskState.subtasks[stepKey] = false;
        });
      }
    }
    
    // Update progress display immediately
    updateProgressDisplay();
    
    // Persist to backend
    const formData = new FormData();
    formData.append('task', task);
    formData.append('week', week);
    formData.append('checked', taskState.completed.toString());
    if (subtaskKey) {
      formData.append('subtask', subtaskKey);
      formData.append('subtask_checked', checked.toString());
    }

    const response = await fetch('/api/progress', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    });

    if (!response.ok) {
      // Revert optimistic update on failure
      if (subtaskKey) {
        taskState.subtasks[subtaskKey] = !checked;
      } else {
        taskState.completed = !checked;
      }
      updateProgressDisplay();
      throw new Error('Failed to save progress');
    }

    const result = await response.json();
    
    // Success feedback with celebration animation
    if (checked) {
      const checkbox = subtaskKey ? 
        document.querySelector(`[data-task="${task}"] [data-step="${subtaskKey}"]`) :
        document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
        
      if (checkbox) {
        // Add completion animation
        checkbox.parentElement.style.transition = 'all 0.3s ease';
        checkbox.parentElement.style.background = 'rgba(52, 199, 89, 0.1)';
        checkbox.parentElement.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
          checkbox.parentElement.style.background = '';
          checkbox.parentElement.style.transform = '';
        }, 1000);
      }
      
      // Show micro-celebration for main task completion
      if (!subtaskKey && taskState.completed) {
        const taskDef = TASK_DEFINITIONS[`${week}-${task}`];
        showNotification(`✅ Task completed: ${taskDef?.title || task}`, 'success', 3000);
      }
    }
    
  } catch (error) {
    console.error('Progress update error:', error);
    showNotification('Failed to save progress. Please try again.', 'error');
  } finally {
    isUpdatingProgress = false;
  }
};

// ENHANCED: Progress display with accurate 42-task calculation
const updateProgressDisplay = () => {
  const progressBar = $('#progressBar');
  const progressText = $('#progressText');
  
  if (!progressBar || !progressText) return;
  
  let completedTasks = 0;
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  
  // Calculate progress from current state
  taskStates.forEach((taskState, taskKey) => {
    if (taskState.completed) {
      completedTasks++;
    }
    
    // Count subtasks
    Object.entries(taskState.subtasks).forEach(([key, completed]) => {
      totalSubtasks++;
      if (completed) completedSubtasks++;
    });
  });
  
  // Weight main tasks more heavily (80%) than subtasks (20%)
  const mainTaskProgress = (completedTasks / TOTAL_TASKS) * 100;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const overallProgress = (mainTaskProgress * 0.8) + (subtaskProgress * 0.2);
  
  // Update progress bar with smooth animation
  progressBar.style.setProperty('--progress', `${Math.round(overallProgress)}%`);
  progressBar.setAttribute('aria-valuenow', Math.round(overallProgress));
  
  // Update progress text
  progressText.textContent = `${Math.round(overallProgress)}% Completed (${completedTasks}/${TOTAL_TASKS} tasks)`;
  
  // Add celebration effects for milestones
  if (overallProgress === 100) {
    setTimeout(() => {
      showNotification('🎉 Congratulations! You\'ve completed all 42 tasks of the hybrid migration lab!', 'success', 8000);
      triggerConfettiAnimation();
    }, 500);
  } else if (overallProgress >= 75 && overallProgress < 80) {
    showNotification('🚀 Almost there! You\'re in the final stretch!', 'success', 4000);
  } else if (overallProgress >= 50 && overallProgress < 55) {
    showNotification('💪 Halfway there! Keep up the great work!', 'success', 4000);
  } else if (overallProgress >= 25 && overallProgress < 30) {
    showNotification('📈 Quarter way through! You\'re making excellent progress!', 'success', 4000);
  }
};

// Confetti animation for 100% completion
const triggerConfettiAnimation = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      confetti.style.animation = 'confetti 3s ease-out forwards';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }, i * 100);
  }
};

// ===================================================================
// 7. MODAL MANAGEMENT
// ===================================================================

// ENHANCED: Modal positioning relative to click target
const openTaskModal = (taskKey, clickEvent) => {
  const modal = $('#taskModal');
  const modalTitle = $('#modalTitle');
  const modalDescription = $('#modalDescription');
  
  if (!modal || !modalTitle || !modalDescription) return;
  
  const taskDef = TASK_DEFINITIONS[taskKey];
  if (!taskDef) {
    console.warn('Task definition not found:', taskKey);
    return;
  }
  
  // Set modal content
  modalTitle.textContent = taskDef.title;
  modalDescription.innerHTML = taskDef.description;
  
  // Initialize subtask checkboxes
  const subtaskCheckboxes = modalDescription.querySelectorAll('.subtask-checkbox');
  subtaskCheckboxes.forEach(checkbox => {
    const step = checkbox.getAttribute('data-step');
    const [week, task] = taskKey.split('-', 2);
    const taskStateKey = `${week}-${task}`;
    
    if (taskStates.has(taskStateKey)) {
      const taskState = taskStates.get(taskStateKey);
      checkbox.checked = taskState.subtasks[step] || false;
    }
    
    // Add event listener for subtask changes
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      updateTaskProgress(week, task, e.target.checked, step);
    });
  });
  
  // Position modal near click location instead of center
  modal.style.display = 'flex';
  modal.style.opacity = '0';
  modal.style.alignItems = 'flex-start';
  modal.style.justifyContent = 'flex-start';
  modal.style.paddingTop = '2rem';
  
  if (clickEvent && clickEvent.clientY) {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const modalContent = modal.querySelector('.modal-content');
    
    // Position modal near click location but ensure it's visible
    const targetY = Math.max(20, Math.min(clickEvent.clientY + scrollY - 100, window.innerHeight - 400));
    
    modalContent.style.marginTop = `${targetY}px`;
    modalContent.style.marginLeft = '2rem';
    modalContent.style.marginRight = '2rem';
  }
  
  // Animate modal in
  requestAnimationFrame(() => {
    modal.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    modal.style.opacity = '1';
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.transform = 'translateY(-20px) scale(0.95)';
    modalContent.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
    
    requestAnimationFrame(() => {
      modalContent.style.transform = 'translateY(0) scale(1)';
    });
  });
};

// Enhanced modal close functionality
const closeTaskModal = () => {
  const modal = $('#taskModal');
  if (!modal) return;
  
  const modalContent = modal.querySelector('.modal-content');
  modalContent.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  modalContent.style.transform = 'translateY(-20px) scale(0.95)';
  modalContent.style.opacity = '0';
  
  modal.style.transition = 'opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  modal.style.opacity = '0';
  
  setTimeout(() => {
    modal.style.display = 'none';
    modalContent.style.transform = '';
    modalContent.style.opacity = '';
    modalContent.style.marginTop = '';
    modalContent.style.marginLeft = '';
    modalContent.style.marginRight = '';
  }, 300);
};

// ===================================================================
// 8. DATA LOADING & PERSISTENCE
// ===================================================================

// ENHANCED: Load progress with hierarchical checkbox support
const loadProgress = async () => {
  try {
    const response = await fetch('/api/progress', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('Failed to load progress');
    
    const progress = await response.json();
    
    // Initialize task states from backend
    Object.keys(TASK_STRUCTURE).forEach(week => {
      const weekProgress = progress[week] || {};
      
      TASK_STRUCTURE[week].tasks.forEach(taskId => {
        const taskKey = `${week}-${taskId}`;
        const taskProgress = weekProgress[taskId];
        
        if (taskProgress) {
          taskStates.set(taskKey, {
            completed: taskProgress.completed || false,
            subtasks: taskProgress.subtasks || {}
          });
        } else {
          taskStates.set(taskKey, {
            completed: false,
            subtasks: {}
          });
        }
      });
    });
    
    // Update UI to reflect loaded progress
    updateCheckboxStates();
    updateProgressDisplay();
    
  } catch (error) {
    console.error('Progress load error:', error);
    showNotification('Failed to load progress data', 'error');
  }
};

// Update checkbox states from loaded progress
const updateCheckboxStates = () => {
  taskStates.forEach((taskState, taskKey) => {
    const [week, task] = taskKey.split('-', 2);
    
    // Update main checkbox
    const mainCheckbox = document.querySelector(`input[data-week="${week}"][data-task="${task}"]`);
    if (mainCheckbox) {
      mainCheckbox.checked = taskState.completed;
    }
    
    // Update subtask checkboxes in any open modals
    Object.entries(taskState.subtasks).forEach(([step, completed]) => {
      const subtaskCheckbox = document.querySelector(`[data-task="${task}"] [data-step="${step}"]`);
      if (subtaskCheckbox) {
        subtaskCheckbox.checked = completed;
      }
    });
  });
};

// ===================================================================
// 9. LAB MANAGEMENT
// ===================================================================

// Lab History Management
const startNewLab = async () => {
  try {
    if (!confirm('Are you sure you want to start a new lab? This will reset all your current progress and save your existing progress to history.')) {
      return;
    }
    
    const response = await fetch('/api/lab/start-new', {
      method: 'POST',
      credentials: 'same-origin'
    });
    
    if (!response.ok) throw new Error('Failed to start new lab');
    
    const result = await response.json();
    
    // Reset local state
    taskStates.clear();
    updateProgressDisplay();
    updateCheckboxStates();
    
    showNotification('🚀 New lab started! Your previous progress has been saved to history.', 'success', 5000);
    
    // Reload page to show fresh state
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('Start new lab error:', error);
    showNotification('Failed to start new lab. Please try again.', 'error');
  }
};

// ===================================================================
// 10. FORM HANDLING
// ===================================================================

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

// ===================================================================
// 11. INITIALIZATION FUNCTIONS
// ===================================================================

// Dashboard initialization
const initDashboard = () => {
  // Load progress data
  loadProgress();
  
  // Setup task click handlers with enhanced UX
  const tasks = document.querySelectorAll('.task');
  tasks.forEach(task => {
    const week = task.getAttribute('data-week');
    const taskId = task.getAttribute('data-task');
    const taskKey = `${week}-${taskId}`;
    
    // Make task clickable to open modal
    task.addEventListener('click', (e) => {
      // Don't open modal if clicking on checkbox
      if (e.target.type === 'checkbox') return;
      
      openTaskModal(taskKey, e);
    });
    
    // Setup main checkbox handler
    const checkbox = task.querySelector('input[type="checkbox"]');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation();
        updateTaskProgress(week, taskId, e.target.checked);
      });
    }
  });
  
  // Setup week animations
  setupWeekAnimations();
  
  // Setup lab restart button if it exists
  const restartButton = $('#restartLabBtn');
  if (restartButton) {
    restartButton.addEventListener('click', startNewLab);
  }
};

// Week animations for progressive disclosure
const setupWeekAnimations = () => {
  const weeks = document.querySelectorAll('.week');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
      }
    });
  }, observerOptions);
  
  weeks.forEach(week => {
    observer.observe(week);
  });
};

// Initialize user info display
const initUserInfo = () => {
  const userInfo = $('#userInfo');
  const adminLink = $('#adminLink');
  
  if (userInfo) {
    const user = JSON.parse(getCookie('user') || '{}');
    if (user.name) {
      userInfo.textContent = `Welcome, ${user.name}`;
      if (user.role === 'admin' && adminLink) {
        adminLink.style.display = 'inline';
      }
    }
  }
};

// Initialize login form
const initLoginForm = () => {
  const loginForm = $('#loginForm');
  if (!loginForm) return;
  
  addFormEnhancements(loginForm);
  
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(loginForm, '/api/login');
  });
};

// Initialize registration form
const initRegisterForm = () => {
  const registerForm = $('#registerForm');
  if (!registerForm) return;
  
  addFormEnhancements(registerForm);
  
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleFormSubmit(registerForm, '/api/register', true);
  });
};

// Initialize profile password form
const initProfilePasswordForm = () => {
  const passwordForm = $('#passwordForm');
  if (!passwordForm) return;
  
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData(passwordForm);
      const token = await fetchCSRFToken();
      if (!token) return;
      formData.set('csrf_token', token);

      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin',
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to change password');

      showNotification('Password updated successfully', 'success');
      passwordForm.reset();
      
    } catch (error) {
      console.error('Password change error:', error);
      showNotification(error.message || 'Failed to change password', 'error');
    }
  });
};

// Initialize admin functionality
const initAdmin = () => {
  console.log('Admin panel initialized');
  // Admin-specific functionality can be added here
};

// Initialize profile functionality
const initProfile = () => {
  console.log('Profile page initialized');
  // Profile-specific functionality can be added here
};

// Add form enhancements
const addFormEnhancements = (form) => {
  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('focus', (e) => {
      e.target.parentElement.style.transform = 'translateY(-1px)';
    });
    
    input.addEventListener('blur', (e) => {
      e.target.parentElement.style.transform = '';
    });
  });
};

// Setup password toggle functionality
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

// Setup logout functionality
const setupLogout = () => {
  const logoutBtn = $('#logout');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });

      if (response.ok) {
        deleteCookie('user');
        showNotification('Logged out successfully', 'success', 2000);
        
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Even on error, clear local state and redirect
      deleteCookie('user');
      window.location.href = '/index.html';
    }
  });
};

// Setup modal handlers
const setupModalHandlers = () => {
  // Close modal when clicking close button
  const closeModal = $('#closeModal');
  if (closeModal) {
    closeModal.addEventListener('click', closeTaskModal);
  }
  
  // Close modal when clicking outside
  const modal = $('#taskModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeTaskModal();
      }
    });
  }
};

// Enhanced keyboard shortcuts
const setupKeyboardShortcuts = () => {
  document.addEventListener('keydown', (e) => {
    // Escape to close modals
    if (e.key === 'Escape') {
      const modal = document.querySelector('.modal[style*="display: flex"]');
      if (modal) {
        closeTaskModal();
      }
    }
    
    // Ctrl/Cmd + K for quick search (if implemented)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      // Could implement quick task search here
    }
  });
};

// ===================================================================
// 12. ACCESSIBILITY ENHANCEMENTS
// ===================================================================

const enhanceAccessibility = () => {
  // Add ARIA labels for dynamic content
  const progressBar = $('#progressBar');
  if (progressBar) {
    progressBar.setAttribute('role', 'progressbar');
    progressBar.setAttribute('aria-label', 'Training progress');
  }
  
  // Add skip links
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  // Enhance modal accessibility
  const modal = $('#taskModal');
  if (modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modalTitle');
  }
};

// ===================================================================
// 13. PERFORMANCE OPTIMIZATIONS
// ===================================================================

// Debounced progress updates
const debouncedProgressUpdate = debounce(updateProgressDisplay, 150);

// ===================================================================
// 14. ERROR HANDLING
// ===================================================================

// Global error handler for better user experience
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('An unexpected error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('An unexpected error occurred. Please try again.', 'error');
});

// ===================================================================
// 15. MAIN APPLICATION INITIALIZATION
// ===================================================================

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Velocity Lab - Initializing application...');
  
  // Core initialization
  initUserInfo();
  enhanceAccessibility();
  
  // Form initialization
  initLoginForm();
  initRegisterForm();
  initProfilePasswordForm();
  
  // Page-specific initialization
  if (window.location.pathname.includes('dashboard')) {
    console.log('📊 Initializing dashboard...');
    initDashboard();
  }
  
  if (window.location.pathname.includes('admin')) {
    console.log('⚙️ Initializing admin panel...');
    initAdmin();
  }
  
  if (window.location.pathname.includes('profile')) {
    console.log('👤 Initializing profile page...');
    initProfile();
  }
  
  // UI enhancements
  setupPasswordToggle();
  setupLogout();
  setupModalHandlers();
  setupKeyboardShortcuts();
  
  console.log('✅ Velocity Lab - Application initialized successfully!');
});

// ===================================================================
// 16. ADVANCED FEATURES & UTILITIES
// ===================================================================

// Performance monitoring
const trackPerformance = () => {
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log(`Page load time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
  }
};

// Service worker registration for offline capability
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered successfully:', registration.scope);
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
};

// Theme management
const initThemeManagement = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Auto-detect based on system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
};

// Initialize advanced features after DOM load
document.addEventListener('DOMContentLoaded', () => {
  trackPerformance();
  initThemeManagement();
  
  // Register service worker for production
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    registerServiceWorker();
  }
});

// ===================================================================
// 17. ANALYTICS & TRACKING
// ===================================================================

// Custom analytics for task completion tracking
const trackTaskCompletion = (taskKey, completed) => {
  // This could integrate with analytics services
  console.log(`Task ${completed ? 'completed' : 'unchecked'}: ${taskKey}`);
  
  // Example: Send to analytics service
  if (typeof gtag !== 'undefined') {
    gtag('event', completed ? 'task_completed' : 'task_unchecked', {
      'task_id': taskKey,
      'event_category': 'lab_progress'
    });
  }
};

// ===================================================================
// 18. EXPORT FOR TESTING & MODULE USAGE
// ===================================================================

// Export functions for use in other scripts or testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showNotification,
    updateTaskProgress,
    startNewLab,
    formatDate,
    openTaskModal,
    closeTaskModal,
    loadProgress,
    TASK_STRUCTURE,
    TASK_DEFINITIONS,
    TOTAL_TASKS
  };
}

// Also expose to global scope for browser console debugging
if (typeof window !== 'undefined') {
  window.VelocityLab = {
    showNotification,
    updateTaskProgress,
    startNewLab,
    formatDate,
    openTaskModal,
    closeTaskModal,
    loadProgress,
    TASK_STRUCTURE,
    TASK_DEFINITIONS,
    TOTAL_TASKS,
    taskStates
  };
}

// ===================================================================
// 19. DEVELOPMENT HELPERS
// ===================================================================

// Development mode helpers (only available in development)
if (process?.env?.NODE_ENV === 'development' || location.hostname === 'localhost') {
  
  // Helper to complete all tasks for testing
  window.completeAllTasks = () => {
    Object.keys(TASK_STRUCTURE).forEach(week => {
      TASK_STRUCTURE[week].tasks.forEach(task => {
        updateTaskProgress(week, task, true);
      });
    });
    showNotification('All tasks completed for testing!', 'success');
  };
  
  // Helper to reset all progress
  window.resetAllProgress = () => {
    taskStates.clear();
    updateProgressDisplay();
    updateCheckboxStates();
    showNotification('All progress reset for testing!', 'warning');
  };
  
  // Helper to show all task definitions
  window.showTaskStructure = () => {
    console.table(TASK_STRUCTURE);
    console.log('Total tasks:', TOTAL_TASKS);
  };
  
  console.log('🔧 Development helpers available: completeAllTasks(), resetAllProgress(), showTaskStructure()');
}

// ===================================================================
// 20. FINAL SETUP & READY STATE
// ===================================================================

// Signal that the application is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.add('app-loaded');
    console.log('🎯 Velocity Lab - Ready for Exchange Hybrid Migration Training!');
  }, 100);
});