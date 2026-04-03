'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products', href: '/dashboard/products' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Settings', href: '/dashboard/settings' },
]

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/dashboard" className="shrink-0">
            <div className="text-2xl font-extrabold leading-none">
              <span className="text-pink-500">Bayar</span>
              <span className="text-blue-600">Link</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Mudah Jual. Mudah Bayar
            </div>
          </Link>

          <nav className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto md:flex-wrap md:justify-end">
            {navItems.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'inline-flex items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-semibold transition',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
