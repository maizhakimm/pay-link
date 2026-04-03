'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)

  async function handleAuth() {
    if (!email || !password) {
      alert('Please fill all fields')
      return
    }

    setLoading(true)

    if (isLogin) {
      // LOGIN
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      window.location.href = '/dashboard'
    } else {
      // SIGN UP
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }

      alert('Account created! Please login.')
      setIsLogin(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-sm border">

        {/* LOGO */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold">
            <span className="text-pink-500">Bayar</span>
            <span className="text-blue-600">Link</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mudah Jual. Mudah Bayar.
          </p>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold mb-4 text-center">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {/* FORM */}
        <div className="space-y-3">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-slate-400"
          />

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </div>

        {/* SWITCH */}
        <div className="text-center mt-4 text-sm">
          {isLogin ? (
            <>
              No account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="text-blue-600 font-semibold"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="text-blue-600 font-semibold"
              >
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
