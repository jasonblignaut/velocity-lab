/**
 * Velocity Lab - Networking Tutorials
 * Comprehensive networking guides for MSP professionals
 */

window.NETWORKING_TUTORIALS = {
  'zabbix-setup': {
    title: 'Setting up Zabbix monitoring server',
    category: 'networking',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>🌐 Setting up Zabbix Monitoring Server</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Install and configure Zabbix server for comprehensive network monitoring, including server setup, database configuration, web interface setup, and basic monitoring configuration.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Ubuntu Server 20.04 LTS or CentOS 8 (minimum 2GB RAM, 20GB storage)</li>
          <li>Root or sudo access to the server</li>
          <li>Basic Linux command line knowledge</li>
          <li>Network access to devices you want to monitor</li>
        </ul>

        <h3>🚀 Step 1: Install Required Packages</h3>
        <div class="code-block">
          <code># Update system packages
sudo apt update && sudo apt upgrade -y

# Install Apache, MySQL, and PHP
sudo apt install apache2 mysql-server php php-mysql php-xml php-gd php-bcmath php-mbstring -y

# Start and enable services
sudo systemctl start apache2 mysql
sudo systemctl enable apache2 mysql</code>
        </div>

        <h3>🔐 Step 2: Configure MySQL Database</h3>
        <div class="code-block">
          <code># Secure MySQL installation
sudo mysql_secure_installation

# Create Zabbix database and user
sudo mysql -u root -p

CREATE DATABASE zabbix CHARACTER SET utf8 COLLATE utf8_bin;
CREATE USER 'zabbix'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost';
FLUSH PRIVILEGES;
EXIT;</code>
        </div>

        <h3>📦 Step 3: Install Zabbix Server</h3>
        <div class="code-block">
          <code># Download and install Zabbix repository
wget https://repo.zabbix.com/zabbix/6.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.0-4+ubuntu20.04_all.deb
sudo dpkg -i zabbix-release_6.0-4+ubuntu20.04_all.deb
sudo apt update

# Install Zabbix server, frontend, and agent
sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent -y</code>
        </div>

        <h3>🗄️ Step 4: Import Database Schema</h3>
        <div class="code-block">
          <code># Import initial schema and data
zcat /usr/share/doc/zabbix-sql-scripts/mysql/server.sql.gz | mysql -u zabbix -p zabbix</code>
        </div>

        <h3>⚙️ Step 5: Configure Zabbix Server</h3>
        <div class="code-block">
          <code># Edit Zabbix server configuration
sudo nano /etc/zabbix/zabbix_server.conf

# Update these lines:
DBPassword=StrongPassword123!
DBHost=localhost
DBName=zabbix
DBUser=zabbix

# Start and enable Zabbix services
sudo systemctl restart zabbix-server zabbix-agent apache2
sudo systemctl enable zabbix-server zabbix-agent</code>
        </div>

        <h3>🌐 Step 6: Configure Web Interface</h3>
        <div class="code-block">
          <code># Edit PHP configuration for Zabbix
sudo nano /etc/zabbix/apache.conf

# Ensure timezone is set correctly:
php_value date.timezone Europe/London</code>
        </div>

        <h3>🔧 Step 7: Initial Web Setup</h3>
        <ol>
          <li>Open browser and navigate to <code>http://your-server-ip/zabbix</code></li>
          <li>Follow the setup wizard:
            <ul>
              <li>Check prerequisites (should all be OK)</li>
              <li>Enter database details:
                <ul>
                  <li>Database type: MySQL</li>
                  <li>Database host: localhost</li>
                  <li>Database name: zabbix</li>
                  <li>User: zabbix</li>
                  <li>Password: StrongPassword123!</li>
                </ul>
              </li>
              <li>Set server details (keep defaults)</li>
              <li>Review summary and finish</li>
            </ul>
          </li>
          <li>Login with default credentials:
            <ul>
              <li>Username: <code>Admin</code></li>
              <li>Password: <code>zabbix</code></li>
            </ul>
          </li>
        </ol>

        <div class="tutorial-warning">
          <h4>⚠️ Security Important</h4>
          <p>Immediately change the default Admin password after first login! Go to Administration → Users → Admin → Change password.</p>
        </div>

        <h3>📊 Step 8: Basic Monitoring Setup</h3>
        <ol>
          <li><strong>Add your first host:</strong>
            <ul>
              <li>Go to Configuration → Hosts</li>
              <li>Click "Create host"</li>
              <li>Enter host name and IP address</li>
              <li>Add to "Linux servers" group</li>
              <li>Link to "Linux by Zabbix agent" template</li>
            </ul>
          </li>
          <li><strong>Configure SNMP monitoring:</strong>
            <ul>
              <li>For network devices, use "Network devices by SNMP" template</li>
              <li>Set SNMP community string (usually "public")</li>
              <li>Configure SNMP version (v2c recommended)</li>
            </ul>
          </li>
        </ol>

        <h3>🚨 Step 9: Set Up Alerting</h3>
        <div class="code-block">
          <code># Configure email notifications
# Go to Administration → Media types → Email

# SMTP settings example:
SMTP server: smtp.gmail.com
SMTP port: 587
SMTP security: STARTTLS
Authentication: Yes
Username: your-monitoring@company.com
Password: app-specific-password</code>
        </div>

        <h3>📈 Useful Monitoring Templates</h3>
        <ul>
          <li><strong>Linux servers:</strong> "Linux by Zabbix agent"</li>
          <li><strong>Windows servers:</strong> "Windows by Zabbix agent"</li>
          <li><strong>Network switches:</strong> "Network devices by SNMP"</li>
          <li><strong>VMware:</strong> "VMware hypervisor"</li>
          <li><strong>Databases:</strong> "MySQL by Zabbix agent"</li>
        </ul>

        <div class="tutorial-tips">
          <h4>🎯 Pro Tips</h4>
          <ul>
            <li>Always use HTTPS in production (install SSL certificate)</li>
            <li>Set up regular database backups</li>
            <li>Monitor your Zabbix server itself</li>
            <li>Use host groups to organize your infrastructure</li>
            <li>Create custom dashboards for different stakeholders</li>
            <li>Set up maintenance windows to suppress alerts during updates</li>
          </ul>
        </div>

        <h3>🔍 Troubleshooting Common Issues</h3>
        <ul>
          <li><strong>Zabbix server not starting:</strong> Check database connection and credentials</li>
          <li><strong>Web interface not accessible:</strong> Verify Apache configuration and PHP modules</li>
          <li><strong>Agent not connecting:</strong> Check firewall (port 10050) and agent configuration</li>
          <li><strong>No data collection:</strong> Verify host configuration and template assignment</li>
        </ul>

        <div class="tutorial-warning">
          <h4>🔒 Security Checklist</h4>
          <ul>
            <li>Change default passwords immediately</li>
            <li>Configure firewall to restrict access</li>
            <li>Use HTTPS for web interface</li>
            <li>Regular security updates</li>
            <li>Monitor authentication logs</li>
          </ul>
        </div>
      </div>
    `
  },

  'zabbix-advanced': {
    title: 'Monitoring with Zabbix advanced features',
    category: 'networking',
    difficulty: 'advanced',
    estimatedTime: '3-4 hours',
    content: `
      <div class="tutorial-content">
        <h2>⚡ Advanced Zabbix Monitoring Features</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Advanced Zabbix features including custom scripts, distributed monitoring, advanced alerting, custom dashboards, and automation workflows.</p>
        </div>

        <h3>🎯 Custom Item Monitoring</h3>
        <h4>Creating Custom Scripts</h4>
        <div class="code-block">
          <code># Example: Custom disk usage script
#!/bin/bash
# Save as /etc/zabbix/scripts/disk_usage.sh

PARTITION="$1"
df -h "$PARTITION" | awk 'NR==2 {print $5}' | sed 's/%//'

# Make executable
chmod +x /etc/zabbix/scripts/disk_usage.sh

# Add to zabbix_agentd.conf
UserParameter=custom.disk.usage[*],/etc/zabbix/scripts/disk_usage.sh $1</code>
        </div>

        <h4>Database Monitoring Script</h4>
        <div class="code-block">
          <code># MySQL connection monitoring
#!/bin/bash
# /etc/zabbix/scripts/mysql_connections.sh

mysql -u zabbix_monitor -pPASSWORD -e "SHOW STATUS LIKE 'Threads_connected';" | awk 'NR==2 {print $2}'

# Add to agent config
UserParameter=mysql.connections,/etc/zabbix/scripts/mysql_connections.sh</code>
        </div>

        <h3>🌍 Distributed Monitoring with Proxies</h3>
        <h4>Installing Zabbix Proxy</h4>
        <div class="code-block">
          <code># Install Zabbix proxy on remote site
sudo apt install zabbix-proxy-mysql zabbix-sql-scripts -y

# Create proxy database
mysql -u root -p
CREATE DATABASE zabbix_proxy CHARACTER SET utf8 COLLATE utf8_bin;
CREATE USER 'zabbix_proxy'@'localhost' IDENTIFIED BY 'ProxyPassword123!';
GRANT ALL PRIVILEGES ON zabbix_proxy.* TO 'zabbix_proxy'@'localhost';

# Import proxy schema
zcat /usr/share/doc/zabbix-sql-scripts/mysql/proxy.sql.gz | mysql -u zabbix_proxy -p zabbix_proxy</code>
        </div>

        <h4>Proxy Configuration</h4>
        <div class="code-block">
          <code># Edit /etc/zabbix/zabbix_proxy.conf
Server=main-zabbix-server-ip
Hostname=Remote-Site-Proxy
DBName=zabbix_proxy
DBUser=zabbix_proxy
DBPassword=ProxyPassword123!
ProxyMode=0
EnableRemoteCommands=1</code>
        </div>

        <h3>🚨 Advanced Alerting Configuration</h3>
        <h4>Escalation Setup</h4>
        <ol>
          <li><strong>Create Action:</strong>
            <ul>
              <li>Go to Configuration → Actions → Trigger actions</li>
              <li>Create new action with conditions</li>
              <li>Set up escalation steps:
                <ul>
                  <li>Step 1: Email to on-call engineer (0-30 minutes)</li>
                  <li>Step 2: SMS to supervisor (30-60 minutes)</li>
                  <li>Step 3: Call to manager (60+ minutes)</li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>

        <h4>Slack Integration</h4>
        <div class="code-block">
          <code># Create Slack webhook script
#!/bin/bash
# /usr/lib/zabbix/alertscripts/slack.sh

webhook_url="YOUR_SLACK_WEBHOOK_URL"
channel="$1"
message="$2"

curl -X POST -H 'Content-type: application/json' \
    --data "{\"channel\":\"#$channel\",\"text\":\"$message\"}" \
    "$webhook_url"</code>
        </div>

        <h3>📊 Advanced Dashboard Creation</h3>
        <h4>Custom Widget Configuration</h4>
        <ul>
          <li><strong>Top Hosts by CPU:</strong> Data → Top hosts, sorted by CPU usage</li>
          <li><strong>Network Traffic Map:</strong> Network map showing real-time link utilization</li>
          <li><strong>SLA Reports:</strong> SLA widget showing availability percentages</li>
          <li><strong>Custom Graphs:</strong> Combining multiple metrics in single view</li>
        </ul>

        <h3>🔄 API Automation</h3>
        <h4>Python API Script Example</h4>
        <div class="code-block">
          <code># Bulk host creation via API
import requests
import json

# Zabbix API configuration
zabbix_url = "http://your-zabbix-server/zabbix/api_jsonrpc.php"
zabbix_user = "Admin"
zabbix_password = "your-password"

# Login and get auth token
login_data = {
    "jsonrpc": "2.0",
    "method": "user.login",
    "params": {
        "user": zabbix_user,
        "password": zabbix_password
    },
    "id": 1
}

response = requests.post(zabbix_url, json=login_data)
auth_token = response.json()['result']

# Create host
host_data = {
    "jsonrpc": "2.0",
    "method": "host.create",
    "params": {
        "host": "New-Server-01",
        "interfaces": [{
            "type": 1,
            "main": 1,
            "useip": 1,
            "ip": "192.168.1.100",
            "dns": "",
            "port": "10050"
        }],
        "groups": [{"groupid": "2"}],  # Linux servers group
        "templates": [{"templateid": "10001"}]  # Linux template
    },
    "auth": auth_token,
    "id": 2
}

response = requests.post(zabbix_url, json=host_data)
print(f"Host created: {response.json()}")</code>
        </div>

        <h3>📈 Performance Optimization</h3>
        <h4>Database Optimization</h4>
        <div class="code-block">
          <code># MySQL optimization for Zabbix
# Add to /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
innodb_buffer_pool_size = 2G
innodb_log_file_size = 128M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
tmp_table_size = 32M
max_heap_table_size = 32M
query_cache_type = 0
query_cache_size = 0

# Restart MySQL
sudo systemctl restart mysql</code>
        </div>

        <h4>Server Configuration Tuning</h4>
        <div class="code-block">
          <code># /etc/zabbix/zabbix_server.conf optimization
StartPollers=30
StartPingers=10
StartPollersUnreachable=5
StartTrappers=15
StartTimers=2
StartEscalators=2
CacheSize=128M
HistoryCacheSize=64M
HistoryIndexCacheSize=32M
TrendCacheSize=32M
ValueCacheSize=256M</code>
        </div>

        <h3>🔒 Advanced Security Features</h3>
        <h4>Network Segmentation</h4>
        <ul>
          <li>Use Zabbix proxies for DMZ monitoring</li>
          <li>Configure firewall rules for specific ports only</li>
          <li>Implement VPN tunnels for remote site monitoring</li>
          <li>Use encrypted agent connections</li>
        </ul>

        <h4>User Access Control</h4>
        <div class="code-block">
          <code># Create custom user groups with limited permissions
# Administration → User groups → Create user group

# Example permissions:
- Network Team: Read-only access to network devices
- Server Team: Full access to servers only  
- Management: Dashboard access only
- On-call: Acknowledge and comment permissions</code>
        </div>

        <h3>🚀 Automation Workflows</h3>
        <h4>Auto-remediation Scripts</h4>
        <div class="code-block">
          <code># Example: Auto-restart service when down
#!/bin/bash
# /etc/zabbix/scripts/restart_service.sh

SERVICE="$1"
HOST="$2"

# Check if service is actually down
if ! ssh "$HOST" systemctl is-active "$SERVICE" >/dev/null; then
    # Restart the service
    ssh "$HOST" sudo systemctl restart "$SERVICE"
    
    # Wait and verify
    sleep 10
    if ssh "$HOST" systemctl is-active "$SERVICE" >/dev/null; then
        echo "Service $SERVICE restarted successfully on $HOST"
        exit 0
    else
        echo "Failed to restart $SERVICE on $HOST"
        exit 1
    fi
fi</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Use templates for consistent monitoring across similar hosts</li>
            <li>Implement proper maintenance windows</li>
            <li>Regular backup of Zabbix configuration</li>
            <li>Monitor your monitoring system</li>
            <li>Use host prototypes for dynamic environments</li>
            <li>Implement proper alert fatigue management</li>
          </ul>
        </div>

        <h3>🔧 Integration Examples</h3>
        <ul>
          <li><strong>ServiceNow:</strong> Auto-create tickets for critical alerts</li>
          <li><strong>Grafana:</strong> Beautiful dashboards using Zabbix data</li>
          <li><strong>Ansible:</strong> Automated remediation based on triggers</li>
          <li><strong>Elasticsearch:</strong> Long-term storage and analysis</li>
        </ul>
      </div>
    `
  },

  'zabbix-hosts': {
    title: 'Adding new hosts to Zabbix',
    category: 'networking',
    difficulty: 'beginner',
    estimatedTime: '30-45 minutes',
    content: `
      <div class="tutorial-content">
        <h2>➕ Adding New Hosts to Zabbix</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>How to properly add different types of hosts to Zabbix, configure monitoring templates, and ensure optimal data collection.</p>
        </div>

        <h3>🖥️ Adding Linux Servers</h3>
        <h4>Step 1: Install Zabbix Agent on Target Host</h4>
        <div class="code-block">
          <code># On Ubuntu/Debian
wget https://repo.zabbix.com/zabbix/6.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.0-4+ubuntu20.04_all.deb
sudo dpkg -i zabbix-release_6.0-4+ubuntu20.04_all.deb
sudo apt update
sudo apt install zabbix-agent -y

# On CentOS/RHEL
sudo rpm -Uvh https://repo.zabbix.com/zabbix/6.0/rhel/8/x86_64/zabbix-release-6.0-4.el8.noarch.rpm
sudo dnf install zabbix-agent -y</code>
        </div>

        <h4>Step 2: Configure Zabbix Agent</h4>
        <div class="code-block">
          <code># Edit /etc/zabbix/zabbix_agentd.conf
Server=192.168.1.10                    # Zabbix server IP
ServerActive=192.168.1.10             # For active checks
Hostname=webserver-01.company.com     # Unique hostname
EnableRemoteCommands=1                 # Allow remote commands
LogFile=/var/log/zabbix/zabbix_agentd.log

# Start and enable agent
sudo systemctl start zabbix-agent
sudo systemctl enable zabbix-agent

# Check agent status
sudo systemctl status zabbix-agent</code>
        </div>

        <h4>Step 3: Add Host in Zabbix Web Interface</h4>
        <ol>
          <li>Go to <strong>Configuration → Hosts</strong></li>
          <li>Click <strong>"Create host"</strong></li>
          <li>Fill in host details:
            <ul>
              <li><strong>Host name:</strong> webserver-01.company.com</li>
              <li><strong>Visible name:</strong> Web Server 01</li>
              <li><strong>Groups:</strong> Linux servers</li>
              <li><strong>Description:</strong> Production web server</li>
            </ul>
          </li>
          <li>Configure interface:
            <ul>
              <li><strong>Type:</strong> Agent</li>
              <li><strong>IP address:</strong> 192.168.1.50</li>
              <li><strong>Port:</strong> 10050</li>
            </ul>
          </li>
          <li>Link templates:
            <ul>
              <li><strong>Linux by Zabbix agent</strong> (basic Linux monitoring)</li>
              <li><strong>Apache by HTTP</strong> (if web server)</li>
            </ul>
          </li>
          <li>Click <strong>"Add"</strong></li>
        </ol>

        <h3>🖱️ Adding Windows Servers</h3>
        <h4>Step 1: Install Zabbix Agent on Windows</h4>
        <ol>
          <li>Download Zabbix agent from official website</li>
          <li>Extract to <code>C:\\zabbix</code></li>
          <li>Copy <code>zabbix_agentd.win.conf</code> to <code>zabbix_agentd.conf</code></li>
          <li>Edit configuration file:
            <div class="code-block">
              <code># C:\zabbix\zabbix_agentd.conf
Server=192.168.1.10
ServerActive=192.168.1.10
Hostname=winserver-01.company.com
LogFile=C:\zabbix\zabbix_agentd.log
EnableRemoteCommands=1</code>
            </div>
          </li>
          <li>Install as Windows service:
            <div class="code-block">
              <code># Run as Administrator
C:\zabbix\zabbix_agentd.exe --config C:\zabbix\zabbix_agentd.conf --install

# Start the service
net start "Zabbix Agent"</code>
            </div>
          </li>
        </ol>

        <h4>Step 2: Add Windows Host in Zabbix</h4>
        <ul>
          <li>Use template: <strong>"Windows by Zabbix agent"</strong></li>
          <li>Configure WMI interface if needed for advanced monitoring</li>
          <li>Add specific Windows services monitoring</li>
        </ul>

        <h3>🌐 Adding Network Devices (SNMP)</h3>
        <h4>Cisco Switch Example</h4>
        <ol>
          <li>Enable SNMP on the device:
            <div class="code-block">
              <code># Cisco switch configuration
enable
configure terminal
snmp-server community public ro
snmp-server location "Server Room A"
snmp-server contact "admin@company.com"
snmp-server enable traps
exit
write memory</code>
            </div>
          </li>
          <li>Add host in Zabbix:
            <ul>
              <li><strong>Host name:</strong> switch-core-01</li>
              <li><strong>Groups:</strong> Network devices</li>
              <li><strong>Interface type:</strong> SNMP</li>
              <li><strong>IP address:</strong> 192.168.1.1</li>
              <li><strong>Port:</strong> 161</li>
              <li><strong>SNMP community:</strong> public</li>
              <li><strong>Template:</strong> "Network devices by SNMP"</li>
            </ul>
          </li>
        </ol>

        <h3>☁️ Adding Cloud Instances</h3>
        <h4>AWS EC2 Instance</h4>
        <div class="code-block">
          <code># Install agent via user data script
#!/bin/bash
yum update -y
rpm -Uvh https://repo.zabbix.com/zabbix/6.0/rhel/8/x86_64/zabbix-release-6.0-4.el8.noarch.rpm
yum install zabbix-agent -y

# Configure agent
cat > /etc/zabbix/zabbix_agentd.conf << EOF
Server=zabbix-server-public-ip
ServerActive=zabbix-server-public-ip
Hostname=\$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
HostMetadata=aws ec2 linux
EnableRemoteCommands=1
EOF

systemctl start zabbix-agent
systemctl enable zabbix-agent</code>
        </div>

        <h3>📦 Using Host Prototypes for Auto-Discovery</h3>
        <h4>VMware vSphere Discovery</h4>
        <ol>
          <li>Create discovery rule:
            <ul>
              <li><strong>Name:</strong> VMware VM discovery</li>
              <li><strong>Type:</strong> VMware hypervisor</li>
              <li><strong>Key:</strong> vmware.vm.discovery[{$VMWARE.URL}]</li>
              <li><strong>Update interval:</strong> 1h</li>
            </ul>
          </li>
          <li>Create host prototype:
            <ul>
              <li><strong>Host name:</strong> {#VM.NAME}</li>
              <li><strong>Groups:</strong> Virtual machines</li>
              <li><strong>Template:</strong> VMware Guest</li>
            </ul>
          </li>
        </ol>

        <h3>🔍 Verification and Troubleshooting</h3>
        <h4>Check Host Status</h4>
        <ul>
          <li>Go to <strong>Monitoring → Hosts</strong></li>
          <li>Look for green "ZBX" icon (agent connectivity)</li>
          <li>Check "Availability" column for interface status</li>
          <li>Review "Latest data" for incoming metrics</li>
        </ul>

        <h4>Common Issues</h4>
        <div class="tutorial-warning">
          <h4>🔧 Troubleshooting Checklist</h4>
          <ul>
            <li><strong>Red ZBX icon:</strong> Check agent configuration and firewall</li>
            <li><strong>No data:</strong> Verify template assignment and item keys</li>
            <li><strong>SNMP timeout:</strong> Check community string and network connectivity</li>
            <li><strong>Permission denied:</strong> Review agent permissions and SELinux settings</li>
          </ul>
        </div>

        <h4>Testing Connectivity</h4>
        <div class="code-block">
          <code># Test from Zabbix server
zabbix_get -s target-host-ip -k system.cpu.load[all,avg1]

# Test SNMP
snmpwalk -v2c -c public target-device-ip 1.3.6.1.2.1.1.1.0

# Check agent logs
tail -f /var/log/zabbix/zabbix_agentd.log</code>
        </div>

        <h3>📋 Host Organization Best Practices</h3>
        <ul>
          <li><strong>Naming Convention:</strong> Use consistent hostname patterns</li>
          <li><strong>Host Groups:</strong> Organize by function, location, or environment</li>
          <li><strong>Templates:</strong> Create custom templates for specific applications</li>
          <li><strong>Macros:</strong> Use host-level macros for customization</li>
          <li><strong>Maintenance:</strong> Schedule maintenance windows properly</li>
        </ul>

        <div class="tutorial-tips">
          <h4>🎯 Pro Tips</h4>
          <ul>
            <li>Use host metadata for auto-assignment of templates</li>
            <li>Implement host discovery for dynamic environments</li>
            <li>Create custom host groups for different teams</li>
            <li>Use host inventory for asset management</li>
            <li>Regular cleanup of obsolete hosts</li>
          </ul>
        </div>
      </div>
    `
  },

  'cisco-voice': {
    title: 'Cisco ISR voice router configuration',
    category: 'networking',
    difficulty: 'advanced',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>☎️ Cisco ISR Voice Router Configuration</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Complete configuration of Cisco ISR router for voice services including CUCM integration, dial plans, QoS, and troubleshooting voice issues.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Cisco ISR router (2900/3900/4000 series) with voice capabilities</li>
          <li>Cisco Unified Communications Manager (CUCM)</li>
          <li>Basic understanding of Cisco IOS configuration</li>
          <li>Network connectivity between router and CUCM</li>
        </ul>

        <h3>🔧 Basic Voice Configuration</h3>
        <h4>Enable Voice Services</h4>
        <div class="code-block">
          <code>Router> enable
Router# configure terminal

! Enable voice services
Router(config)# voice service voip
Router(config-voi-serv)# ip address trusted list
Router(config-voi-serv)# ip address trusted authenticate
Router(config-voi-serv)# allow-connections sip to sip
Router(config-voi-serv)# supplementary-service sip refer
Router(config-voi-serv)# supplementary-service sip handle-replaces
Router(config-voi-serv)# exit

! Configure voice class codec
Router(config)# voice class codec 1
Router(config-class)# codec preference 1 g711ulaw
Router(config-class)# codec preference 2 g729r8
Router(config-class)# exit</code>
        </div>

        <h4>Configure SIP Settings</h4>
        <div class="code-block">
          <code>! Configure SIP user agent
Router(config)# sip-ua
Router(config-sip-ua)# transport udp tcp
Router(config-sip-ua)# connection-reuse
Router(config-sip-ua)# nat symmetric role active
Router(config-sip-ua)# nat symmetric check-media-src
Router(config-sip-ua)# timers register 300
Router(config-sip-ua)# retry register 3
Router(config-sip-ua)# retry response 3
Router(config-sip-ua)# exit</code>
        </div>

        <h3>📞 CUCM Integration</h3>
        <h4>Configure SIP Trunk to CUCM</h4>
        <div class="code-block">
          <code>! Create voice class uri for CUCM
Router(config)# voice class uri CUCM sip
Router(config-class)# host ipv4:10.1.1.100
Router(config-class)# exit

! Configure dial peer for CUCM
Router(config)# dial-peer voice 100 voip
Router(config-dial-peer)# description "SIP Trunk to CUCM"
Router(config-dial-peer)# destination-pattern 9T
Router(config-dial-peer)# session protocol sipv2
Router(config-dial-peer)# session target sip-server
Router(config-dial-peer)# voice-class uri CUCM sip
Router(config-dial-peer)# voice-class codec 1
Router(config-dial-peer)# dtmf-relay rtp-nte
Router(config-dial-peer)# no vad
Router(config-dial-peer)# exit</code>
        </div>

        <h4>Configure Incoming Calls from CUCM</h4>
        <div class="code-block">
          <code>! Incoming dial peer from CUCM
Router(config)# dial-peer voice 101 voip
Router(config-dial-peer)# description "Incoming from CUCM"
Router(config-dial-peer)# incoming called-number .
Router(config-dial-peer)# session protocol sipv2
Router(config-dial-peer)# voice-class codec 1
Router(config-dial-peer)# dtmf-relay rtp-nte
Router(config-dial-peer)# no vad
Router(config-dial-peer)# exit</code>
        </div>

        <h3>🌐 PSTN Gateway Configuration</h3>
        <h4>Configure PRI/T1 Interface</h4>
        <div class="code-block">
          <code>! Configure T1 controller
Router(config)# controller T1 0/0/0
Router(config-controller)# pri-group timeslots 1-24
Router(config-controller)# exit

! Configure serial interface for PRI
Router(config)# interface Serial0/0/0:23
Router(config-if)# description "PRI to PSTN"
Router(config-if)# encapsulation hdlc
Router(config-if)# isdn switch-type primary-ni
Router(config-if)# isdn incoming-voice voice
Router(config-if)# no shutdown
Router(config-if)# exit</code>
        </div>

        <h4>Configure PSTN Dial Peers</h4>
        <div class="code-block">
          <code>! Outbound to PSTN
Router(config)# dial-peer voice 200 pots
Router(config-dial-peer)# description "Outbound to PSTN"
Router(config-dial-peer)# destination-pattern 9[2-9]......
Router(config-dial-peer)# port 0/0/0:23
Router(config-dial-peer)# forward-digits 7
Router(config-dial-peer)# exit

! Inbound from PSTN
Router(config)# dial-peer voice 201 pots
Router(config-dial-peer)# description "Inbound from PSTN"
Router(config-dial-peer)# incoming called-number 5551234...
Router(config-dial-peer)# port 0/0/0:23
Router(config-dial-peer)# direct-inward-dial
Router(config-dial-peer)# exit</code>
        </div>

        <h3>🎚️ Voice Quality Configuration</h3>
        <h4>Configure QoS for Voice</h4>
        <div class="code-block">
          <code>! Create class maps for voice traffic
Router(config)# class-map match-any VOICE
Router(config-cmap)# match ip dscp ef
Router(config-cmap)# match protocol rtp audio
Router(config-cmap)# exit

Router(config)# class-map match-any VOICE-CONTROL
Router(config-cmap)# match ip dscp cs3
Router(config-cmap)# match protocol sip
Router(config-cmap)# exit

! Create policy map
Router(config)# policy-map WAN-QOS
Router(config-pmap)# class VOICE
Router(config-pmap-c)# priority percent 20
Router(config-pmap-c)# set ip dscp ef
Router(config-pmap-c)# exit
Router(config-pmap)# class VOICE-CONTROL
Router(config-pmap-c)# bandwidth percent 5
Router(config-pmap-c)# set ip dscp cs3
Router(config-pmap-c)# exit
Router(config-pmap)# class class-default
Router(config-pmap-c)# fair-queue
Router(config-pmap-c)# random-detect
Router(config-pmap-c)# exit
Router(config-pmap)# exit

! Apply to WAN interface
Router(config)# interface GigabitEthernet0/0/1
Router(config-if)# service-policy output WAN-QOS
Router(config-if)# exit</code>
        </div>

        <h4>Configure Voice VLANs</h4>
        <div class="code-block">
          <code>! Create voice VLAN
Router(config)# vlan 10
Router(config-vlan)# name VOICE
Router(config-vlan)# exit

! Configure switch port for IP phone
Router(config)# interface GigabitEthernet0/1/1
Router(config-if)# description "IP Phone Port"
Router(config-if)# switchport mode access
Router(config-if)# switchport access vlan 100
Router(config-if)# switchport voice vlan 10
Router(config-if)# spanning-tree portfast
Router(config-if)# exit</code>
        </div>

        <h3>📋 Dial Plan Configuration</h3>
        <h4>Translation Rules</h4>
        <div class="code-block">
          <code>! Create translation rules for number manipulation
Router(config)# voice translation-rule 1
Router(config-translation-rule)# rule 1 /^9\(.*\)/ /\1/
Router(config-translation-rule)# exit

Router(config)# voice translation-rule 2
Router(config-translation-rule)# rule 1 /^\([2-9]......\)/ /555\1/
Router(config-translation-rule)# exit

! Create translation profile
Router(config)# voice translation-profile OUTBOUND
Router(config-translation-profile)# translate calling 1
Router(config-translation-profile)# translate called 2
Router(config-translation-profile)# exit

! Apply to dial peer
Router(config)# dial-peer voice 200 pots
Router(config-dial-peer)# translation-profile outgoing OUTBOUND
Router(config-dial-peer)# exit</code>
        </div>

        <h3>🔒 Security Configuration</h3>
        <h4>SIP Security</h4>
        <div class="code-block">
          <code>! Configure SIP authentication
Router(config)# voice class sip-profiles 1
Router(config-class)# rule 1 request ANY sip-header SIP-Req-URI modify "sip:(.*)@(.*)" "sip:\1@10.1.1.100"
Router(config-class)# exit

! Apply security to dial peer
Router(config)# dial-peer voice 100 voip
Router(config-dial-peer)# voice-class sip profiles 1
Router(config-dial-peer)# exit

! Configure access lists for voice traffic
Router(config)# ip access-list extended VOICE-TRAFFIC
Router(config-ext-nacl)# permit udp 10.1.1.0 0.0.0.255 any range 16384 32767
Router(config-ext-nacl)# permit tcp 10.1.1.0 0.0.0.255 any eq 5060
Router(config-ext-nacl)# exit</code>
        </div>

        <h3>📊 Monitoring and Troubleshooting</h3>
        <h4>Voice Debugging Commands</h4>
        <div class="code-block">
          <code>! Enable voice debugging (use carefully in production)
Router# debug voice ccapi inout
Router# debug voip dial-peer
Router# debug ccsip messages
Router# debug isdn q931

! Show voice statistics
Router# show voice call summary
Router# show dial-peer voice summary
Router# show voice port summary
Router# show sip-ua status
Router# show voice statistics

! Show call active details
Router# show call active voice brief
Router# show call active voice compact
Router# show call history voice brief</code>
        </div>

        <h4>Voice Quality Monitoring</h4>
        <div class="code-block">
          <code>! Configure voice metrics
Router(config)# dial-peer voice 100 voip
Router(config-dial-peer)# voice-class aaa 1
Router(config-dial-peer)# exit

Router(config)# voice class aaa 1
Router(config-voice-class)# accounting method-list default
Router(config-voice-class)# exit

! Show voice quality metrics
Router# show voice call status
Router# show voice dsp detailed
Router# show voice statistics memory</code>
        </div>

        <h3>🚨 Common Issues and Solutions</h3>
        <div class="tutorial-warning">
          <h4>⚠️ Troubleshooting Guide</h4>
          <ul>
            <li><strong>No dial tone:</strong> Check voice port configuration and cable connections</li>
            <li><strong>One-way audio:</strong> Verify RTP ports and NAT configuration</li>
            <li><strong>Call drops:</strong> Check QoS settings and bandwidth allocation</li>
            <li><strong>Echo issues:</strong> Configure echo cancellation on voice ports</li>
            <li><strong>DTMF problems:</strong> Verify DTMF relay settings</li>
          </ul>
        </div>

        <h4>Echo Cancellation</h4>
        <div class="code-block">
          <code>! Configure echo cancellation
Router(config)# voice-port 0/1/0
Router(config-voiceport)# echo-cancel enable
Router(config-voiceport)# echo-cancel coverage 32
Router(config-voiceport)# input gain auto-control
Router(config-voiceport)# output attenuation 0
Router(config-voiceport)# exit</code>
        </div>

        <h3>📈 Performance Optimization</h3>
        <h4>Voice DSP Resource Management</h4>
        <div class="code-block">
          <code>! Show DSP resources
Router# show voice dsp group all

! Configure DSP farm for conferencing
Router(config)# dspfarm profile 1 conference
Router(config-dspfarm-profile)# codec g711ulaw
Router(config-dspfarm-profile)# maximum sessions 8
Router(config-dspfarm-profile)# associate application SCCP
Router(config-dspfarm-profile)# exit</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Always configure QoS for voice traffic</li>
            <li>Use separate VLANs for voice and data</li>
            <li>Implement proper security measures</li>
            <li>Regular backup of voice configurations</li>
            <li>Monitor voice quality metrics continuously</li>
            <li>Document dial plan and routing logic</li>
          </ul>
        </div>

        <h3>🔧 Maintenance Procedures</h3>
        <ul>
          <li><strong>Regular health checks:</strong> Monitor call statistics and quality</li>
          <li><strong>Capacity planning:</strong> Track concurrent call usage</li>
          <li><strong>Security updates:</strong> Keep IOS versions current</li>
          <li><strong>Backup procedures:</strong> Regular configuration backups</li>
          <li><strong>Emergency procedures:</strong> Failover and recovery plans</li>
        </ul>
      </div>
    `
  }
};

// Additional networking tutorials would continue here...
// This is a sample of the comprehensive content structure