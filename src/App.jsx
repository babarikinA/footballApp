import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './pages/Home'
import AboutPage from './pages/About'
import ContactsPage from './pages/Contacts'
import RegisterPage from './pages/Register'
import AdminPage from './pages/Admin'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [authed, setAuthed] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogout = () => {
    setAuthed(false)
    setCurrentUser(null)
    localStorage.removeItem('footbool_session')
  }

  // Восстановление сессии для всех пользователей
  useEffect(() => {
    const raw = localStorage.getItem('footbool_session')
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      queueMicrotask(() => {
        setAuthed(true)
        setCurrentUser(saved)
      })
    } catch {
      localStorage.removeItem('footbool_session')
    }
  }, [])

  return (
    <BrowserRouter>
      <div className="page">
        <Header authed={authed} user={currentUser} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/admin"
              element={
                <AdminPage
                  onAuth={(user) => {
                    setAuthed(true)
                    setCurrentUser(user)
                  }}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
