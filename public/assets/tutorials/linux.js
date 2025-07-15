/**
 * Velocity Lab - Linux Administration Tutorials
 * Comprehensive Linux guides for MSP professionals
 */

window.LINUX_TUTORIALS = {
  'linux-basics': {
    title: 'Linux basics and system administration',
    category: 'linux',
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>🐧 Linux Basics and System Administration</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Essential Linux commands, file system navigation, user management, and basic system administration tasks for MSP professionals.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Access to a Linux system (Ubuntu, CentOS, or similar)</li>
          <li>Basic command line familiarity</li>
          <li>SSH client for remote access</li>
          <li>Administrative (sudo) privileges</li>
        </ul>

        <h3>🚀 Step 1: Essential Commands</h3>
        <h4>File System Navigation</h4>
        <div class="code-block">
          <code># Basic navigation commands
pwd                    # Print working directory
ls -la                 # List files with details
cd /path/to/directory  # Change directory
cd ..                  # Go up one directory
cd ~                   # Go to home directory
cd -                   # Go to previous directory

# File operations
cp source destination  # Copy files
mv source destination  # Move/rename files
rm filename           # Remove files
rm -rf directory      # Remove directory recursively
mkdir directory       # Create directory
rmdir directory       # Remove empty directory

# File viewing
cat filename          # Display file contents
less filename         # View file page by page
head -n 10 filename   # Show first 10 lines
tail -n 10 filename   # Show last 10 lines
tail -f filename      # Follow file changes (logs)</code>
        </div>

        <h3>👤 Step 2: User Management</h3>
        <h4>Creating and Managing Users</h4>
        <div class="code-block">
          <code># User management commands
sudo useradd -m username           # Create user with home directory
sudo passwd username               # Set user password
sudo usermod -aG sudo username     # Add user to sudo group
sudo userdel -r username           # Delete user and home directory

# Group management
sudo groupadd groupname            # Create group
sudo usermod -aG groupname username # Add user to group
groups username                    # Show user's groups
id username                        # Show user ID and group info

# Switch users
su username                        # Switch to user
su -                              # Switch to root
sudo -i                           # Switch to root with environment
sudo -u username command          # Run command as specific user</code>
        </div>

        <h3>🔐 Step 3: File Permissions</h3>
        <h4>Understanding and Setting Permissions</h4>
        <div class="code-block">
          <code># Permission basics
# Read (r) = 4, Write (w) = 2, Execute (x) = 1
# Owner | Group | Others

ls -l filename                     # View file permissions
chmod 755 filename                 # Set permissions (rwxr-xr-x)
chmod +x filename                  # Add execute permission
chmod -w filename                  # Remove write permission
chmod u+x,g-w,o-r filename        # Complex permission changes

# Change ownership
sudo chown username:groupname filename  # Change owner and group
sudo chown -R username:groupname directory  # Recursive ownership change

# Common permission patterns
chmod 644 file.txt                 # Read-write for owner, read-only for others
chmod 755 script.sh               # Executable script
chmod 600 private_file            # Private file (owner only)
chmod 777 shared_directory        # Full access for all (use carefully)</code>
        </div>

        <h3>📦 Step 4: Package Management</h3>
        <h4>Ubuntu/Debian (APT)</h4>
        <div class="code-block">
          <code># APT package management
sudo apt update                    # Update package lists
sudo apt upgrade                   # Upgrade installed packages
sudo apt install package_name     # Install package
sudo apt remove package_name      # Remove package
sudo apt purge package_name       # Remove package and config files
sudo apt autoremove               # Remove unused dependencies

# Search and information
apt search keyword                 # Search for packages
apt show package_name             # Show package information
apt list --installed             # List installed packages
apt list --upgradable             # List upgradable packages</code>
        </div>

        <h4>CentOS/RHEL (YUM/DNF)</h4>
        <div class="code-block">
          <code># YUM/DNF package management
sudo yum update                    # Update all packages (CentOS 7)
sudo dnf update                    # Update all packages (CentOS 8+)
sudo yum install package_name     # Install package
sudo yum remove package_name      # Remove package
sudo yum search keyword           # Search for packages
sudo yum info package_name        # Show package information

# Enable repositories
sudo yum install epel-release      # Enable EPEL repository
sudo yum-config-manager --enable repository_name</code>
        </div>

        <h3>🔧 Step 5: System Services</h3>
        <h4>Systemd Service Management</h4>
        <div class="code-block">
          <code># Service management with systemctl
sudo systemctl start service_name     # Start service
sudo systemctl stop service_name      # Stop service
sudo systemctl restart service_name   # Restart service
sudo systemctl reload service_name    # Reload service config
sudo systemctl enable service_name    # Enable service at boot
sudo systemctl disable service_name   # Disable service at boot

# Service status and information
systemctl status service_name         # Show service status
systemctl is-active service_name      # Check if service is running
systemctl is-enabled service_name     # Check if service is enabled
systemctl list-units --type=service   # List all services

# System control
sudo systemctl reboot                 # Reboot system
sudo systemctl poweroff               # Power off system
sudo systemctl suspend                # Suspend system</code>
        </div>

        <h3>📊 Step 6: System Monitoring</h3>
        <h4>Process and Resource Monitoring</h4>
        <div class="code-block">
          <code># Process monitoring
ps aux                             # Show all running processes
ps -ef                            # Show all processes with full info
top                               # Real-time process viewer
htop                              # Enhanced process viewer (if installed)
kill PID                          # Kill process by PID
killall process_name              # Kill all processes by name
pkill -f pattern                  # Kill processes matching pattern

# System resources
free -h                           # Show memory usage
df -h                             # Show disk usage
du -sh directory                  # Show directory size
lsblk                             # List block devices
mount                             # Show mounted filesystems
lscpu                             # Show CPU information
lsusb                             # Show USB devices
lspci                             # Show PCI devices</code>
        </div>

        <h3>🌐 Step 7: Network Configuration</h3>
        <h4>Network Commands and Configuration</h4>
        <div class="code-block">
          <code># Network information
ip addr show                       # Show IP addresses
ip route show                      # Show routing table
hostname                           # Show hostname
hostname -I                        # Show IP address
netstat -tuln                     # Show listening ports
ss -tuln                          # Modern replacement for netstat

# Network testing
ping hostname                      # Test connectivity
ping -c 4 hostname                # Ping with count limit
traceroute hostname               # Trace network path
nslookup hostname                 # DNS lookup
dig hostname                      # DNS lookup (more detailed)

# Network configuration files
# Ubuntu/Debian: /etc/netplan/*.yaml
# CentOS/RHEL: /etc/sysconfig/network-scripts/ifcfg-*

# Restart networking
sudo systemctl restart networking  # Ubuntu/Debian
sudo systemctl restart network    # CentOS/RHEL</code>
        </div>

        <h3>📝 Step 8: Log Management</h3>
        <h4>System Logs and Troubleshooting</h4>
        <div class="code-block">
          <code># System logs
journalctl                         # View systemd journal
journalctl -u service_name        # View logs for specific service
journalctl -f                     # Follow log entries
journalctl --since "2024-01-01"  # Logs since specific date
journalctl -p err                 # Show only error level logs

# Traditional log files
tail -f /var/log/syslog           # System log (Ubuntu/Debian)
tail -f /var/log/messages         # System log (CentOS/RHEL)
tail -f /var/log/auth.log         # Authentication log
tail -f /var/log/apache2/access.log  # Apache access log

# Log rotation
sudo logrotate -f /etc/logrotate.conf  # Force log rotation
ls -la /var/log/                   # List log files</code>
        </div>

        <h3>🔒 Step 9: Security Basics</h3>
        <h4>Firewall and Security Configuration</h4>
        <div class="code-block">
          <code># UFW (Ubuntu Firewall)
sudo ufw enable                    # Enable firewall
sudo ufw disable                   # Disable firewall
sudo ufw status                    # Show firewall status
sudo ufw allow ssh                 # Allow SSH connections
sudo ufw allow 80/tcp             # Allow HTTP
sudo ufw allow 443/tcp            # Allow HTTPS
sudo ufw deny 23                   # Deny telnet
sudo ufw delete allow 80          # Remove rule

# SSH security
sudo nano /etc/ssh/sshd_config    # Edit SSH configuration
# Change default port: Port 2222
# Disable root login: PermitRootLogin no
# Use key-based authentication: PasswordAuthentication no
sudo systemctl restart sshd       # Restart SSH service

# User security
sudo passwd -l username           # Lock user account
sudo passwd -u username           # Unlock user account
sudo chage -l username            # View password aging info
sudo chage -E 2024-12-31 username # Set account expiration</code>
        </div>

        <h3>💾 Step 10: Backup and Archiving</h3>
        <h4>File Backup and Compression</h4>
        <div class="code-block">
          <code># Tar archiving
tar -czf backup.tar.gz directory  # Create compressed archive
tar -xzf backup.tar.gz            # Extract compressed archive
tar -tzf backup.tar.gz            # List archive contents
tar -czf backup_\\$(date +%Y%m%d).tar.gz /home  # Timestamped backup

# Rsync for backups
rsync -avz source/ destination/   # Sync directories
rsync -avz --delete source/ destination/  # Sync with deletion
rsync -avz -e ssh source/ user@remote:/path/  # Remote sync

# Find and locate files
find /path -name "*.log" -mtime +30  # Find old log files
find /path -type f -size +100M     # Find large files
locate filename                    # Quick file search (if installed)
updatedb                          # Update locate database

# Disk usage cleanup
sudo apt autoremove               # Remove unused packages
sudo apt autoclean               # Clean package cache
sudo journalctl --vacuum-time=30d # Clean old journal entries</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Always use sudo for administrative tasks instead of root login</li>
            <li>Keep your system updated with regular package updates</li>
            <li>Use strong passwords and key-based SSH authentication</li>
            <li>Regular backup of important data and configurations</li>
            <li>Monitor system logs for security issues and errors</li>
            <li>Document your system configurations and changes</li>
            <li>Use version control for configuration files</li>
          </ul>
        </div>

        <div class="tutorial-warning">
          <h4>⚠️ Important Notes</h4>
          <ul>
            <li>Always test commands in a non-production environment first</li>
            <li>Be careful with rm -rf commands - they can delete everything</li>
            <li>Keep backups before making system changes</li>
            <li>Use proper file permissions to maintain security</li>
            <li>Regular monitoring of system resources and logs</li>
          </ul>
        </div>
      </div>
    `
  },

  'server-config': {
    title: 'Server configuration and service management',
    category: 'linux',
    difficulty: 'intermediate',
    estimatedTime: '3-4 hours',
    content: `
      <div class="tutorial-content">
        <h2>🖥️ Server Configuration and Service Management</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Configure Linux servers for production use, including web services, databases, monitoring, and automated management tasks.</p>
        </div>

        <h3>🌐 Step 1: Web Server Configuration</h3>
        <h4>Apache Configuration</h4>
        <div class="code-block">
          <code># Install Apache
sudo apt update
sudo apt install apache2 -y

# Enable and start Apache
sudo systemctl enable apache2
sudo systemctl start apache2

# Configure virtual hosts
sudo nano /etc/apache2/sites-available/example.com.conf

# Virtual host configuration
&lt;VirtualHost *:80&gt;
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com
    ErrorLog /var/log/apache2/example.com_error.log
    CustomLog /var/log/apache2/example.com_access.log combined
&lt;/VirtualHost&gt;

# Enable site and restart Apache
sudo a2ensite example.com.conf
sudo systemctl reload apache2</code>
        </div>

        <h3>🐳 Step 2: Container Management</h3>
        <h4>Docker Installation and Configuration</h4>
        <div class="code-block">
          <code># Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker \\$USER

# Docker basic commands
docker run hello-world            # Test Docker installation
docker ps                         # List running containers
docker images                     # List downloaded images
docker pull nginx                 # Download image
docker run -d -p 80:80 nginx     # Run container in background

# Docker Compose example
# Create docker-compose.yml
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: webapp
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Server Management Best Practices</h4>
          <ul>
            <li>Regular security updates and patches</li>
            <li>Proper backup and disaster recovery procedures</li>
            <li>Monitor system performance and resource usage</li>
            <li>Use configuration management tools (Ansible, Puppet)</li>
            <li>Implement proper logging and monitoring</li>
            <li>Regular security audits and vulnerability assessments</li>
          </ul>
        </div>
      </div>
    `
  },

  'shell-scripting': {
    title: 'Shell scripting and task automation',
    category: 'linux',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>📜 Shell Scripting and Task Automation</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Create powerful shell scripts for automating system administration tasks, monitoring, and maintenance procedures.</p>
        </div>

        <h3>🚀 Step 1: Basic Script Structure</h3>
        <h4>Creating Your First Script</h4>
        <div class="code-block">
          <code>#!/bin/bash
# Basic script template

# Variables
SCRIPT_NAME="System Monitor"
DATE=\\$(date +"%Y-%m-%d %H:%M:%S")
LOGFILE="/var/log/system_monitor.log"

# Functions
log_message() {
    echo "[\\$DATE] \\$1" | tee -a \\$LOGFILE
}

# Main script
echo "Starting \\$SCRIPT_NAME"
log_message "Script started"

# Your script logic here
echo "System monitoring complete"
log_message "Script finished"</code>
        </div>

        <h3>🔧 Step 2: System Monitoring Script</h3>
        <h4>Advanced Monitoring Example</h4>
        <div class="code-block">
          <code>#!/bin/bash
# System monitoring and alerting script

# Configuration
EMAIL="admin@company.com"
CPU_THRESHOLD=80
MEMORY_THRESHOLD=90
DISK_THRESHOLD=85

# Function to send alert
send_alert() {
    local message="\\$1"
    echo "\\$message" | mail -s "System Alert" \\$EMAIL
    logger "ALERT: \\$message"
}

# Check CPU usage
check_cpu() {
    local cpu_usage=\\$(top -bn1 | grep "Cpu(s)" | awk '{print \\$2}' | cut -d'%' -f1)
    if (( \\$(echo "\\$cpu_usage > \\$CPU_THRESHOLD" | bc -l) )); then
        send_alert "High CPU usage: \\$cpu_usage%"
    fi
}

# Check memory usage
check_memory() {
    local mem_usage=\\$(free | grep Mem | awk '{printf "%.0f", \\$3/\\$2 * 100.0}')
    if [ \\$mem_usage -gt \\$MEMORY_THRESHOLD ]; then
        send_alert "High memory usage: \\$mem_usage%"
    fi
}

# Check disk usage
check_disk() {
    df -h | grep -E '^/dev/' | while read disk; do
        local usage=\\$(echo \\$disk | awk '{print \\$5}' | cut -d'%' -f1)
        local partition=\\$(echo \\$disk | awk '{print \\$1}')
        if [ \\$usage -gt \\$DISK_THRESHOLD ]; then
            send_alert "High disk usage on \\$partition: \\$usage%"
        fi
    done
}

# Main execution
check_cpu
check_memory
check_disk</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Scripting Best Practices</h4>
          <ul>
            <li>Always include error handling and logging</li>
            <li>Use meaningful variable names and comments</li>
            <li>Test scripts thoroughly before production use</li>
            <li>Use version control for script management</li>
            <li>Implement proper security measures</li>
            <li>Regular backup of important scripts</li>
          </ul>
        </div>
      </div>
    `
  },

  'system-monitoring': {
    title: 'System monitoring and log analysis',
    category: 'linux',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>📊 System Monitoring and Log Analysis</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Implement comprehensive system monitoring, log analysis, and alerting systems for Linux servers.</p>
        </div>

        <h3>🔍 Step 1: System Resource Monitoring</h3>
        <h4>Real-time Monitoring Tools</h4>
        <div class="code-block">
          <code># Install monitoring tools
sudo apt install htop iotop nethogs sysstat -y

# Real-time monitoring commands
htop                              # Interactive process viewer
iotop                             # I/O monitoring
nethogs                           # Network usage by process
watch -n 1 'free -h'             # Memory usage every second
watch -n 1 'df -h'               # Disk usage monitoring

# System activity reporting
sar -u 1 10                      # CPU usage for 10 seconds
sar -r 1 10                      # Memory usage
sar -d 1 10                      # Disk activity
iostat -x 1                      # Extended I/O statistics</code>
        </div>

        <h3>📋 Step 2: Log Analysis</h3>
        <h4>Log Monitoring and Analysis</h4>
        <div class="code-block">
          <code># Log analysis commands
journalctl -f                     # Follow system logs
journalctl -u apache2 -f          # Follow specific service logs
journalctl --since "1 hour ago"   # Recent logs
journalctl -p err                 # Error level logs only

# Log analysis script
#!/bin/bash
# Log analyzer for common issues

LOGFILE="/var/log/syslog"
REPORT_FILE="/tmp/log_analysis_\\$(date +%Y%m%d).txt"

echo "Log Analysis Report - \\$(date)" > \\$REPORT_FILE
echo "===============================" >> \\$REPORT_FILE

# Count error messages
echo "Error Summary:" >> \\$REPORT_FILE
grep -i "error" \\$LOGFILE | tail -20 >> \\$REPORT_FILE

# Failed login attempts
echo "Failed Login Attempts:" >> \\$REPORT_FILE
grep "Failed password" /var/log/auth.log | tail -10 >> \\$REPORT_FILE

# Disk space warnings
echo "Disk Space Status:" >> \\$REPORT_FILE
df -h | grep -E '(8[0-9]|9[0-9])%' >> \\$REPORT_FILE

echo "Report generated: \\$REPORT_FILE"</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Monitoring Best Practices</h4>
          <ul>
            <li>Set up proactive monitoring and alerting</li>
            <li>Regular log rotation and archiving</li>
            <li>Monitor key performance indicators (KPIs)</li>
            <li>Implement automated response to common issues</li>
            <li>Regular review of monitoring data and trends</li>
            <li>Document monitoring procedures and thresholds</li>
          </ul>
        </div>
      </div>
    `
  },

  'package-management': {
    title: 'Package management across distributions',
    category: 'linux',
    difficulty: 'beginner',
    estimatedTime: '1-2 hours',
    content: `
      <div class="tutorial-content">
        <h2>📦 Package Management Across Distributions</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Master package management across different Linux distributions including Ubuntu, CentOS, and others.</p>
        </div>

        <h3>🔧 Ubuntu/Debian (APT)</h3>
        <div class="code-block">
          <code># APT package management
sudo apt update                    # Update package database
sudo apt upgrade                   # Upgrade all packages
sudo apt install package_name     # Install package
sudo apt remove package_name      # Remove package
sudo apt purge package_name       # Remove package and config
sudo apt autoremove               # Remove unused dependencies

# Advanced APT usage
apt search keyword                 # Search packages
apt show package_name             # Show package details
apt list --installed             # List installed packages
apt list --upgradable             # Show upgradable packages

# Adding repositories
sudo add-apt-repository ppa:user/ppa-name
sudo apt update</code>
        </div>

        <h3>🎯 CentOS/RHEL (YUM/DNF)</h3>
        <div class="code-block">
          <code># YUM/DNF package management
sudo yum update                    # Update packages (CentOS 7)
sudo dnf update                    # Update packages (CentOS 8+)
sudo yum install package_name     # Install package
sudo yum remove package_name      # Remove package
sudo yum search keyword           # Search packages
sudo yum info package_name        # Package information

# Repository management
sudo yum install epel-release      # Install EPEL repository
sudo yum repolist                 # List enabled repositories
sudo yum-config-manager --enable repo_name</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Package Management Best Practices</h4>
          <ul>
            <li>Regular system updates and security patches</li>
            <li>Use official repositories when possible</li>
            <li>Verify package integrity and sources</li>
            <li>Keep track of installed packages</li>
            <li>Test updates in non-production environments</li>
            <li>Backup system before major updates</li>
          </ul>
        </div>
      </div>
    `
  },

  'security-hardening': {
    title: 'Security hardening and best practices',
    category: 'linux',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    content: `
      <div class="tutorial-content">
        <h2>🔒 Security Hardening and Best Practices</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Implement comprehensive security hardening measures for Linux servers including firewall configuration, intrusion detection, and security monitoring.</p>
        </div>

        <h3>🛡️ Step 1: Firewall Configuration</h3>
        <h4>UFW (Uncomplicated Firewall)</h4>
        <div class="code-block">
          <code># UFW basic configuration
sudo ufw enable                    # Enable firewall
sudo ufw default deny incoming     # Deny all incoming
sudo ufw default allow outgoing    # Allow all outgoing

# Allow specific services
sudo ufw allow ssh                 # Allow SSH
sudo ufw allow 80/tcp             # Allow HTTP
sudo ufw allow 443/tcp            # Allow HTTPS
sudo ufw allow from 192.168.1.0/24 to any port 22  # Restrict SSH

# Advanced rules
sudo ufw allow from 192.168.1.100 to any port 3306  # MySQL access
sudo ufw deny from 192.168.1.50   # Block specific IP
sudo ufw status numbered          # Show numbered rules
sudo ufw delete 2                 # Delete rule by number</code>
        </div>

        <h3>🔐 Step 2: SSH Security</h3>
        <h4>Secure SSH Configuration</h4>
        <div class="code-block">
          <code># Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended SSH settings
Port 2222                         # Change default port
Protocol 2                        # Use SSH protocol 2
PermitRootLogin no                # Disable root login
PasswordAuthentication no         # Use key-based auth only
PubkeyAuthentication yes          # Enable public key auth
MaxAuthTries 3                    # Limit authentication attempts
ClientAliveInterval 300           # Keep-alive interval
ClientAliveCountMax 0             # Disconnect idle clients

# Generate SSH keys
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
ssh-copy-id -i ~/.ssh/id_rsa.pub user@server

# Restart SSH service
sudo systemctl restart sshd</code>
        </div>

        <h3>🔍 Step 3: Intrusion Detection</h3>
        <h4>Fail2ban Configuration</h4>
        <div class="code-block">
          <code># Install Fail2ban
sudo apt install fail2ban -y

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo nano /etc/fail2ban/jail.local

# Basic Fail2ban configuration
[DEFAULT]
bantime = 3600                    # Ban for 1 hour
findtime = 600                    # Time window for attempts
maxretry = 5                      # Max attempts before ban
backend = systemd                 # Use systemd backend

[sshd]
enabled = true
port = 2222                       # Match your SSH port
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

# Start and enable Fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Monitor Fail2ban
sudo fail2ban-client status
sudo fail2ban-client status sshd</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Security Best Practices</h4>
          <ul>
            <li>Regular security updates and patches</li>
            <li>Principle of least privilege for user accounts</li>
            <li>Strong password policies and MFA</li>
            <li>Regular security audits and vulnerability scans</li>
            <li>Proper log monitoring and analysis</li>
            <li>Backup and disaster recovery procedures</li>
            <li>Network segmentation and access controls</li>
          </ul>
        </div>
      </div>
    `
  }
};