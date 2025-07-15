/* ===================================================================
   Firewall Configuration Tutorials - Comprehensive Security Management
   =================================================================== */

window.FIREWALL_TUTORIALS = {
    'fortigate-setup': {
        title: 'FortiGate setup from scratch - complete guide',
        content: `
            <div class="tutorial-content">
                <h2>FortiGate Setup from Scratch - Complete Guide</h2>
                
                <h3>Initial Setup and Access</h3>
                
                <h4>First Time Configuration</h4>
                <div class="code-block">
                    <code>Default Access:
IP Address: 192.168.1.99
Username: admin
Password: (blank)

Initial Login Steps:
1. Connect to port1 (internal)
2. Access https://192.168.1.99
3. Accept security certificate
4. Login with admin/(blank password)
5. Change default password immediately</code>
                </div>
                
                <h4>Basic Network Configuration</h4>
                <div class="code-block">
                    <code># Configure WAN interface (port1)
config system interface
    edit "port1"
        set vdom "root"
        set ip 203.0.113.10 255.255.255.248
        set allowaccess ping https ssh
        set type physical
        set description "WAN Interface"
        set role wan
    next
end

# Configure LAN interface (port2)
config system interface
    edit "port2"
        set vdom "root"
        set ip 192.168.1.1 255.255.255.0
        set allowaccess ping https ssh telnet
        set type physical
        set description "LAN Interface"
        set role lan
    next
end</code>
                </div>
                
                <h3>System Configuration</h3>
                
                <h4>Hostname and Admin Settings</h4>
                <div class="code-block">
                    <code># Set hostname and timezone
config system global
    set hostname "FortiGate-Main"
    set timezone "America/New_York"
    set admin-sport 8443
    set admin-ssh-port 2222
    set gui-theme blue
end

# Configure DNS settings
config system dns
    set primary 8.8.8.8
    set secondary 8.8.4.4
end</code>
                </div>
                
                <h4>DHCP Server Configuration</h4>
                <div class="code-block">
                    <code>config system dhcp server
    edit 1
        set dns-service default
        set default-gateway 192.168.1.1
        set netmask 255.255.255.0
        set interface "port2"
        config ip-range
            edit 1
                set start-ip 192.168.1.100
                set end-ip 192.168.1.200
            next
        end
        set timezone-option default
    next
end</code>
                </div>
                
                <h3>Security Policies</h3>
                
                <h4>Basic Firewall Policies</h4>
                <div class="code-block">
                    <code># Allow LAN to WAN access
config firewall policy
    edit 1
        set name "LAN_to_WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set comments "Allow LAN users to access internet"
    next
end

# Block specific websites
config firewall policy
    edit 2
        set name "Block_Social_Media"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "Social_Media_Sites"
        set action deny
        set schedule "work_hours"
        set service "HTTP" "HTTPS"
        set comments "Block social media during work hours"
    next
end</code>
                </div>
                
                <h4>Address Objects</h4>
                <div class="code-block">
                    <code># Create address objects
config firewall address
    edit "Server_Subnet"
        set subnet 192.168.10.0 255.255.255.0
        set comment "Server network segment"
    next
    edit "DMZ_Web_Server"
        set subnet 10.0.1.10 255.255.255.255
        set comment "Public web server"
    next
    edit "Management_VLAN"
        set subnet 192.168.100.0 255.255.255.0
        set comment "Network management VLAN"
    next
end</code>
                </div>
                
                <h3>VPN Configuration</h3>
                
                <h4>IPsec Site-to-Site VPN</h4>
                <div class="code-block">
                    <code># Phase 1 (IKE) configuration
config vpn ipsec phase1-interface
    edit "Branch_Office"
        set interface "port1"
        set peertype any
        set net-device disable
        set proposal aes128-sha256 aes256-sha256
        set dhgrp 14 5
        set remote-gw 203.0.113.50
        set psksecret "YourStrongPSK123!"
        set dpd-retryinterval 60
    next
end

# Phase 2 (IPsec) configuration
config vpn ipsec phase2-interface
    edit "Branch_Office"
        set phase1name "Branch_Office"
        set proposal aes128-sha1 aes256-sha1
        set dhgrp 14 5
        set src-subnet 192.168.1.0 255.255.255.0
        set dst-subnet 192.168.2.0 255.255.255.0
    next
end</code>
                </div>
                
                <h4>SSL VPN Configuration</h4>
                <div class="code-block">
                    <code># SSL VPN settings
config vpn ssl settings
    set servercert "Fortinet_SSL"
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set tunnel-ipv6-pools "SSLVPN_TUNNEL_IPv6_ADDR1"
    set source-interface "port1"
    set source-address "all"
    set source-address6 "all"
    set default-portal "full-access"
    set authentication-rule "ssl-vpn-rule"
end

# Create IP pool for SSL VPN
config firewall address
    edit "SSLVPN_TUNNEL_ADDR1"
        set type iprange
        set start-ip 10.212.134.200
        set end-ip 10.212.134.210
        set comment "SSL VPN tunnel addresses"
    next
end</code>
                </div>
                
                <h3>Advanced Security Features</h3>
                
                <h4>Intrusion Prevention System (IPS)</h4>
                <div class="code-block">
                    <code># Create IPS sensor
config ips sensor
    edit "default"
        config entries
            edit 1
                set location "server"
                set severity "medium" "high" "critical"
                set protocol "tcp" "udp" "icmp"
                set os "windows" "linux"
                set application "http" "smtp" "ftp"
                set action "block"
            next
        end
    next
end

# Apply IPS to firewall policy
config firewall policy
    edit 1
        set ips-sensor "default"
        set av-profile "default"
        set webfilter-profile "default"
    next
end</code>
                </div>
                
                <h4>Application Control</h4>
                <div class="code-block">
                    <code># Create application control profile
config application list
    edit "strict"
        config entries
            edit 1
                set category 2
                set action block
                set log enable
            next
            edit 2
                set application "Facebook"
                set action block
                set log enable
            next
        end
    next
end</code>
                </div>
                
                <h3>High Availability (HA)</h3>
                
                <h4>Active-Passive HA Setup</h4>
                <div class="code-block">
                    <code># HA configuration (Primary unit)
config system ha
    set group-name "FortiGate-Cluster"
    set mode a-p
    set hbdev "port3" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set session-pickup-nat enable
    set override disable
    set priority 200
    set encryption enable
    set password "HAClusterPassword123!"
end

# Monitor critical interfaces
config system ha
    set monitor "port1" "port2"
end</code>
                </div>
                
                <h3>Monitoring and Logging</h3>
                
                <h4>Log Configuration</h4>
                <div class="code-block">
                    <code># Configure syslog server
config log syslogd setting
    set status enable
    set server "192.168.1.50"
    set port 514
    set mode udp
    set facility local7
    set source-ip "192.168.1.1"
    set format default
end

# FortiAnalyzer configuration
config log fortianalyzer setting
    set status enable
    set server "192.168.1.51"
    set source-ip "192.168.1.1"
    set upload-option realtime
end</code>
                </div>
                
                <h3>Backup and Maintenance</h3>
                
                <h4>Configuration Backup</h4>
                <div class="code-block">
                    <code># CLI backup command
execute backup config ftp backup-config.conf 192.168.1.100 admin password

# Automatic backup via script
config system auto-script
    edit "daily-backup"
        set interval 86400
        set repeat 0
        set source script
        set script "execute backup config ftp daily-backup.conf 192.168.1.100 backup backuppass"
    next
end</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Best Practices</h4>
                    <ul>
                        <li>Always change default passwords</li>
                        <li>Enable two-factor authentication for admins</li>
                        <li>Regular firmware updates</li>
                        <li>Monitor system resources and logs</li>
                        <li>Test backup and restore procedures</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Notes</h4>
                    <p>Always test configuration changes in a lab environment first. Keep configuration backups current and secure.</p>
                </div>
            </div>
        `
    },
    
    'fortigate-policies': {
        title: 'FortiGate firewall policy creation and management',
        content: `
            <div class="tutorial-content">
                <h2>FortiGate Firewall Policy Creation and Management</h2>
                
                <h3>Policy Structure Overview</h3>
                
                <h4>Policy Components</h4>
                <ul>
                    <li>Source interface and destination interface</li>
                    <li>Source addresses and destination addresses</li>
                    <li>Services and schedules</li>
                    <li>Action (accept, deny, IPsec)</li>
                    <li>Security profiles and logging</li>
                </ul>
                
                <h3>Basic Policy Creation</h3>
                
                <h4>Allow Internet Access Policy</h4>
                <div class="code-block">
                    <code>config firewall policy
    edit 10
        set name "LAN_to_Internet"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "LAN_Subnet"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set logtraffic all
        set comments "Allow LAN users internet access"
    next
end</code>
                </div>
                
                <h4>Server Access Policy</h4>
                <div class="code-block">
                    <code>config firewall policy
    edit 20
        set name "Internet_to_WebServer"
        set srcintf "wan1"
        set dstintf "dmz"
        set srcaddr "all"
        set dstaddr "WebServer_VIP"
        set action accept
        set schedule "always"
        set service "HTTP" "HTTPS"
        set logtraffic all
        set av-profile "default"
        set ips-sensor "protect_server"
        set comments "Allow internet access to web server"
    next
end</code>
                </div>
                
                <h3>Advanced Policy Features</h3>
                
                <h4>Time-Based Policies</h4>
                <div class="code-block">
                    <code># Create schedule object
config firewall schedule recurring
    edit "Business_Hours"
        set day monday tuesday wednesday thursday friday
        set start 08:00
        set end 18:00
    next
end

# Apply schedule to policy
config firewall policy
    edit 30
        set name "Block_Social_Media"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "Staff_Computers"
        set dstaddr "Social_Media_Sites"
        set action deny
        set schedule "Business_Hours"
        set service "HTTP" "HTTPS"
        set logtraffic all
    next
end</code>
                </div>
                
                <h4>User-Based Policies</h4>
                <div class="code-block">
                    <code># Configure user authentication
config user local
    edit "john.doe"
        set type password
        set passwd "SecurePassword123!"
    next
end

config user group
    edit "IT_Staff"
        set member "john.doe"
    next
end

# Create user-based policy
config firewall policy
    edit 40
        set name "IT_Admin_Access"
        set srcintf "internal"
        set dstintf "dmz"
        set srcaddr "all"
        set dstaddr "Server_Subnet"
        set action accept
        set schedule "always"
        set service "SSH" "RDP" "HTTPS"
        set groups "IT_Staff"
        set logtraffic all
    next
end</code>
                </div>
                
                <h3>Security Profiles Integration</h3>
                
                <h4>Antivirus Profile</h4>
                <div class="code-block">
                    <code>config antivirus profile
    edit "strict-av"
        config http
            set options scan avmonitor
            set archive-block encrypted
        end
        config ftp
            set options scan avmonitor
        end
        config smtp
            set options scan avmonitor
        end
    next
end</code>
                </div>
                
                <h4>Web Filtering Profile</h4>
                <div class="code-block">
                    <code>config webfilter profile
    edit "corporate-filter"
        config web
            set blacklist enable
            set bword-threshold 10
            set bword-table 1
        end
        config ftgd-wf
            config filters
                edit 1
                    set category 26
                    set action block
                next
                edit 2
                    set category 61
                    set action block
                next
            end
        end
    next
end</code>
                </div>
                
                <h3>Policy Ordering and Optimization</h3>
                
                <h4>Policy Sequence Best Practices</h4>
                <div class="tutorial-tips">
                    <h4>💡 Policy Ordering Guidelines</h4>
                    <ul>
                        <li>Most specific policies first (smaller address ranges)</li>
                        <li>Deny policies before allow policies</li>
                        <li>High-traffic policies earlier in the list</li>
                        <li>Use policy lookup optimization</li>
                    </ul>
                </div>
                
                <h4>Policy Consolidation</h4>
                <div class="code-block">
                    <code># Instead of multiple similar policies, use address groups
config firewall addrgrp
    edit "Internal_Subnets"
        set member "LAN_Subnet" "VLAN_10" "VLAN_20"
    next
end

config firewall policy
    edit 50
        set name "Internal_to_Internet"
        set srcintf "internal"
        set dstintf "wan1"
        set srcaddr "Internal_Subnets"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end</code>
                </div>
                
                <h3>Virtual IPs and Load Balancing</h3>
                
                <h4>Virtual IP Configuration</h4>
                <div class="code-block">
                    <code>config firewall vip
    edit "WebServer_VIP"
        set extip 203.0.113.10
        set extintf "wan1"
        set mappedip "192.168.1.100"
        set portforward enable
        set extport 80-80
        set mappedport 80-80
    next
end

config firewall vip
    edit "LoadBalancer_VIP"
        set extip 203.0.113.11
        set extintf "wan1"
        set type server-load-balance
        set ldb-method round-robin
        config realservers
            edit 1
                set ip 192.168.1.101
                set port 80
            next
            edit 2
                set ip 192.168.1.102
                set port 80
            next
        end
    next
end</code>
                </div>
                
                <h3>Policy Troubleshooting</h3>
                
                <h4>Debug Commands</h4>
                <div class="code-block">
                    <code># Flow debugging
diagnose debug flow filter addr 192.168.1.100
diagnose debug flow show console enable
diagnose debug flow trace start 100
diagnose debug enable

# Policy lookup
get router info routing-table details 8.8.8.8
diagnose firewall iprope lookup 192.168.1.100 8.8.8.8 tcp 80

# Policy hit count
diagnose firewall iprope show 100001

# Reset debug
diagnose debug disable
diagnose debug flow trace stop
diagnose debug flow filter clear</code>
                </div>
                
                <h4>Policy Monitoring</h4>
                <div class="code-block">
                    <code># View policy statistics
get firewall policy
get system status
get system performance status

# Monitor real-time sessions
get system session list
get system session info

# Log analysis
execute log filter category traffic
execute log display</code>
                </div>
                
                <h3>Policy Templates and Best Practices</h3>
                
                <h4>Common Policy Templates</h4>
                <div class="code-block">
                    <code># DMZ Server Protection Template
config firewall policy
    edit [ID]
        set name "[Server_Name]_Protection"
        set srcintf "wan1"
        set dstintf "dmz"
        set srcaddr "all"
        set dstaddr "[Server_VIP]"
        set action accept
        set schedule "always"
        set service "[Required_Services]"
        set av-profile "default"
        set ips-sensor "protect_server"
        set application-list "block_p2p"
        set logtraffic all
        set comments "Protected access to [Server_Name]"
    next
end</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Policy Management Tips</h4>
                    <p>Always test policy changes in maintenance windows. Use policy simulation before implementation. Document all policy changes.</p>
                </div>
            </div>
        `
    },
    
    'sophos-setup': {
        title: 'Sophos firewall initial setup and configuration',
        content: `
            <div class="tutorial-content">
                <h2>Sophos Firewall Initial Setup and Configuration</h2>
                
                <h3>Initial Access and Setup</h3>
                
                <h4>First Time Login</h4>
                <div class="code-block">
                    <code>Default Access Details:
IP Address: 192.168.1.1 (Port 3 - LAN)
Web Console: https://192.168.1.1:4444
Username: admin
Password: admin

Initial Setup Checklist:
1. Connect to LAN port
2. Access web console
3. Accept EULA and change password
4. Complete setup wizard
5. Configure basic network settings</code>
                </div>
                
                <h4>Setup Wizard Configuration</h4>
                <ol>
                    <li>Set new admin password (minimum 8 characters)</li>
                    <li>Configure WAN interface settings</li>
                    <li>Set internal network addressing</li>
                    <li>Configure DNS settings</li>
                    <li>Select deployment mode (Bridge/Route)</li>
                </ol>
                
                <h3>Network Configuration</h3>
                
                <h4>Interface Configuration</h4>
                <div class="code-block">
                    <code>WAN Interface Setup:
Network > Interfaces > Edit Port1 (WAN)
- Zone: WAN
- IPv4 Configuration: Static/DHCP/PPPoE
- IP Address: [ISP provided]
- Gateway: [ISP gateway]
- DNS: 8.8.8.8, 8.8.4.4

LAN Interface Setup:
Network > Interfaces > Edit Port3 (LAN)
- Zone: LAN
- IPv4 Configuration: Static
- IP Address: 192.168.1.1/24
- DHCP Server: Enable</code>
                </div>
                
                <h4>DHCP Server Configuration</h4>
                <div class="code-block">
                    <code>Network > DHCP > Add DHCP Server
General Settings:
- Interface: LAN (Port3)
- Start IP: 192.168.1.100
- End IP: 192.168.1.200
- Lease Time: 24 hours

Advanced Settings:
- DNS Servers: 192.168.1.1
- Domain Name: company.local
- Default Gateway: 192.168.1.1
- WINS Server: (if required)</code>
                </div>
                
                <h3>Firewall Rules</h3>
                
                <h4>Basic Traffic Rules</h4>
                <div class="code-block">
                    <code>Protect > Firewall Rules > IPv4

Default LAN to WAN Rule:
- Rule Name: LAN to WAN
- Source Zone: LAN
- Destination Zone: WAN
- Source Network: Any
- Destination Network: Any
- Service: Any
- Action: Allow

Inbound Server Access:
- Rule Name: Web Server Access
- Source Zone: WAN
- Destination Zone: LAN
- Source Network: Any
- Destination Network: Web_Server_Host
- Service: HTTP, HTTPS
- Action: Allow</code>
                </div>
                
                <h4>NAT Policies</h4>
                <div class="code-block">
                    <code>Network > NAT Policies

Source NAT (Masquerading):
- Original Source: LAN_Network
- Translated Source: WAN_Interface
- Original Destination: Any
- Original Service: Any

Destination NAT (Port Forwarding):
- Original Source: Any
- Original Destination: WAN_Interface
- Translated Destination: Internal_Server
- Original Service: HTTP (80)
- Translated Service: HTTP (80)</code>
                </div>
                
                <h3>Web Protection</h3>
                
                <h4>Web Policy Configuration</h4>
                <div class="code-block">
                    <code>Protect > Web > General Settings
Enable Web Protection: Yes
Scan HTTPS: Yes
Block Unrecognized SSL: No

Protect > Web > Policy
Create Web Policy:
- Policy Name: Corporate_Web_Policy
- Source Zone: LAN
- Source Network: Any
- Destination Zone: WAN
- Web Category Action:
  * Business: Allow
  * Social Networking: Block
  * Adult Content: Block
  * Malware Sites: Block</code>
                </div>
                
                <h4>Application Control</h4>
                <div class="code-block">
                    <code>Protect > Application > Application Filter

Create Application Policy:
- Policy Name: Standard_App_Control
- Source Zone: LAN
- Applications to Block:
  * Peer-to-Peer
  * Gaming
  * Streaming Media (optional)
  * File Sharing
- Applications to Allow:
  * Business Applications
  * Web Browsing
  * Email</code>
                </div>
                
                <h3>VPN Configuration</h3>
                
                <h4>SSL VPN Setup</h4>
                <div class="code-block">
                    <code>VPN > SSL VPN > Settings
General Settings:
- Enable SSL VPN: Yes
- Hostname: vpn.company.com
- Port: 443
- Interface: WAN

Authentication:
- Authentication Mode: Local Users
- Fallback to Local: Yes

IP Pool:
- Start IP: 10.10.10.100
- End IP: 10.10.10.199
- DNS Server: 192.168.1.1</code>
                </div>
                
                <h4>IPsec Site-to-Site VPN</h4>
                <div class="code-block">
                    <code>VPN > IPsec Connections > Add

Connection Settings:
- Name: Branch_Office_VPN
- Gateway Type: Respond Only / Initiate
- Gateway: [Remote Public IP]
- Authentication Type: Preshared Key
- Preshared Key: [Strong PSK]

Encryption:
- IKE Encryption: AES-256
- IKE Authentication: SHA-256
- IKE DH Group: Group 14
- ESP Encryption: AES-256
- ESP Authentication: SHA-256</code>
                </div>
                
                <h3>User Management</h3>
                
                <h4>Local User Creation</h4>
                <div class="code-block">
                    <code>Authentication > Users > Add

User Details:
- Username: john.doe
- Name: John Doe
- Email: john.doe@company.com
- Password: [Strong Password]
- Confirm Password: [Same Password]

Group Membership:
- Primary Group: Users
- Additional Groups: VPN_Users

Access Settings:
- Login restriction: Any time
- Simultaneous logins: 3</code>
                </div>
                
                <h3>Security Services</h3>
                
                <h4>Intrusion Prevention</h4>
                <div class="code-block">
                    <code>Protect > Intrusion Prevention > Settings
IPS Engine: Enable
Operating Mode: Prevention

Protect > Intrusion Prevention > Policies
Create IPS Policy:
- Policy Name: Server_Protection
- Source Zone: WAN
- Destination Zone: DMZ
- Severity: High, Critical
- Target: Server
- Action: Drop and Log</code>
                </div>
                
                <h4>Antivirus Configuration</h4>
                <div class="code-block">
                    <code>Protect > Antivirus > Settings
Antivirus Engine: Enable
Cloud Lookup: Enable
Heuristic Detection: Enable

Protect > Antivirus > Policies
Create Antivirus Policy:
- Policy Name: Email_AV_Scan
- Source Zone: WAN
- Destination Zone: LAN
- Services: SMTP, POP3, IMAP
- Action: Quarantine infected files</code>
                </div>
                
                <h3>Monitoring and Reporting</h3>
                
                <h4>Log Configuration</h4>
                <div class="code-block">
                    <code>Administration > Device Access > Admin Settings
Log Settings:
- Log Level: Information
- Log Facility: Local Disk
- Syslog Server: 192.168.1.50
- Log Categories:
  * Firewall
  * Authentication  
  * System
  * VPN</code>
                </div>
                
                <h4>Reports Setup</h4>
                <div class="code-block">
                    <code>Reports > Report Settings
Email Report Configuration:
- SMTP Server: mail.company.com
- From Address: firewall@company.com
- Recipients: admin@company.com

Scheduled Reports:
- Web Usage Report: Daily
- Security Report: Weekly
- Traffic Report: Monthly
- Executive Summary: Monthly</code>
                </div>
                
                <h3>High Availability</h3>
                
                <h4>HA Configuration</h4>
                <div class="code-block">
                    <code>System > High Availability
HA Mode: Active-Passive
Appliance Priority: Higher (Primary) / Lower (Secondary)
Dedicated HA Link: Port4
Heartbeat Interval: 1000ms
Dead Interval: 3000ms

Monitor Interfaces:
- WAN (Port1): Enable
- LAN (Port3): Enable
- Optional (Port2): Enable

Synchronization:
- Configuration Sync: Enable
- Session Sync: Enable</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Initial Configuration Tips</h4>
                    <ul>
                        <li>Always backup configuration after major changes</li>
                        <li>Test internet connectivity before implementing restrictions</li>
                        <li>Configure SNTP for accurate logging timestamps</li>
                        <li>Set up email notifications for critical alerts</li>
                        <li>Enable automatic license updates</li>
                    </ul>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Hardening</h4>
                    <p>Change all default passwords, disable unused services, restrict admin access to specific IPs, and enable two-factor authentication.</p>
                </div>
            </div>
        `
    }
};