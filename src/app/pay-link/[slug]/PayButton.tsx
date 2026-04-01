'use client'

import { useState } from 'react'

type PayButtonProps = {
  slug: string
  unitPrice: number
  quantity: number
  total: number
}

export default function PayButton({
  slug,
  quantity,
  total,
}: PayButtonProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  async function handleClick() {
    if (!name || !email || !phone) {
      alert('Please enter your name, email and phone number')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `/api/payments/bayarcash/create?slug=${encodeURIComponent(
          slug
        )}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(
          email
        )}&phone=${encodeURIComponent(phone)}&quantity=${quantity}`
      )

      const data = await res.json()

      if (!res.ok || !data.ok) {
        alert(data.error || `Payment start failed (status ${res.status})`)
        return
      }

      if (data.raw_response) {
        const parsed = JSON.parse(data.raw_response)

        if (parsed.url) {
          window.location.href = parsed.url
          return
        }
      }

      alert('Payment URL not found')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div
        style={{
          display: 'grid',
          gap: '10px',
          marginBottom: '14px',
        }}
      >
        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
          }}
        />

        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
          }}
        />

        <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          Phone Number
        </label>
        <input
          type="tel"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{
            width: '100%',
            padding: '13px 14px',
            borderRadius: '12px',
            border: '1px solid #dbe2ea',
            fontSize: '14px',
            outline: 'none',
            background: '#fff',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
          padding: '14px 0 2px',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <span style={{ color: '#64748b', fontSize: '14px' }}>Total</span>
        <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '18px' }}>
          RM {total.toFixed(2)}
        </span>
      </div>

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          background: loading ? '#93c5fd' : '#0f172a',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 800,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 12px 24px rgba(15,23,42,0.18)',
        }}
      >
        {loading ? 'Redirecting...' : 'Pay Now'}
      </button>
    </div>
  )
}
