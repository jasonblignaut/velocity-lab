/* ===================================================================
   Networking Tutorials - Comprehensive Network Management Guides
   =================================================================== */

window.NETWORKING_TUTORIALS = {
    'zabbix-setup': {
        title: 'Setting up Zabbix monitoring server',
        content: `
            <div class="tutorial-content">
                <h2>Setting up Zabbix Monitoring Server</h2>
                
                <h3>Prerequisites</h3>
                <ul>
                    <li>Ubuntu 20.04/22.04 or CentOS 7/8 server</li>
                    <li>Minimum 2GB RAM, 4GB recommended</li>
                    <li>MySQL/MariaDB or PostgreSQL database</li>
                    <li>Web server (Apache/Nginx)</li>
                </ul>
                
                <h3>Installation Steps</h3>
                
                <h4>1. Install Zabbix Repository</h4>
                <div class="code-block">
                    <code># Ubuntu/Debian
wget https://repo.zabbix.com/zabbix/6.4/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.4-1+ubuntu22.04_all.deb
sudo dpkg -i zabbix-release_6.4-1+ubuntu22.04_all.deb
sudo apt update

# CentOS/RHEL
sudo rpm -Uvh https://repo.zabbix.com/zabbix/6.4/rhel/8/x86_64/zabbix-release-6.4-1.el8.noarch.rpm
sudo dnf clean all</code>
                </div>
                
                <h4>2. Install Zabbix Components</h4>
                <div class="code-block">
                    <code># Install server, frontend, agent
sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent

# For CentOS
sudo dnf install zabbix-server-mysql zabbix-web-mysql zabbix-apache-conf zabbix-sql-scripts zabbix-selinux-policy zabbix-agent</code>
                </div>
                
                <h4>3. Configure Database</h4>
                <div class="code-block">
                    <code># Create database and user
mysql -uroot -p
mysql> create database zabbix character set utf8mb4 collate utf8mb4_bin;
mysql> create user zabbix@localhost identified by 'password';
mysql> grant all privileges on zabbix.* to zabbix@localhost;
mysql> set global log_bin_trust_function_creators = 1;
mysql> quit;

# Import initial schema
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix</code>
                </div>
                
                <h4>4. Configure Zabbix Server</h4>
                <div class="code-block">
                    <code># Edit server configuration
sudo nano /etc/zabbix/zabbix_server.conf

# Key settings:
DBPassword=password
DBHost=localhost
DBName=zabbix
DBUser=zabbix</code>
                </div>
                
                <h3>Web Interface Setup</h3>
                <ol>
                    <li>Configure PHP timezone in /etc/zabbix/apache.conf</li>
                    <li>Restart Apache and Zabbix services</li>
                    <li>Access web interface: http://server-ip/zabbix</li>
                    <li>Complete setup wizard</li>
                    <li>Login with Admin/zabbix</li>
                </ol>
                
                <div class="tutorial-tips">
                    <h4>💡 Security Best Practices</h4>
                    <ul>
                        <li>Change default admin password immediately</li>
                        <li>Configure firewall rules</li>
                        <li>Enable HTTPS with SSL certificate</li>
                        <li>Regular database backups</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Important Notes</h4>
                    <p>Ensure proper firewall configuration for ports 10050 (agent), 10051 (server), and 80/443 (web).</p>
                </div>
            </div>
        `
    },
    
    'zabbix-advanced': {
        title: 'Monitoring with Zabbix advanced features',
        content: `
            <div class="tutorial-content">
                <h2>Advanced Zabbix Monitoring Features</h2>
                
                <h3>Custom Item Monitoring</h3>
                
                <h4>Creating Custom Items</h4>
                <div class="code-block">
                    <code># Custom script example
#!/bin/bash
# Check disk usage percentage
df -h / | awk 'NR==2 {print $5}' | sed 's/%//g'

# Make executable
chmod +x /usr/local/bin/disk_usage.sh</code>
                </div>
                
                <h4>User Parameters</h4>
                <div class="code-block">
                    <code># Add to /etc/zabbix/zabbix_agentd.conf
UserParameter=custom.disk.usage,/usr/local/bin/disk_usage.sh
UserParameter=custom.process.count[*],ps -ef | grep "$1" | grep -v grep | wc -l

# Restart agent
sudo systemctl restart zabbix-agent</code>
                </div>
                
                <h3>Template Creation</h3>
                <ol>
                    <li>Navigate to Configuration > Templates</li>
                    <li>Create new template</li>
                    <li>Add items, triggers, and graphs</li>
                    <li>Link to host groups</li>
                </ol>
                
                <h4>Template Example</h4>
                <div class="code-block">
                    <code># Template for web server monitoring
Items:
- HTTP response time
- CPU utilization
- Memory usage
- Disk I/O
- Network traffic

Triggers:
- HTTP response > 5 seconds
- CPU > 80% for 5 minutes
- Memory > 90%
- Disk space < 10%</code>
                </div>
                
                <h3>Advanced Triggers</h3>
                
                <h4>Complex Trigger Expressions</h4>
                <div class="code-block">
                    <code># Multiple condition trigger
{host:cpu.usage.avg(5m)}>80 and {host:memory.usage.last()}>90

# Time-based trigger
{host:service.status.nodata(10m)}=1 and {host:service.status.time()}>070000 and {host:service.status.time()}<180000

# Hysteresis trigger
{host:temperature.last()}>40 or ({host:temperature.last()}>35 and {host:temperature.max(10m)}>40)</code>
                </div>
                
                <h3>Network Discovery</h3>
                <ol>
                    <li>Configure discovery rules</li>
                    <li>Set IP ranges and ports</li>
                    <li>Define discovery actions</li>
                    <li>Automatic host creation</li>
                </ol>
                
                <h3>API Integration</h3>
                <div class="code-block">
                    <code># Python API example
import requests
import json

# Login and get auth token
url = "http://zabbix-server/zabbix/api_jsonrpc.php"
login_data = {
    "jsonrpc": "2.0",
    "method": "user.login",
    "params": {
        "user": "admin",
        "password": "password"
    },
    "id": 1
}

response = requests.post(url, data=json.dumps(login_data), headers={'Content-Type': 'application/json'})
auth_token = response.json()['result']

# Get host information
host_data = {
    "jsonrpc": "2.0",
    "method": "host.get",
    "params": {
        "output": ["hostid", "host"],
        "selectInterfaces": ["interfaceid", "ip"]
    },
    "auth": auth_token,
    "id": 2
}</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Performance Optimization</h4>
                    <ul>
                        <li>Adjust housekeeper settings</li>
                        <li>Optimize database performance</li>
                        <li>Use Zabbix proxy for remote locations</li>
                        <li>Configure value caching</li>
                    </ul>
                </div>
            </div>
        `
    },
    
    'cisco-isr': {
        title: 'Cisco ISR voice router configuration',
        content: `
            <div class="tutorial-content">
                <h2>Cisco ISR Voice Router Configuration</h2>
                
                <h3>Initial Router Setup</h3>
                
                <h4>Basic Configuration</h4>
                <div class="code-block">
                    <code>Router> enable
Router# configure terminal
Router(config)# hostname ISR-Voice-GW
ISR-Voice-GW(config)# ip domain-name company.local

# Enable SSH
ISR-Voice-GW(config)# crypto key generate rsa modulus 2048
ISR-Voice-GW(config)# ip ssh version 2
ISR-Voice-GW(config)# line vty 0 4
ISR-Voice-GW(config-line)# transport input ssh
ISR-Voice-GW(config-line)# login local</code>
                </div>
                
                <h3>Voice Configuration</h3>
                
                <h4>Voice Card Configuration</h4>
                <div class="code-block">
                    <code># Configure voice card slots
ISR-Voice-GW(config)# card type t1 0 0
ISR-Voice-GW(config)# controller t1 0/0/0
ISR-Voice-GW(config-controller)# framing esf
ISR-Voice-GW(config-controller)# linecode b8zs
ISR-Voice-GW(config-controller)# pri-group timeslots 1-24</code>
                </div>
                
                <h4>Voice Ports</h4>
                <div class="code-block">
                    <code># FXS port configuration (analog phones)
ISR-Voice-GW(config)# voice-port 0/1/0
ISR-Voice-GW(config-voiceport)# signal loopStart
ISR-Voice-GW(config-voiceport)# caller-id enable

# FXO port configuration (PSTN connection)
ISR-Voice-GW(config)# voice-port 0/1/1
ISR-Voice-GW(config-voiceport)# signal groundStart
ISR-Voice-GW(config-voiceport)# ring frequency 25</code>
                </div>
                
                <h3>Dial Peer Configuration</h3>
                
                <h4>POTS Dial Peers</h4>
                <div class="code-block">
                    <code># Local phone dial peer
ISR-Voice-GW(config)# dial-peer voice 1 pots
ISR-Voice-GW(config-dial-peer)# destination-pattern 100
ISR-Voice-GW(config-dial-peer)# port 0/1/0

# PSTN dial peer
ISR-Voice-GW(config)# dial-peer voice 2 pots
ISR-Voice-GW(config-dial-peer)# destination-pattern 9T
ISR-Voice-GW(config-dial-peer)# port 0/1/1
ISR-Voice-GW(config-dial-peer)# prefix 1</code>
                </div>
                
                <h4>VoIP Dial Peers</h4>
                <div class="code-block">
                    <code># SIP dial peer to PBX
ISR-Voice-GW(config)# dial-peer voice 10 voip
ISR-Voice-GW(config-dial-peer)# destination-pattern [2-9]...
ISR-Voice-GW(config-dial-peer)# session protocol sipv2
ISR-Voice-GW(config-dial-peer)# session target ipv4:192.168.1.100
ISR-Voice-GW(config-dial-peer)# codec g711ulaw</code>
                </div>
                
                <h3>SIP Configuration</h3>
                <div class="code-block">
                    <code># Global SIP configuration
ISR-Voice-GW(config)# sip-ua
ISR-Voice-GW(config-sip-ua)# retry invite 3
ISR-Voice-GW(config-sip-ua)# retry response 5
ISR-Voice-GW(config-sip-ua)# timers trying 1000

# Voice class for SIP
ISR-Voice-GW(config)# voice class sip-profiles 1
ISR-Voice-GW(config-class)# request ANY sip-header From modify "sip:(.*)@(.*)" "sip:\1@company.com"</code>
                </div>
                
                <h3>QoS Configuration</h3>
                <div class="code-block">
                    <code># Voice QoS class map
ISR-Voice-GW(config)# class-map match-all voice-traffic
ISR-Voice-GW(config-cmap)# match protocol rtp

# Policy map
ISR-Voice-GW(config)# policy-map voice-policy
ISR-Voice-GW(config-pmap)# class voice-traffic
ISR-Voice-GW(config-pmap-c)# priority 64
ISR-Voice-GW(config-pmap)# class class-default
ISR-Voice-GW(config-pmap-c)# fair-queue

# Apply to interface
ISR-Voice-GW(config)# interface serial 0/0/0
ISR-Voice-GW(config-if)# service-policy output voice-policy</code>
                </div>
                
                <h3>Troubleshooting Commands</h3>
                <div class="code-block">
                    <code># Voice debugging
debug voice ccapi inout
debug voip ccapi inout
debug sip-ua messages

# Status commands
show voice port summary
show dial-peer voice summary
show voice call summary
show sip-ua status</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Best Practices</h4>
                    <ul>
                        <li>Always configure proper QoS for voice traffic</li>
                        <li>Use appropriate codecs (G.711 for LAN, G.729 for WAN)</li>
                        <li>Implement proper dial plan design</li>
                        <li>Configure emergency services routing</li>
                    </ul>
                </div>
            </div>
        `
    },
    
    'prtg-setup': {
        title: 'PRTG 100 sensors free setup',
        content: `
            <div class="tutorial-content">
                <h2>PRTG Network Monitor - Free 100 Sensors Setup</h2>
                
                <h3>Download and Installation</h3>
                <ol>
                    <li>Download PRTG from official Paessler website</li>
                    <li>Run installer as Administrator</li>
                    <li>Choose installation directory</li>
                    <li>Configure initial admin password</li>
                    <li>Complete installation and restart</li>
                </ol>
                
                <h3>Initial Configuration</h3>
                
                <h4>First Login and Setup</h4>
                <div class="code-block">
                    <code>Web Interface: https://server-ip:8080
Default credentials: prtgadmin / password-you-set

Initial Setup Steps:
1. Complete setup wizard
2. Configure email settings
3. Set timezone and regional settings
4. Add first monitoring targets</code>
                </div>
                
                <h3>Device Discovery</h3>
                
                <h4>Auto-Discovery Process</h4>
                <ol>
                    <li>Navigate to Setup > System Administration > Auto-Discovery</li>
                    <li>Enter IP range (e.g., 192.168.1.1-192.168.1.254)</li>
                    <li>Configure SNMP community strings</li>
                    <li>Select device templates</li>
                    <li>Start discovery process</li>
                </ol>
                
                <h4>Manual Device Addition</h4>
                <div class="code-block">
                    <code>Steps:
1. Right-click on group
2. Add Device
3. Enter device name and IP
4. Configure credentials:
   - SNMP v1/v2c: Community string
   - SNMP v3: Username/password
   - WMI: Windows credentials</code>
                </div>
                
                <h3>Essential Sensors</h3>
                
                <h4>Network Infrastructure</h4>
                <ul>
                    <li>Ping sensor for availability monitoring</li>
                    <li>SNMP interface sensors for bandwidth</li>
                    <li>SNMP CPU and memory sensors</li>
                    <li>Port availability sensors</li>
                </ul>
                
                <h4>Server Monitoring</h4>
                <div class="code-block">
                    <code>Windows Servers:
- WMI CPU Load
- WMI Memory Usage
- WMI Disk Free Space
- WMI Service Monitor
- WMI Event Log

Linux Servers:
- SSH CPU Load
- SSH Memory Usage
- SSH Disk Free
- SSH Service Monitor</code>
                </div>
                
                <h3>Notification Setup</h3>
                
                <h4>Email Notifications</h4>
                <div class="code-block">
                    <code># SMTP Configuration
Setup > Account Settings > Notifications
1. Enter SMTP server details
2. Configure sender address
3. Test email delivery
4. Create notification templates

# Notification Rules
Setup > Account Settings > Notification Triggers
- Define conditions (Down, Warning, Error)
- Set escalation levels
- Configure business hours</code>
                </div>
                
                <h4>Mobile App Integration</h4>
                <ol>
                    <li>Download PRTG mobile app</li>
                    <li>Configure push notifications</li>
                    <li>Set up remote access (if needed)</li>
                    <li>Test mobile alerts</li>
                </ol>
                
                <h3>Custom Sensors</h3>
                
                <h4>HTTP Sensors</h4>
                <div class="code-block">
                    <code># Website monitoring
1. Add HTTP sensor
2. Configure URL and timeout
3. Set expected status codes
4. Define content matching rules
5. Enable SSL certificate monitoring</code>
                </div>
                
                <h4>Database Sensors</h4>
                <div class="code-block">
                    <code># SQL Server monitoring
Sensor Type: Microsoft SQL v2
Connection: Server name and database
Query: SELECT COUNT(*) FROM active_sessions
Expected Value: Numeric comparison</code>
                </div>
                
                <h3>Maps and Dashboards</h3>
                
                <h4>Creating Network Maps</h4>
                <ol>
                    <li>Go to Maps > Create New Map</li>
                    <li>Add devices and connections</li>
                    <li>Configure status indicators</li>
                    <li>Add background images</li>
                    <li>Save and share map</li>
                </ol>
                
                <h4>Dashboard Configuration</h4>
                <div class="tutorial-tips">
                    <h4>💡 Dashboard Widgets</h4>
                    <ul>
                        <li>Top Lists (CPU, Bandwidth, Response Time)</li>
                        <li>Status widgets for critical systems</li>
                        <li>Graph widgets for trending</li>
                        <li>Map widgets for visual overview</li>
                    </ul>
                </div>
                
                <h3>Reporting</h3>
                <div class="code-block">
                    <code># Scheduled Reports
Reports > Report Templates
1. Create custom report template
2. Select sensors and time periods
3. Configure formatting options
4. Schedule automatic delivery
5. Email to stakeholders</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ 100 Sensor Limit</h4>
                    <p>Free version limited to 100 sensors. Plan sensor deployment carefully and prioritize critical monitoring points.</p>
                </div>
            </div>
        `
    },
    
    'grandstream-pbx': {
        title: 'Grandstream PBX setup and configuration',
        content: `
            <div class="tutorial-content">
                <h2>Grandstream UCM PBX Setup and Configuration</h2>
                
                <h3>Initial Setup</h3>
                
                <h4>Hardware Installation</h4>
                <ol>
                    <li>Connect UCM to network switch</li>
                    <li>Power on the device</li>
                    <li>Wait for boot process (LED indicators)</li>
                    <li>Find IP address using LCD panel or DHCP logs</li>
                </ol>
                
                <h4>Web Interface Access</h4>
                <div class="code-block">
                    <code>Default Access:
URL: https://device-ip
Username: admin
Password: admin

First Login Tasks:
1. Change default password
2. Configure network settings
3. Set timezone and NTP
4. Update firmware if needed</code>
                </div>
                
                <h3>Network Configuration</h3>
                
                <h4>LAN Settings</h4>
                <div class="code-block">
                    <code>System Settings > Network Settings > ETH
- IP Mode: Static or DHCP
- IP Address: 192.168.1.100
- Subnet Mask: 255.255.255.0
- Gateway: 192.168.1.1
- DNS: 8.8.8.8, 8.8.4.4</code>
                </div>
                
                <h4>Firewall Configuration</h4>
                <ol>
                    <li>Enable SIP ALG disable on router</li>
                    <li>Open required ports: 5060 (SIP), 5004 (SIP), 10000-20000 (RTP)</li>
                    <li>Configure port forwarding if needed</li>
                    <li>Set up DMZ or dedicated VLAN</li>
                </ol>
                
                <h3>Extension Configuration</h3>
                
                <h4>Creating Extensions</h4>
                <div class="code-block">
                    <code>Extensions > Create New Extension
1. Extension Number: 100-999
2. Name: User Full Name
3. Email: user@company.com
4. Mobile Number: For mobility features
5. Department: For call routing
6. Voice Mail: Enable/disable</code>
                </div>
                
                <h4>Extension Features</h4>
                <ul>
                    <li>Call forwarding options</li>
                    <li>Do not disturb settings</li>
                    <li>Voicemail configuration</li>
                    <li>Recording settings</li>
                    <li>Mobility features</li>
                </ul>
                
                <h3>Trunk Configuration</h3>
                
                <h4>SIP Trunk Setup</h4>
                <div class="code-block">
                    <code>Trunks > Create New SIP Trunk
Basic Settings:
- Trunk Name: Provider-Main
- Hostname/IP: sip.provider.com
- Username: account-username
- Password: account-password
- Auth ID: authentication-id

Advanced Settings:
- Registration: Yes
- Qualify: Yes
- NAT: Yes (if behind NAT)
- DTMF Mode: RFC2833</code>
                </div>
                
                <h4>Analog Trunk (FXO)</h4>
                <div class="code-block">
                    <code>For UCM models with FXO ports:
Trunks > Analog Trunks > FXO-1
- Enable: Yes
- Caller ID Detection: Yes
- Rx Gain: 0.0
- Tx Gain: 0.0
- Echo Cancellation: Yes</code>
                </div>
                
                <h3>Call Routing</h3>
                
                <h4>Inbound Routes</h4>
                <div class="code-block">
                    <code>Call Routes > Inbound Routes
1. DID Pattern: +1234567890
2. Trunk: Select trunk
3. Strip: Number of digits to strip
4. Prepend: Digits to add
5. Destination: Extension, IVR, or Queue</code>
                </div>
                
                <h4>Outbound Routes</h4>
                <div class="code-block">
                    <code>Call Routes > Outbound Routes
1. Pattern: 9NXXNXXXXXX (US format)
2. Strip: 1 (remove 9)
3. Prepend: 1 (add country code)
4. Trunk Sequence: Priority order
5. Permissions: User groups allowed</code>
                </div>
                
                <h3>Advanced Features</h3>
                
                <h4>Auto Attendant (IVR)</h4>
                <ol>
                    <li>Record greeting messages</li>
                    <li>Configure menu options (0-9)</li>
                    <li>Set timeout and invalid options</li>
                    <li>Link to extensions or queues</li>
                </ol>
                
                <h4>Call Queues</h4>
                <div class="code-block">
                    <code>Queues > Create New Queue
- Queue Number: 8000
- Queue Name: Support Queue
- Strategy: Ring All / Round Robin
- Members: Add extensions
- Music on Hold: Select file
- Announcements: Configure messages</code>
                </div>
                
                <h4>Conference Rooms</h4>
                <div class="code-block">
                    <code>Conference > Create Conference
- Conference Number: 7000
- Conference Name: Main Conference
- Pin: Optional security
- Max Members: 10
- Recording: Enable if needed
- Music on Hold: For waiting</code>
                </div>
                
                <h3>Phone Provisioning</h3>
                
                <h4>Zero Config Provisioning</h4>
                <ol>
                    <li>Enable DHCP option 66 or DNS SRV</li>
                    <li>Set provisioning server URL</li>
                    <li>Configure templates for phone models</li>
                    <li>Bulk import phone MAC addresses</li>
                </ol>
                
                <h4>Manual Phone Configuration</h4>
                <div class="code-block">
                    <code>Phone Settings (via phone web interface):
Account 1:
- SIP Server: UCM-IP-address
- SIP User ID: extension-number
- SIP Password: extension-password
- Name: Display name
- Auth ID: extension-number</code>
                </div>
                
                <h3>System Backup and Maintenance</h3>
                
                <h4>Regular Backups</h4>
                <div class="code-block">
                    <code>Maintenance > Backup/Restore
Automatic Backup:
1. Enable scheduled backups
2. Set backup frequency (daily/weekly)
3. Configure FTP/email delivery
4. Test restore procedures

Manual Backup:
1. Export configuration
2. Download CDR records
3. Save voicemail files
4. Document settings</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Best Practices</h4>
                    <ul>
                        <li>Change all default passwords immediately</li>
                        <li>Enable HTTPS for web access</li>
                        <li>Regular firmware updates</li>
                        <li>Monitor call quality and system resources</li>
                        <li>Implement proper network QoS</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Always configure strong passwords, enable fail2ban, and restrict access to management interfaces.</p>
                </div>
            </div>
        `
    }
};