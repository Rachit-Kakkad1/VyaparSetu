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
  
  // Real Databases
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [rfqs, setRfqs] = useState([])
  const [bids, setBids] = useState([])
  const [pos, setPos] = useState([])
  const [invoices, setInvoices] = useState([])
  const [logs, setLogs] = useState([])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: 'Bearer ' + token };
      const baseUrl = 'http://localhost:5000/api';

      const [uRes, vRes, rRes, bRes, pRes, iRes, lRes] = await Promise.all([
        fetch(baseUrl + '/users', { headers }),
        fetch(baseUrl + '/vendors', { headers }),
        fetch(baseUrl + '/rfqs', { headers }),
        fetch(baseUrl + '/quotations', { headers }),
        fetch(baseUrl + '/pos', { headers }),
        fetch(baseUrl + '/invoices', { headers }),
        fetch(baseUrl + '/activity-logs', { headers })
      ]);

      const [uData, vData, rData, bData, pData, iData, lData] = await Promise.all([
        uRes.json(), vRes.json(), rRes.json(), bRes.json(), pRes.json(), iRes.json(), lRes.json()
      ]);

      if (uRes.ok) setUsers(uData.data.users || []);
      if (vRes.ok) setVendors(vData.data.rows || vData.data || []);
      if (rRes.ok) setRfqs(rData.data.rfqs || rData.data || []);
      if (bRes.ok) setBids(bData.data.quotations || bData.data || []);
      if (pRes.ok) setPos(pData.data.pos || pData.data || []);
      if (iRes.ok) setInvoices(iData.data.invoices || iData.data || []);
      if (lRes.ok) setLogs(lData.data.logs || lData.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  // Search filter states
  const [usersSearch, setUsersSearch] = useState('')
  const [vendorsSearch, setVendorsSearch] = useState('')
  const [logsSearch, setLogsSearch] = useState('')

  const handleToggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token }
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  const handleVendorStatusChange = async (vendorId, newStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`http://localhost:5000/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  }

  // Filtered databases
  const filteredUsers = users.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(usersSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
    (user.role?.name || '').toLowerCase().includes(usersSearch.toLowerCase())
  )

  const filteredVendors = vendors.filter(vendor => 
    vendor.companyName.toLowerCase().includes(vendorsSearch.toLowerCase()) ||
    vendor.contactEmail.toLowerCase().includes(vendorsSearch.toLowerCase()) ||
    (vendor.taxId || '').toLowerCase().includes(vendorsSearch.toLowerCase())
  )

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logsSearch.toLowerCase()) ||
                          (log.user?.email || '').toLowerCase().includes(logsSearch.toLowerCase())
    return matchesSearch
  })

  // Calculations for summary stats
  const totalRegisteredUsers = users.length
  const totalApprovedVendors = vendors.filter(v => v.status === 'APPROVED').length
  const totalActiveRFQs = rfqs.filter(r => r.status === 'PUBLISHED').length
  const totalPendingPOs = pos.filter(p => p.status === 'ISSUED').length

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/images/logo_vyapar.png" alt="VS" className="brand-icon" style={{ background: 'transparent', padding: 0, width: '64px', height: 'auto' }} />
          <div className="brand-details">
            <span className="brand-name">VyaparSetu</span>
            <span className="brand-role">Admin Control Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} />
            <span>Overview & Monitor</span>
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} />
            <span>Manage Users</span>
          </button>
          <button className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
            <UserCheck size={18} />
            <span>Manage Vendors</span>
          </button>
          <button className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`} onClick={() => setActiveTab('pipeline')}>
            <FileText size={18} />
            <span>Procurement Pipeline</span>
          </button>
          <button className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <ShieldAlert size={18} />
            <span>Activity Logs</span>
          </button>
        </nav>

        <div className="sidebar-footer">
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

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title-box">
            <h1>
              {activeTab === 'overview' && 'System Health & Analytics'}
              {activeTab === 'users' && 'Access & Account Directory'}
              {activeTab === 'vendors' && 'Onboarded Suppliers Verification'}
              {activeTab === 'pipeline' && 'System Documents Repository'}
              {activeTab === 'logs' && 'Security Auditing Trails'}
            </h1>
          </div>
          <div className="system-indicator-badge">
            <span className="indicator-pulse"></span>
            <span>Live Sync Active</span>
          </div>
        </header>

        <div className="dashboard-body">
          {activeTab === 'overview' && (
            <div className="tab-pane-fade">
              <section className="stats-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Global Accounts</span><Users size={16} /></div>
                  <span className="kpi-value">{totalRegisteredUsers}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Verified Vendors</span><UserCheck size={16} /></div>
                  <span className="kpi-value">{totalApprovedVendors}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Active RFQs</span><Package size={16} /></div>
                  <span className="kpi-value">{totalActiveRFQs}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Pending PO Approval</span><DollarSign size={16} /></div>
                  <span className="kpi-value">{totalPendingPOs}</span>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input type="text" placeholder="Search..." value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} />
                </div>
              </div>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.email}</td>
                        <td>{user.role?.name}</td>
                        <td>{user.isActive ? 'Active' : 'Deactivated'}</td>
                        <td>
                          <button onClick={() => handleToggleUserStatus(user.id)}>Toggle</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input type="text" placeholder="Search..." value={vendorsSearch} onChange={(e) => setVendorsSearch(e.target.value)} />
                </div>
              </div>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead><tr><th>Company</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td>{vendor.companyName}</td>
                        <td>{vendor.contactEmail}</td>
                        <td>{vendor.status}</td>
                        <td>
                          <button onClick={() => handleVendorStatusChange(vendor.id, 'APPROVED')}>Approve</button>
                          <button onClick={() => handleVendorStatusChange(vendor.id, 'BLACKLISTED')}>Blacklist</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="tab-pane-fade">
              <div className="pipeline-sub-nav">
                <button className={pipelineSubTab === 'rfqs' ? 'active' : ''} onClick={() => setPipelineSubTab('rfqs')}>RFQs</button>
                <button className={pipelineSubTab === 'bids' ? 'active' : ''} onClick={() => setPipelineSubTab('bids')}>Bids</button>
                <button className={pipelineSubTab === 'pos' ? 'active' : ''} onClick={() => setPipelineSubTab('pos')}>POs</button>
                <button className={pipelineSubTab === 'invoices' ? 'active' : ''} onClick={() => setPipelineSubTab('invoices')}>Invoices</button>
              </div>
              
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <tbody>
                    {pipelineSubTab === 'rfqs' && rfqs.map(r => <tr key={r.id}><td>{r.rfqNumber}</td><td>{r.title}</td><td>{r.status}</td></tr>)}
                    {pipelineSubTab === 'bids' && bids.map(b => <tr key={b.id}><td>{b.vendor?.companyName}</td><td>${b.totalAmount}</td><td>{b.status}</td></tr>)}
                    {pipelineSubTab === 'pos' && pos.map(p => <tr key={p.id}><td>{p.poNumber}</td><td>${p.totalAmount}</td><td>{p.status}</td></tr>)}
                    {pipelineSubTab === 'invoices' && invoices.map(i => <tr key={i.id}><td>{i.invoiceNumber}</td><td>${i.grandTotal}</td><td>{i.status}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="tab-pane-fade">
              <div className="logs-ledger-container">
                {filteredLogs.map(log => (
                  <div key={log.id} className="log-entry-item">
                    <strong>{log.user?.email || 'SYSTEM'}</strong>: {log.action} - {log.description}
                    <div className="log-time-stamp">{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
