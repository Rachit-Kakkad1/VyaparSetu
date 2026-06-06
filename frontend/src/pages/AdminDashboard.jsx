import React, { useState, useEffect } from 'react'
import { 
  LayoutDashboard, Users, UserCheck, ShieldAlert, FileText, LogOut, 
  Search, Plus, Trash2, CheckCircle2, AlertTriangle, Activity, 
  Database, Cpu, HardDrive, BarChart3, TrendingUp, DollarSign, 
  Package, X, Shield, RefreshCw, Settings 
} from 'lucide-react'
import InvoiceBuilder from './InvoiceBuilder'

function AdminDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview') 
  const [pipelineSubTab, setPipelineSubTab] = useState('rfqs') 
  
  // Real Databases
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [rfqs, setRfqs] = useState([])
  const [bids, setBids] = useState([])
  const [pos, setPos] = useState([])
  const [invoices, setInvoices] = useState([])
  const [logs, setLogs] = useState([])

  const [usersSearch, setUsersSearch] = useState('')
  const [vendorsSearch, setVendorsSearch] = useState('')
  const [logsSearch, setLogsSearch] = useState('')

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: 'Bearer ' + token };
      const baseUrl = `${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api`;

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

  const handleToggleUserStatus = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/users/${userId}/toggle-status`, {
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
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/vendors/${vendorId}`, {
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
          <button className="logout-btn" onClick={() => onNavigate('landing')} style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
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
                  <span className="kpi-value">{users.length}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Verified Vendors</span><UserCheck size={16} /></div>
                  <span className="kpi-value">{vendors.filter(v => v.status === 'APPROVED').length}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Active RFQs</span><Package size={16} /></div>
                  <span className="kpi-value">{rfqs.filter(r => r.status === 'PUBLISHED').length}</span>
                </div>
                <div className="kpi-card">
                  <div className="kpi-header"><span className="kpi-title">Pending POs</span><DollarSign size={16} /></div>
                  <span className="kpi-value">{pos.filter(p => p.status === 'ISSUED').length}</span>
                </div>
              </section>

              <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>
                <div className="analytics-card">
                  <h3>Recent System Activity</h3>
                  <div className="logs-ledger-container" style={{ maxHeight: '400px' }}>
                    {logs.slice(0, 10).map(log => (
                      <div key={log.id} className="log-entry-item">
                        <Activity size={14} />
                        <div className="log-body-content">
                            <div><strong>{log.user?.email || 'SYSTEM'}</strong>: {log.action}</div>
                            <div className="log-time-stamp">{new Date(log.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="analytics-card">
                    <h3>Infrastructure</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="infra-stat"><span>PostgreSQL Status</span><span className="status-badge status-active">Online</span></div>
                        <div className="infra-stat"><span>Supabase Sync</span><span className="status-badge status-active">Connected</span></div>
                        <div className="infra-stat"><span>Cloudinary API</span><span className="status-badge status-active">Active</span></div>
                        <div className="infra-stat"><span>SMTP Relay</span><span className="status-badge status-active">Online</span></div>
                    </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input type="text" placeholder="Search accounts..." value={usersSearch} onChange={(e) => setUsersSearch(e.target.value)} />
                </div>
              </div>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead><tr><th>Identity</th><th>Email Address</th><th>System Role</th><th>State</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.firstName} {user.lastName}</strong></td>
                        <td>{user.email}</td>
                        <td><span className={`role-badge role-${user.role?.name?.toLowerCase()}`}>{user.role?.name}</span></td>
                        <td><span className={`status-dot ${user.isActive ? 'active' : 'inactive'}`}>{user.isActive ? 'Active' : 'Locked'}</span></td>
                        <td>
                          {user.role?.name !== 'ADMIN' && (
                              <button className="btn-table" onClick={() => handleToggleUserStatus(user.id)}>
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                          )}
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
                  <input type="text" placeholder="Search vendors..." value={vendorsSearch} onChange={(e) => setVendorsSearch(e.target.value)} />
                </div>
              </div>
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead><tr><th>Company Name</th><th>GST/Tax ID</th><th>Email</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredVendors.map(vendor => (
                      <tr key={vendor.id}>
                        <td><strong>{vendor.companyName}</strong></td>
                        <td><code>{vendor.taxId || 'N/A'}</code></td>
                        <td>{vendor.contactEmail}</td>
                        <td>{vendor.performanceScore}/5.0</td>
                        <td><span className={`status-pill status-${vendor.status.toLowerCase()}`}>{vendor.status}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {vendor.status === 'PENDING' && <button className="btn-table approve" onClick={() => handleVendorStatusChange(vendor.id, 'APPROVED')}>Approve</button>}
                            {vendor.status === 'APPROVED' && <button className="btn-table danger" onClick={() => handleVendorStatusChange(vendor.id, 'BLACKLISTED')}>Blacklist</button>}
                            {vendor.status === 'BLACKLISTED' && <button className="btn-table approve" onClick={() => handleVendorStatusChange(vendor.id, 'APPROVED')}>Restore</button>}
                          </div>
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
                <button className={`sub-nav-item ${pipelineSubTab === 'rfqs' ? 'active' : ''}`} onClick={() => setPipelineSubTab('rfqs')}>RFQs</button>
                <button className={`sub-nav-item ${pipelineSubTab === 'bids' ? 'active' : ''}`} onClick={() => setPipelineSubTab('bids')}>Quotations</button>
                <button className={`sub-nav-item ${pipelineSubTab === 'pos' ? 'active' : ''}`} onClick={() => setPipelineSubTab('pos')}>Purchase Orders</button>
                <button className={`sub-nav-item ${pipelineSubTab === 'invoices' ? 'active' : ''}`} onClick={() => setPipelineSubTab('invoices')}>Invoices</button>
              </div>
              
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  {pipelineSubTab === 'rfqs' && (
                    <>
                      <thead>
                        <tr>
                          <th>RFQ Number</th>
                          <th>Project Name / Title</th>
                          <th>Status</th>
                          <th>Deadline</th>
                          <th>Creation Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqs.map(r => (
                          <tr key={r.id}>
                            <td><code>{r.rfqNumber}</code></td>
                            <td><strong>{r.title}</strong></td>
                            <td>
                              <span className={`pipeline-stage-badge stage-${r.status?.toLowerCase()}`}>
                                {r.status}
                              </span>
                            </td>
                            <td>{new Date(r.deadline).toLocaleDateString()}</td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {pipelineSubTab === 'bids' && (
                    <>
                      <thead>
                        <tr>
                          <th>Quotation ID</th>
                          <th>Vendor</th>
                          <th>Amount</th>
                          <th>Delivery</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bids.map(b => (
                          <tr key={b.id}>
                            <td><code>{b.id.substring(0, 8)}</code></td>
                            <td><strong>{b.vendor?.companyName}</strong></td>
                            <td><strong>${parseFloat(b.totalAmount).toLocaleString()}</strong></td>
                            <td>{b.deliveryTimeDays} Days</td>
                            <td>
                              <span className={`bid-status-badge status-${b.status?.toLowerCase()}`}>
                                {b.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {pipelineSubTab === 'pos' && (
                    <>
                      <thead>
                        <tr>
                          <th>PO Number</th>
                          <th>Vendor Partner</th>
                          <th>PO Total</th>
                          <th>Status</th>
                          <th>Release Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pos.map(p => (
                          <tr key={p.id}>
                            <td><code>{p.poNumber}</code></td>
                            <td><strong>{p.vendor?.companyName}</strong></td>
                            <td><strong>${parseFloat(p.totalAmount).toLocaleString()}</strong></td>
                            <td>
                              <span className={`po-status-badge status-${p.status?.toLowerCase()}`}>
                                {p.status}
                              </span>
                            </td>
                            <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {pipelineSubTab === 'invoices' && (
                    <>
                      <thead>
                        <tr>
                          <th>Invoice Number</th>
                          <th>Supplier Partner</th>
                          <th>Grand Total</th>
                          <th>Status</th>
                          <th>Filing Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map(i => (
                          <tr key={i.id}>
                            <td><code>{i.invoiceNumber}</code></td>
                            <td><strong>{i.vendor?.companyName}</strong></td>
                            <td><strong>${parseFloat(i.grandTotal).toLocaleString()}</strong></td>
                            <td>
                              <span className={`invoice-status-badge status-${i.status?.toLowerCase()}`}>
                                {i.status}
                              </span>
                            </td>
                            <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="tab-pane-fade">
              <div className="table-actions-bar">
                <div className="search-input-wrapper">
                  <Search size={16} />
                  <input type="text" placeholder="Search logs..." value={logsSearch} onChange={(e) => setLogsSearch(e.target.value)} />
                </div>
              </div>
              <div className="logs-ledger-container">
                {filteredLogs.map(log => (
                  <div key={log.id} className="log-entry-item">
                    <Activity size={14} />
                    <div className="log-body-content">
                      <div><strong>{log.user?.email || 'SYSTEM'}</strong> &mdash; {log.action}</div>
                      <div className="subtext-mute">{log.description}</div>
                      <div className="log-time-stamp">{new Date(log.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <style>{`
        .infra-stat { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
        .btn-table { padding: 5px 12px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--text-primary); cursor: pointer; font-size: 0.75rem; transition: 0.2s; }
        .btn-table:hover { background: var(--accent-color); color: #fff; }
        .btn-table.approve:hover { background: var(--success-color); border-color: var(--success-color); }
        .btn-table.danger:hover { background: var(--error-color); border-color: var(--error-color); }
        .role-badge { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: rgba(0,0,0,0.05); text-transform: uppercase; font-weight: bold; }
        .status-pill { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; font-weight: bold; }
        .status-approved { background: rgba(34, 197, 94, 0.1); color: var(--success-color); }
        .status-pending { background: rgba(249, 115, 22, 0.1); color: var(--orange); }
      `}</style>
    </div>
  )
}

export default AdminDashboard
