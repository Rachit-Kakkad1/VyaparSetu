import React, { useState, useEffect } from 'react'
import {
  CheckSquare, XSquare, TrendingUp, AlertTriangle,
  MessageSquare, LogOut, Check, X, Sparkles,
  RefreshCw, BarChart3, Star, Percent, Truck, Send,
  Clock, MapPin, Navigation, ChevronRight, Download, FileText
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import '../styles/logistics.css'
import InvoiceBuilder from './InvoiceBuilder'

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

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Helper component to center map when shipment is selected
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function ManagerDashboard({ darkMode, toggleDarkMode, onNavigate }) {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'vendor-quotations' | 'decided' | 'vendors' | 'shipments' | 'route-monitoring' | 'eta-intelligence' | 'shipment-notifications' | 'shipment-analytics'

  // Shipment Tracking System States
  const [shipments, setShipments] = useState([])
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [logisticsSummary, setLogisticsSummary] = useState({
    activeShipments: 0,
    arrivingWithin20: 0,
    arrivingWithin10: 0,
    deliveredToday: 0,
    delayedShipments: 0,
    averageEtaMinutes: 0
  })
  const [loadingLogistics, setLoadingLogistics] = useState(true)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false)
  const [deliveryShipmentId, setDeliveryShipmentId] = useState(null)
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [shipmentSearch, setShipmentSearch] = useState('')
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState('All')

  // Real-time API Sync
  const fetchShipmentData = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/shipments`, { headers });
      if (res.ok) {
        const data = await res.json();
        setShipments(data.data.shipments || []);

        const sumRes = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/shipments/dashboard/summary`, { headers });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setLogisticsSummary(sumData.data.summary);
        }
      }
    } catch (err) {
      console.error('API Sync Error:', err);
    } finally {
      setLoadingLogistics(false);
    }
  };

  useEffect(() => {
    fetchShipmentData();
    const interval = setInterval(fetchShipmentData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedShipment) {
      const updated = shipments.find(s => s.id === selectedShipment.id);
      if (updated) setSelectedShipment(updated);
    }
  }, [shipments]);

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryShipmentId) return;

    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch(`${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api/shipments/${deliveryShipmentId}/confirm-delivery`, {
        method: 'POST',
        headers
      });

      setShipments(prev => prev.map(s => {
        if (s.id === deliveryShipmentId) {
          return { ...s, status: 'Delivered', isDelivered: true, actualArrival: new Date().toISOString() };
        }
        return s;
      }));

      const matchedShipment = shipments.find(s => s.id === deliveryShipmentId);
      if (matchedShipment) {
        const closedPO = {
          id: matchedShipment.purchaseOrder?.poNumber || 'PO-' + Date.now(),
          title: `Delivery Confirmation: ${matchedShipment.shipmentNumber}`,
          vendor: matchedShipment.vendor?.companyName || 'Vendor partner',
          decision: 'Approved',
          remarks: `Delivery Confirmed by Manager Sarah Jenkins. Notes: ${deliveryNotes || 'Inventory processed successfully.'}`,
          date: new Date().toISOString().split('T')[0]
        };
        setDecidedRequests(prev => [closedPO, ...prev]);
      }

      alert('Shipment delivery successfully confirmed. Inventory ledger updated.');
    } catch (err) {
      console.error(err);
    } finally {
      setShowDeliveryModal(false);
      setDeliveryShipmentId(null);
      setDeliveryNotes('');
    }
  };

  // Modals & Active Selections
  const [selectedBid, setSelectedBid] = useState(null)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [remarks, setRemarks] = useState('')
  const [rejectReason, setRejectReason] = useState('Too Expensive')

  // New States: Fullscreen RFQ list and Detailed Quotation Popup
  const [fullScreenRfq, setFullScreenRfq] = useState(null)
  const [detailedBid, setDetailedBid] = useState(null)
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
  const [managerProfile, setManagerProfile] = useState({ name: 'Sarah Jenkins', email: 'manager@vyaparsetu.com', phone: '+91 98765 00001' })
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Notifications
  const [notifications, setNotifications] = useState([])

  // Database 1: Published RFQs with detailed warranty/terms
  const [publishedRfqs, setPublishedRfqs] = useState([])

  // Database 2: Discussion Histories keyed by 'rfqId-vendorName'
  const [chatHistories, setChatHistories] = useState({})

  // Database 3: Historical approvals
  const [decidedRequests, setDecidedRequests] = useState([])

  // Vendor profiles
  const [vendorsList, setVendorsList] = useState([])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const headers = { Authorization: 'Bearer ' + token };
      const baseUrl = `${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api`;

      const [rRes, vRes, nRes] = await Promise.all([
        fetch(baseUrl + '/rfqs', { headers }),
        fetch(baseUrl + '/vendors', { headers }),
        fetch(baseUrl + '/notifications', { headers })
      ]);

      const [rData, vData, nData] = await Promise.all([
        rRes.json(), vRes.json(), nRes.json()
      ]);

      if (rRes.ok) {
        const allRfqs = rData.data.rfqs || rData.data || [];
        const mappedRfqs = allRfqs.map(r => ({
            ...r,
            bids: (r.quotations || []).map(q => ({
                id: q.id,
                quotationId: q.id,
                vendorName: q.vendor?.companyName || 'Unknown Vendor',
                price: parseFloat(q.totalAmount),
                delivery: q.deliveryTimeDays + ' days',
                status: q.status,
                terms: q.remarks,
                rating: q.vendor?.performanceScore || 0
            }))
        }));
        
        setPublishedRfqs(mappedRfqs.filter(r => r.status === 'PUBLISHED'));
        setDecidedRequests(mappedRfqs.filter(r => r.status === 'CLOSED' || r.status === 'CANCELLED'));
      }
      if (vRes.ok) setVendorsList(vData.data.rows || vData.data || []);
      if (nRes.ok) setNotifications(nData.data.notifications || []);
    } catch (error) {
      console.error('Error fetching manager data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Quotation Decisions (Approve/Reject specific vendor quotation)
  const handleApproveQuotation = async (e) => {
    e.preventDefault()
    if (!selectedBid) return

    try {
        const token = localStorage.getItem('accessToken');
        const baseUrl = `${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api`;
        
        // Find the step ID for this quotation approval
        const res = await fetch(`${baseUrl}/approvals/${selectedBid.quotationId}/approve`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({ remarks })
        });

        if (res.ok) {
            alert('Quotation APPROVED successfully.');
            fetchData();
        } else {
            const errData = await res.json();
            alert('Approval failed: ' + errData.message);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setShowApprovalModal(false)
        setSelectedBid(null)
        setRemarks('')
    }
  }

  const handleRejectQuotation = async (e) => {
    e.preventDefault()
    if (!selectedBid) return

    try {
        const token = localStorage.getItem('accessToken');
        const baseUrl = `${(import.meta.env.VITE_API_URL || 'https://vyaparsetu-f6yi.onrender.com')}/api`;
        
        const res = await fetch(`${baseUrl}/approvals/${selectedBid.quotationId}/reject`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify({ remarks: `Reason: ${rejectReason}. ${remarks}` })
        });

        if (res.ok) {
            alert('Quotation REJECTED.');
            fetchData();
        }
    } catch (err) {
        console.error(err);
    } finally {
        setShowRejectionModal(false)
        setSelectedBid(null)
        setRemarks('')
    }
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
          <img src="/images/logo_vyapar.png" alt="VS" className="brand-icon" style={{ background: 'transparent', padding: 0, width: '64px', height: 'auto' }} />
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
            <Star size={18} />
            <span>Vendor Matrix</span>
          </button>

          <div style={{ margin: '15px 20px 5px 20px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)' }}>Logistics Hub</div>

          <button
            className={`nav-item ${activeTab === 'shipments' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shipments'); setFullScreenRfq(null); }}
          >
            <Truck size={18} />
            <span>Active Shipments</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'route-monitoring' ? 'active' : ''}`}
            onClick={() => { setActiveTab('route-monitoring'); setFullScreenRfq(null); }}
          >
            <Navigation size={18} />
            <span>Route Monitoring</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'eta-intelligence' ? 'active' : ''}`}
            onClick={() => { setActiveTab('eta-intelligence'); setFullScreenRfq(null); }}
          >
            <Percent size={18} />
            <span>ETA Intelligence</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'shipment-notifications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shipment-notifications'); setFullScreenRfq(null); }}
          >
            <AlertTriangle size={18} />
            <span>Alerts Center</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'shipment-analytics' ? 'active' : ''}`}
            onClick={() => { setActiveTab('shipment-analytics'); setFullScreenRfq(null); }}
          >
            <BarChart3 size={18} />
            <span>Analytics</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'invoices' ? 'active' : ''}`}
            onClick={() => { setActiveTab('invoices'); setFullScreenRfq(null); }}
          >
            <FileText size={18} />
            <span>Invoices</span>
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
                  {activeTab === 'shipments' && 'Logistics Control Center'}
                  {activeTab === 'route-monitoring' && 'Live Cargo Dispatch Map'}
                  {activeTab === 'eta-intelligence' && 'Arrival Intelligence Console'}
                  {activeTab === 'shipment-notifications' && 'Operational Alerts Journal'}
                  {activeTab === 'shipment-analytics' && 'Logistics & SLA Analytics'}
                  {activeTab === 'invoices' && 'Manual Invoice Workspace'}
                </h1>
                <p className="header-subtitle">
                  {activeTab === 'overview' && 'Review statistics, active alerts, and notification histories.'}
                  {activeTab === 'vendor-quotations' && 'Review submitted supplier quotations side-by-side. Approve, reject, or open a discussion.'}
                  {activeTab === 'decided' && 'Historical register of all quotation decisions.'}
                  {activeTab === 'vendors' && 'Ratings, fulfillment logs, and delivery performance metrics.'}
                  {activeTab === 'shipments' && 'Monitor active dispatches, check shipping progress, and confirm deliveries.'}
                  {activeTab === 'route-monitoring' && 'Real-time vector tracking of supplier shipments moving across logistics routes.'}
                  {activeTab === 'eta-intelligence' && 'Predictive arrival times, speed tracking, and warehouse offload prep.'}
                  {activeTab === 'shipment-notifications' && 'System logs and critical 10-minute warning updates.'}
                  {activeTab === 'shipment-analytics' && 'Detailed charts outlining route efficiency and vendor delivery times.'}
                  {activeTab === 'invoices' && 'Verify procurement ledgers, generate standard/GST tax invoices, and export PDFs.'}
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

                  {/* Live Logistics Summary */}
                  <div className="analytics-graph-card" style={{ marginTop: '20px', marginBottom: '24px', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={18} style={{ color: 'var(--accent-color)' }} />
                      Live Cargo & Arrival Intelligence Hub
                    </h3>
                    <div className="logistics-kpi-grid">
                      <div className="logistics-kpi-card cyan">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Active Shipments</div>
                        <div className="logistics-kpi-val">{logisticsSummary.activeShipments}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-cyan)' }}>In Route simulation</div>
                      </div>

                      <div className="logistics-kpi-card orange">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Near Arrival (&lt;20m)</div>
                        <div className="logistics-kpi-val">{logisticsSummary.arrivingWithin20}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-orange)' }}>Prepare warehouse dock</div>
                      </div>

                      <div className="logistics-kpi-card error">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Critical (&lt;10m)</div>
                        <div className="logistics-kpi-val">{logisticsSummary.arrivingWithin10}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-error)' }}>High priority alert</div>
                      </div>

                      <div className="logistics-kpi-card success">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Delivered Today</div>
                        <div className="logistics-kpi-val">{logisticsSummary.deliveredToday}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-success)' }}>Cycle closed</div>
                      </div>

                      <div className="logistics-kpi-card error">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Delayed Cargo</div>
                        <div className="logistics-kpi-val">{logisticsSummary.delayedShipments}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-error)' }}>SLA risk checked</div>
                      </div>

                      <div className="logistics-kpi-card cyan">
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>Average ETA</div>
                        <div className="logistics-kpi-val">{logisticsSummary.averageEtaMinutes}m</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--l-cyan)' }}>Across all paths</div>
                      </div>
                    </div>
                  </div>

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
                        <div
                          key={n.id}
                          className={`log-entry-item ${n.read ? 'read-notification' : 'severity-info'}`}
                          style={n.critical ? { borderLeft: '4px solid var(--l-orange)', background: 'rgba(249, 115, 22, 0.04)' } : {}}
                        >
                          <div className="log-badge-marker" style={n.critical ? { background: 'var(--l-orange)', color: '#fff' } : {}}>
                            {n.critical ? <AlertTriangle size={14} /> : <MessageSquare size={14} />}
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
                                    {rfq.bids.slice(0, 5).map((bid, index) => (
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

                              {rfq.bids.length > 5 && (
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
                          <th>Document ID</th>
                          <th>Project / Title</th>
                          <th>Selected Vendor</th>
                          <th>Decision</th>
                          <th>Approval Remarks</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {decidedRequests.map(item => (
                          <tr key={item.id}>
                            <td><code>{item.rfqNumber || item.id.substring(0, 8)}</code></td>
                            <td><strong>{item.title}</strong></td>
                            <td>{item.vendor?.companyName || item.vendor || 'N/A'}</td>
                            <td>
                              <span className={`decision-badge badge-${(item.status || item.decision || '').toLowerCase()}`}>
                                {item.status || item.decision}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.remarks || 'No remarks provided.'}</td>
                            <td>{new Date(item.updatedAt || item.date).toLocaleDateString()}</td>
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

              {/* TAB 5: ACTIVE SHIPMENTS */}
              {activeTab === 'shipments' && (
                <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="logistics-console" style={{ background: 'var(--l-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--l-border)' }}>

                    {/* Search and Filters */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                        <input
                          type="text"
                          placeholder="Search Shipment #, PO, or Vendor..."
                          value={shipmentSearch}
                          onChange={(e) => setShipmentSearch(e.target.value)}
                          style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '1px solid var(--l-border)',
                            background: 'var(--l-card)',
                            color: 'var(--l-text)',
                            flex: 1,
                            outline: 'none'
                          }}
                        />
                        <select
                          value={shipmentStatusFilter}
                          onChange={(e) => setShipmentStatusFilter(e.target.value)}
                          style={{
                            padding: '10px 15px',
                            borderRadius: '8px',
                            border: '1px solid var(--l-border)',
                            background: 'var(--l-card)',
                            color: 'var(--l-text)',
                            outline: 'none'
                          }}
                        >
                          <option value="All">All Statuses</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Arrived">Arrived</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </div>

                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          const csvContent = "data:text/csv;charset=utf-8,"
                            + "Shipment Number,Vendor,PO Number,Origin,Destination,Progress,Remaining Distance (km),Status\n"
                            + shipments.map(s => `"${s.shipmentNumber}","${s.vendor?.companyName}","${s.purchaseOrder?.poNumber}","${s.originAddress}","${s.destinationAddress}",${s.progressPercentage},${s.remainingDistance},"${s.status}"`).join("\n");
                          const encodedUri = encodeURI(csvContent);
                          const link = document.createElement("a");
                          link.setAttribute("href", encodedUri);
                          link.setAttribute("download", `VyaparSetu_Logistics_Report_${Date.now()}.csv`);
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{ border: '1px solid var(--l-cyan)', color: 'var(--l-cyan)', display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent' }}
                      >
                        <Download size={16} /> Export CSV Ledger
                      </button>
                    </div>

                    {/* Table */}
                    <div className="dashboard-table-container" style={{ border: '1px solid var(--l-border)', background: 'var(--l-card)', borderRadius: '12px' }}>
                      <table className="dashboard-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--l-border)' }}>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px' }}>Shipment Details</th>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px' }}>Route Details</th>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px' }}>Transit Progress</th>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px' }}>ETA Metric</th>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px' }}>Status</th>
                            <th style={{ color: 'var(--l-text-mute)', padding: '15px', textAlign: 'right' }}>Logistics Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {shipments
                            .filter(s => {
                              const query = shipmentSearch.toLowerCase();
                              const matchesSearch = s.shipmentNumber.toLowerCase().includes(query) ||
                                (s.vendor?.companyName || '').toLowerCase().includes(query) ||
                                (s.purchaseOrder?.poNumber || '').toLowerCase().includes(query);
                              const matchesFilter = shipmentStatusFilter === 'All' || s.status === shipmentStatusFilter;
                              return matchesSearch && matchesFilter;
                            })
                            .map(s => {
                              const isHighPriority = s.status !== 'Delivered' && s.progressPercentage >= 80;
                              return (
                                <tr key={s.id} style={{ borderBottom: '1px solid var(--l-border)' }}>
                                  <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.95rem' }}>{s.shipmentNumber}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)', marginTop: '2px' }}>
                                      Vendor: {s.vendor?.companyName} • PO: {s.purchaseOrder?.poNumber}
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--l-text)' }}>
                                      <MapPin size={12} style={{ color: 'var(--l-cyan)', marginRight: '4px', verticalAlign: 'middle' }} />
                                      {s.originAddress ? s.originAddress.split(',')[0] : `Loc (${s.originLat.toFixed(2)}, ${s.originLng.toFixed(2)})`} &rarr; {s.destinationAddress ? s.destinationAddress.split(',')[0] : `Loc (${s.destinationLat.toFixed(2)}, ${s.destinationLng.toFixed(2)})`}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)', marginTop: '2px' }}>
                                      Progress: {s.progressPercentage}%
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px', width: '200px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                      <div style={{ flex: 1, height: '6px', background: 'var(--l-border)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div
                                          style={{
                                            width: `${s.progressPercentage}%`,
                                            height: '100%',
                                            background: s.status === 'Delivered' ? 'var(--l-success)' : s.status === 'Out for Delivery' ? 'var(--l-orange)' : 'var(--l-cyan)',
                                            boxShadow: `0 0 8px ${s.status === 'Delivered' ? 'var(--l-success)' : s.status === 'Out for Delivery' ? 'var(--l-orange)' : 'var(--l-cyan)'}`
                                          }}
                                        />
                                      </div>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--l-text)', fontWeight: 'bold' }}>{s.progressPercentage}%</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                      <Clock size={13} style={{ color: isHighPriority ? 'var(--l-orange)' : 'var(--l-text-mute)' }} />
                                      <span style={{ color: isHighPriority ? 'var(--l-orange)' : 'var(--l-text)', fontWeight: isHighPriority ? 'bold' : 'normal' }}>
                                        {s.status === 'Delivered' ? 'Delivered' : s.status === 'Arrived' ? 'Arrived' : new Date(s.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    {isHighPriority && (
                                      <div style={{ fontSize: '0.7rem', color: 'var(--l-orange)', marginTop: '2px', fontWeight: 'bold' }}>
                                        Dock Crew Alerted
                                      </div>
                                    )}
                                  </td>
                                  <td style={{ padding: '15px' }}>
                                    <span
                                      className="pipeline-stage-badge"
                                      style={{
                                        background: s.status === 'Delivered' ? 'var(--badge-green-bg)' : s.status === 'Arrived' ? 'rgba(6, 182, 212, 0.15)' : s.status === 'Out for Delivery' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.05)',
                                        color: s.status === 'Delivered' ? 'var(--badge-green-text)' : s.status === 'Arrived' ? 'var(--l-cyan)' : s.status === 'Out for Delivery' ? 'var(--l-orange)' : 'var(--l-text-mute)'
                                      }}
                                    >
                                      {s.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '15px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                      <button
                                        onClick={() => { setSelectedShipment(s); setActiveTab('route-monitoring'); }}
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--l-cyan)', color: 'var(--l-cyan)' }}
                                      >
                                        Route Map
                                      </button>
                                      <button
                                        onClick={() => { setSelectedShipment(s); setActiveTab('eta-intelligence'); }}
                                        className="btn btn-secondary"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--l-cyan)', color: 'var(--l-cyan)' }}
                                      >
                                        ETA Intel
                                      </button>
                                      {s.status === 'Arrived' && (
                                        <button
                                          onClick={() => { setDeliveryShipmentId(s.id); setShowDeliveryModal(true); }}
                                          className="btn btn-primary"
                                          style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--l-success)' }}
                                        >
                                          Confirm Delivery
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 6: ROUTE MONITORING */}
              {activeTab === 'route-monitoring' && (
                <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="logistics-console" style={{ background: '#332C27', padding: '24px', borderRadius: '16px', border: '1px solid var(--l-border)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                    {/* Left Selector Drawer */}
                    <div style={{ flex: '1', minWidth: '280px', background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: 0, color: 'var(--l-text)' }}>Shipments Index</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {shipments.map(s => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedShipment(s)}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: selectedShipment?.id === s.id ? 'var(--l-cyan)' : 'var(--l-border)',
                              background: selectedShipment?.id === s.id ? 'var(--l-cyan-glow)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--l-text)' }}>{s.shipmentNumber}</span>
                              <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--l-border)', color: 'var(--l-text-mute)' }}>{s.status}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)', marginTop: '4px' }}>
                              {s.originAddress ? s.originAddress.split(',')[0] : `Loc (${s.originLat?.toFixed(2)}, ${s.originLng?.toFixed(2)})`} &rarr; {s.destinationAddress ? s.destinationAddress.split(',')[0] : `Loc (${s.destinationLat?.toFixed(2)}, ${s.destinationLng?.toFixed(2)})`}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.7rem' }}>
                              <span style={{ color: 'var(--l-cyan)' }}>Progress: {s.progressPercentage}%</span>
                              <span style={{ color: 'var(--l-orange)' }}>ETA: {s.status === 'Delivered' ? 'Delivered' : s.status === 'Arrived' ? 'Arrived' : new Date(s.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Route Map Panel */}
                    <div style={{ flex: '3', minWidth: '400px', height: '500px', position: 'relative' }}>
                      <MapContainer 
                        center={[20.5937, 78.9629]} 
                        zoom={5} 
                        style={{ height: '100%', width: '100%', borderRadius: '16px', border: '1px solid var(--l-border)', zIndex: 1 }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        
                        {selectedShipment && (
                          <ChangeView 
                            center={[selectedShipment.currentLat || selectedShipment.originLat, selectedShipment.currentLng || selectedShipment.originLng]} 
                            zoom={7} 
                          />
                        )}

                        {shipments.map(s => {
                          const points = s.routePoints || [[s.originLat, s.originLng], [s.destinationLat, s.destinationLng]];
                          const isSelected = selectedShipment?.id === s.id;
                          
                          return (
                            <React.Fragment key={s.id}>
                              {/* Full Route Polyline */}
                              <Polyline 
                                positions={points} 
                                color={isSelected ? 'var(--l-cyan)' : 'var(--l-border)'}
                                weight={isSelected ? 4 : 2}
                                opacity={isSelected ? 0.8 : 0.4}
                                dashArray={isSelected ? null : "5, 10"}
                              />
                              
                              {/* Destination Marker */}
                              <Marker position={[s.destinationLat, s.destinationLng]}>
                                <Popup>
                                    <strong>Destination: {s.shipmentNumber}</strong><br/>
                                    Final warehouse location.
                                </Popup>
                              </Marker>

                              {/* Active Vehicle Marker */}
                              <Marker 
                                position={[s.currentLat || s.originLat, s.currentLng || s.originLng]}
                                eventHandlers={{
                                  click: () => setSelectedShipment(s),
                                }}
                              >
                                <Popup>
                                  <strong>{s.shipmentNumber}</strong><br/>
                                  Vendor: {s.vendor?.companyName}<br/>
                                  Status: {s.status}<br/>
                                  Progress: {s.progressPercentage}%
                                </Popup>
                              </Marker>
                            </React.Fragment>
                          );
                        })}

                        {/* Standard Hub Markers */}
                        {[
                          { name: 'Delhi Hub', lat: 28.6139, lng: 77.2090 },
                          { name: 'Mumbai Hub', lat: 19.0760, lng: 72.8777 },
                          { name: 'Bengaluru Hub', lat: 12.9716, lng: 77.5946 }
                        ].map(hub => (
                          <Marker key={hub.name} position={[hub.lat, hub.lng]} opacity={0.6}>
                            <Popup>{hub.name}</Popup>
                          </Marker>
                        ))}
                      </MapContainer>

                      {/* Tooltip Popup */}
                      {selectedShipment && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            right: '20px',
                            background: 'var(--l-card)',
                            border: '1px solid var(--l-cyan)',
                            borderRadius: '12px',
                            padding: '15px',
                            backdropFilter: 'blur(5px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            zIndex: 1000
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--l-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Live tracking feed</span>
                            <h4 style={{ margin: '2px 0 0 0', color: 'var(--l-text)', fontSize: '1.05rem' }}>{selectedShipment.shipmentNumber}</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>
                                {selectedShipment.vendor?.companyName} &bull; {selectedShipment.status}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--l-orange)' }}>
                              ETA: {selectedShipment.status === 'Delivered' ? 'Delivered' : new Date(selectedShipment.estimatedArrival).toLocaleTimeString()}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--l-text-mute)' }}>
                              Completion: {selectedShipment.progressPercentage}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 7: ETA INTELLIGENCE */}
              {activeTab === 'eta-intelligence' && (
                <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="logistics-console" style={{ background: '#332C27', padding: '24px', borderRadius: '16px', border: '1px solid var(--l-border)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

                    {/* Left Selector Menu */}
                    <div style={{ flex: '1', minWidth: '280px', background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: 0, color: 'var(--l-text)' }}>Select Shipment</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {shipments.map(s => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedShipment(s)}
                            style={{
                              padding: '12px',
                              borderRadius: '8px',
                              border: '1px solid',
                              borderColor: selectedShipment?.id === s.id ? 'var(--l-cyan)' : 'var(--l-border)',
                              background: selectedShipment?.id === s.id ? 'var(--l-cyan-glow)' : 'transparent',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--l-text)' }}>{s.shipmentNumber}</span>
                              <span style={{ fontSize: '0.7rem', color: s.status === 'Arrived' ? 'var(--l-success)' : 'var(--l-text-mute)' }}>{s.status}</span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--l-text-mute)', marginTop: '4px' }}>
                              Progress: {s.progressPercentage}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Intel Console */}
                    <div style={{ flex: '3', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {selectedShipment ? (
                        <>
                          <div style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            {/* Left: ETA Ring */}
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                  <circle cx="60" cy="60" r="52" fill="transparent" stroke="var(--l-border)" strokeWidth="8" />
                                  <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="transparent"
                                    stroke="var(--l-cyan)"
                                    strokeWidth="8"
                                    strokeDasharray="326.7"
                                    strokeDashoffset={326.7 - (326.7 * selectedShipment.progressPercentage) / 100}
                                    strokeLinecap="round"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.6s ease' }}
                                  />
                                </svg>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--l-text)' }}>{selectedShipment.progressPercentage}%</span>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--l-text-mute)' }}>Completed</span>
                                </div>
                              </div>

                              <div>
                                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--l-text-mute)' }}>ETA status feed</span>
                                <h3 style={{ margin: '4px 0 6px 0', color: 'var(--l-text)', fontSize: '1.5rem' }}>
                                  {selectedShipment.status === 'Delivered' ? 'Delivered' : selectedShipment.status === 'Arrived' ? 'Arrived at Dock' : new Date(selectedShipment.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </h3>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--l-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                    Delay Risk: Low
                                  </span>
                                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', background: 'var(--l-border)', color: 'var(--l-text-mute)' }}>
                                    Speed: 64 km/h
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Quick actions */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                              <button
                                onClick={() => {
                                  alert(`Notified receiving dock operations crew: Shipment ${selectedShipment.shipmentNumber} is arriving soon.`);
                                  triggerWebAlert(selectedShipment.shipmentNumber, 'Notified dock crew of near-arrival checklist.');
                                }}
                                className="btn btn-primary animate-pulse-glow"
                                style={{ padding: '10px 20px', background: 'var(--l-orange)', border: 'none' }}
                              >
                                Alert Receiving Crew
                              </button>
                              <button
                                onClick={() => alert(`Connecting with vendor dispatch desk for PO ${selectedShipment.purchaseOrder?.poNumber}...`)}
                                className="btn btn-secondary"
                                style={{ padding: '10px 20px', border: '1px solid var(--l-border)' }}
                              >
                                Contact Carrier Dispatch
                              </button>
                            </div>
                          </div>

                          {/* Timeline */}
                          <div style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '24px' }}>
                            <h4 style={{ margin: '0 0 20px 0', color: 'var(--l-text)' }}>Route Timeline & Milestones</h4>

                            <div className="timeline-track">
                              <div className={`timeline-node ${selectedShipment.progressPercentage >= 0 ? 'success' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>Shipment Dispatch Initiated</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Origin: {selectedShipment.originAddress}</div>
                              </div>

                              <div className={`timeline-node ${selectedShipment.progressPercentage >= 50 ? 'success' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>Midpoint Cleared (50%)</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Estimated time check completed successfully.</div>
                              </div>

                              <div className={`timeline-node ${selectedShipment.progressPercentage >= 75 ? 'success' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>Sector 3 Passed (75%)</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Cargo reaches terminal buffer boundaries.</div>
                              </div>

                              <div className={`timeline-node ${selectedShipment.progressPercentage >= 85 ? 'warning' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>ETA Warning Level 1 (20 Minutes Alert)</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Dock checklist released to yard yard crew.</div>
                              </div>

                              <div className={`timeline-node ${selectedShipment.progressPercentage >= 92 ? 'warning' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>ETA Warning Level 2 (10 Minutes Alert)</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Offload bay secured. Pre-receiving log active.</div>
                              </div>

                              <div className={`timeline-node ${selectedShipment.progressPercentage === 100 ? 'success' : ''}`}>
                                <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>Arrived at Destination</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>Unloading bay. Awaiting manager validation.</div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--l-card)', borderRadius: '16px', border: '1px dashed var(--l-border)' }}>
                          <Percent size={40} style={{ color: 'var(--l-text-mute)', marginBottom: '15px' }} />
                          <h3>No Shipment Selected</h3>
                          <p style={{ color: 'var(--l-text-mute)' }}>Please select a shipment from the index on the left to examine ETA intelligence metrics.</p>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 8: ALERTS CENTER */}
              {activeTab === 'shipment-notifications' && (
                <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="logistics-console" style={{ background: '#332C27', padding: '24px', borderRadius: '16px', border: '1px solid var(--l-border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ margin: 0, color: 'var(--l-text)' }}>Journal Feed</h3>
                      <button className="btn btn-secondary" onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}>
                        Mark all as acknowledged
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', background: 'var(--l-card)', borderRadius: '16px', border: '1px dashed var(--l-border)' }}>
                          <AlertTriangle size={40} style={{ color: 'var(--l-text-mute)', marginBottom: '15px' }} />
                          <h3>No Alerts Logged</h3>
                          <p style={{ color: 'var(--l-text-mute)' }}>Logistics system normal. All active shipments moving within schedule bounds.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`alert-drawer-card ${n.critical ? 'critical' : ''}`}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: n.critical ? 'rgba(249,115,22,0.2)' : 'rgba(6,182,212,0.2)',
                              color: n.critical ? 'var(--l-orange)' : 'var(--l-cyan)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <AlertTriangle size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', color: 'var(--l-text)', fontSize: '0.9rem' }}>{n.text}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>
                                <span>Fulfillment alert generated</span>
                                <span>{n.date}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 9: LOGISTICS ANALYTICS */}
              {activeTab === 'shipment-analytics' && (
                <div className="tab-pane-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div className="logistics-console" style={{ background: '#332C27', padding: '24px', borderRadius: '16px', border: '1px solid var(--l-border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                      {/* Area Chart: Logistics Volume */}
                      <div style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '20px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--l-text)' }}>Monthly Logistics Volume</h4>

                        <svg width="100%" height="220" viewBox="0 0 400 220">
                          <g transform="translate(40, 20)">
                            <line x1="0" y1="160" x2="330" y2="160" stroke="var(--l-border)" />
                            <line x1="0" y1="110" x2="330" y2="110" stroke="var(--l-border)" />
                            <line x1="0" y1="60" x2="330" y2="60" stroke="var(--l-border)" />

                            <path
                              d="M 0 120 Q 60 70 120 140 T 240 40 T 330 20 L 330 160 L 0 160 Z"
                              fill="rgba(6,182,212,0.15)"
                            />

                            <path
                              d="M 0 120 Q 60 70 120 140 T 240 40 T 330 20"
                              fill="none"
                              stroke="var(--l-cyan)"
                              strokeWidth="3"
                            />

                            <circle cx="0" cy="120" r="4" fill="var(--l-cyan)" />
                            <circle cx="120" cy="140" r="4" fill="var(--l-cyan)" />
                            <circle cx="240" cy="40" r="4" fill="var(--l-cyan)" />
                            <circle cx="330" cy="20" r="4" fill="var(--l-cyan)" />

                            <text x="0" y="180" fill="var(--l-text-mute)" fontSize="10" textAnchor="middle">Feb</text>
                            <text x="120" y="180" fill="var(--l-text-mute)" fontSize="10" textAnchor="middle">Mar</text>
                            <text x="240" y="180" fill="var(--l-text-mute)" fontSize="10" textAnchor="middle">Apr</text>
                            <text x="330" y="180" fill="var(--l-text-mute)" fontSize="10" textAnchor="middle">May</text>
                          </g>
                        </svg>
                      </div>

                      {/* Donut Chart: On-Time Ratio */}
                      <div style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '20px' }}>
                        <h4 style={{ margin: '0 0 15px 0', color: 'var(--l-text)' }}>Delivered Cargo SLA Audit</h4>

                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center', height: '180px' }}>
                          <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="45" fill="transparent" stroke="var(--l-error)" strokeWidth="14" />
                            <circle
                              cx="60"
                              cy="60"
                              r="45"
                              fill="transparent"
                              stroke="var(--l-success)"
                              strokeWidth="14"
                              strokeDasharray="282.7"
                              strokeDashoffset="56.5"
                              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                            />
                          </svg>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '12px', height: '12px', background: 'var(--l-success)', borderRadius: '3px' }} />
                              <span style={{ fontSize: '0.85rem', color: 'var(--l-text)' }}>On-Time (80%)</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ width: '12px', height: '12px', background: 'var(--l-error)', borderRadius: '3px' }} />
                              <span style={{ fontSize: '0.85rem', color: 'var(--l-text)' }}>Delayed (20%)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    <div style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)', borderRadius: '16px', padding: '20px' }}>
                      <h4 style={{ margin: '0 0 15px 0', color: 'var(--l-text)' }}>SLA Performance Metrics</h4>
                      <div className="dashboard-table-container">
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>Route Category</th>
                              <th>Standard SLA</th>
                              <th>Avg Actual time</th>
                              <th>Reliability Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td><strong>Mumbai Port &rarr; Pune Warehouses</strong></td>
                              <td>4 hours</td>
                              <td>3.2 hours</td>
                              <td><span style={{ color: 'var(--l-success)', fontWeight: 'bold' }}>94% (High)</span></td>
                            </tr>
                            <tr>
                              <td><strong>Delhi Okhla &rarr; Jaipur Fulfillment</strong></td>
                              <td>6 hours</td>
                              <td>5.8 hours</td>
                              <td><span style={{ color: 'var(--l-success)', fontWeight: 'bold' }}>88% (Normal)</span></td>
                            </tr>
                            <tr>
                              <td><strong>Bengaluru Peenya &rarr; Chennai Port</strong></td>
                              <td>8 hours</td>
                              <td>9.2 hours</td>
                              <td><span style={{ color: 'var(--l-error)', fontWeight: 'bold' }}>72% (Risk)</span></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === 'invoices' && (
                <div className="tab-pane-fade">
                  <InvoiceBuilder userRole="MANAGER" />
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

              <div className="modal-action-buttons" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setDetailedBid(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Close Details
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setViewingPdfBid({
                      ...detailedBid,
                      pdfName: detailedBid.pdfName || `${detailedBid.vendor.replace(/\s+/g, '_')}_Quotation.pdf`
                    });
                    setDetailedBid(null);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <FileText size={14} /> View PDF Invoice
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
                <strong>Project:</strong> {selectedBid.title} <br />
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

      {/* DELIVERY CONFIRMATION MODAL */}
      {showDeliveryModal && deliveryShipmentId && (
        <div className="modal-overlay" onClick={() => { setShowDeliveryModal(false); setDeliveryShipmentId(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ color: 'var(--success-color, #10b981)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} />
                Confirm Shipment Delivery
              </h3>
              <button className="close-modal-btn" onClick={() => { setShowDeliveryModal(false); setDeliveryShipmentId(null); }} style={{ color: 'var(--text-secondary)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="modal-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Confirming delivery certifies that the shipment cargo has arrived safely at the loading dock, and updates the inventory ledgers in VyaparSetu.
              </p>

              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                <strong>Confirming Time:</strong> {new Date().toLocaleString()} <br />
                <strong>Target ID:</strong> {deliveryShipmentId}
              </div>

              <div className="form-group">
                <label htmlFor="deliveryNotes" style={{ color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>Receiving Notes / Dock Allocation Details</label>
                <textarea
                  id="deliveryNotes"
                  rows="3"
                  placeholder="Allocate dock number, record batch variations..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="modal-action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary cancel-btn"
                  onClick={() => { setShowDeliveryModal(false); setDeliveryShipmentId(null); }}
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" style={{ background: 'var(--success-color, #10b981)', border: 'none' }}>
                  Confirm Delivery Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED PDF QUOTATION INVOICE MODAL VIEW */}
      {viewingPdfBid && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px'
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
                  <p style={{ margin: '2px 0' }}>Officer in Charge: {managerProfile.name}</p>
                  <p style={{ margin: '2px 0' }}>Email: {managerProfile.email}</p>
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
    </div>
  )
}

export default ManagerDashboard
