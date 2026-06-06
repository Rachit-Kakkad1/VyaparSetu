import React, { useState, useEffect } from 'react'
import {
  Plus, Send, MessageSquare, LogOut, FileText, Check, AlertCircle,
  Briefcase, Layers, User, Settings, Sparkles, Trash2, Globe, ArrowRight,
  TrendingUp, Clock, Shield, Download, Sun, Moon, RefreshCw, X
} from 'lucide-react'
import InvoiceBuilder from './InvoiceBuilder'

// Default mock data to populate if localStorage is empty
const defaultRfqs = [
  {
    id: 'REQ-2026-101',
    title: 'Procurement of 50 Laptops',
    category: 'Hardware',
    status: 'Published to Vendors',
    requirements: '50 Enterprise-grade laptops with minimum 16GB RAM, 512GB SSD, Intel i7/Ryzen 7, 3-year warranty.',
    budget: 2500000,
    deadlineDays: 10,
    bids: [
      { 
        vendor: 'Vendor A (Acme Supplies)', 
        price: 2400000, 
        delivery: '7 days', 
        rating: 4.5, 
        terms: 'Includes 3 years onsite hardware replacement, express setup, and dedicated technical helpdesk.', 
        status: 'Pending Review',
        pdfName: 'QUOTE_LAPTOPS_ACME.pdf',
        pdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...' 
      },
      { 
        vendor: 'Vendor B (Global Parts)', 
        price: 2350000, 
        delivery: '10 days', 
        rating: 4.8, 
        terms: 'Includes 1 year standard warranty, spare battery pack, and bulk volume discounts on next order.', 
        status: 'Pending Review',
        pdfName: 'QUOTE_50LAPTOPS_GLOBAL.pdf',
        pdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
      },
      { 
        vendor: 'Vendor C (SteelCorp)', 
        price: 2600000, 
        delivery: '5 days', 
        rating: 4.2, 
        terms: 'Includes 5 years manufacturer parts warranty and free door-to-door shipping.', 
        status: 'Pending Review',
        pdfName: 'STEELCORP_QUOTE_50L.pdf',
        pdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
      }
    ],
    dateCreated: '2026-06-05'
  },
  {
    id: 'REQ-2026-102',
    title: 'Procurement of 50 Mobiles',
    category: 'Electronics',
    status: 'Published to Vendors',
    requirements: '50 Android smartphones with minimum 128GB storage, 8GB RAM, 5000mAh battery, 5G supported.',
    budget: 1200000,
    deadlineDays: 7,
    bids: [
      { 
        vendor: 'Vendor A (Acme Supplies)', 
        price: 1000000, 
        delivery: '7 days', 
        rating: 4.5, 
        terms: 'Includes 2 years insurance, phone screen guard, and protective rugged back covers.', 
        status: 'Pending Review',
        pdfName: 'QUOTE_MOBILES_ACME.pdf',
        pdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
      },
      { 
        vendor: 'Vendor C (SteelCorp)', 
        price: 1100000, 
        delivery: '5 days', 
        rating: 4.2, 
        terms: 'Includes 1 year damage protection warranty and express air cargo courier delivery.', 
        status: 'Pending Review',
        pdfName: 'STEELCORP_QUOTE_50M.pdf',
        pdfUrl: 'data:application/pdf;base64,JVBERi0xLjQKJ...'
      }
    ],
    dateCreated: '2026-06-06'
  }
]

const defaultChats = {
  'REQ-2026-101-Vendor A (Acme Supplies)': [
    { sender: 'vendor', text: 'Greetings, we can offer bulk warranty extension for 3 years at this price.', timestamp: '11:15 AM' },
    { sender: 'officer', text: 'Can you match the pricing structure of Vendor B at ₹23,50,000?', timestamp: '11:20 AM' },
    { sender: 'vendor', text: 'We can lower it to ₹23,80,000 if PO is generated today.', timestamp: '11:22 AM' }
  ],
  'REQ-2026-101-Vendor B (Global Parts)': [
    { sender: 'vendor', text: 'We have laptops in stock and can deliver within 10 days.', timestamp: '10:45 AM' },
    { sender: 'officer', text: 'Excellent. Is there any additional discount for direct bank transfer?', timestamp: '10:50 AM' }
  ]
}

