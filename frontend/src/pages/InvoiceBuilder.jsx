import React, { useState, useEffect } from 'react'
import {
  FileText, Plus, Trash2, Search, Download, RefreshCw,
  Edit, PlusCircle, Eye, ArrowLeft, CreditCard, Check, X, ShieldAlert
} from 'lucide-react'

function InvoiceBuilder({ userRole = 'MANAGER', inline = false }) {
  // Navigation State: 'list' | 'create' | 'edit' | 'view'
  const [viewMode, setViewMode] = useState('list')
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  
  // Selection references fetched from APIs
  const [vendors, setVendors] = useState([])
  const [rfqs, setRfqs] = useState([])
  const [pos, setPos] = useState([])
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterVendor, setFilterVendor] = useState('ALL')
  
  // Loading & Error States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Form State
  const [formValues, setFormValues] = useState({
    invoiceNumber: '',
    invoiceType: 'STANDARD',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'PENDING',
    vendorId: '',
    rfqId: '',
    quotationId: '',
    poId: '',
    shipmentId: '',
    
    // Vendor Info (dynamic helper state)
    vendorName: '',
    vendorGst: '',
    vendorAddress: '',
    vendorEmail: '',
    vendorPhone: '',
    
    // Buyer Info
    buyerName: 'VyaparSetu Corporate Logistics',
    buyerGst: '07AAAAA1111A1Z1',
    buyerAddress: 'Plot 12, Sector 4, Dwarka, New Delhi, 110075',
    buyerEmail: 'procurement@vyaparsetu.gov.in',
    buyerPhone: '+91 11 4987 6543',

    // Financial Values
    taxAmount: 0,
    discountAmount: 0,
    additionalCharges: 0,

    // Items
    items: [
      { itemDescription: 'Heavy Machinery Drill Bits', quantity: 5, unitPrice: 2400 },
      { itemDescription: 'Steel Core Castings Grade-A', quantity: 2, unitPrice: 15000 }
    ],

    // Payment details
    bankName: 'HDFC Corporate Bank Ltd',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0000123',
    upiId: 'vyaparsetu@hdfc',
    paymentTerms: 'Net 15 days upon receipt of invoice',
    
    // Notes
    remarks: 'Goods delivered in good condition at Dock No. 4.',
    termsConditions: '1. All prices are verified by standard purchase agreements.\n2. Dispute claims must be filed within 7 business days.\n3. Late payments will incur 2% monthly interest.',
    authorizedSignatory: 'Siddharth Juneja'
  })

  // Fetch initial data
  useEffect(() => {
    fetchInvoices()
    fetchReferenceData()
  }, [])

  const fetchInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken') || ''
      const res = await fetch('http://localhost:5000/api/invoices', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      })
      if (res.ok) {
        const data = await res.json()
        setInvoices(data.data.invoices || [])
      } else {
        throw new Error('Failed to load invoices from API')
      }
    } catch (err) {
      console.warn('API error, loading simulated invoices list:', err.message)
      // Fallback mockup
      setInvoices([
        {
          id: 'b149b5c2-64f1-4db5-9e67-96a1ef8df401',
          invoiceNumber: 'INV-2026-001',
          invoiceType: 'GST',
          invoiceDate: '2026-06-01',
          dueDate: '2026-06-16',
          status: 'PAID',
          subtotal: 42000.00,
          taxAmount: 7560.00,
          discountAmount: 1000.00,
          additionalCharges: 500.00,
          grandTotal: 49060.00,
          pdfUrl: 'https://cloudinary.com/mock-invoice-pdf-1.pdf',
          createdAt: '2026-06-01T10:00:00.000Z',
          vendor: { name: 'Acme Metal Industries', email: 'acme@metalind.com' }
        },
        {
          id: 'd9e03d4a-a22c-47a3-bcf2-b2d3bf7fae32',
          invoiceNumber: 'INV-2026-002',
          invoiceType: 'STANDARD',
          invoiceDate: '2026-06-05',
          dueDate: '2026-06-20',
          status: 'PENDING',
          subtotal: 138000.00,
          taxAmount: 0.00,
          discountAmount: 0.00,
          additionalCharges: 1200.00,
          grandTotal: 139200.00,
          pdfUrl: null,
          createdAt: '2026-06-05T14:32:00.000Z',
          vendor: { name: 'Global Tech Solutions', email: 'billing@globaltech.com' }
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchReferenceData = async () => {
    const token = localStorage.getItem('accessToken') || ''
    const headers = { 'Authorization': 'Bearer ' + token }
    
    // Fetch Vendors
    try {
      const res = await fetch('http://localhost:5000/api/vendors', { headers })
      if (res.ok) {
        const data = await res.json()
        setVendors(data.data.vendors || [])
      }
    } catch (e) { console.log('Could not fetch vendors') }

    // Fetch RFQs
    try {
      const res = await fetch('http://localhost:5000/api/rfqs', { headers })
      if (res.ok) {
        const data = await res.json()
        setRfqs(data.data.rfqs || [])
      }
    } catch (e) { console.log('Could not fetch rfqs') }

    // Fetch POs
    try {
      const res = await fetch('http://localhost:5000/api/pos', { headers })
      if (res.ok) {
        const data = await res.json()
        setPos(data.data.pos || [])
      }
    } catch (e) { console.log('Could not fetch pos') }
  }

  // Handle vendor select change to auto-fill details
  const handleVendorChange = (vendorId) => {
    const selected = vendors.find(v => v.id === vendorId)
    if (selected) {
      setFormValues(prev => ({
        ...prev,
        vendorId: selected.id,
        vendorName: selected.name,
        vendorGst: selected.gstin || '27ABCDE1234F1Z5',
        vendorAddress: selected.address || 'Industrial Zone, Hub A, Mumbai',
        vendorEmail: selected.email || 'vendor@partner.com',
        vendorPhone: selected.phone || '+91 98765 43210'
      }))
    } else {
      setFormValues(prev => ({ ...prev, vendorId }))
    }
  }

  // Handle items array changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formValues.items]
    updatedItems[index][field] = value
    
    // Calculate row amount
    if (field === 'quantity' || field === 'unitPrice') {
      const q = parseFloat(updatedItems[index].quantity || 0)
      const p = parseFloat(updatedItems[index].unitPrice || 0)
      updatedItems[index].amount = q * p
    }

    setFormValues(prev => ({ ...prev, items: updatedItems }))
  }

  const addItemRow = () => {
    setFormValues(prev => ({
      ...prev,
      items: [...prev.items, { itemDescription: '', quantity: 1, unitPrice: 0, amount: 0 }]
    }))
  }

  const removeItemRow = (index) => {
    if (formValues.items.length <= 1) return
    const updatedItems = formValues.items.filter((_, i) => i !== index)
    setFormValues(prev => ({ ...prev, items: updatedItems }))
  }

  // Frontend helper calculation (does not override backend truth, just for UI preview)
  const calculateSubtotal = () => {
    return formValues.items.reduce((sum, item) => sum + (parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0)), 0)
  }

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal()
    const tax = parseFloat(formValues.taxAmount || 0)
    const add = parseFloat(formValues.additionalCharges || 0)
    const disc = parseFloat(formValues.discountAmount || 0)
    return (sub + tax + add) - disc
  }

  const initCreateForm = () => {
    setFormValues({
      invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      invoiceType: 'STANDARD',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      vendorId: vendors[0]?.id || '',
      rfqId: '',
      quotationId: '',
      poId: '',
      shipmentId: '',
      
      vendorName: vendors[0]?.name || '',
      vendorGst: vendors[0]?.gstin || '27ABCDE1234F1Z5',
      vendorAddress: vendors[0]?.address || 'Industrial Hub, New Delhi',
      vendorEmail: vendors[0]?.email || 'vendor@vyaparsetu.com',
      vendorPhone: vendors[0]?.phone || '+91 99999 88888',
      
      buyerName: 'VyaparSetu Corporate Logistics',
      buyerGst: '07AAAAA1111A1Z1',
      buyerAddress: 'Plot 12, Sector 4, Dwarka, New Delhi, 110075',
      buyerEmail: 'procurement@vyaparsetu.gov.in',
      buyerPhone: '+91 11 4987 6543',

      taxAmount: 0,
      discountAmount: 0,
      additionalCharges: 0,

      items: [{ itemDescription: '', quantity: 1, unitPrice: 0, amount: 0 }],

      bankName: 'HDFC Corporate Bank Ltd',
      accountNumber: '50200012345678',
      ifscCode: 'HDFC0000123',
      upiId: 'vyaparsetu@hdfc',
      paymentTerms: 'Net 15 days upon receipt of invoice',
      
      remarks: 'Standard manually compiled invoice.',
      termsConditions: '1. Goods subject to verification upon arrival.\n2. Invoice subject to corporate audit.',
      authorizedSignatory: 'Siddharth Juneja'
    })
    setViewMode('create')
  }

  const initEditForm = (invoice) => {
    setSelectedInvoice(invoice)
    setFormValues({
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.invoiceType,
      invoiceDate: new Date(invoice.invoiceDate).toISOString().split('T')[0],
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
      status: invoice.status,
      vendorId: invoice.vendorId || '',
      rfqId: invoice.rfqId || '',
      quotationId: invoice.quotationId || '',
      poId: invoice.poId || '',
      shipmentId: invoice.shipmentId || '',
      
      vendorName: invoice.vendor?.name || '',
      vendorGst: invoice.vendor?.gstin || '27ABCDE1234F1Z5',
      vendorAddress: invoice.vendor?.address || 'Industrial Hub, India',
      vendorEmail: invoice.vendor?.email || 'vendor@partner.com',
      vendorPhone: invoice.vendor?.phone || '',
      
      buyerName: 'VyaparSetu Corporate Logistics',
      buyerGst: '07AAAAA1111A1Z1',
      buyerAddress: 'Plot 12, Sector 4, Dwarka, New Delhi, 110075',
      buyerEmail: 'procurement@vyaparsetu.gov.in',
      buyerPhone: '+91 11 4987 6543',

      taxAmount: parseFloat(invoice.taxAmount || 0),
      discountAmount: parseFloat(invoice.discountAmount || 0),
      additionalCharges: parseFloat(invoice.additionalCharges || 0),

      items: invoice.items?.length > 0 ? invoice.items.map(item => ({
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        amount: parseFloat(item.amount)
      })) : [{ itemDescription: '', quantity: 1, unitPrice: 0, amount: 0 }],

      bankName: invoice.bankDetails?.split('|')[0] || 'HDFC Corporate Bank Ltd',
      accountNumber: invoice.bankDetails?.split('|')[1] || '50200012345678',
      ifscCode: invoice.bankDetails?.split('|')[2] || 'HDFC0000123',
      upiId: invoice.bankDetails?.split('|')[3] || 'vyaparsetu@hdfc',
      paymentTerms: invoice.paymentTerms || 'Net 15 days upon receipt of invoice',
      
      remarks: invoice.remarks || '',
      termsConditions: '1. Goods subject to verification upon arrival.\n2. Invoice subject to corporate audit.',
      authorizedSignatory: invoice.authorizedSignatory || 'Siddharth Juneja'
    })
    setViewMode('edit')
  }

  // Handle Form Submit (POST or PUT)
  const handleSubmitInvoice = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    // Build payload matching validators
    const payload = {
      invoiceNumber: formValues.invoiceNumber,
      invoiceType: formValues.invoiceType,
      invoiceDate: new Date(formValues.invoiceDate).toISOString(),
      dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : undefined,
      vendorId: formValues.vendorId,
      rfqId: formValues.rfqId || undefined,
      quotationId: formValues.quotationId || undefined,
      poId: formValues.poId || undefined,
      shipmentId: formValues.shipmentId || undefined,
      items: formValues.items.map(it => ({
        itemDescription: it.itemDescription,
        quantity: parseInt(it.quantity),
        unitPrice: parseFloat(it.unitPrice)
      })),
      taxAmount: parseFloat(formValues.taxAmount || 0),
      discountAmount: parseFloat(formValues.discountAmount || 0),
      additionalCharges: parseFloat(formValues.additionalCharges || 0),
      paymentTerms: formValues.paymentTerms,
      remarks: formValues.remarks,
      bankDetails: `${formValues.bankName}|${formValues.accountNumber}|${formValues.ifscCode}|${formValues.upiId}`,
      authorizedSignatory: formValues.authorizedSignatory,
      status: formValues.status
    }

    try {
      const token = localStorage.getItem('accessToken') || ''
      const url = viewMode === 'edit'
        ? `http://localhost:5000/api/invoices/${selectedInvoice.id}`
        : 'http://localhost:5000/api/invoices'
      
      const method = viewMode === 'edit' ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        setSuccessMsg(viewMode === 'edit' ? 'Invoice updated successfully!' : 'Invoice created successfully!')
        setViewMode('list')
        fetchInvoices()
      } else {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error processing invoice')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Trigger PDF Generation
  const handleGeneratePdf = async (invoiceId) => {
    setLoading(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const token = localStorage.getItem('accessToken') || ''
      const res = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      })
      if (res.ok) {
        const data = await res.json()
        setSuccessMsg('PDF generated and secured successfully!')
        fetchInvoices()
        if (data.data.pdfUrl) {
          window.open(data.data.pdfUrl, '_blank')
        }
      } else {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Error generating PDF invoice')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtered List
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.vendor?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.poRef || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === 'ALL' || inv.invoiceType === filterType
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus
    const matchesVendor = filterVendor === 'ALL' || inv.vendorId === filterVendor

    return matchesSearch && matchesType && matchesStatus && matchesVendor
  })

  return (
    <div style={{ padding: inline ? '0' : '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.6rem' }}>
            <FileText size={28} style={{ color: 'var(--accent-color)' }} />
            Manual Invoice Workspace
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Verify procurement ledgers, generate standard/GST tax invoices, and export PDFs.
          </p>
        </div>
        
        {viewMode === 'list' && (
          <button className="btn btn-primary" onClick={initCreateForm} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={16} />
            Create Manual Invoice
          </button>
        )}
      </div>

      {/* ERROR & SUCCESS TOASTS */}
      {error && (
        <div style={{ padding: '15px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <ShieldAlert size={18} />
          <span><strong>Error:</strong> {error}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '15px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
          <Check size={18} />
          <span><strong>Success:</strong> {successMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LIST WORKSPACE */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* SEARCH & FILTERS BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', padding: '15px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search Invoice #, vendor or PO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 38px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="ALL">All Types</option>
                <option value="STANDARD">Standard</option>
                <option value="GST">GST Tax</option>
                <option value="PROFORMA">Proforma</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Approval</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', maxWidth: '200px' }}
              >
                <option value="ALL">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              
              <button onClick={() => { fetchInvoices(); fetchReferenceData(); }} className="btn btn-secondary" style={{ padding: '10px' }} title="Reload Invoices">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          {/* INVOICES TABLE */}
          <div className="dashboard-table-container" style={{ border: '1px solid var(--border-color)', background: 'var(--card-bg)', borderRadius: '12px' }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Vendor Partner</th>
                  <th>Billing Type</th>
                  <th>Invoice Date</th>
                  <th>Billing Total</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                      <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                      Retrieving verified ledger invoices...
                    </td>
                  </tr>
                )}
                
                {!loading && filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '45px', color: 'var(--text-secondary)' }}>
                      <FileText size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
                      <p style={{ margin: 0 }}>No invoices matching the selected filters were found.</p>
                    </td>
                  </tr>
                )}

                {!loading && filteredInvoices.map(inv => (
                  <tr key={inv.id}>
                    <td>
                      <strong style={{ color: 'var(--accent-color)' }}>{inv.invoiceNumber}</strong>
                      {inv.poId && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Ref PO: {inv.poId.substring(0, 8)}...</div>}
                    </td>
                    <td>
                      <strong>{inv.vendor?.name || 'Manual Supplier'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{inv.vendor?.email || 'N/A'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '4px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', fontWeight: 'bold' }}>
                        {inv.invoiceType}
                      </span>
                    </td>
                    <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        ₹{parseFloat(inv.grandTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </td>
                    <td>
                      <span className={`invoice-status-badge status-${inv.status.toLowerCase()}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => { setSelectedInvoice(inv); setViewMode('view'); }}
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> View
                        </button>
                        
                        {(userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'PROCUREMENT_OFFICER') && (
                          <button
                            onClick={() => initEditForm(inv)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit size={12} /> Edit
                          </button>
                        )}

                        {inv.pdfUrl ? (
                          <button
                            onClick={() => window.open(inv.pdfUrl, '_blank')}
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--success-color)' }}
                          >
                            <Download size={12} /> PDF
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGeneratePdf(inv.id)}
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <RefreshCw size={12} /> Gen PDF
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

      {/* ========================================================================= */}
      {/* 2. CREATE / EDIT WORKSPACE (SIDE-BY-SIDE BUILDER + LIVE PREVIEW) */}
      {/* ========================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* LEFT PANEL: BUILDER FORM */}
          <form onSubmit={handleSubmitInvoice} style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                {viewMode === 'edit' ? `Modify Invoice Details (${formValues.invoiceNumber})` : 'Draft New Manual Invoice'}
              </h3>
              <button type="button" onClick={() => setViewMode('list')} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}>
                <ArrowLeft size={14} /> Back
              </button>
            </div>

            {/* SECTION 1: INVOICE INFORMATION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 1: Core Invoice Details</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Invoice Number *</label>
                  <input
                    type="text"
                    value={formValues.invoiceNumber}
                    onChange={(e) => setFormValues(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Invoice Type *</label>
                  <select
                    value={formValues.invoiceType}
                    onChange={(e) => setFormValues(prev => ({ ...prev, invoiceType: e.target.value }))}
                  >
                    <option value="STANDARD">STANDARD INVOICE</option>
                    <option value="GST">GST TAX INVOICE</option>
                    <option value="PROFORMA">PROFORMA ESTIMATE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Invoice Date *</label>
                  <input
                    type="date"
                    value={formValues.invoiceDate}
                    onChange={(e) => setFormValues(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formValues.dueDate}
                    onChange={(e) => setFormValues(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: REFERENCES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 2: Reference Document Codes</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Reference Purchase Order (PO)</label>
                  <select
                    value={formValues.poId}
                    onChange={(e) => setFormValues(prev => ({ ...prev, poId: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">No PO Reference</option>
                    {pos.map(p => (
                      <option key={p.id} value={p.id}>PO: {p.id.substring(0, 8)}... (₹{parseFloat(p.amount || 0).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference RFQ</label>
                  <select
                    value={formValues.rfqId}
                    onChange={(e) => setFormValues(prev => ({ ...prev, rfqId: e.target.value }))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  >
                    <option value="">No RFQ Reference</option>
                    {rfqs.map(r => (
                      <option key={r.id} value={r.id}>RFQ: {r.id.substring(0, 8)}... ({r.title})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: VENDOR DETAILS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 3: Supplier Partner Details</span>
              <div className="form-group">
                <label>Select Registered Supplier *</label>
                <select
                  value={formValues.vendorId}
                  onChange={(e) => handleVendorChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Supplier --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {formValues.vendorId && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem', padding: '12px', background: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Supplier Billing Address</label>
                    <span style={{ color: 'var(--text-primary)' }}>{formValues.vendorAddress}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Supplier GSTIN</label>
                    <strong style={{ color: 'var(--text-primary)' }}>{formValues.vendorGst}</strong>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Email ID</label>
                    <span style={{ color: 'var(--text-primary)' }}>{formValues.vendorEmail}</span>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Telephone</label>
                    <span style={{ color: 'var(--text-primary)' }}>{formValues.vendorPhone}</span>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: ITEMS TABLE */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 5: Line Items</span>
                <button type="button" onClick={addItemRow} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PlusCircle size={14} /> Add Row
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formValues.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Item Description..."
                      value={item.itemDescription}
                      onChange={(e) => handleItemChange(idx, 'itemDescription', e.target.value)}
                      style={{ flex: 2, padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                      style={{ width: '70px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'center' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      style={{ width: '100px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right' }}
                      required
                    />
                    <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={formValues.items.length <= 1}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: FINANCIAL CHARGES & SUMMARY */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 6: Deductions, Charges & Taxes</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Add GST/Taxes (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.taxAmount}
                    onChange={(e) => setFormValues(prev => ({ ...prev, taxAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="form-group">
                  <label>Discount Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.discountAmount}
                    onChange={(e) => setFormValues(prev => ({ ...prev, discountAmount: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="form-group">
                  <label>Logistics/Handling (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.additionalCharges}
                    onChange={(e) => setFormValues(prev => ({ ...prev, additionalCharges: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 7: PAYMENT INFORMATION */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 7: Bank & Settlement Information</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    value={formValues.bankName}
                    onChange={(e) => setFormValues(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Bank Account Number</label>
                  <input
                    type="text"
                    value={formValues.accountNumber}
                    onChange={(e) => setFormValues(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    value={formValues.ifscCode}
                    onChange={(e) => setFormValues(prev => ({ ...prev, ifscCode: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    value={formValues.upiId}
                    onChange={(e) => setFormValues(prev => ({ ...prev, upiId: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 8: NOTES & REMARKS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px dashed var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-color)' }}>Section 8: Notes, Remarks & Signatory</span>
              <div className="form-group">
                <label>Authorized Signatory (VyaparSetu Auditor) *</label>
                <input
                  type="text"
                  value={formValues.authorizedSignatory}
                  onChange={(e) => setFormValues(prev => ({ ...prev, authorizedSignatory: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Internal Audit Remarks</label>
                <textarea
                  rows="2"
                  value={formValues.remarks}
                  onChange={(e) => setFormValues(prev => ({ ...prev, remarks: e.target.value }))}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* FORM ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
              <button type="button" onClick={() => setViewMode('list')} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {loading ? <RefreshCw size={14} className="spin" /> : <Check size={14} />}
                {viewMode === 'edit' ? 'Save Changes' : 'Publish Invoice'}
              </button>
            </div>
          </form>

          {/* RIGHT PANEL: LIVE PDF PREVIEW PANEL */}
          <div style={{ position: 'sticky', top: '30px', background: '#ffffff', color: '#111827', border: '1px solid #d1d5db', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #374151', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: '#374151', color: '#ffffff', borderRadius: '4px', fontWeight: 'bold' }}>
                  {formValues.invoiceType} PREVIEW
                </span>
                <h4 style={{ margin: '4px 0 0 0', fontSize: '1.2rem', color: '#1f2937' }}>{formValues.invoiceNumber || 'DRAFT_NUMBER'}</h4>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Filing Date:</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{formValues.invoiceDate}</div>
              </div>
            </div>

            {/* Header / Letterhead layout */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Supplier (Bill From)</span>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{formValues.vendorName || 'No Supplier Selected'}</strong>
                <p style={{ margin: '4px 0 0 0', color: '#4b5563', lineHeight: '1.3' }}>
                  {formValues.vendorAddress || 'Select a supplier from the form dropdown.'} <br />
                  GSTIN: {formValues.vendorGst || 'N/A'} <br />
                  Contact: {formValues.vendorPhone} | {formValues.vendorEmail}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', fontWeight: 'bold', textTransform: 'uppercase' }}>Buyer (Bill To)</span>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{formValues.buyerName}</strong>
                <p style={{ margin: '4px 0 0 0', color: '#4b5563', lineHeight: '1.3' }}>
                  {formValues.buyerAddress} <br />
                  GSTIN: {formValues.buyerGst} <br />
                  Contact: {formValues.buyerPhone}
                </p>
              </div>
            </div>

            {/* Reference numbers code line */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', padding: '10px', borderRadius: '6px', fontSize: '0.75rem' }}>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Ref PO Code</span>
                <strong style={{ color: '#1f2937' }}>{formValues.poId ? `PO-${formValues.poId.substring(0, 8)}` : 'None'}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Ref RFQ Code</span>
                <strong style={{ color: '#1f2937' }}>{formValues.rfqId ? `RFQ-${formValues.rfqId.substring(0, 8)}` : 'None'}</strong>
              </div>
              <div>
                <span style={{ color: '#6b7280', display: 'block' }}>Payment Terms</span>
                <strong style={{ color: '#1f2937' }}>{formValues.paymentTerms || 'N/A'}</strong>
              </div>
            </div>

            {/* Line items list preview table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db', textAlign: 'left', fontWeight: 'bold', color: '#374151' }}>
                  <th style={{ padding: '8px' }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '60px' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '100px' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '100px' }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {formValues.items.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px', color: '#1f2937' }}>
                      <strong>{item.itemDescription || 'Draft Item Row'}</strong>
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#4b5563' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right', color: '#4b5563' }}>₹{(item.unitPrice || 0).toLocaleString()}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#111827' }}>
                      ₹{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #374151', paddingTop: '12px' }}>
              <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                  <span>Subtotal:</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                  <span>GST/Taxes:</span>
                  <span>₹{parseFloat(formValues.taxAmount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                  <span>Logistics/Charges:</span>
                  <span>₹{parseFloat(formValues.additionalCharges || 0).toLocaleString()}</span>
                </div>
                {formValues.discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                    <span>Discount Deducted:</span>
                    <span>-₹{parseFloat(formValues.discountAmount || 0).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #d1d5db', paddingTop: '6px', fontWeight: 'bold', fontSize: '0.95rem', color: '#111827' }}>
                  <span>Invoice Grand Total:</span>
                  <span>₹{calculateGrandTotal().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Settlement/Bank details preview */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px', borderTop: '1px solid #e5e7eb', paddingTop: '15px', fontSize: '0.75rem' }}>
              <div>
                <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Remittance Banking Details:</strong>
                <span style={{ color: '#4b5563' }}>
                  Bank: {formValues.bankName} <br />
                  A/C Number: {formValues.accountNumber} <br />
                  IFSC: {formValues.ifscCode} <br />
                  UPI ID: {formValues.upiId}
                </span>
              </div>
              <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: '15px' }}>
                <strong style={{ color: '#374151', display: 'block', marginBottom: '4px' }}>Authorized Auditor Signature:</strong>
                <div style={{ fontStyle: 'italic', fontSize: '1.1rem', margin: '6px 0', color: '#1d4ed8', fontFamily: 'Georgia, serif' }}>
                  {formValues.authorizedSignatory || 'Auditor Sign'}
                </div>
                <span style={{ color: '#9ca3af', fontSize: '0.65rem' }}>VyaparSetu Procurement Seal</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DETAILED VIEW MODE */}
      {/* ========================================================================= */}
      {viewMode === 'view' && selectedInvoice && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* View Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setViewMode('list')} className="btn btn-secondary" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h3 style={{ margin: 0 }}>Review Invoice: {selectedInvoice.invoiceNumber}</h3>
              <span className={`invoice-status-badge status-${selectedInvoice.status.toLowerCase()}`}>
                {selectedInvoice.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {selectedInvoice.pdfUrl ? (
                <button
                  onClick={() => window.open(selectedInvoice.pdfUrl, '_blank')}
                  className="btn btn-primary"
                  style={{ background: 'var(--success-color)' }}
                >
                  <Download size={16} /> Open PDF Document
                </button>
              ) : (
                <button onClick={() => handleGeneratePdf(selectedInvoice.id)} className="btn btn-primary">
                  <RefreshCw size={16} /> Generate Verified PDF
                </button>
              )}
            </div>
          </div>

          {/* Double column details page */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
            
            {/* Left Main billing details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Reference Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Reference PO ID</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedInvoice.poId || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Reference RFQ ID</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedInvoice.rfqId || 'N/A'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>Quotation ID</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedInvoice.quotationId || 'N/A'}</strong>
                </div>
              </div>

              {/* Items List Table */}
              <div className="dashboard-table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Item Description</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td><strong>{item.itemDescription}</strong></td>
                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{parseFloat(item.unitPrice).toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}><strong>₹{parseFloat(item.amount).toLocaleString()}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bank Details & Terms */}
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Remittance & Settlement Instructions</strong>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Bank Details: {selectedInvoice.bankDetails || 'N/A'} <br />
                  Payment Terms: {selectedInvoice.paymentTerms || 'Standard due terms apply.'}
                </p>
              </div>

              {/* Remarks */}
              {selectedInvoice.remarks && (
                <div style={{ padding: '15px', background: 'var(--bg-color)', borderLeft: '4px solid var(--accent-color)', borderRadius: '0 8px 8px 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  <strong>Internal Auditor Remarks:</strong>
                  <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>{selectedInvoice.remarks}</p>
                </div>
              )}
            </div>

            {/* Right financial invoice summary summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Financial Invoice Summary</strong>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Subtotal Amount:</span>
                  <span>₹{parseFloat(selectedInvoice.subtotal).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Taxes (GST):</span>
                  <span>₹{parseFloat(selectedInvoice.taxAmount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>Logistics/Charges:</span>
                  <span>₹{parseFloat(selectedInvoice.additionalCharges || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                  <span>Discount:</span>
                  <span>-₹{parseFloat(selectedInvoice.discountAmount || 0).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '5px', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-color)' }}>
                  <span>Verified Grand Total:</span>
                  <span>₹{parseFloat(selectedInvoice.grandTotal).toLocaleString()}</span>
                </div>
              </div>

              {/* Vendor Info card */}
              <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Supplier Partner Info</strong>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>{selectedInvoice.vendor?.name}</strong> <br />
                  GSTIN: {selectedInvoice.vendor?.gstin || 'N/A'} <br />
                  Email: {selectedInvoice.vendor?.email} <br />
                  Status: {selectedInvoice.vendor?.status}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}

export default InvoiceBuilder
