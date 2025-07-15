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
        <h4>Download and Install Veeam B&R</h4>
        <ol>
          <li>Download Veeam Backup & Replication from official website</li>
          <li>Mount ISO and run <strong>Setup.exe</strong></li>
          <li>Follow installation wizard:
            <ul>
              <li>Accept license agreement</li>
              <li>Enter license key (or use trial)</li>
              <li>Choose installation path</li>
              <li>Configure service account</li>
            </ul>
          </li>
        </ol>

        <h4>Service Account Configuration</h4>
        <div class="code-block">
          <code># Create dedicated service account
# On domain controller:
New-ADUser -Name "VeeamService" `
    -UserPrincipalName "VeeamService@company.local" `
    -AccountPassword (ConvertTo-SecureString "ComplexPassword123!" -AsPlainText -Force) `
    -Enabled $true `
    -PasswordNeverExpires $true `
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
  FILENAME = N'C:\VeeamDB\VeeamBackup.mdf',
  SIZE = 1024MB,
  MAXSIZE = UNLIMITED,
  FILEGROWTH = 512MB )
LOG ON 
( NAME = N'VeeamBackup_Log',
  FILENAME = N'C:\VeeamDB\VeeamBackup_Log.ldf',
  SIZE = 256MB,
  MAXSIZE = UNLIMITED,
  FILEGROWTH = 128MB )

-- Create SQL login for Veeam service account
CREATE LOGIN [COMPANY\VeeamService] FROM WINDOWS
USE [VeeamBackup]
CREATE USER [COMPANY\VeeamService] FOR LOGIN [COMPANY\VeeamService]
EXEC sp_addrolemember N'db_owner', N'COMPANY\VeeamService'</code>
        </div>

        <h3>🌐 Step 2: Infrastructure Setup</h3>
        <h4>Add VMware vSphere Infrastructure</h4>
        <ol>
          <li>Open Veeam Console</li>
          <li>Go to <strong>Backup Infrastructure → Managed Servers</strong></li>
          <li>Click <strong>Add Server → VMware vSphere</strong></li>
          <li>Configure vCenter connection:
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
          </li>
        </ol>

        <h4>Add Backup Infrastructure Components</h4>
        <div class="code-block">
          <code># Add backup proxies
# Backup Infrastructure → Backup Proxies → Add VMware Backup Proxy

Proxy Server: backup-proxy-01.company.local
Transport Mode: Virtual appliance (Hot-add)
Max concurrent tasks: 4
Choose VM disks to process:
  - Only VM disks that are stored on the following datastores: [select fast storage]
  
# Add backup repositories
# Backup Infrastructure → Backup Repositories → Add Repository

Repository Name: Backup-Repo-Primary
Type: Microsoft Windows
Server: backup-storage-01.company.local
Path: E:\VeeamBackups\
Space: 10TB available
Max concurrent tasks: 10
Use per-VM backup files: Enabled</code>
        </div>

        <h3>🔄 Step 3: Backup Job Configuration</h3>
        <h4>Create VM Backup Job</h4>
        <div class="code-block">
          <code># Create new backup job
# Home → Jobs → Backup → Virtual machine

Job Name: Daily_Production_VMs
Description: Daily backup of production virtual machines

Virtual Machines:
- Select VMs: Production-Web-01, Production-DB-01, Production-App-01
- Exclusions: None

Destination:
- Backup repository: Backup-Repo-Primary
- Backup proxy: Automatic selection
- Retention policy: 14 restore points

Guest Processing:
- Enable application-aware processing: Yes
- Guest OS credentials: COMPANY\veeam-backup
- Transaction log processing: Process transaction logs with this job
- Log backup settings: Backup logs every 15 minutes

Schedule:
- Run the job automatically: Daily at 10:00 PM
- Retry failed VMs: 3 times at 10 minute intervals</code>
        </div>

        <h4>PowerShell Backup Job Creation</h4>
        <div class="code-block">
          <code># PowerShell script for backup job creation
Add-PSSnapin VeeamPSSnapin

# Get objects
$Server = Get-VBRServer -Name "vcenter.company.local"
$Repository = Get-VBRBackupRepository -Name "Backup-Repo-Primary"

# Find VMs
$VMs = Get-VBRViEntity -Server $Server | Where-Object {$_.Name -match "Production-.*"}

# Create backup job
$Job = Add-VBRViBackupJob -Name "PowerShell_Backup_Job" `
    -Entity $VMs `
    -BackupRepository $Repository `
    -Description "Backup job created via PowerShell"

# Configure advanced settings
$JobOptions = Get-VBRJobOptions -Job $Job
$JobOptions.BackupStorageOptions.RetainCycles = 14
$JobOptions.GenerationPolicy.ScheduleDeleteMode = "DeleteFirstHouse"
$JobOptions.BackupTargetOptions.Algorithm = "Incremental"
$JobOptions.GeneralOptions.JobSupplement = "None"

# Set job options
Set-VBRJobOptions -Job $Job -Options $JobOptions

# Configure schedule
$ScheduleOptions = New-VBRJobScheduleOptions
$ScheduleOptions.OptionsScheduleAfterJob.IsEnabled = $false
$ScheduleOptions.OptionsDaily.Enabled = $true
$ScheduleOptions.OptionsDaily.Kind = "Everyday"
$ScheduleOptions.OptionsDaily.Time = "22:00:00"

