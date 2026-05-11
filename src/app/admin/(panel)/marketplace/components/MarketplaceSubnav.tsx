'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin/marketplace', label: 'Overview' },
  { href: '/admin/marketplace/sellers', label: 'Sellers' },
  { href: '/admin/marketplace/categories', label: 'Categories' },
  { href: '/admin/marketplace/areas', label: 'Areas' },
  { href: '/admin/marketplace/featured', label: 'Featured' },
  { href: '/admin/marketplace/homepage', label: 'Homepage' },
]

export default function MarketplaceSubnav() {
  const pathname = usePathname()

  return (
    <nav className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <ul className="flex min-w-max items-center gap-2">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
