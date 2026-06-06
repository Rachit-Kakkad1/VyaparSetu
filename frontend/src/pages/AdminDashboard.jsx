import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, UserCheck, ShieldAlert, FileText, LogOut, 
  Search, Plus, Trash2, CheckCircle2, AlertTriangle, Activity, 
  Database, Cpu, HardDrive, BarChart3, TrendingUp, DollarSign, 
  Package, X, Shield, RefreshCw, Settings 
} from 'lucide-react'

function AdminDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'users' | 'vendors' | 'pipeline' | 'logs'
  const [pipelineSubTab, setPipelineSubTab] = useState('rfqs') // 'rfqs' | 'bids' | 'pos' | 'invoices'
  

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserRole, setNewUserRole] = useState('officer') // 'officer' | 'manager'
  const [newUserPassword, setNewUserPassword] = useState('')
  const [adminProfile, setAdminProfile] = useState({ name: 'Super Admin', email: 'admin@vyapar.gov', phone: '+91 98765 43210' })
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  // Mock Databases (State-based so user changes are reactive)
  const [users, setUsers] = useState([
    { id: 1, name: 'Admin Account', email: 'admin@vyaparsetu.com', role: 'admin', status: 'Active', created: '2026-05-10' },
    { id: 2, name: 'Rohan Sharma', email: 'officer@vyaparsetu.com', role: 'officer', status: 'Active', created: '2026-05-12' },
    { id: 3, name: 'Sarah Jenkins', email: 'manager@vyaparsetu.com', role: 'manager', status: 'Active', created: '2026-05-15' },
    { id: 4, name: 'Vikram Patel', email: 'officer2@vyaparsetu.com', role: 'officer', status: 'Active', created: '2026-05-20' },
    { id: 5, name: 'Ananya Roy', email: 'manager2@vyaparsetu.com', role: 'manager', status: 'Deactivated', created: '2026-05-22' }
  ])

  const [vendors, setVendors] = useState([
    { id: 1, company: 'Acme Supplies Ltd', contact: 'John Doe', email: 'vendor@vyaparsetu.com', phone: '+91 98765 43210', gst: '27ABCDE1234F1Z0', status: 'Approved', joined: '2026-05-11' },
    { id: 2, company: 'Global Parts Co.', contact: 'Alice Smith', email: 'globalparts@corp.com', phone: '+1 (555) 345-6789', gst: '07GHIJK5678L2Z3', status: 'Pending', joined: '2026-06-02' },
    { id: 3, company: 'SteelCorp Industries', contact: 'Marc Vande', email: 'steelcorp@industries.com', phone: '+91 87654 32109', gst: '08MNOPQ9012R3Z4', status: 'Approved', joined: '2026-05-25' },
    { id: 4, company: 'TechSystems Solutions', contact: 'David Lee', email: 'techsystems@solutions.com', phone: '+91 76543 21098', gst: '19STUVW3456X4Z5', status: 'Deactivated', joined: '2026-05-18' }
  ])

  const [rfqs, setRfqs] = useState([
    { id: 'RFQ-2026-001', title: 'Supply of 500 Tons Structural Steel', creator: 'officer@vyaparsetu.com', bidsCount: 3, status: 'Open', date: '2026-06-01' },
    { id: 'RFQ-2026-002', title: 'Procurement of High-Grade Brass Valves', creator: 'officer2@vyaparsetu.com', bidsCount: 5, status: 'Closed', date: '2026-05-28' },
    { id: 'RFQ-2026-003', title: 'IT Equipment & Workspace Upgrade', creator: 'officer@vyaparsetu.com', bidsCount: 2, status: 'Under Review', date: '2026-06-04' }
  ])

  const [bids, setBids] = useState([
    { id: 'BID-101', rfq: 'RFQ-2026-001', vendor: 'SteelCorp Industries', amount: 145000, status: 'Under Review', date: '2026-06-02' },
    { id: 'BID-102', rfq: 'RFQ-2026-001', vendor: 'Global Parts Co.', amount: 138000, status: 'Under Review', date: '2026-06-03' },
    { id: 'BID-103', rfq: 'RFQ-2026-002', vendor: 'Acme Supplies Ltd', amount: 42500, status: 'Accepted', date: '2026-05-29' },
    { id: 'BID-104', rfq: 'RFQ-2026-002', vendor: 'Global Parts Co.', amount: 45000, status: 'Rejected', date: '2026-05-30' }
  ])

  const [pos, setPos] = useState([
    { id: 'PO-2026-01', rfqRef: 'RFQ-2026-002', vendor: 'Acme Supplies Ltd', amount: 42500, approver: 'manager@vyaparsetu.com', status: 'Approved', date: '2026-05-30' },
    { id: 'PO-2026-02', rfqRef: 'RFQ-2026-001', vendor: 'Global Parts Co.', amount: 138000, approver: 'Pending Manager', status: 'Pending Approval', date: '2026-06-04' }
  ])

  const [invoices, setInvoices] = useState([
    { id: 'INV-9901', poRef: 'PO-2026-01', vendor: 'Acme Supplies Ltd', amount: 42500, status: 'Paid', date: '2026-06-01' },
    { id: 'INV-9902', poRef: 'PO-2026-02', vendor: 'Global Parts Co.', amount: 138000, status: 'Pending', date: '2026-06-05' }
  ])

  const [logs, setLogs] = useState([
    { id: 1, timestamp: '2026-06-06 11:32:05', actor: 'admin@vyaparsetu.com', action: 'Created Manager Account: manager2@vyaparsetu.com', severity: 'Info' },
    { id: 2, timestamp: '2026-06-06 10:15:22', actor: 'globalparts@corp.com', action: 'Submitted Bid-102 for RFQ-2026-001 ($138,000)', severity: 'Info' },
    { id: 3, timestamp: '2026-06-06 09:44:10', actor: 'SYSTEM', action: 'Database pool connection threshold exceeded 80%', severity: 'Warning' },
    { id: 4, timestamp: '2026-06-06 08:30:15', actor: 'SYSTEM', action: 'Failed sign-in attempt from IP: 192.168.1.104', severity: 'Warning' },
    { id: 5, timestamp: '2026-06-06 07:00:00', actor: 'SYSTEM', action: 'Automated database verification and S3 backup completed', severity: 'Info' }
  ])

  // Search filter states
  const [usersSearch, setUsersSearch] = useState('')
  const [vendorsSearch, setVendorsSearch] = useState('')
  const [logsSearch, setLogsSearch] = useState('')
  const [logsFilter, setLogsFilter] = useState('All') // 'All' | 'Info' | 'Warning' | 'Critical'



  // User database functions
  const handleToggleUserStatus = (userId) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId && user.role !== 'admin') {
        const nextStatus = user.status === 'Active' ? 'Deactivated' : 'Active'
        // Log action
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'admin@vyaparsetu.com',
          action: `${nextStatus === 'Active' ? 'Activated' : 'Deactivated'} User Account: ${user.email}`,
          severity: nextStatus === 'Active' ? 'Info' : 'Warning'
        }
        setLogs(prevLogs => [newLog, ...prevLogs])
        return { ...user, status: nextStatus }
      }
      return user
    }))
  }

  const handleCreateUserSubmit = (e) => {
    e.preventDefault()
    if (!newUserName || !newUserEmail || !newUserPassword) return

    const newUser = {
      id: Date.now(),
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      status: 'Active',
      password: newUserPassword,
      created: new Date().toISOString().split('T')[0]
    }

    setUsers(prevUsers => [...prevUsers, newUser])
    
    // Log action
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'admin@vyaparsetu.com',
      action: `Created ${newUserRole === 'manager' ? 'Manager' : 'Procurement Officer'} Account: ${newUserEmail}`,
      severity: 'Info'
    }
    setLogs(prevLogs => [newLog, ...prevLogs])

    // Reset Form fields
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPhone('')
    setNewUserRole('officer')
    setNewUserPassword('')
    setShowAddUserModal(false)
  }

  // Vendor database functions
  const handleVendorStatusChange = (vendorId, newStatus) => {
    setVendors(prevVendors => prevVendors.map(vendor => {
      if (vendor.id === vendorId) {
        // Log action
        const newLog = {
          id: Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'admin@vyaparsetu.com',
          action: `Set vendor status of ${vendor.company} to ${newStatus}`,
          severity: newStatus === 'Approved' ? 'Info' : 'Warning'
        }
        setLogs(prevLogs => [newLog, ...prevLogs])
        return { ...vendor, status: newStatus }
      }
      return vendor
    }))
  }

  // Filtered databases
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
    user.role.toLowerCase().includes(usersSearch.toLowerCase())
  )

  const filteredVendors = vendors.filter(vendor => 
    vendor.company.toLowerCase().includes(vendorsSearch.toLowerCase()) ||
    vendor.contact.toLowerCase().includes(vendorsSearch.toLowerCase()) ||
    vendor.gst.toLowerCase().includes(vendorsSearch.toLowerCase())
  )

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logsSearch.toLowerCase()) ||
                          log.actor.toLowerCase().includes(logsSearch.toLowerCase())
    const matchesSeverity = logsFilter === 'All' || log.severity === logsFilter
    return matchesSearch && matchesSeverity
  })

  // Calculations for summary stats
  const totalRegisteredUsers = users.length
  const totalApprovedVendors = vendors.filter(v => v.status === 'Approved').length
  const totalActiveRFQs = rfqs.filter(r => r.status === 'Open').length
  const totalPendingPOs = pos.filter(p => p.status === 'Pending Approval').length

  return (
    <div className="dashboard-layout">
      {/* 1. Left Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/images/logo_vyapar.png" alt="VS" className="brand-icon" style={{ background: 'transparent', padding: 0, width: '64px', height: 'auto' }} />
          <div className="brand-details">
            <span className="brand-name">VyaparSetu</span>
            <span className="brand-role">Admin Control Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview & Monitor</span>
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            <span>Manage Users</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => setActiveTab('vendors')}
          >
            <UserCheck size={18} />
            <span>Manage Vendors</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <FileText size={18} />
            <span>Procurement Pipeline</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <ShieldAlert size={18} />
            <span>Activity Logs</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          {/* Theme switcher inside dashboard */}
          <button className="dashboard-theme-toggle" onClick={toggleDarkMode}>
            <RefreshCw size={14} />
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <div className="admin-profile-card" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">AD</div>
            <div className="profile-info">
              <span className="profile-name">{adminProfile.name}</span>
              <span className="profile-email">{adminProfile.email}</span>
            </div>
            <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onNavigate('landing'); }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Canvas */}
      <main className="dashboard-main">
        {/* Header Bar */}
        <header className="dashboard-header">
          <div className="header-title-box">
            <h1>
              {activeTab === 'overview' && 'System Health & Analytics'}
              {activeTab === 'users' && 'Access & Account Directory'}
              {activeTab === 'vendors' && 'Onboarded Suppliers Verification'}
              {activeTab === 'pipeline' && 'System Documents Repository'}
              {activeTab === 'logs' && 'Security Auditing Trails'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'overview' && 'Real-time telemetry and supply chain statistics overview.'}
              {activeTab === 'users' && 'Manage administrator, manager, and procurement officer accounts.'}
              {activeTab === 'vendors' && 'Verify and validate supplier credentials and tax profiles.'}
              {activeTab === 'pipeline' && 'Audit transactions across RFQs, Bids, Purchase Orders, and Payments.'}
              {activeTab === 'logs' && 'Immutable ledger of all events, alerts, and transaction records.'}
            </p>
          </div>

          <div className="system-indicator-badge">
            <span className="indicator-pulse"></span>
            <span>Live Sync Active</span>
          </div>
        </header>

        {/* Dynamic Tab Body rendering */}
        <div className="dashboard-body">
          
          {/* TAB 1: OVERVIEW & MONITORING */}
          {activeTab === 'overview' && (
            <div className="tab-pane-fade">
{/* KPI Cards Grid */}
              <section className="stats-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Global Accounts</span>
                    <Users size={16} className="kpi-icon-grey" />
                  </div>
                  <span className="kpi-value">{totalRegisteredUsers}</span>
                  <div className="kpi-footer text-green">
                    <TrendingUp size={12} />
                    <span>+12% vs last month</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Verified Vendors</span>
                    <UserCheck size={16} className="kpi-icon-grey" />
                  </div>
                  <span className="kpi-value">{totalApprovedVendors}</span>
                  <div className="kpi-footer text-green">
                    <TrendingUp size={12} />
                    <span>+3 new approval requests</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Active RFQs</span>
                    <Package size={16} className="kpi-icon-grey" />
                  </div>
                  <span className="kpi-value">{totalActiveRFQs}</span>
                  <div className="kpi-footer text-secondary">
                    <span>5 items closed today</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Pending PO Approval</span>
                    <DollarSign size={16} className="kpi-icon-grey" />
                  </div>
                  <span className="kpi-value">{totalPendingPOs}</span>
                  <div className="kpi-footer text-orange">
                    <AlertTriangle size={12} />
                    <span>Awaiting Manager release</span>
                  </div>
                </div>
              </section>

              {/* Analytics Graph Block */}
              <section className="analytics-visuals-section">
                <div className="analytics-graph-card">
                  <div className="card-header-box">
                    <h3>Procurement & Bid Volume Overview</h3>
                    <p>Aggregated supply chain throughput trends over the last quarter.</p>
                  </div>
                  
                  {/* Custom Styled SVG Area Chart representing RFQs and Bids */}
                  <div className="svg-chart-container">
                    <svg viewBox="0 0 800 240" className="dashboard-svg-chart">
                      <defs>
                        <linearGradient id="rfq-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="50" y1="30" x2="750" y2="30" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="50" y1="90" x2="750" y2="90" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="50" y1="150" x2="750" y2="150" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="50" y1="210" x2="750" y2="210" stroke="var(--border-color)" strokeWidth="1.5" />

                      {/* Area Fill */}
                      <path 
                        d="M 50 210 Q 150 170 250 130 T 450 110 T 650 60 T 750 210 Z" 
                        fill="url(#rfq-grad)"
                      />

                      {/* Line Paths */}
                      <path 
                        d="M 50 210 Q 150 170 250 130 T 450 110 T 650 60 T 750 50" 
                        fill="none" 
                        stroke="var(--accent-color)" 
                        strokeWidth="3.5" 
                        strokeLinecap="round"
                      />

                      {/* Chart Dots */}
                      <circle cx="250" cy="130" r="5" fill="var(--accent-color)" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="450" cy="110" r="5" fill="var(--accent-color)" stroke="#FFF" strokeWidth="1.5" />
                      <circle cx="650" cy="60" r="5" fill="var(--accent-color)" stroke="#FFF" strokeWidth="1.5" />

                      {/* Axis Labels */}
                      <text x="50" y="230" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">March</text>
                      <text x="250" y="230" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">April</text>
                      <text x="450" y="230" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">May</text>
                      <text x="650" y="230" fill="var(--text-secondary)" fontSize="11" textAnchor="middle">June</text>
                    </svg>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search name, email, or role..." 
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </div>
                
                <button className="btn btn-primary add-user-btn" onClick={() => setShowAddUserModal(true)}>
                  <Plus size={16} /> Add Administrative User
                </button>
              </div>

              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge-label role-${user.role}`}>
                            {user.role === 'admin' ? 'Super Admin' : user.role === 'manager' ? 'Manager' : 'Procurement Officer'}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge-dot ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.created}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {user.role !== 'admin' ? (
                              <>
                                <button 
                                  className="action-btn edit-settings-btn"
                                  onClick={() => setEditingUser(user)}
                                  title="Configure User Details"
                                >
                                  <Settings size={14} /> Settings
                                </button>
                                <button 
                                  className={`action-btn-link ${user.status === 'Active' ? 'deactivate' : 'activate'}`}
                                  onClick={() => handleToggleUserStatus(user.id)}
                                >
                                  {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                              </>
                            ) : (
                              <span className="action-disabled">System Lock</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE VENDORS */}
          {activeTab === 'vendors' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search company, contact person, or GST..." 
                    value={vendorsSearch}
                    onChange={(e) => setVendorsSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th>GST Number</th>
                      <th>Contact Details</th>
                      <th>Status</th>
                      <th>Onboarded Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td>
                          <div>
                            <strong>{vendor.company}</strong>
                            <div className="subtext-mute">{vendor.contact}</div>
                          </div>
                        </td>
                        <td><code>{vendor.gst}</code></td>
                        <td>
                          <div>{vendor.email}</div>
                          <div className="subtext-mute">{vendor.phone}</div>
                        </td>
                        <td>
                          <span className={`vendor-status-label status-${vendor.status.toLowerCase()}`}>
                            {vendor.status}
                          </span>
                        </td>
                        <td>{vendor.joined}</td>
                        <td>
                          <div className="action-btn-group">
                            {vendor.status === 'Pending' && (
                              <button 
                                className="action-btn approve-btn"
                                onClick={() => handleVendorStatusChange(vendor.id, 'Approved')}
                              >
                                <CheckCircle2 size={14} /> Approve
                              </button>
                            )}
                            {vendor.status === 'Approved' && (
                              <button 
                                className="action-btn deactivate-btn"
                                onClick={() => handleVendorStatusChange(vendor.id, 'Deactivated')}
                              >
                                Deactivate
                              </button>
                            )}
                            {vendor.status === 'Deactivated' && (
                              <button 
                                className="action-btn approve-btn"
                                onClick={() => handleVendorStatusChange(vendor.id, 'Approved')}
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROCUREMENT PIPELINE */}
          {activeTab === 'pipeline' && (
            <div className="tab-pane-fade">
              {/* Inner Sub-navigation Tabs */}
              <div className="pipeline-sub-nav">
                <button 
                  className={`sub-nav-item ${pipelineSubTab === 'rfqs' ? 'active' : ''}`}
                  onClick={() => setPipelineSubTab('rfqs')}
                >
                  Request For Quotes (RFQs)
                </button>
                <button 
                  className={`sub-nav-item ${pipelineSubTab === 'bids' ? 'active' : ''}`}
                  onClick={() => setPipelineSubTab('bids')}
                >
                  Bids & Quotations
                </button>
                <button 
                  className={`sub-nav-item ${pipelineSubTab === 'pos' ? 'active' : ''}`}
                  onClick={() => setPipelineSubTab('pos')}
                >
                  Purchase Orders (POs)
                </button>
                <button 
                  className={`sub-nav-item ${pipelineSubTab === 'invoices' ? 'active' : ''}`}
                  onClick={() => setPipelineSubTab('invoices')}
                >
                  Payment Invoices
                </button>
              </div>

              {/* RFQ Sub-tab contents */}
              {pipelineSubTab === 'rfqs' && (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>RFQ ID</th>
                        <th>Project Name / Title</th>
                        <th>Creator Officer</th>
                        <th>Bids Count</th>
                        <th>Creation Date</th>
                        <th>Lifecycle Stage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfqs.map(rfq => (
                        <tr key={rfq.id}>
                          <td><code>{rfq.id}</code></td>
                          <td><strong>{rfq.title}</strong></td>
                          <td>{rfq.creator}</td>
                          <td>
                            <span className="count-indicator">{rfq.bidsCount} responses</span>
                          </td>
                          <td>{rfq.date}</td>
                          <td>
                            <span className={`pipeline-stage-badge stage-${rfq.status.toLowerCase().replace(' ', '-')}`}>
                              {rfq.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quotations/Bids Sub-tab contents */}
              {pipelineSubTab === 'bids' && (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Bid ID</th>
                        <th>RFQ Reference</th>
                        <th>Supplier / Vendor</th>
                        <th>Quoted Amount</th>
                        <th>Submission Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bids.map(bid => (
                        <tr key={bid.id}>
                          <td><code>{bid.id}</code></td>
                          <td><code>{bid.rfq}</code></td>
                          <td><strong>{bid.vendor}</strong></td>
                          <td><strong>${bid.amount.toLocaleString()}</strong></td>
                          <td>{bid.date}</td>
                          <td>
                            <span className={`bid-status-badge status-${bid.status.toLowerCase().replace(' ', '-')}`}>
                              {bid.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* POs Sub-tab contents */}
              {pipelineSubTab === 'pos' && (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>PO ID</th>
                        <th>RFQ Reference</th>
                        <th>Vendor Partner</th>
                        <th>PO Total</th>
                        <th>Reviewer Manager</th>
                        <th>Approval Status</th>
                        <th>Release Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pos.map(po => (
                        <tr key={po.id}>
                          <td><code>{po.id}</code></td>
                          <td><code>{po.rfqRef}</code></td>
                          <td><strong>{po.vendor}</strong></td>
                          <td><strong>${po.amount.toLocaleString()}</strong></td>
                          <td>{po.approver}</td>
                          <td>
                            <span className={`po-status-badge status-${po.status.toLowerCase().replace(' ', '-')}`}>
                              {po.status}
                            </span>
                          </td>
                          <td>{po.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Invoices Sub-tab contents */}
              {pipelineSubTab === 'invoices' && (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Invoice ID</th>
                        <th>PO Reference</th>
                        <th>Supplier Partner</th>
                        <th>Billing Value</th>
                        <th>Filing Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map(invoice => (
                        <tr key={invoice.id}>
                          <td><code>{invoice.id}</code></td>
                          <td><code>{invoice.poRef}</code></td>
                          <td><strong>{invoice.vendor}</strong></td>
                          <td><strong>${invoice.amount.toLocaleString()}</strong></td>
                          <td>{invoice.date}</td>
                          <td>
                            <span className={`invoice-status-badge status-${invoice.status.toLowerCase().replace(' ', '-')}`}>
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ACTIVITY LOGS */}
          {activeTab === 'logs' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search logs by action actor..." 
                    value={logsSearch}
                    onChange={(e) => setLogsSearch(e.target.value)}
                  />
                </div>

                <div className="filter-select-group">
                  <label htmlFor="logsFilter">Severity Level</label>
                  <select 
                    id="logsFilter" 
                    value={logsFilter}
                    onChange={(e) => setLogsFilter(e.target.value)}
                  >
                    <option value="All">All Severity Levels</option>
                    <option value="Info">Info Reports</option>
                    <option value="Warning">Security Warnings</option>
                    <option value="Critical">Critical Failures</option>
                  </select>
                </div>
              </div>

              {/* Audit logs timeline list */}
              <div className="logs-ledger-container">
                {filteredLogs.map(log => (
                  <div key={log.id} className={`log-entry-item severity-${log.severity.toLowerCase()}`}>
                    <div className="log-badge-marker">
                      {log.severity === 'Warning' && <AlertTriangle size={14} />}
                      {log.severity === 'Info' && <Activity size={14} />}
                    </div>

                    <div className="log-body-content">
                      <div className="log-action-msg">
                        <strong>{log.actor}</strong> &mdash; {log.action}
                      </div>
                      <div className="log-time-stamp">{log.timestamp}</div>
                    </div>

                    <span className="log-severity-tag">{log.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE ADMINISTRATIVE USER MODAL DRAWER */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Administrative Account</h3>
              <button className="close-modal-btn" onClick={() => setShowAddUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUserSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="modalName">Full Name *</label>
                <input 
                  type="text" 
                  id="modalName" 
                  placeholder="E.g. Vikram Patel" 
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalEmail">Official Email Address *</label>
                <input 
                  type="email" 
                  id="modalEmail" 
                  placeholder="name@vyaparsetu.com" 
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="modalPhone" 
                  placeholder="+91 98765 43210" 
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalPassword">Initial Password *</label>
                <input 
                  type="password" 
                  id="modalPassword" 
                  placeholder="Set login password" 
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="modalRole">Assigned Access Role</label>
                <select 
                  id="modalRole"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="officer">Procurement Officer (Drafts RFQs & Compares Quotes)</option>
                  <option value="manager">Manager / Approver (Authorizes Purchase Orders & Budgets)</option>
                </select>
              </div>

              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary cancel-btn"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn">
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Admin Profile</h3>
              <button className="close-modal-btn" onClick={() => setShowProfileModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const newLog = {
                id: Date.now(),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                actor: adminProfile.email,
                action: 'Admin updated their profile details',
                severity: 'Info'
              }
              setLogs(prevLogs => [newLog, ...prevLogs])
              setShowProfileModal(false);
            }} className="modal-form">
              <div className="form-group">
                <label htmlFor="adminName">Full Name *</label>
                <input 
                  type="text" 
                  id="adminName" 
                  value={adminProfile.name}
                  onChange={(e) => setAdminProfile(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminEmail">Email Address *</label>
                <input 
                  type="email" 
                  id="adminEmail" 
                  value={adminProfile.email}
                  onChange={(e) => setAdminProfile(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="adminPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="adminPhone" 
                  value={adminProfile.phone}
                  onChange={(e) => setAdminProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary cancel-btn"
                  onClick={() => setShowProfileModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER SETTINGS MODAL */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modify User Settings</h3>
              <button className="close-modal-btn" onClick={() => setEditingUser(null)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === editingUser.id) {
                  const newLog = {
                    id: Date.now(),
                    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                    actor: adminProfile.email,
                    action: `Modified details for user ${editingUser.email}: Name=${editingUser.name}, Role=${editingUser.role}, Status=${editingUser.status}`,
                    severity: 'Info'
                  }
                  setLogs(prevLogs => [newLog, ...prevLogs])
                  return editingUser;
                }
                return u;
              }))
              setEditingUser(null);
            }} className="modal-form">
              <div className="form-group">
                <label htmlFor="editName">Full Name *</label>
                <input 
                  type="text" 
                  id="editName" 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="editEmail">Email Address *</label>
                <input 
                  type="email" 
                  id="editEmail" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="editRole">Access Role</label>
                <select 
                  id="editRole"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="officer">Procurement Officer (Drafts RFQs & Compares Quotes)</option>
                  <option value="manager">Manager / Approver (Authorizes Purchase Orders & Budgets)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="editPassword">Reset Password (Optional)</label>
                <input 
                  type="password" 
                  id="editPassword" 
                  placeholder="Enter new password to reset" 
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="editStatus">Account Status</label>
                <select 
                  id="editStatus"
                  value={editingUser.status}
                  onChange={(e) => setEditingUser(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="Active">Active</option>
                  <option value="Deactivated">Deactivated</option>
                </select>
              </div>

              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary cancel-btn"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
