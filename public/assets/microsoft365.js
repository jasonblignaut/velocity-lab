/**
 * Velocity Lab - Microsoft 365 Tutorials
 * Comprehensive Microsoft 365 guides for MSP professionals
 */

window.MICROSOFT365_TUTORIALS = {
  'tenant-creation': {
    title: 'Creating new M365 tenant for customers',
    category: 'microsoft365',
    difficulty: 'intermediate',
    estimatedTime: '1-2 hours',
    content: `
      <div class="tutorial-content">
        <h2>🏢 Creating New M365 Tenant for Customers</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Complete process for creating and configuring new Microsoft 365 tenants for customers, including domain setup, user provisioning, and initial security configuration.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Microsoft Partner Center access (CSP program recommended)</li>
          <li>Customer's domain information and DNS access</li>
          <li>Customer requirements document</li>
          <li>Valid payment method for subscription</li>
        </ul>

        <h3>🚀 Step 1: Tenant Creation Process</h3>
        <h4>Via Microsoft Partner Center (CSP)</h4>
        <ol>
          <li>Log into <strong>Microsoft Partner Center</strong></li>
          <li>Navigate to <strong>Customers → Add Customer</strong></li>
          <li>Fill customer information:
            <div class="code-block">
              <code># Customer Details
Company Name: Acme Corporation
Contact Person: John Smith
Email: john.smith@acmecorp.com
Phone: +1-555-0123
Address: 123 Business St, City, State 12345
Country: United States
Industry: Manufacturing
Company Size: 50-250 employees</code>
            </div>
          </li>
          <li>Select subscription plans:
            <ul>
              <li><strong>Microsoft 365 Business Premium</strong> (most common for SMB)</li>
              <li><strong>Microsoft 365 Enterprise E3/E5</strong> (for larger organizations)</li>
              <li><strong>Exchange Online Plan 1/2</strong> (email only)</li>
            </ul>
          </li>
        </ol>

        <h4>Direct Tenant Creation (Alternative)</h4>
        <div class="code-block">
          <code># Steps for direct tenant creation
1. Go to https://signup.microsoft.com/business
2. Enter business email address
3. Verify identity via SMS/phone
4. Create initial admin account:
   - Username: admin@[domain].onmicrosoft.com
   - Password: [Strong password - 12+ characters]
5. Select initial domain: [company].onmicrosoft.com
6. Choose subscription plan
7. Enter payment information
8. Complete setup wizard</code>
        </div>

        <h3>🌐 Step 2: Domain Configuration</h3>
        <h4>Add Custom Domain</h4>
        <ol>
          <li>In Microsoft 365 Admin Center, go to <strong>Settings → Domains</strong></li>
          <li>Click <strong>Add domain</strong></li>
          <li>Enter customer's domain: <code>acmecorp.com</code></li>
          <li>Verify domain ownership via DNS:
            <div class="code-block">
              <code># DNS TXT Record for Domain Verification
Type: TXT
Name: @ (root domain)
Value: MS=ms12345678
TTL: 3600

# Alternative: Create HTML file verification
Upload file: [unique-string].html
To: http://acmecorp.com/[unique-string].html</code>
            </div>
          </li>
        </ol>

        <h4>Configure DNS Records</h4>
        <div class="code-block">
          <code># Required DNS Records for M365

# MX Record (Email)
Type: MX
Name: @
Value: acmecorp-com.mail.protection.outlook.com
Priority: 0
TTL: 3600

# CNAME Records
Type: CNAME
Name: autodiscover
Value: autodiscover.outlook.com
TTL: 3600

Type: CNAME  
Name: sip
Value: sipdir.online.lync.com
TTL: 3600

Type: CNAME
Name: lyncdiscover
Value: webdir.online.lync.com  
TTL: 3600

Type: CNAME
Name: enterpriseregistration
Value: enterpriseregistration.windows.net
TTL: 3600

Type: CNAME
Name: enterpriseenrollment
Value: enterpriseenrollment.manage.microsoft.com
TTL: 3600

# SRV Records
Type: SRV
Name: _sip._tls
Value: 100 1 443 sipdir.online.lync.com
TTL: 3600

Type: SRV
Name: _sipfederationtls._tcp
Value: 100 1 5061 sipfed.online.lync.com
TTL: 3600

# SPF Record
Type: TXT
Name: @
Value: v=spf1 include:spf.protection.outlook.com -all
TTL: 3600</code>
        </div>

        <h3>👥 Step 3: User Account Setup</h3>
        <h4>Bulk User Creation via PowerShell</h4>
        <div class="code-block">
          <code># Connect to Microsoft 365
Install-Module -Name MSOnline -Force
Import-Module MSOnline
Connect-MsolService

# CSV format for bulk user import
# UserPrincipalName,FirstName,LastName,DisplayName,Department,JobTitle,PhoneNumber,UsageLocation,LicenseAssignment
john.smith@acmecorp.com,John,Smith,John Smith,IT,IT Manager,555-0101,US,acmecorp:ENTERPRISEPACK
jane.doe@acmecorp.com,Jane,Doe,Jane Doe,Sales,Sales Rep,555-0102,US,acmecorp:ENTERPRISEPACK

# PowerShell script for bulk import
$users = Import-Csv "C:\Users.csv"

foreach ($user in $users) {
    $upn = $user.UserPrincipalName
    $password = "TempPass123!"
    
    # Create user
    New-MsolUser -UserPrincipalName $upn `
        -FirstName $user.FirstName `
        -LastName $user.LastName `
        -DisplayName $user.DisplayName `
        -Department $user.Department `
        -Title $user.JobTitle `
        -PhoneNumber $user.PhoneNumber `
        -UsageLocation $user.UsageLocation `
        -Password $password `
        -ForceChangePassword $true `
        -PasswordNeverExpires $false
    
    # Assign license
    Set-MsolUserLicense -UserPrincipalName $upn -AddLicenses $user.LicenseAssignment
    
    Write-Host "Created user: $upn"
}</code>
        </div>

        <h4>Security Group Creation</h4>
        <div class="code-block">
          <code># Create security groups via PowerShell
Connect-AzureAD

# IT Staff Group
New-AzureADGroup -DisplayName "IT Staff" `
    -MailEnabled $false `
    -SecurityEnabled $true `
    -MailNickname "ITStaff" `
    -Description "IT Department Staff"

# Management Group  
New-AzureADGroup -DisplayName "Management" `
    -MailEnabled $false `
    -SecurityEnabled $true `
    -MailNickname "Management" `
    -Description "Management Team"

# All Company Group
New-AzureADGroup -DisplayName "All Company" `
    -MailEnabled $false `
    -SecurityEnabled $true `
    -MailNickname "AllCompany" `
    -Description "All Company Employees"

# Add users to groups
$itGroup = Get-AzureADGroup -Filter "DisplayName eq 'IT Staff'"
$user = Get-AzureADUser -Filter "UserPrincipalName eq 'john.smith@acmecorp.com'"
Add-AzureADGroupMember -ObjectId $itGroup.ObjectId -RefObjectId $user.ObjectId</code>
        </div>

        <h3>🔐 Step 4: Initial Security Configuration</h3>
        <h4>Enable Multi-Factor Authentication</h4>
        <div class="code-block">
          <code># Enable MFA for all users via PowerShell
Connect-MsolService

# Get all users
$users = Get-MsolUser -All | Where-Object {$_.IsLicensed -eq $true}

# Create MFA requirement
$mfaSettings = New-Object -TypeName Microsoft.Online.Administration.StrongAuthenticationRequirement
$mfaSettings.RelyingParty = "*"
$mfaSettings.State = "Enabled"  # or "Enforced"

# Apply to all users
foreach ($user in $users) {
    Set-MsolUser -UserPrincipalName $user.UserPrincipalName -StrongAuthenticationRequirements $mfaSettings
    Write-Host "Enabled MFA for: $($user.UserPrincipalName)"
}</code>
        </div>

        <h4>Conditional Access Policies</h4>
        <div class="code-block">
          <code># Create baseline conditional access policies via Graph API
# Require MFA for all cloud apps

$policy = @{
    displayName = "Require MFA for all users"
    state = "enabled"
    conditions = @{
        users = @{
            includeUsers = @("All")
            excludeUsers = @("break-glass-account-id")
        }
        applications = @{
            includeApplications = @("All")
        }
        locations = @{
            includeLocations = @("All")
        }
    }
    grantControls = @{
        operator = "OR"
        builtInControls = @("mfa")
    }
}

# Apply policy via Graph API call
Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/identity/conditionalAccess/policies" `
    -Method POST `
    -Headers @{Authorization = "Bearer $accessToken"} `
    -Body ($policy | ConvertTo-Json -Depth 10) `
    -ContentType "application/json"</code>
        </div>

        <h3>📧 Step 5: Exchange Online Configuration</h3>
        <h4>Basic Exchange Settings</h4>
        <div class="code-block">
          <code># Connect to Exchange Online
Install-Module -Name ExchangeOnlineManagement -Force
Connect-ExchangeOnline

# Set default timezone and language
Set-MailboxRegionalConfiguration -Identity "john.smith@acmecorp.com" `
    -TimeZone "Eastern Standard Time" `
    -Language "en-US"

# Configure organization settings
Set-OrganizationConfig -DefaultPublicFolderMailbox "DefaultPublicFolderMailbox"

# Set message size limits
Set-TransportConfig -MaxSendSize 25MB -MaxReceiveSize 25MB

# Configure retention policies
New-RetentionPolicy -Name "Corporate Retention Policy"
New-RetentionPolicyTag -Name "Delete after 7 years" `
    -Type All `
    -RetentionEnabled $true `
    -AgeLimitForRetention 2555 `
    -RetentionAction DeleteAndAllowRecovery

# Apply retention policy to all mailboxes
Get-Mailbox | Set-Mailbox -RetentionPolicy "Corporate Retention Policy"</code>
        </div>

        <h4>Anti-Spam and Anti-Malware</h4>
        <div class="code-block">
          <code># Configure anti-spam policies
New-AntiPhishPolicy -Name "Corporate Anti-Phish" `
    -Enabled $true `
    -EnableMailboxIntelligence $true `
    -EnableMailboxIntelligenceProtection $true `
    -EnableSimilarUsersSafetyTips $true `
    -EnableSimilarDomainsSafetyTips $true `
    -EnableUnusualCharactersSafetyTips $true

# Configure safe attachments
New-SafeAttachmentPolicy -Name "Corporate Safe Attachments" `
    -Enable $true `
    -Action Block `
    -Redirect $false

# Configure safe links
New-SafeLinksPolicy -Name "Corporate Safe Links" `
    -Enabled $true `
    -TrackClicks $true `
    -ScanUrls $true `
    -EnableForInternalSenders $true `
    -DeliverMessageAfterScan $true</code>
        </div>

        <h3>📱 Step 6: Mobile Device Management</h3>
        <h4>Basic Intune Configuration</h4>
        <div class="code-block">
          <code># Connect to Microsoft Graph
Connect-MgGraph -Scopes "DeviceManagementConfiguration.ReadWrite.All"

# Create device compliance policy
$compliancePolicy = @{
    "@odata.type" = "#microsoft.graph.androidCompliancePolicy"
    displayName = "Android Compliance Policy"
    description = "Basic compliance requirements for Android devices"
    passwordRequired = $true
    passwordMinimumLength = 6
    passwordRequiredType = "numeric"
    passwordMinutesOfInactivityBeforeLock = 15
    passwordExpirationDays = 90
    passwordPreviousPasswordBlockCount = 5
    securityBlockJailbrokenDevices = $true
    deviceThreatProtectionEnabled = $true
    osMinimumVersion = "8.0"
}

New-MgDeviceManagementDeviceCompliancePolicy -BodyParameter $compliancePolicy

# Create app protection policy for iOS
$appProtectionPolicy = @{
    "@odata.type" = "#microsoft.graph.iosManagedAppProtection"
    displayName = "iOS App Protection Policy"
    description = "Protect corporate data in iOS apps"
    appDataEncryptionType = "whenDeviceLockedExceptOpenFiles"
    pinRequired = $true
    maximumPinRetries = 5
    simplePinBlocked = $true
    minimumPinLength = 6
    pinCharacterSet = "numeric"
    periodOfflineBeforeAccessCheck = "PT12H"
    periodOnlineBeforeAccessCheck = "PT30M"
    allowedInboundDataTransferSources = "managedApps"
    allowedOutboundDataTransferDestinations = "managedApps"
    allowedOutboundClipboardSharingLevel = "managedAppsWithPasteIn"
}</code>
        </div>

        <h3>📊 Step 7: SharePoint Online Setup</h3>
        <h4>Create Team Sites</h4>
        <div class="code-block">
          <code># Connect to SharePoint Online
Install-Module -Name PnP.PowerShell -Force
Connect-PnPOnline -Url "https://acmecorp-admin.sharepoint.com" -Interactive

# Create team sites
New-PnPSite -Type TeamSite `
    -Title "IT Department" `
    -Alias "ITDepartment" `
    -Description "IT Department collaboration site" `
    -Owner "john.smith@acmecorp.com"

New-PnPSite -Type TeamSite `
    -Title "Sales Team" `
    -Alias "SalesTeam" `
    -Description "Sales team collaboration and documents" `
    -Owner "jane.doe@acmecorp.com"

# Create communication site
New-PnPSite -Type CommunicationSite `
    -Title "Company Intranet" `
    -Url "https://acmecorp.sharepoint.com/sites/intranet" `
    -Description "Company-wide communication and resources" `
    -Owner "john.smith@acmecorp.com"

# Configure site permissions
Set-PnPSite -Identity "https://acmecorp.sharepoint.com/sites/ITDepartment" `
    -Owners "john.smith@acmecorp.com" `
    -Members "IT Staff" `
    -Visitors "All Company"</code>
        </div>

        <h3>🔒 Step 8: Data Loss Prevention (DLP)</h3>
        <h4>Create DLP Policies</h4>
        <div class="code-block">
          <code># Connect to Security & Compliance Center
Connect-IPPSSession

# Create DLP policy for credit card numbers
New-DlpPolicy -Name "Credit Card Protection" `
    -Description "Prevent sharing of credit card information" `
    -Template "U.S. Financial Data"

# Create custom DLP rule
New-DlpComplianceRule -Policy "Credit Card Protection" `
    -Name "Block Credit Card Sharing" `
    -ContentContainsSensitiveInformation @(@{Name="Credit Card Number"; minCount="1"}) `
    -BlockAccess $true `
    -NotifyUser @("SiteAdmin", "LastModifier") `
    -NotificationEmailSubject "Potential credit card number detected"

# Create DLP policy for PII
New-DlpPolicy -Name "PII Protection" `
    -Description "Protect personally identifiable information" `
    -Template "U.S. Personally Identifiable Information (PII) Data"

# Configure policy locations
Set-DlpCompliancePolicy -Identity "PII Protection" `
    -ExchangeLocation "All" `
    -SharePointLocation "All" `
    -OneDriveLocation "All" `
    -TeamsLocation "All"</code>
        </div>

        <h3>📈 Step 9: Monitoring and Reporting Setup</h3>
        <h4>Configure Activity Monitoring</h4>
        <div class="code-block">
          <code># Enable auditing
Set-AdminAuditLogConfig -UnifiedAuditLogIngestionEnabled $true

# Create alert policies
New-ProtectionAlert -Name "Unusual Email Activity" `
    -Description "Alert when users send unusually high volumes of email" `
    -Category "ThreatManagement" `
    -NotifyUser @("admin@acmecorp.com") `
    -Severity "Medium"

# PowerShell script for usage reporting
$startDate = (Get-Date).AddDays(-30)
$endDate = Get-Date

# Get mailbox usage statistics
Get-Mailbox | ForEach-Object {
    $stats = Get-MailboxStatistics $_.Identity
    [PSCustomObject]@{
        User = $_.DisplayName
        Email = $_.PrimarySmtpAddress
        MailboxSize = $stats.TotalItemSize
        ItemCount = $stats.ItemCount
        LastLogon = $stats.LastLogonTime
    }
} | Export-Csv "C:\MailboxUsage.csv" -NoTypeInformation

# Get SharePoint usage
$sites = Get-SPOSite -Limit All
foreach ($site in $sites) {
    $usage = Get-SPOSiteUsage -Identity $site.Url
    Write-Host "$($site.Title): $($usage.StorageUsageCurrent)GB used"
}</code>
        </div>

        <h3>🔄 Step 10: Migration Planning</h3>
        <h4>Email Migration Strategy</h4>
        <div class="code-block">
          <code># Migration approaches by scenario

# Small organizations (< 50 mailboxes)
# Cutover migration - all at once
New-MigrationBatch -Name "Cutover Migration" `
    -SourceEndpoint $endpoint `
    -CSVData $csvData `
    -TargetDeliveryDomain "acmecorp.mail.onmicrosoft.com" `
    -AutoStart

# Medium organizations (50-2000 mailboxes)  
# Staged migration - in phases
New-MigrationBatch -Name "Phase1 Migration" `
    -SourceEndpoint $endpoint `
    -CSVData $phase1Users `
    -TargetDeliveryDomain "acmecorp.mail.onmicrosoft.com"

# Large organizations (2000+ mailboxes)
# Hybrid deployment with gradual migration
# Requires Exchange Server on-premises

# Sample CSV for migration
# EmailAddress,Password
# john.smith@oldcompany.com,TempPass123
# jane.doe@oldcompany.com,TempPass456</code>
        </div>

        <h4>File Migration to SharePoint/OneDrive</h4>
        <div class="code-block">
          <code># Migration tool options

# SharePoint Migration Tool (SPMT)
# Download from Microsoft, GUI-based
# Supports file shares, SharePoint on-premises, OneDrive

# PowerShell for OneDrive migration
$users = Get-MsolUser -All | Where-Object {$_.IsLicensed -eq $true}

foreach ($user in $users) {
    $upn = $user.UserPrincipalName
    $sourcePath = "\\fileserver\users\$($user.UserName)"
    $oneDriveUrl = "https://acmecorp-my.sharepoint.com/personal/$($user.UserName.Replace('.','_'))_acmecorp_com"
    
    # Use SPMT or robocopy for actual migration
    Write-Host "Migrate $sourcePath to $oneDriveUrl"
}</code>
        </div>

        <div class="tutorial-warning">
          <h4>⚠️ Migration Considerations</h4>
          <ul>
            <li>Plan migration during off-hours to minimize disruption</li>
            <li>Test migration with pilot group first</li>
            <li>Communicate timeline and expectations to users</li>
            <li>Prepare rollback plan in case of issues</li>
            <li>Monitor migration progress and address issues promptly</li>
          </ul>
        </div>

        <h3>📋 Step 11: Go-Live Checklist</h3>
        <div class="code-block">
          <code># Pre-Go-Live Checklist
☐ Domain verification completed
☐ DNS records configured and propagated
☐ All users created and licensed
☐ MFA enabled for all accounts
☐ Conditional access policies configured
☐ Exchange Online configured
☐ SharePoint sites created
☐ Security policies implemented
☐ DLP policies configured
☐ Migration completed (if applicable)
☐ User training scheduled
☐ Support procedures documented

# Post-Go-Live Tasks (Week 1)
☐ Monitor mailbox connectivity
☐ Verify mobile device access
☐ Check SharePoint site access
☐ Review security alerts
☐ Address user support requests
☐ Validate backup procedures
☐ Generate usage reports

# Post-Go-Live Tasks (Month 1)
☐ Review security compliance
☐ Analyze usage patterns
☐ Optimize configurations
☐ Plan next phase rollouts
☐ User feedback collection
☐ Cost optimization review</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Always use the principle of least privilege</li>
            <li>Enable MFA from day one</li>
            <li>Document all configurations and decisions</li>
            <li>Plan for user training and adoption</li>
            <li>Implement proper backup and recovery procedures</li>
            <li>Regular security and compliance reviews</li>
            <li>Monitor usage and costs continuously</li>
          </ul>
        </div>

        <h3>💰 Cost Optimization Tips</h3>
        <ul>
          <li><strong>Right-size licenses:</strong> Match features to user needs</li>
          <li><strong>Monitor usage:</strong> Remove unused licenses promptly</li>
          <li><strong>Use groups:</strong> Assign licenses via groups for easier management</li>
          <li><strong>Plan renewals:</strong> Review and optimize before annual renewal</li>
          <li><strong>Consider bundles:</strong> E3/E5 bundles often more cost-effective</li>
        </ul>
      </div>
    `
  },

  'tenant-migration': {
    title: 'Tenant migration and merger procedures',
    category: 'microsoft365',
    difficulty: 'advanced',
    estimatedTime: '4-6 hours',
    content: `
      <div class="tutorial-content">
        <h2>🔄 Tenant Migration and Merger Procedures</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Complete procedures for migrating between M365 tenants, merging multiple tenants, and handling complex organizational changes while preserving data and user experience.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Administrative access to both source and destination tenants</li>
          <li>PowerShell modules: MSOnline, ExchangeOnlineManagement, PnP.PowerShell</li>
          <li>Migration tools: SharePoint Migration Tool, third-party solutions</li>
          <li>Detailed migration plan and timeline</li>
        </ul>

        <h3>🎯 Migration Scenarios</h3>
        <ul>
          <li><strong>Company Acquisition:</strong> Merge acquired company into parent tenant</li>
          <li><strong>Divestiture:</strong> Split business unit into separate tenant</li>
          <li><strong>Consolidation:</strong> Merge multiple subsidiaries into single tenant</li>
          <li><strong>Rebranding:</strong> Migrate to new tenant with new domain</li>
        </ul>

        <h3>🚀 Step 1: Pre-Migration Assessment</h3>
        <h4>Source Tenant Analysis</h4>
        <div class="code-block">
          <code># PowerShell assessment script
Connect-MsolService
Connect-ExchangeOnline
Connect-PnPOnline -Url "https://sourcetenant-admin.sharepoint.com" -Interactive

# Get user inventory
$users = Get-MsolUser -All
$userStats = @()

foreach ($user in $users) {
    $mailboxStats = Get-MailboxStatistics $user.UserPrincipalName -ErrorAction SilentlyContinue
    $oneDriveUrl = "https://sourcetenant-my.sharepoint.com/personal/" + $user.UserPrincipalName.Replace("@","_").Replace(".","_")
    
    $userStats += [PSCustomObject]@{
        UserPrincipalName = $user.UserPrincipalName
        DisplayName = $user.DisplayName
        IsLicensed = $user.IsLicensed
        Licenses = ($user.Licenses | ForEach-Object {$_.AccountSkuId}) -join ";"
        MailboxSize = if($mailboxStats) {$mailboxStats.TotalItemSize} else {"No Mailbox"}
        LastLogon = if($mailboxStats) {$mailboxStats.LastLogonTime} else {"N/A"}
        OneDriveUrl = $oneDriveUrl
        Department = $user.Department
        Title = $user.Title
    }
}

$userStats | Export-Csv "SourceTenantUsers.csv" -NoTypeInformation

# Get SharePoint sites inventory
$sites = Get-PnPTenantSite
$siteStats = @()

foreach ($site in $sites) {
    $siteStats += [PSCustomObject]@{
        Url = $site.Url
        Title = $site.Title
        Template = $site.Template
        StorageUsage = $site.StorageUsageCurrent
        Owner = $site.Owner
        LastContentModifiedDate = $site.LastContentModifiedDate
        SiteDefinedSharingCapability = $site.SiteDefinedSharingCapability
    }
}

$siteStats | Export-Csv "SourceTenantSites.csv" -NoTypeInformation</code>
        </div>

        <h4>Destination Tenant Preparation</h4>
        <div class="code-block">
          <code># Prepare destination tenant
Connect-MsolService
Connect-ExchangeOnline

# Verify domain ownership
$domains = Get-MsolDomain
Write-Host "Available domains in destination tenant:"
$domains | Select-Object Name, Status | Format-Table

# Check license availability
$licenses = Get-MsolSubscription
$availableLicenses = @()

foreach ($license in $licenses) {
    $sku = Get-MsolSubscription -SubscriptionId $license.SkuId
    $availableLicenses += [PSCustomObject]@{
        SkuPartNumber = $sku.SkuPartNumber
        TotalLicenses = $sku.TotalTrialUnits + $sku.TotalLicenseUnits
        ConsumedLicenses = $sku.ConsumedUnits
        AvailableLicenses = ($sku.TotalTrialUnits + $sku.TotalLicenseUnits) - $sku.ConsumedUnits
    }
}

$availableLicenses | Format-Table</code>
        </div>

        <h3>📧 Step 2: Email Migration Strategy</h3>
        <h4>Cross-Tenant Migration Setup</h4>
        <div class="code-block">
          <code># Configure cross-tenant migration
# This requires Exchange Online PowerShell and proper permissions

# Source tenant - create migration endpoint
$sourceEndpoint = New-MigrationEndpoint -Name "SourceTenantEndpoint" `
    -ExchangeRemoteMove `
    -RemoteServer "outlook.office365.com" `
    -Credentials (Get-Credential) `
    -MaxConcurrentMigrations 50

# Create migration batch
$csvData = @"
EmailAddress,TargetAddress
john.smith@source.com,john.smith@destination.com
jane.doe@source.com,jane.doe@destination.com
"@

New-MigrationBatch -Name "CrossTenantMigration_Batch1" `
    -SourceEndpoint $sourceEndpoint `
    -CSVData ([System.Text.Encoding]::UTF8.GetBytes($csvData)) `
    -TargetDeliveryDomain "destination.mail.onmicrosoft.com" `
    -NotificationEmails @("admin@destination.com")

# Start migration
Start-MigrationBatch -Identity "CrossTenantMigration_Batch1"</code>
        </div>

        <h4>Mail Flow Configuration</h4>
        <div class="code-block">
          <code># Configure mail flow during migration
# Source tenant - forward emails to destination

# Create connector for outbound mail flow
New-OutboundConnector -Name "ToDestinationTenant" `
    -ConnectorType OnPremises `
    -UseMXRecord $false `
    -SmartHosts "destination-tenant.mail.protection.outlook.com" `
    -TlsSettings DomainValidation `
    -CloudServicesMailEnabled $true

# Create transport rule to route specific domains
New-TransportRule -Name "Route to Destination Tenant" `
    -RecipientDomainIs "destination.com" `
    -RouteMessageOutboundConnector "ToDestinationTenant" `
    -RouteMessageOutboundRequireTls $true

# Destination tenant - accept mail from source
New-InboundConnector -Name "FromSourceTenant" `
    -ConnectorType OnPremises `
    -SenderDomains "source.com" `
    -RequireTls $true `
    -TlsClient "source-tenant.mail.protection.outlook.com"</code>
        </div>

        <h3>📁 Step 3: SharePoint and OneDrive Migration</h3>
        <h4>Cross-Tenant SharePoint Migration</h4>
        <div class="code-block">
          <code># SharePoint Migration Tool (SPMT) PowerShell
# Install SPMT first, then use PowerShell module

Import-Module Microsoft.SharePoint.MigrationTool.PowerShell

# Register source and target
$sourceUrl = "https://source.sharepoint.com/sites/teamsite"
$targetUrl = "https://destination.sharepoint.com/sites/teamsite"
$creds_source = Get-Credential
$creds_target = Get-Credential

Register-SPMTMigration -SPOnlineSourceSiteUrl $sourceUrl `
    -SPOnlineTargetSiteUrl $targetUrl `
    -SourceUserName $creds_source.UserName `
    -SourcePassword $creds_source.Password `
    -TargetUserName $creds_target.UserName `
    -TargetPassword $creds_target.Password

# Start migration
Start-SPMTMigration

# Monitor migration status
$status = Get-SPMTMigration
Write-Host "Migration Status: $($status.Status)"
Write-Host "Files Migrated: $($status.MigratedFiles)"
Write-Host "Failed Files: $($status.FailedFiles)"</code>
        </div>

        <h4>OneDrive Migration Approach</h4>
        <div class="code-block">
          <code># OneDrive migration using PowerShell and APIs
# Note: This requires custom development or third-party tools

# Example using Microsoft Graph API
$sourceUsers = Import-Csv "SourceTenantUsers.csv"

foreach ($user in $sourceUsers) {
    $sourceOneDrive = $user.OneDriveUrl
    $targetUser = $user.UserPrincipalName.Replace("@source.com", "@destination.com")
    $targetOneDrive = "https://destination-my.sharepoint.com/personal/" + $targetUser.Replace("@","_").Replace(".","_")
    
    # Create migration job (pseudo-code - requires actual implementation)
    Write-Host "Migrating OneDrive: $sourceOneDrive -> $targetOneDrive"
    
    # Use SharePoint Migration API or third-party tool
    # This would involve:
    # 1. Authenticate to both tenants
    # 2. Enumerate source files
    # 3. Upload to destination
    # 4. Preserve metadata and permissions
    # 5. Handle conflicts and errors
}</code>
        </div>

        <h3>👥 Step 4: User and Identity Migration</h3>
        <h4>User Account Creation</h4>
        <div class="code-block">
          <code># Bulk user creation in destination tenant
Connect-MsolService

$sourceUsers = Import-Csv "SourceTenantUsers.csv"

foreach ($user in $sourceUsers) {
    if ($user.IsLicensed -eq "True") {
        $newUpn = $user.UserPrincipalName.Replace("@source.com", "@destination.com")
        $tempPassword = "TempPass$(Get-Random -Maximum 9999)!"
        
        try {
            # Create user account
            New-MsolUser -UserPrincipalName $newUpn `
                -DisplayName $user.DisplayName `
                -FirstName ($user.DisplayName.Split(' ')[0]) `
                -LastName ($user.DisplayName.Split(' ')[-1]) `
                -Department $user.Department `
                -Title $user.Title `
                -UsageLocation "US" `
                -Password $tempPassword `
                -ForceChangePassword $true `
                -PasswordNeverExpires $false
            
            # Assign licenses (map from source to destination SKUs)
            $sourceLicenses = $user.Licenses -split ";"
            foreach ($sourceLicense in $sourceLicenses) {
                $targetLicense = Map-License $sourceLicense "source" "destination"
                if ($targetLicense) {
                    Set-MsolUserLicense -UserPrincipalName $newUpn -AddLicenses $targetLicense
                }
            }
            
            Write-Host "Created user: $newUpn"
            
            # Store temp password securely for user communication
            Add-Content "UserPasswords.txt" "$newUpn,$tempPassword"
            
        } catch {
            Write-Error "Failed to create user $newUpn : $($_.Exception.Message)"
        }
    }
}

