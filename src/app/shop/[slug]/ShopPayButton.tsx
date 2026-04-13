'use client'

import { useEffect, useMemo, useState } from 'react'

type CartItem = {
  product_id: string
  quantity: number
}

type DeliveryMode =
  | 'free_delivery'
  | 'fixed_fee'
  | 'included_in_price'
  | 'pay_rider_separately'
  | 'distance_based'

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

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180

  const earthRadiusKm = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

async function geocodeAddress(address: string) {
  const response = await fetch('/api/maps/geocode', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ address }),
  })

  const data = await response.json()

  if (!response.ok || !data.ok) {
    throw new Error(
      data.error || 'Alamat tidak dapat dikenal pasti. Sila semak semula alamat.'
    )
  }

  return {
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
    formattedAddress: String(data.formatted_address || address),
  }
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
  deliveryRadiusKm = 0,
  deliveryRatePerKm = 0,
  deliveryMinFee = 0,
  pickupAddress = '',
  sellerLatitude = null,
  sellerLongitude = null,
}: {
  sellerId: string
  shopSlug: string
  items: CartItem[]
  total: number
  deliveryMode?: DeliveryMode
  deliveryFee?: number
  deliveryArea?: string
  deliveryNote?: string
  deliveryRadiusKm?: number
  deliveryRatePerKm?: number
  deliveryMinFee?: number
  pickupAddress?: string
  sellerLatitude?: number | null
  sellerLongitude?: number | null
}) {
  const [loading, setLoading] = useState(false)
  const [calculatingDelivery, setCalculatingDelivery] = useState(false)

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

  const [calculatedDeliveryFee, setCalculatedDeliveryFee] = useState<number | null>(
    null
  )
  const [calculatedDistanceKm, setCalculatedDistanceKm] = useState<number | null>(
    null
  )
  const [resolvedCustomerAddress, setResolvedCustomerAddress] = useState('')
  const [deliveryError, setDeliveryError] = useState('')

  const fullDeliveryAddress = useMemo(() => {
    return [
      address1.trim(),
      address2.trim(),
      postcode.trim(),
      city.trim(),
      district.trim(),
      state.trim(),
      'Malaysia',
    ]
      .filter(Boolean)
      .join(', ')
  }, [address1, address2, postcode, city, district, state])

  useEffect(() => {
    setCalculatedDeliveryFee(null)
    setCalculatedDistanceKm(null)
    setResolvedCustomerAddress('')
    setDeliveryError('')
  }, [address1, address2, postcode, city, district, state, needsDelivery, deliveryMode])

  const deliverySummary = useMemo(() => {
    switch (deliveryMode) {
      case 'free_delivery':
        return 'Free delivery tersedia untuk kawasan terpilih.'
      case 'fixed_fee':
        return Number(deliveryFee || 0) > 0
          ? `Delivery fee sebanyak ${formatCurrency(
              deliveryFee
            )} akan dikenakan jika anda pilih delivery.`
          : 'Delivery fee akan dikenakan jika anda pilih delivery.'
      case 'included_in_price':
        return 'Harga produk telah termasuk delivery.'
      case 'distance_based':
        return `Caj delivery dikira ikut jarak. Kadar ${formatCurrency(
          deliveryRatePerKm
        )}/km, minimum ${formatCurrency(deliveryMinFee)}, radius maksimum ${
          Number(deliveryRadiusKm || 0) || 0
        }km.`
      case 'pay_rider_separately':
      default:
        return 'Bayaran delivery dibuat berasingan terus kepada rider / seller.'
    }
  }, [deliveryMode, deliveryFee, deliveryRatePerKm, deliveryMinFee, deliveryRadiusKm])

  const appliedDeliveryFee = useMemo(() => {
    if (!needsDelivery) return 0

    if (deliveryMode === 'fixed_fee') {
      const parsed = Number(deliveryFee || 0)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    }

    if (deliveryMode === 'distance_based') {
      return Number.isFinite(Number(calculatedDeliveryFee))
        ? Number(calculatedDeliveryFee || 0)
        : 0
    }

    return 0
  }, [needsDelivery, deliveryMode, deliveryFee, calculatedDeliveryFee])

  const payableTotal = useMemo(() => {
    return Number(total || 0) + appliedDeliveryFee
  }, [total, appliedDeliveryFee])

  function handlePhoneChange(value: string) {
    let cleaned = value.replace(/[^\d+]/g, '')
    if (!cleaned.startsWith('+60')) cleaned = '+60'
    setPhone(cleaned)
  }

  function handlePostcodeChange(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 5)
    setPostcode(cleaned)
  }

  async function handleCalculateDelivery() {
    if (!needsDelivery) {
      setCalculatedDeliveryFee(0)
      setCalculatedDistanceKm(0)
      setResolvedCustomerAddress('')
      setDeliveryError('')
      return
    }

    if (deliveryMode !== 'distance_based') {
      return
    }

    if (
      !address1.trim() ||
      !postcode.trim() ||
      !city.trim() ||
      !district.trim() ||
      !state.trim()
    ) {
      alert('Sila lengkapkan maklumat penghantaran untuk kira caj delivery.')
      return
    }

    if (
      !Number.isFinite(Number(sellerLatitude)) ||
      !Number.isFinite(Number(sellerLongitude))
    ) {
      alert('Lokasi seller belum lengkap. Sila update pickup address di Settings.')
      return
    }

    try {
      setCalculatingDelivery(true)
      setDeliveryError('')

      const customer = await geocodeAddress(fullDeliveryAddress)

      const distance = calculateDistanceKm(
        Number(sellerLatitude),
        Number(sellerLongitude),
        customer.latitude,
        customer.longitude
      )

      const roundedDistance = roundMoney(distance)
      const maxRadius = Number(deliveryRadiusKm || 0)
      const minFee = Number(deliveryMinFee || 0)
      const ratePerKm = Number(deliveryRatePerKm || 0)

      if (!Number.isFinite(maxRadius) || maxRadius <= 0) {
        throw new Error('Radius penghantaran seller belum ditetapkan dengan betul.')
      }

      if (roundedDistance > maxRadius) {
        throw new Error(
          `Maaf, lokasi anda di luar kawasan penghantaran seller ini. Jarak semasa ${roundedDistance.toFixed(
            2
          )}km, maksimum ${maxRadius.toFixed(2)}km.`
        )
      }

      const fee = Math.max(minFee, roundedDistance * ratePerKm)

      setCalculatedDistanceKm(roundedDistance)
      setCalculatedDeliveryFee(roundMoney(fee))
      setResolvedCustomerAddress(customer.formattedAddress)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to calculate delivery fee'
      setCalculatedDeliveryFee(null)
      setCalculatedDistanceKm(null)
      setResolvedCustomerAddress('')
      setDeliveryError(message)
      alert(message)
    } finally {
      setCalculatingDelivery(false)
    }
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

      if (deliveryMode === 'distance_based') {
        if (
          !Number.isFinite(Number(calculatedDeliveryFee)) ||
          !Number.isFinite(Number(calculatedDistanceKm))
        ) {
          await handleCalculateDelivery()

          if (
            !Number.isFinite(Number(calculatedDeliveryFee)) ||
            !Number.isFinite(Number(calculatedDistanceKm))
          ) {
            return
          }
        }
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
          subtotal: Number(total || 0),
          deliveryMode,
          deliveryFee: appliedDeliveryFee,
          deliveryRequired: needsDelivery,
          totalAmount: payableTotal,
          deliveryArea: deliveryArea || null,
          deliveryNote: deliveryNote || null,
          delivery: needsDelivery
            ? {
                address1: address1.trim(),
                address2: address2.trim(),
                postcode: postcode.trim(),
                city: city.trim(),
                district: district.trim(),
                state: state.trim(),
                distance_km:
                  deliveryMode === 'distance_based' ? calculatedDistanceKm : null,
                resolved_address:
                  deliveryMode === 'distance_based'
                    ? resolvedCustomerAddress || fullDeliveryAddress
                    : null,
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

        {deliveryMode === 'distance_based' && pickupAddress ? (
          <div style={deliveryNoticeMeta}>Pickup seller: {pickupAddress}</div>
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

            {deliveryMode === 'distance_based' ? (
              <div style={distanceBox}>
                <button
                  type="button"
                  onClick={handleCalculateDelivery}
                  disabled={calculatingDelivery}
                  style={{
                    ...secondaryButton,
                    opacity: calculatingDelivery ? 0.7 : 1,
                    cursor: calculatingDelivery ? 'not-allowed' : 'pointer',
                  }}
                >
                  {calculatingDelivery ? 'Calculating...' : 'Calculate Delivery'}
                </button>

                {Number.isFinite(Number(calculatedDistanceKm)) &&
                Number.isFinite(Number(calculatedDeliveryFee)) ? (
                  <div style={distanceResult}>
                    <div>
                      Distance: <strong>{Number(calculatedDistanceKm).toFixed(2)} km</strong>
                    </div>
                    <div>
                      Delivery fee:{' '}
                      <strong>{formatCurrency(Number(calculatedDeliveryFee))}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={distanceHint}>
                    Sila kira caj delivery selepas alamat lengkap diisi.
                  </div>
                )}

                {resolvedCustomerAddress ? (
                  <div style={resolvedAddressBox}>
                    <div style={resolvedAddressTitle}>Resolved delivery address</div>
                    <div style={resolvedAddressText}>{resolvedCustomerAddress}</div>
                  </div>
                ) : null}

                {deliveryError ? (
                  <div style={errorBox}>{deliveryError}</div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div style={totalsBox}>
        <div style={totalLine}>
          <span>Subtotal</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <div style={totalLine}>
          <span>Delivery</span>
          <strong>{formatCurrency(appliedDeliveryFee)}</strong>
        </div>

        <div style={grandTotalLine}>
          <span>Total</span>
          <strong>{formatCurrency(payableTotal)}</strong>
        </div>
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

const distanceBox = {
  padding: '12px',
  border: '1px solid #dbeafe',
  borderRadius: '12px',
  background: '#f8fbff',
  display: 'grid',
  gap: '10px',
} as const

const secondaryButton = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  fontWeight: 700,
} as const

const distanceHint = {
  fontSize: '12px',
  color: '#64748b',
} as const

const distanceResult = {
  fontSize: '13px',
  color: '#0f172a',
  lineHeight: 1.7,
} as const

const resolvedAddressBox = {
  padding: '10px 12px',
  border: '1px solid #bbf7d0',
  background: '#f0fdf4',
  borderRadius: '12px',
} as const

const resolvedAddressTitle = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#15803d',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.04em',
  marginBottom: '4px',
} as const

const resolvedAddressText = {
  fontSize: '13px',
  color: '#166534',
  lineHeight: 1.5,
} as const

const errorBox = {
  padding: '10px 12px',
  border: '1px solid #fecaca',
  background: '#fef2f2',
  borderRadius: '12px',
  fontSize: '12px',
  color: '#b91c1c',
  lineHeight: 1.5,
} as const

const totalsBox = {
  marginBottom: '12px',
  paddingTop: '10px',
  borderTop: '1px solid #e2e8f0',
  display: 'grid',
  gap: '8px',
} as const

const totalLine = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  fontSize: '14px',
  color: '#334155',
} as const

const grandTotalLine = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  fontSize: '16px',
  fontWeight: 800,
  color: '#0f172a',
  paddingTop: '6px',
  borderTop: '1px dashed #e2e8f0',
} as const

const buttonStyle = {
  width: '100%',
  border: 'none',
  borderRadius: '14px',
  padding: '14px 16px',
  background: '#0f172a',
  color: '#fff',
  fontSize: '15px',
  fontWeight: 800,
} as const
