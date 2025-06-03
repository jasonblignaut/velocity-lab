// Add these task definitions to your existing TASK_DEFINITIONS in utils.ts
// This goes after your existing Week 1 and Week 2 definitions

  // WEEK 3: Email & Messaging (12 tasks)
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Windows Server Backup', url: 'https://learn.microsoft.com/en-us/windows-server/administration/windows-server-backup/windows-server-backup-overview', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Server 2016 Upgrade', url: 'https://learn.microsoft.com/en-us/windows-server/upgrade/upgrade-2012-to-2016', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Multiple DC Upgrades', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/deploy/upgrade-domain-controllers', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Functional Levels', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-functional-levels', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Exchange 2019 System Requirements', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/system-requirements', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Exchange Prerequisites', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prerequisites', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Prepare Active Directory', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/prepare-ad-and-domains', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Install Exchange 2019', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deploy-new-installations/install-mailbox-role', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Exchange Admin Center', url: 'https://learn.microsoft.com/en-us/exchange/architecture/client-access/exchange-admin-center', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Create Mailboxes', url: 'https://learn.microsoft.com/en-us/exchange/recipients/user-mailboxes/create-user-mailboxes', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Outlook Web App', url: 'https://learn.microsoft.com/en-us/exchange/clients/outlook-on-the-web/outlook-on-the-web', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Mail Flow', url: 'https://learn.microsoft.com/en-us/exchange/mail-flow/mail-flow', type: 'official' }
    ]
  },

  // WEEK 4: Cloud Integration (10 tasks)
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
    ],
    referenceLinks: [
      { title: 'MS Learn: External DNS for Exchange', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/post-installation-tasks/configure-mail-flow', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Exchange Firewall Ports', url: 'https://learn.microsoft.com/en-us/exchange/plan-and-deploy/deployment-ref/network-ports', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Exchange Certificates', url: 'https://learn.microsoft.com/en-us/exchange/architecture/client-access/certificates', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: External Mail Flow', url: 'https://learn.microsoft.com/en-us/exchange/mail-flow/connectors/internet-mail-send-connectors', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Modern Authentication', url: 'https://learn.microsoft.com/en-us/exchange/clients-and-mobile-in-exchange-online/enable-or-disable-modern-authentication-in-exchange-online', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Microsoft 365 Setup', url: 'https://learn.microsoft.com/en-us/microsoft-365/admin/setup/setup', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Azure AD Connect', url: 'https://learn.microsoft.com/en-us/azure/active-directory/hybrid/whatis-azure-ad-connect', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Hybrid Configuration Wizard', url: 'https://learn.microsoft.com/en-us/exchange/hybrid-deployment/hybrid-configuration-wizard', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Hybrid Mail Flow', url: 'https://learn.microsoft.com/en-us/exchange/transport-options', type: 'official' }
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
    ],
    referenceLinks: [
      { title: 'MS Learn: Test Hybrid Deployment', url: 'https://learn.microsoft.com/en-us/exchange/hybrid-deployment/test-hybrid-deployment', type: 'official' }
    ]
  }
};