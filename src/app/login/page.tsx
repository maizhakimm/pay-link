'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  function resetMessages() {
    setErrorMsg('')
    setSuccessMsg('')
  }

  function switchMode(loginMode: boolean) {
    setIsLogin(loginMode)
    setPassword('')
    setConfirmPassword('')
    resetMessages()
  }

  function validateForm() {
    resetMessages()

    if (!email || !password) {
      setErrorMsg('Please fill all fields.')
      return false
    }

    if (!email.includes('@')) {
      setErrorMsg('Invalid email.')
      return false
    }

    if (!isLogin) {
      if (password.length < 6) {
        setErrorMsg('Password min 6 characters.')
        return false
      }

      if (password !== confirmPassword) {
        setErrorMsg('Password not match.')
        return false
      }
    }

    return true
  }

  async function handleAuth() {
    if (!validateForm()) return

    setLoading(true)
    resetMessages()

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          setErrorMsg(error.message)
          return
        }

        router.replace('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })

        if (error) {
          setErrorMsg(error.message)
          return
        }

        setSuccessMsg('Check your email to verify your account.')
        setIsLogin(true)
      }
    } catch {
      setErrorMsg('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow border">

        {/* LOGO */}
        <div className="text-center mb-6">
          <Image
            src="/BayarLink-Logo-01.svg"
            alt="BayarLink"
            width={150}
            height={40}
            className="mx-auto"
          />
          <p className="text-xs text-slate-400 mt-2">🚀 Beta Version</p>
        </div>

        <h2 className="text-xl font-bold text-center mb-4">
          {isLogin ? 'Sign In' : 'Create Account'}
        </h2>

        {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
        {successMsg && <p className="text-green-600 text-sm mb-2">{successMsg}</p>}

        <div className="space-y-3">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
          />

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-xl px-4 py-3"
            />
          )}

          <button
            onClick={handleAuth}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </div>

        <div className="text-center mt-4 text-sm">
          {isLogin ? (
            <>
              No account?{' '}
              <button onClick={() => switchMode(false)} className="text-blue-600">
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have account?{' '}
              <button onClick={() => switchMode(true)} className="text-blue-600">
                Login
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