// Helper to convert base64 PDF Data URL to safe Blob Object URL for Chrome iframe compatibility
const base64ToBlob = (base64, type = 'application/pdf') => {
  try {
    const parts = base64.split(';base64,');
    const base64Data = parts[1] || parts[0];
    const binStr = atob(base64Data);
    const len = binStr.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }
    return new Blob([arr], { type });
  } catch (e) {
    console.error('base64ToBlob error:', e);
    return null;
  }
}

function OfficerDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('demands') // 'demands' | 'rfqs' | 'chat' | 'profile'

  // Load datasets from localStorage or default
  const [rfqs, setRfqs] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_rfqs')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    localStorage.setItem('vyaparsetu_rfqs', JSON.stringify(defaultRfqs))
    return defaultRfqs
  })

  const [chats, setChats] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_chats')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    localStorage.setItem('vyaparsetu_chats', JSON.stringify(defaultChats))
    return defaultChats
  })

  const [draftDemands, setDraftDemands] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_drafts')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    const initialDrafts = [
      { id: 'DFT-001', title: 'Procurement of 100 Industrial Valves', category: 'Machinery', budget: 1500000, deadlineDays: 14, requirements: 'Grade 316 Stainless Steel Ball Valves 2-inch.' },
      { id: 'DFT-002', title: 'Office Stationery & Desks Bulk Purchase', category: 'Office Supplies', budget: 300000, deadlineDays: 20, requirements: 'Ergonomic chairs and wooden executive tables.' }
    ]
    localStorage.setItem('vyaparsetu_drafts', JSON.stringify(initialDrafts))
    return initialDrafts
  })

  // Sync back to localStorage when states change
  useEffect(() => {
    localStorage.setItem('vyaparsetu_rfqs', JSON.stringify(rfqs))
  }, [rfqs])

  useEffect(() => {
    localStorage.setItem('vyaparsetu_chats', JSON.stringify(chats))
  }, [chats])

  useEffect(() => {
    localStorage.setItem('vyaparsetu_drafts', JSON.stringify(draftDemands))
  }, [draftDemands])

  // Form states for creating a new demand
  const [formTitle, setFormTitle] = useState('')
  const [formCategory, setFormCategory] = useState('Hardware')
  const [formBudget, setFormBudget] = useState('')
  const [formDeadline, setFormDeadline] = useState('')
  const [formRequirements, setFormRequirements] = useState('')

  // Selected details modal / view
  const [viewingRfq, setViewingRfq] = useState(null)
  const [viewingPdfBid, setViewingPdfBid] = useState(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

  useEffect(() => {
    if (!viewingPdfBid || !viewingPdfBid.pdfUrl) {
      setPdfBlobUrl(null)
      return
    }

    if (viewingPdfBid.pdfUrl.startsWith('data:application/pdf;base64,')) {
      try {
        const blob = base64ToBlob(viewingPdfBid.pdfUrl)
        if (blob) {
          const url = URL.createObjectURL(blob)
          setPdfBlobUrl(url)
          return () => {
            URL.revokeObjectURL(url)
          }
        }
      } catch (e) {
        console.error('Failed to create object URL from base64 PDF:', e)
      }
    }
    setPdfBlobUrl(viewingPdfBid.pdfUrl)
  }, [viewingPdfBid])

  // Chat window state
  const [activeChatKey, setActiveChatKey] = useState('')
  const [chatMessageText, setChatMessageText] = useState('')

  // Profile state
  const [profile, setProfile] = useState({
    name: 'Rohan Sharma',
    email: 'officer@vendorbridge.com',
    department: 'Procurement & Supplier Relations',
    employeeId: 'EMP-9021',
    phone: '+91 98765 00005'
  })
  const [showProfileModal, setShowProfileModal] = useState(false)

  const handleAddDemand = (e) => {
    e.preventDefault()
    if (!formTitle || !formBudget || !formDeadline) return

    const newDraft = {
      id: `DFT-${Date.now().toString().slice(-4)}`,
      title: formTitle,
      category: formCategory,
      budget: parseFloat(formBudget),
      deadlineDays: parseInt(formDeadline),
      requirements: formRequirements || 'No specific description provided.'
    }

    setDraftDemands(prev => [...prev, newDraft])
    setFormTitle('')
    setFormBudget('')
    setFormDeadline('')
    setFormRequirements('')
  }

  const handleDeleteDraft = (id) => {
    setDraftDemands(prev => prev.filter(d => d.id !== id))
  }

  const handlePublishRfq = (draft) => {
    const confirmPublish = window.confirm(`Publish RFQ for "${draft.title}" to all system vendors?`)
    if (!confirmPublish) return

    const newRfqId = `REQ-2026-${Math.floor(103 + Math.random() * 900)}`
    const newRfq = {
      id: newRfqId,
      title: draft.title,
      category: draft.category,
      status: 'Published to Vendors',
      requirements: draft.requirements,
      budget: draft.budget,
      deadlineDays: draft.deadlineDays,
      bids: [],
      dateCreated: new Date().toISOString().split('T')[0]
    }

    // Add to RFQs
    setRfqs(prev => [newRfq, ...prev])
    // Remove from drafts
    setDraftDemands(prev => prev.filter(d => d.id !== draft.id))
    alert(`RFQ "${newRfqId}" successfully published! Vendors can now view and bid.`)
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!activeChatKey || !chatMessageText.trim()) return

    const message = {
      sender: 'officer',
      text: chatMessageText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChats(prev => {
      const existing = prev[activeChatKey] || []
      return {
        ...prev,
        [activeChatKey]: [...existing, message]
      }
    })
    setChatMessageText('')
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
      
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar" style={{ width: '280px', background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', color: '#FFFBE9' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifycontent: 'center', fontWeight: 'bold' }}>
            VS
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>VyaparSetu</h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>OFFICER PORTAL</span>
          </div>
        </div>

        <nav style={{ flex: '1', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`nav-btn ${activeTab === 'demands' ? 'active' : ''}`}
            onClick={() => setActiveTab('demands')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'demands' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <Plus size={18} />
            <span>Procurement Demands</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'rfqs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('rfqs'); setViewingRfq(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'rfqs' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <FileText size={18} />
            <span>Active RFQs</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'chat' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <MessageSquare size={18} />
            <span>Communications Hub</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoices')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'invoices' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <FileText size={18} />
            <span>Invoices</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'profile' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <User size={18} />
            <span>My Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="dashboard-theme-toggle" onClick={toggleDarkMode}>
            <RefreshCw size={14} />
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <div className="admin-profile-card" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">
              {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'RS'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{profile.name}</span>
              <span className="profile-email">{profile.email}</span>
            </div>
            <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onNavigate('landing'); }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header style={{
          padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {activeTab === 'demands' && 'Company Procurement Demands'}
              {activeTab === 'rfqs' && 'Request for Quotations (RFQs)'}
              {activeTab === 'chat' && 'Supplier Communication Console'}
              {activeTab === 'profile' && 'Officer Information System'}
              {activeTab === 'invoices' && 'Manual Invoice Workspace'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Logged in as: <strong>{profile.name}</strong> ({profile.department})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={toggleDarkMode}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: '1px solid var(--border-color)',
                background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                RS
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER */}
        <div style={{ padding: '32px', flex: '1', display: 'flex', flexDirection: 'column' }}>

          {/* TAB 1: DEMANDS & DRAFTS */}
          {activeTab === 'demands' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', height: '100%' }}>
              {/* Draft Entry Form */}
              <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', alignSelf: 'start' }}>
                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={20} style={{ color: 'var(--accent-color)' }} />
                  <span>Log New Demand</span>
                </h3>
                <form onSubmit={handleAddDemand} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Item Name / Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 50 Enterprise SSDs" 
                      value={formTitle} 
                      onChange={e => setFormTitle(e.target.value)} 
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Category</label>
                      <select 
                        value={formCategory} 
                        onChange={e => setFormCategory(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      >
                        <option value="Hardware">Hardware</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Machinery">Machinery</option>
                        <option value="Office Supplies">Office Supplies</option>
                        <option value="Logistics Support">Logistics Support</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Estimated Budget (₹) *</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 100000" 
                        value={formBudget} 
                        onChange={e => setFormBudget(e.target.value)} 
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Fulfillment Deadline (Days) *</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 15" 
                      value={formDeadline} 
                      onChange={e => setFormDeadline(e.target.value)} 
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                      required 
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Technical Requirements / Specs</label>
                    <textarea 
                      rows="3" 
                      placeholder="Describe hardware models, sizes, brand constraints or special standards..." 
                      value={formRequirements} 
                      onChange={e => setFormRequirements(e.target.value)}
                      style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', gap: '8px', marginTop: '8px' }}>
                    <Plus size={16} /> Draft Item Requirement
                  </button>
                </form>
              </div>

              {/* Draft List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', flex: '1' }}>
                  <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    Draft Items Ledger ({draftDemands.length})
                  </h3>

                  {draftDemands.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
                      <AlertCircle size={40} style={{ marginBottom: '12px' }} />
                      <p>No requirements currently drafted. Use the creator form to register new requests.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {draftDemands.map(draft => (
                        <div 
                          key={draft.id} 
                          style={{
                            padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)',
                            background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                          }}
                        >
                          <div style={{ flex: '1', marginRight: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '3px 8px', borderRadius: '4px', background: 'var(--btn-bg)', color: '#fff' }}>
                                {draft.category}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {draft.id}</span>
                            </div>
                            <h4 style={{ margin: '8px 0 4px 0', fontSize: '1.05rem' }}>{draft.title}</h4>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{draft.requirements}</p>
                            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}>
                              <span>Budget: <strong>{draft.budget ? `₹${draft.budget.toLocaleString()}` : 'N/A'}</strong></span>
                              <span>Target Frame: <strong>{draft.deadlineDays ? `${draft.deadlineDays} Days` : 'N/A'}</strong></span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '130px' }}>
                            <button 
                              onClick={() => handlePublishRfq(draft)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                                background: '#2E7D32', border: 'none', borderRadius: '6px', color: '#fff',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', justifyContent: 'center'
                              }}
                            >
                              <Sparkles size={14} /> Publish RFQ
                            </button>
                            <button 
                              onClick={() => handleDeleteDraft(draft.id)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px',
                                background: 'transparent', border: '1px solid rgba(211,47,47,0.4)', borderRadius: '6px', color: '#d32f2f',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE RFQS & BIDDING */}
          {activeTab === 'rfqs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {!viewingRfq ? (
                <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ marginBottom: '20px' }}>Live RFQs Published to Suppliers</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {rfqs.map(rfq => (
                      <div 
                        key={rfq.id}
                        style={{
                          padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', background: '#2E7D32', color: '#fff' }}>
                              {rfq.id}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category: {rfq.category}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Published: {rfq.dateCreated}</span>
                          </div>
                          <h4 style={{ margin: '10px 0 6px 0', fontSize: '1.2rem' }}>{rfq.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '650px' }}>
                            {rfq.requirements}
                          </p>
                          <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '0.85rem' }}>
                            <span>Budget Constraint: <strong>{rfq.budget ? `₹${rfq.budget.toLocaleString()}` : 'N/A'}</strong></span>
                            <span>Target Timeframe: <strong>{rfq.deadlineDays ? `${rfq.deadlineDays} Days` : 'N/A'}</strong></span>
                            <span>Quotations Received: <strong style={{ color: 'var(--accent-color)' }}>{rfq.bids ? rfq.bids.length : 0}</strong></span>
                          </div>
                        </div>

                        <div>
                          <button 
                            onClick={() => setViewingRfq(rfq)}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}
                          >
                            <span>Manage Bids ({rfq.bids ? rfq.bids.length : 0})</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Detailed Back Button Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
                    <button 
                      onClick={() => setViewingRfq(null)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 16px' }}
                    >
                      ← Back to RFQ Grid
                    </button>
                    <span style={{ fontWeight: '600', color: 'var(--accent-color)' }}>{viewingRfq.id}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
                    
                    {/* RFQ Meta Card */}
                    <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                      <h3 style={{ margin: '0 0 16px 0' }}>RFQ Specifications</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>RFQ TITLE</label>
                          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{viewingRfq.title}</span>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>DETAILED REQUIREMENTS</label>
                          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>{viewingRfq.requirements}</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>BUDGET</label>
                            <span style={{ fontWeight: '600' }}>{viewingRfq.budget ? `₹${viewingRfq.budget.toLocaleString()}` : 'N/A'}</span>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>MAX TIMELINE</label>
                            <span style={{ fontWeight: '600' }}>{viewingRfq.deadlineDays ? `${viewingRfq.deadlineDays} Days` : 'N/A'}</span>
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>STATUS</label>
                          <span style={{ color: '#2E7D32', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Globe size={14} /> Published to all Vendors
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submitted Bids Listing */}
                    <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ margin: '0 0 16px 0' }}>Submitted Quotations ({viewingRfq.bids ? viewingRfq.bids.length : 0})</h3>

                      {!viewingRfq.bids || viewingRfq.bids.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.7 }}>
                          <Clock size={32} style={{ marginBottom: '10px' }} />
                          <p>Waiting for Vendor submissions. Vendors can view this RFQ and attach bidding terms.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {viewingRfq.bids.map((bid, idx) => (
                            <div 
                              key={idx}
                              style={{
                                padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)',
                                background: 'var(--bg-color)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <h4 style={{ margin: 0 }}>{bid.vendor}</h4>
                                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Rating: ⭐ {bid.rating || 'N/A'}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-color)', display: 'block' }}>
                                    ₹{bid.price.toLocaleString()}
                                  </span>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery: {bid.delivery}</span>
                                </div>
                              </div>

                              <div style={{ margin: '12px 0', padding: '10px', background: 'var(--card-bg)', borderRadius: '6px', fontSize: '0.85rem' }}>
                                <strong>Terms:</strong> {bid.terms}
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                  Document: 📁 {bid.pdfName || 'Quotation_Form.pdf'}
                                </span>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => setViewingPdfBid({ ...bid, rfqId: viewingRfq.id, rfqTitle: viewingRfq.title })}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                                      background: 'var(--btn-bg)', border: 'none', borderRadius: '6px', color: '#fff',
                                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500'
                                    }}
                                  >
                                    <FileText size={14} /> View PDF Invoice
                                  </button>
                                  <button
                                    onClick={() => {
                                      // Start chat directly
                                      const key = `${viewingRfq.id}-${bid.vendor}`
                                      if (!chats[key]) {
                                        setChats(prev => ({ ...prev, [key]: [] }))
                                      }
                                      setActiveChatKey(key)
                                      setActiveTab('chat')
                                    }}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                                      background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)',
                                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500'
                                    }}
                                  >
                                    <MessageSquare size={14} /> Chat
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNICATIONS HUB */}
          {activeTab === 'chat' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', flex: '1', minHeight: '500px' }}>
              {/* Chat Thread Selector */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Discussions</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {Object.keys(chats).map(key => {
                    // Extract metadata from key
                    const keyParts = key.split('-')
                    const rfqId = keyParts[0] + '-' + keyParts[1] + '-' + keyParts[2]
                    const vendorName = keyParts[3] || 'Supplier'
                    const messages = chats[key] || []
                    const lastMessage = messages[messages.length - 1]?.text || 'No correspondence logged.'
                    
                    return (
                      <div
                        key={key}
                        onClick={() => setActiveChatKey(key)}
                        style={{
                          padding: '12px', borderRadius: '8px', border: '1px solid',
                          borderColor: activeChatKey === key ? 'var(--accent-color)' : 'var(--border-color)',
                          background: activeChatKey === key ? 'rgba(173,139,115,0.1)' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--border-color)', borderRadius: '4px', fontWeight: 'bold' }}>
                            {rfqId}
                          </span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                            {messages.length} msg
                          </span>
                        </div>
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem' }}>{vendorName}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMessage}
                        </p>
                      </div>
                    )
                  })}

                  {Object.keys(chats).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 10px', opacity: 0.6 }}>
                      <MessageSquare size={24} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.85rem' }}>No conversations open. Start a chat directly from a submitted vendor quotation.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Thread Panel */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px' }}>
                {activeChatKey ? (
                  <>
                    {/* Header */}
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{activeChatKey.split('-')[3] || 'Supplier Vendor'}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RFQ Channel: {activeChatKey.split('-').slice(0,3).join('-')}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'green', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● Online
                      </span>
                    </div>

                    {/* Messages Body */}
                    <div style={{ flex: '1', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-color)' }}>
                      {(chats[activeChatKey] || []).length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto', fontSize: '0.85rem' }}>
                          <AlertCircle size={20} style={{ marginBottom: '6px' }} />
                          <p>No messages yet. Send a message below to start negotiating terms.</p>
                        </div>
                      ) : (
                        (chats[activeChatKey] || []).map((msg, idx) => {
                          const isOfficer = msg.sender === 'officer' || msg.sender === 'manager'
                          return (
                            <div
                              key={idx}
                              style={{
                                alignSelf: isOfficer ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isOfficer ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  background: isOfficer ? 'var(--btn-bg)' : 'var(--card-bg)',
                                  color: isOfficer ? '#FFFBE9' : 'var(--text-color)',
                                  border: isOfficer ? 'none' : '1px solid var(--border-color)',
                                  fontSize: '0.9rem'
                                }}
                              >
                                {msg.text}
                              </div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {msg.timestamp || 'Just now'}
                              </span>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Footer Input */}
                    <form onSubmit={handleSendChatMessage} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Type bargaining details or questions on PDF warranty..."
                        value={chatMessageText}
                        onChange={e => setChatMessageText(e.target.value)}
                        style={{
                          flex: '1', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)',
                          background: 'var(--bg-color)', color: 'var(--text-color)'
                        }}
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.6, padding: '40px' }}>
                    <MessageSquare size={48} style={{ marginBottom: '16px', color: 'var(--accent-color)' }} />
                    <h3>Discussion Panel</h3>
                    <p>Select a negotiation channel from the left sidebar to start messaging.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--btn-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 16px auto' }}>
                  RS
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>{profile.name}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{profile.department}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>EMPLOYEE ID</label>
                  <span style={{ fontWeight: '500' }}>{profile.employeeId}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>EMAIL ADDRESS</label>
                  <span style={{ fontWeight: '500' }}>{profile.email}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>CONTACT TELEPHONE</label>
                  <span style={{ fontWeight: '500' }}>{profile.phone}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>SECURITY ROLES</label>
                  <span style={{ fontWeight: '600', color: 'green', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '4px' }}>
                    <Shield size={14} /> Request RFQs & Manage Vendor Negotiations
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div style={{ padding: '0 32px 32px 32px' }}>
              <InvoiceBuilder userRole="PROCUREMENT_OFFICER" />
            </div>
          )}

        </div>
      </main>

      {/* DETAILED PDF QUOTATION INVOICE MODAL VIEW */}
      {viewingPdfBid && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: '#fff', color: '#111', width: '100%', maxWidth: '750px', borderRadius: '12px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)'
          }}>
            
            {/* Modal Title bar */}
            <div style={{ padding: '16px 24px', background: '#2E2520', color: '#FFFBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold' }}>Quotation Document Preview: {viewingPdfBid.pdfName}</span>
              <button 
                onClick={() => setViewingPdfBid(null)}
                style={{ background: 'transparent', border: 'none', color: '#FFFBE9', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Invoice Sheet */}
            {pdfBlobUrl ? (
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '550px' }}>
                <iframe
                  src={pdfBlobUrl}
                  title="PDF Viewer"
                  style={{ border: 'none', width: '100%', height: '100%', minHeight: '500px' }}
                />
              </div>
            ) : (
              <div style={{ flex: '1', overflowY: 'auto', padding: '40px', fontFamily: '"Courier New", Courier, monospace', fontSize: '0.9rem', lineHeight: '1.4' }}>
              
              {/* Header Letterhead */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px double #333', paddingBottom: '20px' }}>
                <div>
                  <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', letterSpacing: '1px' }}>{viewingPdfBid.vendor.toUpperCase()}</h2>
                  <p style={{ margin: '2px 0' }}>Industrial Area Hub, Bldg 4</p>
                  <p style={{ margin: '2px 0' }}>New Delhi, DL, India</p>
                  <p style={{ margin: '2px 0' }}>Tel: +91 91234 56789</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#888' }}>QUOTATION</h1>
                  <p style={{ margin: '2px 0' }}><strong>DATE:</strong> {new Date().toISOString().split('T')[0]}</p>
                  <p style={{ margin: '2px 0' }}><strong>REF RFQ:</strong> {viewingPdfBid.rfqId}</p>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', margin: '30px 0', fontSize: '0.85rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 6px 0' }}>PROSPECTIVE BUYER:</h4>
                  <p style={{ margin: '2px 0' }}>VyaparSetu Procurement Desk</p>
                  <p style={{ margin: '2px 0' }}>Officer in Charge: {profile.name}</p>
                  <p style={{ margin: '2px 0' }}>Department: {profile.department}</p>
                </div>
                <div style={{ paddingLeft: '40px' }}>
                  <h4 style={{ margin: '0 0 6px 0' }}>TERMS OF DELIVERY:</h4>
                  <p style={{ margin: '2px 0' }}><strong>TIMELINE:</strong> {viewingPdfBid.delivery}</p>
                  <p style={{ margin: '2px 0' }}><strong>VALID UNTIL:</strong> 30 Days from Date</p>
                  <p style={{ margin: '2px 0' }}><strong>FOB POINT:</strong> Warehouse Destination</p>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '35px 0' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '8px' }}>DESCRIPTION</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '120px' }}>QTY</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '160px' }}>UNIT PRICE</th>
                    <th style={{ padding: '8px', textAlign: 'right', width: '160px' }}>TOTAL PRICE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <strong>{viewingPdfBid.rfqTitle}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
                        Compliant with standard Technical requirements.
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>1 Lot</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>₹{viewingPdfBid.price.toLocaleString()}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>₹{viewingPdfBid.price.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>

              {/* Summary / Calculations */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #000', paddingTop: '15px' }}>
                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>SUBTOTAL:</span>
                    <span>₹{viewingPdfBid.price.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TAXES (GST @ 0%):</span>
                    <span>₹0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #bbb', paddingTop: '6px', fontWeight: 'bold', fontSize: '1rem' }}>
                    <span>NET TOTAL:</span>
                    <span>₹{viewingPdfBid.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Warranty details */}
              <div style={{ marginTop: '40px', padding: '16px', border: '1px solid #ddd', borderRadius: '6px', background: '#fafafa', fontSize: '0.8rem' }}>
                <strong style={{ display: 'block', marginBottom: '6px' }}>WARRANTY & CONTRACT DETAILS:</strong>
                <p style={{ margin: 0 }}>{viewingPdfBid.terms}</p>
              </div>

              {/* Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px dotted #ccc', paddingTop: '30px', fontSize: '0.75rem' }}>
                <div>
                  <p>Authorized Signature: ______________________</p>
                  <p style={{ opacity: 0.8 }}>Bidding Manager, {viewingPdfBid.vendor}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'green', fontWeight: 'bold' }}>✓ DIGITAL SECURITY KEY VERIFIED</p>
                  <p style={{ opacity: 0.8 }}>VyaparSetu Trusted Supplier Program</p>
                </div>
              </div>

            </div>
            )}

            {/* Footer buttons */}
            <div style={{ padding: '16px 24px', background: '#f5f5f5', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => {
                  if (pdfBlobUrl) {
                    const link = document.createElement('a')
                    link.href = pdfBlobUrl
                    link.download = viewingPdfBid.pdfName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  } else {
                    alert('Generating PDF Document... Check your downloads folder.')
                    // Trigger mock download
                    const content = `VyaparSetu Bid Document\nRef: ${viewingPdfBid.rfqId}\nVendor: ${viewingPdfBid.vendor}\nPrice: ₹${viewingPdfBid.price}\nTerms: ${viewingPdfBid.terms}`
                    const blob = new Blob([content], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = viewingPdfBid.pdfName
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                  background: '#2E2520', color: '#FFFBE9', border: 'none', borderRadius: '6px',
                  cursor: 'pointer', fontWeight: 'bold'
                }}
              >
                <Download size={16} /> Download Copy
              </button>
              <button 
                onClick={() => setViewingPdfBid(null)}
                className="btn btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile Details</h3>
              <button className="close-modal-btn" onClick={() => setShowProfileModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowProfileModal(false);
              alert('Profile updated successfully!');
            }} className="modal-form">
              <div className="form-group">
                <label htmlFor="profName">Full Name *</label>
                <input 
                  type="text" 
                  id="profName" 
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="profEmail">Email Address *</label>
                <input 
                  type="email" 
                  id="profEmail" 
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="profPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="profPhone" 
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="profDept">Department</label>
                <input 
                  type="text" 
                  id="profDept" 
                  value={profile.department}
                  onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
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

    </div>
  )
}

export default OfficerDashboard
