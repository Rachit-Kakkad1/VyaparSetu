import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'
import OfficerDashboard from './pages/OfficerDashboard.jsx'
import VendorDashboard from './pages/VendorDashboard.jsx'

function App() {
  const [darkMode, setDarkMode] = useState(true)
  const [currentPage, setCurrentPage] = useState('landing') // 'landing' | 'login' | 'signup' | 'admin-dashboard' | 'manager-dashboard' | 'officer-dashboard' | 'vendor-dashboard'

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  // Restore session from localStorage on component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        const role = user.role?.name
        if (role === 'ADMIN') {
          setCurrentPage('admin-dashboard')
        } else if (role === 'MANAGER') {
          setCurrentPage('manager-dashboard')
        } else if (role === 'PROCUREMENT_OFFICER') {
          setCurrentPage('officer-dashboard')
        } else if (role === 'VENDOR') {
          setCurrentPage('vendor-dashboard')
        }
      } catch (e) {
        console.error('Error parsing stored user session:', e)
      }
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const handleNavigate = (page) => {
    if (page === 'landing') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
    setCurrentPage(page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />
      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />
      case 'admin-dashboard':
        return (
          <AdminDashboard
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onNavigate={handleNavigate}
          />
        )
      case 'manager-dashboard':
        return (
          <ManagerDashboard
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onNavigate={handleNavigate}
          />
        )
      case 'officer-dashboard':
        return (
          <OfficerDashboard
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onNavigate={handleNavigate}
          />
        )
      case 'vendor-dashboard':
        return (
          <VendorDashboard
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onNavigate={handleNavigate}
          />
        )
      default:
        return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} onNavigate={handleNavigate} />
    }
  }

  return renderPage()
}

export default App

// Frontend routing structure
