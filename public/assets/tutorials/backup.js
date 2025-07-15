/* ===================================================================
   Backup & Recovery Tutorials - Properly Escaped Content
   =================================================================== */

window.BACKUP_TUTORIALS = {
    'veeam-setup': {
        title: 'Veeam Backup & Replication setup and configuration',
        content: `
            <div class="tutorial-content">
                <h2>Veeam Backup & Replication Setup and Configuration</h2>
                
                <h3>System Requirements</h3>
                <ul>
                    <li>Windows Server 2016 or later</li>
                    <li>4GB RAM minimum (8GB recommended)</li>
                    <li>4GB free disk space for installation</li>
                    <li>SQL Server (Express edition included)</li>
                </ul>
                
                <h3>Installation Process</h3>
                <ol>
                    <li>Download Veeam Backup & Replication from official site</li>
                    <li>Run installer as Administrator</li>
                    <li>Accept license agreement</li>
                    <li>Choose installation path</li>
                    <li>Configure SQL Server settings</li>
                    <li>Complete installation and restart</li>
                </ol>
                
                <h3>Initial Configuration</h3>
                
                <h4>1. Add Backup Infrastructure</h4>
                <div class="code-block">
                    <code>1. Open Veeam Console
2. Navigate to Backup Infrastructure
3. Add VMware vSphere or Hyper-V servers
4. Enter credentials for virtualization platform</code>
                </div>
                
                <h4>2. Configure Backup Repository</h4>
                <ol>
                    <li>Right-click "Backup Repositories"</li>
                    <li>Select "Add Backup Repository"</li>
                    <li>Choose repository type (Direct attached storage, Network shared folder, etc.)</li>
                    <li>Specify path and configure settings</li>
                </ol>
                
                <h3>Creating Backup Jobs</h3>
                
                <h4>VM Backup Job Configuration</h4>
                <div class="tutorial-tips">
                    <h4>💡 Best Practices</h4>
                    <ul>
                        <li>Group VMs by criticality and schedule</li>
                        <li>Use application-aware processing for databases</li>
                        <li>Configure proper retention policies</li>
                        <li>Enable backup copy jobs for offsite protection</li>
                    </ul>
                </div>
                
                <h4>Job Settings</h4>
                <div class="code-block">
                    <code>Backup Settings:
- Backup mode: Incremental
- Retention: 14 restore points
- Compression: Optimal
- Encryption: Enable with strong password
- Application-aware processing: Enable for SQL/Exchange</code>
                </div>
                
                <h3>Monitoring and Management</h3>
                <ol>
                    <li>Configure email notifications</li>
                    <li>Set up backup job scheduling</li>
                    <li>Monitor job success/failure rates</li>
                    <li>Regular backup verification</li>
                </ol>
                
                <h3>Disaster Recovery Planning</h3>
                <ul>
                    <li>Create Veeam recovery media</li>
                    <li>Document recovery procedures</li>
                    <li>Test restore operations regularly</li>
                    <li>Maintain offsite backup copies</li>
                </ul>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Always encrypt backup files and use strong authentication for Veeam console access.</p>
                </div>
            </div>
        `
    },
    
    'backup-radar': {
        title: 'Backup monitoring with Backup Radar platform',
        content: `
            <div class="tutorial-content">
                <h2>Backup Monitoring with Backup Radar Platform</h2>
                
                <h3>Platform Overview</h3>
                <p>Backup Radar provides centralized monitoring and reporting for multiple backup solutions across different customer environments.</p>
                
                <h3>Initial Setup</h3>
                <ol>
                    <li>Create Backup Radar account</li>
                    <li>Download and install monitoring agents</li>
                    <li>Configure customer environments</li>
                    <li>Set up notification preferences</li>
                </ol>
                
                <h3>Agent Installation</h3>
                
                <h4>Windows Agent</h4>
                <div class="code-block">
                    <code># PowerShell installation
1. Download agent from portal
2. Run installer with admin rights
3. Enter license key and server details
4. Configure monitoring parameters</code>
                </div>
                
                <h4>Supported Backup Solutions</h4>
                <ul>
                    <li>Veeam Backup & Replication</li>
                    <li>Windows Server Backup</li>
                    <li>SQL Server backup jobs</li>
                    <li>Exchange Server backups</li>
                    <li>Third-party solutions via API</li>
                </ul>
                
                <h3>Dashboard Configuration</h3>
                
                <h4>Customer Management</h4>
                <ol>
                    <li>Add customer organizations</li>
                    <li>Configure backup job discovery</li>
                    <li>Set monitoring schedules</li>
                    <li>Define alerting thresholds</li>
                </ol>
                
                <h4>Monitoring Rules</h4>
                <div class="tutorial-tips">
                    <h4>💡 Recommended Alert Settings</h4>
                    <ul>
                        <li>Failed backup jobs - Immediate alert</li>
                        <li>Backup job duration - Alert if > 150% of average</li>
                        <li>Repository space - Alert at 85% full</li>
                        <li>Missed backup windows - Alert after 2 hours</li>
                    </ul>
                </div>
                
                <h3>Reporting Features</h3>
                <ul>
                    <li>Executive summary reports</li>
                    <li>Detailed backup status reports</li>
                    <li>Trend analysis and capacity planning</li>
                    <li>SLA compliance reporting</li>
                </ul>
                
                <h3>Alert Management</h3>
                <div class="code-block">
                    <code>Notification Channels:
- Email alerts to administrators
- SMS for critical failures
- Slack/Teams integration
- Webhook for custom integrations</code>
                </div>
                
                <h3>API Integration</h3>
                <p>Backup Radar provides REST API for custom integrations:</p>
                <div class="code-block">
                    <code># API endpoints
GET /api/v1/customers
GET /api/v1/backup-jobs
POST /api/v1/alerts
GET /api/v1/reports</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Best Practices</h4>
                    <p>Use dedicated service accounts with minimum required permissions for monitoring agents.</p>
                </div>
            </div>
        `
    },
    
    'block64-reporting': {
        title: 'Block64 reporting setup and automation',
        content: `
            <div class="tutorial-content">
                <h2>Block64 Reporting Setup and Automation</h2>
                
                <h3>Platform Introduction</h3>
                <p>Block64 provides automated backup reporting and monitoring specifically designed for MSPs managing multiple customer environments.</p>
                
                <h3>Account Setup</h3>
                <ol>
                    <li>Register for Block64 MSP account</li>
                    <li>Configure company profile and branding</li>
                    <li>Set up customer hierarchy</li>
                    <li>Configure user permissions and roles</li>
                </ol>
                
                <h3>Agent Deployment</h3>
                
                <h4>Automated Deployment</h4>
                <div class="code-block">
                    <code># PowerShell deployment script
# Download and execute on target servers
iex ((New-Object System.Net.WebClient).DownloadString('https://agent.block64.com/install.ps1'))

# Manual parameters
-LicenseKey "your-license-key"
-CustomerID "customer-identifier"
-ServerRole "backup-server"</code>
                </div>
                
                <h4>Supported Platforms</h4>
                <ul>
                    <li>Windows Server (2012 R2 and later)</li>
                    <li>VMware vSphere environments</li>
                    <li>Hyper-V infrastructure</li>
                    <li>Cloud backup solutions</li>
                </ul>
                
                <h3>Report Configuration</h3>
                
                <h4>Standard Reports</h4>
                <ul>
                    <li>Daily backup status summary</li>
                    <li>Weekly performance reports</li>
                    <li>Monthly executive summaries</li>
                    <li>Quarterly compliance reports</li>
                </ul>
                
                <h4>Custom Report Templates</h4>
                <div class="tutorial-tips">
                    <h4>💡 Report Customization</h4>
                    <ul>
                        <li>Add company logos and branding</li>
                        <li>Customize report sections and metrics</li>
                        <li>Set specific KPIs for each customer</li>
                        <li>Configure automated delivery schedules</li>
                    </ul>
                </div>
                
                <h3>Automation Features</h3>
                
                <h4>Scheduled Reporting</h4>
                <div class="code-block">
                    <code>Automation Settings:
- Daily status emails at 8:00 AM
- Weekly reports every Monday
- Monthly executive reports on 1st of month
- Immediate alerts for critical failures</code>
                </div>
                
                <h4>Integration Options</h4>
                <ol>
                    <li>Email delivery to stakeholders</li>
                    <li>Portal access for customers</li>
                    <li>API integration with PSA tools</li>
                    <li>Webhook notifications for events</li>
                </ol>
                
                <h3>Multi-Tenant Management</h3>
                <ul>
                    <li>Separate customer environments</li>
                    <li>Role-based access controls</li>
                    <li>Branded customer portals</li>
                    <li>Centralized MSP dashboard</li>
                </ul>
                
                <h3>Troubleshooting and Support</h3>
                <div class="code-block">
                    <code># Agent troubleshooting commands
# Check agent status
Get-Service "Block64Agent"

# View agent logs
Get-EventLog -LogName "Block64" -Newest 50

# Test connectivity
Test-NetConnection agent.block64.com -Port 443</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Performance Considerations</h4>
                    <p>Schedule report generation during off-peak hours to minimize impact on backup operations.</p>
                </div>
            </div>
        `
    }
};