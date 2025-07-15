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
        </ol>

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
\\$users = Import-Csv "C:\\Users.csv"

foreach (\\$user in \\$users) {
    \\$upn = \\$user.UserPrincipalName
    \\$password = "TempPass123!"
    
    # Create user
    New-MsolUser -UserPrincipalName \\$upn \\`
        -FirstName \\$user.FirstName \\`
        -LastName \\$user.LastName \\`
        -DisplayName \\$user.DisplayName \\`
        -Department \\$user.Department \\`
        -Title \\$user.JobTitle \\`
        -PhoneNumber \\$user.PhoneNumber \\`
        -UsageLocation \\$user.UsageLocation \\`
        -Password \\$password \\`
        -ForceChangePassword \\$true \\`
        -PasswordNeverExpires \\$false
    
    # Assign license
    Set-MsolUserLicense -UserPrincipalName \\$upn -AddLicenses \\$user.LicenseAssignment
    
    Write-Host "Created user: \\$upn"
}</code>
        </div>

        <h3>🔐 Step 4: Initial Security Configuration</h3>
        <h4>Enable Multi-Factor Authentication</h4>
        <div class="code-block">
          <code># Enable MFA for all users via PowerShell
Connect-MsolService

# Get all users
\\$users = Get-MsolUser -All | Where-Object {\\$_.IsLicensed -eq \\$true}

# Create MFA requirement
\\$mfaSettings = New-Object -TypeName Microsoft.Online.Administration.StrongAuthenticationRequirement
\\$mfaSettings.RelyingParty = "*"
\\$mfaSettings.State = "Enabled"  # or "Enforced"

# Apply to all users
foreach (\\$user in \\$users) {
    Set-MsolUser -UserPrincipalName \\$user.UserPrincipalName -StrongAuthenticationRequirements \\$mfaSettings
    Write-Host "Enabled MFA for: \\$(\\$user.UserPrincipalName)"
}</code>
        </div>

        <h3>📧 Step 5: Exchange Online Configuration</h3>
        <h4>Basic Exchange Settings</h4>
        <div class="code-block">
          <code># Connect to Exchange Online
Install-Module -Name ExchangeOnlineManagement -Force
Connect-ExchangeOnline

# Set default timezone and language
Set-MailboxRegionalConfiguration -Identity "john.smith@acmecorp.com" \\`
    -TimeZone "Eastern Standard Time" \\`
    -Language "en-US"

# Configure organization settings
Set-OrganizationConfig -DefaultPublicFolderMailbox "DefaultPublicFolderMailbox"

# Set message size limits
Set-TransportConfig -MaxSendSize 25MB -MaxReceiveSize 25MB

# Apply retention policy to all mailboxes
Get-Mailbox | Set-Mailbox -RetentionPolicy "Corporate Retention Policy"</code>
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

        <h3>🚀 Step 1: Pre-Migration Assessment</h3>
        <h4>Source Tenant Analysis</h4>
        <div class="code-block">
          <code># PowerShell assessment script
Connect-MsolService
Connect-ExchangeOnline

# Get user inventory
\\$users = Get-MsolUser -All
\\$userStats = @()

foreach (\\$user in \\$users) {
    \\$mailboxStats = Get-MailboxStatistics \\$user.UserPrincipalName -ErrorAction SilentlyContinue
    \\$oneDriveUrl = "https://sourcetenant-my.sharepoint.com/personal/" + \\$user.UserPrincipalName.Replace("@","_").Replace(".","_")
    
    \\$userStats += [PSCustomObject]@{
        UserPrincipalName = \\$user.UserPrincipalName
        DisplayName = \\$user.DisplayName
        IsLicensed = \\$user.IsLicensed
        Licenses = (\\$user.Licenses | ForEach-Object {\\$_.AccountSkuId}) -join ";"
        MailboxSize = if(\\$mailboxStats) {\\$mailboxStats.TotalItemSize} else {"No Mailbox"}
        LastLogon = if(\\$mailboxStats) {\\$mailboxStats.LastLogonTime} else {"N/A"}
        OneDriveUrl = \\$oneDriveUrl
        Department = \\$user.Department
        Title = \\$user.Title
    }
}

\\$userStats | Export-Csv "SourceTenantUsers.csv" -NoTypeInformation</code>
        </div>

        <h3>👥 Step 4: User and Identity Migration</h3>
        <h4>User Account Creation</h4>
        <div class="code-block">
          <code># Bulk user creation in destination tenant
Connect-MsolService

\\$sourceUsers = Import-Csv "SourceTenantUsers.csv"

foreach (\\$user in \\$sourceUsers) {
    if (\\$user.IsLicensed -eq "True") {
        \\$newUpn = \\$user.UserPrincipalName.Replace("@source.com", "@destination.com")
        \\$tempPassword = "TempPass\\$(Get-Random -Maximum 9999)!"
        
        try {
            # Create user account
            New-MsolUser -UserPrincipalName \\$newUpn \\`
                -DisplayName \\$user.DisplayName \\`
                -FirstName (\\$user.DisplayName.Split(' ')[0]) \\`
                -LastName (\\$user.DisplayName.Split(' ')[-1]) \\`
                -Department \\$user.Department \\`
                -Title \\$user.Title \\`
                -UsageLocation "US" \\`
                -Password \\$tempPassword \\`
                -ForceChangePassword \\$true \\`
                -PasswordNeverExpires \\$false
            
            Write-Host "Created user: \\$newUpn"
            
        } catch {
            Write-Error "Failed to create user \\$newUpn : \\$(\\$_.Exception.Message)"
        }
    }
}</code>
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
      </div>
    `
  }
};