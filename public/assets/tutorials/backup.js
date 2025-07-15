/**
 * Velocity Lab - Backup & Recovery Tutorials
 * Comprehensive backup and disaster recovery guides for MSP professionals
 */

window.BACKUP_TUTORIALS = {
  'veeam-setup': {
    title: 'Veeam Backup & Replication setup and configuration',
    category: 'backup',
    difficulty: 'intermediate',
    estimatedTime: '3-4 hours',
    content: `
      <div class="tutorial-content">
        <h2>💾 Veeam Backup & Replication Setup and Configuration</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Complete setup and configuration of Veeam Backup & Replication for enterprise backup and disaster recovery, including best practices for performance optimization and monitoring.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Windows Server 2016/2019/2022 for Veeam server</li>
          <li>Minimum 8GB RAM, 4 CPU cores, 100GB free disk space</li>
          <li>VMware vSphere or Microsoft Hyper-V environment</li>
          <li>Network connectivity to backup targets and infrastructure</li>
          <li>Administrative credentials for virtualization platforms</li>
        </ul>

        <h3>🚀 Step 1: Installation and Initial Setup</h3>
        <h4>Service Account Configuration</h4>
        <div class="code-block">
          <code># Create dedicated service account
# On domain controller:
New-ADUser -Name "VeeamService" \\`
    -UserPrincipalName "VeeamService@company.local" \\`
    -AccountPassword (ConvertTo-SecureString "ComplexPassword123!" -AsPlainText -Force) \\`
    -Enabled \\$true \\`
    -PasswordNeverExpires \\$true \\`
    -Description "Veeam Backup Service Account"

# Grant "Log on as a service" right
# Use Local Security Policy or Group Policy</code>
        </div>

        <h4>Database Configuration</h4>
        <div class="code-block">
          <code># For production environments, use SQL Server
# Create Veeam database

-- Connect to SQL Server Management Studio
CREATE DATABASE [VeeamBackup]
ON 
( NAME = N'VeeamBackup', 
  FILENAME = N'C:\\VeeamDB\\VeeamBackup.mdf',
  SIZE = 1024MB,
  MAXSIZE = UNLIMITED,
  FILEGROWTH = 512MB )
LOG ON 
( NAME = N'VeeamBackup_Log',
  FILENAME = N'C:\\VeeamDB\\VeeamBackup_Log.ldf',
  SIZE = 256MB,
  MAXSIZE = UNLIMITED,
  FILEGROWTH = 128MB )

-- Create SQL login for Veeam service account
CREATE LOGIN [COMPANY\\VeeamService] FROM WINDOWS
USE [VeeamBackup]
CREATE USER [COMPANY\\VeeamService] FOR LOGIN [COMPANY\\VeeamService]
EXEC sp_addrolemember N'db_owner', N'COMPANY\\VeeamService'</code>
        </div>

        <h3>🌐 Step 2: Infrastructure Setup</h3>
        <h4>Add VMware vSphere Infrastructure</h4>
        <div class="code-block">
          <code># vCenter Configuration
Server: vcenter.company.local
Port: 443
Username: COMPANY\\veeam-backup@company.local
Password: [service-account-password]
Description: Production vCenter Server

# Grant permissions in vSphere:
# Create role "Veeam Backup Role" with these privileges:
# - Datastore: Browse, Low level file operations, Remove file, Update virtual machine files
# - Host: Configuration → Advanced settings, Local operations → Reconfigure VM
# - Network: Assign network
# - Resource: Assign VM to resource pool
# - Virtual machine: All privileges except Console interaction</code>
        </div>

        <h3>🔄 Step 3: Backup Job Configuration</h3>
        <h4>PowerShell Backup Job Creation</h4>
        <div class="code-block">
          <code># PowerShell script for backup job creation
Add-PSSnapin VeeamPSSnapin

# Get objects
\\$Server = Get-VBRServer -Name "vcenter.company.local"
\\$Repository = Get-VBRBackupRepository -Name "Backup-Repo-Primary"

# Find VMs
\\$VMs = Get-VBRViEntity -Server \\$Server | Where-Object {\\$_.Name -match "Production-.*"}

# Create backup job
\\$Job = Add-VBRViBackupJob -Name "PowerShell_Backup_Job" \\`
    -Entity \\$VMs \\`
    -BackupRepository \\$Repository \\`
    -Description "Backup job created via PowerShell"

# Configure advanced settings
\\$JobOptions = Get-VBRJobOptions -Job \\$Job
\\$JobOptions.BackupStorageOptions.RetainCycles = 14
\\$JobOptions.GenerationPolicy.ScheduleDeleteMode = "DeleteFirstHouse"
\\$JobOptions.BackupTargetOptions.Algorithm = "Incremental"

# Set job options
Set-VBRJobOptions -Job \\$Job -Options \\$JobOptions

Write-Host "Backup job created successfully: \\$(\\$Job.Name)"</code>
        </div>

        <h3>🔐 Step 5: Security and Encryption Configuration</h3>
        <h4>Enable Backup Encryption</h4>
        <div class="code-block">
          <code># PowerShell encryption configuration
\\$Job = Get-VBRJob -Name "Daily_Production_VMs"
\\$EncryptionKey = Add-VBREncryptionKey -Password (ConvertTo-SecureString "Strong-Password123!" -AsPlainText -Force) -Description "Production encryption key"

\\$Options = Get-VBRJobOptions -Job \\$Job
\\$Options.BackupStorageOptions.StorageEncryptionEnabled = \\$true
\\$Options.BackupStorageOptions.EncryptionKey = \\$EncryptionKey
Set-VBRJobOptions -Job \\$Job -Options \\$Options</code>
        </div>

        <h3>📊 Step 7: Monitoring and Alerting</h3>
        <h4>Advanced Monitoring Setup</h4>
        <div class="code-block">
          <code># PowerShell monitoring script
Add-PSSnapin VeeamPSSnapin

function Get-VeeamJobStatus {
    \\$jobs = Get-VBRJob
    \\$report = @()
    
    foreach (\\$job in \\$jobs) {
        \\$session = Get-VBRBackupSession -Job \\$job | Sort-Object CreationTime -Descending | Select-Object -First 1
        
        if (\\$session) {
            \\$report += [PSCustomObject]@{
                JobName = \\$job.Name
                LastRun = \\$session.CreationTime
                Status = \\$session.State
                Result = \\$session.Result
                Duration = \\$session.Progress.Duration
                ProcessedObjects = \\$session.Progress.ProcessedObjects
                TotalObjects = \\$session.Progress.TotalObjects
                TransferredSize = [math]::Round(\\$session.Progress.TransferedSize / 1GB, 2)
            }
        }
    }
    
    return \\$report
}

# Generate daily report
\\$report = Get-VeeamJobStatus
\\$report | Export-Csv "VeeamDailyReport_\\$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices Summary</h4>
          <ul>
            <li>Follow 3-2-1 backup rule: 3 copies, 2 different media, 1 offsite</li>
            <li>Test backups regularly with automated verification</li>
            <li>Use immutable backups for ransomware protection</li>
            <li>Monitor backup performance and optimize bottlenecks</li>
            <li>Document all procedures and maintain runbooks</li>
            <li>Regular DR testing with business stakeholder involvement</li>
            <li>Keep Veeam software updated with latest patches</li>
          </ul>
        </div>
      </div>
    `
  },

  'backup-radar': {
    title: 'Backup monitoring with Backup Radar platform',
    category: 'backup',
    difficulty: 'beginner',
    estimatedTime: '1-2 hours',
    content: `
      <div class="tutorial-content">
        <h2>📡 Backup Monitoring with Backup Radar Platform</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Set up and configure Backup Radar for centralized monitoring of backup systems across multiple clients, including dashboard creation, alerting, and reporting.</p>
        </div>

        <h3>🔌 Step 2: Connect Backup Systems</h3>
        <h4>Windows Server Backup Integration</h4>
        <div class="code-block">
          <code># Required PowerShell script on target server
# Save as: C:\\Scripts\\BackupStatus.ps1

Import-Module WindowsServerBackup

function Get-BackupStatus {
    try {
        \\$policy = Get-WBPolicy -ErrorAction Stop
        \\$summary = Get-WBSummary -ErrorAction Stop
        
        \\$lastBackup = \\$summary.LastSuccessfulBackupTime
        \\$status = if (\\$summary.LastBackupResultHR -eq 0) { "Success" } else { "Failed" }
        
        \\$result = @{
            LastBackup = \\$lastBackup
            Status = \\$status
            NextBackup = \\$summary.NextBackupTime
            BackupTarget = (\\$policy.Target | Select-Object -First 1).Label
        }
        
        return \\$result | ConvertTo-Json
    }
    catch {
        return @{Error = \\$_.Exception.Message} | ConvertTo-Json
    }
}

Get-BackupStatus</code>
        </div>

        <h3>🔧 Step 6: Advanced Configuration</h3>
        <h4>API Integration for Custom Applications</h4>
        <div class="code-block">
          <code># PowerShell example for API integration
\\$apiKey = "your-api-key-here"
\\$baseUrl = "https://api.backupradar.com/v1"
\\$headers = @{
    "Authorization" = "Bearer \\$apiKey"
    "Content-Type" = "application/json"
}

# Get backup status for all clients
function Get-AllClientBackupStatus {
    \\$endpoint = "\\$baseUrl/backups/status"
    \\$response = Invoke-RestMethod -Uri \\$endpoint -Headers \\$headers -Method GET
    return \\$response
}

# Create custom alert
function Create-CustomAlert {
    param(
        [string]\\$ClientName,
        [string]\\$Severity,
        [string]\\$Message
    )
    
    \\$body = @{
        clientName = \\$ClientName
        severity = \\$Severity
        message = \\$Message
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json
    
    \\$endpoint = "\\$baseUrl/alerts"
    \\$response = Invoke-RestMethod -Uri \\$endpoint -Headers \\$headers -Method POST -Body \\$body
    return \\$response
}

\\$backupStatus = Get-AllClientBackupStatus
Write-Host "Total clients monitored: \\$(\\$backupStatus.totalClients)"</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices for Backup Monitoring</h4>
          <ul>
            <li>Set up proactive alerts before backups fail completely</li>
            <li>Monitor backup windows to prevent business hour impacts</li>
            <li>Track storage growth trends for capacity planning</li>
            <li>Implement automated ticket creation for efficient response</li>
            <li>Regular review of alert thresholds and escalation procedures</li>
            <li>Use client-specific dashboards for transparency</li>
            <li>Document all alert responses and resolutions</li>
          </ul>
        </div>
      </div>
    `
  }
};