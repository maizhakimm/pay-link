'use client'

import Link from 'next/link'
import MarketplaceSubnav from './components/MarketplaceSubnav'

const modules = [
  {
    href: '/admin/marketplace/sellers',
    title: 'Marketplace Sellers',
    description: 'Review marketplace profile publication and verification status.',
  },
  {
    href: '/admin/marketplace/categories',
    title: 'Marketplace Categories',
    description: 'View master categories for marketplace classification.',
  },
  {
    href: '/admin/marketplace/areas',
    title: 'Marketplace Areas',
    description: 'View official areas and mapped communities coverage.',
  },
  {
    href: '/admin/marketplace/featured',
    title: 'Featured Products',
    description: 'Inspect featured, trending, preorder, sponsored and admin picks.',
  },
  {
    href: '/admin/marketplace/homepage',
    title: 'Homepage Sections',
    description: 'Review marketplace homepage section configuration state.',
  },
]

export default function AdminMarketplacePage() {
  return (
    <div className="space-y-6">
      <MarketplaceSubnav />
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Marketplace Admin
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Internal marketplace module (Phase 2A). View-only skeleton pages for admin operations.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
          >
            <h3 className="text-lg font-bold text-slate-900">{module.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{module.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
