import React, { useState, useEffect } from 'react'
import {
  CheckSquare, XSquare, TrendingUp, AlertTriangle,
  MessageSquare, LogOut, Check, X, Sparkles,
  RefreshCw, BarChart3, Star, Percent, Truck, Send,
  Clock, MapPin, Navigation, ChevronRight, Download
} from 'lucide-react'
import '../styles/logistics.css'

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

  // Real-time long-polling simulation fallback + API Sync
  const fetchShipmentData = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch('http://localhost:5000/api/shipments', { headers });
      if (res.ok) {
        const data = await res.json();
        setShipments(data.data.shipments || []);

        const sumRes = await fetch('http://localhost:5000/api/shipments/dashboard/summary', { headers });
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setLogisticsSummary(sumData.data.summary);
        }
      } else {
        throw new Error('API offline/unauthorized, loading client simulation');
      }
    } catch (err) {
      setShipments(prev => {
        if (prev.length === 0) {
          return [
            {
              id: 'shp-1',
              shipmentNumber: 'SHP-983021',
              vendor: { companyName: 'Global Parts Co.' },
              purchaseOrder: { poNumber: 'PO-2026-08' },
              status: 'In Transit',
              originAddress: 'Mumbai Port Trust, Mumbai, MH',
              destinationAddress: 'VyaparSetu Pune Warehousing Corp, Pune, MH',
              originLat: 19.0760,
              originLng: 72.8777,
              destinationLat: 18.5204,
              destinationLng: 73.8567,
              currentLat: 18.8800,
              currentLng: 73.2200,
              progressPercentage: 45,
              remainingDistance: 82.5,
              estimatedArrival: new Date(Date.now() + 65 * 60 * 1000).toISOString(),
              isDelivered: false
            },
            {
              id: 'shp-2',
              shipmentNumber: 'SHP-482012',
              vendor: { companyName: 'Acme Supplies Ltd' },
              purchaseOrder: { poNumber: 'PO-2026-12' },
              status: 'Out for Delivery',
              originAddress: 'Okhla Industrial Area, New Delhi, DL',
              destinationAddress: 'VyaparSetu Jaipur Fulfillment Center, Jaipur, RJ',
              originLat: 28.6139,
              originLng: 77.2090,
              destinationLat: 26.9124,
              destinationLng: 75.7873,
              currentLat: 27.1000,
              currentLng: 75.9200,
              progressPercentage: 88,
              remainingDistance: 32.4,
              estimatedArrival: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
              isDelivered: false
            },
            {
              id: 'shp-3',
              shipmentNumber: 'SHP-772910',
              vendor: { companyName: 'SteelCorp Industries' },
              purchaseOrder: { poNumber: 'PO-2026-15' },
              status: 'Arrived',
              originAddress: 'Peenya Industrial Area, Bengaluru, KA',
              destinationAddress: 'VyaparSetu Chennai Port Warehouse, Chennai, TN',
              originLat: 12.9716,
              originLng: 77.5946,
              destinationLat: 13.0827,
              destinationLng: 80.2707,
              currentLat: 13.0827,
              currentLng: 80.2707,
              progressPercentage: 100,
              remainingDistance: 0.0,
              estimatedArrival: new Date().toISOString(),
              isDelivered: false
            }
          ];
        } else {
          return prev.map(s => {
            if (s.isDelivered || s.status === 'Arrived') return s;

            let nextProgress = s.progressPercentage + 5;
            if (nextProgress > 100) nextProgress = 100;

            const fraction = nextProgress / 100;
            const currentLat = s.originLat + (s.destinationLat - s.originLat) * fraction;
            const currentLng = s.originLng + (s.destinationLng - s.originLng) * fraction;

            const remainingMinutes = Math.max(0, Math.round(120 * (1 - fraction)));
            const remainingDistance = parseFloat((150 * (1 - fraction)).toFixed(1));

            let newStatus = s.status;
            if (nextProgress === 100) newStatus = 'Arrived';
            else if (nextProgress >= 80) newStatus = 'Out for Delivery';
            else newStatus = 'In Transit';

            if (nextProgress === 50 && !s.alert50) {
              s.alert50 = true;
              triggerWebAlert(s.shipmentNumber, 'completed 50% of its route.');
            }
            if (nextProgress === 75 && !s.alert75) {
              s.alert75 = true;
              triggerWebAlert(s.shipmentNumber, 'completed 75% of its route.');
            }
            if (remainingMinutes <= 10 && remainingMinutes > 0 && !s.alert10) {
              s.alert10 = true;
              triggerWebAlert(s.shipmentNumber, 'is arriving within 10 minutes! Prepare receiving docks.', true);
            }
            if (nextProgress === 100 && !s.alertArrived) {
              s.alertArrived = true;
              triggerWebAlert(s.shipmentNumber, 'has arrived at the unloading dock.', false);
            }

            return {
              ...s,
              progressPercentage: nextProgress,
              currentLat,
              currentLng,
              remainingDistance,
              estimatedArrival: new Date(Date.now() + remainingMinutes * 60 * 1000).toISOString(),
              status: newStatus
            };
          });
        }
      });
    } finally {
      setLoadingLogistics(false);
    }
  };

  const triggerWebAlert = (shpNo, text, critical = false) => {
    const newAlert = {
      id: Date.now() + Math.random(),
      text: `Alert [${shpNo}]: ${text}`,
      date: 'Just now',
      read: false,
      critical
    };
    setNotifications(prev => [newAlert, ...prev]);
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

  useEffect(() => {
    const active = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Arrived').length;
    let arr20 = 0;
    let arr10 = 0;
    let delayed = 0;
    let totalEta = 0;
    let etaCount = 0;

    shipments.forEach(s => {
      if (s.status !== 'Delivered' && s.status !== 'Arrived') {
        const remainingMs = new Date(s.estimatedArrival) - new Date();
        const remMin = Math.max(0, Math.round(remainingMs / 60000));

        if (remMin <= 20) arr20++;
        if (remMin <= 10) arr10++;
        if (new Date(s.estimatedArrival) < new Date()) delayed++;

        totalEta += remMin;
        etaCount++;
      }
    });

    const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
    const avgEta = etaCount > 0 ? Math.round(totalEta / etaCount) : 0;

    setLogisticsSummary({
      activeShipments: active,
      arrivingWithin20: arr20,
      arrivingWithin10: arr10,
      deliveredToday: deliveredCount,
      delayedShipments: delayed,
      averageEtaMinutes: avgEta
    });
  }, [shipments]);

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryShipmentId) return;

    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      const res = await fetch(`http://localhost:5000/api/shipments/${deliveryShipmentId}/confirm-delivery`, {
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
                  <div style={{ marginTop: '10px' }}>
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
                                      {s.originAddress.split(',')[0]} &rarr; {s.destinationAddress.split(',')[0]}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--l-text-mute)', marginTop: '2px' }}>
                                      Remaining: {s.remainingDistance} km
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
                              {s.originAddress.split(',')[0]} &rarr; {s.destinationAddress.split(',')[0]}
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
                    <div style={{ flex: '3', minWidth: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div className="map-canvas-container">
                        {/* Grid Lines */}
                        <svg className="map-svg-grid" viewBox="0 0 600 500">
                          <defs>
                            <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="var(--map-grid-color)" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#gridPattern)" />

                          {/* Pre-drawn routes */}
                          <line x1="350.3" y1="77.7" x2="291.1" y2="111.7" stroke="var(--map-route-color)" strokeWidth="2" strokeDasharray="5" />
                          <line x1="169.9" y1="268.4" x2="210.7" y2="279.5" stroke="var(--map-route-color)" strokeWidth="2" strokeDasharray="5" />
                          <line x1="366.4" y1="390.5" x2="477.9" y2="388.3" stroke="var(--map-route-color)" strokeWidth="2" strokeDasharray="5" />

                          {/* Active Shipment markers */}
                          {shipments.map(s => {
                            const mapLngToX = (lng) => 50 + ((lng - 70) / 12) * 500;
                            const mapLatToY = (lat) => 450 - ((lat - 10) / 20) * 400;

                            const x1 = mapLngToX(s.originLng);
                            const y1 = mapLatToY(s.originLat);
                            const x2 = mapLngToX(s.destinationLng);
                            const y2 = mapLatToY(s.destinationLat);
                            const tx = mapLngToX(s.currentLng);
                            const ty = mapLatToY(s.currentLat);

                            const isFocused = selectedShipment?.id === s.id;

                            return (
                              <g key={s.id}>
                                <line
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke={isFocused ? "var(--l-cyan)" : "var(--l-border)"}
                                  strokeWidth={isFocused ? 3 : 1.5}
                                  strokeDasharray="4,4"
                                  opacity={isFocused ? 1 : 0.4}
                                />

                                <line
                                  x1={x1}
                                  y1={y1}
                                  x2={tx}
                                  y2={ty}
                                  stroke={s.status === 'Delivered' ? 'var(--l-success)' : 'var(--l-cyan)'}
                                  strokeWidth={isFocused ? 4 : 2}
                                  opacity={isFocused ? 1 : 0.5}
                                  className="map-glow-polyline"
                                />

                                {s.status !== 'Delivered' && (
                                  <circle
                                    cx={x2}
                                    cy={y2}
                                    r="10"
                                    fill="none"
                                    stroke="var(--l-orange)"
                                    strokeWidth="1.5"
                                    className="map-marker-pulse"
                                  />
                                )}

                                <g
                                  transform={`translate(${tx}, ${ty})`}
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setSelectedShipment(s)}
                                >
                                  <circle
                                    r="8"
                                    fill={s.status === 'Delivered' ? 'var(--l-success)' : s.status === 'Arrived' ? 'var(--l-success)' : 'var(--l-cyan)'}
                                    stroke="#ffffff"
                                    strokeWidth="2"
                                    style={{ filter: `drop-shadow(0 0 6px ${s.status === 'Delivered' ? 'var(--l-success)' : 'var(--l-cyan)'})` }}
                                  />
                                  {isFocused && (
                                    <circle
                                      r="16"
                                      fill="none"
                                      stroke="var(--l-cyan)"
                                      strokeWidth="1.5"
                                      className="map-marker-pulse"
                                    />
                                  )}
                                </g>
                              </g>
                            );
                          })}

                          {/* Hub Dots */}
                          {[
                            { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
                            { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
                            { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
                            { name: 'Pune', lat: 18.5204, lng: 73.8567 },
                            { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
                            { name: 'Chennai', lat: 13.0827, lng: 80.2707 }
                          ].map(city => {
                            const mapLngToX = (lng) => 50 + ((lng - 70) / 12) * 500;
                            const mapLatToY = (lat) => 450 - ((lat - 10) / 20) * 400;
                            const cx = mapLngToX(city.lng);
                            const cy = mapLatToY(city.lat);
                            return (
                              <g key={city.name}>
                                <circle cx={cx} cy={cy} r="4" fill="var(--map-hub-dot)" stroke="var(--map-hub-stroke)" strokeWidth="1" />
                                <text x={cx + 8} y={cy + 4} fill="var(--map-hub-text)" fontSize="10" fontFamily="monospace">{city.name}</text>
                              </g>
                            )
                          })}
                        </svg>

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
                              zIndex: 10
                            }}
                          >
                            <div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--l-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Focus tracking feed</span>
                              <h4 style={{ margin: '2px 0 0 0', color: 'var(--l-text)', fontSize: '1.05rem' }}>{selectedShipment.shipmentNumber}</h4>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--l-text-mute)' }}>
                                Origin: {selectedShipment.originAddress} &bull; Destination: {selectedShipment.destinationAddress}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--l-orange)' }}>
                                ETA: {selectedShipment.status === 'Delivered' ? 'Delivered' : selectedShipment.status === 'Arrived' ? 'Arrived' : new Date(selectedShipment.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--l-card)', border: '1px solid var(--l-border)' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--l-border)' }}>
              <h3 style={{ color: 'var(--l-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={20} />
                Confirm Shipment Delivery
              </h3>
              <button className="close-modal-btn" onClick={() => { setShowDeliveryModal(false); setDeliveryShipmentId(null); }} style={{ color: 'var(--l-text-mute)', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="modal-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--l-text-mute)', lineHeight: '1.5' }}>
                Confirming delivery certifies that the shipment cargo has arrived safely at the loading dock, and updates the inventory ledgers in VyaparSetu.
              </p>

              <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                <strong>Confirming Time:</strong> {new Date().toLocaleString()} <br />
                <strong>Target ID:</strong> {deliveryShipmentId}
              </div>

              <div className="form-group">
                <label htmlFor="deliveryNotes" style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '5px', display: 'block' }}>Receiving Notes / Dock Allocation Details</label>
                <textarea
                  id="deliveryNotes"
                  rows="3"
                  placeholder="Allocate dock number, record batch variations..."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--l-border)', borderRadius: '6px', background: '#111827', color: '#fff', resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="modal-action-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary cancel-btn"
                  onClick={() => { setShowDeliveryModal(false); setDeliveryShipmentId(null); }}
                  style={{ border: '1px solid var(--l-border)', color: '#fff' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary submit-btn" style={{ background: 'var(--l-success)', border: 'none' }}>
                  Confirm Delivery Complete
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
