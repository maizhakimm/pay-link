import { headers } from 'next/headers'
import LandingPageClient from './LandingPageClient'
import BazarPage from './bazar/page'

export default async function RootPage() {
  const h = await headers()
  const host = (h.get('x-forwarded-host') || h.get('host') || '').toLowerCase()
  const cleanHost = host.split(':')[0]

  if (cleanHost === 'bazarlink.my' || cleanHost === 'www.bazarlink.my') {
    return <BazarPage />
  }

  return <LandingPageClient />
}
