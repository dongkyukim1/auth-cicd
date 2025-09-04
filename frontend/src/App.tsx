import React from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function Header() {
  const location = useLocation()
  const path = location.pathname
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#111', fontWeight: 700 }}>Auth Stack</Link>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/login" style={{ color: path === '/login' ? '#111' : '#666' }}>로그인</Link>
        <Link to="/register" style={{ color: path === '/register' ? '#111' : '#666' }}>회원가입</Link>
      </nav>
    </header>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: 16, display: 'grid', placeItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </main>
      <footer style={{ padding: 12, color: '#999', textAlign: 'center' }}>© Auth Stack</footer>
    </div>
  )
}
