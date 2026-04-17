'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabase'

export default function AdminPayoutPage() {
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let mounted = true

    async function checkAccess() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user

        if (!user) {
          if (mounted) {
            setAuthorized(false)
            setChecking(false)
            window.location.href = '/admin/login'
          }
          return
        }

        const { data: roleRow, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error || !roleRow || roleRow.role !== 'admin') {
          await supabase.auth.signOut()

          if (mounted) {
            setAuthorized(false)
            setChecking(false)
            window.location.href = '/admin/login'
          }
          return
        }

        if (mounted) {
          setAuthorized(true)
          setChecking(false)
        }
      } catch (error) {
        console.error('Admin access check failed:', error)

        if (mounted) {
          setAuthorized(false)
          setChecking(false)
          window.location.href = '/admin/login'
        }
      }
    }

    checkAccess()

    return () => {
      mounted = false
    }
  }, [])

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading admin panel...</p>
      </main>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Payout</h1>
        <p className="mt-2 text-sm text-slate-600">
          Admin payout page content here.
        </p>
      </div>
    </main>
  )
}
