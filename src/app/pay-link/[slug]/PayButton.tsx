'use client'

import { useState } from 'react'

export default function PayButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  async function handleClick() {
    if (!name || !email) {
      alert('Please enter your name and email')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `/api/payments/bayarcash/create?slug=${slug}&name=${encodeURIComponent(
          name
        )}&email=${encodeURIComponent(email)}`
      )

      const data = await res.json()

      if (data.ok && data.raw_response) {
        const parsed = JSON.parse(data.raw_response)

        if (parsed.url) {
          window.location.href = parsed.url
          return
        }
      }

      alert('Unable to start payment. Please try again.')
    } catch {
      alert('Something went wrong. Please try again.')
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
          marginBottom: '16px',
          borderRadius: '10px',
          border: '1px solid #e5e7eb',
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
        }}
      >
        {loading ? 'Redirecting...' : 'Proceed to Secure Payment'}
      </button>
    </div>
  )
}
