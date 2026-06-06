import React, { useState, useEffect } from 'react'
import { 
  Plus, FileText, Send, Users, Activity, BarChart3, 
  LayoutDashboard, LogOut, RefreshCw, X, CheckCircle 
} from 'lucide-react'

function OfficerDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [rfqs, setRfqs] = useState([])
  const [vendors, setVendors] = useState([])
  const [showAddRfqModal, setShowAddRfqModal] = useState(false)
  
  // Form State
  const [newRfq, setNewRfq] = useState({
    title: '',
    description: '',
    deadline: '',
    items: [{ itemName: '', quantity: 1, uom: 'UNIT' }],
    vendorIds: []
  })

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: 'Bearer ' + token };
      const baseUrl = `${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api`;

      const [rRes, vRes] = await Promise.all([
        fetch(baseUrl + '/rfqs', { headers }),
        fetch(baseUrl + '/vendors', { headers })
      ]);

      const [rData, vData] = await Promise.all([rRes.json(), vRes.json()]);

      if (rRes.ok) setRfqs(rData.data.rfqs || rData.data || []);
      if (vRes.ok) setVendors(vData.data.rows || vData.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRfq = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/rfqs`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify(newRfq)
      });

      if (res.ok) {
        alert('RFQ Created Successfully');
        setShowAddRfqModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddItem = () => {
    setNewRfq(prev => ({
        ...prev,
        items: [...prev.items, { itemName: '', quantity: 1, uom: 'UNIT' }]
    }));
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <img src="/images/logo_vyapar.png" alt="VS" className="brand-icon" style={{ width: '64px' }} />
          <div className="brand-details">
            <span className="brand-name">VyaparSetu</span>
            <span className="brand-role">Procurement Officer</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button className={`nav-item ${activeTab === 'rfqs' ? 'active' : ''}`} onClick={() => setActiveTab('rfqs')}>
            <FileText size={18} />
            <span>Manage RFQs</span>
          </button>
          <button className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => setActiveTab('vendors')}>
            <Users size={18} />
            <span>Vendors</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="dashboard-theme-toggle" onClick={toggleDarkMode}>
            <RefreshCw size={14} />
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
          <div className="admin-profile-card">
            <div className="profile-info">
              <span className="profile-name">{user.firstName} {user.lastName}</span>
              <span className="profile-email">{user.email}</span>
            </div>
            <button className="logout-btn" onClick={() => onNavigate('landing')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
            <div className="header-title-box">
                <h1>{activeTab === 'overview' ? 'Procurement Control' : activeTab === 'rfqs' ? 'RFQ Pipeline' : 'Vendor Directory'}</h1>
            </div>
            {activeTab === 'rfqs' && (
                <button className="btn btn-primary" onClick={() => setShowAddRfqModal(true)}>
                    <Plus size={16} /> Create New RFQ
                </button>
            )}
        </header>

        <div className="dashboard-body">
            {activeTab === 'overview' && (
                <>
                    <section className="stats-kpi-grid">
                        <div className="kpi-card">
                            <span className="kpi-title">Total RFQs</span>
                            <span className="kpi-value">{rfqs.length}</span>
                        </div>
                        <div className="kpi-card">
                            <span className="kpi-title">Active Vendors</span>
                            <span className="kpi-value">{vendors.length}</span>
                        </div>
                    </section>
                    
                    <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 600 }}>Recent RFQs</h2>
                        <div className="dashboard-table-container">
                            <table className="dashboard-table">
                                <thead>
                                    <tr><th>RFQ #</th><th>Title</th><th>Status</th><th>Deadline</th></tr>
                                </thead>
                                <tbody>
                                    {rfqs.slice(0, 5).map(r => (
                                        <tr key={r.id}>
                                            <td><code>{r.rfqNumber}</code></td>
                                            <td>{r.title}</td>
                                            <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                            <td>{new Date(r.deadline).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {rfqs.length === 0 && (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No RFQs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'rfqs' && (
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr><th>RFQ #</th><th>Title</th><th>Status</th><th>Deadline</th></tr>
                        </thead>
                        <tbody>
                            {rfqs.map(r => (
                                <tr key={r.id}>
                                    <td><code>{r.rfqNumber}</code></td>
                                    <td>{r.title}</td>
                                    <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                    <td>{new Date(r.deadline).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'vendors' && (
                <div className="dashboard-table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr><th>Company</th><th>Email</th><th>Rating</th></tr>
                        </thead>
                        <tbody>
                            {vendors.map(v => (
                                <tr key={v.id}>
                                    <td>{v.companyName}</td>
                                    <td>{v.contactEmail}</td>
                                    <td>{v.performanceScore}/5.0</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </main>

      {showAddRfqModal && (
          <div className="modal-overlay">
              <div className="modal-card" style={{ maxWidth: '600px' }}>
                  <div className="modal-header">
                      <h3>Draft New RFQ</h3>
                      <button type="button" className="close-modal-btn" onClick={() => setShowAddRfqModal(false)}><X size={20}/></button>
                  </div>
                  <form onSubmit={handleCreateRfq} className="modal-form">
                      <div className="form-group">
                          <label>Title</label>
                          <input type="text" value={newRfq.title} onChange={e => setNewRfq({...newRfq, title: e.target.value})} required/>
                      </div>
                      <div className="form-group">
                          <label>Deadline</label>
                          <input type="date" value={newRfq.deadline} onChange={e => setNewRfq({...newRfq, deadline: e.target.value})} required/>
                      </div>
                      <div className="form-group">
                          <label>Description</label>
                          <textarea value={newRfq.description} onChange={e => setNewRfq({...newRfq, description: e.target.value})} />
                      </div>
                      <div className="modal-action-buttons">
                          <button type="button" className="btn cancel-btn" onClick={() => setShowAddRfqModal(false)}>Cancel</button>
                          <button type="submit" className="btn btn-primary">Publish RFQ</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  )
}

export default OfficerDashboard
