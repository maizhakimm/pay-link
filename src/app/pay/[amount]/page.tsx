export default function PayPage({ params }: { params: { amount: string } }) {
  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Payment Page</h1>

      <h2>Amount: RM {params.amount}</h2>

      <button
        style={{
          padding: '12px 24px',
          backgroundColor: 'black',
          color: 'white',
          marginTop: '20px'
        }}
      >
        Pay Now
      </button>
    </main>
  )
}
