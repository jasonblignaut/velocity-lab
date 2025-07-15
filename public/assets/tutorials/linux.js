/* ===================================================================
   Linux Administration Tutorials - Comprehensive System Management
   =================================================================== */

window.LINUX_TUTORIALS = {
    'linux-basics': {
        title: 'Linux basics and system administration',
        content: `
            <div class="tutorial-content">
                <h2>Linux Basics and System Administration</h2>
                
                <h3>Essential Commands</h3>
                
                <h4>File and Directory Operations</h4>
                <div class="code-block">
                    <code># Basic file operations
ls -la                    # List files with details
cd /path/to/directory     # Change directory
pwd                       # Print working directory
mkdir -p /path/new/dir    # Create directory structure
rmdir directory_name      # Remove empty directory
rm -rf directory_name     # Remove directory and contents
cp -r source dest         # Copy files/directories
mv old_name new_name      # Move/rename files
find /path -name "*.txt"  # Find files by pattern
grep "pattern" file.txt   # Search text in files</code>
                </div>
                
                <h4>File Permissions and Ownership</h4>
                <div class="code-block">
                    <code># Permission management
chmod 755 filename        # Set permissions (rwxr-xr-x)
chmod +x script.sh        # Make file executable
chown user:group file     # Change ownership
chgrp group file          # Change group ownership

# Permission notation
# 4 = read (r)
# 2 = write (w)
# 1 = execute (x)
# 755 = rwxr-xr-x (owner: rwx, group: rx, others: rx)
# 644 = rw-r--r-- (owner: rw, group: r, others: r)</code>
                </div>
                
                <h3>System Information</h3>
                
                <h4>Hardware and System Details</h4>
                <div class="code-block">
                    <code># System information commands
uname -a                  # System information
lsb_release -a           # Distribution information
cat /proc/cpuinfo        # CPU information
cat /proc/meminfo        # Memory information
df -h                    # Disk usage (human readable)
du -sh /path/*           # Directory sizes
free -h                  # Memory usage
lsblk                    # Block devices
lspci                    # PCI devices
lsusb                    # USB devices
uptime                   # System uptime and load</code>
                </div>
                
                <h4>Process Management</h4>
                <div class="code-block">
                    <code># Process commands
ps aux                   # List all processes
ps -ef | grep nginx      # Find specific process
top                      # Real-time process monitor
htop                     # Enhanced process monitor
kill PID                 # Terminate process by PID
killall process_name     # Kill processes by name
nohup command &          # Run command in background
jobs                     # List background jobs
bg %1                    # Resume job in background
fg %1                    # Bring job to foreground</code>
                </div>
                
                <h3>User and Group Management</h3>
                
                <h4>User Administration</h4>
                <div class="code-block">
                    <code># User management
useradd -m username      # Add user with home directory
usermod -aG group user   # Add user to group
userdel -r username      # Delete user and home directory
passwd username          # Change user password
su - username            # Switch user
sudo command             # Execute as another user

# User information
whoami                   # Current username
who                      # Logged in users
w                        # Detailed user activity
last                     # Login history
id username              # User ID and groups</code>
                </div>
                
                <h4>Group Management</h4>
                <div class="code-block">
                    <code># Group operations
groupadd groupname       # Create new group
groupdel groupname       # Delete group
groups username          # Show user's groups
gpasswd -a user group    # Add user to group
gpasswd -d user group    # Remove user from group

# Configuration files
cat /etc/passwd          # User accounts
cat /etc/group           # Group information
cat /etc/shadow          # Password hashes (sudo required)</code>
                </div>
                
                <h3>Package Management</h3>
                
                <h4>Ubuntu/Debian (APT)</h4>
                <div class="code-block">
                    <code># APT package management
apt update               # Update package lists
apt upgrade              # Upgrade installed packages
apt install package      # Install package
apt remove package       # Remove package
apt purge package        # Remove package and config files
apt autoremove           # Remove unused packages
apt search keyword       # Search for packages
apt show package         # Show package information
dpkg -l                  # List installed packages
dpkg -i package.deb      # Install .deb package</code>
                </div>
                
                <h4>CentOS/RHEL/Fedora (YUM/DNF)</h4>
                <div class="code-block">
                    <code># YUM/DNF package management
yum update               # Update all packages (CentOS 7)
dnf update               # Update all packages (CentOS 8+)
yum install package      # Install package
dnf install package      # Install package (newer systems)
yum remove package       # Remove package
yum search keyword       # Search packages
yum info package         # Package information
rpm -qa                  # List installed packages
rpm -ivh package.rpm     # Install RPM package</code>
                </div>
                
                <h3>Network Configuration</h3>
                
                <h4>Network Commands</h4>
                <div class="code-block">
                    <code># Network information and testing
ip addr show             # Show IP addresses
ip route show            # Show routing table
ping -c 4 google.com     # Test connectivity
traceroute google.com    # Trace route to destination
netstat -tuln            # Show listening ports
ss -tuln                 # Modern replacement for netstat
nmap -sn 192.168.1.0/24  # Network scan
wget http://example.com  # Download file
curl -I http://site.com  # Get HTTP headers</code>
                </div>
                
                <h4>Firewall Management</h4>
                <div class="code-block">
                    <code># UFW (Ubuntu Firewall)
ufw enable               # Enable firewall
ufw disable              # Disable firewall
ufw status               # Show firewall status
ufw allow 22/tcp         # Allow SSH
ufw allow 80,443/tcp     # Allow HTTP/HTTPS
ufw deny from 192.168.1.100  # Block specific IP

# iptables (traditional)
iptables -L              # List rules
iptables -A INPUT -p tcp --dport 22 -j ACCEPT  # Allow SSH
iptables-save > /etc/iptables/rules.v4  # Save rules</code>
                </div>
                
                <h3>Service Management</h3>
                
                <h4>Systemd Service Control</h4>
                <div class="code-block">
                    <code># Systemd commands
systemctl start service  # Start service
systemctl stop service   # Stop service
systemctl restart service  # Restart service
systemctl enable service   # Enable at boot
systemctl disable service  # Disable at boot
systemctl status service   # Check service status
systemctl list-units      # List all units
journalctl -u service      # View service logs
journalctl -f              # Follow system logs</code>
                </div>
                
                <h3>File System and Storage</h3>
                
                <h4>Disk Management</h4>
                <div class="code-block">
                    <code># Disk operations
fdisk -l                 # List disk partitions
lsblk                    # Display block devices
mount /dev/sdb1 /mnt     # Mount file system
umount /mnt              # Unmount file system
mkfs.ext4 /dev/sdb1      # Create ext4 file system
fsck /dev/sdb1           # Check file system

# /etc/fstab entry for permanent mount
/dev/sdb1 /data ext4 defaults 0 2</code>
                </div>
                
                <h4>Archive and Compression</h4>
                <div class="code-block">
                    <code># Tar operations
tar -czf archive.tar.gz directory/    # Create compressed archive
tar -xzf archive.tar.gz               # Extract compressed archive
tar -tzf archive.tar.gz               # List archive contents

# Other compression tools
zip -r archive.zip directory/         # Create ZIP archive
unzip archive.zip                     # Extract ZIP archive
gzip file.txt                         # Compress file
gunzip file.txt.gz                    # Decompress file</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Essential Tips</h4>
                    <ul>
                        <li>Use tab completion to speed up command entry</li>
                        <li>Learn to use man pages: man command_name</li>
                        <li>Use history command to review previous commands</li>
                        <li>Create aliases for frequently used commands</li>
                        <li>Always backup important files before making changes</li>
                    </ul>
                </div>
            </div>
        `
    },
    
    'server-configuration': {
        title: 'Server configuration and service management',
        content: `
            <div class="tutorial-content">
                <h2>Server Configuration and Service Management</h2>
                
                <h3>Web Server Configuration</h3>
                
                <h4>Apache HTTP Server</h4>
                <div class="code-block">
                    <code># Install Apache
sudo apt install apache2        # Ubuntu/Debian
sudo yum install httpd          # CentOS/RHEL

# Service management
sudo systemctl start apache2    # Start Apache
sudo systemctl enable apache2   # Enable at boot
sudo systemctl status apache2   # Check status

# Configuration files
/etc/apache2/apache2.conf       # Main configuration (Debian)
/etc/httpd/conf/httpd.conf      # Main configuration (RedHat)
/etc/apache2/sites-available/   # Virtual host configurations</code>
                </div>
                
                <h4>Virtual Host Configuration</h4>
                <div class="code-block">
                    <code># Create virtual host file
sudo nano /etc/apache2/sites-available/example.com.conf

<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example.com
    ErrorLog ${APACHE_LOG_DIR}/example.com_error.log
    CustomLog ${APACHE_LOG_DIR}/example.com_access.log combined
    
    <Directory /var/www/example.com>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# Enable site and restart
sudo a2ensite example.com.conf
sudo systemctl reload apache2</code>
                </div>
                
                <h4>Nginx Configuration</h4>
                <div class="code-block">
                    <code># Install Nginx
sudo apt install nginx

# Basic server block
sudo nano /etc/nginx/sites-available/example.com

server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/example.com;
    index index.html index.php;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
sudo nginx -t                    # Test configuration
sudo systemctl reload nginx     # Reload configuration</code>
                </div>
                
                <h3>Database Server Setup</h3>
                
                <h4>MySQL/MariaDB Installation</h4>
                <div class="code-block">
                    <code># Install MySQL/MariaDB
sudo apt install mysql-server          # MySQL
sudo apt install mariadb-server        # MariaDB

# Secure installation
sudo mysql_secure_installation

# Database operations
mysql -u root -p                       # Connect to MySQL
CREATE DATABASE webapp_db;             # Create database
CREATE USER 'webapp'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON webapp_db.* TO 'webapp'@'localhost';
FLUSH PRIVILEGES;
EXIT;</code>
                </div>
                
                <h4>PostgreSQL Setup</h4>
                <div class="code-block">
                    <code># Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE webapp_db;
CREATE USER webapp_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE webapp_db TO webapp_user;
\q

# Configure access (edit pg_hba.conf)
sudo nano /etc/postgresql/12/main/pg_hba.conf
# Add: local   webapp_db   webapp_user   md5</code>
                </div>
                
                <h3>SSL/TLS Configuration</h3>
                
                <h4>Let's Encrypt with Certbot</h4>
                <div class="code-block">
                    <code># Install Certbot
sudo apt install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d example.com -d www.example.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet

# Test renewal
sudo certbot renew --dry-run</code>
                </div>
                
                <h4>Manual SSL Configuration</h4>
                <div class="code-block">
                    <code># Generate private key and CSR
openssl genrsa -out private.key 2048
openssl req -new -key private.key -out certificate.csr

# Apache SSL virtual host
<VirtualHost *:443>
    ServerName example.com
    DocumentRoot /var/www/example.com
    
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/example.com.crt
    SSLCertificateKeyFile /etc/ssl/private/example.com.key
    SSLCertificateChainFile /etc/ssl/certs/intermediate.crt
</VirtualHost></code>
                </div>
                
                <h3>Mail Server Configuration</h3>
                
                <h4>Postfix Setup</h4>
                <div class="code-block">
                    <code># Install Postfix
sudo apt install postfix

# Configure main.cf
sudo nano /etc/postfix/main.cf

# Basic configuration
myhostname = mail.example.com
mydomain = example.com
myorigin = $mydomain
inet_interfaces = all
mydestination = $myhostname, localhost.$mydomain, localhost, $mydomain
relayhost = 
home_mailbox = Maildir/

# Restart Postfix
sudo systemctl restart postfix

# Test mail
echo "Test message" | mail -s "Test Subject" user@example.com</code>
                </div>
                
                <h3>Monitoring and Logging</h3>
                
                <h4>Log File Locations</h4>
                <div class="code-block">
                    <code># System logs
/var/log/syslog          # System messages
/var/log/auth.log        # Authentication logs
/var/log/kern.log        # Kernel messages
/var/log/cron.log        # Cron job logs

# Service logs
/var/log/apache2/        # Apache logs
/var/log/nginx/          # Nginx logs
/var/log/mysql/          # MySQL logs
/var/log/postgresql/     # PostgreSQL logs

# View logs
tail -f /var/log/syslog  # Follow log in real-time
grep "error" /var/log/apache2/error.log  # Search for errors
journalctl -u service_name  # Systemd service logs</code>
                </div>
                
                <h4>System Monitoring Tools</h4>
                <div class="code-block">
                    <code># Install monitoring tools
sudo apt install htop iotop nethogs

# Resource monitoring
htop                     # Interactive process viewer
iotop                    # I/O usage by process
nethogs                  # Network usage by process
vmstat 1                 # Virtual memory statistics
iostat 1                 # I/O statistics
sar -u 1 5              # CPU usage statistics

# Disk usage analysis
ncdu /                   # Interactive disk usage
baobab                   # Graphical disk usage (GUI)</code>
                </div>
                
                <h3>Backup and Recovery</h3>
                
                <h4>Database Backups</h4>
                <div class="code-block">
                    <code># MySQL backup
mysqldump -u root -p database_name > backup.sql
mysqldump -u root -p --all-databases > all_databases.sql

# Restore MySQL
mysql -u root -p database_name < backup.sql

# PostgreSQL backup
pg_dump -U username database_name > backup.sql
pg_dumpall -U postgres > all_databases.sql

# Restore PostgreSQL
psql -U username database_name < backup.sql</code>
                </div>
                
                <h4>File System Backups</h4>
                <div class="code-block">
                    <code># Rsync backup
rsync -avz /source/directory/ /backup/location/
rsync -avz --delete /source/ user@remote:/backup/

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
SOURCE_DIR="/var/www"

tar -czf $BACKUP_DIR/website_$DATE.tar.gz $SOURCE_DIR
find $BACKUP_DIR -name "website_*.tar.gz" -mtime +7 -delete

# Make executable and add to crontab
chmod +x backup_script.sh
0 2 * * * /path/to/backup_script.sh</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Server Management Best Practices</h4>
                    <ul>
                        <li>Regular security updates and patches</li>
                        <li>Implement proper backup strategies</li>
                        <li>Monitor system resources and logs</li>
                        <li>Use configuration management tools</li>
                        <li>Document all configuration changes</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Always harden server security: disable unnecessary services, use strong passwords, implement firewalls, and keep systems updated.</p>
                </div>
            </div>
        `
    },
    
    'shell-scripting': {
        title: 'Shell scripting and task automation',
        content: `
            <div class="tutorial-content">
                <h2>Shell Scripting and Task Automation</h2>
                
                <h3>Basic Shell Scripting</h3>
                
                <h4>Script Structure</h4>
                <div class="code-block">
                    <code>#!/bin/bash
# Script description and author information
# Usage: ./script.sh [arguments]

# Variables
SCRIPT_NAME=$(basename "$0")
LOG_FILE="/var/log/script.log"
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Functions
log_message() {
    echo "[$DATE] $1" | tee -a "$LOG_FILE"
}

# Main script logic
log_message "Script started"

# Your code here

log_message "Script completed"
exit 0</code>
                </div>
                
                <h4>Variables and Parameters</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# Variables
NAME="John Doe"
AGE=30
readonly PI=3.14159        # Read-only variable

# Environment variables
export PATH="/usr/local/bin:$PATH"

# Command line parameters
echo "Script name: $0"
echo "First parameter: $1"
echo "Second parameter: $2"
echo "All parameters: $@"
echo "Number of parameters: $#"
echo "Exit status of last command: $?"
echo "Process ID: $$"

# Parameter with default value
USERNAME=${1:-"defaultuser"}
PORT=${2:-"22"}</code>
                </div>
                
                <h3>Control Structures</h3>
                
                <h4>Conditional Statements</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# If statement
if [ "$1" = "start" ]; then
    echo "Starting service..."
elif [ "$1" = "stop" ]; then
    echo "Stopping service..."
elif [ "$1" = "restart" ]; then
    echo "Restarting service..."
else
    echo "Usage: $0 {start|stop|restart}"
    exit 1
fi

# File tests
if [ -f "/etc/passwd" ]; then
    echo "File exists"
fi

if [ -d "/var/log" ]; then
    echo "Directory exists"
fi

# Numeric comparisons
if [ $AGE -gt 18 ]; then
    echo "Adult"
fi

# String comparisons
if [ "$USER" = "root" ]; then
    echo "Running as root"
fi</code>
                </div>
                
                <h4>Loops</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# For loop with list
for user in john jane bob; do
    echo "Processing user: $user"
    useradd "$user"
done

# For loop with command output
for file in $(ls *.txt); do
    echo "Processing file: $file"
    mv "$file" "${file}.bak"
done

# For loop with range
for i in {1..10}; do
    echo "Number: $i"
done

# While loop
counter=1
while [ $counter -le 5 ]; do
    echo "Counter: $counter"
    counter=$((counter + 1))
done

# Until loop
until [ $counter -gt 10 ]; do
    echo "Counter: $counter"
    counter=$((counter + 1))
done</code>
                </div>
                
                <h3>Functions</h3>
                
                <h4>Function Definition and Usage</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# Simple function
greet() {
    echo "Hello, $1!"
}

# Function with return value
check_service() {
    local service_name=$1
    if systemctl is-active --quiet "$service_name"; then
        return 0  # Service is running
    else
        return 1  # Service is not running
    fi
}

# Function with local variables
backup_file() {
    local source_file=$1
    local backup_dir="/backup"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [ ! -d "$backup_dir" ]; then
        mkdir -p "$backup_dir"
    fi
    
    cp "$source_file" "$backup_dir/$(basename $source_file).$timestamp"
    echo "Backup created: $backup_dir/$(basename $source_file).$timestamp"
}

# Usage
greet "World"
if check_service "nginx"; then
    echo "Nginx is running"
else
    echo "Nginx is not running"
fi

backup_file "/etc/hosts"</code>
                </div>
                
                <h3>Error Handling</h3>
                
                <h4>Error Checking and Logging</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# Set error handling options
set -e          # Exit on error
set -u          # Exit on undefined variable
set -o pipefail # Exit on pipe failure

# Error handling function
handle_error() {
    echo "Error occurred in script at line $1"
    echo "Command that failed: $2"
    exit 1
}

# Trap errors
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR

# Logging function
log() {
    local level=$1
    shift
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# Usage
log "INFO" "Script started"

# Command with error checking
if ! mkdir /tmp/test_dir; then
    log "ERROR" "Failed to create directory"
    exit 1
fi

log "INFO" "Directory created successfully"</code>
                </div>
                
                <h3>Practical Scripts</h3>
                
                <h4>System Monitoring Script</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# System monitoring and alerting script
LOGFILE="/var/log/system_monitor.log"
EMAIL="admin@company.com"
HOSTNAME=$(hostname)

# Check disk usage
check_disk_usage() {
    local threshold=80
    df -h | awk 'NR>1 {print $5 " " $6}' | while read output; do
        usage=$(echo $output | awk '{print $1}' | sed 's/%//')
        partition=$(echo $output | awk '{print $2}')
        
        if [ $usage -ge $threshold ]; then
            echo "WARNING: Disk usage on $partition is ${usage}%" | tee -a $LOGFILE
            echo "Disk usage warning on $HOSTNAME: $partition is ${usage}% full" | mail -s "Disk Usage Alert" $EMAIL
        fi
    done
}

# Check memory usage
check_memory_usage() {
    local mem_usage=$(free | awk 'FNR == 2 {printf "%.2f", $3/$2*100}')
    local threshold=80
    
    if (( $(echo "$mem_usage > $threshold" | bc -l) )); then
        echo "WARNING: Memory usage is ${mem_usage}%" | tee -a $LOGFILE
        echo "Memory usage warning on $HOSTNAME: ${mem_usage}%" | mail -s "Memory Alert" $EMAIL
    fi
}

# Check system load
check_system_load() {
    local load=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | sed 's/^[ \t]*//')
    local cores=$(nproc)
    local threshold=$(echo "$cores * 0.8" | bc)
    
    if (( $(echo "$load > $threshold" | bc -l) )); then
        echo "WARNING: System load is $load (threshold: $threshold)" | tee -a $LOGFILE
    fi
}

# Main execution
echo "System monitoring started at $(date)" >> $LOGFILE
check_disk_usage
check_memory_usage
check_system_load
echo "System monitoring completed at $(date)" >> $LOGFILE</code>
                </div>
                
                <h4>Automated Backup Script</h4>
                <div class="code-block">
                    <code>#!/bin/bash

# Automated backup script with rotation
BACKUP_SOURCE="/var/www"
BACKUP_DEST="/backup/websites"
RETENTION_DAYS=7
DATE=$(date +%Y%m%d_%H%M%S)
LOGFILE="/var/log/backup.log"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DEST"

# Function to log messages
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

# Create backup
create_backup() {
    local backup_file="$BACKUP_DEST/website_backup_$DATE.tar.gz"
    
    log_message "Starting backup of $BACKUP_SOURCE"
    
    if tar -czf "$backup_file" -C "$BACKUP_SOURCE" .; then
        log_message "Backup created successfully: $backup_file"
        
        # Calculate backup size
        local size=$(du -h "$backup_file" | cut -f1)
        log_message "Backup size: $size"
        
        return 0
    else
        log_message "ERROR: Backup creation failed"
        return 1
    fi
}

# Clean old backups
cleanup_old_backups() {
    log_message "Cleaning up backups older than $RETENTION_DAYS days"
    
    find "$BACKUP_DEST" -name "website_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    if [ $? -eq 0 ]; then
        log_message "Old backups cleaned up successfully"
    else
        log_message "ERROR: Failed to clean up old backups"
    fi
}

# Main execution
if create_backup; then
    cleanup_old_backups
    log_message "Backup process completed successfully"
    exit 0
else
    log_message "Backup process failed"
    exit 1
fi</code>
                </div>
                
                <h3>Cron Job Automation</h3>
                
                <h4>Crontab Examples</h4>
                <div class="code-block">
                    <code># Edit crontab
crontab -e

# Crontab format: minute hour day month weekday command
# Examples:

# Run every day at 2 AM
0 2 * * * /usr/local/bin/backup_script.sh

# Run every hour
0 * * * * /usr/local/bin/hourly_check.sh

# Run every 15 minutes
*/15 * * * * /usr/local/bin/monitor.sh

# Run every Monday at 3:30 AM
30 3 * * 1 /usr/local/bin/weekly_maintenance.sh

# Run on the 1st day of every month at midnight
0 0 1 * * /usr/local/bin/monthly_report.sh

# Run every weekday at 6 AM
0 6 * * 1-5 /usr/local/bin/workday_startup.sh

# View current crontab
crontab -l

# System-wide cron jobs
# /etc/crontab
# /etc/cron.d/
# /etc/cron.daily/
# /etc/cron.weekly/
# /etc/cron.monthly/</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Scripting Best Practices</h4>
                    <ul>
                        <li>Always use proper shebang (#!/bin/bash)</li>
                        <li>Quote variables to prevent word splitting</li>
                        <li>Use meaningful variable names</li>
                        <li>Add comments to explain complex logic</li>
                        <li>Test scripts thoroughly before production use</li>
                        <li>Use shellcheck to validate script syntax</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Never store passwords in scripts. Use proper file permissions (chmod 700). Validate all user inputs to prevent injection attacks.</p>
                </div>
            </div>
        `
    }
};