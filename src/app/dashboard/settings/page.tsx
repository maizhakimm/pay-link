'use client'

import Layout from '../../../components/Layout'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueShopSlug(base: string, currentSellerId?: string | null) {
  const cleanBase = slugify(base || 'shop')
  let candidate = cleanBase || 'shop'
  let counter = 1

  while (true) {
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('id')
      .eq('shop_slug', candidate)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    if (currentSellerId && data.id === currentSellerId) {
      return candidate
    }

    counter += 1
    candidate = `${cleanBase}-${counter}`
  }
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [sellerId, setSellerId] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')

  const [storeName, setStoreName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')

  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const [profileImage, setProfileImage] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const previewSlug = useMemo(() => {
    return slugify(storeName || 'your-shop')
  }, [storeName])

  const previewBaseUrl =
    (process.env.NEXT_PUBLIC_APP_URL || 'https://www.bayarlink.my').replace(/\/$/, '')

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    setAccountEmail(user.email || '')

    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    if (data) {
      setSellerId(data.id)
      setStoreName(data.store_name || '')
      setShopSlug(data.shop_slug || '')
      setEmail(data.email || '')
      setWhatsapp(data.whatsapp || '')
      setCompanyName(data.company_name || '')
      setCompanyReg(data.company_registration || '')
      setBusinessAddress(data.business_address || '')

      setBankName(data.bank_name || '')
      setAccountNumber(data.account_number || '')
      setAccountHolderName(data.account_holder_name || '')

      setProfileImage(data.profile_image || '')

      // Auto create slug only once if missing
      if (!data.shop_slug && data.store_name) {
        try {
          const newSlug = await generateUniqueShopSlug(data.store_name, data.id)

          const { error: slugError } = await supabase
            .from('seller_profiles')
            .update({ shop_slug: newSlug })
            .eq('id', data.id)

          if (!slugError) {
            setShopSlug(newSlug)
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to generate shop slug'
          alert(message)
        }
      }
    }

    setLoading(false)
  }

  async function uploadImage(file: File) {
    if (!sellerId) return

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `seller-${sellerId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      alert(error.message)
      return
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    setProfileImage(data.publicUrl)
  }

  async function handleSave() {
    if (!sellerId) return

    if (!storeName.trim()) {
      alert('Store Name is required')
      return
    }

    setSaving(true)

    let finalShopSlug = shopSlug

    try {
      // Generate slug only if seller still doesn't have one
      if (!finalShopSlug) {
        finalShopSlug = await generateUniqueShopSlug(storeName, sellerId)
      }

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: storeName,
          email,
          whatsapp,
          company_name: companyName || null,
          company_registration: companyReg || null,
          business_address: businessAddress || null,
          bank_name: bankName,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          profile_image: profileImage,
          shop_slug: finalShopSlug,
        })
        .eq('id', sellerId)

      setSaving(false)

      if (error) {
        alert(error.message)
      } else {
        setShopSlug(finalShopSlug)
        alert('Settings updated successfully!')
      }
    } catch (err) {
      setSaving(false)
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      alert(message)
    }
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      alert('Please fill in new password and confirm password.')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('Password confirmation does not match.')
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      alert(error.message)
      return
    }

    setNewPassword('')
    setConfirmPassword('')
    alert('Password updated successfully!')
  }

  async function handleLogout() {
    const confirmed = window.confirm('Log out from your account?')
    if (!confirmed) return

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    window.location.href = '/login'
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Manage your store, payout details, and account settings.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.85fr]">
          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Seller Profile</h2>

              <div className="mb-5">
                <p className="mb-2 text-sm font-bold text-slate-700">Profile Image</p>

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Seller profile"
                    className="mb-3 h-20 w-20 rounded-full object-cover"
                  />
                ) : null}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadImage(e.target.files[0])
                    }
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Basic Info</p>

                  <div className="grid gap-3">
                    <div>
                      <input
                        placeholder="Store Name"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                      />

                      <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Shop URL {shopSlug ? 'Locked' : 'Preview'}
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-slate-900">
                          {previewBaseUrl}/s/{shopSlug || previewSlug}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {shopSlug
                            ? 'Your public shop URL is already locked for link stability.'
                            : 'Your store name will influence your shop URL when it is created for the first time.'}
                        </p>
                      </div>
                    </div>

                    <input
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="WhatsApp Number"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-slate-900">Company Info</p>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      Optional
                    </span>
                  </div>

                  <div className="grid gap-3">
                    <input
                      placeholder="Company Name (Optional)"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Company Registration No (Optional)"
                      value={companyReg}
                      onChange={(e) => setCompanyReg(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <textarea
                      placeholder="Business Address (Optional)"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Payout Details</p>

                  <div className="grid gap-3">
                    <input
                      placeholder="Bank Name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Account Number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Account Holder Name"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Account</h2>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-700">Login Email</p>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {accountEmail || '-'}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-extrabold text-slate-900">Change Password</p>

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />

                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-50"
                >
                  Update Password
                </button>

                <p className="text-xs text-slate-500">
                  Gunakan password sekurang-kurangnya 6 aksara.
                </p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Session</h2>

              <p className="mb-4 text-sm leading-6 text-slate-500">
                Log out jika anda ingin keluar dari akaun seller ini.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-rose-100"
              >
                Log Out
              </button>
            </section>
          </div>
        </div>
      )}
    </Layout>
  )
}
