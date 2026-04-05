'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [isLogin, setIsLogin] = useState(true)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const pageTitle = useMemo(() => {
    return isLogin ? 'Sign in ke BayarLink' : 'Cipta akaun BayarLink'
  }, [isLogin])

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
      setErrorMsg('Please fill in all required fields.')
      return false
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email.')
      return false
    }

    if (!isLogin) {
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.')
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
          setLoading(false)
          return
        }

        router.replace('/dashboard')
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      setSuccessMsg(
        'Account created! Please check your email to verify your account before login.'
      )

      setIsLogin(true)
    } catch (err) {
      setErrorMsg('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4">

        <div className="grid w-full rounded-3xl border bg-white shadow-lg lg:grid-cols-2 overflow-hidden">

          {/* LEFT */}
          <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-8">

            <div>
              {/* Beta badge */}
              <span className="inline-block text-xs bg-white/10 px-3 py-1 rounded-full mb-4">
                🚀 Beta Version
              </span>

              <Image
                src="/BayarLink-Logo-01.svg"
                alt="BayarLink"
                width={160}
                height={40}
              />

              <h1 className="mt-6 text-2xl font-semibold leading-snug">
                Jual lebih tersusun. Terima bayaran dengan mudah.
              </h1>

              <p className="mt-3 text-sm text-slate-300">
                Sistem mudah untuk urus produk, order dan pembayaran dalam satu tempat.
              </p>
            </div>

            <div className="space-y-3">
              <Feature text="Satu link untuk jualan" />
              <Feature text="Track order dengan jelas" />
              <Feature text="Mobile friendly" />
            </div>
          </div>

          {/* RIGHT */}
          <div className="p-6 flex items-center justify-center">
            <div className="w-full max-w-md">

              {/* Mobile logo */}
              <div className="lg:hidden text-center mb-6">
                <Image
                  src="/BayarLink-Logo-01.svg"
                  alt="BayarLink"
                  width={150}
                  height={40}
                />
                <p className="text-xs text-slate-400 mt-2">🚀 Beta Version</p>
              </div>

              <h2 className="text-xl font-bold text-center mb-4">
                {isLogin ? 'Sign In' : 'Create Account'}
              </h2>

              {errorMsg && (
                <div className="mb-3 text-sm text-red-500">{errorMsg}</div>
              )}

              {successMsg && (
                <div className="mb-3 text-sm text-green-600">{successMsg}</div>
              )}

              <div className="space-y-3">

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3"
                />

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-xl px-4 py-3"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

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

        </div>
      </div>
    </div>
  )
}

function Feature({ text }: { text: string }) {
  return (
    <div className="text-sm text-slate-300 flex items-center gap-2">
      <span>✓</span> {text}
    </div>
  )
}
