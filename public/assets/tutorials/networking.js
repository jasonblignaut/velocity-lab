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

PARTITION="\\$1"
df -h "\\$PARTITION" | awk 'NR==2 {print \\$5}' | sed 's/%//'

# Make executable
chmod +x /etc/zabbix/scripts/disk_usage.sh

# Add to zabbix_agentd.conf
UserParameter=custom.disk.usage[*],/etc/zabbix/scripts/disk_usage.sh \\$1</code>
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
      </div>
    `
  }
};