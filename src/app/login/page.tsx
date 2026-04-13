'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
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

  const pageTitle = useMemo(() => {
    return isLogin ? 'Sign in ke BayarLink' : 'Cipta akaun BayarLink'
  }, [isLogin])

  const pageSubtitle = useMemo(() => {
    return isLogin
      ? 'Masuk dan urus produk, order, dan pembayaran anda dengan lebih mudah.'
      : 'Daftar akaun baru dan mula guna BayarLink untuk jualan yang lebih tersusun.'
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

    const trimmedEmail = email.trim()

    if (!trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email.')
      return false
    }

    if (!isLogin) {
      if (!confirmPassword) {
        setErrorMsg('Please confirm your password.')
        return false
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.')
        return false
      }

      if (password !== confirmPassword) {
        setErrorMsg('Password and confirm password do not match.')
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
          email: email.trim(),
          password,
        })

        if (error) {
          setErrorMsg(error.message)
          return
        }

        router.replace('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        })

        if (error) {
          setErrorMsg(error.message)
          return
        }

        setSuccessMsg(
          'Account created! Please check your email to verify your account before login.'
        )
        setIsLogin(true)
        setPassword('')
        setConfirmPassword('')
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          <div className="hidden bg-slate-900 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                BayarLink Seller Portal
              </div>

              <div className="mt-3 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                🚀 Beta
              </div>

              <div className="mt-6">
                <Image
                  src="/BayarLink-Logo-Singup-Page.png"
                  alt="BayarLink Logo"
                  width={200}
                  height={130}
                  className="h-auto w-auto"
                  priority
                />
              </div>

              <h1 className="mt-8 max-w-md text-2xl font-bold leading-tight xl:text-3xl">
                Jual lebih tersusun. Terima bayaran dengan lebih mudah.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 xl:text-base">
                BayarLink membantu seller urus produk, order, dan pembayaran dalam satu tempat
                yang ringkas, kemas, dan mesra mobile.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">Satu link untuk jualan anda</p>
                <p className="mt-1 text-sm text-slate-300">
                  Kongsi dengan mudah melalui WhatsApp, TikTok, atau media sosial.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">Pantau order dengan lebih jelas</p>
                <p className="mt-1 text-sm text-slate-300">
                  Semak status order, bayaran, dan prestasi jualan dengan lebih teratur.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">Direka untuk mobile</p>
                <p className="mt-1 text-sm text-slate-300">
                  Sesuai untuk seller yang urus bisnes terus dari telefon.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="w-full max-w-md">
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <Image
                  src="/BayarLink-Logo-Singup-Page.png"
                  alt="BayarLink Logo"
                  width={200}
                  height={130}
                  className="h-auto w-auto"
                  priority
                />
                <div className="mt-3 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  🚀 Beta
                </div>
                <p className="mt-3 text-sm text-slate-500">Mudah Jual. Mudah Bayar.</p>
              </div>

              <div className="mb-6 rounded-2xl bg-slate-100 p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => switchMode(true)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      isLogin
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode(false)}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      !isLogin
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{pageTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{pageSubtitle}</p>
              </div>

              {errorMsg && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMsg}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAuth}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </div>

              <div className="mt-5 text-center text-sm text-slate-500">
                {isLogin ? (
                  <>
                    Belum ada akaun?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(false)}
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Dah ada akaun?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className="font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Dengan meneruskan, anda bersetuju untuk menggunakan platform ini bagi tujuan
                mengurus jualan, order, dan pembayaran secara lebih teratur.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
