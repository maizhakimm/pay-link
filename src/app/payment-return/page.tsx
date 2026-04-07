import PaymentReturnClient from './PaymentReturnClient'

type ResolvedSearchParams = {
  status?: string
  status_description?: string
  order_number?: string
  amount?: string
  payer_name?: string
  shop?: string
  payment_intent_id?: string
  payment_intent?: string
}

type PaymentReturnPageProps = {
  searchParams: Promise<ResolvedSearchParams>
}

export default async function PaymentReturnPage({
  searchParams,
}: PaymentReturnPageProps) {
  const resolvedSearchParams = await searchParams

  return <PaymentReturnClient searchParams={resolvedSearchParams} />
}
