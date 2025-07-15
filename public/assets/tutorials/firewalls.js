/**
 * Velocity Lab - Firewall Configuration Tutorials
 * Comprehensive firewall guides for MSP professionals
 */

window.FIREWALL_TUTORIALS = {
  'sophos-setup': {
    title: 'Sophos firewall initial setup and configuration',
    category: 'firewalls',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>🔥 Sophos Firewall Initial Setup and Configuration</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Complete initial setup of Sophos XG/XGS firewall including network configuration, security policies, user authentication, and basic monitoring setup.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>Sophos XG/XGS firewall appliance or virtual machine</li>
          <li>Basic network knowledge (IP addressing, subnetting)</li>
          <li>Admin credentials for initial setup</li>
          <li>Network planning documentation</li>
        </ul>

        <h3>🚀 Step 1: Initial Access and Basic Configuration</h3>
        <h4>First-Time Setup</h4>
        <ol>
          <li><strong>Connect to appliance:</strong>
            <ul>
              <li>Physical: Connect laptop to LAN port</li>
              <li>Virtual: Configure management network</li>
              <li>Default IP: 192.168.1.1</li>
              <li>Default credentials: admin/admin</li>
            </ul>
          </li>
          <li><strong>Initial web login:</strong>
            <ul>
              <li>Browse to https://192.168.1.1:4444</li>
              <li>Accept certificate warning</li>
              <li>Complete setup wizard</li>
            </ul>
          </li>
        </ol>

        <h4>Basic System Configuration</h4>
        <div class="code-block">
          <code># CLI initial configuration (if needed)
# Connect via console or SSH

# Set admin password
configure
set admin password new-secure-password

# Set hostname
set system hostname "FW-BRANCH-01"

# Configure timezone
set system timezone "America/New_York"

# Configure DNS
set system dns primary 8.8.8.8
set system dns secondary 8.8.4.4

# Save configuration
commit</code>
        </div>

        <h3>🌐 Step 2: Network Interface Configuration</h3>
        <h4>Configure WAN Interface</h4>
        <ol>
          <li>Go to <strong>Network → Interfaces</strong></li>
          <li>Edit <strong>Port A (WAN)</strong>:
            <ul>
              <li><strong>Zone assignment:</strong> WAN</li>
              <li><strong>IP assignment:</strong> Static/DHCP/PPPoE</li>
              <li><strong>Static example:</strong>
                <ul>
                  <li>IP: 203.0.113.10</li>
                  <li>Netmask: 255.255.255.248</li>
                  <li>Gateway: 203.0.113.9</li>
                </ul>
              </li>
            </ul>
          </li>
        </ol>

        <h4>Configure LAN Interface</h4>
        <ol>
          <li>Edit <strong>Port B (LAN)</strong>:
            <ul>
              <li><strong>Zone assignment:</strong> LAN</li>
              <li><strong>IP assignment:</strong> Static</li>
              <li><strong>Configuration:</strong>
                <ul>
                  <li>IP: 192.168.100.1</li>
                  <li>Netmask: 255.255.255.0</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>Enable <strong>DHCP server</strong>:
            <ul>
              <li>Range: 192.168.100.100-192.168.100.200</li>
              <li>Lease time: 24 hours</li>
              <li>DNS servers: 192.168.100.1</li>
            </ul>
          </li>
        </ol>

        <h4>VLAN Configuration</h4>
        <div class="code-block">
          <code># Create VLANs for network segmentation

# VLAN 10 - Users
Name: USERS_VLAN
VLAN ID: 10
Interface: Port B
IP: 192.168.10.1/24
Zone: LAN

# VLAN 20 - Servers  
Name: SERVERS_VLAN
VLAN ID: 20
Interface: Port C
IP: 192.168.20.1/24
Zone: DMZ

# VLAN 30 - IoT Devices
Name: IOT_VLAN  
VLAN ID: 30
Interface: Port B
IP: 192.168.30.1/24
Zone: IoT</code>
        </div>

        <h3>🔐 Step 3: User Authentication Setup</h3>
        <h4>Local User Database</h4>
        <ol>
          <li>Go to <strong>Authentication → Users</strong></li>
          <li>Create user groups:
            <ul>
              <li><strong>Administrators:</strong> Full access</li>
              <li><strong>Users:</strong> Limited web access</li>
              <li><strong>Guests:</strong> Basic internet only</li>
            </ul>
          </li>
          <li>Add users to appropriate groups</li>
        </ol>

        <h4>Active Directory Integration</h4>
        <div class="code-block">
          <code># Configure AD authentication
# Authentication → Servers → Add

Server Type: Microsoft Active Directory
Server Name: DC01.company.local
IP Address: 192.168.20.10
Base DN: DC=company,DC=local
Bind DN: CN=SophosService,OU=Service Accounts,DC=company,DC=local
Bind Password: [service-account-password]

# Group mapping
AD Group: Domain Admins → Sophos Group: Administrators
AD Group: IT Staff → Sophos Group: IT_Users  
AD Group: All Users → Sophos Group: Standard_Users</code>
        </div>

        <h3>🛡️ Step 4: Security Policy Configuration</h3>
        <h4>Basic Firewall Rules</h4>
        <ol>
          <li>Go to <strong>Rules and Policies → Firewall Rules</strong></li>
          <li>Create rule structure:
            <div class="code-block">
              <code># Rule 1: Allow LAN to Internet
Source: LAN_Networks
Destination: WAN_Networks  
Service: Any
Action: Allow
Log: Yes

# Rule 2: Block Inter-VLAN communication
Source: USERS_VLAN
Destination: SERVERS_VLAN
Service: Any
Action: Drop
Log: Yes

# Rule 3: Allow specific server access
Source: USERS_VLAN
Destination: File_Server (192.168.20.10)
Service: SMB
Action: Allow
Log: No

# Rule 4: Deny all other traffic
Source: Any
Destination: Any
Service: Any
Action: Drop
Log: Yes</code>
            </div>
          </li>
        </ol>

        <h4>NAT Policy Configuration</h4>
        <div class="code-block">
          <code># Configure NAT rules
# Rules and Policies → NAT Rules

# Rule 1: Source NAT for internet access
Original Source: LAN_Networks
Translated Source: WAN_Interface
Original Destination: !LAN_Networks
Translated Destination: Original

# Rule 2: Destination NAT for web server
Original Source: WAN_Networks  
Translated Source: Original
Original Destination: WAN_Interface:80
Translated Destination: Web_Server:80</code>
        </div>

        <h3>🔍 Step 5: Intrusion Prevention System (IPS)</h3>
        <h4>Enable IPS Protection</h4>
        <ol>
          <li>Go to <strong>Protect → Intrusion Prevention</strong></li>
          <li>Enable IPS on interfaces:
            <ul>
              <li>WAN interface: Full protection</li>
              <li>LAN interfaces: Internal protection</li>
            </ul>
          </li>
          <li>Configure IPS policies:
            <div class="code-block">
              <code># IPS Policy Configuration
Policy Name: High_Security
Protection Level: High
Signature Categories:
  - Network Attacks: Enabled
  - Trojan Activity: Enabled  
  - Web Application Attacks: Enabled
  - Protocol Anomalies: Enabled
  - P2P Activity: Block
  - Malware: Block

Action on Detection:
  - High Severity: Drop & Log
  - Medium Severity: Drop & Log
  - Low Severity: Allow & Log</code>
            </div>
          </li>
        </ol>

        <h3>🌐 Step 6: Web Protection and Content Filtering</h3>
        <h4>Configure Web Protection</h4>
        <ol>
          <li>Go to <strong>Protect → Web</strong></li>
          <li>Create web filter policies:
            <div class="code-block">
              <code># Web Filter Policy: Standard_Users
Blocked Categories:
  - Adult/Mature Content
  - Violence/Hate/Racism  
  - Illegal Drugs
  - Gambling
  - Peer-to-Peer
  - Social Networking (during work hours)
  - Streaming Media (during work hours)
  - Personal Storage/Backup

Allowed Categories:
  - Business/Economy
  - Education  
  - Government/Legal
  - Information Technology
  - News/Media
  - Reference/Research

Time-based Rules:
  - Social Media: Allowed 12:00-13:00, 17:00-18:00
  - Streaming: Blocked 09:00-17:00</code>
            </div>
          </li>
        </ol>

        <h4>HTTPS Inspection Setup</h4>
        <div class="code-block">
          <code># Configure HTTPS/TLS inspection
# Protect → Web → HTTPS Inspection

Certificate Authority: Generate new CA
CA Certificate Name: Company_Web_Filter_CA
Validity: 10 years

Inspection Settings:
  - Decrypt HTTPS traffic: Yes
  - Block invalid certificates: Yes
  - Block self-signed certificates: Yes
  - Minimum TLS version: 1.2

Exempted Categories:
  - Banking/Finance
  - Health/Medicine  
  - Government
  - Shopping (optional)</code>
        </div>

        <h3>📧 Step 7: Email Protection</h3>
        <h4>Anti-Spam Configuration</h4>
        <div class="code-block">
          <code># Email Protection Setup
# Protect → Email

SMTP Proxy Settings:
  - Listen on: LAN Interface
  - Port: 25
  - Transparent mode: Enabled

Anti-Spam Settings:
  - Sophos Labs: Enabled
  - RBL checks: Enabled
  - SPF checking: Enabled  
  - SURBL checking: Enabled
  - Quarantine spam: Yes
  - Spam threshold: 5

Anti-Virus Settings:
  - Scan all attachments: Yes
  - Block password-protected archives: Yes
  - Maximum archive depth: 3
  - Maximum file size: 50MB</code>
        </div>

        <h3>🔒 Step 8: VPN Configuration</h3>
        <h4>Site-to-Site VPN Setup</h4>
        <div class="code-block">
          <code># IPsec Site-to-Site VPN
# VPN → IPsec Connections

Connection Name: Branch_Office_VPN
Gateway Type: Initiate the connection
Authentication Method: Pre-shared key
Pre-shared Key: [strong-preshared-key]

Local Gateway:
  - IP: 203.0.113.10 (WAN IP)
  - Local Subnets: 192.168.100.0/24

Remote Gateway:  
  - IP: 198.51.100.10
  - Remote Subnets: 192.168.200.0/24

Encryption:
  - Phase 1: AES256, SHA256, DH Group 14
  - Phase 2: AES256, SHA256, PFS Group 14
  - Lifetime: 28800 seconds</code>
        </div>

        <h4>SSL VPN Configuration</h4>
        <div class="code-block">
          <code># Remote Access SSL VPN
# VPN → SSL VPN Remote Access

General Settings:
  - Enable SSL VPN: Yes
  - Listen on: WAN Interface  
  - Port: 443
  - Override portal port: 8443

User Portal:
  - Authentication: Active Directory
  - User groups: IT_Staff, Remote_Workers
  - Client certificate: Optional

Network Settings:
  - IP Pool: 192.168.150.1-192.168.150.100
  - DNS servers: 192.168.20.10, 192.168.20.11
  - Split tunneling: Enabled
  - Local subnets: 192.168.0.0/16</code>
        </div>

        <h3>📊 Step 9: Monitoring and Logging</h3>
        <h4>Configure Log Settings</h4>
        <div class="code-block">
          <code># System → Log Settings

Local Logging:
  - Log level: Information
  - Maximum log size: 500MB
  - Log rotation: Daily
  - Retain logs: 30 days

Remote Logging (Syslog):
  - Server: 192.168.20.50
  - Port: 514
  - Protocol: UDP
  - Facility: Local1

Log Categories:
  - System events: Enabled
  - Network events: Enabled  
  - Security events: Enabled
  - Firewall drops: Enabled
  - IPS events: Enabled
  - Web filter events: Enabled</code>
        </div>

        <h4>SNMP Configuration</h4>
        <div class="code-block">
          <code># System → SNMP

SNMP v2c Settings:
  - Enable SNMP: Yes
  - Community string: public (read-only)
  - Allowed hosts: 192.168.20.0/24
  - System location: "Main Office Server Room"
  - System contact: "IT Team <it@company.com>"

SNMP v3 Settings (Recommended):
  - Enable SNMPv3: Yes
  - Username: monitoring
  - Authentication: SHA
  - Auth password: [auth-password]
  - Privacy: AES
  - Privacy password: [priv-password]</code>
        </div>

        <h3>⚙️ Step 10: High Availability Setup</h3>
        <h4>Configure HA (if using two appliances)</h4>
        <div class="code-block">
          <code># System → High Availability

Primary Device Configuration:
  - Device role: Primary
  - HA link interface: Port D
  - HA link IP: 172.16.1.1/30
  - Monitor interfaces: Port A, Port B
  - Configuration sync: Enabled

Secondary Device Configuration:  
  - Device role: Auxiliary
  - HA link interface: Port D
  - HA link IP: 172.16.1.2/30
  - Monitor interfaces: Port A, Port B
  - Configuration sync: Enabled

Failover Settings:
  - Health check interval: 1 second
  - Dead interval: 3 seconds
  - Preempt mode: Enabled
  - Failback delay: 60 seconds</code>
        </div>

        <h3>🚨 Step 11: Security Hardening</h3>
        <h4>Admin Access Security</h4>
        <div class="code-block">
          <code># System → Administration

Admin Access:
  - HTTPS only: Enabled
  - HTTP redirect to HTTPS: Enabled
  - Session timeout: 30 minutes
  - Concurrent admin sessions: 3
  - Admin hosts: 192.168.100.0/24

Strong Authentication:
  - Minimum password length: 12 characters
  - Password complexity: Enabled
  - Account lockout: 3 failed attempts
  - Lockout duration: 30 minutes

SSH Access:
  - Enable SSH: Yes (for emergency only)
  - SSH port: 2222 (non-standard)
  - Allowed hosts: Management network only
  - Key-based authentication: Preferred</code>
        </div>

        <div class="tutorial-warning">
          <h4>⚠️ Security Best Practices</h4>
          <ul>
            <li>Change all default passwords immediately</li>
            <li>Use strong, unique passwords for all accounts</li>
            <li>Enable two-factor authentication where possible</li>
            <li>Regularly update firmware and security definitions</li>
            <li>Review firewall rules and logs regularly</li>
            <li>Implement least-privilege access principles</li>
          </ul>
        </div>

        <h3>🔧 Step 12: Backup and Maintenance</h3>
        <h4>Configuration Backup</h4>
        <div class="code-block">
          <code># Backup → Import/Export

Manual Backup:
  - Navigate to Backup & firmware
  - Select "Download backup"
  - Include: All settings
  - Encryption: Enabled
  - Password: [backup-password]

Scheduled Backup:
  - Frequency: Daily at 2:00 AM
  - Destination: SFTP server
  - Server: 192.168.20.100
  - Path: /backups/sophos/
  - Username: backup_user
  - Retention: 30 days</code>
        </div>

        <h3>📈 Performance Optimization</h3>
        <div class="code-block">
          <code># System tuning recommendations

# Enable hardware acceleration (if supported)
System → Administration → Device access
Hardware acceleration: Enabled

# Optimize scanning settings
Protect → Web → Scanning exceptions
File type exceptions:
  - .exe files > 100MB
  - Video streaming domains
  - Software update domains

# Connection optimization  
System → Administration → Device access
TCP optimization: Enabled
Connection tracking timeout: 300 seconds</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Best Practices</h4>
          <ul>
            <li>Document all configuration changes</li>
            <li>Test firewall rules in a lab environment first</li>
            <li>Implement change management procedures</li>
            <li>Regular security policy reviews</li>
            <li>Monitor performance and capacity metrics</li>
            <li>Keep firmware updated with latest patches</li>
          </ul>
        </div>

        <h3>🔍 Troubleshooting Common Issues</h3>
        <ul>
          <li><strong>Cannot access internet:</strong> Check WAN configuration and default route</li>
          <li><strong>Internal communication blocked:</strong> Review firewall rules and zone assignments</li>
          <li><strong>VPN not connecting:</strong> Verify pre-shared keys and phase settings</li>
          <li><strong>Web filtering not working:</strong> Check HTTPS inspection and certificate trust</li>
          <li><strong>High CPU usage:</strong> Review scanning settings and traffic patterns</li>
        </ul>
      </div>
    `
  },

  'fortigate-policies': {
    title: 'FortiGate firewall policy creation and management',
    category: 'firewalls',
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    content: `
      <div class="tutorial-content">
        <h2>🔥 FortiGate Firewall Policy Creation and Management</h2>
        
        <div class="tutorial-tips">
          <h4>💡 What you'll learn</h4>
          <p>Master FortiGate policy creation, management, and optimization including security policies, NAT rules, authentication policies, and advanced policy features.</p>
        </div>

        <h3>📋 Prerequisites</h3>
        <ul>
          <li>FortiGate firewall with FortiOS 7.0+ configured</li>
          <li>Basic FortiGate interface and zone configuration</li>
          <li>Understanding of network security concepts</li>
          <li>Administrative access to FortiGate GUI/CLI</li>
        </ul>

        <h3>🎯 Policy Types Overview</h3>
        <ul>
          <li><strong>IPv4 Policies:</strong> Standard traffic control policies</li>
          <li><strong>IPv6 Policies:</strong> IPv6 traffic management</li>
          <li><strong>NAT Policies:</strong> Network address translation</li>
          <li><strong>Authentication Policies:</strong> User-based access control</li>
          <li><strong>Proxy Policies:</strong> Explicit proxy configurations</li>
        </ul>

        <h3>🚀 Step 1: Basic IPv4 Policy Creation</h3>
        <h4>Via GUI</h4>
        <ol>
          <li>Navigate to <strong>Policy & Objects → Firewall Policy</strong></li>
          <li>Click <strong>Create New</strong></li>
          <li>Configure basic policy settings:
            <div class="code-block">
              <code># Basic Policy Configuration
Name: LAN_to_Internet
Incoming Interface: internal
Outgoing Interface: wan1
Source: all
Destination: all  
Service: ALL
Action: ACCEPT
NAT: Enable
Schedule: always
Log Allowed Traffic: Enable</code>
            </div>
          </li>
        </ol>

        <h4>Via CLI</h4>
        <div class="code-block">
          <code># CLI policy creation
config firewall policy
    edit 1
        set name "LAN_to_Internet"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set logtraffic all
        set comments "Allow LAN users to access internet"
    next
end</code>
        </div>

        <h3>🎯 Step 2: Advanced Policy Configuration</h3>
        <h4>Security Profiles Integration</h4>
        <div class="code-block">
          <code># Policy with security profiles
config firewall policy
    edit 10
        set name "LAN_to_Internet_Secure"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "LAN_Subnets"
        set dstaddr "all"
        set action accept
        set schedule "always" 
        set service "ALL"
        set nat enable
        set utm-status enable
        set av-profile "default"
        set webfilter-profile "default"
        set ips-sensor "default"
        set application-list "default"
        set ssl-ssh-profile "certificate-inspection"
        set logtraffic all
    next
end</code>
        </div>

        <h4>User-Based Policies</h4>
        <div class="code-block">
          <code># Authentication-based policy
config firewall policy
    edit 20
        set name "User_Internet_Access"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set groups "Domain_Users"
        set nat enable
        set utm-status enable
        set av-profile "default"
        set webfilter-profile "user_web_filter"
        set logtraffic all
        set comments "Authenticated users internet access"
    next
end</code>
        </div>

        <h3>🌐 Step 3: NAT Policy Configuration</h3>
        <h4>Source NAT (SNAT)</h4>
        <div class="code-block">
          <code># Configure source NAT
config firewall policy
    edit 5
        set name "Internal_SNAT"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "Internal_Networks"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set ippool enable
        set poolname "SNAT_Pool"
        set logtraffic disable
    next
end

# Create IP pool for SNAT
config firewall ippool
    edit "SNAT_Pool"
        set startip 203.0.113.100
        set endip 203.0.113.150
        set type overload
        set comments "Source NAT pool for internal networks"
    next
end</code>
        </div>

        <h4>Destination NAT (DNAT)</h4>
        <div class="code-block">
          <code># Configure destination NAT
config firewall vip
    edit "Web_Server_VIP"
        set extip 203.0.113.10
        set extintf "wan1"
        set mappedip "192.168.1.100"
        set portforward enable
        set extport 80
        set mappedport 80
        set comment "Web server DNAT"
    next
end

# Policy for DNAT traffic
config firewall policy
    edit 30
        set name "Web_Server_Access"
        set srcintf "wan1"
        set dstintf "internal"
        set srcaddr "all"
        set dstaddr "Web_Server_VIP"
        set action accept
        set schedule "always"
        set service "HTTP"
        set utm-status enable
        set ips-sensor "protect_servers"
        set logtraffic all
    next
end</code>
        </div>

        <h3>🔐 Step 4: Authentication Policies</h3>
        <h4>LDAP Authentication Integration</h4>
        <div class="code-block">
          <code># Configure LDAP server
config user ldap
    edit "Corporate_LDAP"
        set server "192.168.1.10"
        set cnid "cn"
        set dn "dc=company,dc=com"
        set type regular
        set username "CN=fortigate,OU=Service Accounts,DC=company,DC=com"
        set password [password]
        set secure ldaps
        set port 636
        set group-member-check user-attr
        set group-search-base "dc=company,dc=com"
    next
end

# Create user groups
config user group
    edit "IT_Staff"
        set member "Corporate_LDAP"
        config match
            edit 1
                set server-name "Corporate_LDAP"
                set group-name "CN=IT Staff,OU=Groups,DC=company,DC=com"
            next
        end
    next
    edit "Standard_Users"
        set member "Corporate_LDAP"
        config match
            edit 1
                set server-name "Corporate_LDAP"
                set group-name "CN=Domain Users,CN=Users,DC=company,DC=com"
            next
        end
    next
end</code>
        </div>

        <h4>Captive Portal Configuration</h4>
        <div class="code-block">
          <code># Configure authentication scheme
config authentication scheme
    edit "Captive_Portal"
        set method form
        set user-database "Corporate_LDAP"
        set captive-portal enable
        set captive-portal-ip 192.168.100.1
        set captive-portal-port 1000
    next
end

# Authentication rule
config authentication rule
    edit "Guest_Auth"
        set name "Guest_Auth"
        set status enable
        set protocol http https ftp telnet
        set srcintf "guest"
        set srcaddr "Guest_Network"
        set dstaddr "all"
        set groups "Guest_Users"
        set auth-timeout 28800
    next
end</code>
        </div>

        <h3>🎛️ Step 5: Application Control Policies</h3>
        <h4>Application-Based Traffic Control</h4>
        <div class="code-block">
          <code># Create application control profile
config application list
    edit "Corporate_App_Control"
        config entries
            edit 1
                set category 2
                set application 15832 15836 15840
                set action pass
                set log enable
            next
            edit 2
                set category 6
                set action block
                set log enable
            next
            edit 3
                set application 25659 40568
                set action block
                set log enable
            next
        end
        set comment "Block P2P and some social media"
    next
end

# Apply to firewall policy
config firewall policy
    edit 25
        set name "Users_App_Control"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "User_Networks"
        set dstaddr "all"
        set action accept
        set schedule "Business_Hours"
        set service "ALL"
        set groups "Standard_Users"
        set nat enable
        set application-list "Corporate_App_Control"
        set logtraffic all
    next
end</code>
        </div>

        <h3>⏰ Step 6: Time-Based Policy Control</h3>
        <h4>Create Custom Schedules</h4>
        <div class="code-block">
          <code># Create time-based schedules
config firewall schedule recurring
    edit "Business_Hours"
        set day monday tuesday wednesday thursday friday
        set start 08:00
        set end 18:00
    next
    edit "Lunch_Break"
        set day monday tuesday wednesday thursday friday
        set start 12:00
        set end 13:00
    next
    edit "After_Hours"
        set day monday tuesday wednesday thursday friday saturday sunday
        set start 18:01
        set end 07:59
    next
end

# Time-based policy example
config firewall policy
    edit 35
        set name "Social_Media_Lunch"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "User_Networks"
        set dstaddr "all"
        set action accept
        set schedule "Lunch_Break"
        set service "HTTP" "HTTPS"
        set groups "Standard_Users"
        set nat enable
        set webfilter-profile "social_media_allowed"
        set logtraffic all
        set comments "Allow social media during lunch"
    next
end</code>
        </div>

        <h3>🔍 Step 7: Policy Monitoring and Optimization</h3>
        <h4>Policy Hit Count Analysis</h4>
        <div class="code-block">
          <code># CLI commands for policy analysis
# View policy hit counts
get firewall policy

# Detailed policy statistics
diagnose firewall iprope show 100002
diagnose firewall iprope list

# Real-time policy monitoring
diagnose firewall iprope lookup 192.168.1.100 80 192.168.1.1 12345 6

# Policy usage statistics
execute log filter category traffic
execute log display</code>
        </div>

        <h4>Policy Optimization Guidelines</h4>
        <ol>
          <li><strong>Order policies by frequency:</strong> Most-used rules first</li>
          <li><strong>Use specific addresses:</strong> Avoid "all" when possible</li>
          <li><strong>Combine similar rules:</strong> Use address/service groups</li>
          <li><strong>Regular cleanup:</strong> Remove unused policies</li>
        </ol>

        <h3>📊 Step 8: Policy Troubleshooting</h3>
        <h4>Debug Commands</h4>
        <div class="code-block">
          <code># Enable policy debug
diagnose debug reset
diagnose debug flow filter addr 192.168.1.100
diagnose debug flow filter port 80
diagnose debug flow show function-name enable
diagnose debug flow show iprope enable
diagnose debug flow trace start 100
diagnose debug enable

# Test connection
# Generate traffic from client

# Stop debug
diagnose debug disable
diagnose debug reset

# Check session table
get system session list
get system session filter src 192.168.1.100

# View policy sequence
show firewall policy | grep -A5 -B5 "edit"</code>
        </div>

        <h4>Common Policy Issues</h4>
        <div class="tutorial-warning">
          <h4>⚠️ Troubleshooting Guide</h4>
          <ul>
            <li><strong>Traffic not matching policy:</strong> Check interface zones and IP ranges</li>
            <li><strong>Authentication not working:</strong> Verify LDAP connectivity and group mapping</li>
            <li><strong>NAT not functioning:</strong> Check policy order and VIP configuration</li>
            <li><strong>Application control issues:</strong> Update application database</li>
            <li><strong>Performance problems:</strong> Review policy order and UTM settings</li>
          </ul>
        </div>

        <h3>📈 Step 9: Advanced Policy Features</h3>
        <h4>Policy-Based Routing</h4>
        <div class="code-block">
          <code># Configure policy route
config router policy
    edit 1
        set input-device "internal"
        set srcaddr "192.168.10.0/24"
        set dstaddr "0.0.0.0/0"
        set output-device "wan2"
        set gateway 203.0.114.1
        set comments "Route VLAN10 traffic via WAN2"
    next
end

# Apply to firewall policy
config firewall policy
    edit 40
        set name "VLAN10_Routing"
        set srcintf "internal"
        set dstintf "wan2"
        set srcaddr "VLAN10_Network"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set comments "Policy-based routing for VLAN10"
    next
end</code>
        </div>

        <h4>Load Balancing Policies</h4>
        <div class="code-block">
          <code># Configure server load balancing
config firewall vip
    edit "Web_Farm_VIP"
        set type server-load-balance
        set extip 203.0.113.100
        set extintf "wan1"
        set server-type http
        config realservers
            edit 1
                set ip 192.168.1.101
                set port 80
                set status enable
                set weight 50
            next
            edit 2
                set ip 192.168.1.102
                set port 80
                set status enable
                set weight 50
            next
        end
        set ldb-method round-robin
        set persistence http-cookie
        set http-cookie-age 60
    next
end</code>
        </div>

        <h3>🔒 Step 10: Security Policy Best Practices</h3>
        <h4>Least Privilege Implementation</h4>
        <div class="code-block">
          <code># Example of least privilege policies

# Instead of this (too permissive):
# srcaddr "all" dstaddr "all" service "ALL"

# Use specific policies:
config firewall policy
    edit 50
        set name "Finance_Server_Access"
        set srcintf "internal"
        set dstintf "dmz"
        set srcaddr "Finance_Users"
        set dstaddr "Finance_Server"
        set action accept
        set schedule "Business_Hours"
        set service "HTTPS" "MS-SQL-S"
        set groups "Finance_Group"
        set utm-status enable
        set logtraffic all
    next
end</code>
        </div>

        <h4>Policy Documentation Template</h4>
        <div class="code-block">
          <code># Policy documentation format
Policy ID: 50
Name: Finance_Server_Access
Purpose: Allow finance users to access finance server
Source: Finance department users (192.168.10.0/24)
Destination: Finance server (192.168.20.10)
Services: HTTPS (443), MS SQL Server (1433)
Schedule: Business hours only (8 AM - 6 PM)
Authentication: Finance_Group members only
Security: Full UTM inspection enabled
Logging: All traffic logged
Approved by: IT Manager
Date created: 2024-01-15
Last modified: 2024-01-15
Review date: 2024-07-15</code>
        </div>

        <div class="tutorial-tips">
          <h4>🎯 Policy Management Best Practices</h4>
          <ul>
            <li>Document all policies with clear naming conventions</li>
            <li>Regular policy reviews and cleanup (quarterly)</li>
            <li>Use address and service groups for maintainability</li>
            <li>Implement change management procedures</li>
            <li>Test policies in lab environment before production</li>
            <li>Monitor policy hit counts and performance impact</li>
            <li>Backup configurations before making changes</li>
          </ul>
        </div>

        <h3>📋 Policy Maintenance Checklist</h3>
        <ul>
          <li>✅ Review unused policies monthly</li>
          <li>✅ Update security profiles quarterly</li>
          <li>✅ Verify authentication integration weekly</li>
          <li>✅ Analyze policy hit counts monthly</li>
          <li>✅ Test backup/restore procedures quarterly</li>
          <li>✅ Document all policy changes</li>
          <li>✅ Review logs for policy violations daily</li>
        </ul>
      </div>
    `
  }
};

// Additional firewall tutorials would continue here...
// This includes FortiGate SD-WAN, IPsec VPN, SSL VPN, LDAP, routing, CLI debugging, etc.