'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type AdminUser = {
  email: string
}

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [checking, setChecking] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    async function guardAdminPanel() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/admin'
        return
      }

      const { data: roleRow, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error || !roleRow || roleRow.role !== 'admin') {
        await supabase.auth.signOut()
        window.location.href = '/admin'
        return
      }

      setAdminUser({
        email: user.email || '',
      })
      setChecking(false)
    }

    guardAdminPanel()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/payout', label: 'Payout' },
    { href: '/admin/reports', label: 'Reports' },
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/sellers', label: 'Sellers' },
  ]

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Loading admin panel...</p>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-200 px-6 py-5">
            <img
              src="/BayarLink-Logo-Shop-Page.svg"
              alt="BayarLink"
              className="h-8 w-auto"
            />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin Panel
            </p>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-slate-200 px-4 py-4">
            <p className="mb-3 break-all text-xs text-slate-500">
              {adminUser?.email || 'Admin'}
            </p>

            <button
              onClick={handleLogout}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  BayarLink Admin
                </h1>
                <p className="text-sm text-slate-500">
                  Platform management and reporting
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
              >
                Logout
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
