/**
 * Velocity Lab - Microsoft Azure Tutorials
 * Comprehensive Azure guides for MSP professionals
 */

window.AZURE_TUTORIALS = {
  'defender-servers': {
    title: 'Microsoft Defender for Servers deployment',
    category: 'azure',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>🛡️ Microsoft Defender for Servers Deployment</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Deploy and configure Microsoft Defender for Servers across your infrastructure for advanced threat protection, vulnerability management, and security monitoring.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Azure subscription with Security Center access</li>
          <li>Global Administrator or Security Administrator role</li>
          <li>Servers running Windows Server 2012 R2+ or Linux</li>
          <li>Log Analytics workspace (recommended)</li>
        </ul>

        <h3>🚀 Step 1: Enable Defender for Servers</h3>
        <h4>Via Azure Portal</h4>
        <ol>
          <li>Navigate to <strong>Microsoft Defender for Cloud</strong></li>
          <li>Go to <strong>Environment settings</strong></li>
          <li>Select your subscription</li>
          <li>Enable <strong>Defender for Servers Plan 2</strong>:
            <ul>
              <li>Includes vulnerability assessment</li>
              <li>Just-in-time VM access</li>
              <li>File integrity monitoring</li>
              <li>Behavioral analytics</li>
            </ul>
          </li>
          <li>Configure data collection settings</li>
        </ol>

        <h4>Via PowerShell</h4>
        <div class="code-block">
          <code># Connect to Azure
Connect-AzAccount

# Enable Defender for Servers
Set-AzSecurityPricing -Name "VirtualMachines" -PricingTier "Standard"

# Configure auto-provisioning for Log Analytics agent
Set-AzSecurityAutoProvisioningSetting -Name "default" -EnableAutoProvisioning</code>
        </div>

        <h3>🔧 Step 2: Deploy Log Analytics Agent</h3>
        <h4>Automatic Deployment</h4>
        <div class="code-block">
          <code># Enable auto-provisioning via PowerShell
Set-AzSecurityAutoProvisioningSetting -Name "default" -EnableAutoProvisioning

# Configure workspace
$workspace = Get-AzOperationalInsightsWorkspace -ResourceGroupName "security-rg" -Name "security-workspace"
Set-AzSecurityWorkspaceSetting -Name "default" -Scope "/subscriptions/subscription-id" -WorkspaceId $workspace.ResourceId</code>
        </div>

        <h4>Manual Deployment for Specific VMs</h4>
        <div class="code-block">
          <code># Deploy to Windows VM
$vm = Get-AzVM -ResourceGroupName "myRG" -Name "myWindowsVM"
Set-AzVMExtension -ResourceGroupName "myRG" -VMName "myWindowsVM" -Name "MicrosoftMonitoringAgent" -Publisher "Microsoft.EnterpriseCloud.Monitoring" -Type "MicrosoftMonitoringAgent" -TypeHandlerVersion "1.0" -Settings @{"workspaceId" = "workspace-id"} -ProtectedSettings @{"workspaceKey" = "workspace-key"}

# Deploy to Linux VM  
Set-AzVMExtension -ResourceGroupName "myRG" -VMName "myLinuxVM" -Name "OmsAgentForLinux" -Publisher "Microsoft.EnterpriseCloud.Monitoring" -Type "OmsAgentForLinux" -TypeHandlerVersion "1.13" -Settings @{"workspaceId" = "workspace-id"} -ProtectedSettings @{"workspaceKey" = "workspace-key"}</code>
        </div>

        <h3>🔍 Step 3: Configure Vulnerability Assessment</h3>
        <h4>Enable Qualys Scanner</h4>
        <ol>
          <li>In Defender for Cloud, go to <strong>Recommendations</strong></li>
          <li>Find "Vulnerability assessment solution should be enabled on virtual machines"</li>
          <li>Select VMs and click <strong>Remediate</strong></li>
          <li>Choose deployment method:
            <ul>
              <li><strong>Microsoft Defender vulnerability management:</strong> Built-in scanner</li>
              <li><strong>Qualys:</strong> Third-party integration</li>
            </ul>
          </li>
        </ol>

        <h4>PowerShell Deployment</h4>
        <div class="code-block">
          <code># Enable Qualys vulnerability assessment
$vm = Get-AzVM -ResourceGroupName "myRG" -Name "myVM"
Set-AzVMExtension -ResourceGroupName "myRG" -VMName "myVM" -Name "WindowsAgent.AzureSecurityCenter" -Publisher "Qualys" -Type "WindowsAgent.AzureSecurityCenter" -TypeHandlerVersion "1.0"</code>
        </div>

        <h3>🔐 Step 4: Configure Just-in-Time Access</h3>
        <h4>Enable JIT for VMs</h4>
        <ol>
          <li>Navigate to <strong>Workload protections</strong> → <strong>Just-in-time VM access</strong></li>
          <li>Select VMs to protect</li>
          <li>Click <strong>Enable JIT on VMs</strong></li>
          <li>Configure port access rules:
            <div class="code-block">
              <code># Default JIT configuration
RDP (3389): 3 hours max, source IP restrictions
SSH (22): 3 hours max, source IP restrictions  
WinRM (5985/5986): 3 hours max, source IP restrictions
PowerShell (5985): 3 hours max, source IP restrictions</code>
            </div>
          </li>
        </ol>

        <h4>Request JIT Access</h4>
        <div class="code-block">
          <code># PowerShell to request JIT access
$vm = Get-AzVM -ResourceGroupName "myRG" -Name "myVM"
$requestTimeString = [DateTime]::Now.AddHours(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$jitPolicy = @{
    "kind" = "initiate"
    "virtualMachines" = @(
        @{
            "id" = $vm.Id
            "ports" = @(
                @{
                    "number" = 3389
                    "endTimeUtc" = $requestTimeString
                    "allowedSourceAddressPrefix" = "192.168.1.100"
                }
            )
        }
    )
}

Invoke-AzRestMethod -Path "/subscriptions/subscription-id/resourceGroups/myRG/providers/Microsoft.Security/locations/centralus/jitNetworkAccessPolicies/default/initiate?api-version=2020-01-01" -Method POST -Payload ($jitPolicy | ConvertTo-Json -Depth 5)</code>
        </div>

        <h3>📊 Step 5: Configure Advanced Threat Protection</h3>
        <h4>Enable Behavioral Analytics</h4>
        <div class="code-block">
          <code># Configure advanced threat detection
# This is done through workspace configuration
$workspace = Get-AzOperationalInsightsWorkspace -ResourceGroupName "security-rg" -Name "security-workspace"

# Enable security solutions
Set-AzOperationalInsightsIntelligencePack -ResourceGroupName "security-rg" -WorkspaceName "security-workspace" -IntelligencePackName "Security" -Enabled $true
Set-AzOperationalInsightsIntelligencePack -ResourceGroupName "security-rg" -WorkspaceName "security-workspace" -IntelligencePackName "SecurityCenterFree" -Enabled $true</code>
        </div>

        <h4>Custom Detection Rules</h4>
        <div class="code-block">
          <code>// KQL query for suspicious PowerShell activity
SecurityEvent
| where EventID == 4688
| where Process contains "powershell.exe"
| where CommandLine contains "-EncodedCommand" or CommandLine contains "-enc"
| where CommandLine contains "DownloadString" or CommandLine contains "IEX"
| project TimeGenerated, Computer, Account, CommandLine
| order by TimeGenerated desc</code>
        </div>

        <h3>🔍 Step 6: File Integrity Monitoring</h3>
        <h4>Configure FIM Settings</h4>
        <ol>
          <li>Go to <strong>Workload protections</strong> → <strong>File Integrity Monitoring</strong></li>
          <li>Enable FIM for desired workspaces</li>
          <li>Configure monitoring settings:
            <ul>
              <li><strong>Windows files:</strong> System32, Program Files, Windows</li>
              <li><strong>Windows registry:</strong> Security, System, Software hives</li>
              <li><strong>Linux files:</strong> /etc, /usr/bin, /sbin</li>
            </ul>
          </li>
        </ol>

        <h4>Custom FIM Rules</h4>
        <div class="code-block">
          <code># Add custom Windows path
$customPath = @{
    "path" = "C:\\MyApp\\Config"
    "recursive" = $true
    "uploadOnChange" = $false
}

# Add custom Linux path  
$linuxPath = @{
    "path" = "/opt/myapp/config"
    "recursive" = $true
    "uploadOnChange" = $false
}</code>
        </div>

        <h3>📈 Step 7: Security Monitoring and Alerting</h3>
        <h4>Configure Security Alerts</h4>
        <div class="code-block">
          <code># Create action group for notifications
$actionGroup = Set-AzActionGroup -ResourceGroupName "security-rg" -Name "security-alerts" -ShortName "SecAlerts" -EmailReceiver @{Name="SecurityTeam"; EmailAddress="security@company.com"}

# Create alert rule for high severity findings
$criteria = New-AzMetricAlertRuleV2Criteria -MetricName "High severity recommendations" -Operator "GreaterThan" -Threshold 0

New-AzMetricAlertRuleV2 -ResourceGroupName "security-rg" -Name "HighSeverityFindings" -Description "Alert on high severity security findings" -Severity 1 -Enabled $true -Scopes "/subscriptions/subscription-id" -TargetResourceType "Microsoft.Security/assessments" -WindowSize "PT5M" -EvaluationFrequency "PT1M" -Criteria $criteria -ActionGroupId $actionGroup.Id</code>
        </div>

        <h4>Custom Alert Queries</h4>
        <div class="code-block">
          <code>// Alert on new vulnerabilities
SecurityRecommendation
| where RecommendationSeverity == "High"
| where TimeGenerated > ago(1h)
| summarize count() by RecommendationDisplayName, AssessedResourceType
| where count_ > 0

// Alert on suspicious login activities  
SecurityEvent
| where EventID in (4624, 4625)
| where TimeGenerated > ago(1h)
| where LogonType in (2, 3, 10)
| summarize FailedLogins = countif(EventID == 4625), SuccessfulLogins = countif(EventID == 4624) by Account, Computer
| where FailedLogins > 5</code>
        </div>

        <h3>🔧 Step 8: Integration with SIEM</h3>
        <h4>Export to Azure Sentinel</h4>
        <div class="code-block">
          <code># Connect Defender for Cloud to Sentinel
# In Azure Sentinel, go to Data connectors
# Enable "Azure Security Center" connector
# This automatically ingests security alerts and recommendations

# Custom data export setup
$exportConfiguration = @{
    "properties" = @{
        "dataTypes" = @("SecurityRecommendations", "SecurityAlerts", "RegulatoryComplianceAssessment")
        "isEnabled" = $true
        "targetResourceId" = "/subscriptions/subscription-id/resourceGroups/sentinel-rg/providers/Microsoft.OperationalInsights/workspaces/sentinel-workspace"
    }
}

Invoke-AzRestMethod -Path "/subscriptions/subscription-id/providers/Microsoft.Security/dataExportSettings/default?api-version=2021-01-15-preview" -Method PUT -Payload ($exportConfiguration | ConvertTo-Json -Depth 5)</code>
        </div>

        <h3>💰 Step 9: Cost Optimization</h3>
        <h4>Monitor Defender Costs</h4>
        <div class="code-block">
          <code># Get Defender for Servers pricing
Get-AzSecurityPricing | Where-Object {$_.Name -eq "VirtualMachines"}

# Monitor usage and costs
$usage = Get-AzConsumptionUsageDetail -StartDate (Get-Date).AddDays(-30) -EndDate (Get-Date) | Where-Object {$_.ConsumedService -like "*Security*"}
$usage | Group-Object ConsumedService | Select-Object Name, @{Name="TotalCost";Expression={($_.Group | Measure-Object PretaxCost -Sum).Sum}}</code>
        </div>

        <div class="tutorial-warning">
          <h4>💡 Cost Management Tips</h4>
          <ul>
            <li>Use Plan 1 for basic protection if advanced features aren't needed</li>
            <li>Selectively enable Defender for critical servers only</li>
            <li>Monitor and optimize Log Analytics data ingestion</li>
            <li>Use resource tagging for cost allocation</li>
          </ul>
        </div>

        <h3>🚨 Troubleshooting Common Issues</h3>
        <div class="tutorial-warning">
          <h4>⚠️ Common Problems</h4>
          <ul>
            <li><strong>Agent not installing:</strong> Check VM extensions and network connectivity</li>
            <li><strong>No vulnerability data:</strong> Verify Qualys extension is running</li>
            <li><strong>JIT access fails:</strong> Check NSG rules and firewall settings</li>
            <li><strong>Missing recommendations:</strong> Ensure proper permissions and policy assignment</li>
          </ul>
        </div>

        <h4>Diagnostic Commands</h4>
        <div class="code-block">
          <code># Check VM extensions
Get-AzVMExtension -ResourceGroupName "myRG" -VMName "myVM"

# Verify Log Analytics connectivity
# On Windows VM:
C:\\Windows\\System32\\config\\systemprofile\\AppData\\Local\\SCOM\\Logs\\OpsMgrTrace.log

# Check security events
Get-WinEvent -LogName Security -MaxEvents 100 | Where-Object {$_.Id -eq 4624 -or $_.Id -eq 4625}</code>
        </div>

        <h3>📊 Step 10: Reporting and Compliance</h3>
        <h4>Generate Security Reports</h4>
        <div class="code-block">
          <code># PowerShell script for security posture report
$subscriptionId = "your-subscription-id"
$assessments = Get-AzSecurityAssessment

$report = @()
foreach ($assessment in $assessments) {
    $report += [PSCustomObject]@{
        ResourceName = $assessment.ResourceDetails.Id.Split('/')[-1]
        AssessmentName = $assessment.DisplayName
        Severity = $assessment.Status.Severity
        Status = $assessment.Status.Code
        Description = $assessment.Status.Description
    }
}

$report | Export-Csv -Path "SecurityPostureReport.csv" -NoTypeInformation</code>
        </div>

        <h4>Compliance Dashboard</h4>
        <ul>
          <li><strong>Regulatory compliance:</strong> Monitor PCI DSS, ISO 27001, SOC TSP</li>
          <li><strong>Security score:</strong> Track improvement over time</li>
          <li><strong>Vulnerability trends:</strong> Analyze risk reduction</li>
          <li><strong>Incident response:</strong> Track alert resolution times</li>
        </ul>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Enable Defender for all production servers</li>
            <li>Regularly review and act on security recommendations</li>
            <li>Implement JIT access for all internet-facing VMs</li>
            <li>Set up automated alerting for high-severity issues</li>
            <li>Integrate with existing SIEM/SOAR solutions</li>
            <li>Regular security posture reviews and reporting</li>
          </ul>
        </div>

        <h3>🔄 Automation and Scaling</h3>
        <h4>Azure Policy for Auto-Enablement</h4>
        <div class="code-block">
          <code>{
  "mode": "All",
  "policyRule": {
    "if": {
      "field": "type",
      "equals": "Microsoft.Compute/virtualMachines"
    },
    "then": {
      "effect": "DeployIfNotExists",
      "details": {
        "type": "Microsoft.Compute/virtualMachines/extensions",
        "name": "MicrosoftMonitoringAgent",
        "deployment": {
          "properties": {
            "mode": "incremental",
            "template": {
              "$schema": "https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#",
              "contentVersion": "1.0.0.0",
              "resources": [
                {
                  "type": "Microsoft.Compute/virtualMachines/extensions",
                  "name": "[concat(parameters('vmName'), '/MicrosoftMonitoringAgent')]",
                  "properties": {
                    "publisher": "Microsoft.EnterpriseCloud.Monitoring",
                    "type": "MicrosoftMonitoringAgent",
                    "settings": {
                      "workspaceId": "[parameters('workspaceId')]"
                    },
                    "protectedSettings": {
                      "workspaceKey": "[parameters('workspaceKey')]"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
}</code>
        </div>
      </div>
    `
  },

  'defender-cloud': {
    title: 'Microsoft Defender for Cloud configuration',
    category: 'azure',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    content: `
      <div class="tutorial-content">
        <h2>☁️ Microsoft Defender for Cloud Configuration</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Comprehensive setup and configuration of Microsoft Defender for Cloud for multi-cloud security posture management, regulatory compliance, and threat protection.</p>
        </div>

        <h3>🏗️ Architecture Overview</h3>
        <ul>
          <li><strong>Security Posture Management:</strong> CSPM across Azure, AWS, GCP</li>
          <li><strong>Workload Protection:</strong> CWPP for servers, containers, databases</li>
          <li><strong>Regulatory Compliance:</strong> Built-in compliance standards</li>
          <li><strong>Threat Intelligence:</strong> Microsoft security research integration</li>
        </ul>

        <h3>🚀 Step 1: Initial Setup and Configuration</h3>
        <h4>Enable Enhanced Security Features</h4>
        <div class="code-block">
          <code># PowerShell setup
Connect-AzAccount
Set-AzContext -SubscriptionId "your-subscription-id"

# Enable all Defender plans
$plans = @(
    "AppServices",
    "ContainerRegistry", 
    "KeyVaults",
    "KubernetesService",
    "SqlServers",
    "SqlServerVirtualMachines",
    "StorageAccounts",
    "VirtualMachines",
    "Arm",
    "Dns",
    "OpenSourceRelationalDatabases",
    "Containers"
)

foreach ($plan in $plans) {
    Set-AzSecurityPricing -Name $plan -PricingTier "Standard"
    Write-Host "Enabled Defender for $plan"
}</code>
        </div>

        <h4>Configure Environment Settings</h4>
        <div class="code-block">
          <code># Configure data collection settings
Set-AzSecurityAutoProvisioningSetting -Name "default" -EnableAutoProvisioning

# Set up workspace configuration
$workspace = Get-AzOperationalInsightsWorkspace -ResourceGroupName "security-rg" -Name "central-security-workspace"
Set-AzSecurityWorkspaceSetting -Name "default" -Scope "/subscriptions/your-subscription-id" -WorkspaceId $workspace.ResourceId

# Configure email notifications
Set-AzSecurityContact -Email "security-team@company.com" -Phone "+1234567890" -AlertAdmin -AlertNotificationPref</code>
        </div>

        <h3>🌐 Step 2: Multi-Cloud Integration</h3>
        <h4>Connect AWS Account</h4>
        <ol>
          <li>In Defender for Cloud, go to <strong>Environment settings</strong></li>
          <li>Click <strong>Add environment</strong> → <strong>Amazon Web Services</strong></li>
          <li>Configure AWS connector:
            <ul>
              <li>Create IAM role in AWS with required permissions</li>
              <li>Configure CloudFormation template</li>
              <li>Set up cross-account trust</li>
            </ul>
          </li>
        </ol>

        <h4>AWS CloudFormation Template (excerpts)</h4>
        <div class="code-block">
          <code>{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Description": "Microsoft Defender for Cloud AWS Connector",
  "Resources": {
    "DefenderForCloudRole": {
      "Type": "AWS::IAM::Role",
      "Properties": {
        "AssumeRolePolicyDocument": {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Allow",
              "Principal": {
                "AWS": "arn:aws:iam::158177204117:root"
              },
              "Action": "sts:AssumeRole",
              "Condition": {
                "StringEquals": {
                  "sts:ExternalId": "your-external-id"
                }
              }
            }
          ]
        },
        "ManagedPolicyArns": [
          "arn:aws:iam::aws:policy/SecurityAudit",
          "arn:aws:iam::aws:policy/AmazonSSMAutomationRole"
        ]
      }
    }
  }
}</code>
        </div>

        <h4>Connect GCP Project</h4>
        <div class="code-block">
          <code># GCP setup commands
# Create service account
gcloud iam service-accounts create defender-for-cloud --display-name="Microsoft Defender for Cloud"

# Grant required roles
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:defender-for-cloud@PROJECT_ID.iam.gserviceaccount.com" --role="roles/iam.securityReviewer"

gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:defender-for-cloud@PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudasset.viewer"

# Create and download key
gcloud iam service-accounts keys create defender-key.json --iam-account=defender-for-cloud@PROJECT_ID.iam.gserviceaccount.com</code>
        </div>

        <h3>📊 Step 3: Advanced Security Policies</h3>
        <h4>Custom Security Initiatives</h4>
        <div class="code-block">
          <code># Create custom initiative definition
$initiative = @{
    "properties" = @{
        "displayName" = "Company Security Baseline"
        "description" = "Custom security requirements for company infrastructure"
        "policyDefinitions" = @(
            @{
                "policyDefinitionId" = "/providers/Microsoft.Authorization/policyDefinitions/404c3081-a854-4457-ae30-26a93ef643f9"
                "parameters" = @{
                    "effect" = @{
                        "value" = "Audit"
                    }
                }
            },
            @{
                "policyDefinitionId" = "/providers/Microsoft.Authorization/policyDefinitions/1a5b4dca-0b6f-4cf5-907c-56316bc1bf3d" 
                "parameters" = @{
                    "effect" = @{
                        "value" = "Deny"
                    }
                }
            }
        )
    }
}

# Deploy initiative
New-AzPolicySetDefinition -Name "CompanySecurityBaseline" -PolicyDefinition ($initiative | ConvertTo-Json -Depth 10)</code>
        </div>

        <h4>Regulatory Compliance Configuration</h4>
        <div class="code-block">
          <code># Enable specific compliance standards
$complianceStandards = @(
    "Azure-Security-Benchmark",
    "PCI-DSS-3.2.1",
    "ISO-27001",
    "SOC-TSP",
    "NIST-SP-800-53-R4",
    "NIST-SP-800-171-R2"
)

foreach ($standard in $complianceStandards) {
    # This is typically done through the portal or REST API
    Write-Host "Configure compliance standard: $standard"
}</code>
        </div>

        <h3>🔧 Step 4: Advanced Threat Protection</h3>
        <h4>Container Security Configuration</h4>
        <div class="code-block">
          <code># Enable Defender for Containers
Set-AzSecurityPricing -Name "Containers" -PricingTier "Standard"

# Configure container registry scanning
$acrPolicy = @{
    "properties" = @{
        "displayName" = "Configure container registries to scan images"
        "policyType" = "BuiltIn"
        "mode" = "All"
        "description" = "Enable vulnerability scanning for container images"
    }
}

# Kubernetes configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: defender-config
  namespace: kube-system
data:
  config.yaml: |
    cluster:
      name: "production-cluster"
      region: "eastus"
    defender:
      enabled: true
      workspaceId: "your-workspace-id"
      workspaceKey: "your-workspace-key"</code>
        </div>

        <h4>Database Protection Setup</h4>
        <div class="code-block">
          <code># Enable Defender for SQL Servers
Set-AzSecurityPricing -Name "SqlServers" -PricingTier "Standard"
Set-AzSecurityPricing -Name "SqlServerVirtualMachines" -PricingTier "Standard"
Set-AzSecurityPricing -Name "OpenSourceRelationalDatabases" -PricingTier "Standard"

# Configure SQL vulnerability assessment
$sqlServerName = "your-sql-server"
$resourceGroupName = "your-rg"

# Enable Advanced Data Security
Set-AzSqlServerAdvancedDataSecurityPolicy -ResourceGroupName $resourceGroupName -ServerName $sqlServerName -IsEnabled $true

# Configure vulnerability assessment storage
Set-AzSqlServerVulnerabilityAssessmentSetting -ResourceGroupName $resourceGroupName -ServerName $sqlServerName -StorageAccountName "sqlvastorage" -ScanTriggerType "Recurring" -RecurringScansInterval "Weekly" -EmailAdmins $true</code>
        </div>

        <h3>📈 Step 5: Advanced Analytics and Hunting</h3>
        <h4>Custom KQL Queries for Security Insights</h4>
        <div class="code-block">
          <code>// Advanced threat hunting queries

// Suspicious PowerShell activity across all machines
SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4688
| where Process endswith "powershell.exe" or Process endswith "pwsh.exe"
| where CommandLine contains "-EncodedCommand" or CommandLine contains "-enc" or CommandLine contains "downloadstring" or CommandLine contains "iex"
| extend DecodedCommand = base64_decode_tostring(extract(@"-EncodedCommand\s+([A-Za-z0-9+/=]+)", 1, CommandLine))
| project TimeGenerated, Computer, Account, Process, CommandLine, DecodedCommand
| order by TimeGenerated desc

// Network connection anomalies
SecurityEvent 
| where TimeGenerated > ago(7d)
| where EventID == 5156
| summarize count() by Computer, DestAddress, DestPort
| where count_ > 1000
| order by count_ desc

// Failed login attempts with geo-location analysis
SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != 0
| extend Country = tostring(LocationDetails.countryOrRegion)
| extend City = tostring(LocationDetails.city)
| summarize FailedAttempts = count() by UserPrincipalName, Country, City, IPAddress
| where FailedAttempts > 10
| order by FailedAttempts desc</code>
        </div>

        <h4>Custom Analytics Rules</h4>
        <div class="code-block">
          <code># Create custom detection rule
$ruleProperties = @{
    "displayName" = "Suspicious Process Execution"
    "description" = "Detects suspicious process execution patterns"
    "severity" = "High"
    "enabled" = $true
    "query" = @"
SecurityEvent
| where TimeGenerated > ago(1h)
| where EventID == 4688
| where Process in ('net.exe', 'net1.exe', 'whoami.exe', 'nltest.exe')
| where CommandLine contains 'domain admins' or CommandLine contains 'enterprise admins'
| summarize count() by Computer, Account
| where count_ > 3
"@
    "queryFrequency" = "PT1H"
    "queryPeriod" = "PT4H"
    "triggerOperator" = "GreaterThan"
    "triggerThreshold" = 0
}

# Deploy via REST API or ARM template</code>
        </div>

        <h3>🚨 Step 6: Incident Response Automation</h3>
        <h4>Logic Apps Integration</h4>
        <div class="code-block">
          <code>{
  "$schema": "https://schema.management.azure.com/schemas/2016-06-01/Microsoft.Logic.json",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "connections_azureloganalyticsdatacollector_externalid": {
      "defaultValue": "/subscriptions/subscription-id/resourceGroups/rg/providers/Microsoft.Web/connections/azureloganalyticsdatacollector",
      "type": "String"
    }
  },
  "triggers": {
    "When_a_response_to_an_Azure_Sentinel_alert_is_triggered": {
      "type": "ApiConnectionWebhook",
      "inputs": {
        "host": {
          "connection": {
            "name": "@parameters('connections_azuresentinel_externalid')"
          }
        },
        "body": {
          "callback_url": "@{listCallbackUrl()}"
        },
        "path": "/subscribe"
      }
    }
  },
  "actions": {
    "Isolate_machine": {
      "type": "Http",
      "inputs": {
        "uri": "https://graph.microsoft.com/v1.0/security/alerts/@{triggerBody()?['SystemAlertId']}/isolateMachine",
        "method": "POST",
        "authentication": {
          "type": "ManagedServiceIdentity"
        }
      }
    }
  }
}</code>
        </div>

        <h4>PowerShell Automation Scripts</h4>
        <div class="code-block">
          <code># Automated response to high-severity alerts
function Invoke-SecurityResponse {
    param(
        [Parameter(Mandatory=$true)]
        [string]$AlertId,
        
        [Parameter(Mandatory=$true)]
        [string]$Severity,
        
        [Parameter(Mandatory=$true)]
        [string]$ComputerName
    )
    
    if ($Severity -eq "High") {
        # Isolate machine
        Invoke-AzRestMethod -Path "/subscriptions/subscription-id/resourceGroups/rg/providers/Microsoft.Security/advancedThreatProtectionSettings/current/isolateMachine" -Method POST -Payload @{computerName=$ComputerName}
        
        # Create incident ticket
        $ticketData = @{
            title = "High Severity Security Alert: $AlertId"
            description = "Automated isolation performed for computer: $ComputerName"
            severity = "High"
            assignee = "security-team@company.com"
        }
        
        # Send to ticketing system
        Invoke-RestMethod -Uri "https://api.ticketsystem.com/incidents" -Method POST -Body ($ticketData | ConvertTo-Json) -ContentType "application/json"
        
        # Notify security team
        Send-MailMessage -To "security-team@company.com" -Subject "URGENT: Security Incident $AlertId" -Body "Machine $ComputerName has been isolated due to high-severity security alert."
    }
}

# Schedule this script to run periodically or trigger from alerts</code>
        </div>

        <h3>📊 Step 7: Advanced Reporting and Dashboards</h3>
        <h4>PowerBI Integration</h4>
        <div class="code-block">
          <code># Export security data to PowerBI
$workspace = Get-AzOperationalInsightsWorkspace -ResourceGroupName "security-rg" -Name "security-workspace"

# Create data export rule
$exportRule = @{
    "properties" = @{
        "dataExportId" = "security-export"
        "tableNames" = @("SecurityAlert", "SecurityRecommendation", "SecurityEvent")
        "enable" = $true
        "destination" = @{
            "resourceId" = "/subscriptions/subscription-id/resourceGroups/rg/providers/Microsoft.Storage/storageAccounts/securitydata"
            "type" = "StorageAccount"
        }
    }
}

# PowerBI query examples
let SecurityTrends = 
    SecurityAlert
    | where TimeGenerated > ago(30d)
    | summarize AlertCount = count() by bin(TimeGenerated, 1d), AlertSeverity
    | order by TimeGenerated asc;

let ComplianceScore = 
    SecurityRecommendation
    | where TimeGenerated > ago(1d)
    | summarize 
        TotalRecommendations = count(),
        HealthyResources = countif(RecommendationState == "Healthy"),
        UnhealthyResources = countif(RecommendationState == "Unhealthy")
    | extend CompliancePercentage = (HealthyResources * 100.0) / TotalRecommendations;</code>
        </div>

        <h4>Executive Dashboard Queries</h4>
        <div class="code-block">
          <code>// Executive security dashboard KQL queries

// Security score over time
SecurityRecommendation
| where TimeGenerated > ago(90d)
| summarize 
    HealthyResources = countif(RecommendationState == "Healthy"),
    TotalResources = count() 
    by bin(TimeGenerated, 1d)
| extend SecurityScore = (HealthyResources * 100.0) / TotalResources
| project TimeGenerated, SecurityScore
| render timechart

// Top security risks
SecurityRecommendation
| where RecommendationState == "Unhealthy"
| where RecommendationSeverity in ("High", "Medium")
| summarize AffectedResources = dcount(ResourceId) by RecommendationDisplayName, RecommendationSeverity
| top 10 by AffectedResources
| render barchart

// Compliance status by standard
SecurityRegulatoryCompliance
| where TimeGenerated > ago(1d)
| summarize 
    PassedControls = countif(State == "Passed"),
    FailedControls = countif(State == "Failed"),
    TotalControls = count()
    by ComplianceStandardId
| extend CompliancePercentage = (PassedControls * 100.0) / TotalControls
| project ComplianceStandardId, CompliancePercentage, FailedControls
| order by CompliancePercentage asc</code>
        </div>

        <h3>🔒 Step 8: Advanced Security Configuration</h3>
        <h4>Zero Trust Network Architecture</h4>
        <div class="code-block">
          <code># Implement Zero Trust principles
# Conditional Access policies
$caPolicy = @{
    "displayName" = "Require MFA for Azure Management"
    "state" = "enabled"
    "conditions" = @{
        "applications" = @{
            "includeApplications" = @("797f4846-ba00-4fd7-ba43-dac1f8f63013")
        }
        "users" = @{
            "includeUsers" = @("All")
            "excludeUsers" = @("break-glass-account-id")
        }
    }
    "grantControls" = @{
        "operator" = "OR"
        "builtInControls" = @("mfa")
    }
}

# Network segmentation policies
$nsgRules = @(
    @{
        "name" = "DenyAllInbound"
        "priority" = 4000
        "direction" = "Inbound"
        "access" = "Deny"
        "protocol" = "*"
        "sourcePortRange" = "*"
        "destinationPortRange" = "*"
        "sourceAddressPrefix" = "*"
        "destinationAddressPrefix" = "*"
    }
)</code>
        </div>

        <h3>🚀 Step 9: Performance Optimization</h3>
        <h4>Cost Management</h4>
        <div class="code-block">
          <code># Monitor Defender costs
$usage = Get-AzConsumptionUsageDetail -StartDate (Get-Date).AddDays(-30) -EndDate (Get-Date)
$defenderCosts = $usage | Where-Object {$_.ConsumedService -like "*Security*" -or $_.ConsumedService -like "*Defender*"}

$monthlyCost = ($defenderCosts | Measure-Object PretaxCost -Sum).Sum
Write-Host "Monthly Defender for Cloud cost: $monthlyCost"

# Optimize by disabling unnecessary features
$unnecessaryPlans = @("Dns", "Arm")  # Example - review based on your needs
foreach ($plan in $unnecessaryPlans) {
    Set-AzSecurityPricing -Name $plan -PricingTier "Free"
}</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Enable all relevant Defender plans for comprehensive protection</li>
            <li>Implement custom analytics rules for organization-specific threats</li>
            <li>Integrate with existing SIEM and SOAR solutions</li>
            <li>Regular security posture reviews and compliance assessments</li>
            <li>Automate incident response for high-severity alerts</li>
            <li>Continuous monitoring and optimization of security policies</li>
          </ul>
        </div>

        <h3>🔄 Continuous Improvement</h3>
        <ul>
          <li><strong>Monthly security reviews:</strong> Analyze trends and adjust policies</li>
          <li><strong>Threat landscape updates:</strong> Adapt to new attack vectors</li>
          <li><strong>Compliance monitoring:</strong> Ensure ongoing regulatory adherence</li>
          <li><strong>Cost optimization:</strong> Balance security coverage with budget</li>
          <li><strong>Team training:</strong> Keep security teams updated on new features</li>
        </ul>
      </div>
    `
  }
};

// Additional Azure tutorials would continue here with similar comprehensive content structure
// Including Intune, Sentinel, Azure Firewall, Log Analytics, VM backup, Site Recovery, and VPN guides