'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const [sellerId, setSellerId] = useState<string | null>(null)

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
      setWhatsapp(data.whatsapp || '')
      setBankName(data.bank_name || '')
      setAccountNumber(data.account_number || '')
      setAccountHolderName(data.account_holder_name || '')
    }

    setLoading(false)
  }

  async function handleSave() {
    if (!sellerId) return

    setSaving(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        store_name: storeName,
        whatsapp,
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
      })
      .eq('id', sellerId)

    setSaving(false)

    if (error) {
      alert(error.message)
    } else {
      alert('Settings saved successfully!')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <header style={headerStyle}>
        <div style={containerStyle}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
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
          <h1 style={titleStyle}>Settings</h1>
          <p style={subtitleStyle}>
            Manage your store and payout details
          </p>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div style={formGrid}>
                <input
                  placeholder="Store Name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={inputStyle}
                />

                <input
                  placeholder="WhatsApp Number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  style={inputStyle}
                />

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
                style={saveButton}
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
  fontSize: '28px',
  fontWeight: 800,
  marginBottom: '6px',
}

const subtitleStyle = {
  color: '#64748b',
  marginBottom: '20px',
}

const formGrid = {
  display: 'grid',
  gap: '12px',
}

const inputStyle = {
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
}

const saveButton = {
  marginTop: '20px',
  padding: '12px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}
