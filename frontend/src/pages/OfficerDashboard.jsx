import React, { useState, useEffect } from 'react'
import { 
  Plus, FileText, Send, Users, Activity, BarChart3, 
  LayoutDashboard, LogOut, RefreshCw, X, CheckCircle,
  MessageSquare, Clock, Star
} from 'lucide-react'

function OfficerDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [rfqs, setRfqs] = useState([])
  const [vendors, setVendors] = useState([])
  const [showAddRfqModal, setShowAddRfqModal] = useState(false)
  const [selectedRfq, setSelectedRfq] = useState(null)
  const [activeChat, setActiveChat] = useState(null)
  const [chatInput, setChatInput] = useState('')
  
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

  // Chat / Discussion States and Synchronizations
  const [chatHistories, setChatHistories] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_chats')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    return {}
  })

  // Sync chats back to localStorage
  useEffect(() => {
    localStorage.setItem('vyaparsetu_chats', JSON.stringify(chatHistories))
  }, [chatHistories])

  // Poll chats from localStorage every 2 seconds to make chat system live
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = localStorage.getItem('vyaparsetu_chats')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setChatHistories(parsed)
          if (activeChat) {
            const chatKey = `${activeChat.rfqId}-${activeChat.vendor}`
            const latestMessages = parsed[chatKey] || []
            if (JSON.stringify(latestMessages) !== JSON.stringify(activeChat.messages)) {
              setActiveChat(prev => prev ? { ...prev, messages: latestMessages } : null)
            }
          }
        } catch (e) {}
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [activeChat])

  const openChatWithVendor = (rfqId, rfqTitle, vendorName) => {
    const chatKey = `${rfqId}-${vendorName}`
    const stored = localStorage.getItem('vyaparsetu_chats')
    let currentChats = chatHistories
    if (stored) {
      try {
        currentChats = JSON.parse(stored)
        setChatHistories(currentChats)
      } catch (e) {}
    }
    const messages = currentChats[chatKey] || []
    setActiveChat({
      rfqId,
      title: rfqTitle,
      vendor: vendorName,
      messages
    })
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !activeChat) return

    const newMessage = {
      sender: 'officer',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const chatKey = `${activeChat.rfqId}-${activeChat.vendor}`
    const updatedMessages = [...(chatHistories[chatKey] || []), newMessage]

    setChatHistories(prev => ({
      ...prev,
      [chatKey]: updatedMessages
    }))

    setActiveChat(prev => prev ? { ...prev, messages: updatedMessages } : null)
    setChatInput('')
  }

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
                                    <tr><th>RFQ #</th><th>Title</th><th>Status</th><th>Deadline</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {rfqs.slice(0, 5).map(r => (
                                        <tr key={r.id}>
                                            <td><code>{r.rfqNumber}</code></td>
                                            <td>{r.title}</td>
                                            <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                            <td>{new Date(r.deadline).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-secondary" onClick={() => setSelectedRfq(r)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                                    View Bids & Chats
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rfqs.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No RFQs found</td></tr>
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
                            <tr><th>RFQ #</th><th>Title</th><th>Status</th><th>Deadline</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {rfqs.map(r => (
                                <tr key={r.id}>
                                    <td><code>{r.rfqNumber}</code></td>
                                    <td>{r.title}</td>
                                    <td><span className={`status-pill status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                    <td>{new Date(r.deadline).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn btn-secondary" onClick={() => setSelectedRfq(r)} style={{ padding: '4px 10px', fontSize: '0.8rem' }}>
                                            View Bids & Chats
                                        </button>
                                    </td>
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

      {selectedRfq && (
          <div className="modal-overlay" onClick={() => setSelectedRfq(null)}>
              <div className="modal-card" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                      <div>
                        <span className="count-indicator" style={{ fontSize: '0.75rem', background: 'var(--accent-color)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>{selectedRfq.rfqNumber}</span>
                        <h3 style={{ margin: '6px 0 0 0' }}>Bids submitted for {selectedRfq.title}</h3>
                      </div>
                      <button type="button" className="close-modal-btn" onClick={() => setSelectedRfq(null)}><X size={20}/></button>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          <strong>RFQ Description:</strong> {selectedRfq.description || 'No description provided.'}
                      </p>
                      <h4 style={{ margin: '10px 0 0 0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>Quotations Submitted by Vendor Partners</h4>
                      
                      {(selectedRfq.quotations || []).length === 0 ? (
                          <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-color)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No vendor quotations submitted for this RFQ yet.</p>
                          </div>
                      ) : (
                          <div className="dashboard-table-container" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                              <table className="dashboard-table">
                                  <thead>
                                      <tr>
                                          <th>Vendor</th>
                                          <th>Price Quote</th>
                                          <th>Delivery Timeline</th>
                                          <th>Trust Rating</th>
                                          <th style={{ textAlign: 'right' }}>Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {(selectedRfq.quotations || []).map(q => (
                                          <tr key={q.id}>
                                              <td><strong>{q.vendor?.companyName || 'Unknown Vendor'}</strong></td>
                                              <td><strong>₹{parseFloat(q.totalAmount).toLocaleString()}</strong></td>
                                              <td>{q.deliveryTimeDays} days</td>
                                              <td>
                                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                      <Star size={14} fill="#eab308" stroke="#eab308" />
                                                      {q.vendor?.performanceScore || 0}/5
                                                  </span>
                                              </td>
                                              <td>
                                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                      <button
                                                          className="btn btn-secondary"
                                                          onClick={() => { openChatWithVendor(selectedRfq.id, selectedRfq.title, q.vendor?.companyName); }}
                                                          style={{ border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent' }}
                                                      >
                                                          <MessageSquare size={13} /> Discussion
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* FLOATING DISCUSSION PANEL DRAWER (RIGHT SIDE SLIDE-OVER) */}
      {activeChat && (
        <div
          className="chat-overlay"
          onClick={() => setActiveChat(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'flex-end',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          <div
            className="chat-drawer"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '450px',
              maxWidth: '100%',
              height: '100%',
              backgroundColor: 'var(--card-bg)',
              borderLeft: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)' }}>
              <div>
                <span className="count-indicator" style={{ fontSize: '0.7rem', background: 'var(--accent-color)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>Discussion Room</span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem' }}>{activeChat.vendor}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ref: {activeChat.title}</span>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div
              style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                backgroundColor: 'var(--bg-color)'
              }}
            >
              {activeChat.messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
                  <MessageSquare size={30} style={{ marginBottom: '10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>No discussion history found. Start the discussion below.</p>
                </div>
              ) : (
                activeChat.messages.map((msg, i) => {
                  const isOfficer = msg.sender === 'officer'
                  return (
                    <div
                      key={i}
                      style={{
                        alignSelf: isOfficer ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOfficer ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 15px',
                          borderRadius: '12px',
                          borderTopRightRadius: isOfficer ? '2px' : '12px',
                          borderTopLeftRadius: isOfficer ? '12px' : '2px',
                          backgroundColor: isOfficer ? 'var(--accent-color)' : 'var(--card-bg)',
                          color: isOfficer ? '#FFFBE9' : 'var(--text-primary)',
                          border: isOfficer ? 'none' : '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                          lineHeight: '1.4'
                        }}
                      >
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 4px' }}>
                        {msg.timestamp}
                      </span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSendChatMessage}
              style={{
                padding: '20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '10px',
                backgroundColor: 'var(--card-bg)'
              }}
            >
              <input
                type="text"
                placeholder="Type your discussion message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OfficerDashboard
