import React, { useState, useEffect } from 'react'
import {
  Sun,
  Moon,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  ShieldCheck,
  PlusCircle,
  Activity,
  FileSpreadsheet,
  Mail,
  FileDown,
  LayoutDashboard,
  Briefcase,
  ExternalLink,
  ArrowRight
} from 'lucide-react'

function LandingPage({ darkMode, toggleDarkMode, onNavigate }) {
  // Live bid mockup interactive state
  const [selectedBidIndex, setSelectedBidIndex] = useState(0)

  // Interactive Roles state
  const [activeTab, setActiveTab] = useState('officer')
  const [isHovered, setIsHovered] = useState(false)

  const roles = ['officer', 'vendor', 'manager', 'admin']

  useEffect(() => {
    if (isHovered) return

    const interval = setInterval(() => {
      setActiveTab((currentTab) => {
        const currentIndex = roles.indexOf(currentTab)
        const nextIndex = (currentIndex + 1) % roles.length
        return roles[nextIndex]
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isHovered])

  const bids = [
    { vendor: 'Apex Solutions Ltd', price: '₹4,50,000', delivery: '5 Days', rating: '4.8 ★', bestPrice: true },
    { vendor: 'Zenith Tech Group', price: '₹4,85,000', delivery: '3 Days', rating: '4.5 ★', bestPrice: false },
    { vendor: 'Vedic Enterprises', price: '₹5,10,000', delivery: '7 Days', rating: '4.9 ★', bestPrice: false }
  ]

  const rolesData = {
    officer: {
      title: 'Procurement Officer',
      desc: 'Initiate and manage the lifecycle of Requests for Quotations (RFQs). Review, compare, and prepare official documents for approval.',
      features: [
        'Create RFQs with multi-item lists and deadlines',
        'Invite verified vendors to submit proposals',
        'Compare vendor bids side-by-side with lowest-price highlighting',
        'Convert approved proposals to Purchase Orders (PO)'
      ],
      mockup: {
        title: 'Procurement Console',
        metrics: [
          { label: 'Active RFQs', val: '12' },
          { label: 'Unopened Quotes', val: '28' }
        ],
        logs: [
          { item: 'RFQ-2026-004 published', time: '10m ago' },
          { item: 'Received quote from Apex Solutions', time: '1h ago' }
        ]
      }
    },
    vendor: {
      title: 'Registered Vendor',
      desc: 'Access invitations to open RFQs, submit competitive quotations, track bid statuses, and manage contracts.',
      features: [
        'Secure vendor portal with clean status dashboard',
        'Submit digital quotations with delivery timelines',
        'Receive automated alerts for purchase orders',
        'Track payment milestones and invoice releases'
      ],
      mockup: {
        title: 'Vendor Portal',
        metrics: [
          { label: 'Invited RFQs', val: '4' },
          { label: 'Active Quotes', val: '8' }
        ],
        logs: [
          { item: 'Submitted quotation for RFQ-2026-004', time: '2h ago' },
          { item: 'Received PO-2026-012 from officer', time: '1d ago' }
        ]
      }
    },
    manager: {
      title: 'Manager / Approver',
      desc: 'Oversee procurement pipelines, review structured comparison reports, and authorize high-value Purchase Orders.',
      features: [
        'Unified approval queue with instant alerts',
        'View complete audit histories for each bid comparison',
        'Approve or reject requests with audit remarks',
        'Track monthly spending caps and budget utilization'
      ],
      mockup: {
        title: 'Approver Dashboard',
        metrics: [
          { label: 'Pending Approvals', val: '3' },
          { label: 'Approved Today', val: '₹14.5L' }
        ],
        logs: [
          { item: 'Approved PO-2026-011 (₹8,20,000)', time: '5m ago' },
          { item: 'Pending review: RFQ-2026-003', time: '30m ago' }
        ]
      }
    },
    admin: {
      title: 'System Administrator',
      desc: 'Manage ERP access, configure approval workflow thresholds, register verified vendors, and auditthe application.',
      features: [
        'Role-based User Access Control (RBAC)',
        'Vendor validation and GST verification logs',
        'Full immutable system-wide activity logs',
        'Global settings, backup exports, and system analytics'
      ],
      mockup: {
        title: 'Admin Command Center',
        metrics: [
          { label: 'Total Users', val: '45' },
          { label: 'Verified Vendors', val: '120' }
        ],
        logs: [
          { item: 'User "John Officer" role updated', time: '2d ago' },
          { item: 'System backup generated', time: '3d ago' }
        ]
      }
    }
  }

  return (
    <div className="landing-wrapper">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="container">
          <a href="#" className="logo">
            <div className="logo-icon">VB</div>
            VendorBridge
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#workflow">Workflows</a></li>
              <li><a href="#roles">Roles</a></li>
              <li><a href="#pricing">Portal Preview</a></li>
            </ul>
          </nav>
          <div className="nav-actions">
            <button className="theme-toggle" onClick={toggleDarkMode} aria-label="Toggle Theme">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn btn-secondary" onClick={() => onNavigate('login')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => onNavigate('signup')}>Register</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', alignItems: 'center' }}>
          <div className="hero-content">
            <div className="hero-tag">Unified Procurement ERP</div>
            <h1 className="hero-title">
              Simplify Procurement. <br />
              <span>Streamline Vendor Relations.</span>
            </h1>
            <p className="hero-subtitle">
              VendorBridge is a modern, role-based MERN platform built for organizational efficiency.
              Digitize your entire flow from Request for Quotations (RFQs), live bid comparisons, and
              approvals to automated purchase orders and invoices.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                Launch Interactive Demo <ArrowRight size={16} />
              </button>
              <button className="btn btn-secondary">Explore Architecture</button>
            </div>
          </div>

          {/* Interactive Live Bid Comparison Box */}
          <div className="hero-mockup">
            <div className="mockup-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#AD8B73' }}></div>
                <span className="mockup-title">Smart Quotation Comparison Matrix</span>
              </div>
              <span className="mockup-badge">RFQ-2026-004</span>
            </div>

            <div className="mockup-body">
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Select a vendor row below to evaluate pricing and route to the approval pipeline.
              </p>

              <div className="comp-table-wrapper">
                <table className="comp-table">
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Bid Price</th>
                      <th>Delivery</th>
                      <th>Rating</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((bid, index) => (
                      <tr
                        key={index}
                        className={index === selectedBidIndex ? 'selected' : ''}
                        onClick={() => setSelectedBidIndex(index)}
                      >
                        <td style={{ fontWeight: '600' }}>{bid.vendor}</td>
                        <td style={{ color: 'var(--accent-color)', fontWeight: '700' }}>{bid.price}</td>
                        <td>{bid.delivery}</td>
                        <td style={{ color: '#F5B041', fontWeight: '500' }}>{bid.rating}</td>
                        <td>
                          {index === selectedBidIndex ? (
                            <span className="selected-badge">✓ Selected</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mockup-comparison">
                <div className="comparison-header">Approval Pipeline Status</div>
                <div className="mockup-row">
                  <span className="mockup-label">Selected Bid</span>
                  <span className="mockup-val">{bids[selectedBidIndex].vendor}</span>
                </div>
                <div className="mockup-row">
                  <span className="mockup-label">Total Bid Amount</span>
                  <span className="mockup-val" style={{ color: 'var(--accent-color)' }}>{bids[selectedBidIndex].price}</span>
                </div>
                <div className="mockup-row" style={{ borderBottom: 'none' }}>
                  <span className="mockup-label">Next Action</span>
                  <span className="mockup-val" style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                    Send to Manager Approval Queue
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-num">98%</span>
              <span className="stat-desc">Procurement Speedup</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">₹1.2Cr+</span>
              <span className="stat-desc">Spent Managed</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">1.4k+</span>
              <span className="stat-desc">Active POs Issued</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">0%</span>
              <span className="stat-desc">Manual Errors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="section" style={{ backgroundColor: 'rgba(173,139,115,0.03)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Core Capabilities</span>
            <h2 className="section-title">Fully Integrated Procurement Suite</h2>
            <p className="section-desc">
              All the tools required to govern vendor databases, distribute digital tenders, compare and verify,
              and generate automated legal billing items.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-number">01</span>
              <div className="feature-icon">
                <Users size={24} />
              </div>
              <h3 className="feature-title">Vendor Governance</h3>
              <p className="feature-desc">
                Register vendor details, category classifications, and legal documents like GST number. Record and evaluate ratings based on delivery cycles.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">02</span>
              <div className="feature-icon">
                <PlusCircle size={24} />
              </div>
              <h3 className="feature-title">Smart RFQ Creation</h3>
              <p className="feature-desc">
                Draft RFQs with multi-item specifications, specify quantities, attach drawings, select deadlines, and automatically dispatch bids to target vendors.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">03</span>
              <div className="feature-icon">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">Bid Comparison Matrix</h3>
              <p className="feature-desc">
                Automatically generate matrices listing incoming pricing, timeline commitments, and ratings. Instantly flags the lowest pricing for convenience.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">04</span>
              <div className="feature-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Approval Workflows</h3>
              <p className="feature-desc">
                Structured approvals route proposed POs to managers. Records authorization logs, custom rejection remarks, and workflow history.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">05</span>
              <div className="feature-icon">
                <FileText size={24} />
              </div>
              <h3 className="feature-title">PO & Invoices</h3>
              <p className="feature-desc">
                Auto-generate professional PDF Purchase Orders. Instantly convert orders into invoices with automated tax calculations, printable layouts, and email templates.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-number">06</span>
              <div className="feature-icon">
                <Activity size={24} />
              </div>
              <h3 className="feature-title">Activity Logs</h3>
              <p className="feature-desc">
                Complete, immutable audit trails tracking user access, document states, approvals, and system events for absolute regulatory compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Panel Previews */}
      <section id="roles" className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Tailored Workspace Views</span>
            <h2 className="section-title">Designed for Collaboration</h2>
            <p className="section-desc">
              VendorBridge is designed around role security, giving each stakeholder a workspace tailored to their exact activities.
            </p>
          </div>

          <div className="pipeline-container">
            <div className="pipeline-stepper">
              <div className="pipeline-progress-bg">
                <div 
                  className="pipeline-progress-active" 
                  style={{ width: `${(roles.indexOf(activeTab) / (roles.length - 1)) * 100}%` }}
                />
              </div>
              
              {roles.map((role, index) => {
                const stepNames = {
                  officer: { label: 'Procurement Officer', action: 'Drafts RFQs' },
                  vendor: { label: 'Vendor Portal', action: 'Submits Bids' },
                  manager: { label: 'Manager / Approver', action: 'Approves POs' },
                  admin: { label: 'Admin Workspace', action: 'Audits Logs' }
                }
                const isActive = activeTab === role
                const isCompleted = roles.indexOf(activeTab) > index
                
                return (
                  <button
                    key={role}
                    className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setActiveTab(role)}
                  >
                    <div className="step-circle">
                      {index + 1}
                    </div>
                    <span className="step-label">{stepNames[role].label}</span>
                    <span className="step-sublabel">{stepNames[role].action}</span>
                  </button>
                )
              })}
            </div>

            <div 
              className="tab-content active" 
              key={activeTab}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="role-details">
                <h3 className="role-title">{rolesData[activeTab].title}</h3>
                <p className="role-desc">{rolesData[activeTab].desc}</p>
                <div className="role-features-grid">
                  {rolesData[activeTab].features.map((feature, idx) => (
                    <div key={idx} className="role-feature-card">
                      <div className="role-feature-icon">
                        <CheckCircle size={16} />
                      </div>
                      <span className="role-feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Role Mockup Frame wrapped in macOS Window Frame */}
              <div className="mockup-window-frame">
                <div className="window-header">
                  <div className="window-dots">
                    <span className="dot dot-red"></span>
                    <span className="dot dot-yellow"></span>
                    <span className="dot dot-green"></span>
                  </div>
                  <div className="window-address-bar">
                    vendorbridge.erp/{activeTab}_workspace
                  </div>
                </div>
                <div className="role-mockup-frame">
                  <div className="mock-sidebar">
                    <div className="mock-sidebar-icon active"><LayoutDashboard size={16} /></div>
                    <div className="mock-sidebar-icon"><FileText size={16} /></div>
                    <div className="mock-sidebar-icon"><Activity size={16} /></div>
                    <div className="mock-sidebar-icon"><Users size={16} /></div>
                  </div>
                  <div className="mock-main">
                    <div className="mock-main-header">{rolesData[activeTab].mockup.title}</div>
                    <div className="mock-card-grid">
                      {rolesData[activeTab].mockup.metrics.map((m, idx) => (
                        <div key={idx} className="mock-mini-card">
                          <span className="mock-mc-label">{m.label}</span>
                          <span className="mock-mc-val">{m.val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mock-list">
                      <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--text-secondary)', paddingBottom: '4px' }}>
                        Recent Activities & Logs
                      </div>
                      {rolesData[activeTab].mockup.logs.map((log, idx) => (
                        <div key={idx} className="mock-list-item">
                          <span>{log.item}</span>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container" style={{ padding: '40px 0' }}>
        <div className="cta-banner">
          <h2 className="cta-title">Upgrade Your Supply Chain Operations</h2>
          <p className="cta-desc">
            Stop relying on scattered email threads and manual Excel spreadsheets. Launch VendorBridge and establish transparency, auditability, and speed.
          </p>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button className="btn btn-primary" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }} onClick={() => onNavigate('signup')}>
              Get Started for Free
            </button>
            <button className="btn btn-secondary">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#" className="logo" style={{ border: 'none', padding: 0 }}>
                <div className="logo-icon">VB</div>
                VendorBridge
              </a>
              <p className="footer-about" style={{ marginTop: '10px' }}>
                Secure, auditable and highly scalable MERN ERP for organizations to govern supplier pipelines,
                negotiate pricing contracts, and automate digital purchase logs.
              </p>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Modules</h4>
              <ul>
                <li><a href="#">Vendor Database</a></li>
                <li><a href="#">RFQ Creation</a></li>
                <li><a href="#">Bid Matrix</a></li>
                <li><a href="#">Invoice Print</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Legal</h4>
              <ul>
                <li><a href="#">Terms of Use</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Audit Guidelines</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} VendorBridge ERP. All rights reserved.</span>
            <span style={{ display: 'flex', gap: '15px' }}>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage;
