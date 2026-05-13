import { redirect } from 'next/navigation'

export default function ExploreServicesPage() {
  redirect('/bazar?tab=services')
}
