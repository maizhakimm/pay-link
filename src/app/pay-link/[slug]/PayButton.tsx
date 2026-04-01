'use client'

import { useState } from 'react'

export default function PayButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    try {
      setLoading(true)

      const res = await fetch(`/api/payments/bayarcash/create?slug=${slug}`)
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
    <button
      onClick={handleClick}
      disabled={loading}
      style={{
        display: 'inline-block',
        width: '100%',
        maxWidth: '420px',
        padding: '16px 22px',
        borderRadius: '14px',
        background: loading ? '#86efac' : '#16a34a',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: 800,
        boxShadow: '0 10px 20px rgba(22,163,74,0.22)',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Redirecting...' : 'Proceed to Secure Payment'}
    </button>
  )
}
