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
  const [needsDelivery, setNeedsDelivery] = useState(false)
  const [address, setAddress] = useState('')

  async function handleClick() {
    if (!name || !email || !phone) {
      alert('Please enter your name, email and phone number')
      return
    }

    if (needsDelivery && !address.trim()) {
      alert('Please enter your delivery address')
      return
    }

    try {
      setLoading(true)

      const res = await fetch(
        `/api/payments/bayarcash/create?slug=${encodeURIComponent(
          slug
        )}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(
          email
        )}&phone=${encodeURIComponent(phone)}&quantity=${quantity}&needs_delivery=${
          needsDelivery ? '1' : '0'
        }&address=${encodeURIComponent(address)}`
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

        <div
          style={{
            marginTop: '6px',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#0f172a',
                  fontWeight: 700,
                  marginBottom: '2px',
                }}
              >
                Delivery required
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#64748b',
                }}
              >
                Turn on if this order needs delivery
              </div>
            </div>

            <div
              onClick={() => setNeedsDelivery((prev) => !prev)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '999px',
                background: needsDelivery ? '#1d4ed8' : '#cbd5e1',
                position: 'relative',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '3px',
                  left: needsDelivery ? '23px' : '3px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '999px',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s ease',
                  display: 'block',
                }}
              />
            </div>
          </label>
        </div>

        {needsDelivery && (
          <>
            <label style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
              Delivery Address
            </label>
            <textarea
              placeholder="Enter your delivery address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '13px 14px',
                borderRadius: '12px',
                border: '1px solid #dbe2ea',
                fontSize: '14px',
                outline: 'none',
                background: '#fff',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </>
        )}
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