Set-VBRJobScheduleOptions -Job $Job -Options $ScheduleOptions

# Enable job
Set-VBRJob -Job $Job -Disabled:$false

Write-Host "Backup job created successfully: $($Job.Name)"</code>
        </div>

        <h3>🗄️ Step 4: Advanced Storage Configuration</h3>
        <h4>Scale-out Backup Repository</h4>
        <div class="code-block">
          <code># Create scale-out backup repository for large environments
# Backup Infrastructure → Scale-out Repositories → Add Scale-out Repository

SOBR Name: SOBR_Production
Description: Scale-out repository for production backups

Performance Extents:
- Backup-Repo-Primary (10TB) - Performance tier
- Backup-Repo-Secondary (15TB) - Performance tier

Capacity Extents:
- Backup-Repo-Archive (50TB) - Capacity tier

Placement Policy:
- Data locality: Strict (data blocks are stored on the same extent)
- Performance tier: Store backups for 30 days, then move to capacity tier
- Object storage: Copy backups to AWS S3 after 60 days

Per-VM backup files: Enabled
Encryption: Enabled with password protection</code>
        </div>

        <h4>Cloud Storage Integration</h4>
        <div class="code-block">
          <code># Configure cloud storage for archive tier
# Backup Infrastructure → Object Storage → Add Object Storage

Cloud Provider: Amazon S3
Service point: https://s3.amazonaws.com
Bucket: veeam-backup-archive-company
Folder: /production-backups/

Credentials:
- Access Key: [AWS-ACCESS-KEY]
- Secret Key: [AWS-SECRET-KEY]

Immutability:
- Enable immutability: Yes
- Immutability period: 7 years (for compliance)

Data reduction:
- Compression: Optimal
- Deduplication: Enabled
- Encryption: Enabled</code>
        </div>

        <h3>🔐 Step 5: Security and Encryption Configuration</h3>
        <h4>Enable Backup Encryption</h4>
        <div class="code-block">
          <code># Configure backup encryption
# Backup job → Storage → Advanced → Encryption

Enable backup file encryption: Yes
Password: [Strong-Encryption-Password]
Encryption standard: AES 256

# Store encryption passwords in Veeam Password Manager
# File → Manage Passwords → Add Password

Password ID: Production_Backup_Encryption
Password: [Strong-Encryption-Password]
Description: Encryption key for production backups
Hint: Standard company encryption key format

# PowerShell encryption configuration
$Job = Get-VBRJob -Name "Daily_Production_VMs"
$EncryptionKey = Add-VBREncryptionKey -Password (ConvertTo-SecureString "Strong-Password123!" -AsPlainText -Force) -Description "Production encryption key"

$Options = Get-VBRJobOptions -Job $Job
$Options.BackupStorageOptions.StorageEncryptionEnabled = $true
$Options.BackupStorageOptions.EncryptionKey = $EncryptionKey
Set-VBRJobOptions -Job $Job -Options $Options</code>
        </div>

        <h4>Immutable Backup Configuration</h4>
        <div class="code-block">
          <code># Configure immutable backups (requires Linux repository with XFS/ReFS)
# Backup Infrastructure → Backup Repositories → Add Repository

Repository type: Linux
Server: backup-linux-01.company.local
Path: /backup/immutable
Make recent backups immutable for: 30 days
Make archived backups immutable for: 7 years

Immutability settings:
- Prevent backup deletion: Enabled
- Block backup modification: Enabled
- Ransomware protection: Maximum
- Compliance mode: Enabled (cannot be disabled by anyone)</code>
        </div>

        <h3>🔄 Step 6: Replication Configuration</h3>
        <h4>VM Replication Job</h4>
        <div class="code-block">
          <code># Create replication job for DR
# Home → Jobs → Replication → Virtual machine

Job name: DR_Replication_CriticalVMs
Description: Replicate critical VMs to DR site

Source:
- Virtual machines: Production-DB-01, Production-App-01
- Source proxy: Automatic selection

Destination:
- Host: dr-vcenter.company.local
- Resource pool: DR-ResourcePool
- VM folder: Replicated VMs
- Datastore: DR-Storage-01
- Destination proxy: dr-backup-proxy-01

Network:
- Network mapping: Production_Network → DR_Network
- Re-IP rules: 
  - Source: 192.168.100.0/24
  - Target: 192.168.200.0/24

Replication Schedule:
- Run automatically: Every 4 hours
- Restore points to keep: 24
- Replica seeding: Disabled (full replication)

Advanced:
- Traffic encryption: Enabled
- Network traffic throttling: 100 Mbps (business hours), Unlimited (off-hours)
- VSS options: Require successful VSS processing</code>
        </div>

        <h3>📊 Step 7: Monitoring and Alerting</h3>
        <h4>Configure Email Notifications</h4>
        <div class="code-block">
          <code># Configure SMTP settings
# General Options → Email Settings

SMTP server: smtp.company.local
Port: 587
Authentication: Use the following account
Username: veeam-alerts@company.local
Password: [password]
Use TLS encryption: Yes

