import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, User, Shield, Briefcase, Users } from 'lucide-react'

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('officer@vyaparsetu.com')
  const [password, setPassword] = useState('password123')
  const [selectedRole, setSelectedRole] = useState('officer') // default 'officer'
  const demoBoxRef = useRef(null)

  const demoCredentials = {
    officer: { email: 'officer@vyaparsetu.com', password: 'password123' },
    vendor: { email: 'vendor@vyaparsetu.com', password: 'password123' },
    manager: { email: 'manager@vyaparsetu.com', password: 'password123' },
    admin: { email: 'admin@vyaparsetu.com', password: 'password123' }
  }

  const handleDemoSelect = (role) => {
    setSelectedRole(role)
    setEmail(demoCredentials[role].email)
    setPassword(demoCredentials[role].password)
  }

  // Bind a scroll wheel event listener to cycle demo roles and autofill fields
  useEffect(() => {
    const element = demoBoxRef.current
    if (!element) return

    const handleWheel = (e) => {
      e.preventDefault() // Prevents page from scrolling down/up

      const now = Date.now()
      if (window.lastScrollTime && now - window.lastScrollTime < 300) {
        return
      }
      window.lastScrollTime = now

      const roles = ['officer', 'vendor', 'manager', 'admin']
      const currentIndex = selectedRole ? roles.indexOf(selectedRole) : -1
      let nextIndex = 0

      if (e.deltaY > 0) {
        // Scroll down: cycle forward
        nextIndex = (currentIndex + 1) % roles.length
      } else if (e.deltaY < 0) {
        // Scroll up: cycle backward
        nextIndex = (currentIndex - 1 + roles.length) % roles.length
      } else {
        return
      }

      handleDemoSelect(roles[nextIndex])
    }

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [selectedRole])

  const handleSignIn = (e) => {
    e.preventDefault()
    const lowerEmail = email.toLowerCase()
    if (lowerEmail === 'admin@vyaparsetu.com') {
      onNavigate('admin-dashboard')
    } else if (lowerEmail === 'manager@vyaparsetu.com') {
      onNavigate('manager-dashboard')
    } else {
      alert(`Signed in as: ${email}`)
      onNavigate('landing')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      alert('Please enter your email address first.')
      return
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Password reset link sent to ' + email)
      } else {
        // Fallback for hackathon demo if backend user doesn't exist
        alert('Demo mode: Password reset link virtually sent to ' + email)
      }
    } catch (error) {
      alert('Demo mode: Password reset link virtually sent to ' + email)
    }
  }


  // Determine current image based on selected dummy role
  const getIllustration = () => {
    switch (selectedRole) {
      case 'officer': return '/images/officerimage.png'
      case 'vendor': return '/images/vendorimage.png'
      case 'manager': return '/images/managerimage.png'
      case 'admin': return '/images/adminimage1.png'
      default: return '/images/officerimage.png'
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container login-split">
        {/* 60% Left Side Sign-in Controls */}
        <div className="auth-form-column">
          <button className="back-home-btn" onClick={() => onNavigate('landing')}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div className="auth-form-box">
            <h2 className="auth-title">Welcome Back</h2>
            <p className="auth-subtitle">Sign in to manage your procurement pipeline</p>

            <form onSubmit={handleSignIn} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setSelectedRole(null) // Reset selected role if user edits input manually
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setSelectedRole(null)
                  }}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn">
                Sign In
              </button>
            </form>
          </div>

          {/* Dummy Auto-Fill Credentials Box */}
          <div className="demo-autofill-box" ref={demoBoxRef}>
            <div className="demo-box-header">
              <span className="demo-badge">Demo Account Auto-Fill</span>
              <p className="demo-desc">Select a role below to inject mock credentials and preview their dashboard</p>
            </div>
            
            <div className="demo-grid">
              <button 
                type="button" 
                className={`demo-btn ${selectedRole === 'officer' ? 'active' : ''}`}
                onClick={() => handleDemoSelect('officer')}
              >
                <div className="demo-icon"><User size={16} /></div>
                <div className="demo-details">
                  <span className="demo-role-name">Officer</span>
                  <span className="demo-action">Draft RFQs</span>
                </div>
              </button>

              <button 
                type="button" 
                className={`demo-btn ${selectedRole === 'vendor' ? 'active' : ''}`}
                onClick={() => handleDemoSelect('vendor')}
              >
                <div className="demo-icon"><Users size={16} /></div>
                <div className="demo-details">
                  <span className="demo-role-name">Vendor</span>
                  <span className="demo-action">Submit Bids</span>
                </div>
              </button>

              <button 
                type="button" 
                className={`demo-btn ${selectedRole === 'manager' ? 'active' : ''}`}
                onClick={() => handleDemoSelect('manager')}
              >
                <div className="demo-icon"><Briefcase size={16} /></div>
                <div className="demo-details">
                  <span className="demo-role-name">Manager</span>
                  <span className="demo-action">Approve POs</span>
                </div>
              </button>

              <button 
                type="button" 
                className={`demo-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleDemoSelect('admin')}
              >
                <div className="demo-icon"><Shield size={16} /></div>
                <div className="demo-details">
                  <span className="demo-role-name">Admin</span>
                  <span className="demo-action">Audit Logs</span>
                </div>
              </button>
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account? <button onClick={() => onNavigate('signup')}>Create Account</button>
          </div>
        </div>

        {/* 40% Right Side Dynamic Illustration */}
        <div className="auth-visual-column">
          <div className="illustration-wrapper">
            <img 
              key={getIllustration()} 
              src={getIllustration()} 
              alt="Workspace View" 
              className="illustration-img fade-in" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
