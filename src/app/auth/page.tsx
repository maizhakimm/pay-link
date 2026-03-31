'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    router.push('/dashboard')
  }

  const handleSignup = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Signup successful. Please login now.')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ marginBottom: '20px', color: '#111827' }}>Login / Signup</h2>

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            boxSizing: 'border-box',
            color: '#111827',
            background: '#ffffff',
          }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            border: '1px solid #d1d5db',
            borderRadius: '10px',
            boxSizing: 'border-box',
            color: '#111827',
            background: '#ffffff',
          }}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '10px',
            borderRadius: '10px',
            border: 'none',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {loading ? 'Please wait...' : 'Login'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#111827',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Sign Up
        </button>
      </div>
    </main>
  )
}