From address: veeam-backup@company.local
To address: it-team@company.local

Notification settings:
- Send email notification if job completes with Warning: Yes
- Send email notification if job fails: Yes
- Send email notification if job completes successfully: No (to reduce noise)
- Include backup file encryption passwords: No
- Suppress notifications until: Never</code>
        </div>

        <h4>Advanced Monitoring Setup</h4>
        <div class="code-block">
          <code># PowerShell monitoring script
Add-PSSnapin VeeamPSSnapin

function Get-VeeamJobStatus {
    $jobs = Get-VBRJob
    $report = @()
    
    foreach ($job in $jobs) {
        $session = Get-VBRBackupSession -Job $job | Sort-Object CreationTime -Descending | Select-Object -First 1
        
        if ($session) {
            $report += [PSCustomObject]@{
                JobName = $job.Name
                LastRun = $session.CreationTime
                Status = $session.State
                Result = $session.Result
                Duration = $session.Progress.Duration
                ProcessedObjects = $session.Progress.ProcessedObjects
                TotalObjects = $session.Progress.TotalObjects
                TransferredSize = [math]::Round($session.Progress.TransferedSize / 1GB, 2)
                Bottleneck = $session.Progress.BottleneckManager.BottleneckType
            }
        }
    }
    
    return $report
}

# Generate daily report
$report = Get-VeeamJobStatus
$report | Export-Csv "VeeamDailyReport_$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# Check for failed jobs
$failedJobs = $report | Where-Object {$_.Result -eq "Failed"}
if ($failedJobs) {
    $emailBody = "The following Veeam jobs failed:`n`n"
    $failedJobs | ForEach-Object {
        $emailBody += "Job: $($_.JobName) - Status: $($_.Status) - Last Run: $($_.LastRun)`n"
    }
    
    Send-MailMessage -From "veeam-alerts@company.local" `
        -To "it-team@company.local" `
        -Subject "ALERT: Veeam Backup Jobs Failed" `
        -Body $emailBody `
        -SmtpServer "smtp.company.local"
}</code>
        </div>

        <h3>🔧 Step 8: Performance Optimization</h3>
        <h4>Backup Proxy Optimization</h4>
        <div class="code-block">
          <code># Optimize backup proxy settings based on infrastructure

# For VMware environments:
Transport Mode Selection:
- Virtual Appliance (Hot-Add): Best for most scenarios
- Network Mode (NBD): Use when hot-add is not available
- Direct Storage Access: For physical Veeam proxies with SAN access

Concurrent Tasks:
- Physical proxy: 1 task per CPU core
- Virtual proxy: 1 task per vCPU (max 8)
- Consider storage performance limitations

Memory allocation:
- Minimum: 2GB + 512MB per concurrent task
- Recommended: 4GB + 1GB per concurrent task

# PowerShell optimization script
$proxies = Get-VBRViProxy

