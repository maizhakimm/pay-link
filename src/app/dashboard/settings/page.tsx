'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [sellerId, setSellerId] = useState<string | null>(null)

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

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={headerStyle}>
        <div style={containerStyle}>
          <img
            src="/BayarLink Logo 01.svg"
            alt="bayarlink"
            style={{ height: 40 }}
          />

          <nav style={navStyle}>
            <a href="/dashboard" style={navLinkStyle}>Dashboard</a>
            <a href="/dashboard/products" style={navLinkStyle}>Products</a>
            <a href="/dashboard/orders" style={navLinkStyle}>Orders</a>
            <a href="/dashboard/settings" style={navLinkActiveStyle}>Settings</a>
          </nav>
        </div>
      </header>

      <div style={wrapperStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Seller Profile</h1>
          <p style={subtitleStyle}>
            Manage your store, payout details, and customer-facing message.
          </p>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <p style={labelStyle}>Profile Image</p>

                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Seller profile"
                    style={profilePreviewStyle}
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
                />

                {uploading ? (
                  <p style={smallNoteStyle}>Uploading...</p>
                ) : null}
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitleStyle}>Basic Info</p>

                <input
                  placeholder="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="WhatsApp Number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitleStyle}>Business Info</p>

                <input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="Company Registration No"
                  value={companyReg}
                  onChange={(e) => setCompanyReg(e.target.value)}
                  style={inputStyle}
                />

                <textarea
                  placeholder="Business Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  style={textareaStyle}
                />
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitleStyle}>Message</p>

                <textarea
                  placeholder={`Contoh:
Delivery start 12 tengahari 😊
Self pickup available
Area delivery: Setia Alam sahaja`}
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  style={dailyNoteStyle}
                />

                <p style={smallNoteStyle}>
                  Message ini akan dimasukkan secara automatik dalam WhatsApp share.
                </p>
                <p style={smallNoteStyle}>
                  Product list pula akan ikut produk yang active sahaja. Kalau nak ubah senarai produk, sila update di page Products.
                </p>
              </div>

              <div style={sectionStyle}>
                <p style={sectionTitleStyle}>Payout Details</p>

                <input
                  placeholder="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="Account Holder Name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                style={saveBtnStyle}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

const headerStyle = {
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  padding: '14px 24px',
} as const

const containerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap' as const,
} as const

const navStyle = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap' as const,
} as const

const navLinkStyle = {
  padding: '10px 14px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  textDecoration: 'none',
  color: '#334155',
  fontWeight: 600,
} as const

const navLinkActiveStyle = {
  ...navLinkStyle,
  background: '#0f172a',
  color: '#fff',
} as const

const wrapperStyle = {
  maxWidth: '760px',
  margin: '40px auto',
  padding: '0 20px',
} as const

const cardStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '30px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
} as const

const titleStyle = {
  fontSize: '26px',
  fontWeight: 800,
  marginBottom: '6px',
  color: '#0f172a',
} as const

const subtitleStyle = {
  color: '#64748b',
  marginBottom: '20px',
} as const

const sectionStyle = {
  marginBottom: '20px',
} as const

const sectionTitleStyle = {
  fontWeight: 700,
  marginBottom: '10px',
  color: '#0f172a',
} as const

const inputStyle = {
  width: '100%',
  padding: '12px',
  marginBottom: '10px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
} as const

const textareaStyle = {
  width: '100%',
  minHeight: '90px',
  padding: '12px',
  marginBottom: '10px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  resize: 'vertical' as const,
} as const

const dailyNoteStyle = {
  width: '100%',
  minHeight: '120px',
  padding: '12px',
  marginBottom: '8px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  resize: 'vertical' as const,
  lineHeight: 1.6,
} as const

const labelStyle = {
  fontWeight: 600,
  marginBottom: 6,
  color: '#0f172a',
} as const

const smallNoteStyle = {
  fontSize: '12px',
  color: '#64748b',
  marginTop: '4px',
} as const

const profilePreviewStyle = {
  width: 80,
  height: 80,
  borderRadius: '50%',
  objectFit: 'cover' as const,
  marginBottom: 10,
  display: 'block',
} as const

const saveBtnStyle = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  fontWeight: 700,
} as const
