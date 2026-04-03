'use client'

import Layout from '../../../components/Layout'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const [sellerId, setSellerId] = useState<string | null>(null)
  const [accountEmail, setAccountEmail] = useState('')

  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [dailyNote, setDailyNote] = useState('')

  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const [profileImage, setProfileImage] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

    const { data } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (data) {
      setSellerId(data.id)
      setStoreName(data.store_name || '')
      setEmail(data.email || '')
      setWhatsapp(data.whatsapp || '')
      setCompanyName(data.company_name || '')
      setCompanyReg(data.company_registration || '')
      setBusinessAddress(data.business_address || '')
      setDailyNote(data.daily_note || '')

      setBankName(data.bank_name || '')
      setAccountNumber(data.account_number || '')
      setAccountHolderName(data.account_holder_name || '')

      setProfileImage(data.profile_image || '')
    }

    setLoading(false)
  }

  async function uploadImage(file: File) {
    if (!sellerId) return

    setUploading(true)

    const ext = file.name.split('.').pop() || 'jpg'
    const filePath = `seller-${sellerId}-${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { upsert: true })

    if (error) {
      alert(error.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath)

    setProfileImage(data.publicUrl)
    setUploading(false)
  }

  async function handleSave() {
    if (!sellerId) return

    setSaving(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        store_name: storeName,
        email,
        whatsapp,
        company_name: companyName,
        company_registration: companyReg,
        business_address: businessAddress,
        daily_note: dailyNote,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
        profile_image: profileImage,
      })
      .eq('id', sellerId)

    setSaving(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Settings updated successfully!')
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

    setPasswordSaving(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setPasswordSaving(false)

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

    setLoggingOut(true)

    const { error } = await supabase.auth.signOut()

    setLoggingOut(false)

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
          Manage your store, payout details, daily message, and account settings.
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

                {uploading ? (
                  <p className="mt-2 text-xs text-slate-500">Uploading...</p>
                ) : null}
              </div>

              <div className="space-y-5">
                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Basic Info</p>

                  <div className="grid gap-3">
                    <input
                      placeholder="Store Name"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

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
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Business Info</p>

                  <div className="grid gap-3">
                    <input
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <input
                      placeholder="Company Registration No"
                      value={companyReg}
                      onChange={(e) => setCompanyReg(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />

                    <textarea
                      placeholder="Business Address"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      rows={4}
                      className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-sm font-extrabold text-slate-900">Message</p>

    

                  <p className="mt-2 text-xs text-slate-500">
                    Message ini akan dimasukkan secara automatik dalam WhatsApp share.
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Product list pula akan ikut produk yang active sahaja. Kalau nak ubah senarai produk, sila update di page Products.
                  </p>
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
                  disabled={passwordSaving}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {passwordSaving ? 'Updating Password...' : 'Update Password'}
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
                disabled={loggingOut}
                className="w-full rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-sm font-extrabold text-red-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loggingOut ? 'Logging Out...' : 'Log Out'}
              </button>
            </section>
          </div>
        </div>
      )}
    </Layout>
  )
}
