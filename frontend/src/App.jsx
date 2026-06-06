import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignUpPage from './pages/SignUpPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import ManagerDashboard from './pages/ManagerDashboard.jsx'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentPage, setCurrentPage] = useState('landing') // 'landing' | 'login' | 'signup' | 'admin-dashboard' | 'manager-dashboard'

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} />
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            onNavigate={setCurrentPage} 
          />
        )
      case 'manager-dashboard':
        return (
          <ManagerDashboard 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            onNavigate={setCurrentPage} 
          />
        )
      default:
        return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} onNavigate={setCurrentPage} />
    }
  }

  return renderPage()
}

export default App
