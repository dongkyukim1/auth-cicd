import React, { useState } from 'react'
import { api, publicApi, setAuth } from '../lib/api'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'

export default function Register() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  async function requestCode() {
    try {
      // 공개 엔드포인트: Authorization 헤더 없이 호출
      await publicApi.post('/auth/send-code', { email })
      await Swal.fire({ icon: 'success', title: '인증코드 발송', text: `${email}로 전송했습니다.` })
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: '발송 실패', text: e?.response?.data?.error || '잠시 후 다시 시도해 주세요.' })
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/register', { email, name, password, code })
      setAuth(data.tokens.accessToken)
      await Swal.fire({ icon: 'success', title: '가입 완료', text: `${data.user.email}님 환영합니다!` })
    } catch (e: any) {
      await Swal.fire({ icon: 'error', title: '가입 실패', text: e?.response?.data?.error || '다시 시도해 주세요.' })
    }
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0 }}>회원가입</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        <input placeholder="이메일" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <button onClick={requestCode} disabled={!email} style={{ padding: '8px 10px', border: '1px solid #ddd', borderRadius: 8 }}>인증코드 보내기</button>
      </div>
      <form onSubmit={handleRegister} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="이름" autoComplete="name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="비밀번호" autoComplete="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <input placeholder="인증코드" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value)} />
        <button type="submit" style={{ padding: '10px 12px', background: '#111', color: '#fff', borderRadius: 8 }}>가입하기</button>
      </form>
      <div style={{ color: '#888' }}>이미 계정이 있으신가요? <Link to="/login">로그인</Link></div>
    </div>
  )
}
