'use client'

import { useState } from 'react'

type CartItem = {
  product_id: string
  quantity: number
}

const STATES = [
  'Perlis',
  'Kedah',
  'Pulau Pinang',
  'Perak',
  'Selangor',
  'W.P. Kuala Lumpur',
  'W.P. Putrajaya',
  'Negeri Sembilan',
  'Melaka',
  'Johor',
  'Pahang',
  'Terengganu',
  'Kelantan',
  'W.P. Labuan',
  'Sabah',
  'Sarawak',
]

const PAYMENT_METHODS = [
  { label: 'FPX (Online Banking)', value: 1 },
  { label: 'Card (Visa / Mastercard)', value: 4 },
  { label: 'SPayLater', value: 7 },
  { label: 'Boost PayFlex', value: 8 },
]

export default function ShopPayButton({
  sellerId,
  shopSlug,
  items,
  total,
}: {
  sellerId: string
  shopSlug: string
  items: CartItem[]
  total: number
}) {
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+60')
  const [paymentMethod, setPaymentMethod] = useState(1)

  const [needsDelivery, setNeedsDelivery] = useState(false)

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [postcode, setPostcode] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')

  function handlePhoneChange(value: string) {
    let cleaned = value.replace(/[^\d+]/g, '')
    if (!cleaned.startsWith('+60')) cleaned = '+60'
    setPhone(cleaned)
  }

  function handlePostcodeChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 5)
    setPostcode(cleaned)
  }

  async function handleClick() {
    if (!name || !email || phone.length <= 3) {
      alert('Sila isi nama, emel dan nombor telefon yang sah')
      return
    }

    if (items.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu item')
      return
    }

    if (needsDelivery) {
      if (!address1 || !postcode || !city || !district || !state) {
        alert('Sila lengkapkan maklumat penghantaran')
        return
      }
    }

    try {
      setLoading(true)

      const res = await fetch('/api/payments/bayarcash/create-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sellerId,
          shopSlug,
          name,
          email,
          phone,
          items,
          paymentChannel: paymentMethod,
          delivery: needsDelivery
            ? {
                address1,
                address2,
                postcode,
                city,
                district,
                state,
              }
            : null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      if (data.payment_url) {
        window.location.href = data.payment_url
        return
      }

      alert('Payment link not available')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ display: 'grid', gap: '10px', marginBottom: '14px' }}>
        <label>Full Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={inputStyle}
        />

        <label>Email Address</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={inputStyle}
        />

        <label>Phone Number</label>
        <input
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          style={inputStyle}
        />

        <label>Payment Method</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(Number(e.target.value))}
          style={inputStyle}
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>

        <div style={toggleBox}>
          <label style={toggleLabel}>
            <div>
              <strong>Delivery required</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Turn on if delivery needed
              </div>
            </div>

            <div
              onClick={() => setNeedsDelivery(!needsDelivery)}
              style={{
                width: '48px',
                height: '28px',
                borderRadius: '999px',
                background: needsDelivery ? '#1d4ed8' : '#cbd5e1',
                position: 'relative',
                cursor: 'pointer',
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
                  background: '#fff',
                }}
              />
            </div>
          </label>
        </div>

        {needsDelivery && (
          <>
            <label>Address Line 1</label>
            <input
              value={address1}
              onChange={(e) => setAddress1(e.target.value)}
              style={inputStyle}
            />

            <label>Address Line 2</label>
            <input
              value={address2}
              onChange={(e) => setAddress2(e.target.value)}
              style={inputStyle}
            />

            <label>Postcode</label>
            <input
              value={postcode}
              onChange={(e) => handlePostcodeChange(e.target.value)}
              style={inputStyle}
            />

            <label>City</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={inputStyle}
            />

            <label>District</label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={inputStyle}
            />

            <label>State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              style={inputStyle}
            >
              <option value="">Select state</option>
              {STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </>
        )}
      </div>

      <div style={totalRow}>
        <span>Total</span>
        <strong>RM {total.toFixed(2)}</strong>
      </div>

      <button onClick={handleClick} disabled={loading} style={buttonStyle}>
        {loading ? 'Processing payment...' : 'Proceed to Payment'}
      </button>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '13px',
  borderRadius: '12px',
  border: '1px solid #dbe2ea',
} as const

const toggleBox = {
  padding: '12px',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  background: '#f8fafc',
} as const

const toggleLabel = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
} as const

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
  paddingTop: '10px',
  borderTop: '1px solid #e2e8f0',
} as const

const buttonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  border: 'none',
  cursor: 'pointer',
  opacity: 1,
} as const
