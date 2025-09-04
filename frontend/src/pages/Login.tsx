import React, { useState } from 'react'
import { api, setAuth } from '../lib/api'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      setAuth(data.tokens.accessToken)
      await Swal.fire({ icon: 'success', title: '로그인 성공', text: `${data.user.email}님 환영합니다!` })
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: '로그인 실패', text: e?.response?.data?.error || '다시 시도해주세요.' })
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>로그인</h2>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="이메일" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="비밀번호" autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit" style={{ padding: '10px 12px', background: '#111', color: '#fff', borderRadius: 8 }}>로그인</button>
      </form>
      <div style={{ color: '#888' }}>아직 계정이 없으신가요? <Link to="/register">회원가입</Link></div>
    </div>
  )
}