# Function to map licenses between tenants
function Map-License {
    param($sourceSku, $sourceTenant, $targetTenant)
    
    $licenseMap = @{
        "$sourceTenant:ENTERPRISEPACK" = "$targetTenant:ENTERPRISEPACK"  # E3 to E3
        "$sourceTenant:ENTERPRISEPREMIUM" = "$targetTenant:ENTERPRISEPREMIUM"  # E5 to E5
        "$sourceTenant:STANDARDPACK" = "$targetTenant:STANDARDPACK"  # E1 to E1
    }
    
    return $licenseMap[$sourceSku]
}</code>
        </div>

        <h4>Group and Distribution List Migration</h4>
        <div class="code-block">
          <code># Migrate distribution groups and security groups
Connect-ExchangeOnline

# Export groups from source tenant
$sourceGroups = Get-DistributionGroup | Select-Object Name, DisplayName, PrimarySmtpAddress, MemberJoinRestriction, MemberDepartRestriction, ManagedBy

# Create groups in destination tenant
foreach ($group in $sourceGroups) {
    $newEmail = $group.PrimarySmtpAddress.Replace("@source.com", "@destination.com")
    
    try {
        New-DistributionGroup -Name $group.Name `
            -DisplayName $group.DisplayName `
            -PrimarySmtpAddress $newEmail `
            -MemberJoinRestriction $group.MemberJoinRestriction `
            -MemberDepartRestriction $group.MemberDepartRestriction `
            -ManagedBy ($group.ManagedBy -replace "@source.com", "@destination.com")
        
        # Get group members from source
        $members = Get-DistributionGroupMember $group.Name
        
        # Add members to destination group
        foreach ($member in $members) {
            $newMemberEmail = $member.PrimarySmtpAddress.Replace("@source.com", "@destination.com")
            Add-DistributionGroupMember -Identity $group.Name -Member $newMemberEmail -ErrorAction SilentlyContinue
        }
        
        Write-Host "Migrated group: $($group.Name)"
        
    } catch {
        Write-Error "Failed to migrate group $($group.Name): $($_.Exception.Message)"
    }
}</code>
        </div>

        <h3>🔐 Step 5: Security and Compliance Migration</h3>
        <h4>Security Policies Migration</h4>
        <div class="code-block">
          <code># Export and recreate security policies
# This requires manual review and recreation as policies are tenant-specific

# Export conditional access policies (manual process)
Connect-AzureAD
$caPolicies = Get-AzureADMSConditionalAccessPolicy

foreach ($policy in $caPolicies) {
    $policyJson = $policy | ConvertTo-Json -Depth 10
    $fileName = "CA_Policy_$($policy.DisplayName).json"
    $policyJson | Out-File $fileName
    Write-Host "Exported policy: $($policy.DisplayName)"
}

# Export DLP policies
Connect-IPPSSession
$dlpPolicies = Get-DlpCompliancePolicy

foreach ($policy in $dlpPolicies) {
    $rules = Get-DlpComplianceRule -Policy $policy.Name
    
    $policyExport = @{
        PolicyName = $policy.Name
        Description = $policy.Comment
        Locations = $policy.ExchangeLocation
        Rules = $rules | Select-Object Name, ContentContainsSensitiveInformation, BlockAccess, NotifyUser
    }
    
    $policyExport | ConvertTo-Json -Depth 10 | Out-File "DLP_Policy_$($policy.Name).json"
}</code>
        </div>

        <h3>📱 Step 6: Device and Application Migration</h3>
        <h4>Intune Device Migration</h4>
        <div class="code-block">
          <code># Device migration approach
# Note: Devices typically need to be re-enrolled

# Export device information from source tenant
Connect-MSGraph
$devices = Get-IntuneManagedDevice

$deviceExport = @()
foreach ($device in $devices) {
    $deviceExport += [PSCustomObject]@{
        DeviceName = $device.deviceName
        Platform = $device.operatingSystem
        Owner = $device.userPrincipalName
        SerialNumber = $device.serialNumber
        IMEI = $device.imei
        Model = $device.model
        Manufacturer = $device.manufacturer
        ComplianceState = $device.complianceState
        LastSyncDateTime = $device.lastSyncDateTime
    }
}

$deviceExport | Export-Csv "IntuneDevices.csv" -NoTypeInformation

# Create device enrollment restrictions in destination tenant
$enrollmentRestriction = @{
    "@odata.type" = "#microsoft.graph.deviceEnrollmentPlatformRestrictions"
    platformRestrictions = @{
        ios = @{
            platformBlocked = $false
            personalDeviceEnrollmentBlocked = $false
            osMinimumVersion = "13.0"
        }
        android = @{
            platformBlocked = $false
            personalDeviceEnrollmentBlocked = $false
            osMinimumVersion = "8.0"
        }
        windows = @{
            platformBlocked = $false
            personalDeviceEnrollmentBlocked = $false
            osMinimumVersion = "10.0.17763"
        }
    }
}

New-MgDeviceManagementDeviceEnrollmentConfiguration -BodyParameter $enrollmentRestriction</code>
        </div>

        <h3>📊 Step 7: Migration Execution Plan</h3>
        <h4>Phased Migration Approach</h4>
        <div class="code-block">
          <code># Migration phases and timeline

# Phase 1: Infrastructure Setup (Week 1-2)
# - Destination tenant preparation
# - Domain verification
# - Security baseline configuration
# - Test user creation and basic services

# Phase 2: Pilot Migration (Week 3-4)  
# - Migrate 10% of users (IT staff and volunteers)
# - Test all services and applications
# - Identify and resolve issues
# - Refine migration procedures

# Phase 3: Production Migration (Week 5-8)
# - Migrate users in batches (department by department)
# - 25% per week to manage support load
# - Monitor service availability
# - Address user issues promptly

# Phase 4: Cleanup and Optimization (Week 9-10)
# - Verify all data migrated successfully
# - Decommission source tenant services
# - Optimize destination tenant configuration
# - Complete user training and support

# Sample migration batch script
$migrationBatches = @(
    @{Name="IT_Department"; Users=@("admin@source.com", "ituser@source.com")},
    @{Name="Finance_Department"; Users=@("cfo@source.com", "accountant@source.com")},
    @{Name="Sales_Department"; Users=@("sales1@source.com", "sales2@source.com")}
)

foreach ($batch in $migrationBatches) {
    Write-Host "Processing batch: $($batch.Name)"
    
    # Create CSV for this batch
    $batchCsv = "EmailAddress`n" + ($batch.Users -join "`n")
    $batchCsv | Out-File "Batch_$($batch.Name).csv"
    
    # Create migration batch
    New-MigrationBatch -Name $batch.Name `
        -CSVData ([System.Text.Encoding]::UTF8.GetBytes($batchCsv)) `
        -TargetDeliveryDomain "destination.mail.onmicrosoft.com"
    
    # Schedule migration start (stagger by 1 day)
    Start-Sleep -Seconds (24 * 60 * 60)  # Wait 24 hours
}</code>
        </div>

        <h3>🔍 Step 8: Migration Monitoring and Validation</h3>
        <h4>Migration Status Monitoring</h4>
        <div class="code-block">
          <code># Comprehensive migration monitoring script
function Monitor-Migration {
    Write-Host "=== Migration Status Report ===" -ForegroundColor Green
    Write-Host "Generated: $(Get-Date)" -ForegroundColor Yellow
    
    # Email migration status
    $migrationBatches = Get-MigrationBatch
    Write-Host "`nEmail Migration Status:" -ForegroundColor Cyan
    
    foreach ($batch in $migrationBatches) {
        $batchStats = Get-MigrationBatchStatistics $batch.Identity
        Write-Host "Batch: $($batch.Identity)"
        Write-Host "  Status: $($batch.Status)"
        Write-Host "  Total: $($batchStats.TotalCount)"
        Write-Host "  Completed: $($batchStats.CompletedCount)"
        Write-Host "  Failed: $($batchStats.FailedCount)"
        Write-Host "  In Progress: $($batchStats.SyncingCount)"
        Write-Host ""
    }
    
    # User license status
    Write-Host "User License Status:" -ForegroundColor Cyan
    $users = Get-MsolUser -All | Where-Object {$_.UserPrincipalName -like "*@destination.com"}
    $licensedUsers = ($users | Where-Object {$_.IsLicensed -eq $true}).Count
    $unlicensedUsers = ($users | Where-Object {$_.IsLicensed -eq $false}).Count
    
    Write-Host "  Total Users: $($users.Count)"
    Write-Host "  Licensed: $licensedUsers"
    Write-Host "  Unlicensed: $unlicensedUsers"
    
    # SharePoint migration status (if using SPMT)
    Write-Host "`nSharePoint Migration Status:" -ForegroundColor Cyan
    $spmtStatus = Get-SPMTMigration -ErrorAction SilentlyContinue
    if ($spmtStatus) {
        Write-Host "  Status: $($spmtStatus.Status)"
        Write-Host "  Files Migrated: $($spmtStatus.MigratedFiles)"
        Write-Host "  Failed Files: $($spmtStatus.FailedFiles)"
    } else {
        Write-Host "  No active SPMT migrations"
    }
}

# Run monitoring every hour during migration
while ($true) {
    Monitor-Migration
    Start-Sleep -Seconds 3600  # Wait 1 hour
}</code>
        </div>

        <h3>✅ Step 9: Post-Migration Validation</h3>
        <h4>Comprehensive Validation Script</h4>
        <div class="code-block">
          <code># Post-migration validation checklist
function Validate-Migration {
    $validationResults = @()
    
    # Validate user accounts
    Write-Host "Validating user accounts..." -ForegroundColor Yellow
    $sourceUserCount = (Import-Csv "SourceTenantUsers.csv" | Where-Object {$_.IsLicensed -eq "True"}).Count
    $destUserCount = (Get-MsolUser -All | Where-Object {$_.IsLicensed -eq $true -and $_.UserPrincipalName -like "*@destination.com"}).Count
    
    $validationResults += [PSCustomObject]@{
        Component = "Users"
        Expected = $sourceUserCount
        Actual = $destUserCount
        Status = if($sourceUserCount -eq $destUserCount) {"✅ Pass"} else {"❌ Fail"}
    }
    
    # Validate mailboxes
    Write-Host "Validating mailboxes..." -ForegroundColor Yellow
    $destMailboxCount = (Get-Mailbox | Where-Object {$_.PrimarySmtpAddress -like "*@destination.com"}).Count
    
    $validationResults += [PSCustomObject]@{
        Component = "Mailboxes"
        Expected = $sourceUserCount
        Actual = $destMailboxCount
        Status = if($sourceUserCount -eq $destMailboxCount) {"✅ Pass"} else {"❌ Fail"}
    }
    
    # Validate SharePoint sites
    Write-Host "Validating SharePoint sites..." -ForegroundColor Yellow
    $sourceSiteCount = (Import-Csv "SourceTenantSites.csv").Count
    $destSiteCount = (Get-PnPTenantSite).Count
    
    $validationResults += [PSCustomObject]@{
        Component = "SharePoint Sites"
        Expected = $sourceSiteCount
        Actual = $destSiteCount
        Status = if($sourceSiteCount -le $destSiteCount) {"✅ Pass"} else {"❌ Fail"}
    }
    
    # Test key functionality
    Write-Host "Testing key functionality..." -ForegroundColor Yellow
    
    # Test email flow
    $testEmail = Send-MailMessage -From "admin@destination.com" -To "test@destination.com" -Subject "Migration Test" -Body "Test email" -ErrorAction SilentlyContinue
    $emailTest = if($testEmail) {"✅ Pass"} else {"❌ Fail"}
    
    $validationResults += [PSCustomObject]@{
        Component = "Email Flow"
        Expected = "Working"
        Actual = if($emailTest -eq "✅ Pass") {"Working"} else {"Failed"}
        Status = $emailTest
    }
    
    # Display results
    Write-Host "`n=== Validation Results ===" -ForegroundColor Green
    $validationResults | Format-Table -AutoSize
    
    # Generate validation report
    $validationResults | Export-Csv "MigrationValidation_$(Get-Date -Format 'yyyyMMdd_HHmm').csv" -NoTypeInformation
}

Validate-Migration</code>
        </div>

        <div class="tutorial-warning">
          <h4>⚠️ Critical Considerations</h4>
          <ul>
            <li><strong>Data sovereignty:</strong> Ensure compliance with data residency requirements</li>
            <li><strong>Downtime planning:</strong> Plan for service interruptions during cutover</li>
            <li><strong>Rollback procedures:</strong> Have detailed rollback plan ready</li>
            <li><strong>User communication:</strong> Keep users informed throughout the process</li>
            <li><strong>License management:</strong> Monitor license consumption and costs</li>
            <li><strong>Security review:</strong> Validate all security configurations post-migration</li>
          </ul>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Migration Success Factors</h4>
          <ul>
            <li>Thorough planning and testing with pilot groups</li>
            <li>Clear communication timeline and expectations</li>
            <li>Dedicated migration team with defined roles</li>
            <li>24/7 monitoring during critical migration phases</li>
            <li>Comprehensive backup and rollback procedures</li>
            <li>Post-migration optimization and cleanup</li>
          </ul>
        </div>

        <h3>📈 Success Metrics</h3>
        <ul>
          <li><strong>Data integrity:</strong> 100% of critical data migrated successfully</li>
          <li><strong>User satisfaction:</strong> >90% user acceptance post-migration</li>
          <li><strong>Service availability:</strong> <4 hours total downtime</li>
          <li><strong>Issue resolution:</strong> All critical issues resolved within 24 hours</li>
          <li><strong>Timeline adherence:</strong> Migration completed within planned timeframe</li>
        </ul>
      </div>
    `
  }
};

// Additional Microsoft 365 tutorials would continue here...
// Including send-as permissions, SharePoint landing pages, Power Automate flows, etc.