'use client'

import { useState } from 'react'

type Props = {
  productSlug: string
  shopSlug: string
}

export default function PayButton({ productSlug, shopSlug }: Props) {
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    setLoading(true)

    const res = await fetch(
      `/api/payments/bayarcash/create?productSlug=${productSlug}&shopSlug=${shopSlug}`
    )

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    }

    setLoading(false)
  }

  return (
    <button onClick={handlePay} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  )
}
