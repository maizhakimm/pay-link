import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BazarLink',
}

export default function BazarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
