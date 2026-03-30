export default function PayPage({ params }: { params: { amount: string } }) {
  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Payment Page</h1>

      <h2>Amount: RM {params.amount}</h2>

     <a
  href={`https://wa.me/60163352087?text=Hi, I want to pay RM ${params.amount}`}
  target="_blank"
>
  <button
    style={{
      padding: '12px 24px',
      backgroundColor: 'green',
      color: 'white',
      marginTop: '20px'
    }}
  >
    Pay via WhatsApp
  </button>
</a>
    </main>
  )
}
