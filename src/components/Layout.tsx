'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

type LayoutProps = {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="shrink-0">
            <div className="text-xl font-extrabold leading-none">
              <span className="text-pink-500">Bayar</span>
              <span className="text-blue-600">Link</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-500">
              Mudah Jual. Mudah Bayar
            </div>
          </Link>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/dashboard"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Products
            </Link>
            <Link
              href="/dashboard/orders"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Orders
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
