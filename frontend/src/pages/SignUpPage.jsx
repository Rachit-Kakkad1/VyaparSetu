import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

function SignUpPage({ onNavigate }) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gst, setGst] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSignUp = (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match!')
      return
    }
    alert(`Vendor account created for: ${firstName} ${lastName} (${companyName})`)
    onNavigate('login')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container signup-split">
        {/* 40% Left Side Vendor Portal Illustration */}
        <div className="auth-visual-column">
          <div className="illustration-wrapper">
            <img 
              src="/images/login_vendor.png" 
              alt="Vendor Portal Registration" 
              className="illustration-img fade-in" 
            />
          </div>
        </div>

        {/* 60% Right Side Sign-up Form */}
        <div className="auth-form-column">
          <button className="back-home-btn" onClick={() => onNavigate('landing')}>
            <ArrowLeft size={16} /> Back to Home
          </button>

          <div className="auth-form-box">
            <h2 className="auth-title">Vendor Registration</h2>
            <p className="auth-subtitle">Register your business to start bidding and receiving purchase orders</p>

            <form onSubmit={handleSignUp} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    placeholder="Acme Supplies Ltd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gst">GST Number</label>
                  <input
                    type="text"
                    id="gst"
                    placeholder="22AAAAA0000A1Z5"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit-btn">
                Register as Vendor
              </button>
            </form>
          </div>

          <div className="auth-footer">
            Already have an account? <button onClick={() => onNavigate('login')}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUpPage
