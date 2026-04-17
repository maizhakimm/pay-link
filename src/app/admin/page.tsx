'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    async function checkExistingAdminSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCheckingSession(false)
        return
      }

      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

      if (roleRow?.role === 'admin') {
        window.location.href = '/admin/dashboard'
        return
      }

      await supabase.auth.signOut()
      setCheckingSession(false)
    }

    checkExistingAdminSession()
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const user = data.user

    const { data: roleRow, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (roleError) {
      alert(roleError.message)
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (!roleRow || roleRow.role !== 'admin') {
      alert('Akses ditolak. Akaun ini bukan admin.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    window.location.href = '/admin/dashboard'
  }

  if (checkingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Checking admin session...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <img
            src="/BayarLink-Logo-Shop-Page.svg"
            alt="BayarLink"
            className="mx-auto mb-4 h-8 w-auto"
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Log masuk untuk akses panel pentadbiran BayarLink.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@bayarlink.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>
      </div>
    </main>
  )
}
