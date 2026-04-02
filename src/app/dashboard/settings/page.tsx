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

    if (!user) return

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

    const filePath = `seller-${sellerId}-${Date.now()}`

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file)

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

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={headerStyle}>
        <div style={containerStyle}>
          <img src="/GoBayar%20Logo%2001%20800px.svg" style={{ height: 40 }} />

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

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {/* PROFILE IMAGE */}
              <div style={{ marginBottom: 20 }}>
                <p style={label}>Profile Image</p>

                {profileImage && (
                  <img
                    src={profileImage}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: 10,
                    }}
                  />
                )}

                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      uploadImage(e.target.files[0])
                    }
                  }}
                />

                {uploading && <p>Uploading...</p>}
              </div>

              {/* BASIC */}
              <div style={section}>
                <p style={sectionTitle}>Basic Info</p>

                <input
                  placeholder="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={input}
                />

                <input
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={input}
                />

                <input
                  placeholder="WhatsApp Number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={input}
                />
              </div>

              {/* COMPANY */}
              <div style={section}>
                <p style={sectionTitle}>Business Info</p>

                <input
                  placeholder="Company Name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={input}
                />

                <input
                  placeholder="Company Registration No"
                  value={companyReg}
                  onChange={(e) => setCompanyReg(e.target.value)}
                  style={input}
                />

                <textarea
                  placeholder="Business Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  style={{ ...input, height: 80 }}
                />
              </div>

              {/* BANK */}
              <div style={section}>
                <p style={sectionTitle}>Payout Details</p>

                <input
                  placeholder="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={input}
                />

                <input
                  placeholder="Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={input}
                />

                <input
                  placeholder="Account Holder Name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  style={input}
                />
              </div>

              <button onClick={handleSave} style={saveBtn}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

/* STYLES */

const headerStyle = {
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  padding: '14px 24px',
}

const containerStyle = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const navStyle = {
  display: 'flex',
  gap: '10px',
}

const navLinkStyle = {
  padding: '10px 14px',
  borderRadius: '12px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  textDecoration: 'none',
  color: '#334155',
  fontWeight: 600,
}

const navLinkActiveStyle = {
  ...navLinkStyle,
  background: '#0f172a',
  color: '#fff',
}

const wrapperStyle = {
  maxWidth: '700px',
  margin: '40px auto',
  padding: '0 20px',
}

const cardStyle = {
  background: '#fff',
  borderRadius: '20px',
  padding: '30px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
}

const titleStyle = {
  fontSize: '26px',
  fontWeight: 800,
  marginBottom: '16px',
}

const section = {
  marginBottom: 20,
}

const sectionTitle = {
  fontWeight: 700,
  marginBottom: 10,
}

const input = {
  width: '100%',
  padding: '12px',
  marginBottom: '10px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
}

const label = {
  fontWeight: 600,
  marginBottom: 6,
}

const saveBtn = {
  width: '100%',
  padding: '14px',
  borderRadius: '12px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  fontWeight: 700,
}
