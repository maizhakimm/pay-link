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
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your store, payout details, and account settings.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
          
          {/* LEFT */}
          <section className="rounded-3xl border bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-2xl font-extrabold">Seller Profile</h2>

            {profileImage && (
              <img src={profileImage} className="h-20 w-20 rounded-full mb-3 object-cover" />
            )}

            <input type="file" onChange={(e)=> e.target.files?.[0] && uploadImage(e.target.files[0])} />

            <div className="mt-4 space-y-3">
              <input value={storeName} onChange={(e)=>setStoreName(e.target.value)} placeholder="Store Name" className="input"/>
              <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="input"/>
              <input value={whatsapp} onChange={(e)=>setWhatsapp(e.target.value)} placeholder="WhatsApp" className="input"/>

              <input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} placeholder="Company Name" className="input"/>
              <input value={companyReg} onChange={(e)=>setCompanyReg(e.target.value)} placeholder="Company Reg" className="input"/>
              <textarea value={businessAddress} onChange={(e)=>setBusinessAddress(e.target.value)} placeholder="Address" className="input"/>

              <input value={bankName} onChange={(e)=>setBankName(e.target.value)} placeholder="Bank" className="input"/>
              <input value={accountNumber} onChange={(e)=>setAccountNumber(e.target.value)} placeholder="Account No" className="input"/>
              <input value={accountHolderName} onChange={(e)=>setAccountHolderName(e.target.value)} placeholder="Account Name" className="input"/>

              <button onClick={handleSave} className="btn-primary">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </section>

          {/* RIGHT */}
          <div className="space-y-5">
            <section className="rounded-3xl border bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xl font-bold">Account</h2>
              <p>{accountEmail}</p>

              <input type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="input mt-3"/>
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="input mt-2"/>

              <button onClick={handleChangePassword} className="btn-secondary mt-3">
                Update Password
              </button>
            </section>

            <section className="rounded-3xl border bg-white p-5 shadow-sm">
              <button onClick={handleLogout} className="btn-danger">
                Log Out
              </button>
            </section>
          </div>

        </div>
      )}
    </Layout>
  )
}