foreach ($proxy in $proxies) {
    $cpuCores = (Get-WmiObject -ComputerName $proxy.Host.Name -Class Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum
    $recommendedTasks = [math]::Min($cpuCores, 8)
    
    Write-Host "Proxy: $($proxy.Name)"
    Write-Host "CPU Cores: $cpuCores"
    Write-Host "Recommended concurrent tasks: $recommendedTasks"
    Write-Host "Current concurrent tasks: $($proxy.MaxTasksCount)"
    
    if ($proxy.MaxTasksCount -ne $recommendedTasks) {
        Write-Host "Consider adjusting concurrent tasks to $recommendedTasks" -ForegroundColor Yellow
    }
}</code>
        </div>

        <h4>Repository Performance Tuning</h4>
        <div class="code-block">
          <code># Repository optimization best practices

Storage Configuration:
- Use RAID 6 or RAID 10 for backup repositories
- Separate OS, database, and backup storage
- Use fast storage (SSD) for Veeam database
- Consider deduplication appliances for large environments

Network Optimization:
- Dedicated backup network (isolated VLAN)
- Use 10GbE for high-throughput environments
- Configure link aggregation for bandwidth
- Optimize TCP window scaling

# Repository performance monitoring
function Test-RepositoryPerformance {
    param($RepositoryName)
    
    $repo = Get-VBRBackupRepository -Name $RepositoryName
    $path = $repo.Path
    
    # Test write performance
    $testFile = Join-Path $path "VeeamPerfTest_$(Get-Date -Format 'yyyyMMddHHmm').tmp"
    $testSize = 1GB
    
    $writeStartTime = Get-Date
    fsutil file createnew $testFile $testSize
    $writeEndTime = Get-Date
    $writeSpeed = [math]::Round($testSize / ($writeEndTime - $writeStartTime).TotalSeconds / 1MB, 2)
    
    # Test read performance  
    $readStartTime = Get-Date
    $null = Get-Content $testFile -Raw
    $readEndTime = Get-Date
    $readSpeed = [math]::Round($testSize / ($readEndTime - $readStartTime).TotalSeconds / 1MB, 2)
    
    # Cleanup
    Remove-Item $testFile
    
    Write-Host "Repository Performance Test Results:"
    Write-Host "Write Speed: $writeSpeed MB/s"
    Write-Host "Read Speed: $readSpeed MB/s"
    
    if ($writeSpeed -lt 100) {
        Write-Warning "Write performance below recommended 100 MB/s"
    }
    if ($readSpeed -lt 200) {
        Write-Warning "Read performance below recommended 200 MB/s"
    }
}</code>
        </div>

        <h3>🚨 Step 9: Disaster Recovery Testing</h3>
        <h4>Automated DR Testing</h4>
        <div class="code-block">
          <code># Automated disaster recovery testing script
Add-PSSnapin VeeamPSSnapin

function Test-DisasterRecovery {
    param(
        [string]$VMName,
        [string]$TestNetworkName = "DR-Test-Network",
        [int]$TestDurationMinutes = 30
    )
    
    try {
        Write-Host "Starting DR test for VM: $VMName" -ForegroundColor Green
        
        # Find latest restore point
        $restorePoint = Get-VBRRestorePoint -Name $VMName | Sort-Object CreationTime -Descending | Select-Object -First 1
        
        if (-not $restorePoint) {
            throw "No restore points found for VM: $VMName"
        }
        
        Write-Host "Using restore point from: $($restorePoint.CreationTime)"
        
        # Start instant VM recovery
        $instantRecovery = Start-VBRInstantRecovery -RestorePoint $restorePoint -VMName "$VMName-DR-Test" -Reason "Automated DR Test"
        
        Write-Host "Instant recovery started for $VMName"
        
        # Wait for VM to boot
        Start-Sleep -Seconds 180
        
        # Test VM connectivity (customize based on your needs)
        $testIP = "192.168.200.100"  # Adjust for your DR network
        $pingResult = Test-Connection -ComputerName $testIP -Count 3 -ErrorAction SilentlyContinue
        
        $testResults = [PSCustomObject]@{
            VMName = $VMName
            RestorePointDate = $restorePoint.CreationTime
            RecoveryStatus = "Success"
            ConnectivityTest = if($pingResult) {"Pass"} else {"Fail"}
            TestDate = Get-Date
            Duration = "$TestDurationMinutes minutes"
        }
        
        # Wait for test duration
        Write-Host "Running DR test for $TestDurationMinutes minutes..."
        Start-Sleep -Seconds ($TestDurationMinutes * 60)
        
        # Stop instant recovery
        Stop-VBRInstantRecovery -InstantRecovery $instantRecovery
        Write-Host "DR test completed and resources cleaned up"
        
        return $testResults
        
    } catch {
        Write-Error "DR test failed: $($_.Exception.Message)"
        return $null
    }
}

# Schedule monthly DR tests
$criticalVMs = @("Production-DB-01", "Production-App-01", "Production-Web-01")
$testResults = @()

foreach ($vm in $criticalVMs) {
    $result = Test-DisasterRecovery -VMName $vm -TestDurationMinutes 15
    if ($result) {
        $testResults += $result
    }
    Start-Sleep -Seconds 300  # Wait 5 minutes between tests
}

# Generate DR test report
$testResults | Export-Csv "DR_Test_Report_$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation

# Email results to management
$emailBody = "Monthly DR Test Results:`n`n"
$testResults | ForEach-Object {
    $emailBody += "VM: $($_.VMName) - Recovery: $($_.RecoveryStatus) - Connectivity: $($_.ConnectivityTest)`n"
}

Send-MailMessage -From "veeam-alerts@company.local" `
    -To "management@company.local" `
    -Subject "Monthly DR Test Results" `
    -Body $emailBody `
    -SmtpServer "smtp.company.local"</code>
        </div>

        <h3>🔒 Step 10: Compliance and Retention</h3>
        <h4>Compliance Configuration</h4>
        <div class="code-block">
          <code># Configure retention policies for compliance

# Financial sector (SOX compliance)
Retention Policy: SOX_Compliance
Description: 7-year retention for financial data
Restore points: 2555 (7 years daily)
Archive tier: After 90 days
Immutability: 7 years
Legal hold: Supported

# Healthcare (HIPAA compliance)  
Retention Policy: HIPAA_Compliance
Description: 6-year retention for healthcare data
Restore points: 2190 (6 years daily)
Encryption: AES-256 (required)
Access logging: Full audit trail
Data location: US datacenters only

# Manufacturing (ISO compliance)
Retention Policy: ISO_Manufacturing
Description: 10-year retention for quality records
Restore points: 3650 (10 years daily)
Verification: Monthly restore tests
Documentation: Change control records

# PowerShell compliance report
function Generate-ComplianceReport {
    $jobs = Get-VBRJob
    $report = @()
    
    foreach ($job in $jobs) {
        $retentionPolicy = $job.Options.BackupStorageOptions.RetainCycles
        $encryptionEnabled = $job.Options.BackupStorageOptions.StorageEncryptionEnabled
        
        $report += [PSCustomObject]@{
            JobName = $job.Name
            RetentionDays = $retentionPolicy
            EncryptionEnabled = $encryptionEnabled
            ComplianceStatus = if($retentionPolicy -ge 2555 -and $encryptionEnabled) {"SOX Compliant"} 
                              elseif($retentionPolicy -ge 2190 -and $encryptionEnabled) {"HIPAA Compliant"}
                              else {"Review Required"}
            LastBackup = (Get-VBRBackupSession -Job $job | Sort-Object CreationTime -Descending | Select-Object -First 1).CreationTime
        }
    }
    
    return $report
}

$complianceReport = Generate-ComplianceReport
$complianceReport | Export-Csv "Veeam_Compliance_Report_$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation</code>
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

        <h3>📊 Key Performance Metrics</h3>
        <ul>
          <li><strong>Backup success rate:</strong> >98% monthly average</li>
          <li><strong>Recovery time objective (RTO):</strong> <4 hours for critical systems</li>
          <li><strong>Recovery point objective (RPO):</strong> <1 hour for critical data</li>
          <li><strong>Backup window:</strong> Complete within allocated timeframe</li>
          <li><strong>Storage efficiency:</strong> >50% reduction via deduplication/compression</li>
          <li><strong>DR test success:</strong> 100% successful monthly tests</li>
        </ul>
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

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Backup Radar account (trial or subscription)</li>
          <li>Access to backup systems (Veeam, Windows Backup, etc.)</li>
          <li>Network connectivity to monitored systems</li>
          <li>Administrative credentials for backup systems</li>
        </ul>

        <h3>🚀 Step 1: Initial Platform Setup</h3>
        <h4>Account Configuration</h4>
        <ol>
          <li>Sign up at <strong>https://backupradar.com</strong></li>
          <li>Complete company profile:
            <div class="code-block">
              <code># Company Information
Company Name: Your MSP Company
Industry: Managed Service Provider
Number of Clients: 50+
Primary Backup Platforms: Veeam, Windows Server Backup, Azure Backup
Contact Email: admin@yourmsp.com
Time Zone: Eastern Standard Time</code>
            </div>
          </li>
          <li>Configure notification preferences</li>
          <li>Set up user accounts for team members</li>
        </ol>

        <h4>Client Organization Setup</h4>
        <div class="code-block">
          <code># Create client organizations
# Clients → Add New Client

Client 1:
Name: Acme Corporation
Industry: Manufacturing
Contact: john.doe@acme.com
SLA Level: Gold (4-hour response)
Backup Requirements: Daily, 30-day retention

Client 2: 
Name: Smith Legal Services
Industry: Legal
Contact: admin@smithlaw.com
SLA Level: Platinum (1-hour response)  
Backup Requirements: Twice daily, 7-year retention

Client 3:
Name: Green Energy Solutions
Industry: Energy
Contact: it@greenenergy.com
SLA Level: Silver (8-hour response)
Backup Requirements: Daily, 90-day retention</code>
        </div>

        <h3>🔌 Step 2: Connect Backup Systems</h3>
        <h4>Veeam Integration</h4>
        <div class="code-block">
          <code># Add Veeam Backup & Replication server
# Connections → Add Connection → Veeam B&R

Connection Name: Acme-Veeam-Primary
Server Address: veeam.acme.local
Port: 9392 (default Veeam port)
Authentication: Windows Authentication
Username: ACME\\veeam-monitor
Password: [monitoring-account-password]
Client Assignment: Acme Corporation

# Required Veeam permissions for monitoring account:
# - Veeam Backup Operator role
# - Local "Log on as a service" right
# - Access to Veeam database (read-only)

# Test connection
Test-NetConnection -ComputerName "veeam.acme.local" -Port 9392</code>
        </div>

        <h4>Windows Server Backup Integration</h4>
        <div class="code-block">
          <code># Add Windows Server Backup monitoring
# Connections → Add Connection → Windows Server Backup

Connection Name: Smith-DC01-Backup
Server Address: dc01.smithlaw.local
Connection Type: WMI/PowerShell
Authentication: Domain Account
Username: SMITHLAW\\backup-monitor
Password: [monitoring-password]
Client Assignment: Smith Legal Services

# Required PowerShell script on target server
# Save as: C:\Scripts\BackupStatus.ps1

Import-Module WindowsServerBackup

function Get-BackupStatus {
    try {
        $policy = Get-WBPolicy -ErrorAction Stop
        $summary = Get-WBSummary -ErrorAction Stop
        
        $lastBackup = $summary.LastSuccessfulBackupTime
        $status = if ($summary.LastBackupResultHR -eq 0) { "Success" } else { "Failed" }
        
        $result = @{
            LastBackup = $lastBackup
            Status = $status
            NextBackup = $summary.NextBackupTime
            BackupTarget = ($policy.Target | Select-Object -First 1).Label
        }
        
        return $result | ConvertTo-Json
    }
    catch {
        return @{Error = $_.Exception.Message} | ConvertTo-Json
    }
}

Get-BackupStatus</code>
        </div>

        <h4>Azure Backup Integration</h4>
        <div class="code-block">
          <code># Azure Backup monitoring via API
# Connections → Add Connection → Azure Backup

Connection Name: Green-Azure-Backup
Subscription ID: 12345678-1234-1234-1234-123456789abc
Resource Group: rg-backup-green
Recovery Services Vault: rsv-green-primary
Authentication: Service Principal
Application ID: [app-id]
Secret: [app-secret]
Tenant ID: [tenant-id]
Client Assignment: Green Energy Solutions

# PowerShell script to test Azure connection
$subscriptionId = "12345678-1234-1234-1234-123456789abc"
$resourceGroupName = "rg-backup-green"
$vaultName = "rsv-green-primary"

# Connect to Azure
Connect-AzAccount -ServicePrincipal -ApplicationId $appId -TenantId $tenantId -CertificateThumbprint $thumbprint

# Get backup status
$vault = Get-AzRecoveryServicesVault -ResourceGroupName $resourceGroupName -Name $vaultName
Set-AzRecoveryServicesVaultContext -Vault $vault

$backupItems = Get-AzRecoveryServicesBackupItem -BackupManagementType AzureVM -WorkloadType AzureVM
foreach ($item in $backupItems) {
    $job = Get-AzRecoveryServicesBackupJob -BackupItem $item | Sort-Object StartTime -Descending | Select-Object -First 1
    Write-Host "VM: $($item.Name) - Last Backup: $($job.StartTime) - Status: $($job.Status)"
}</code>
        </div>

        <h3>📊 Step 3: Dashboard Configuration</h3>
        <h4>Create Client-Specific Dashboards</h4>
        <div class="code-block">
          <code># Dashboard for Acme Corporation
# Dashboards → Create New Dashboard

Dashboard Name: Acme Corporation - Backup Overview
Client Filter: Acme Corporation
Refresh Interval: 5 minutes

Widgets:
1. Backup Success Rate (Last 30 days)
   - Type: Donut Chart
   - Data: Success vs. Failed backups
   - Success Threshold: 95%

2. Recent Backup Status
   - Type: Status Grid
   - Show: Last 7 days
   - Color Coding: Green (Success), Red (Failed), Yellow (Warning)

3. Storage Utilization
   - Type: Bar Chart
   - Data: Used vs. Available space
   - Alert Threshold: 80% usage

4. Backup Performance Trends
   - Type: Line Chart
   - Data: Backup duration over time
   - Period: 30 days

5. Critical Alerts
   - Type: Alert List
   - Filter: High and Critical severity
   - Auto-refresh: 1 minute</code>
        </div>

        <h4>Multi-Tenant Overview Dashboard</h4>
        <div class="code-block">
          <code># MSP Overview Dashboard
# Dashboards → Create New Dashboard

Dashboard Name: MSP - All Clients Overview
Client Filter: All Clients
Refresh Interval: 2 minutes

Widgets:
1. Client Health Summary
   - Type: Status Grid
   - Grouping: By Client
   - Status: Healthy, Warning, Critical

2. Backup Success Rate by Client
   - Type: Horizontal Bar Chart
   - Data: Success percentage per client
   - Benchmark: 98% target

3. Failed Backups - Last 24 Hours
   - Type: Alert List
   - Filter: Failed status, last 24 hours
   - Sort: By client priority (SLA level)

4. Storage Growth Trend
   - Type: Area Chart
   - Data: Total storage usage across all clients
   - Period: 90 days

5. SLA Compliance Status
   - Type: Traffic Light
   - Green: Meeting SLA
   - Yellow: At risk
   - Red: SLA breach

6. Top 10 Largest Backups
   - Type: Data Table
   - Columns: Client, Server, Backup Size, Duration
   - Sort: By backup size descending</code>
        </div>

        <h3>🚨 Step 4: Alerting Configuration</h3>
        <h4>Alert Rules Setup</h4>
        <div class="code-block">
          <code># Create alert rules
# Alerts → Alert Rules → Create Rule

Rule 1: Backup Failure Alert
Trigger: When backup job status = Failed
Conditions:
- Any backup job fails
- Applies to: All clients
- Severity: High
Actions:
- Email: Send to on-call engineer
- SMS: Send to duty manager
- Slack: Post to #alerts channel
- Ticket: Create in ConnectWise/Autotask

Rule 2: Backup Missing Alert  
Trigger: When no backup detected in timeframe
Conditions:
- No successful backup in last 25 hours
- Applies to: Production servers only
- Severity: Critical
Actions:
- Email: Send to team lead and client
- Phone call: Escalate to manager
- Ticket: Create high-priority ticket

Rule 3: Storage Space Warning
Trigger: When storage utilization > threshold
Conditions:
- Storage usage > 80%
- Applies to: All backup repositories
- Severity: Medium
Actions:
- Email: Send to storage team
- Dashboard alert: Show warning icon
- Report: Add to weekly capacity report

Rule 4: Performance Degradation
Trigger: When backup duration exceeds baseline
Conditions:
- Backup takes >150% of average time
- Consecutive occurrences: 3
- Severity: Medium
Actions:
- Email: Send to backup administrator
- Log: Create performance investigation task</code>
        </div>

        <h4>Escalation Procedures</h4>
        <div class="code-block">
          <code># Escalation Matrix Configuration
# Alerts → Escalation Rules

Level 1 - Initial Response (0-15 minutes)
Recipients: On-call engineer, NOC team
Methods: Email, Slack notification
Response Required: Acknowledge within 15 minutes

Level 2 - Escalation (15-30 minutes)  
Trigger: No acknowledgment within 15 minutes
Recipients: Backup team lead, Duty manager
Methods: Email, SMS, Phone call
Response Required: Action plan within 30 minutes

Level 3 - Management Escalation (30-60 minutes)
Trigger: No resolution within 30 minutes
Recipients: IT Manager, Operations Director
Methods: Phone call, Email to management
Response Required: Client communication within 60 minutes

Level 4 - Executive Escalation (60+ minutes)
Trigger: No resolution within 60 minutes
Recipients: CTO, Account Manager, Client contact
Methods: Direct phone call, Emergency meeting
Response Required: Immediate action plan and client call

# PowerShell script for custom escalation
function Send-EscalationAlert {
    param(
        [string]$AlertLevel,
        [string]$ClientName,
        [string]$ServerName,
        [string]$AlertDescription,
        [datetime]$AlertTime
    )
    
    $timeSinceAlert = (Get-Date) - $AlertTime
    $minutesSinceAlert = $timeSinceAlert.TotalMinutes
    
    switch ($AlertLevel) {
        "Level1" {
            if ($minutesSinceAlert -ge 15) {
                Send-SMS -Number "+1234567890" -Message "BACKUP ALERT: $ClientName - $ServerName - $AlertDescription"
                Send-Email -To "manager@msp.com" -Subject "ESCALATION: Backup Alert" -Body $AlertDescription
            }
        }
        "Level2" {
            if ($minutesSinceAlert -ge 30) {
                Start-PhoneCall -Number "+1234567891" -Message "Critical backup alert requires immediate attention"
                Send-Email -To "director@msp.com" -Subject "CRITICAL: Backup System Alert" -Body $AlertDescription
            }
        }
    }
}</code>
        </div>

        <h3>📈 Step 5: Reporting and Analytics</h3>
        <h4>Automated Report Generation</h4>
        <div class="code-block">
          <code># Configure automated reports
# Reports → Scheduled Reports → Create Report

Report 1: Daily Backup Status Report
Schedule: Daily at 7:00 AM
Recipients: backup-team@msp.com, noc@msp.com
Content:
- Backup success/failure summary
- Failed backup details with root cause
- Storage utilization by client
- Performance metrics
- Action items for the day

Report 2: Weekly Client Report  
Schedule: Every Monday at 9:00 AM
Recipients: Client contacts (per client settings)
Content:
- Weekly backup success rate
- Data protected summary
- Any issues and resolutions
- Storage growth trends
- Recommendations for optimization

Report 3: Monthly Executive Summary
Schedule: First Monday of month at 8:00 AM
Recipients: CTO, Operations Director, Account Managers
Content:
- Overall backup health across all clients
- SLA compliance metrics
- Cost analysis and optimization opportunities
- Capacity planning recommendations
- Strategic improvements implemented

Report 4: Compliance Audit Report
Schedule: Quarterly
Recipients: Compliance team, Legal department
Content:
- Backup retention compliance status
- Data encryption verification
- DR test results
- Regulatory requirements adherence
- Risk assessment summary</code>
        </div>

        <h4>Custom Analytics Queries</h4>
        <div class="code-block">
          <code># Custom analytics for backup optimization
# Analytics → Custom Queries

Query 1: Backup Efficiency Analysis
SELECT 
    ClientName,
    ServerName,
    AVG(BackupDuration) as AvgDuration,
    AVG(DataSize) as AvgDataSize,
    AVG(TransferRate) as AvgTransferRate,
    COUNT(*) as BackupCount
FROM BackupJobs 
WHERE BackupDate >= DATEADD(day, -30, GETDATE())
GROUP BY ClientName, ServerName
ORDER BY AvgTransferRate ASC

Query 2: Storage Growth Prediction
SELECT 
    ClientName,
    CurrentStorageUsage,
    AVG(DailyGrowth) as AvgDailyGrowth,
    DATEADD(day, 
        (MaxStorage - CurrentStorageUsage) / AVG(DailyGrowth), 
        GETDATE()) as ProjectedFullDate
FROM StorageUtilization
WHERE Date >= DATEADD(day, -90, GETDATE())
GROUP BY ClientName, CurrentStorageUsage, MaxStorage
HAVING AVG(DailyGrowth) > 0

Query 3: Backup Window Analysis
SELECT 
    ClientName,
    DATEPART(hour, StartTime) as BackupHour,
    AVG(Duration) as AvgDuration,
    COUNT(*) as JobCount
FROM BackupJobs
WHERE BackupDate >= DATEADD(day, -7, GETDATE())
GROUP BY ClientName, DATEPART(hour, StartTime)
ORDER BY ClientName, BackupHour

Query 4: SLA Compliance Tracking
SELECT 
    ClientName,
    SLALevel,
    COUNT(*) as TotalBackups,
    SUM(CASE WHEN Status = 'Success' THEN 1 ELSE 0 END) as SuccessfulBackups,
    (SUM(CASE WHEN Status = 'Success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as SuccessRate,
    CASE 
        WHEN (SUM(CASE WHEN Status = 'Success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) >= 99 THEN 'Meeting SLA'
        WHEN (SUM(CASE WHEN Status = 'Success' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) >= 95 THEN 'At Risk'
        ELSE 'SLA Breach'
    END as SLAStatus
FROM BackupJobs b
JOIN Clients c ON b.ClientName = c.Name
WHERE BackupDate >= DATEADD(day, -30, GETDATE())
GROUP BY ClientName, SLALevel</code>
        </div>

        <h3>🔧 Step 6: Advanced Configuration</h3>
        <h4>API Integration for Custom Applications</h4>
        <div class="code-block">
          <code># Backup Radar API integration
# Settings → API Access → Generate API Key

API Endpoint: https://api.backupradar.com/v1/
API Key: [your-api-key]
Rate Limit: 1000 requests per hour

# PowerShell example for API integration
$apiKey = "your-api-key-here"
$baseUrl = "https://api.backupradar.com/v1"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# Get backup status for all clients
function Get-AllClientBackupStatus {
    $endpoint = "$baseUrl/backups/status"
    $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method GET
    return $response
}

# Create custom alert
function Create-CustomAlert {
    param(
        [string]$ClientName,
        [string]$Severity,
        [string]$Message
    )
    
    $body = @{
        clientName = $ClientName
        severity = $Severity
        message = $Message
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
    } | ConvertTo-Json
    
    $endpoint = "$baseUrl/alerts"
    $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method POST -Body $body
    return $response
}

# Get storage utilization trends
function Get-StorageTrends {
    param([int]$DaysBack = 30)
    
    $endpoint = "$baseUrl/storage/trends?days=$DaysBack"
    $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method GET
    return $response
}

# Example usage
$backupStatus = Get-AllClientBackupStatus
$storageTrends = Get-StorageTrends -DaysBack 60

Write-Host "Total clients monitored: $($backupStatus.totalClients)"
Write-Host "Overall success rate: $($backupStatus.successRate)%"</code>
        </div>

        <h4>Integration with PSA/RMM Tools</h4>
        <div class="code-block">
          <code># ConnectWise integration example
# Integrations → PSA Tools → ConnectWise

ConnectWise Server: https://your-instance.connectwisehost.com
API Version: v2019_5
Company ID: YourCompanyID
Public Key: [public-key]
Private Key: [private-key]
Client ID: [client-id]

Auto-ticket Creation Rules:
- Backup failures: Create ticket with priority based on client SLA
- Storage warnings: Create time and materials ticket
- Performance issues: Create internal task

# Example PowerShell for ConnectWise integration
function Create-ConnectWiseTicket {
    param(
        [string]$CompanyName,
        [string]$Summary,
        [string]$Description,
        [string]$Priority = "Medium"
    )
    
    $cwUrl = "https://your-instance.connectwisehost.com/v4_6_release/apis/3.0"
    $auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("$companyId+$publicKey:$privateKey"))
    
    $headers = @{
        "Authorization" = "Basic $auth"
        "Content-Type" = "application/json"
        "clientId" = $clientId
    }
    
    $ticketBody = @{
        summary = $Summary
        initialDescription = $Description
        priority = @{ name = $Priority }
        company = @{ name = $CompanyName }
        board = @{ id = 1 }  # Service Board ID
        status = @{ id = 1 }  # New status ID
    } | ConvertTo-Json -Depth 3
    
    $response = Invoke-RestMethod -Uri "$cwUrl/service/tickets" -Headers $headers -Method POST -Body $ticketBody
    return $response
}

# Autotask integration example  
function Create-AutotaskTicket {
    param(
        [string]$AccountName,
        [string]$Title,
        [string]$Description,
        [int]$Priority = 2
    )
    
    $autotaskUrl = "https://webservices2.autotask.net/atservicesrest/v1.0"
    $headers = @{
        "ApiIntegrationcode" = $integrationCode
        "UserName" = $username
        "Secret" = $secret
        "Content-Type" = "application/json"
    }
    
    $ticketBody = @{
        Title = $Title
        Description = $Description
        Priority = $Priority
        Status = 1  # New status
        QueueID = 1  # Default queue
        CompanyID = (Get-AutotaskCompany -Name $AccountName).id
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$autotaskUrl/Tickets" -Headers $headers -Method POST -Body $ticketBody
    return $response
}</code>
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

        <h3>📊 Key Monitoring Metrics</h3>
        <ul>
          <li><strong>Backup Success Rate:</strong> Target >98% monthly</li>
          <li><strong>Mean Time to Resolution (MTTR):</strong> <30 minutes for critical alerts</li>
          <li><strong>Alert Accuracy:</strong> <5% false positive rate</li>
          <li><strong>Storage Utilization:</strong> <80% to maintain performance</li>
          <li><strong>Client SLA Compliance:</strong> 100% adherence to contracted levels</li>
          <li><strong>Backup Window Compliance:</strong> Complete within allocated timeframes</li>
        </ul>

        <h3>🔧 Troubleshooting Common Issues</h3>
        <ul>
          <li><strong>Connection timeouts:</strong> Check firewall rules and network connectivity</li>
          <li><strong>Authentication failures:</strong> Verify service account permissions</li>
          <li><strong>Missing data:</strong> Confirm agent installation and configuration</li>
          <li><strong>Alert fatigue:</strong> Tune thresholds and implement smart grouping</li>
          <li><strong>Performance issues:</strong> Optimize polling intervals and data retention</li>
        </ul>
      </div>
    `
  }
};

// Additional backup tutorials would continue here...
// Including Block64 reporting and other backup/DR solutions