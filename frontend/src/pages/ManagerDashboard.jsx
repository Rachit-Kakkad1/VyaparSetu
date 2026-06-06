import React, { useState } from 'react'
import { 
  CheckSquare, XSquare, TrendingUp, AlertTriangle, 
  MessageSquare, LogOut, Check, X, Sparkles, 
  RefreshCw, BarChart3, Star, Percent, Truck, Send 
} from 'lucide-react'

function ManagerDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'vendor-quotations' | 'decided' | 'vendors'
  
  // Modals & Active Selections
  const [selectedBid, setSelectedBid] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [rejectReason, setRejectReason] = useState('Too Expensive')
  
  // New States: Fullscreen RFQ list and Detailed Quotation Popup
  const [fullScreenRfq, setFullScreenRfq] = useState(null)
  const [detailedBid, setDetailedBid] = useState(null)

  // Active Discussion Session state
  const [activeChat, setActiveChat] = useState(null) // { rfqId, title, vendor, messages: [...] }
  const [chatInput, setChatInput] = useState('')

  // AI Floating Assistant state
  const [isAiExpanded, setIsAiExpanded] = useState(false)
  const [selectedAiRfqId, setSelectedAiRfqId] = useState('REQ-2026-101')
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState({
    recommended: 'Vendor B (Global Parts)',
    reasons: [
      'Lowest Cost structure (₹23,50,000 vs ₹24,00,000)',
      'Fulfillment timeline falls within requested deadline (10 days)',
      'Excellent Vendor Rating of 4.8/5',
      'Highly reliable fulfillment on 42 past purchase cycles'
    ]
  })

  // Profile management
  const [managerProfile, setManagerProfile] = useState({ name: 'Sarah Jenkins', email: 'manager@vendorbridge.com', phone: '+91 98765 00001' })
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Officer Rohan Sharma requested list: 50 Laptops and 50 Mobiles. Vendors notified!', date: 'Just now', read: false },
    { id: 2, text: 'New Quotation uploaded by Acme Supplies Ltd for 50 Mobiles.', date: '10 mins ago', read: false },
    { id: 3, text: 'PO-2026-08 successfully accepted by vendor.', date: '2 hours ago', read: true }
  ])

  // Mock Database 1: Published RFQs with detailed warranty/terms
  const [publishedRfqs, setPublishedRfqs] = useState([
    {
      id: 'REQ-2026-101',
      title: 'Procurement of 50 Laptops',
      status: 'Published to Vendors',
      bids: [
        { vendor: 'Vendor A (Acme Supplies)', price: 2400000, delivery: '7 days', rating: 4.5, terms: 'Includes 3 years onsite hardware replacement, express setup, and dedicated technical helpdesk.', status: 'Pending Review' },
        { vendor: 'Vendor B (Global Parts)', price: 2350000, delivery: '10 days', rating: 4.8, terms: 'Includes 1 year standard warranty, spare battery pack, and bulk volume discounts on next order.', status: 'Pending Review' },
        { vendor: 'Vendor C (SteelCorp)', price: 2600000, delivery: '5 days', rating: 4.2, terms: 'Includes 5 years manufacturer parts warranty and free door-to-door shipping.', status: 'Pending Review' }
      ]
    },
    {
      id: 'REQ-2026-102',
      title: 'Procurement of 50 Mobiles',
      status: 'Published to Vendors',
      bids: [
        { vendor: 'Vendor A (Acme Supplies)', price: 1000000, delivery: '7 days', rating: 4.5, terms: 'Includes 2 years insurance, phone screen guard, and protective rugged back covers.', status: 'Pending Review' },
        { vendor: 'Vendor C (SteelCorp)', price: 1100000, delivery: '5 days', rating: 4.2, terms: 'Includes 1 year damage protection warranty and express air cargo courier delivery.', status: 'Pending Review' }
      ]
    }
  ])

  // Mock Database 2: Discussion Histories keyed by 'rfqId-vendorName'
  const [chatHistories, setChatHistories] = useState({
    'REQ-2026-101-Vendor A (Acme Supplies)': [
      { sender: 'vendor', text: 'Greetings, we can offer bulk warranty extension for 3 years at this price.', timestamp: '11:15 AM' },
      { sender: 'manager', text: 'Can you match the pricing structure of Vendor B at ₹23,50,000?', timestamp: '11:20 AM' },
      { sender: 'vendor', text: 'We can lower it to ₹23,80,000 if PO is generated today.', timestamp: '11:22 AM' }
    ],
    'REQ-2026-101-Vendor B (Global Parts)': [
      { sender: 'vendor', text: 'We have laptops in stock and can deliver within 10 days.', timestamp: '10:45 AM' },
      { sender: 'manager', text: 'Excellent. Is there any additional discount for direct bank transfer?', timestamp: '10:50 AM' }
    ]
  })

  // Mock Database 3: Historical approvals
  const [decidedRequests, setDecidedRequests] = useState([
    { id: 'REQ-2026-098', title: 'Procurement of Brass Valves', vendor: 'SteelCorp Industries', decision: 'Approved', remarks: 'Approved due to lowest total cost.', date: '2026-05-30' },
    { id: 'REQ-2026-099', title: 'IT Workspace Upgrade Accessories', vendor: 'Acme Supplies Ltd', decision: 'Rejected', remarks: 'Rejected due to late delivery timeline.', date: '2026-06-02' }
  ])

  // Vendor profiles
  const [vendorsList, setVendorsList] = useState([
    { name: 'Acme Supplies Ltd', rating: 4.5, pastOrders: 24, deliveryPerf: 'Excellent', lastOrder: '2026-06-01' },
    { name: 'Global Parts Co.', rating: 4.8, pastOrders: 42, deliveryPerf: 'Outstanding', lastOrder: '2026-05-28' },
    { name: 'SteelCorp Industries', rating: 4.2, pastOrders: 15, deliveryPerf: 'Good', lastOrder: '2026-05-25' }
  ])

  // Quotation Decisions (Approve/Reject specific vendor quotation)
  const handleApproveQuotation = (e) => {
    e.preventDefault()
    if (!selectedBid) return

    const decisionLog = {
      id: selectedBid.rfqId,
      title: selectedBid.title,
      vendor: selectedBid.vendorName,
      decision: 'Approved',
      remarks: remarks || 'Approved due to optimal pricing and specifications.',
      date: new Date().toISOString().split('T')[0]
    }

    setDecidedRequests(prev => [decisionLog, ...prev])

    // Remove this RFQ from active list since it is decided
    setPublishedRfqs(prev => prev.filter(r => r.id !== selectedBid.rfqId))
    setFullScreenRfq(null) // clear fullscreen modal if it was open

    setShowApprovalModal(false)
    setSelectedBid(null)
    setRemarks('')

    alert(`Quotation from ${decisionLog.vendor} APPROVED. PO Generation enabled.`);
  }

  const handleRejectQuotation = (e) => {
    e.preventDefault()
    if (!selectedBid) return

    const decisionLog = {
      id: selectedBid.rfqId,
      title: selectedBid.title,
      vendor: selectedBid.vendorName,
      decision: 'Rejected',
      remarks: `Rejected: ${rejectReason}. Details: ${remarks}`,
      date: new Date().toISOString().split('T')[0]
    }

    setDecidedRequests(prev => [decisionLog, ...prev])

    // Remove this vendor bid from active bids for this RFQ
    setPublishedRfqs(prev => prev.map(rfq => {
      if (rfq.id === selectedBid.rfqId) {
        return {
          ...rfq,
          bids: rfq.bids.filter(b => b.vendor !== selectedBid.vendorName)
        }
      }
      return rfq
    }))

    // Update full screen state bids list
    setFullScreenRfq(prev => {
      if (prev && prev.id === selectedBid.rfqId) {
        const remaining = prev.bids.filter(b => b.vendor !== selectedBid.vendorName);
        if (remaining.length === 0) return null; // close fullscreen if no bids left
        return { ...prev, bids: remaining };
      }
      return prev;
    })

    setShowRejectionModal(false)
    setSelectedBid(null)
    setRemarks('')

    alert(`Quotation from ${decisionLog.vendor} REJECTED.`);
  }

  // Interactive Discussion Negotiator
  const openChatWithVendor = (rfqId, rfqTitle, vendorName) => {
    const chatKey = `${rfqId}-${vendorName}`
    const messages = chatHistories[chatKey] || []
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
      sender: 'manager',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const chatKey = `${activeChat.rfqId}-${activeChat.vendor}`
    const updatedMessages = [...(chatHistories[chatKey] || []), newMessage]

    // Save to database state
    setChatHistories(prev => ({
      ...prev,
      [chatKey]: updatedMessages
    }))

    // Update active chat UI
    setActiveChat(prev => ({
      ...prev,
      messages: updatedMessages
    }))

    setChatInput('')

    // Simulate automatic vendor reply in 1.5 seconds
    setTimeout(() => {
      const reply = {
        sender: 'vendor',
        text: `Acknowledged, Sarah. We will review this and respond with our revised quotation shortly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      const withReply = [...updatedMessages, reply]
      setChatHistories(prev => ({
        ...prev,
        [chatKey]: withReply
      }))
      setActiveChat(prev => {
        if (prev && prev.rfqId === activeChat.rfqId && prev.vendor === activeChat.vendor) {
          return { ...prev, messages: withReply }
        }
        return prev
      })
    }, 1500)
  }

  // AI Recommendation simulation on selected RFQ
  const handleAIAnalysis = () => {
    setAiAnalyzing(true)
    setTimeout(() => {
      setAiAnalyzing(false)
      if (selectedAiRfqId === 'REQ-2026-101') {
        setAiAnalysisResult({
          recommended: 'Vendor B (Global Parts)',
          reasons: [
            'Lowest Cost structure (₹23,50,000 vs ₹24,00,000)',
            'Fulfillment timeline falls within requested deadline (10 days)',
            'Excellent Vendor Rating of 4.8/5',
            'Highly reliable fulfillment on 42 past purchase cycles'
          ]
        })
      } else {
        setAiAnalysisResult({
          recommended: 'Vendor A (Acme Supplies)',
          reasons: [
            'Lowest overall bid (₹10,00,000 vs ₹11,00,000)',
            'Excellent rating profile and fast turnaround cycles (7 days)',
            'Highly consistent historical delivery speed and positive record'
          ]
        })
      }
    }, 1200)
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="dashboard-layout" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Left Sidebar */}
      <aside className="dashboard-sidebar" style={{ height: '100vh', overflowY: 'auto' }}>
        <div className="sidebar-brand">
          <div className="brand-icon">VS</div>
          <div className="brand-details">
            <span className="brand-name">VyaparSetu</span>
            <span className="brand-role">Manager Panel</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setFullScreenRfq(null); }}
          >
            <BarChart3 size={18} />
            <span>Overview & Stats</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'vendor-quotations' ? 'active' : ''}`}
            onClick={() => { setActiveTab('vendor-quotations'); setFullScreenRfq(null); }}
          >
            <TrendingUp size={18} />
            <span>Pending Approvals ({publishedRfqs.length})</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'decided' ? 'active' : ''}`}
            onClick={() => { setActiveTab('decided'); setFullScreenRfq(null); }}
          >
            <CheckSquare size={18} />
            <span>Decision Log ({decidedRequests.length})</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'vendors' ? 'active' : ''}`}
            onClick={() => { setActiveTab('vendors'); setFullScreenRfq(null); }}
          >
            <Truck size={18} />
            <span>Vendor Matrix</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="dashboard-theme-toggle" onClick={toggleDarkMode}>
            <RefreshCw size={14} />
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <div className="admin-profile-card" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">SJ</div>
            <div className="profile-info">
              <span className="profile-name">{managerProfile.name}</span>
              <span className="profile-email">{managerProfile.email}</span>
            </div>
            <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onNavigate('landing'); }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="dashboard-main" style={{ position: 'relative', height: '100vh', overflowY: 'auto' }}>
        {fullScreenRfq ? (
          /* FULLSCREEN VIEW ALL QUOTATIONS OVERLAY (INSIDE MAIN AREA) */
          <div 
            style={{
              padding: '40px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              width: '100%',
              overflowY: 'auto',
              background: 'var(--bg-color)',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <span className="count-indicator" style={{ fontSize: '0.8rem' }}>Active RFQ: {fullScreenRfq.id}</span>
                <h2 style={{ margin: '6px 0 0 0', fontSize: '1.7rem', color: 'var(--text-primary)' }}>{fullScreenRfq.title}</h2>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Listing of all Vendor Quotations submitted</p>
              </div>
              <button 
                onClick={() => setFullScreenRfq(null)}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="dashboard-table-container" style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Vendor (Click for details)</th>
                    <th>Price Quote</th>
                    <th>Delivery Timeline</th>
                    <th>Trust Rating</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fullScreenRfq.bids.map((bid, index) => (
                    <tr key={index}>
                      <td 
                        onClick={() => setDetailedBid({ ...bid, rfqId: fullScreenRfq.id, rfqTitle: fullScreenRfq.title })} 
                        style={{ cursor: 'pointer', color: 'var(--accent-color)' }}
                        title="Click to view detailed format"
                      >
                        <strong>{bid.vendor}</strong>
                      </td>
                      <td><strong style={{ fontSize: '0.95rem' }}>₹{bid.price.toLocaleString()}</strong></td>
                      <td>{bid.delivery}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Star size={14} fill="#eab308" stroke="#eab308" />
                          {bid.rating}/5
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn btn-primary" 
                            onClick={() => { setSelectedBid({ rfqId: fullScreenRfq.id, title: fullScreenRfq.title, vendorName: bid.vendor, price: bid.price }); setShowApprovalModal(true); }}
                            style={{ background: 'var(--success-color)', padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => { setSelectedBid({ rfqId: fullScreenRfq.id, title: fullScreenRfq.title, vendorName: bid.vendor, price: bid.price }); setShowRejectionModal(true); }}
                            style={{ border: '1px solid var(--error-color)', color: 'var(--error-color)', padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Reject
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => { openChatWithVendor(fullScreenRfq.id, fullScreenRfq.title, bid.vendor); }}
                            style={{ border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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
          </div>
        ) : (
          <>
        <header className="dashboard-header">
          <div className="header-title-box">
            <h1>
              {activeTab === 'overview' && 'Procurement Insights'}
              {activeTab === 'vendor-quotations' && 'Active Vendor Quotations'}
              {activeTab === 'decided' && 'Decision Ledger'}
              {activeTab === 'vendors' && 'Vendor Reliability Log'}
            </h1>
            <p className="header-subtitle">
              {activeTab === 'overview' && 'Review statistics, active alerts, and notification histories.'}
              {activeTab === 'vendor-quotations' && 'Review submitted supplier quotations side-by-side. Approve, reject, or open a discussion.'}
              {activeTab === 'decided' && 'Historical register of all quotation decisions.'}
              {activeTab === 'vendors' && 'Ratings, fulfillment logs, and delivery performance metrics.'}
            </p>
          </div>

          <div className="system-indicator-badge">
            <span className="indicator-pulse"></span>
            <span>Manager Mode Active</span>
          </div>
        </header>

        <div className="dashboard-body" style={{ paddingBottom: '120px' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <section className="stats-kpi-grid">
                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Pending Quotations</span>
                    <AlertTriangle size={16} className="kpi-icon-grey text-orange" />
                  </div>
                  <span className="kpi-value">{publishedRfqs.length}</span>
                  <div className="kpi-footer text-orange">
                    <span>Awaiting your review</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Approved Decisions</span>
                    <CheckSquare size={16} className="kpi-icon-grey text-green" />
                  </div>
                  <span className="kpi-value">{decidedRequests.filter(r => r.decision === 'Approved').length}</span>
                  <div className="kpi-footer text-green">
                    <span>PO Release Activated</span>
                  </div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-header">
                    <span className="kpi-title">Rejected Bids</span>
                    <XSquare size={16} className="kpi-icon-grey text-red" />
                  </div>
                  <span className="kpi-value">{decidedRequests.filter(r => r.decision === 'Rejected').length}</span>
                  <div className="kpi-footer text-red">
                    <span>Logged for audits</span>
                  </div>
                </div>
              </section>

              <div className="analytics-graph-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>System Notifications</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fulfillment alerts and officer-drafted product pipelines.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={markAllRead}>Mark all read</button>
                </div>

                <div className="logs-ledger-container" style={{ maxHeight: '250px' }}>
                  {notifications.map(n => (
                    <div key={n.id} className={`log-entry-item ${n.read ? 'read-notification' : 'severity-info'}`}>
                      <div className="log-badge-marker">
                        <MessageSquare size={14} />
                      </div>
                      <div className="log-body-content">
                        <div className="log-action-msg" style={{ fontWeight: n.read ? 'normal' : '600' }}>{n.text}</div>
                        <div className="log-time-stamp">{n.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VENDOR QUOTATIONS REVIEW PANE */}
          {activeTab === 'vendor-quotations' && (
            <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {publishedRfqs.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  <TrendingUp size={40} style={{ color: 'var(--text-secondary)', marginBottom: '15px' }} />
                  <h3>No Active Vendor Quotations</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>All RFQs have been fully decided.</p>
                </div>
              ) : (
                publishedRfqs.map(rfq => (
                  <div key={rfq.id} className="analytics-graph-card" style={{ padding: '24px' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="count-indicator" style={{ fontSize: '0.75rem' }}>Active RFQ: {rfq.id}</span>
                        <span className="pipeline-stage-badge stage-open">{rfq.status}</span>
                      </div>
                      <h3 style={{ margin: '8px 0 0 0', fontSize: '1.25rem' }}>{rfq.title}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Quotations Submitted by Vendor Partners</h4>
                      
                      {rfq.bids.length === 0 ? (
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No active quotations for this item.</p>
                      ) : (
                        <div>
                          <div className="dashboard-table-container">
                            <table className="dashboard-table">
                              <thead>
                                <tr>
                                  <th>Vendor (Click for details)</th>
                                  <th>Price Quote</th>
                                  <th>Delivery Timeline</th>
                                  <th>Trust Rating</th>
                                  <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rfq.bids.slice(0, 2).map((bid, index) => (
                                  <tr key={index}>
                                    <td 
                                      onClick={() => setDetailedBid({ ...bid, rfqId: rfq.id, rfqTitle: rfq.title })} 
                                      style={{ cursor: 'pointer', color: 'var(--accent-color)' }}
                                      title="Click to view detailed format"
                                    >
                                      <strong>{bid.vendor}</strong>
                                    </td>
                                    <td><strong style={{ fontSize: '0.95rem' }}>₹{bid.price.toLocaleString()}</strong></td>
                                    <td>{bid.delivery}</td>
                                    <td>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} fill="#eab308" stroke="#eab308" />
                                        {bid.rating}/5
                                      </span>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button 
                                          className="btn btn-primary" 
                                          onClick={() => { setSelectedBid({ rfqId: rfq.id, title: rfq.title, vendorName: bid.vendor, price: bid.price }); setShowApprovalModal(true); }}
                                          style={{ background: 'var(--success-color)', padding: '6px 12px', fontSize: '0.8rem' }}
                                        >
                                          Approve
                                        </button>
                                        <button 
                                          className="btn btn-secondary" 
                                          onClick={() => { setSelectedBid({ rfqId: rfq.id, title: rfq.title, vendorName: bid.vendor, price: bid.price }); setShowRejectionModal(true); }}
                                          style={{ border: '1px solid var(--error-color)', color: 'var(--error-color)', padding: '6px 12px', fontSize: '0.8rem' }}
                                        >
                                          Reject
                                        </button>
                                        <button 
                                          className="btn btn-secondary" 
                                          onClick={() => openChatWithVendor(rfq.id, rfq.title, bid.vendor)}
                                          style={{ border: '1px solid var(--accent-color)', color: 'var(--accent-color)', padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
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

                          {rfq.bids.length > 2 && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                              <button 
                                className="btn btn-secondary"
                                onClick={() => setFullScreenRfq(rfq)}
                                style={{ fontSize: '0.85rem', padding: '8px 16px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                View All Quotations ({rfq.bids.length})
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: DECISION LEDGER */}
          {activeTab === 'decided' && (
            <div className="tab-pane-fade">
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>RFQ Reference</th>
                      <th>Project / Title</th>
                      <th>Selected Vendor</th>
                      <th>Resolution Status</th>
                      <th>Remarks</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decidedRequests.map((req, index) => (
                      <tr key={index}>
                        <td><code>{req.id}</code></td>
                        <td><strong>{req.title}</strong></td>
                        <td>{req.vendor || 'N/A'}</td>
                        <td>
                          <span className={`role-badge-label`} style={{ background: req.decision === 'Approved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: req.decision === 'Approved' ? 'var(--success-color)' : 'var(--error-color)' }}>
                            {req.decision.toUpperCase()}
                          </span>
                        </td>
                        <td><span style={{ fontStyle: 'italic' }}>"{req.remarks}"</span></td>
                        <td>{req.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VENDORS MATRIX */}
          {activeTab === 'vendors' && (
            <div className="tab-pane-fade">
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Vendor Partner</th>
                      <th>Rating</th>
                      <th>Past Completed Orders</th>
                      <th>Delivery Speed</th>
                      <th>Last Trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorsList.map((v, idx) => (
                      <tr key={idx}>
                        <td><strong>{v.name}</strong></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Star size={14} fill="#eab308" stroke="#eab308" />
                            <strong>{v.rating} / 5.0</strong>
                          </div>
                        </td>
                        <td>{v.pastOrders} cycles</td>
                        <td>
                          <span className="pipeline-stage-badge stage-open">{v.deliveryPerf}</span>
                        </td>
                        <td>{v.lastOrder}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </>
    )}
  </main>

      {/* FLOATING AI ASSISTANT PANEL (BOTTOM RIGHT CORNER) */}
      <div 
        className={`ai-helper-dock ${isAiExpanded ? 'expanded' : 'collapsed'}`} 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          width: isAiExpanded ? '380px' : '64px',
          height: isAiExpanded ? '390px' : '64px',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          borderRadius: isAiExpanded ? '16px' : '50%',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.25)',
          overflow: 'hidden',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <button 
          onClick={() => setIsAiExpanded(true)}
          className="animate-pulse-glow"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
            color: '#FFF', 
            border: 'none', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
            opacity: isAiExpanded ? 0 : 1,
            visibility: isAiExpanded ? 'hidden' : 'visible',
            transition: 'opacity 0.2s ease-in-out, visibility 0.2s'
          }}
        >
          <Sparkles size={26} />
        </button>

        <div style={{
          opacity: isAiExpanded ? 1 : 0,
          visibility: isAiExpanded ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease-in-out 0.1s, visibility 0.3s',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
              color: '#FFF', 
              padding: '14px 20px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} />
              <strong style={{ fontSize: '0.9rem' }}>AI Quotation Evaluator</strong>
            </div>
            <button 
              onClick={() => setIsAiExpanded(false)}
              style={{ background: 'transparent', border: 'none', color: '#FFF', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label htmlFor="aiRfqSelect" style={{ fontSize: '0.7rem' }}>RFQ Analysis Target</label>
              <select 
                id="aiRfqSelect"
                value={selectedAiRfqId}
                onChange={(e) => { setSelectedAiRfqId(e.target.value); handleAIAnalysis(); }}
                style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="REQ-2026-101">REQ-2026-101 - 50 Laptops</option>
                <option value="REQ-2026-102">REQ-2026-102 - 50 Mobiles</option>
              </select>
            </div>

            {aiAnalyzing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', border: '1px dashed #8b5cf6', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.05)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ color: '#8b5cf6', marginBottom: '10px' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Processing quotations...</span>
              </div>
            ) : aiAnalysisResult ? (
              <div style={{ border: '1px solid rgba(139, 92, 246, 0.2)', padding: '12px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.03)' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem' }}>AI Suggested: <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{aiAnalysisResult.recommended}</span></h4>
                <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {aiAnalysisResult.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <button 
              className="btn btn-primary animate-pulse-glow" 
              onClick={handleAIAnalysis}
              style={{ padding: '8px 14px', background: '#8b5cf6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <Sparkles size={14} /> Analyze Quotations
            </button>
          </div>
        </div>
      </div>

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
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
              animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)' }}>
              <div>
                <span className="count-indicator" style={{ fontSize: '0.7rem' }}>Discussion Room</span>
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
                  const isManager = msg.sender === 'manager'
                  return (
                    <div 
                      key={i} 
                      style={{ 
                        alignSelf: isManager ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isManager ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div 
                        style={{
                          padding: '10px 15px',
                          borderRadius: '12px',
                          borderTopRightRadius: isManager ? '2px' : '12px',
                          borderTopLeftRadius: isManager ? '12px' : '2px',
                          backgroundColor: isManager ? 'var(--accent-color)' : 'var(--card-bg)',
                          color: isManager ? '#FFFBE9' : 'var(--text-primary)',
                          border: isManager ? 'none' : '1px solid var(--border-color)',
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



      {/* POPUP MODAL: DETAILED FORMAT OF QUOTATION */}
      {detailedBid && (
        <div className="modal-overlay" onClick={() => setDetailedBid(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} style={{ color: 'var(--accent-color)' }} />
                Quotation Details: {detailedBid.vendor}
              </h3>
              <button className="close-modal-btn" onClick={() => setDetailedBid(null)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Reference RFQ</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailedBid.rfqId}</strong>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Item Category</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailedBid.rfqTitle}</strong>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Total Price Quote</span>
                  <strong style={{ color: 'var(--success-color)', fontSize: '0.95rem' }}>₹{detailedBid.price.toLocaleString()}</strong>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Delivery SLA</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{detailedBid.delivery}</strong>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Trust Score</span>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                    <Star size={14} fill="#eab308" stroke="#eab308" />
                    {detailedBid.rating} / 5.0
                  </strong>
                </div>
              </div>

              <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>Additional Fulfillment & Logistics Terms</span>
                <p style={{ margin: 0, lineHeight: '1.4', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                  {detailedBid.terms || 'Standard delivery terms apply. Includes warranty as per corporate contract agreements.'}
                </p>
              </div>

              <div className="modal-action-buttons" style={{ marginTop: '10px' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setDetailedBid(null)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: APPROVE QUOTATION CONTEXT */}
      {showApprovalModal && selectedBid && (
        <div className="modal-overlay" onClick={() => { setShowApprovalModal(false); setSelectedBid(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approve Supplier Quotation</h3>
              <button className="close-modal-btn" onClick={() => { setShowApprovalModal(false); setSelectedBid(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApproveQuotation} className="modal-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Approving this quotation will mark the quotation as <strong>ACCEPTED</strong> and authorize PO generation for <strong>{selectedBid.vendorName}</strong>.
              </p>

              <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                <strong>Project:</strong> {selectedBid.title} <br/>
                <strong>Price Quote:</strong> ₹{selectedBid.price.toLocaleString()}
              </div>

              <div className="form-group">
                <label htmlFor="approveRemarks">Approval Justification Remarks *</label>
                <textarea 
                  id="approveRemarks"
                  rows="3"
                  placeholder="Approved due to lowest cost / fast delivery..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                  required
                ></textarea>
              </div>

              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary cancel-btn"
                  onClick={() => { setShowApprovalModal(false); setSelectedBid(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" style={{ background: 'var(--success-color)' }}>
                  Approve Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT QUOTATION CONTEXT */}
      {showRejectionModal && selectedBid && (
        <div className="modal-overlay" onClick={() => { setShowRejectionModal(false); setSelectedBid(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--error-color)' }}>
              <h3 style={{ color: 'var(--error-color)' }}>Reject Supplier Quotation</h3>
              <button className="close-modal-btn" onClick={() => { setShowRejectionModal(false); setSelectedBid(null); }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRejectQuotation} className="modal-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Rejecting this quotation will exclude <strong>{selectedBid.vendorName}</strong> from this RFQ cycle.
              </p>

              <div className="form-group">
                <label htmlFor="rejectReason">Rejection Reason *</label>
                <select 
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                >
                  <option value="Too Expensive">Too Expensive (Bids exceed allocated budget)</option>
                  <option value="Late Delivery">Late Delivery (Timeline is too slow)</option>
                  <option value="Poor Vendor History">Poor Vendor History (Low rating / compliance risks)</option>
                  <option value="Other">Other Category (Describe in remarks below)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rejectRemarks">Remarks / Audit Justification *</label>
                <textarea 
                  id="rejectRemarks"
                  rows="3"
                  placeholder="Justify the rejection decision..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                  required
                ></textarea>
              </div>

              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="btn btn-secondary cancel-btn"
                  onClick={() => { setShowRejectionModal(false); setSelectedBid(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" style={{ background: 'var(--error-color)' }}>
                  Reject Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT MANAGER PROFILE */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Manager Profile</h3>
              <button className="close-modal-btn" onClick={() => setShowProfileModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              setShowProfileModal(false);
            }} className="modal-form">
              <div className="form-group">
                <label htmlFor="mgrName">Full Name *</label>
                <input 
                  type="text" 
                  id="mgrName" 
                  value={managerProfile.name}
                  onChange={(e) => setManagerProfile(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="mgrEmail">Email Address *</label>
                <input 
                  type="email" 
                  id="mgrEmail" 
                  value={managerProfile.email}
                  onChange={(e) => setManagerProfile(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="mgrPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="mgrPhone" 
                  value={managerProfile.phone}
                  onChange={(e) => setManagerProfile(prev => ({ ...prev, phone: e.target.value }))}
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

export default ManagerDashboard
