/* ===================================================================
   Microsoft 365 Tutorials - Properly Escaped Content
   =================================================================== */

window.MICROSOFT365_TUTORIALS = {
    'new-tenant': {
        title: 'Creating new M365 tenant for customers',
        content: `
            <div class="tutorial-content">
                <h2>Creating a New Microsoft 365 Tenant for Customers</h2>
                
                <h3>Prerequisites</h3>
                <ul>
                    <li>Microsoft Partner Center access</li>
                    <li>Customer domain information</li>
                    <li>Customer contact details</li>
                </ul>
                
                <h3>Step-by-Step Process</h3>
                
                <h4>1. Access Partner Center</h4>
                <div class="code-block">
                    <code>https://partner.microsoft.com/dashboard</code>
                </div>
                
                <h4>2. Create New Customer</h4>
                <ol>
                    <li>Navigate to Customers section</li>
                    <li>Click "Add Customer"</li>
                    <li>Enter customer details:
                        <ul>
                            <li>Company name</li>
                            <li>Contact information</li>
                            <li>Domain preferences</li>
                        </ul>
                    </li>
                </ol>
                
                <h4>3. Configure Initial Settings</h4>
                <div class="tutorial-tips">
                    <h4>💡 Best Practices</h4>
                    <ul>
                        <li>Use customer's primary domain</li>
                        <li>Set up admin accounts properly</li>
                        <li>Configure security defaults</li>
                    </ul>
                </div>
                
                <h4>4. License Assignment</h4>
                <p>Choose appropriate licenses based on customer needs:</p>
                <ul>
                    <li>Microsoft 365 Business Basic</li>
                    <li>Microsoft 365 Business Standard</li>
                    <li>Microsoft 365 Business Premium</li>
                </ul>
                
                <h3>Post-Setup Configuration</h3>
                <ol>
                    <li>Domain verification</li>
                    <li>DNS record configuration</li>
                    <li>User account creation</li>
                    <li>Security policy setup</li>
                </ol>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Important Notes</h4>
                    <p>Always verify customer domain ownership before proceeding with tenant creation.</p>
                </div>
            </div>
        `
    },
    
    'tenant-migration': {
        title: 'Tenant migration and merger procedures',
        content: `
            <div class="tutorial-content">
                <h2>Tenant Migration and Merger Procedures</h2>
                
                <h3>Overview</h3>
                <p>This guide covers the process of migrating data between Microsoft 365 tenants or merging multiple tenants.</p>
                
                <h3>Pre-Migration Planning</h3>
                <ol>
                    <li>Inventory source tenant data</li>
                    <li>Assess destination tenant capacity</li>
                    <li>Plan user migration strategy</li>
                    <li>Document current configurations</li>
                </ol>
                
                <h4>Data Assessment</h4>
                <div class="code-block">
                    <code># PowerShell command to get mailbox sizes
Get-Mailbox | Get-MailboxStatistics | Select DisplayName, TotalItemSize</code>
                </div>
                
                <h3>Migration Tools</h3>
                <ul>
                    <li>Microsoft 365 Migration tools</li>
                    <li>Third-party migration solutions</li>
                    <li>PowerShell scripts for automation</li>
                </ul>
                
                <h3>Step-by-Step Migration</h3>
                <ol>
                    <li>Prepare destination tenant</li>
                    <li>Create user accounts</li>
                    <li>Migrate mailbox data</li>
                    <li>Migrate SharePoint sites</li>
                    <li>Update DNS records</li>
                </ol>
                
                <div class="tutorial-tips">
                    <h4>💡 Migration Tips</h4>
                    <ul>
                        <li>Perform migration during off-hours</li>
                        <li>Test with pilot group first</li>
                        <li>Maintain communication with users</li>
                    </ul>
                </div>
            </div>
        `
    },
    
    'send-as-permissions': {
        title: 'Send-as permissions configuration in 365',
        content: `
            <div class="tutorial-content">
                <h2>Configuring Send-As Permissions in Microsoft 365</h2>
                
                <h3>PowerShell Method</h3>
                <div class="code-block">
                    <code># Connect to Exchange Online
Connect-ExchangeOnline

# Grant Send-As permission
Add-RecipientPermission -Identity "shared@company.com" -Trustee "user@company.com" -AccessRights SendAs

# Verify permissions
Get-RecipientPermission -Identity "shared@company.com"</code>
                </div>
                
                <h3>Admin Center Method</h3>
                <ol>
                    <li>Go to Exchange Admin Center</li>
                    <li>Navigate to Recipients > Mailboxes</li>
                    <li>Select the mailbox</li>
                    <li>Click "Manage mailbox delegation"</li>
                    <li>Add users to "Send as" permissions</li>
                </ol>
                
                <h3>Bulk Configuration</h3>
                <div class="code-block">
                    <code># CSV import for bulk permissions
$csv = Import-Csv "permissions.csv"
foreach ($row in $csv) {
    Add-RecipientPermission -Identity $row.Mailbox -Trustee $row.User -AccessRights SendAs
}</code>
                </div>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Security Considerations</h4>
                    <p>Only grant Send-As permissions to users who absolutely need them for business purposes.</p>
                </div>
            </div>
        `
    },
    
    'sharepoint-landing': {
        title: 'SharePoint Online landing page creation',
        content: `
            <div class="tutorial-content">
                <h2>Creating SharePoint Online Landing Pages</h2>
                
                <h3>Modern Page Creation</h3>
                <ol>
                    <li>Navigate to your SharePoint site</li>
                    <li>Click "New" > "Page"</li>
                    <li>Choose template or start blank</li>
                    <li>Add web parts and content</li>
                </ol>
                
                <h3>Recommended Web Parts</h3>
                <ul>
                    <li>Hero web part for featured content</li>
                    <li>News web part for announcements</li>
                    <li>Quick links for navigation</li>
                    <li>Document library for resources</li>
                </ul>
                
                <h3>Page Settings</h3>
                <div class="tutorial-tips">
                    <h4>💡 Configuration Tips</h4>
                    <ul>
                        <li>Set as homepage if needed</li>
                        <li>Configure page permissions</li>
                        <li>Enable comments if appropriate</li>
                        <li>Set up page approval workflow</li>
                    </ul>
                </div>
                
                <h3>Publishing Process</h3>
                <ol>
                    <li>Review page content</li>
                    <li>Check mobile responsiveness</li>
                    <li>Publish the page</li>
                    <li>Set as site homepage if needed</li>
                </ol>
            </div>
        `
    },
    
    'power-automate-flow': {
        title: 'Power Automate: shared mailbox to SharePoint flow',
        content: `
            <div class="tutorial-content">
                <h2>Power Automate: Shared Mailbox to SharePoint Flow</h2>
                
                <h3>Flow Overview</h3>
                <p>Create an automated flow to save email attachments from shared mailboxes to SharePoint document libraries.</p>
                
                <h3>Prerequisites</h3>
                <ul>
                    <li>Power Automate license</li>
                    <li>SharePoint site and document library</li>
                    <li>Shared mailbox access</li>
                </ul>
                
                <h3>Flow Configuration</h3>
                
                <h4>1. Trigger Setup</h4>
                <div class="code-block">
                    <code>Trigger: When a new email arrives (V3)
- Folder: Inbox
- Include Attachments: Yes
- Mailbox Address: shared@company.com</code>
                </div>
                
                <h4>2. Condition Check</h4>
                <p>Add condition to check if email has attachments:</p>
                <div class="code-block">
                    <code>Condition: length(triggerBody()?['attachments']) is greater than 0</code>
                </div>
                
                <h4>3. Apply to Each Attachment</h4>
                <ol>
                    <li>Add "Apply to each" action</li>
                    <li>Select attachments from dynamic content</li>
                    <li>Add "Create file" action for SharePoint</li>
                </ol>
                
                <h4>4. SharePoint File Creation</h4>
                <div class="code-block">
                    <code>Site Address: https://company.sharepoint.com/sites/documents
Library: Shared Documents
File Name: items('Apply_to_each')?['name']
File Content: items('Apply_to_each')?['contentBytes']</code>
                </div>
                
                <div class="tutorial-tips">
                    <h4>💡 Enhancement Ideas</h4>
                    <ul>
                        <li>Add metadata to saved files</li>
                        <li>Create folders based on email subject</li>
                        <li>Send confirmation notifications</li>
                        <li>Filter by file types</li>
                    </ul>
                </div>
            </div>
        `
    },
    
    'exchange-online-admin': {
        title: 'Exchange Online administration best practices',
        content: `
            <div class="tutorial-content">
                <h2>Exchange Online Administration Best Practices</h2>
                
                <h3>Security Configuration</h3>
                <ol>
                    <li>Enable MFA for all admin accounts</li>
                    <li>Configure ATP Safe Attachments</li>
                    <li>Set up ATP Safe Links</li>
                    <li>Enable audit logging</li>
                </ol>
                
                <h3>Mail Flow Management</h3>
                <div class="code-block">
                    <code># PowerShell commands for mail flow
# Check message trace
Get-MessageTrace -SenderAddress user@company.com

# View transport rules
Get-TransportRule

# Check connector status
Get-InboundConnector
Get-OutboundConnector</code>
                </div>
                
                <h3>Mailbox Management</h3>
                <ul>
                    <li>Regular mailbox size monitoring</li>
                    <li>Archive policy configuration</li>
                    <li>Retention policy setup</li>
                    <li>Shared mailbox optimization</li>
                </ul>
                
                <h3>Monitoring and Reporting</h3>
                <div class="tutorial-tips">
                    <h4>💡 Key Metrics to Monitor</h4>
                    <ul>
                        <li>Mail flow statistics</li>
                        <li>Mailbox growth trends</li>
                        <li>Security incident reports</li>
                        <li>User adoption metrics</li>
                    </ul>
                </div>
                
                <h3>Backup and Recovery</h3>
                <ol>
                    <li>Understand Microsoft's data retention</li>
                    <li>Implement third-party backup if needed</li>
                    <li>Test recovery procedures regularly</li>
                    <li>Document recovery processes</li>
                </ol>
                
                <div class="tutorial-warning">
                    <h4>⚠️ Important Considerations</h4>
                    <p>Microsoft 365 provides availability, not backup. Consider third-party solutions for comprehensive data protection.</p>
                </div>
            </div>
        `
    }
};