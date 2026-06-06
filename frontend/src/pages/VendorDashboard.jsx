import React, { useState, useEffect } from 'react'
import {
  FileText, MessageSquare, LogOut, Download, Sparkles, Send, Check,
  AlertCircle, Shield, Briefcase, Layers, User, Settings, ArrowRight,
  TrendingUp, Clock, FileCheck, CheckCircle, Upload, Sun, Moon, RefreshCw, X
} from 'lucide-react'

// Default values in case they aren't initialized yet
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
        pdfName: 'QUOTE_LAPTOPS_ACME.pdf'
      },
      { 
        vendor: 'Vendor B (Global Parts)', 
        price: 2350000, 
        delivery: '10 days', 
        rating: 4.8, 
        terms: 'Includes 1 year standard warranty, spare battery pack, and bulk volume discounts on next order.', 
        status: 'Pending Review',
        pdfName: 'QUOTE_50LAPTOPS_GLOBAL.pdf'
      }
    ],
    dateCreated: '2026-06-05'
  }
]

const defaultChats = {
  'REQ-2026-101-Vendor A (Acme Supplies)': [
    { sender: 'vendor', text: 'Greetings, we can offer bulk warranty extension for 3 years at this price.', timestamp: '11:15 AM' },
    { sender: 'officer', text: 'Can you match the pricing structure of Vendor B at ₹23,50,000?', timestamp: '11:20 AM' },
    { sender: 'vendor', text: 'We can lower it to ₹23,80,000 if PO is generated today.', timestamp: '11:22 AM' }
  ]
}

function VendorDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('rfqs') // 'rfqs' | 'bids' | 'chat' | 'profile'

  // Load from localStorage or set defaults
  const [rfqs, setRfqs] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_rfqs')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    return defaultRfqs
  })

  const [chats, setChats] = useState(() => {
    const stored = localStorage.getItem('vyaparsetu_chats')
    if (stored) {
      try { return JSON.parse(stored) } catch(e) {}
    }
    return defaultChats
  })

  // Sync state back to localStorage
  useEffect(() => {
    localStorage.setItem('vyaparsetu_rfqs', JSON.stringify(rfqs))
  }, [rfqs])

  useEffect(() => {
    localStorage.setItem('vyaparsetu_chats', JSON.stringify(chats))
  }, [chats])

  // Active user / vendor profile (Defaulting to Acme Supplies)
  const [vendorProfile, setVendorProfile] = useState({
    companyName: 'Vendor A (Acme Supplies)',
    contactPerson: 'Aditya Mehta',
    email: 'vendor@vendorbridge.com',
    phone: '+91 98765 00010',
    address: 'Sector 4, Phase 2, Industrial Hub, New Delhi, 110020',
    gstin: '07AAAAA1234A1Z0',
    rating: 4.5
  })
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Bidding Modal States
  const [biddingRfq, setBiddingRfq] = useState(null)
  const [bidPrice, setBidPrice] = useState('')
  const [bidDelivery, setBidDelivery] = useState('7 days')
  const [bidTerms, setBidTerms] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatedPdfAttached, setGeneratedPdfAttached] = useState(false)
  const [previewPdfData, setPreviewPdfData] = useState(null)

  // Chat panel states
  const [activeChatKey, setActiveChatKey] = useState('')
  const [chatMessageText, setChatMessageText] = useState('')

  // Filter out RFQs that this vendor has already bid on for the submission portal
  const activeIncomingRfqs = rfqs.filter(rfq => {
    if (!rfq.bids) return true
    return !rfq.bids.some(b => b.vendor === vendorProfile.companyName)
  })

  // Find RFQs this vendor has bid on
  const submittedBids = []
  rfqs.forEach(rfq => {
    if (rfq.bids) {
      const myBid = rfq.bids.find(b => b.vendor === vendorProfile.companyName)
      if (myBid) {
        submittedBids.push({
          rfqId: rfq.id,
          rfqTitle: rfq.title,
          category: rfq.category,
          price: myBid.price,
          delivery: myBid.delivery,
          terms: myBid.terms,
          status: myBid.status || 'Pending Review',
          pdfName: myBid.pdfName || 'Quotation.pdf',
          dateSubmitted: rfq.dateCreated
        })
      }
    }
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedFile({
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          url: reader.result
        })
        setGeneratedPdfAttached(false)
        alert(`Quotation PDF "${file.name}" uploaded successfully. Ready to attach to bid.`)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGeneratePdfQuotation = () => {
    if (!bidPrice || !bidDelivery) {
      alert('Please fill in the bidding price and delivery timeline first to populate the PDF.')
      return
    }

    setGeneratingPdf(true)
    setTimeout(() => {
      setUploadedFile(null)
      setGeneratedPdfAttached(true)
      setGeneratingPdf(false)

      const docName = `QUOTE_${biddingRfq.id.replace(/-/g, '_')}_ACME.pdf`
      setPreviewPdfData({
        pdfName: docName,
        rfqId: biddingRfq.id,
        rfqTitle: biddingRfq.title,
        price: parseFloat(bidPrice),
        delivery: bidDelivery,
        terms: bidTerms || 'Standard commercial warranty and door-to-door delivery included.'
      })
      alert(`Quotation PDF generated automatically: "${docName}"`)
    }, 800)
  }

  const handleSubmitBid = (e) => {
    e.preventDefault()
    if (!bidPrice || !bidDelivery) return

    if (!uploadedFile && !generatedPdfAttached) {
      alert('Please either upload a Quotation PDF file or click "Generate & Attach PDF Quotation" to proceed.')
      return
    }

    const finalPdfName = uploadedFile ? uploadedFile.name : previewPdfData.pdfName
    const finalPdfUrl = uploadedFile ? uploadedFile.url : null

    const newBid = {
      vendor: vendorProfile.companyName,
      price: parseFloat(bidPrice),
      delivery: bidDelivery,
      rating: vendorProfile.rating,
      terms: bidTerms || 'Standard terms of contract and compliance with tech specifications.',
      status: 'Pending Review',
      pdfName: finalPdfName,
      pdfUrl: finalPdfUrl
    }

    // Update the RFQ bid list in the local state
    setRfqs(prev => prev.map(rfq => {
      if (rfq.id === biddingRfq.id) {
        const existingBids = rfq.bids || []
        return {
          ...rfq,
          bids: [...existingBids, newBid]
        }
      }
      return rfq
    }))

    // Automatically trigger/initialize a chat room between this Vendor and the Officer for this RFQ
    const chatKey = `${biddingRfq.id}-${vendorProfile.companyName}`
    if (!chats[chatKey]) {
      setChats(prev => ({
        ...prev,
        [chatKey]: [
          { sender: 'vendor', text: `Hello! We have submitted our formal proposal with PDF quotation for ${biddingRfq.id}. Let us know if you need any adjustments.`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      }))
    }

    alert(`Quotation submitted successfully for ${biddingRfq.id}! Formal bid document ${finalPdfName} has been transmitted.`)
    
    // Reset modal fields
    setBiddingRfq(null)
    setBidPrice('')
    setBidDelivery('7 days')
    setBidTerms('')
    setUploadedFile(null)
    setGeneratedPdfAttached(false)
    setPreviewPdfData(null)
  }

  const handleSendChatMessage = (e) => {
    e.preventDefault()
    if (!activeChatKey || !chatMessageText.trim()) return

    const message = {
      sender: 'vendor',
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
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            VS
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>VyaparSetu</h3>
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>SUPPLIER VENDOR</span>
          </div>
        </div>

        <nav style={{ flex: '1', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            className={`nav-btn ${activeTab === 'rfqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('rfqs')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'rfqs' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <Layers size={18} />
            <span>Active RFQs</span>
            {activeIncomingRfqs.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'var(--accent-color)', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                {activeIncomingRfqs.length}
              </span>
            )}
          </button>

          <button 
            className={`nav-btn ${activeTab === 'bids' ? 'active' : ''}`}
            onClick={() => setActiveTab('bids')}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              border: 'none', background: activeTab === 'bids' ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderRadius: '8px', color: '#FFFBE9', cursor: 'pointer', textAlign: 'left', fontWeight: '500',
              transition: 'background 0.2s'
            }}
          >
            <FileCheck size={18} />
            <span>My Submitted Bids</span>
            {submittedBids.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', color: '#FFFBE9', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px' }}>
                {submittedBids.length}
              </span>
            )}
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
            <span>Negotiation Channels</span>
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
            <span>Company Profile</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="dashboard-theme-toggle" onClick={toggleDarkMode}>
            <RefreshCw size={14} />
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>

          <div className="admin-profile-card" onClick={() => setShowProfileModal(true)} style={{ cursor: 'pointer' }}>
            <div className="profile-avatar">
              {vendorProfile.contactPerson ? vendorProfile.contactPerson.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'VN'}
            </div>
            <div className="profile-info">
              <span className="profile-name">{vendorProfile.contactPerson}</span>
              <span className="profile-email">{vendorProfile.email}</span>
            </div>
            <button className="logout-btn" onClick={(e) => { e.stopPropagation(); onNavigate('landing'); }} title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN BODY */}
      <main style={{ flex: '1', display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* HEADER */}
        <header style={{
          padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', position: 'sticky', top: 0, zIndex: 10
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', margin: 0 }}>
              {activeTab === 'rfqs' && 'Active RFQs & Supply Tenders'}
              {activeTab === 'bids' && 'Submitted Quotation Logs'}
              {activeTab === 'chat' && 'Negotiations & Bidding Chats'}
              {activeTab === 'profile' && 'Supplier Registration Details'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Supplier: <strong>{vendorProfile.companyName}</strong> | Tier Rating: ⭐ {vendorProfile.rating}
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
                V
              </div>
            </div>
          </div>
        </header>

        {/* PAGE BODY */}
        <div style={{ padding: '32px', flex: '1', display: 'flex', flexDirection: 'column' }}>

          {/* TAB 1: ACTIVE RFQS GRID */}
          {activeTab === 'rfqs' && (
            <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '20px' }}>Incoming Request for Quotations</h3>

              {activeIncomingRfqs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
                  <CheckCircle size={40} style={{ marginBottom: '12px', color: 'green' }} />
                  <p>All clear! You have already submitted quotation bids for all available RFQs.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {activeIncomingRfqs.map(rfq => (
                    <div 
                      key={rfq.id}
                      style={{
                        padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '4px', background: 'var(--accent-color)', color: '#fff' }}>
                            {rfq.id}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category: {rfq.category}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fulfillment deadline: {rfq.deadlineDays ? `${rfq.deadlineDays} Days` : 'N/A'}</span>
                        </div>
                        <h4 style={{ margin: '10px 0 6px 0', fontSize: '1.25rem' }}>{rfq.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
                          {rfq.requirements}
                        </p>
                        <div style={{ display: 'flex', gap: '24px', marginTop: '10px', fontSize: '0.85rem' }}>
                          <span>Target Budget Constraint: <strong style={{ color: 'green' }}>{rfq.budget ? `₹${rfq.budget.toLocaleString()}` : 'N/A'}</strong></span>
                          <span>Published Date: <strong>{rfq.dateCreated}</strong></span>
                        </div>
                      </div>

                      <div>
                        <button 
                          onClick={() => setBiddingRfq(rfq)}
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
                        >
                          <span>Submit Quote</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY SUBMITTED BIDS */}
          {activeTab === 'bids' && (
            <div style={{ background: 'var(--card-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ marginBottom: '20px' }}>Your Bidding Proposals history</h3>

              {submittedBids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>
                  <AlertCircle size={40} style={{ marginBottom: '12px' }} />
                  <p>You have not submitted any quotation proposals yet. View the "Active RFQs" tab to bid.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {submittedBids.map((bid, idx) => (
                    <div 
                      key={idx}
                      style={{
                        padding: '18px', borderRadius: '12px', border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1, marginRight: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px', background: '#2E2520', color: '#FFFBE9' }}>
                            {bid.rfqId}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Category: {bid.category}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Submitted: {bid.dateSubmitted}</span>
                        </div>
                        <h4 style={{ margin: '8px 0 6px 0', fontSize: '1.15rem' }}>{bid.rfqTitle}</h4>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', marginTop: '6px' }}>
                          <span>Your Price Quote: <strong style={{ color: 'var(--accent-color)' }}>{bid.price ? `₹${bid.price.toLocaleString()}` : 'N/A'}</strong></span>
                          <span>Delivery Commitment: <strong>{bid.delivery}</strong></span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          <strong>Commercial Terms:</strong> "{bid.terms}"
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <span style={{
                          fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px',
                          background: bid.status === 'Approved' ? 'rgba(46,125,50,0.15)' : bid.status === 'Rejected' ? 'rgba(211,47,47,0.15)' : 'rgba(245,124,0,0.15)',
                          color: bid.status === 'Approved' ? '#2E7D32' : bid.status === 'Rejected' ? '#C62828' : '#EF6C00'
                        }}>
                          {bid.status}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>
                          📁 {bid.pdfName} Attached
                        </span>
                        
                        <button
                          onClick={() => {
                            // Launch chat room
                            const key = `${bid.rfqId}-${vendorProfile.companyName}`
                            setActiveChatKey(key)
                            setActiveTab('chat')
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px',
                            background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-color)',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500', marginTop: '4px'
                          }}
                        >
                          <MessageSquare size={12} /> Live Negotiate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEGO CHAT */}
          {activeTab === 'chat' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', flex: '1', minHeight: '500px' }}>
              
              {/* Chat Thread list */}
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>Negotiations Panel</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                  {Object.keys(chats).map(key => {
                    // Make sure it belongs to this vendor
                    if (!key.endsWith(vendorProfile.companyName)) return null

                    const keyParts = key.split('-')
                    const rfqId = keyParts[0] + '-' + keyParts[1] + '-' + keyParts[2]
                    const messages = chats[key] || []
                    const lastMessage = messages[messages.length - 1]?.text || 'No messages logged.'
                    
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
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.95rem' }}>Procurement Desk Officer</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMessage}
                        </p>
                      </div>
                    )
                  })}

                  {Object.keys(chats).filter(k => k.endsWith(vendorProfile.companyName)).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 10px', opacity: 0.6 }}>
                      <MessageSquare size={24} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '0.85rem' }}>No open correspondence threads. Submit a quotation bid first to initiate chat channels.</p>
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
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Procurement Officer (Rohan Sharma)</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Channel: {activeChatKey.split('-').slice(0,3).join('-')}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'green', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ● Online
                      </span>
                    </div>

                    {/* Messages stream */}
                    <div style={{ flex: '1', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg-color)' }}>
                      {(chats[activeChatKey] || []).length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 'auto', fontSize: '0.85rem' }}>
                          <AlertCircle size={20} style={{ marginBottom: '6px' }} />
                          <p>No messages yet. Send a message to state your delivery terms or clarify tech specs.</p>
                        </div>
                      ) : (
                        (chats[activeChatKey] || []).map((msg, idx) => {
                          const isVendor = msg.sender === 'vendor'
                          return (
                            <div
                              key={idx}
                              style={{
                                alignSelf: isVendor ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isVendor ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <div
                                style={{
                                  padding: '10px 14px',
                                  borderRadius: '12px',
                                  background: isVendor ? 'var(--btn-bg)' : 'var(--card-bg)',
                                  color: isVendor ? '#FFFBE9' : 'var(--text-color)',
                                  border: isVendor ? 'none' : '1px solid var(--border-color)',
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

                    {/* Input */}
                    <form onSubmit={handleSendChatMessage} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="State your pricing flexibility or warranty terms here..."
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
                  V1
                </div>
                <h3 style={{ fontSize: '1.5rem', margin: '0 0 4px 0' }}>{vendorProfile.companyName}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Registered Supplier partner</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>CONTACT REPRESENTATIVE</label>
                  <span style={{ fontWeight: '500' }}>{vendorProfile.contactPerson}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>GST REGISTRATION (GSTIN)</label>
                  <span style={{ fontWeight: '500' }}>{vendorProfile.gstin}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>REGISTERED ADDRESS</label>
                  <span style={{ fontWeight: '500' }}>{vendorProfile.address}</span>
                </div>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block' }}>TIER RATING</label>
                  <span style={{ fontWeight: '600', color: 'green', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginTop: '4px' }}>
                    ⭐ {vendorProfile.rating} / 5.0 (High reliability, excellent fulfillment performance)
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* BID SUBMISSION & PDF GENERATION MODAL OVERLAY */}
      {biddingRfq && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg)', width: '100%', maxWidth: '650px', borderRadius: '16px',
            border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh'
          }}>
            
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Submit Proposal for {biddingRfq.id}</h3>
              <button 
                onClick={() => {
                  setBiddingRfq(null)
                  setUploadedFile(null)
                  setGeneratedPdfAttached(false)
                }} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitBid} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>TARGET REQUIREMENTS</label>
                <p style={{ margin: 0, fontSize: '0.85rem', padding: '10px', background: 'var(--bg-color)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {biddingRfq.requirements}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Your Price Quotation (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 2350000"
                    value={bidPrice}
                    onChange={e => setBidPrice(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Delivery Timeline *</label>
                  <select
                    value={bidDelivery}
                    onChange={e => setBidDelivery(e.target.value)}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                  >
                    <option value="3 days">3 Days (Express)</option>
                    <option value="5 days">5 Days</option>
                    <option value="7 days">7 Days (Standard)</option>
                    <option value="10 days">10 Days</option>
                    <option value="14 days">14 Days</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '500' }}>Warranty & Contractual Terms</label>
                <textarea
                  rows="3"
                  placeholder="Describe your warranty extension, parts replacement policy, shipping clauses..."
                  value={bidTerms}
                  onChange={e => setBidTerms(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'var(--font-body)' }}
                />
              </div>

              {/* PDF Quotation Attach Section */}
              <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', background: 'var(--bg-color)', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Quotation Document Attachment *</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Please upload a PDF invoice quotation or generate one automatically from the fields filled above.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  {/* File Upload Button */}
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'transparent',
                    border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
                  }}>
                    <Upload size={16} />
                    <span>Upload PDF Quote</span>
                    <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                  </label>

                  {/* Auto Generate PDF Button */}
                  <button
                    type="button"
                    onClick={handleGeneratePdfQuotation}
                    disabled={generatingPdf}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--btn-bg)',
                      color: '#FFFBE9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                      opacity: generatingPdf ? 0.6 : 1
                    }}
                  >
                    <Sparkles size={16} />
                    <span>{generatingPdf ? 'Generating PDF...' : 'Generate & Attach PDF'}</span>
                  </button>
                </div>

                {/* Display Current Attached Attachment status */}
                {uploadedFile && (
                  <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#2E7D32', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FileCheck size={14} />
                    <span>Attached Document: <strong>{uploadedFile.name}</strong> ({uploadedFile.size})</span>
                  </div>
                )}

                {generatedPdfAttached && previewPdfData && (
                  <div style={{ marginTop: '16px', padding: '8px', background: 'rgba(46,125,50,0.1)', border: '1px solid rgba(46,125,50,0.2)', borderRadius: '6px', fontSize: '0.8rem', color: '#2E7D32', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} />
                    <span>Attached Generated Document: <strong>{previewPdfData.pdfName}</strong> (Auto generated)</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setBiddingRfq(null)
                    setUploadedFile(null)
                    setGeneratedPdfAttached(false)
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ fontWeight: 'bold' }}
                >
                  Submit Proposal Quote
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Vendor Profile</h3>
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
                <label htmlFor="vendorCompany">Company Name *</label>
                <input 
                  type="text" 
                  id="vendorCompany" 
                  value={vendorProfile.companyName}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, companyName: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="vendorContact">Contact Person *</label>
                <input 
                  type="text" 
                  id="vendorContact" 
                  value={vendorProfile.contactPerson}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, contactPerson: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="vendorEmail">Email Address *</label>
                <input 
                  type="email" 
                  id="vendorEmail" 
                  value={vendorProfile.email}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="vendorPhone">Phone Number</label>
                <input 
                  type="tel" 
                  id="vendorPhone" 
                  value={vendorProfile.phone}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vendorGst">GSTIN (Tax ID)</label>
                <input 
                  type="text" 
                  id="vendorGst" 
                  value={vendorProfile.gstin}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, gstin: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="vendorAddress">Address</label>
                <textarea 
                  id="vendorAddress" 
                  value={vendorProfile.address}
                  onChange={(e) => setVendorProfile(prev => ({ ...prev, address: e.target.value }))}
                  style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'inherit' }}
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

export default VendorDashboard
