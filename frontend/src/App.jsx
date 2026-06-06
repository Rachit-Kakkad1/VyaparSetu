import React, { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage.jsx'

function App() {
  const [darkMode, setDarkMode] = useState(false)

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

  return (
    <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
  )
}

export default App;
