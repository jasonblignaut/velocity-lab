/* ===================================================================
   MSP Tools Tutorials - Atera Platform
   =================================================================== */

window.TOOLS_TUTORIALS = {
    'atera-splashtop': {
        title: 'Atera: remote access via Splashtop integration',
        content: `
            <div class="tutorial-content">
                <h2>Atera: Remote Access via Splashtop Integration</h2>
                
                <h3>Overview</h3>
                <p>Atera's integration with Splashtop provides secure, high-performance remote access to customer devices directly from the Atera console.</p>
                
                <h3>Setup Requirements</h3>
                <ul>
                    <li>Active Atera subscription</li>
                    <li>Splashtop Business Access add-on</li>
                    <li>Atera agent installed on target devices</li>
                    <li>Network connectivity (ports 443/80)</li>
                </ul>
                
                <h3>Configuration Steps</h3>
                
                <h4>1. Enable Splashtop Integration</h4>
                <ol>
                    <li>Login to Atera admin console</li>
                    <li>Navigate to Settings > Integrations</li>
                    <li>Find Splashtop Business Access</li>
                    <li>Click "Enable" and follow activation steps</li>
                </ol>
                
                <h4>2. Agent Configuration</h4>
                <div class="code-block">
                    <code>Agent Settings:
- Remote access: Enabled
- Splashtop service: Active
- Firewall exceptions: Configured automatically
- User permissions: Set per technician role</code>
                </div>
                
                <h3>Using Remote Access</h3>
                
                <h4>Initiating Connection</h4>
                <ol>
                    <li>Open device in Atera console</li>
                    <li>Click "Remote Access" button</li>
                    <li>Select connection quality settings</li>
                    <li>Authenticate if prompted</li>
                </ol>
                
                <h4>Connection Options</h4>
                <div class="tutorial-tips">
                    <h4>💡 Performance Settings</h4>
                    <ul>
                        <li>High Quality: Best for local network connections</li>
                        <li>Balanced: Good for standard internet connections</li>
                        <li>Fast: Optimized for slower connections</li>
                        <li>Custom: Manual configuration of settings</li>
                    </ul>
                </div>
                
                <h3>Security Features</h3>
                <ul>
                    <li>256-bit AES encryption</li>
                    <li>Two-factor authentication support</li>
                    <li>Session recording capabilities</li>
                    <li>IP restriction options</li>
                    <li>Device authentication</li>
                </ul>
                
                <h3>Troubleshooting Common Issues</h3>
                
                <h4>Connection Failures</h4>
                <div class="code-block">
                    <code># Check agent status
1. Verify Atera agent is running
2. Check network connectivity
3. Validate firewall settings
4. Restart Splashtop service if needed</code>
                </div>
                
                <h4>Performance Issues</h4>
                <ul>
                    <li>Adjust connection quality settings</li>
                    <li>Check bandwidth availability</li>
                    <li>Close unnecessary applications</li>
                    <li>Use "View Only" mode for better performance</li>
                </ul>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Best Practices</h4>
                    <p>Always log out of remote sessions and verify session termination. Enable session recording for compliance requirements.</p>
                </div>
            </div>
        `
    },
    
    'atera-scripts': {
        title: 'Atera: script management and automation',
        content: `
            <div class="tutorial-content">
                <h2>Atera: Script Management and Automation</h2>
                
                <h3>Script Library Overview</h3>
                <p>Atera provides a comprehensive script library for automating common IT tasks across your managed devices.</p>
                
                <h3>Accessing Script Library</h3>
                <ol>
                    <li>Navigate to Scripts in Atera console</li>
                    <li>Browse categories: Windows, macOS, Linux</li>
                    <li>Use search to find specific scripts</li>
                    <li>Preview script details and requirements</li>
                </ol>
                
                <h3>Script Categories</h3>
                
                <h4>System Maintenance</h4>
                <ul>
                    <li>Disk cleanup and optimization</li>
                    <li>Registry cleaning</li>
                    <li>Temporary file removal</li>
                    <li>System file checker (SFC)</li>
                </ul>
                
                <h4>Security Scripts</h4>
                <div class="code-block">
                    <code># Example: Windows Security Scan
# Checks for:
- Windows Update status
- Antivirus status
- Firewall configuration
- User account security
- Password policy compliance</code>
                </div>
                
                <h3>Custom Script Creation</h3>
                
                <h4>PowerShell Scripts</h4>
                <div class="code-block">
                    <code># Sample PowerShell script template
param(
    [Parameter(Mandatory=$false)]
    [string]$TargetPath = "C:\\Temp"
)

# Your script logic here
Write-Output "Script execution started"
# Add your commands
Write-Output "Script completed successfully"</code>
                </div>
                
                <h4>Batch Scripts</h4>
                <div class="code-block">
                    <code>@echo off
REM Sample batch script for Atera
echo Starting maintenance tasks...

REM Your commands here
echo Cleaning temporary files...
del /f /s /q %temp%\\*.*

echo Script completed.</code>
                </div>
                
                <h3>Script Deployment</h3>
                
                <h4>Individual Deployment</h4>
                <ol>
                    <li>Select target device</li>
                    <li>Choose script from library</li>
                    <li>Configure parameters if required</li>
                    <li>Schedule execution or run immediately</li>
                </ol>
                
                <h4>Bulk Deployment</h4>
                <div class="tutorial-tips">
                    <h4>💡 Bulk Deployment Best Practices</h4>
                    <ul>
                        <li>Test scripts on pilot devices first</li>
                        <li>Use device groups for targeted deployment</li>
                        <li>Schedule during maintenance windows</li>
                        <li>Monitor execution results carefully</li>
                    </ul>
                </div>
                
                <h3>Automation Policies</h3>
                
                <h4>Creating Automation Rules</h4>
                <ol>
                    <li>Go to Automation > Policies</li>
                    <li>Create new policy</li>
                    <li>Define trigger conditions</li>
                    <li>Select scripts to execute</li>
                    <li>Set execution parameters</li>
                </ol>
                
                <h4>Common Automation Scenarios</h4>
                <ul>
                    <li>Daily disk cleanup on all workstations</li>
                    <li>Weekly antivirus definition updates</li>
                    <li>Monthly patch compliance checks</li>
                    <li>Automated software deployments</li>
                </ul>
                
                <h3>Monitoring and Reporting</h3>
                <div class="code-block">
                    <code>Script Execution Monitoring:
- Real-time execution status
- Output logs and error messages
- Execution history and trends
- Success/failure rate analytics</code>
                </div>
                
                <h3>Script Best Practices</h3>
                <ul>
                    <li>Include proper error handling</li>
                    <li>Add logging and output messages</li>
                    <li>Test thoroughly before deployment</li>
                    <li>Document script purpose and parameters</li>
                    <li>Use version control for custom scripts</li>
                </ul>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Review all scripts carefully before execution. Avoid hardcoding sensitive information in scripts.</p>
                </div>
            </div>
        `
    },
    
    'atera-multicustomer': {
        title: 'Atera: multi-customer environment management',
        content: `
            <div class="tutorial-content">
                <h2>Atera: Multi-Customer Environment Management</h2>
                
                <h3>Customer Organization</h3>
                <p>Atera's multi-tenant architecture allows MSPs to efficiently manage multiple customer environments from a single console.</p>
                
                <h3>Customer Setup</h3>
                
                <h4>Adding New Customers</h4>
                <ol>
                    <li>Navigate to Customers section</li>
                    <li>Click "Add Customer"</li>
                    <li>Enter customer details:
                        <ul>
                            <li>Company name and contact info</li>
                            <li>Billing information</li>
                            <li>Technical contacts</li>
                            <li>Service level agreements</li>
                        </ul>
                    </li>
                </ol>
                
                <h4>Customer Hierarchy</h4>
                <div class="code-block">
                    <code>Organizational Structure:
MSP Account
├── Customer A
│   ├── Site 1 (Head Office)
│   ├── Site 2 (Branch Office)
│   └── Site 3 (Remote Office)
├── Customer B
│   ├── Main Location
│   └── Satellite Office
└── Customer C
    └── Single Location</code>
                </div>
                
                <h3>Device Management</h3>
                
                <h4>Device Grouping Strategies</h4>
                <ul>
                    <li>By customer location</li>
                    <li>By device type (servers, workstations, network)</li>
                    <li>By criticality level</li>
                    <li>By operating system</li>
                </ul>
                
                <h4>Custom Device Fields</h4>
                <div class="tutorial-tips">
                    <h4>💡 Useful Custom Fields</h4>
                    <ul>
                        <li>Asset tag numbers</li>
                        <li>Warranty expiration dates</li>
                        <li>Purchase information</li>
                        <li>Department assignments</li>
                        <li>Maintenance schedules</li>
                    </ul>
                </div>
                
                <h3>Technician Access Control</h3>
                
                <h4>Role-Based Permissions</h4>
                <ol>
                    <li>Create technician roles</li>
                    <li>Assign customer access permissions</li>
                    <li>Configure feature-level restrictions</li>
                    <li>Set approval workflows if needed</li>
                </ol>
                
                <h4>Permission Levels</h4>
                <div class="code-block">
                    <code>Access Levels:
- View Only: Monitor devices and tickets
- Technician: Full device access, limited admin
- Admin: Full access within assigned customers
- Super Admin: Global access across all customers</code>
                </div>
                
                <h3>Automation Policies</h3>
                
                <h4>Customer-Specific Policies</h4>
                <ul>
                    <li>Different maintenance schedules</li>
                    <li>Customer-specific alert thresholds</li>
                    <li>Customized script deployments</li>
                    <li>Unique backup policies</li>
                </ul>
                
                <h4>Global vs. Customer Policies</h4>
                <div class="code-block">
                    <code>Policy Hierarchy:
1. Global MSP policies (apply to all)
2. Customer-specific overrides
3. Site-specific modifications
4. Device-level exceptions</code>
                </div>
                
                <h3>Reporting and Analytics</h3>
                
                <h4>Customer-Specific Reports</h4>
                <ul>
                    <li>Device health summaries</li>
                    <li>Ticket resolution metrics</li>
                    <li>Software inventory reports</li>
                    <li>Security compliance status</li>
                </ul>
                
                <h4>MSP-Level Analytics</h4>
                <div class="tutorial-tips">
                    <h4>💡 Key MSP Metrics</h4>
                    <ul>
                        <li>Customer device count trends</li>
                        <li>Alert volume by customer</li>
                        <li>Technician productivity metrics</li>
                        <li>Revenue per customer analysis</li>
                    </ul>
                </div>
                
                <h3>Billing and Cost Management</h3>
                <ol>
                    <li>Track device counts per customer</li>
                    <li>Monitor license utilization</li>
                    <li>Generate customer billing reports</li>
                    <li>Analyze cost per customer</li>
                </ol>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Data Isolation</h4>
                    <p>Ensure proper customer data isolation and verify technician access permissions regularly to maintain security and compliance.</p>
                </div>
            </div>
        `
    },
    
    'atera-alerts': {
        title: 'Atera: alerting system and reporting setup',
        content: `
            <div class="tutorial-content">
                <h2>Atera: Alerting System and Reporting Setup</h2>
                
                <h3>Alert Configuration Overview</h3>
                <p>Atera's alerting system provides real-time notifications for device issues, performance problems, and security events.</p>
                
                <h3>Alert Types</h3>
                
                <h4>System Alerts</h4>
                <ul>
                    <li>Device offline notifications</li>
                    <li>High CPU/memory usage</li>
                    <li>Disk space warnings</li>
                    <li>Service failures</li>
                    <li>Hardware errors</li>
                </ul>
                
                <h4>Security Alerts</h4>
                <ul>
                    <li>Antivirus detection events</li>
                    <li>Failed login attempts</li>
                    <li>Firewall rule violations</li>
                    <li>Unauthorized software installation</li>
                    <li>Windows Defender alerts</li>
                </ul>
                
                <h3>Threshold Configuration</h3>
                
                <h4>Performance Thresholds</h4>
                <div class="code-block">
                    <code>Recommended Thresholds:
CPU Usage: > 80% for 10 minutes
Memory Usage: > 85% for 5 minutes
Disk Space: < 15% free space
Network: > 80% utilization for 15 minutes
Temperature: > 70°C for servers</code>
                </div>
                
                <h4>Custom Threshold Setup</h4>
                <ol>
                    <li>Navigate to Alerts > Thresholds</li>
                    <li>Select device or device group</li>
                    <li>Configure performance metrics</li>
                    <li>Set severity levels</li>
                    <li>Define notification recipients</li>
                </ol>
                
                <h3>Notification Channels</h3>
                
                <h4>Email Notifications</h4>
                <div class="tutorial-tips">
                    <h4>💡 Email Configuration Best Practices</h4>
                    <ul>
                        <li>Use distribution lists for team alerts</li>
                        <li>Set up escalation paths</li>
                        <li>Configure customer-specific notifications</li>
                        <li>Include relevant device information</li>
                    </ul>
                </div>
                
                <h4>SMS and Mobile Alerts</h4>
                <ol>
                    <li>Configure SMS gateway settings</li>
                    <li>Add mobile phone numbers</li>
                    <li>Set up critical alert SMS triggers</li>
                    <li>Test SMS delivery</li>
                </ol>
                
                <h4>Integration Notifications</h4>
                <div class="code-block">
                    <code>Supported Integrations:
- Microsoft Teams
- Slack
- Discord
- Webhook endpoints
- Custom API integrations</code>
                </div>
                
                <h3>Alert Management</h3>
                
                <h4>Alert Acknowledgment</h4>
                <ol>
                    <li>Review incoming alerts</li>
                    <li>Acknowledge to stop repeat notifications</li>
                    <li>Assign to appropriate technician</li>
                    <li>Add resolution notes</li>
                    <li>Close when resolved</li>
                </ol>
                
                <h4>Alert Suppression</h4>
                <ul>
                    <li>Planned maintenance windows</li>
                    <li>Known issue suppression</li>
                    <li>Duplicate alert filtering</li>
                    <li>Business hours configuration</li>
                </ul>
                
                <h3>Reporting Configuration</h3>
                
                <h4>Automated Reports</h4>
                <div class="code-block">
                    <code>Report Schedule Options:
- Daily summary reports at 8:00 AM
- Weekly detailed reports every Monday
- Monthly executive summaries
- Quarterly compliance reports
- Custom schedule options</code>
                </div>
                
                <h4>Report Customization</h4>
                <ol>
                    <li>Select report template</li>
                    <li>Choose data sources and metrics</li>
                    <li>Configure branding and layout</li>
                    <li>Set delivery schedule</li>
                    <li>Define recipient lists</li>
                </ol>
                
                <h3>Dashboard Setup</h3>
                
                <h4>Real-Time Monitoring</h4>
                <ul>
                    <li>Create custom dashboards</li>
                    <li>Add performance widgets</li>
                    <li>Configure alert status views</li>
                    <li>Set up customer-specific views</li>
                </ul>
                
                <h4>KPI Tracking</h4>
                <div class="tutorial-tips">
                    <h4>💡 Important KPIs to Track</h4>
                    <ul>
                        <li>Device uptime percentages</li>
                        <li>Average response times</li>
                        <li>Alert resolution rates</li>
                        <li>Customer satisfaction scores</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Alert Fatigue Prevention</h4>
                    <p>Carefully tune alert thresholds to avoid overwhelming technicians with false positives. Regular review and adjustment of alerting rules is essential.</p>
                </div>
            </div>
        `
    }
};