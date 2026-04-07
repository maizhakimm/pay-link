import PaymentReturnClient from './PaymentReturnClient'

type PaymentReturnPageProps = {
  searchParams: {
    status?: string
    status_description?: string
    order_number?: string
    amount?: string
    payer_name?: string
    shop?: string
    payment_intent_id?: string
    payment_intent?: string
  }
}

export default function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  return <PaymentReturnClient searchParams={searchParams} />
}
