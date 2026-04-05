'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

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

  const pageSubtitle = useMemo(() => {
    return isLogin
      ? 'Masuk dan urus order, produk, dan link pembayaran anda dengan mudah.'
      : 'Daftar akaun baru dan mula jual dengan lebih tersusun.'
  }, [isLogin])

  function resetMessages() {
    setErrorMsg('')
    setSuccessMsg('')
  }

  function validateForm() {
    resetMessages()

    if (!email || !password) {
      setErrorMsg('Please fill in all required fields.')
      return false
    }

    const trimmedEmail = email.trim()

    if (!trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
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
          setLoading(false)
          return
        }

        router.replace('/dashboard')
        return
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }

      setSuccessMsg('Account created successfully. Please sign in to continue.')
      setIsLogin(true)
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setErrorMsg('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(loginMode: boolean) {
    setIsLogin(loginMode)
    setPassword('')
    setConfirmPassword('')
    resetMessages()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)] lg:grid-cols-2">
          
          {/* LEFT SIDE */}
          <div className="relative hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                BayarLink Seller Portal
              </div>

              <div className="mt-6">
                <Image
                  src="/BayarLink%20Logo%2001.svg"
                  alt="BayarLink Logo"
                  width={180}
                  height={48}
                  className="h-auto w-auto"
                  priority
                />
              </div>

              <h1 className="mt-8 max-w-md text-3xl font-bold leading-tight xl:text-4xl">
                Jual lebih tersusun. Terima bayaran dengan lebih mudah.
              </h1>

              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300 xl:text-base">
                BayarLink membantu seller urus produk, order, dan pembayaran dalam satu tempat yang ringkas dan mesra mobile.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Satu link untuk jualan anda</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Mudah kongsi kepada customer melalui WhatsApp, TikTok, atau media sosial.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Pantau order dengan lebih jelas</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Seller boleh semak status order, bayaran, dan prestasi jualan dengan lebih teratur.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Mobile friendly</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Direka supaya senang digunakan di telefon, sesuai untuk seller yang urus bisnes on the go.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10">
            <div className="w-full max-w-md">
              
              {/* MOBILE LOGO */}
              <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                <Image
                  src="/BayarLink%20Logo%2001.svg"
                  alt="BayarLink Logo"
                  width={170}
                  height={44}
                  className="h-auto w-auto"
                  priority
                />
                <p className="mt-3 text-sm text-slate-500">Mudah Jual. Mudah Bayar.</p>
              </div>

              {/* SWITCH */}
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

              {/* TITLE */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {pageTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {pageSubtitle}
                </p>
              </div>

              {/* ALERT */}
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

              {/* FORM */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAuth}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* FOOTNOTE */}
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
