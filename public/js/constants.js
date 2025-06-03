// public/js/constants.js
// Shared constants for Velocity Lab frontend

window.TASK_STRUCTURE = {
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

window.TOTAL_TASKS = 42;

// Comprehensive task definitions for frontend use
window.TASK_DEFINITIONS = {
  // Week 1 Tasks
  'week1-install-server2012': {
    id: 'install-server2012',
    title: 'Install Windows Server 2012',
    description: 'Set up the foundation server for your domain controller with proper VM configuration',
    subtasks: [
      { id: '1', title: 'Create new VM with minimum 4GB RAM, 60GB disk' },
      { id: '2', title: 'Boot from Windows Server 2012 R2 ISO' },
      { id: '3', title: 'Complete Windows installation wizard' },
      { id: '4', title: 'Set administrator password' },
      { id: '5', title: 'Install VM integration services/tools' }
    ]
  },
  'week1-configure-static-ip': {
    id: 'configure-static-ip',
    title: 'Configure Static IP Address',
    description: 'Set up reliable static IP addressing for domain controller communication',
    subtasks: [
      { id: '1', title: 'Open Network and Sharing Center' },
      { id: '2', title: 'Click "Change adapter settings"' },
      { id: '3', title: 'Right-click network adapter, select Properties' },
      { id: '4', title: 'Select IPv4 properties and configure static IP (e.g., 192.168.1.10)' },
      { id: '5', title: 'Set subnet mask (255.255.255.0) and default gateway' },
      { id: '6', title: 'Configure DNS servers (initially use ISP DNS)' },
      { id: '7', title: 'Test connectivity with ping commands' }
    ]
  },
  'week1-install-adds-role': {
    id: 'install-adds-role',
    title: 'Install Active Directory Domain Services Role',
    description: 'Install the foundational AD DS role on Windows Server 2012',
    subtasks: [
      { id: '1', title: 'Open Server Manager Dashboard' },
      { id: '2', title: 'Click "Add roles and features"' },
      { id: '3', title: 'Select "Role-based or feature-based installation"' },
      { id: '4', title: 'Choose your server from the server pool' },
      { id: '5', title: 'Select "Active Directory Domain Services" role' },
      { id: '6', title: 'Add required features when prompted' },
      { id: '7', title: 'Complete the installation wizard' }
    ]
  },
  'week1-promote-to-dc': {
    id: 'promote-to-dc',
    title: 'Promote Server to Domain Controller',
    description: 'Configure as primary DC with DNS services and create new forest (lab.local)',
    subtasks: [
      { id: '1', title: 'Click the notification flag in Server Manager' },
      { id: '2', title: 'Select "Promote this server to a domain controller"' },
      { id: '3', title: 'Choose "Add a new forest" and specify domain name (e.g., lab.local)' },
      { id: '4', title: 'Set Forest and Domain functional levels to Windows Server 2012' },
      { id: '5', title: 'Ensure "Domain Name System (DNS) server" is checked' },
      { id: '6', title: 'Set Directory Services Restore Mode (DSRM) password' },
      { id: '7', title: 'Review DNS options and NetBIOS domain name' },
      { id: '8', title: 'Specify database, log files, and SYSVOL paths' },
      { id: '9', title: 'Complete the promotion and restart when prompted' }
    ]
  },
  'week1-configure-dns-server': {
    id: 'configure-dns-server',
    title: 'Configure DNS Server Settings',
    description: 'Set up DNS zones and ensure proper name resolution for the domain',
    subtasks: [
      { id: '1', title: 'Open DNS Manager from Server Manager Tools' },
      { id: '2', title: 'Verify forward lookup zone for your domain exists' },
      { id: '3', title: 'Create reverse lookup zone for your subnet' },
      { id: '4', title: 'Configure DNS forwarders for external resolution' },
      { id: '5', title: 'Test DNS resolution with nslookup commands' },
      { id: '6', title: 'Verify _msdcs and other SRV records are created' }
    ]
  },
  'week1-create-domain-users': {
    id: 'create-domain-users',
    title: 'Create Domain Users and OUs',
    description: 'Set up organizational units and create test user accounts for the domain',
    subtasks: [
      { id: '1', title: 'Open Active Directory Users and Computers' },
      { id: '2', title: 'Create OU structure (Users, Computers, Groups)' },
      { id: '3', title: 'Create test user accounts (TestUser1, TestUser2)' },
      { id: '4', title: 'Set strong passwords and configure account options' },
      { id: '5', title: 'Add users to appropriate groups' },
      { id: '6', title: 'Test user logon from domain controller' }
    ]
  },
  'week1-setup-vm-dns': {
    id: 'setup-vm-dns',
    title: 'Configure VM DNS Settings',
    description: 'Point virtual machine to use domain controller as DNS server',
    subtasks: [
      { id: '1', title: 'Open Network and Sharing Center on the VM' },
      { id: '2', title: 'Click "Change adapter settings"' },
      { id: '3', title: 'Right-click network adapter and select "Properties"' },
      { id: '4', title: 'Select "Internet Protocol Version 4 (TCP/IPv4)" and click "Properties"' },
      { id: '5', title: 'Select "Use the following DNS server addresses"' },
      { id: '6', title: 'Enter the Domain Controller\'s IP address as Preferred DNS' },
      { id: '7', title: 'Click "OK" to save settings' },
      { id: '8', title: 'Test connectivity with nslookup lab.local' }
    ]
  },
  'week1-join-vm-domain': {
    id: 'join-vm-domain',
    title: 'Join VM to Domain',
    description: 'Add virtual machine to domain for centralized management',
    subtasks: [
      { id: '1', title: 'Right-click "This PC" and select "Properties"' },
      { id: '2', title: 'Click "Change settings" next to Computer name' },
      { id: '3', title: 'Click "Change..." button' },
      { id: '4', title: 'Select "Domain" and enter your domain name (e.g., lab.local)' },
      { id: '5', title: 'Provide domain administrator credentials when prompted' },
      { id: '6', title: 'Welcome message confirms successful domain join' },
      { id: '7', title: 'Restart the computer when prompted' },
      { id: '8', title: 'Log in with domain account to verify' }
    ]
  },
  'week1-create-hidden-share': {
    id: 'create-hidden-share',
    title: 'Create Hidden Network Share',
    description: 'Set up centralized file storage with hidden share (CompanyData$)',
    subtasks: [
      { id: '1', title: 'Create folder "C:\\CompanyData" on Domain Controller' },
      { id: '2', title: 'Right-click folder and select "Properties"' },
      { id: '3', title: 'Go to "Sharing" tab and click "Advanced Sharing"' },
      { id: '4', title: 'Check "Share this folder"' },
      { id: '5', title: 'Change share name to "CompanyData$" ($ makes it hidden)' },
      { id: '6', title: 'Click "Permissions" and set appropriate access' },
      { id: '7', title: 'Go to "Security" tab and configure NTFS permissions' },
      { id: '8', title: 'Test access from another machine using \\\\servername\\CompanyData }
    ]
  },
  'week1-map-drive-gpo': {
    id: 'map-drive-gpo',
    title: 'Map Drive via Group Policy (Method 1)',
    description: 'Configure automatic drive mapping through Group Policy preferences for H: drive',
    subtasks: [
      { id: '1', title: 'Open Group Policy Management Console (gpmc.msc)' },
      { id: '2', title: 'Create new GPO named "Drive Mapping Policy"' },
      { id: '3', title: 'Right-click and "Edit" the GPO' },
      { id: '4', title: 'Navigate to User Configuration > Preferences > Windows Settings > Drive Maps' },
      { id: '5', title: 'Right-click and select "New > Mapped Drive"' },
      { id: '6', title: 'Set Action to "Create", Location to \\\\servername\\CompanyData },
      { id: '7', title: 'Set Drive Letter to "H:" and configure options' },
      { id: '8', title: 'Link GPO to appropriate OU and test' }
    ]
  },
  'week1-map-drive-script': {
    id: 'map-drive-script',
    title: 'Map Drive via Logon Script (Method 2)',
    description: 'Create PowerShell logon script for automatic drive mapping to S: drive',
    subtasks: [
      { id: '1', title: 'Create PowerShell script file "MapDrives.ps1" in SYSVOL' },
      { id: '2', title: 'Add command: New-PSDrive -Name "S" -PSProvider FileSystem -Root "\\\\servername\\CompanyData$" -Persist' },
      { id: '3', title: 'Set execution policy if needed' },
      { id: '4', title: 'Open Group Policy Management Console' },
      { id: '5', title: 'Navigate to User Configuration > Policies > Windows Settings > Scripts' },
      { id: '6', title: 'Double-click "Logon" and add PowerShell script' },
      { id: '7', title: 'Configure script parameters and test deployment' }
    ]
  },
  'week1-create-security-group': {
    id: 'create-security-group',
    title: 'Create Security Group for Share Access',
    description: 'Implement role-based access control using AD security groups',
    subtasks: [
      { id: '1', title: 'Open Active Directory Users and Computers (dsa.msc)' },
      { id: '2', title: 'Navigate to appropriate OU or create new OU "Groups"' },
      { id: '3', title: 'Right-click and select "New > Group"' },
      { id: '4', title: 'Name the group "CompanyData_Access"' },
      { id: '5', title: 'Set Group scope to "Global" and type to "Security"' },
      { id: '6', title: 'Add users to the group who need share access' },
      { id: '7', title: 'Modify share and NTFS permissions to grant access only to this group' },
      { id: '8', title: 'Test access with group member and non-member accounts' }
    ]
  },

  // Week 2 Tasks
  'week2-install-second-server': {
    id: 'install-second-server',
    title: 'Install Second Windows Server 2012',
    description: 'Deploy second server for redundancy and load distribution',
    subtasks: [
      { id: '1', title: 'Create new VM with adequate resources' },
      { id: '2', title: 'Install Windows Server 2012' },
      { id: '3', title: 'Configure network and DNS settings' },
      { id: '4', title: 'Join server to domain' }
    ]
  },
  'week2-promote-additional-dc': {
    id: 'promote-additional-dc',
    title: 'Promote to Additional Domain Controller',
    description: 'Add redundancy with second domain controller in environment',
    subtasks: [
      { id: '1', title: 'Install AD DS role on second server' },
      { id: '2', title: 'Promote to additional DC' },
      { id: '3', title: 'Configure DNS and Global Catalog' },
      { id: '4', title: 'Test replication and failover' }
    ]
  },
  'week2-install-wsus-role': {
    id: 'install-wsus-role',
    title: 'Install WSUS Role',
    description: 'Deploy Windows Server Update Services for centralized updates',
    subtasks: [
      { id: '1', title: 'Add WSUS role in Server Manager' },
      { id: '2', title: 'Configure database and content location' },
      { id: '3', title: 'Run post-deployment configuration' },
      { id: '4', title: 'Synchronize with Microsoft Update' }
    ]
  },
  'week2-configure-wsus-settings': {
    id: 'configure-wsus-settings',
    title: 'Configure WSUS Settings',
    description: 'Set up Group Policy to direct clients to use WSUS server',
    subtasks: [
      { id: '1', title: 'Create WSUS Client Configuration GPO' },
      { id: '2', title: 'Configure intranet update service location' },
      { id: '3', title: 'Set automatic update settings' },
      { id: '4', title: 'Test client connectivity to WSUS' }
    ]
  },
  'week2-setup-wsus-gpo': {
    id: 'setup-wsus-gpo',
    title: 'Setup WSUS Group Policy',
    description: 'Configure client update policies and automatic update settings',
    subtasks: [
      { id: '1', title: 'Open Group Policy Management' },
      { id: '2', title: 'Edit or create WSUS policy' },
      { id: '3', title: 'Configure Windows Update settings' },
      { id: '4', title: 'Link to appropriate OUs' }
    ]
  },
  'week2-configure-primary-time': {
    id: 'configure-primary-time',
    title: 'Configure Primary Time Server',
    description: 'Set PDC Emulator as authoritative time source with external NTP',
    subtasks: [
      { id: '1', title: 'Identify PDC Emulator with netdom' },
      { id: '2', title: 'Configure external time source' },
      { id: '3', title: 'Set as reliable time server' },
      { id: '4', title: 'Restart Windows Time service and verify' }
    ]
  },
  'week2-configure-secondary-time': {
    id: 'configure-secondary-time',
    title: 'Configure Secondary Time Server',
    description: 'Set second DC as backup time source with domain hierarchy sync',
    subtasks: [
      { id: '1', title: 'Configure domain hierarchy sync' },
      { id: '2', title: 'Set as non-reliable time source' },
      { id: '3', title: 'Force synchronization with PDC' },
      { id: '4', title: 'Test time sync across domain' }
    ]
  },
  'week2-test-infrastructure': {
    id: 'test-infrastructure',
    title: 'Test Infrastructure Setup',
    description: 'Verify all services, replication, and connectivity before proceeding',
    subtasks: [
      { id: '1', title: 'Test AD replication between DCs' },
      { id: '2', title: 'Verify WSUS connectivity' },
      { id: '3', title: 'Check time synchronization' },
      { id: '4', title: 'Validate DNS resolution' }
    ]
  },

  // Week 3 Tasks
  'week3-backup-servers': {
    id: 'backup-servers',
    title: 'Backup Domain Controllers',
    description: 'Create system state backups before major infrastructure changes',
    subtasks: [
      { id: '1', title: 'Open Windows Server Backup (wbadmin.msc)' },
      { id: '2', title: 'Configure backup destination (external drive/network)' },
      { id: '3', title: 'Select System State backup option' },
      { id: '4', title: 'Include Critical Volumes and System Reserved' },
      { id: '5', title: 'Start backup and verify completion' },
      { id: '6', title: 'Test backup restoration process' },
      { id: '7', title: 'Document backup procedures' }
    ]
  },
  'week3-upgrade-dc1-2016': {
    id: 'upgrade-dc1-2016',
    title: 'Upgrade Primary DC to Server 2016',
    description: 'In-place upgrade of primary domain controller to Windows Server 2016',
    subtasks: [
      { id: '1', title: 'Verify system requirements for Server 2016' },
      { id: '2', title: 'Run Windows Server 2016 setup.exe' },
      { id: '3', title: 'Choose "Upgrade" installation type' },
      { id: '4', title: 'Select Windows Server 2016 Standard edition' },
      { id: '5', title: 'Monitor upgrade progress (may take 1-2 hours)' },
      { id: '6', title: 'Verify all roles and features survived upgrade' },
      { id: '7', title: 'Test domain controller functionality' },
      { id: '8', title: 'Check event logs for any upgrade issues' }
    ]
  },
  'week3-upgrade-dc2-2016': {
    id: 'upgrade-dc2-2016',
    title: 'Upgrade Secondary DC to Server 2016',
    description: 'Upgrade second domain controller maintaining AD replication',
    subtasks: [
      { id: '1', title: 'Verify primary DC upgrade completed successfully' },
      { id: '2', title: 'Check AD replication status before upgrade' },
      { id: '3', title: 'Run Windows Server 2016 setup on second DC' },
      { id: '4', title: 'Monitor upgrade process carefully' },
      { id: '5', title: 'Verify AD replication after upgrade' },
      { id: '6', title: 'Test FSMO role availability' },
      { id: '7', title: 'Validate DNS functionality on both DCs' }
    ]
  },
  'week3-raise-functional-levels': {
    id: 'raise-functional-levels',
    title: 'Raise Domain/Forest Functional Levels',
    description: 'Increase functional levels to Windows Server 2016 for new features',
    subtasks: [
      { id: '1', title: 'Open Active Directory Domains and Trusts' },
      { id: '2', title: 'Right-click domain and select "Raise Domain Functional Level"' },
      { id: '3', title: 'Select "Windows Server 2016" and confirm' },
      { id: '4', title: 'Open Active Directory Domains and Trusts again' },
      { id: '5', title: 'Right-click root and select "Raise Forest Functional Level"' },
      { id: '6', title: 'Select "Windows Server 2016" and confirm' },
      { id: '7', title: 'Verify functional levels with PowerShell commands' },
      { id: '8', title: 'Document the functional level changes' }
    ]
  },
  'week3-prepare-exchange-server': {
    id: 'prepare-exchange-server',
    title: 'Prepare Exchange Server VM',
    description: 'Set up dedicated Windows Server 2016 for Exchange 2019 installation',
    subtasks: [
      { id: '1', title: 'Create new VM with 8GB RAM minimum, 100GB disk' },
      { id: '2', title: 'Install Windows Server 2016 Standard' },
      { id: '3', title: 'Configure static IP in same subnet as DCs' },
      { id: '4', title: 'Join server to domain (exchange.lab.local)' },
      { id: '5', title: 'Install Windows Updates and restart' },
      { id: '6', title: 'Configure Windows Defender exclusions for Exchange' }
    ]
  },
  'week3-install-exchange-prereqs': {
    id: 'install-exchange-prereqs',
    title: 'Install Exchange Prerequisites',
    description: 'Install required Windows features and software for Exchange 2019',
    subtasks: [
      { id: '1', title: 'Install .NET Framework 4.8 or later' },
      { id: '2', title: 'Install Visual C++ Redistributable 2013' },
      { id: '3', title: 'Install IIS role with required features' },
      { id: '4', title: 'Install Windows features: NET-Framework-45-Features, RPC-over-HTTP-proxy' },
      { id: '5', title: 'Install RSAT-Clustering tools' },
      { id: '6', title: 'Install Unified Communications Managed API 4.0' },
      { id: '7', title: 'Restart server and verify all prerequisites' }
    ]
  },
  'week3-extend-ad-schema': {
    id: 'extend-ad-schema',
    title: 'Extend Active Directory Schema',
    description: 'Prepare Active Directory for Exchange 2019 integration',
    subtasks: [
      { id: '1', title: 'Log in as Enterprise Admin or Schema Admin' },
      { id: '2', title: 'Mount Exchange 2019 ISO or extract installation files' },
      { id: '3', title: 'Open elevated command prompt' },
      { id: '4', title: 'Run: Setup.exe /PrepareSchema /IAcceptExchangeServerLicenseTerms' },
      { id: '5', title: 'Wait for schema extension to complete' },
      { id: '6', title: 'Run: Setup.exe /PrepareAD /OrganizationName:"VelocityLab"' },
      { id: '7', title: 'Verify schema extension with ADSIEdit' }
    ]
  },
  'week3-install-exchange-2019': {
    id: 'install-exchange-2019',
    title: 'Install Exchange Server 2019',
    description: 'Deploy Exchange 2019 Mailbox role for email services',
    subtasks: [
      { id: '1', title: 'Run Exchange 2019 setup.exe as Administrator' },
      { id: '2', title: 'Accept license terms and choose installation location' },
      { id: '3', title: 'Select "Mailbox role" for installation' },
      { id: '4', title: 'Configure Exchange organization settings' },
      { id: '5', title: 'Review and confirm installation settings' },
      { id: '6', title: 'Monitor installation progress (1-2 hours)' },
      { id: '7', title: 'Complete post-installation configuration' },
      { id: '8', title: 'Verify Exchange services are running' }
    ]
  },
  'week3-configure-exchange-basic': {
    id: 'configure-exchange-basic',
    title: 'Configure Basic Exchange Settings',
    description: 'Set up initial Exchange configuration and virtual directories',
    subtasks: [
      { id: '1', title: 'Open Exchange Admin Center (EAC)' },
      { id: '2', title: 'Configure Exchange server identity' },
      { id: '3', title: 'Set up Outlook Web App virtual directory' },
      { id: '4', title: 'Configure Exchange Control Panel settings' },
      { id: '5', title: 'Set up ActiveSync virtual directory' },
      { id: '6', title: 'Configure Autodiscover service' },
      { id: '7', title: 'Test basic Exchange functionality' }
    ]
  },
  'week3-create-mailboxes': {
    id: 'create-mailboxes',
    title: 'Create User Mailboxes',
    description: 'Enable mailboxes for domain users and test email functionality',
    subtasks: [
      { id: '1', title: 'Open Exchange Admin Center' },
      { id: '2', title: 'Navigate to Recipients > Mailboxes' },
      { id: '3', title: 'Enable mailbox for TestUser1' },
      { id: '4', title: 'Enable mailbox for TestUser2' },
      { id: '5', title: 'Create administrator mailbox' },
      { id: '6', title: 'Configure mailbox quotas and settings' },
      { id: '7', title: 'Verify mailbox creation in AD' },
      { id: '8', title: 'Test mailbox access via OWA' }
    ]
  },
  'week3-test-mailbox-access': {
    id: 'test-mailbox-access',
    title: 'Test Internal Mailbox Access',
    description: 'Verify users can access mailboxes via Outlook Web App internally',
    subtasks: [
      { id: '1', title: 'Open web browser on domain-joined computer' },
      { id: '2', title: 'Navigate to https://exchange.lab.local/owa' },
      { id: '3', title: 'Log in with TestUser1 credentials' },
      { id: '4', title: 'Verify OWA interface loads correctly' },
      { id: '5', title: 'Send test email to TestUser2' },
      { id: '6', title: 'Log in as TestUser2 and verify email received' },
      { id: '7', title: 'Test reply functionality' },
      { id: '8', title: 'Verify calendar and contacts access' }
    ]
  },
  'week3-configure-internal-mailflow': {
    id: 'configure-internal-mailflow',
    title: 'Configure Internal Mail Flow',
    description: 'Set up send and receive connectors for internal email routing',
    subtasks: [
      { id: '1', title: 'Open Exchange Management Shell' },
      { id: '2', title: 'Review default receive connectors' },
      { id: '3', title: 'Configure default send connector' },
      { id: '4', title: 'Set up internal mail routing' },
      { id: '5', title: 'Test mail flow with Test-Mailflow cmdlet' },
      { id: '6', title: 'Configure message size limits' },
      { id: '7', title: 'Verify internal email delivery' }
    ]
  },

  // Week 4 Tasks
  'week4-configure-external-dns': {
    id: 'configure-external-dns',
    title: 'Configure External DNS Records',
    description: 'Set up public DNS records for Exchange external access',
    subtasks: [
      { id: '1', title: 'Access domain registrar DNS management' },
      { id: '2', title: 'Create A record: mail.yourdomain.com pointing to public IP' },
      { id: '3', title: 'Create MX record: priority 10, mail.yourdomain.com' },
      { id: '4', title: 'Create Autodiscover CNAME: autodiscover.yourdomain.com' },
      { id: '5', title: 'Set up SPF record for email authentication' },
      { id: '6', title: 'Wait for DNS propagation (up to 24 hours)' },
      { id: '7', title: 'Test DNS resolution with nslookup' }
    ]
  },
  'week4-setup-firewall-rules': {
    id: 'setup-firewall-rules',
    title: 'Configure Firewall Rules',
    description: 'Open required ports for external Exchange access',
    subtasks: [
      { id: '1', title: 'Configure router/firewall port forwarding' },
      { id: '2', title: 'Open port 443 (HTTPS) for OWA/EAS' },
      { id: '3', title: 'Open port 25 (SMTP) for mail flow' },
      { id: '4', title: 'Open port 587 (SMTP submission) if needed' },
      { id: '5', title: 'Configure Windows Firewall on Exchange server' },
      { id: '6', title: 'Test external connectivity' },
      { id: '7', title: 'Document firewall configuration' }
    ]
  },
  'week4-install-ssl-certificates': {
    id: 'install-ssl-certificates',
    title: 'Install SSL Certificates',
    description: 'Secure Exchange services with valid SSL certificates',
    subtasks: [
      { id: '1', title: 'Generate Certificate Signing Request (CSR)' },
      { id: '2', title: 'Obtain SSL certificate from CA or use self-signed for lab' },
      { id: '3', title: 'Install certificate in Exchange' },
      { id: '4', title: 'Assign certificate to Exchange services' },
      { id: '5', title: 'Update IIS bindings for OWA' },
      { id: '6', title: 'Test HTTPS access to Exchange' },
      { id: '7', title: 'Verify certificate chain and trust' }
    ]
  },
  'week4-configure-external-mailflow': {
    id: 'configure-external-mailflow',
    title: 'Configure External Mail Flow',
    description: 'Set up connectors for sending and receiving external email',
    subtasks: [
      { id: '1', title: 'Create Internet Send connector' },
      { id: '2', title: 'Configure smart host routing if needed' },
      { id: '3', title: 'Modify default Receive connector for external mail' },
      { id: '4', title: 'Configure accepted domains' },
      { id: '5', title: 'Set up email address policies' },
      { id: '6', title: 'Test external mail flow' },
      { id: '7', title: 'Configure anti-spam settings' }
    ]
  },
  'week4-setup-modern-auth': {
    id: 'setup-modern-auth',
    title: 'Setup Modern Authentication',
    description: 'Configure OAuth 2.0 and modern auth for Exchange',
    subtasks: [
      { id: '1', title: 'Enable OAuth 2.0 in Exchange' },
      { id: '2', title: 'Configure authentication policies' },
      { id: '3', title: 'Set up multi-factor authentication options' },
      { id: '4', title: 'Configure conditional access if available' },
      { id: '5', title: 'Test modern auth with Outlook client' },
      { id: '6', title: 'Verify mobile device connectivity' },
      { id: '7', title: 'Document authentication configuration' }
    ]
  },
  'week4-prepare-m365-tenant': {
    id: 'prepare-m365-tenant',
    title: 'Prepare Microsoft 365 Tenant',
    description: 'Set up Microsoft 365 tenant for hybrid deployment',
    subtasks: [
      { id: '1', title: 'Sign up for Microsoft 365 trial or subscription' },
      { id: '2', title: 'Add and verify custom domain' },
      { id: '3', title: 'Configure initial users and licenses' },
      { id: '4', title: 'Set up Exchange Online protection' },
      { id: '5', title: 'Configure security and compliance policies' },
      { id: '6', title: 'Document tenant configuration' }
    ]
  },
  'week4-install-aad-connect': {
    id: 'install-aad-connect',
    title: 'Install Azure AD Connect',
    description: 'Set up directory synchronization between on-premises and cloud',
    subtasks: [
      { id: '1', title: 'Download Azure AD Connect from Microsoft' },
      { id: '2', title: 'Run installation on domain controller or dedicated server' },
      { id: '3', title: 'Choose Express or Custom installation' },
      { id: '4', title: 'Provide Microsoft 365 global admin credentials' },
      { id: '5', title: 'Configure directory synchronization scope' },
      { id: '6', title: 'Start initial synchronization' },
      { id: '7', title: 'Verify users synchronized to Azure AD' }
    ]
  },
  'week4-run-hybrid-wizard': {
    id: 'run-hybrid-wizard',
    title: 'Run Exchange Hybrid Configuration Wizard',
    description: 'Configure hybrid deployment between Exchange on-premises and Exchange Online',
    subtasks: [
      { id: '1', title: 'Download Hybrid Configuration Wizard' },
      { id: '2', title: 'Run wizard with Exchange admin credentials' },
      { id: '3', title: 'Provide Microsoft 365 credentials' },
      { id: '4', title: 'Configure hybrid features (free/busy, mail flow)' },
      { id: '5', title: 'Review and apply hybrid configuration' },
      { id: '6', title: 'Monitor configuration progress' },
      { id: '7', title: 'Verify hybrid connectivity test' }
    ]
  },
  'week4-configure-hybrid-mailflow': {
    id: 'configure-hybrid-mailflow',
    title: 'Configure Hybrid Mail Flow',
    description: 'Set up mail routing between on-premises and Exchange Online',
    subtasks: [
      { id: '1', title: 'Configure outbound connector to Exchange Online' },
      { id: '2', title: 'Set up inbound connector from Exchange Online' },
      { id: '3', title: 'Configure centralized mail transport' },
      { id: '4', title: 'Set up mail flow rules if needed' },
      { id: '5', title: 'Test mail flow in both directions' },
      { id: '6', title: 'Verify message tracking works' },
      { id: '7', title: 'Document mail flow architecture' }
    ]
  },
  'week4-verify-hybrid-functionality': {
    id: 'verify-hybrid-functionality',
    title: 'Verify Hybrid Functionality',
    description: 'Test all hybrid features and ensure proper operation',
    subtasks: [
      { id: '1', title: 'Test free/busy calendar sharing' },
      { id: '2', title: 'Verify mail flow between on-premises and cloud' },
      { id: '3', title: 'Test cross-premises mailbox moves' },
      { id: '4', title: 'Verify unified Global Address List' },
      { id: '5', title: 'Test message tracking across environments' },
      { id: '6', title: 'Validate single sign-on functionality' },
      { id: '7', title: 'Document hybrid deployment completion' },
      { id: '8', title: 'Create operational procedures for hybrid management' }
    ]
  }
};

// Helper functions for frontend use
window.VelocityUtils = {
  formatTaskId: function(week, taskId) {
    return `${week}-${taskId}`;
  },
  
  getTaskDefinition: function(taskId) {
    return window.TASK_DEFINITIONS[taskId] || null;
  },
  
  calculateProgress: function(progress) {
    if (!progress || typeof progress !== 'object') return 0;
    
    let completedTasks = 0;
    let totalTasks = 0;
    
    Object.keys(window.TASK_STRUCTURE).forEach(weekKey => {
      const week = window.TASK_STRUCTURE[weekKey];
      const weekProgress = progress[weekKey] || {};
      
      week.tasks.forEach(taskId => {
        totalTasks++;
        if (weekProgress[taskId] && weekProgress[taskId].completed) {
          completedTasks++;
        }
      });
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  },
  
  getWeekProgress: function(progress, weekKey) {
    const week = window.TASK_STRUCTURE[weekKey];
    if (!week) return { completed: 0, total: 0, percentage: 0 };
    
    const weekProgress = progress[weekKey] || {};
    let completed = 0;
    
    week.tasks.forEach(taskId => {
      if (weekProgress[taskId] && weekProgress[taskId].completed) {
        completed++;
      }
    });
    
    const percentage = week.taskCount > 0 ? Math.round((completed / week.taskCount) * 100) : 0;
    
    return {
      completed,
      total: week.taskCount,
      percentage
    };
  }
};