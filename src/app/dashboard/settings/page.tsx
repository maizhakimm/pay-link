'use client'

import Layout from '../../../components/Layout'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

const MALAYSIAN_BANKS = [
  'Affin Bank',
  'Agrobank',
  'Alliance Bank',
  'AmBank',
  'Bank Islam',
  'Bank Muamalat',
  'Bank Rakyat',
  'BSN',
  'CIMB Bank',
  'Citibank',
  'Hong Leong Bank',
  'HSBC',
  'Kuwait Finance House',
  'Maybank',
  'MBSB Bank',
  'OCBC Bank',
  'Public Bank',
  'RHB Bank',
  'Standard Chartered',
  'UOB Bank',
]

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

type SellerProfileRow = {
  id: string
  user_id: string
  store_name?: string | null
  shop_slug?: string | null
  email?: string | null
  whatsapp?: string | null
  company_name?: string | null
  company_registration?: string | null
  business_address?: string | null
  bank_name?: string | null
  account_number?: string | null
  account_holder_name?: string | null
  profile_image?: string | null
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [sellerId, setSellerId] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [storeName, setStoreName] = useState('')
  const [shopSlug, setShopSlug] = useState('')
  const [slugLocked, setSlugLocked] = useState(false)

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

  async function ensureSellerProfile(currentUserId: string, currentUserEmail: string) {
    const { data: existing, error: existingError } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (existing) {
      return existing as SellerProfileRow
    }

    const initialStoreName =
      currentUserEmail?.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'My Store'

    const { data: inserted, error: insertError } = await supabase
      .from('seller_profiles')
      .insert({
        user_id: currentUserId,
        store_name: initialStoreName,
        email: currentUserEmail || null,
      })
      .select('*')
      .single()

    if (insertError || !inserted) {
      throw new Error(insertError?.message || 'Failed to create seller profile')
    }

    return inserted as SellerProfileRow
  }

  async function loadProfile() {
    setLoading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error(authError.message)
      }

      if (!user) {
        return
      }

      setUserId(user.id)
      setAccountEmail(user.email || '')

      const profile = await ensureSellerProfile(user.id, user.email || '')

      setSellerId(profile.id)
      setStoreName(profile.store_name || '')
      setShopSlug(profile.shop_slug || '')
      setEmail(profile.email || '')
      setWhatsapp(profile.whatsapp || '')
      setCompanyName(profile.company_name || '')
      setCompanyReg(profile.company_registration || '')
      setBusinessAddress(profile.business_address || '')
      setBankName(profile.bank_name || '')
      setAccountNumber(profile.account_number || '')
      setAccountHolderName(profile.account_holder_name || '')
      setProfileImage(profile.profile_image || '')

      // Only lock after a real save state exists:
      // if user already has both store name and slug, we consider it locked.
      if (profile.store_name && profile.shop_slug) {
        setSlugLocked(true)
      } else {
        setSlugLocked(false)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  async function uploadImage(file: File) {
    if (!sellerId) {
      alert('Seller profile not ready yet. Please refresh and try again.')
      return
    }

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
    if (!userId) {
      alert('User session not found. Please log in again.')
      return
    }

    if (!storeName.trim()) {
      alert('Store Name is required')
      return
    }

    setSaving(true)

    try {
      let currentSellerId = sellerId
      let finalShopSlug = shopSlug

      if (!currentSellerId) {
        const profile = await ensureSellerProfile(userId, accountEmail || '')
        currentSellerId = profile.id
        setSellerId(profile.id)

        if (!finalShopSlug) {
          finalShopSlug = profile.shop_slug || ''
        }
      }

      // Generate slug only if still missing
      if (!finalShopSlug) {
        finalShopSlug = await generateUniqueShopSlug(storeName, currentSellerId)
      }

      const { error } = await supabase
        .from('seller_profiles')
        .update({
          store_name: storeName,
          email: email || null,
          whatsapp: whatsapp || null,
          company_name: companyName || null,
          company_registration: companyReg || null,
          business_address: businessAddress || null,
          bank_name: bankName || null,
          account_number: accountNumber || null,
          account_holder_name: accountHolderName || null,
          profile_image: profileImage || null,
          shop_slug: finalShopSlug,
        })
        .eq('id', currentSellerId)

      if (error) {
        throw new Error(error.message)
      }

      setShopSlug(finalShopSlug)
      setSlugLocked(true)
      alert('Settings updated successfully!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings'
      alert(message)
    } finally {
      setSaving(false)
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
                          Shop URL {slugLocked ? 'Locked' : 'Preview'}
                        </p>

                        <p className="mt-1 break-all text-sm font-bold text-slate-900">
                          {previewBaseUrl}/s/{shopSlug || previewSlug}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {slugLocked
                            ? 'Your shop URL is locked after first save.'
                            : 'Your store name will generate your shop URL when you click Save.'}
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
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                    >
                      <option value="">Select Bank</option>
                      {MALAYSIAN_BANKS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>

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
