/* ===================================================================
   Microsoft Azure Tutorials - Comprehensive Cloud Security and Management
   =================================================================== */

window.AZURE_TUTORIALS = {
    'defender-servers': {
        title: 'Microsoft Defender for Servers deployment',
        content: `
            <div class="tutorial-content">
                <h2>Microsoft Defender for Servers Deployment</h2>
                
                <h3>Overview</h3>
                <p>Microsoft Defender for Servers provides advanced threat protection for Windows and Linux servers both in Azure and hybrid environments.</p>
                
                <h3>Prerequisites</h3>
                <ul>
                    <li>Azure subscription with Security Center enabled</li>
                    <li>Appropriate permissions (Security Admin or Contributor)</li>
                    <li>Log Analytics workspace</li>
                    <li>Target servers (Azure VMs, on-premises, or other clouds)</li>
                </ul>
                
                <h3>Enable Defender for Servers</h3>
                
                <h4>1. Enable in Azure Security Center</h4>
                <div class="code-block">
                    <code>Azure Portal Steps:
1. Navigate to Microsoft Defender for Cloud
2. Go to Environment Settings
3. Select your subscription
4. Enable "Servers" protection plan
5. Configure settings and save</code>
                </div>
                
                <h4>2. PowerShell Deployment</h4>
                <div class="code-block">
                    <code># Connect to Azure
Connect-AzAccount

# Enable Defender for Servers on subscription
$subscriptionId = "your-subscription-id"
Set-AzContext -SubscriptionId $subscriptionId

# Enable the pricing tier
Set-AzSecurityPricing -Name "VirtualMachines" -PricingTier "Standard"

# Verify deployment
Get-AzSecurityPricing | Where-Object {$_.Name -eq "VirtualMachines"}</code>
                </div>
                
                <h3>Agent Deployment</h3>
                
                <h4>Automatic Agent Installation</h4>
                <ol>
                    <li>Enable auto-provisioning in Security Center</li>
                    <li>Configure Log Analytics workspace</li>
                    <li>Set workspace region and retention</li>
                    <li>Agents deploy automatically to new VMs</li>
                </ol>
                
                <h4>Manual Agent Installation</h4>
                <div class="code-block">
                    <code># Windows Server installation
# Download and install Log Analytics agent
$WorkspaceID = "your-workspace-id"
$WorkspaceKey = "your-workspace-key"

# Install via PowerShell
$agent = New-Object -ComObject AgentConfigManager.MgmtSvcCfg
$agent.AddCloudWorkspace($WorkspaceID, $WorkspaceKey)
$agent.ReloadConfiguration()</code>
                </div>
                
                <h4>Linux Server Installation</h4>
                <div class="code-block">
                    <code># Download and install for Linux
wget https://raw.githubusercontent.com/Microsoft/OMS-Agent-for-Linux/master/installer/scripts/onboard_agent.sh

# Make executable and run
chmod +x onboard_agent.sh
sudo ./onboard_agent.sh -w workspace-id -s workspace-key

# Verify installation
sudo /opt/microsoft/omsagent/bin/service_control status</code>
                </div>
                
                <h3>Configuration and Features</h3>
                
                <h4>Security Policies</h4>
                <ul>
                    <li>Endpoint protection assessment</li>
                    <li>OS vulnerability assessment</li>
                    <li>Just-in-time VM access</li>
                    <li>Adaptive application controls</li>
                    <li>File integrity monitoring</li>
                </ul>
                
                <h4>Threat Detection</h4>
                <div class="tutorial-tips">
                    <h4>💡 Detection Capabilities</h4>
                    <ul>
                        <li>Behavioral analytics for anomaly detection</li>
                        <li>Machine learning-based threat detection</li>
                        <li>Integration with Microsoft Threat Intelligence</li>
                        <li>Fileless attack detection</li>
                        <li>Network layer attack detection</li>
                    </ul>
                </div>
                
                <h3>Monitoring and Alerts</h3>
                
                <h4>Security Alerts Configuration</h4>
                <div class="code-block">
                    <code># PowerShell - Configure alert notifications
$resourceGroup = "security-rg"
$actionGroupName = "security-alerts"

# Create action group for notifications
$emailReceiver = New-AzActionGroupReceiver -Name "SecurityTeam" -EmailReceiver -EmailAddress "security@company.com"
$smsReceiver = New-AzActionGroupReceiver -Name "OnCall" -SmsReceiver -CountryCode "1" -PhoneNumber "5551234567"

Set-AzActionGroup -ResourceGroupName $resourceGroup -Name $actionGroupName -Receiver $emailReceiver,$smsReceiver</code>
                </div>
                
                <h4>Custom Detection Rules</h4>
                <div class="code-block">
                    <code>// KQL query for custom detection
SecurityEvent
| where EventID == 4625 // Failed logon
| where TimeGenerated > ago(1h)
| summarize FailedAttempts = count() by Account, Computer, bin(TimeGenerated, 5m)
| where FailedAttempts > 5
| project TimeGenerated, Computer, Account, FailedAttempts</code>
                </div>
                
                <h3>Integration with SIEM</h3>
                
                <h4>Azure Sentinel Integration</h4>
                <ol>
                    <li>Enable Defender for Cloud connector in Sentinel</li>
                    <li>Configure data collection rules</li>
                    <li>Set up workbooks and analytics rules</li>
                    <li>Create incident response playbooks</li>
                </ol>
                
                <h4>Third-party SIEM Export</h4>
                <div class="code-block">
                    <code># Continuous export configuration
{
    "properties": {
        "dataTypes": [
            "SecurityAlert",
            "SecurityRecommendation"
        ],
        "isEnabled": true,
        "targetResourceId": "/subscriptions/subscription-id/resourceGroups/rg-name/providers/Microsoft.EventHub/namespaces/namespace-name/eventhubs/hub-name"
    }
}</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Cost Considerations</h4>
                    <p>Defender for Servers charges per server per month. Monitor usage and optimize coverage based on criticality.</p>
                </div>
            </div>
        `
    },
    
    'defender-cloud': {
        title: 'Microsoft Defender for Cloud configuration',
        content: `
            <div class="tutorial-content">
                <h2>Microsoft Defender for Cloud Configuration</h2>
                
                <h3>Initial Setup</h3>
                
                <h4>Enable Defender for Cloud</h4>
                <div class="code-block">
                    <code>Azure Portal Navigation:
1. Search for "Microsoft Defender for Cloud"
2. Go to Environment Settings
3. Select subscription
4. Enable enhanced security features
5. Configure each protection plan</code>
                </div>
                
                <h3>Protection Plans</h3>
                
                <h4>Available Protection Plans</h4>
                <ul>
                    <li>Servers - Advanced threat protection for VMs</li>
                    <li>App Service - Web application security</li>
                    <li>Databases - SQL database protection</li>
                    <li>Storage - Blob storage security</li>
                    <li>Containers - Kubernetes security</li>
                    <li>Key Vault - Key management protection</li>
                </ul>
                
                <h4>PowerShell Configuration</h4>
                <div class="code-block">
                    <code># Enable all protection plans
$subscriptionId = "your-subscription-id"
Set-AzContext -SubscriptionId $subscriptionId

# List available pricing tiers
Get-AzSecurityPricing

# Enable specific protection plans
Set-AzSecurityPricing -Name "VirtualMachines" -PricingTier "Standard"
Set-AzSecurityPricing -Name "SqlServers" -PricingTier "Standard"
Set-AzSecurityPricing -Name "AppServices" -PricingTier "Standard"
Set-AzSecurityPricing -Name "StorageAccounts" -PricingTier "Standard"</code>
                </div>
                
                <h3>Security Policies</h3>
                
                <h4>Built-in Security Policies</h4>
                <div class="code-block">
                    <code>Policy Categories:
- Azure Security Benchmark
- CIS Microsoft Azure Foundations
- PCI DSS 3.2.1
- SOC TSP
- ISO 27001
- NIST SP 800-53

Assignment Levels:
- Management Group
- Subscription  
- Resource Group
- Individual Resources</code>
                </div>
                
                <h4>Custom Policy Creation</h4>
                <div class="code-block">
                    <code># Azure Policy JSON example
{
    "if": {
        "allOf": [
            {
                "field": "type",
                "equals": "Microsoft.Storage/storageAccounts"
            },
            {
                "field": "Microsoft.Storage/storageAccounts/supportsHttpsTrafficOnly",
                "notEquals": "true"
            }
        ]
    },
    "then": {
        "effect": "audit"
    }
}</code>
                </div>
                
                <h3>Secure Score</h3>
                
                <h4>Understanding Secure Score</h4>
                <div class="tutorial-tips">
                    <h4>💡 Secure Score Components</h4>
                    <ul>
                        <li>Current score out of maximum points</li>
                        <li>Recommendations by category</li>
                        <li>Impact assessment for each recommendation</li>
                        <li>Historical trends and comparisons</li>
                    </ul>
                </div>
                
                <h4>Improving Secure Score</h4>
                <ol>
                    <li>Review high-impact recommendations first</li>
                    <li>Implement security controls systematically</li>
                    <li>Monitor score improvements over time</li>
                    <li>Address compliance requirements</li>
                </ol>
                
                <h3>Vulnerability Assessment</h3>
                
                <h4>Enable Vulnerability Assessment</h4>
                <div class="code-block">
                    <code># Enable VA for SQL databases
$resourceGroupName = "database-rg"
$serverName = "sql-server-01"

# Configure vulnerability assessment
Set-AzSqlServerVulnerabilityAssessmentSetting -ResourceGroupName $resourceGroupName -ServerName $serverName -StorageAccountName "vastorage" -ScanResultsContainerName "vulnerability-assessment" -RecurringScansInterval Weekly -EmailSubscriptionAdmins $true</code>
                </div>
                
                <h4>VM Vulnerability Scanning</h4>
                <ol>
                    <li>Deploy vulnerability assessment extension</li>
                    <li>Configure scanning schedules</li>
                    <li>Review vulnerability reports</li>
                    <li>Implement remediation recommendations</li>
                </ol>
                
                <h3>Regulatory Compliance</h3>
                
                <h4>Compliance Dashboard</h4>
                <div class="code-block">
                    <code>Compliance Standards Available:
- Azure Security Benchmark
- NIST SP 800-53 R4
- PCI DSS 3.2.1  
- ISO 27001:2013
- SOC TSP
- HIPAA HITRUST
- Canada Federal PBMM</code>
                </div>
                
                <h4>Custom Compliance Assessment</h4>
                <ol>
                    <li>Create custom initiative definitions</li>
                    <li>Group related policy definitions</li>
                    <li>Assign to appropriate scopes</li>
                    <li>Monitor compliance status</li>
                </ol>
                
                <h3>Integration and Automation</h3>
                
                <h4>Logic Apps Integration</h4>
                <div class="code-block">
                    <code># Workflow trigger for security alerts
{
    "triggers": {
        "When_a_HTTP_request_is_received": {
            "type": "Request",
            "kind": "Http"
        }
    },
    "actions": {
        "Parse_JSON": {
            "type": "ParseJson",
            "inputs": {
                "content": "@triggerBody()",
                "schema": {
                    "type": "object",
                    "properties": {
                        "alertDisplayName": {"type": "string"},
                        "severity": {"type": "string"},
                        "compromisedEntity": {"type": "string"}
                    }
                }
            }
        }
    }
}</code>
                </div>
                
                <h4>PowerBI Reporting</h4>
                <ol>
                    <li>Connect PowerBI to Log Analytics workspace</li>
                    <li>Import security data using KQL queries</li>
                    <li>Create security dashboards</li>
                    <li>Schedule automated report delivery</li>
                </ol>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Cost Management</h4>
                    <p>Monitor Defender for Cloud costs regularly and optimize protection plans based on actual usage and criticality.</p>
                </div>
            </div>
        `
    },
    
    'intune-setup': {
        title: 'Microsoft Intune device management setup',
        content: `
            <div class="tutorial-content">
                <h2>Microsoft Intune Device Management Setup</h2>
                
                <h3>Initial Configuration</h3>
                
                <h4>Enable Intune Services</h4>
                <div class="code-block">
                    <code>Microsoft 365 Admin Center:
1. Navigate to Setup > Domains
2. Verify domain ownership
3. Go to Azure AD > Mobility (MDM and MAM)
4. Configure Microsoft Intune MDM authority
5. Set user scope (All, Some, None)</code>
                </div>
                
                <h4>PowerShell Configuration</h4>
                <div class="code-block">
                    <code># Connect to Microsoft Graph
Connect-MgGraph -Scopes "DeviceManagementConfiguration.ReadWrite.All"

# Get Intune service configuration
Get-MgDeviceManagementDeviceConfiguration

# Create configuration profile
$configProfile = @{
    "@odata.type" = "#microsoft.graph.windows10GeneralConfiguration"
    displayName = "Corporate Security Policy"
    description = "Standard security configuration for corporate devices"
}</code>
                </div>
                
                <h3>Device Enrollment</h3>
                
                <h4>Windows Autopilot Setup</h4>
                <ol>
                    <li>Upload device hardware hashes</li>
                    <li>Create Autopilot deployment profiles</li>
                    <li>Assign profiles to device groups</li>
                    <li>Configure Windows Autopilot settings</li>
                </ol>
                
                <h4>Device Enrollment Restrictions</h4>
                <div class="code-block">
                    <code>Enrollment Restrictions Configuration:
Device Type Restrictions:
- Allow/Block Android devices
- Allow/Block iOS devices  
- Allow/Block Windows devices
- Allow/Block macOS devices

Device Limit Restrictions:
- Maximum devices per user
- Platform-specific limits</code>
                </div>
                
                <h3>Configuration Profiles</h3>
                
                <h4>Windows 10/11 Configuration</h4>
                <div class="code-block">
                    <code>Key Configuration Areas:
Device Restrictions:
- Camera and recording settings
- Cloud and storage settings
- Connectivity options
- Control panel and settings access

Security Settings:
- BitLocker encryption
- Windows Defender settings
- Windows Update policies
- Password requirements</code>
                </div>
                
                <h4>iOS/iPadOS Configuration</h4>
                <div class="code-block">
                    <code>iOS Device Configuration:
General Settings:
- Passcode requirements
- Touch ID/Face ID settings
- App Store restrictions
- Safari security settings

Security Features:
- VPN configuration
- Wi-Fi profiles
- Certificate deployment
- Email account setup</code>
                </div>
                
                <h3>Application Management</h3>
                
                <h4>App Deployment Strategies</h4>
                <ul>
                    <li>Required apps (automatically install)</li>
                    <li>Available apps (user installs from portal)</li>
                    <li>Uninstall apps (remove from devices)</li>
                    <li>App configuration policies</li>
                </ul>
                
                <h4>Line-of-Business App Deployment</h4>
                <div class="code-block">
                    <code>LOB App Upload Process:
1. Prepare app package (.msi, .exe, .appx for Windows)
2. Upload to Intune Apps section
3. Configure app information and requirements
4. Create assignments to user/device groups
5. Monitor deployment status</code>
                </div>
                
                <h3>Compliance Policies</h3>
                
                <h4>Device Compliance Settings</h4>
                <div class="code-block">
                    <code>Compliance Requirements:
Device Health:
- Minimum OS version
- Maximum OS version
- Device encryption required
- Jailbreak/Root detection

Security Settings:
- Antivirus protection required
- Real-time protection enabled
- Firewall enabled
- Secure boot enabled

Password Policy:
- Minimum password length
- Password complexity
- Maximum password age
- Previous password reuse</code>
                </div>
                
                <h4>Conditional Access Integration</h4>
                <ol>
                    <li>Create compliance policies in Intune</li>
                    <li>Configure conditional access in Azure AD</li>
                    <li>Set compliance as requirement for access</li>
                    <li>Define actions for non-compliant devices</li>
                </ol>
                
                <h3>Mobile Application Management (MAM)</h3>
                
                <h4>App Protection Policies</h4>
                <div class="code-block">
                    <code>MAM Policy Configuration:
Data Transfer:
- Backup restrictions
- Cut, copy, paste restrictions
- Data transfer between apps
- Save-as restrictions

Access Requirements:
- PIN requirements
- Corporate credentials
- Fingerprint authentication
- Minimum app version

Conditional Launch:
- Max PIN attempts
- Offline grace period
- Jailbroken/rooted device check
- Min OS version requirement</code>
                </div>
                
                <h3>Monitoring and Reporting</h3>
                
                <h4>Device Status Monitoring</h4>
                <div class="tutorial-tips">
                    <h4>💡 Key Monitoring Areas</h4>
                    <ul>
                        <li>Device enrollment status</li>
                        <li>Compliance policy adherence</li>
                        <li>Configuration profile deployment</li>
                        <li>Application installation status</li>
                        <li>Security baseline compliance</li>
                    </ul>
                </div>
                
                <h4>Custom Reports</h4>
                <div class="code-block">
                    <code># PowerShell - Export device compliance report
$devices = Get-MgDeviceManagementManagedDevice -All

$complianceReport = $devices | ForEach-Object {
    [PSCustomObject]@{
        DeviceName = $_.DeviceName
        UserName = $_.UserDisplayName
        OS = $_.OperatingSystem
        ComplianceState = $_.ComplianceState
        LastCheckIn = $_.LastSyncDateTime
        DeviceId = $_.Id
    }
}

$complianceReport | Export-Csv -Path "DeviceComplianceReport.csv" -NoTypeInformation</code>
                </div>
                
                <h3>Troubleshooting</h3>
                
                <h4>Common Issues and Solutions</h4>
                <div class="code-block">
                    <code>Enrollment Issues:
- Check DNS configuration
- Verify firewall ports (443, 80)
- Validate certificates
- Review enrollment restrictions

Policy Deployment Issues:
- Check group assignments
- Verify device check-in status
- Review policy conflicts
- Check assignment filters</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Always test configuration profiles and compliance policies in a pilot group before broad deployment to avoid business disruption.</p>
                </div>
            </div>
        `
    }
};