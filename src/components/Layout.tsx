'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: 'home' },
  { label: 'Products', href: '/dashboard/products', icon: 'box' },
  { label: 'Orders', href: '/dashboard/orders', icon: 'receipt' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'settings' },
] as const

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (!pathname) return false
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="shrink-0">
            <div className="relative h-8 w-[140px] sm:h-9 sm:w-[160px]">
              <Image
                src="/BayarLink-Logo-Shop-Page-Dashboard.png"
                alt="BayarLink"
                fill
                priority
                className="object-contain object-left"
              />
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
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

      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 sm:px-6 lg:px-8 md:pb-6">
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-2">
          {navItems.map((item) => {
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-semibold transition',
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
              >
                <span className="mb-1 inline-flex h-5 w-5 items-center justify-center">
                  <NavIcon type={item.icon} active={active} />
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

function NavIcon({
  type,
  active,
}: {
  type: 'home' | 'box' | 'receipt' | 'settings'
  active: boolean
}) {
  const className = active ? 'h-5 w-5' : 'h-5 w-5'
  const stroke = active ? 'currentColor' : 'currentColor'

  if (type === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M3 10.5L12 3l9 7.5M5.25 9.75V21h13.5V9.75"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'box') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v18m8-13.5l-8 4.5-8-4.5"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  if (type === 'receipt') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path
          d="M7 3h10a2 2 0 012 2v16l-3-1.5L12 21l-4-1.5L5 21V5a2 2 0 012-2zm2 5h6M9 12h6M9 16h4"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm7.5 2.25l1.5-1.5-1.5-2.598-2.04.33a7.967 7.967 0 00-1.29-.75L15.75 4.5h-3.0l-.42 2.232c-.45.174-.882.42-1.29.75l-2.04-.33L7.5 9.75 9 11.25a7.95 7.95 0 000 1.5L7.5 14.25l1.5 2.598 2.04-.33c.408.33.84.576 1.29.75l.42 2.232h3l.42-2.232c.45-.174.882-.42 1.29-.75l2.04.33 1.5-2.598-1.5-1.5c.048-.246.072-.498.072-.75s-.024-.504-.072-.75z"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
