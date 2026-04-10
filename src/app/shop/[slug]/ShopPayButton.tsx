'use client'

import { useMemo, useState } from 'react'

type CartItem = {
  product_id: string
  quantity: number
}

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'

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
  {
    value: 1,
    label: 'FPX Online Banking',
  },
  {
    value: 4,
    label: 'Credit / Debit Card',
  },
  {
    value: 6,
    label: 'DuitNow QR',
  },
  {
    value: 8,
    label: 'Boost PayFlex',
  },
]

function formatCurrency(amount?: number | null) {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
  }).format(Number(amount || 0))
}

export default function ShopPayButton({
  sellerId,
  shopSlug,
  items,
  total,
  deliveryMode = 'pay_rider_separately',
  deliveryFee = 0,
  deliveryArea = '',
  deliveryNote = '',
}: {
  sellerId: string
  shopSlug: string
  items: CartItem[]
  total: number
  deliveryMode?: DeliveryMode
  deliveryFee?: number
  deliveryArea?: string
  deliveryNote?: string
}) {
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('+60')
  const [paymentChannel, setPaymentChannel] = useState<string>('1')

  const [needsDelivery, setNeedsDelivery] = useState(false)

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [postcode, setPostcode] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [state, setState] = useState('')

  const deliverySummary = useMemo(() => {
    switch (deliveryMode) {
      case 'free_delivery':
        return 'Free delivery tersedia untuk kawasan terpilih.'
      case 'fixed_fee':
        return Number(deliveryFee || 0) > 0
          ? `Delivery fee sebanyak ${formatCurrency(deliveryFee)} akan dikenakan.`
          : 'Delivery fee akan dikenakan.'
      case 'included_in_price':
        return 'Harga produk telah termasuk delivery.'
      case 'pay_rider_separately':
      default:
        return 'Bayaran delivery dibuat berasingan terus kepada rider / seller.'
    }
  }, [deliveryMode, deliveryFee])

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
    if (loading) return

    if (!name.trim() || !email.trim() || phone.length <= 3) {
      alert('Sila isi nama, emel dan nombor telefon yang sah')
      return
    }

    if (items.length === 0) {
      alert('Sila pilih sekurang-kurangnya satu item')
      return
    }

    if (needsDelivery) {
      if (
        !address1.trim() ||
        !postcode.trim() ||
        !city.trim() ||
        !district.trim() ||
        !state.trim()
      ) {
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
          paymentChannel: Number(paymentChannel),
          name: name.trim(),
          email: email.trim(),
          phone,
          items,
          delivery: needsDelivery
            ? {
                address1: address1.trim(),
                address2: address2.trim(),
                postcode: postcode.trim(),
                city: city.trim(),
                district: district.trim(),
                state: state.trim(),
              }
            : null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      if (data.payment_url) {
        sessionStorage.setItem('bayarlink_shop_slug', shopSlug)
        window.location.href = data.payment_url
        return
      }

      alert('Payment link not available')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={wrapper}>
      <div style={deliveryNoticeBox}>
        <div style={deliveryNoticeTitle}>Info Delivery</div>
        <div style={deliveryNoticeText}>{deliverySummary}</div>

        {deliveryArea ? (
          <div style={deliveryNoticeMeta}>Kawasan liputan: {deliveryArea}</div>
        ) : null}

        {deliveryNote ? (
          <div style={deliveryNoticeMeta}>{deliveryNote}</div>
        ) : null}
      </div>

      <div style={formGrid}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Phone Number</label>
          <input
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Payment Method</label>
          <select
            value={paymentChannel}
            onChange={(e) => setPaymentChannel(e.target.value)}
            style={inputStyle}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </div>

        <div style={toggleBox}>
          <label style={toggleLabel}>
            <div>
              <strong style={toggleTitle}>Delivery required</strong>
              <div style={toggleSubtext}>Turn on if delivery needed</div>
            </div>

            <button
              type="button"
              onClick={() => setNeedsDelivery(!needsDelivery)}
              style={{
                ...toggleSwitch,
                background: needsDelivery ? '#1d4ed8' : '#cbd5e1',
              }}
              aria-pressed={needsDelivery}
            >
              <span
                style={{
                  ...toggleKnob,
                  left: needsDelivery ? '23px' : '3px',
                }}
              />
            </button>
          </label>
        </div>

        {needsDelivery && (
          <>
            <div>
              <label style={labelStyle}>Address Line 1</label>
              <input
                value={address1}
                onChange={(e) => setAddress1(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Address Line 2</label>
              <input
                value={address2}
                onChange={(e) => setAddress2(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Postcode</label>
              <input
                value={postcode}
                onChange={(e) => handlePostcodeChange(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>District</label>
              <input
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>State</label>
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
            </div>
          </>
        )}
      </div>

      <div style={totalRow}>
        <span>Total</span>
        <strong>RM {total.toFixed(2)}</strong>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        style={{
          ...buttonStyle,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing payment...' : 'Proceed to Payment'}
      </button>
    </div>
  )
}

const wrapper = {
  maxWidth: '520px',
  margin: '0 auto',
  width: '100%',
} as const

const deliveryNoticeBox = {
  padding: '12px',
  border: '1px solid #dbeafe',
  borderRadius: '12px',
  background: '#f8fbff',
  marginBottom: '14px',
} as const

const deliveryNoticeTitle = {
  fontSize: '13px',
  fontWeight: 800,
  color: '#1d4ed8',
  marginBottom: '6px',
} as const

const deliveryNoticeText = {
  fontSize: '14px',
  color: '#0f172a',
  lineHeight: 1.6,
} as const

const deliveryNoticeMeta = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: 1.6,
  marginTop: '6px',
} as const

const formGrid = {
  display: 'grid',
  gap: '14px',
  marginBottom: '14px',
} as const

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 700,
  color: '#0f172a',
} as const

const inputStyle = {
  width: '100%',
  padding: '13px',
  borderRadius: '12px',
  border: '1px solid #dbe2ea',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
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
  gap: '12px',
} as const

const toggleTitle = {
  display: 'block',
  color: '#0f172a',
} as const

const toggleSubtext = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '4px',
} as const

const toggleSwitch = {
  width: '48px',
  height: '28px',
  borderRadius: '999px',
  position: 'relative' as const,
  border: 'none',
  cursor: 'pointer',
  flexShrink: 0,
} as const

const toggleKnob = {
  position: 'absolute' as const,
  top: '3px',
  width: '22px',
  height: '22px',
  borderRadius: '999px',
  background: '#fff',
  transition: 'left 0.2s ease',
} as const

const totalRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '12px',
  paddingTop: '10px',
  borderTop: '1px solid #e2e8f0',
  color: '#0f172a',
  fontSize: '15px',
} as const

const buttonStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 800,
  border: 'none',
} as const
