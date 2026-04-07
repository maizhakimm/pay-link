import { Suspense } from 'react'
import PaymentReturnClient from './PaymentReturnClient'

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
      <PaymentReturnClient />
    </Suspense>
  )
}
