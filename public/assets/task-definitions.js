// Complete Task Definitions for all 42 tasks
const TASK_DEFINITIONS = {
  // Week 1 - Foundation Setup (12 tasks)
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
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=hBuCOf4ht9o&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=2" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Install Active Directory Domain Controller on Windows Server 2019
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-active-directory-domain-services" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Install Active Directory Domain Services
          </a>
        </li>
      </ul>
    `
  },

  'week1-register-public-domain': {
    title: 'Register Public Domain for Hybrid Deployment',
    description: `
      <p><strong>⚠️ CRITICAL: Exchange hybrid deployments require a real public domain, NOT .local domains!</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Choose a domain registrar (Namecheap, GoDaddy, or free options like Freenom)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Register a public domain (e.g., velocitylab.com, velocitylab.tk, etc.)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Note your public domain name for use throughout the lab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Access your domain's DNS management panel</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Note your current public IP address (whatismyipaddress.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Keep DNS management tab open for later configuration</label>
        </div>
      </div>
      <h3>⚠️ Why .local Domains Don't Work</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • .local domains are not routable on the internet<br>
        • Cannot be verified in Microsoft 365<br>
        • Autodiscover fails for external clients<br>
        • Hybrid configuration wizard will fail<br>
        • Federation and free/busy won't work
      </p>
      <h3>💡 Domain Options</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Free: Freenom (.tk, .ml, .ga, .cf domains)<br>
        • Cheap: Namecheap, GoDaddy (.com from $8-12/year)<br>
        • Consider: .com, .net, .org for professional look<br>
        • Avoid: .local, .internal, or any non-public TLD
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.freenom.com/" target="_blank" style="color: var(--primary); text-decoration: none;">
            🌐 Freenom - Free Domain Registration
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/add-domain-office-365-tenant/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Add domain to Office 365 tenant - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/microsoft-365/admin/setup/add-domain" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Add a domain to Microsoft 365
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
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/networking/technologies/ipam/ipam-top" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: IP Address Management (IPAM)
          </a>
        </li>
      </ul>
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
      <h3>📚 Why AD DS is Required for Exchange</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        Exchange Server relies heavily on Active Directory for:<br>
        • User authentication and authorization<br>
        • Global Address List (GAL) functionality<br>
        • Distribution groups and mail-enabled security groups<br>
        • Configuration data storage<br>
        • Site and routing topology
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=Ye4kGuKnXqQ&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Why Active Directory is required for Exchange Server
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Active Directory Domain Services Overview
          </a>
        </li>
      </ul>
    `
  },

  'week1-promote-to-dc': {
    title: 'Promote Server to Domain Controller',
    description: `
      <p><strong>Create a new Active Directory forest using your PUBLIC domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In Server Manager, click the flag icon and "Promote this server to a domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Select "Add a new forest" and enter your PUBLIC domain (e.g., velocitylab.com)</label>
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
      <h3>⚠️ Domain Naming Critical Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • MUST use your registered public domain (e.g., velocitylab.com)<br>
        • DO NOT use .local - this breaks Exchange hybrid<br>
        • This domain will be added to Microsoft 365 later<br>
        • Document your DSRM password securely
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=hBuCOf4ht9o&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=2" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Install Active Directory Domain Controller on Windows Server 2019
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-new-windows-server-2012-active-directory-forest" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Install a New Active Directory Forest
          </a>
        </li>
      </ul>
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
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=Q_1RLwyLwaE&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=3" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Domain Name System (DNS) management | Exchange Server 2019
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-top" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Domain Name System (DNS)
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
          <label>4. Set UPN suffix to your public domain (@yourpublicdomain.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set passwords to never expire for lab purposes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Create security groups: IT-Staff, Sales-Team, Finance-Dept</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Add users to appropriate groups</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Create an Exchange Admin account for future use</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Document all usernames and passwords created</label>
        </div>
      </div>
      <h3>💡 User Creation Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use a consistent naming convention (firstname.lastname)<br>
        • Set UPN to match your public domain for hybrid<br>
        • Create service accounts for Exchange later<br>
        • Use groups for permissions, not individual users
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/change-users-upn-with-powershell/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Change Users UPN with PowerShell - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-default-user-accounts" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Active Directory User Account Management
          </a>
        </li>
      </ul>
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
          <label>6. Verify DNS resolution: nslookup yourpublicdomain.com</label>
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
          <label>4. Select "Domain" and enter your domain name (yourpublicdomain.com)</label>
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
          <label>7. After restart, login with domain account (DOMAIN\\username)</label>
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
          <label>1. On DC, create folder C:\\SharedData\\HiddenShare</label>
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
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Right-click new GPO, select Edit</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Navigate to User Configuration > Preferences > Windows Settings > Drive Maps</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Right-click, New > Mapped Drive. Action: Create, Location: \\\\DC01\\HiddenShare$, Drive Letter: H:</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Check "Reconnect" and set label to "Hidden Share (GPO)"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. On Common tab, check "Run in logged-on user's security context"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Link GPO to domain or specific OU</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. On client, run gpupdate /force and log off/on to test</label>
        </div>
      </div>
      <h3>🎯 GPO Drive Mapping Benefits</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Centrally managed drive mappings<br>
        • Can target specific users/groups/computers<br>
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
          <label>1. Create batch script in SYSVOL: \\\\yourdomain.com\\SYSVOL\\yourdomain.com\\scripts\\mapdrive.bat</label>
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
          <label>4. Add PS command: New-PSDrive -Name "J" -PSProvider FileSystem -Root "\\\\DC01\\HiddenShare$" -Persist</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. In ADUC, edit user properties > Profile tab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set Logon script to mapdrive.bat</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create GPO for PowerShell script execution</label>
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
          <label>4. Add specific users to the group (not all domain users)</label>
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

  // Week 2 - Infrastructure Expansion (8 tasks)
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
          <label>1. Install AD DS role on DC02 via Server Manager</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Click "Promote this server to a domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Select "Add a domain controller to an existing domain"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Enter domain name and domain admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Select both DNS server and Global Catalog options</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set DSRM password (can be same as DC01)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Choose "Replicate from: Any domain controller"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Complete installation and verify replication</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Update DC01 DNS to include DC02 as secondary</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Test AD replication: repadmin /replsummary</label>
        </div>
      </div>
      <h3>✅ Verification Steps</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Check Event Viewer for replication errors<br>
        • Verify DNS zones replicated to DC02<br>
        • Test user authentication against DC02<br>
        • Run dcdiag on both DCs
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/install-a-replica-windows-server-2012-domain-controller-in-an-existing-domain" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Install a Replica Domain Controller
          </a>
        </li>
      </ul>
    `
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
        • Update approval workflow<br>
        • Reporting on update compliance<br>
        • Critical for Exchange updates
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-update-services/get-started/windows-server-update-services-wsus" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Windows Server Update Services (WSUS)
          </a>
        </li>
      </ul>
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
          <label>1. Launch WSUS console from Server Manager > Tools</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Complete WSUS Configuration Wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Choose "Synchronize from Microsoft Update"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select products: Windows Server 2012 R2, 2016, 2019, Windows 10/11</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Classifications: Critical, Security, Definition Updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set sync schedule: Daily at 3:00 AM</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Begin initial synchronization (may take hours)</label>
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
    `
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
          <label>7. Set install time to 3:00 AM</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Enable "Enable client-side targeting" - Set target group (Workstations or Servers)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Link GPO to domain root</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. On clients: gpupdate /force, then wuauclt /detectnow</label>
        </div>
      </div>
      <h3>✅ Verification</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Check WSUS console for client check-ins<br>
        • Review WindowsUpdate.log on clients<br>
        • Verify registry: HKLM\\Software\\Policies\\Microsoft\\Windows\\WindowsUpdate<br>
        • Test update installation on test machine
      </p>
    `
  },

  'week2-configure-primary-time': {
    title: 'Configure Primary Time Server (PDC Emulator)',
    description: `
      <p><strong>Set up authoritative time synchronization for your domain.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Identify PDC Emulator: netdom query fsmo</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. On PDC (usually DC01), open elevated command prompt</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Stop Windows Time service: net stop w32time</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Configure external time source: w32tm /config /syncfromflags:manual /manualpeerlist:"0.pool.ntp.org 1.pool.ntp.org 2.pool.ntp.org" /reliable:yes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Start Windows Time service: net start w32time</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Force sync: w32tm /resync /nowait</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify configuration: w32tm /query /configuration</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Check sync status: w32tm /query /status</label>
        </div>
      </div>
      <h3>🕐 Time Sync Hierarchy</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • PDC Emulator syncs with external NTP<br>
        • Other DCs sync from PDC Emulator<br>
        • Domain members sync from any DC<br>
        • Critical for Kerberos authentication (5-minute tolerance)
      </p>
    `
  },

  'week2-configure-secondary-time': {
    title: 'Configure Secondary Domain Controller Time Sync',
    description: `
      <p><strong>Ensure secondary DC properly synchronizes time with PDC Emulator.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On DC02, open elevated command prompt</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Configure to sync from domain hierarchy: w32tm /config /syncfromflags:domhier /update</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Restart time service: net stop w32time && net start w32time</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Force resync: w32tm /resync /nowait</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Verify source: w32tm /query /source (should show DC01)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check all DCs time: w32tm /monitor /domain:yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure clients via GPO to use NT5DS (domain hierarchy)</label>
        </div>
      </div>
      <h3>⚠️ Common Issues</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Firewall blocking UDP 123 (NTP)<br>
        • Incorrect DNS resolution<br>
        • PDC Emulator role moved<br>
        • Virtual machine time sync conflicts
      </p>
    `
  },

  'week2-test-infrastructure': {
    title: 'Test Infrastructure Redundancy and Services',
    description: `
      <p><strong>Verify all Week 2 infrastructure is functioning correctly.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test DC failover: Shut down DC01, verify authentication still works</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Check DNS resolution from clients with DC01 offline</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Verify WSUS clients checking in from both servers and workstations</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Test time synchronization across all systems (within 5 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Review AD replication status: repadmin /showrepl</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check Event Viewer on both DCs for errors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify Group Policy application on all systems</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Document any issues found and resolve before proceeding</label>
        </div>
      </div>
      <h3>✅ Infrastructure Checklist</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        ✓ Two functioning domain controllers<br>
        ✓ DNS redundancy configured<br>
        ✓ WSUS operational with clients<br>
        ✓ Time synchronization working<br>
        ✓ AD replication healthy<br>
        ✓ Ready for Exchange deployment!
      </p>
    `
  },

  // Week 3 - Email & Messaging (12 tasks)
  'week3-backup-servers': {
    title: 'Backup Servers Before Upgrade',
    description: `
      <p><strong>Create backups before upgrading to Windows Server 2016.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install Windows Server Backup feature on both DCs</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create backup location (external drive or network share)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Perform System State backup of DC01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Perform System State backup of DC02</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Backup all GPOs: Backup-GPO -All -Path C:\\GPOBackup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Export DHCP configuration if applicable</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Document server configurations and IP settings</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Take VM snapshots if in virtual environment</label>
        </div>
      </div>
      <h3>🔐 Backup Best Practices</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Always backup before major changes<br>
        • Test restore procedures<br>
        • Keep backups in separate location<br>
        • Document backup passwords<br>
        • Verify backup integrity
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://learn.microsoft.com/en-us/windows-server/administration/windows-server-backup/windows-server-backup-cmdlets-in-windows-powershell" target="_blank" style="color: var(--primary); text-decoration: none;">
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
          <label>1. Transfer FSMO roles to DC02 temporarily: Move-ADDirectoryServerOperationMasterRole</label>
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
          <label>4. Choose "Download updates" option</label>
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
          <label>7. Verify DC services started: dcdiag /v</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Install latest Windows Server 2016 updates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test AD replication and DNS</label>
        </div>
      </div>
      <h3>⚠️ Upgrade Considerations</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Cannot upgrade from 2012 to 2019 directly<br>
        • 2016 is required stepping stone<br>
        • Ensure 20GB free space minimum<br>
        • Plan for 2-3 hour maintenance window
      </p>
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
          <label>1. Verify DC01 is fully functional after upgrade</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Transfer FSMO roles back to DC01 if needed</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Mount Windows Server 2016 ISO on DC02</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run in-place upgrade following same process as DC01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Complete upgrade and restart</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify WSUS service is still functional</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Run dcdiag on both domain controllers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test replication: repadmin /replsummary</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Update both DCs with latest patches via WSUS</label>
        </div>
      </div>
      <h3>✅ Post-Upgrade Checklist</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        ✓ Both DCs on Server 2016<br>
        ✓ AD replication working<br>
        ✓ DNS resolution functional<br>
        ✓ WSUS service operational<br>
        ✓ All services green in Server Manager
      </p>
    `
  },

  'week3-raise-functional-levels': {
    title: 'Raise Domain and Forest Functional Levels',
    description: `
      <p><strong>Update functional levels to enable Server 2016 features for Exchange 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify all DCs are Server 2016: Get-ADDomainController -Filter *</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Open Active Directory Domains and Trusts</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Right-click domain name, select "Raise Domain Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Windows Server 2016" and click Raise</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Wait for replication (15 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Right-click root, select "Raise Forest Functional Level"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Select "Windows Server 2016" and confirm</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify levels: Get-ADDomain | fl Name, DomainMode</label>
        </div>
      </div>
      <h3>⚠️ Important Note</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • This is irreversible - cannot lower functional levels<br>
        • Exchange 2019 requires minimum Server 2012 R2 FL<br>
        • Enables Privileged Access Management features<br>
        • Required for modern authentication support
      </p>
    `
  },

  'week3-prepare-exchange-server': {
    title: 'Prepare New Server for Exchange 2019',
    description: `
      <p><strong>Deploy and configure a new Windows Server 2016/2019 for Exchange installation.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Create new VM: 8GB RAM minimum (16GB recommended), 100GB disk</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Windows Server 2016 or 2019 with Desktop Experience</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Configure static IP (e.g., 192.168.1.20)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Set DNS to both domain controllers</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Rename server to EX01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Join to domain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure Windows Firewall for domain profile</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Install all Windows Updates via WSUS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Configure page file: 1.5x RAM (12GB for 8GB RAM)</label>
        </div>
      </div>
      <h3>💻 Exchange 2019 Requirements</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Windows Server 2019 Core or Desktop Experience<br>
        • Minimum 8GB RAM (Mailbox role)<br>
        • .NET Framework 4.8<br>
        • Visual C++ Redistributables<br>
        • 30GB free disk space minimum
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=dKbelH9IFPc&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=4" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Exchange Server Architecture | What is new in Exchange 2019
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/system-requirements" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Exchange Server System Requirements
          </a>
        </li>
      </ul>
    `
  },

  'week3-install-exchange-prereqs': {
    title: 'Install Exchange 2019 Prerequisites',
    description: `
      <p><strong>Install all required Windows features and software prerequisites for Exchange.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Install .NET Framework 4.8 (restart required)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install Visual C++ Redistributable 2012 (x64)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Install Visual C++ Redistributable 2013 (x64)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Install IIS URL Rewrite Module</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Run PowerShell as Admin and install Windows features:</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Install-WindowsFeature Server-Media-Foundation, NET-Framework-45-Features, RPC-over-HTTP-proxy, RSAT-Clustering, RSAT-Clustering-CmdInterface, RSAT-Clustering-Mgmt, RSAT-Clustering-PowerShell, WAS-Process-Model, Web-Asp-Net45, Web-Basic-Auth, Web-Client-Auth, Web-Digest-Auth, Web-Dir-Browsing, Web-Dyn-Compression, Web-Http-Errors, Web-Http-Logging, Web-Http-Redirect, Web-Http-Tracing, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Lgcy-Mgmt-Console, Web-Metabase, Web-Mgmt-Console, Web-Mgmt-Service, Web-Net-Ext45, Web-Request-Monitor, Web-Server, Web-Stat-Compression, Web-Static-Content, Web-Windows-Auth, Web-WMI, Windows-Identity-Foundation, RSAT-ADDS</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Restart server after features installation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Download Exchange 2019 CU (latest Cumulative Update)</label>
        </div>
      </div>
      <h3>💡 Prerequisites Script</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># One-liner for all Windows features
Install-WindowsFeature -Name Server-Media-Foundation, NET-Framework-45-Features, RPC-over-HTTP-proxy, RSAT-Clustering, RSAT-Clustering-CmdInterface, RSAT-Clustering-Mgmt, RSAT-Clustering-PowerShell, WAS-Process-Model, Web-Asp-Net45, Web-Basic-Auth, Web-Client-Auth, Web-Digest-Auth, Web-Dir-Browsing, Web-Dyn-Compression, Web-Http-Errors, Web-Http-Logging, Web-Http-Redirect, Web-Http-Tracing, Web-ISAPI-Ext, Web-ISAPI-Filter, Web-Lgcy-Mgmt-Console, Web-Metabase, Web-Mgmt-Console, Web-Mgmt-Service, Web-Net-Ext45, Web-Request-Monitor, Web-Server, Web-Stat-Compression, Web-Static-Content, Web-Windows-Auth, Web-WMI, Windows-Identity-Foundation, RSAT-ADDS -Restart</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=efzVDdBYHIs&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=5" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 System requirements and prerequisites for Exchange 2019 installation
          </a>
        </li>
        <li>
          <a href="https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 MS Learn: Exchange Server Prerequisites
          </a>
        </li>
      </ul>
    `
  },

  'week3-extend-ad-schema': {
    title: 'Extend Active Directory Schema for Exchange',
    description: `
      <p><strong>Prepare Active Directory for Exchange 2019 by extending the schema.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Log into DC01 as Schema Admin (Enterprise Admin)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Copy Exchange 2019 setup files to DC01</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Open elevated Command Prompt, navigate to Exchange setup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Run: Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Wait for schema extension (5-10 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Run: Setup.exe /PrepareAD /OrganizationName:"Velocity Lab" /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Run: Setup.exe /PrepareDomain /IAcceptExchangeServerLicenseTerms_DiagnosticDataOFF</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Wait for AD replication across all DCs (15-30 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Verify: Get-ADObject -Filter {name -eq "Exchange Security Groups"}</label>
        </div>
      </div>
      <h3>⚠️ Schema Extension Notes</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • This is irreversible - backup AD first!<br>
        • Must be Schema Admin to run<br>
        • Creates Exchange security groups<br>
        • Adds Exchange attributes to AD objects<br>
        • Required before Exchange installation
      </p>
    `
  },

  'week3-install-exchange-2019': {
    title: 'Install Exchange Server 2019',
    description: `
      <p><strong>Perform the actual Exchange 2019 installation with Mailbox role.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Log into EX01 as Domain Admin</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Mount Exchange 2019 ISO or extract setup files</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Run Setup.exe as Administrator</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose "Don't check for updates" for lab</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Accept license terms and choose not to send diagnostic data</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Select "Mailbox role" (only option in 2019)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Choose installation path (default C:\\Program Files\\Microsoft\\Exchange Server\\V15)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Disable Malware Scanning for initial install</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Click Install and wait (30-60 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Restart server when installation completes</label>
        </div>
      </div>
      <h3>🎯 Installation Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Installation takes 30-60 minutes<br>
        • Requires multiple automatic restarts<br>
        • Creates default mailbox database<br>
        • Installs Exchange Management Shell<br>
        • Sets up IIS for client access
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.youtube.com/watch?v=7TmzXHY8LXw&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=6" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Install Microsoft Exchange 2019 on Windows Server 2019
          </a>
        </li>
      </ul>
    `
  },

  'week3-configure-exchange-basic': {
    title: 'Configure Exchange Basic Settings',
    description: `
      <p><strong>Complete post-installation configuration of Exchange 2019.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Exchange Admin Center (EAC): https://localhost/ecp</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Login with domain\\administrator account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Navigate to Servers > Certificates, create new self-signed certificate</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Assign certificate to IIS and SMTP services</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure Virtual Directories with internal URLs (https://ex01.yourdomain.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Set Outlook Anywhere internal hostname</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create Accepted Domain for yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure default email address policy</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Install Exchange CU if not already on latest</label>
        </div>
      </div>
      <h3>💡 Configuration Commands</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># Set Virtual Directory URLs (run in Exchange Management Shell)
$hostname = "ex01.yourdomain.com"
Set-OWAVirtualDirectory -Identity "EX01\owa (Default Web Site)" -InternalUrl "https://$hostname/owa"
Set-ECPVirtualDirectory -Identity "EX01\ecp (Default Web Site)" -InternalUrl "https://$hostname/ecp"
Set-OABVirtualDirectory -Identity "EX01\OAB (Default Web Site)" -InternalUrl "https://$hostname/oab"
Set-WebServicesVirtualDirectory -Identity "EX01\EWS (Default Web Site)" -InternalUrl "https://$hostname/ews/exchange.asmx"
Set-ActiveSyncVirtualDirectory -Identity "EX01\Microsoft-Server-ActiveSync (Default Web Site)" -InternalUrl "https://$hostname/Microsoft-Server-ActiveSync"</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.youtube.com/watch?v=J_ZD-fZW-_k&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=7" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Configure Exchange 2019 post installation | Configure Internal and External URLs
          </a>
        </li>
      </ul>
    `
  },

  'week3-create-mailboxes': {
    title: 'Create User Mailboxes',
    description: `
      <p><strong>Create mailboxes for existing Active Directory users.</strong></p>
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
          <label>3. Click + and select "User mailbox"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Select "Existing user" and browse for John Smith</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Set alias and select mailbox database</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Repeat for Jane Doe and Bob Johnson</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Create a shared mailbox: Info@yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Create a room mailbox: Conference Room A</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Set mailbox quotas: Warning 1GB, Prohibit Send 1.5GB, Prohibit Send/Receive 2GB</label>
        </div>
      </div>
      <h3>📧 PowerShell Alternative</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># Create mailboxes via PowerShell
Enable-Mailbox -Identity "John Smith" -Database "Mailbox Database 1"
Enable-Mailbox -Identity "Jane Doe" -Database "Mailbox Database 1"
Enable-Mailbox -Identity "Bob Johnson" -Database "Mailbox Database 1"

# Create shared mailbox
New-Mailbox -Name "Info" -Shared -PrimarySmtpAddress info@yourdomain.com

# Create room mailbox
New-Mailbox -Name "Conference Room A" -Room</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=ca0qoxRSlg0&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=9" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Recipient types in Exchange 2019 | Create and manage recipients
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/watch?v=q2dwO7nXhos&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=8" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 How to create and manage Mailbox Database in Exchange Server 2019
          </a>
        </li>
      </ul>
    `
  },

  'week3-test-mailbox-access': {
    title: 'Test Mailbox Access',
    description: `
      <p><strong>Verify users can access their mailboxes via Outlook and OWA.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On CLIENT01, open web browser</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Navigate to https://ex01/owa (accept certificate warning)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Login as domain\\john.smith</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Complete OWA initial setup wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Send test email to Jane Doe</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Configure Outlook client using Autodiscover</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test calendar sharing between users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Verify Global Address List (GAL) is populated</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test shared mailbox access permissions</label>
        </div>
      </div>
      <h3>🔍 Troubleshooting</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Certificate warnings are normal with self-signed<br>
        • Check IIS is running on Exchange server<br>
        • Verify DNS resolution for ex01<br>
        • Test-OutlookWebServices for diagnostics<br>
        • Check Event Viewer for errors
      </p>
    `
  },

  'week3-configure-internal-mailflow': {
    title: 'Configure Internal Mail Flow',
    description: `
      <p><strong>Set up connectors and transport rules for internal email delivery.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Open Exchange Admin Center > Mail flow</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Review default Receive connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Verify "Default Frontend" connector allows anonymous for future external mail</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create transport rule for disclaimer: "This email is for internal use only"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test mail flow between all mailboxes</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Check message tracking logs for delivery confirmation</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure anti-spam settings (basic)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Set up retention policies if needed</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Verify mail.que database location has sufficient space</label>
        </div>
      </div>
      <h3>📬 Mail Flow Architecture</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Frontend Transport: Receives SMTP connections<br>
        • Transport: Routes messages<br>
        • Mailbox Transport: Delivers to mailbox database<br>
        • All roles on single Exchange 2019 server<br>
        • Ready for external configuration next week
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=L_Uki4UUo3M&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=10" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Mail Flow and Transport Pipeline in Exchange Server 2019
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/watch?v=UWIUi9gI4HQ&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=17" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Message tracking in Exchange Server | How to trace emails
          </a>
        </li>
      </ul>
    `
  },

  // Week 4 - Cloud Integration (10 tasks)
  'week4-configure-external-dns': {
    title: 'Configure External DNS Records',
    description: `
      <p><strong>Set up public DNS records for external mail flow and autodiscover.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Access your domain registrar's DNS management for your public domain</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create MX record: Priority 10, points to mail.yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Create A record: mail.yourdomain.com → Your public IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create CNAME: autodiscover.yourdomain.com → mail.yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create SPF record: "v=spf1 ip4:YOUR_PUBLIC_IP -all"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Wait for DNS propagation (5-30 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Verify with nslookup from external network</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test DNS resolution: nslookup mail.yourdomain.com 8.8.8.8</label>
        </div>
      </div>
      <h3>🌐 DNS Record Summary</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code>Type    Name                    Value
MX      @                      10 mail.yourdomain.com
A       mail                   YOUR_PUBLIC_IP
CNAME   autodiscover           mail.yourdomain.com
TXT     @                      "v=spf1 ip4:YOUR_PUBLIC_IP -all"</code>
      </pre>
      <h3>💡 Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use your registered public domain, not .local<br>
        • Consider Cloudflare for free DNS hosting<br>
        • SPF helps prevent spoofing<br>
        • Add DKIM/DMARC later for better security
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/configure-spf-record-for-office-365/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Configure SPF record for Office 365 - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://www.alitajran.com/configure-dkim-record-for-office-365/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Configure DKIM record for Office 365 - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-setup-firewall-rules': {
    title: 'Configure Firewall Rules for Exchange',
    description: `
      <p><strong>Open required ports for external Exchange connectivity.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On your router/firewall, create port forwarding rules</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Forward TCP 25 (SMTP) to Exchange server internal IP</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Forward TCP 443 (HTTPS) for OWA/ECP/ActiveSync</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Forward TCP 80 (HTTP) for autodiscover redirect</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Forward TCP 587 (SMTP submission) for client sending</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. On Exchange server, verify Windows Firewall allows these ports</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test port 25: telnet mail.yourdomain.com 25 from external</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test port 443: https://mail.yourdomain.com/owa</label>
        </div>
      </div>
      <h3>🔥 Required Ports</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Port 25 (SMTP): Inbound mail from internet<br>
        • Port 443 (HTTPS): Client access (OWA, ActiveSync, Outlook)<br>
        • Port 80 (HTTP): Autodiscover redirects<br>
        • Port 587 (Submission): Authenticated SMTP for clients<br>
        • Port 143/993 (IMAP): Optional if using IMAP<br>
        • Port 110/995 (POP3): Optional if using POP3
      </p>
      <h3>⚠️ Security Warning</h3>
      <p style="background: var(--warning); color: white; padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Only open required ports<br>
        • Consider using a reverse proxy<br>
        • Implement rate limiting<br>
        • Monitor for attacks on port 25
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.alitajran.com/exchange-hybrid-firewall-ports/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Exchange Hybrid firewall ports - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-install-ssl-certificates': {
    title: 'Install SSL Certificates',
    description: `
      <p><strong>Replace self-signed certificate with a trusted SSL certificate.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Generate Certificate Request in EAC > Servers > Certificates</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Add Subject Name: mail.yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Add SANs: mail.yourdomain.com, autodiscover.yourdomain.com, yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Save CSR and submit to Let's Encrypt or other CA</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. For Let's Encrypt: Use win-acme or Certify The Web</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Complete domain validation (HTTP or DNS challenge)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Import completed certificate in EAC</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Assign certificate to IIS, SMTP, and IMAP services</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test: https://mail.yourdomain.com/owa (no certificate warning)</label>
        </div>
      </div>
      <h3>🔐 Let's Encrypt PowerShell</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># Using win-acme for Let's Encrypt
# Download from https://github.com/win-acme/win-acme
# Run wacs.exe and follow prompts
# Select IIS site, include SANs
# Auto-renews every 60 days</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li>
          <a href="https://www.youtube.com/watch?v=KkwWar5CiMg&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=12" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Install Lets Encrypt free SSL certificate in Exchange Server 2019
          </a>
        </li>
      </ul>
    `
  },

  'week4-configure-external-mailflow': {
    title: 'Configure External Mail Flow',
    description: `
      <p><strong>Set up Send and Receive connectors for external email.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In EAC, go to Mail flow > Send connectors</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Create new Send connector: "Internet Send Connector"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Type: Internet, Smart host: Leave empty for MX lookup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Address space: * (all domains), Cost: 1</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Source server: EX01, use external DNS lookup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Update Accepted Domains: Add yourdomain.com as Authoritative</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Update Email Address Policy to include @yourdomain.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Apply policy to create new email addresses for all users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test: Send email to external Gmail/Outlook.com</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Test: Receive email from external sender</label>
        </div>
      </div>
      <h3>📧 Testing Commands</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># Test mail flow from Exchange Management Shell
Send-MailMessage -From john@yourdomain.com -To external@gmail.com -Subject "Test" -Body "External mail test" -SmtpServer ex01

# Check mail queue
Get-Queue
Get-Message -Queue "Internet Send Connector"</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=MjXCzV_wL1I&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=11" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Configure external inbound and outbound email flow in Exchange Server 2019
          </a>
        </li>
        <li>
          <a href="https://www.youtube.com/watch?v=o2siD4goFwk&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=16" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Understanding Accepted Domains | How to add and configure additional domains
          </a>
        </li>
      </ul>
    `
  },

  'week4-setup-modern-auth': {
    title: 'Enable Modern Authentication',
    description: `
      <p><strong>Configure OAuth authentication for better security and Microsoft 365 compatibility.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Verify Exchange is on latest CU (Cumulative Update)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. In Exchange Management Shell, check current auth: Get-OrganizationConfig | fl OAuth*</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Enable OAuth: Set-OrganizationConfig -OAuth2ClientProfileEnabled $true</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Create Authorization server objects (will be configured by HCW)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Configure virtual directories for OAuth support</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. IISReset /noforce on Exchange server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test Outlook connectivity with modern auth enabled</label>
        </div>
      </div>
      <h3>🔑 Modern Auth Benefits</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Multi-factor authentication support<br>
        • Token-based authentication<br>
        • Required for hybrid modern features<br>
        • Better security than basic auth<br>
        • Seamless SSO with Microsoft 365
      </p>
    `
  },

  'week4-prepare-m365-tenant': {
    title: 'Prepare Microsoft 365 Tenant',
    description: `
      <p><strong>Set up Microsoft 365 tenant and prepare for hybrid configuration.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Sign up for Microsoft 365 trial (E3 or Business Premium)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Complete initial tenant setup wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Add and verify your custom domain (yourdomain.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Do NOT update MX records yet (keep pointing to on-premises)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Create a Global Admin account for hybrid setup</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Disable directory synchronization temporarily (if enabled)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. License the hybrid admin account with Exchange Online</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Note your tenant name: yourdomain.onmicrosoft.com</label>
        </div>
      </div>
      <h3>☁️ Tenant Preparation Tips</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Use a separate admin account for hybrid<br>
        • Don't create cloud users with same names yet<br>
        • Keep MX records pointing on-premises<br>
        • Verify all DNS records except MX<br>
        • 25 license E3 trial lasts 30 days
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/create-office-365-tenant/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Create an Office 365 trial tenant - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://www.alitajran.com/add-domain-office-365-tenant/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Add domain to Office 365 tenant - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-install-aad-connect': {
    title: 'Install Azure AD Connect',
    description: `
      <p><strong>Set up directory synchronization between on-premises AD and Microsoft 365.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Download Azure AD Connect from Microsoft Download Center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Install on DC01 or dedicated sync server</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Launch Azure AD Connect wizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Choose "Customize" installation (not Express)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Sign in with Microsoft 365 Global Admin account</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Add Forest: yourdomain.com with Enterprise Admin creds</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Configure UPN suffix if needed (match cloud domain)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Select OUs to sync (exclude service accounts)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Select "Exchange hybrid deployment" option</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Enable password hash sync and password writeback</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="11">
          <label>11. Complete installation and start initial sync</label>
        </div>
      </div>
      <h3>🔄 Sync Verification</h3>
      <pre style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px; overflow-x: auto;">
<code># Check sync status
Start-ADSyncSyncCycle -PolicyType Initial
Get-ADSyncScheduler

# In Microsoft 365 admin center
# Users should appear as "Synced with Active Directory"</code>
      </pre>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/install-and-configure-microsoft-entra-connect/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Install and Configure Microsoft Entra Connect - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://www.alitajran.com/idfix-directory-synchronization-error-remediation-tool/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 IdFix - Directory synchronization error remediation tool - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-run-hybrid-wizard': {
    title: 'Run Hybrid Configuration Wizard',
    description: `
      <p><strong>Configure Exchange hybrid deployment using the Hybrid Configuration Wizard.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. On EX01, download Hybrid Configuration Wizard from https://aka.ms/hybridwizard</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Run as Administrator and click "Next" through introduction</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Sign in with Microsoft 365 Global Admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Wizard detects Exchange on-premises environment</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Choose "Full Hybrid Configuration"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Select Exchange server EX01 for hybrid</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Enter on-premises Exchange admin credentials</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure external URLs (mail.yourdomain.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Select certificate for secure mail transport</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Configure mail flow: Use Exchange Online Protection</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="11">
          <label>11. Enable features: Free/busy, Mailbox migrations, Mail tips</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="12">
          <label>12. Review configuration and click "Install"</label>
        </div>
      </div>
      <h3>🚀 HCW Creates</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        ✓ Send/Receive connectors for hybrid mail flow<br>
        ✓ Organization relationship for free/busy<br>
        ✓ OAuth configuration for modern auth<br>
        ✓ Migration endpoint for mailbox moves<br>
        ✓ Accepted domains and email address policies
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=lU5aCFVR9_k&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=24" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 What is Exchange Hybrid | A deep dive session on Exchange Hybrid
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=Yt0VNzPuDNI&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=25" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Exchange Hybrid prerequisites | step by step guide
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=rMPLsbJRIkc&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=26" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Hybrid Configuration Wizard (HCW) | Step by step guide to run HCW
          </a>
        </li>
        <li>
          <a href="https://www.alitajran.com/hybrid-configuration-wizard/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Run the Hybrid Configuration Wizard (HCW) - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-configure-hybrid-mailflow': {
    title: 'Configure and Test Hybrid Mail Flow',
    description: `
      <p><strong>Set up mail routing between on-premises and cloud mailboxes.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. In EAC, verify hybrid send connector created by HCW</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Check receive connector "Inbound from Office 365"</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. In Exchange Online, verify connectors in Security & Compliance Center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Update MX record to point to Exchange Online Protection (*.mail.protection.outlook.com)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Wait for DNS propagation (15-60 minutes)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Test mail flow: External → Cloud mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test mail flow: External → On-premises mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Test mail flow: Cloud → On-premises</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Test mail flow: On-premises → Cloud</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Run Microsoft Remote Connectivity Analyzer tests</label>
        </div>
      </div>
      <h3>📬 Mail Flow Paths</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Inbound: Internet → EOP → On-premises Exchange<br>
        • Outbound: On-premises → EOP → Internet<br>
        • Cross-premises: Direct connection between environments<br>
        • All mail scanned by Exchange Online Protection
      </p>
      <h3>📚 Reference Links</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=kY4HD17GsHM&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=13" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Send emails using Smart Host | Route inbound and outbound emails through EOP
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/update-mx-records-to-office-365/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Update MX records to Office 365 - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://www.alitajran.com/configure-outbound-mail-office-365/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Configure outbound mail via Office 365 - ALI TAJRAN
          </a>
        </li>
      </ul>
    `
  },

  'week4-verify-hybrid-functionality': {
    title: 'Verify Hybrid Functionality',
    description: `
      <p><strong>Test all hybrid features and complete the deployment validation.</strong></p>
      <h3>📋 Steps to Complete</h3>
      <div class="subtask-container">
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="1">
          <label>1. Test Free/Busy: Create meeting between on-premises and cloud users</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="2">
          <label>2. Verify cross-premises Autodiscover works</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="3">
          <label>3. Test mailbox migration: Move one test mailbox to cloud</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="4">
          <label>4. Verify GAL synchronization (all users visible in both environments)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="5">
          <label>5. Test Mail Tips functionality across premises</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="6">
          <label>6. Verify message tracking works end-to-end</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="7">
          <label>7. Test Online Archive: Enable archive for on-premises mailbox</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="8">
          <label>8. Configure Outlook for hybrid users (should auto-configure)</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="9">
          <label>9. Run Hybrid Health Check in Microsoft 365 admin center</label>
        </div>
        <div class="subtask-item">
          <input type="checkbox" class="subtask-checkbox" data-step="10">
          <label>10. Document configuration for future reference</label>
        </div>
      </div>
      <h3>🎉 Congratulations!</h3>
      <p style="background: var(--success); color: white; padding: 16px; border-radius: 8px; margin-top: 16px;">
        <strong>You've successfully completed the Exchange Hybrid Migration Lab!</strong><br><br>
        You've learned:<br>
        ✓ Active Directory deployment and management with PUBLIC domains<br>
        ✓ Exchange Server 2019 installation and configuration<br>
        ✓ External mail publishing with security<br>
        ✓ Microsoft 365 integration and hybrid features<br>
        ✓ Real-world migration skills valuable for any organization
      </p>
      <h3>📚 Next Steps</h3>
      <p style="background: var(--bg-secondary); padding: 12px; border-radius: 8px; margin-top: 16px;">
        • Practice mailbox migrations (cutover, staged, hybrid)<br>
        • Explore Exchange Online Protection features<br>
        • Learn about Exchange Online advanced features<br>
        • Study decommissioning on-premises Exchange<br>
        • Consider Microsoft 365 security and compliance
      </p>
      <h3>📚 Additional Resources</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/exchange-hybrid/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Ali Tajran's Complete Exchange Hybrid Guide
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/exchange-hybrid-architecture/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Exchange Hybrid architecture - ALI TAJRAN
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/exchange-hybrid-design-planning/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Exchange Hybrid design and planning - ALI TAJRAN
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=MWPSusu8evk&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=27" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 How mailbox migration works in Exchange Hybrid
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=mX21bao2k8U&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=28" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Hybrid migration guide | Migrate mailboxes to office 365
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.youtube.com/watch?v=_DVLCZLFzew&list=PL5oyXP-xEiGAlrOJimtH9xppVX7ZVrNIq&index=29" target="_blank" style="color: var(--primary); text-decoration: none;">
            🎥 Enable cloud based archive (online archive) for on premise Exchange mailbox
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/migrate-mailboxes-to-office-365/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Migrate mailboxes to Office 365 - ALI TAJRAN
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/exchange-hybrid-test-plan-checklist/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Exchange Hybrid test plan checklist - ALI TAJRAN
          </a>
        </li>
        <li style="margin-bottom: 8px;">
          <a href="https://www.alitajran.com/autodiscover-url-exchange-hybrid/" target="_blank" style="color: var(--primary); text-decoration: none;">
            📖 Autodiscover URL in Exchange Hybrid - ALI TAJRAN
          </a>
        </li>
        <li>
          <a href="https://testconnectivity.microsoft.com/" target="_blank" style="color: var(--primary); text-decoration: none;">
            🔧 Microsoft Remote Connectivity Analyzer
          </a>
        </li>
      </ul>
    `
  }
};

window.TASK_DEFINITIONS = TASK_DEFINITIONS;