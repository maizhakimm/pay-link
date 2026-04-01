'use client'

import { useState } from 'react'

export default function PayButton({ slug }: { slug: string }) {
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
        )}&phone=${encodeURIComponent(phone)}`
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
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
        }}
      />

      <input
        type="email"
        placeholder="Your Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '10px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
        }}
      />

      <input
        type="tel"
        placeholder="Your Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
          fontSize: '14px',
        }}
      />

      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          background: loading ? '#86efac' : '#16a34a',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: 800,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 10px 20px rgba(22,163,74,0.22)',
        }}
      >
        {loading ? 'Redirecting...' : 'Proceed to Secure Payment'}
      </button>
    </div>
  )
}
