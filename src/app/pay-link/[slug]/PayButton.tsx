export default function PayButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    try {
      setLoading(true)

      const res = await fetch(`/api/payments/bayarcash/create?slug=${slug}`)
      const data = await res.json()

      if (data.ok && data.raw_response) {
        const parsed = JSON.parse(data.raw_response)

        if (parsed.url) {
          window.location.href = parsed.url
          return
        }
      }

      alert('Unable to start payment. Please try again.')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }
