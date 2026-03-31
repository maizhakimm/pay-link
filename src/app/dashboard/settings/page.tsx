'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

type SellerProfile = {
  id: string
  user_id: string
  store_name: string
  store_slug: string
  contact_phone: string | null
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  created_at?: string
  updated_at?: string
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function DashboardSettingsPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sellerId, setSellerId] = useState('')
  const [userId, setUserId] = useState('')

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    const loadSellerProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth')
        return
      }

      setUserId(user.id)

      const { data: sellerProfile, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('Load seller profile error:', error.message)
        setLoading(false)
        return
      }

      if (sellerProfile) {
        setSellerId(sellerProfile.id)
        setStoreName(sellerProfile.store_name || '')
        setStoreSlug(sellerProfile.store_slug || '')
        setContactPhone(sellerProfile.contact_phone || '')
        setBankName(sellerProfile.bank_name || '')
        setAccountName(sellerProfile.account_name || '')
        setAccountNumber(sellerProfile.account_number || '')
        setLoading(false)
        return
      }

      const fallbackStoreName = 'My Store'
      const fallbackStoreSlug = `store-${user.id.slice(0, 8)}`

      const { data: newProfile, error: insertError } = await supabase
        .from('seller_profiles')
        .insert({
          user_id: user.id,
          store_name: fallbackStoreName,
          store_slug: fallbackStoreSlug,
          contact_phone: '',
          bank_name: '',
          account_name: '',
          account_number: '',
        })
        .select()
        .single()

      if (insertError) {
        console.error('Create seller profile error:', insertError.message)
        setLoading(false)
        return
      }

      setSellerId(newProfile.id)
      setStoreName(newProfile.store_name || '')
      setStoreSlug(newProfile.store_slug || '')
      setContactPhone(newProfile.contact_phone || '')
      setBankName(newProfile.bank_name || '')
      setAccountName(newProfile.account_name || '')
      setAccountNumber(newProfile.account_number || '')
      setLoading(false)
    }

    loadSellerProfile()
  }, [router])

  const handleStoreNameChange = (value: string) => {
    setStoreName(value)
    if (!storeSlug || storeSlug === slugify(storeName)) {
      setStoreSlug(slugify(value))
    }
  }

  const handleSave = async () => {
    if (!sellerId || !userId) return

    if (!storeName.trim()) {
      alert('Store name is required')
      return
    }

    if (!storeSlug.trim()) {
      alert('Store slug is required')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('seller_profiles')
      .update({
        store_name: storeName.trim(),
        store_slug: slugify(storeSlug),
        contact_phone: contactPhone.trim(),
        bank_name: bankName.trim(),
        account_name: accountName.trim(),
        account_number: accountNumber.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sellerId)

    setSaving(false)

    if (error) {
      alert(error.message)
      return
    }

    alert('Store settings saved successfully')
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: '#f5f7fb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '24px 28px',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            fontWeight: 600,
            color: '#111827',
          }}
        >
          Loading store settings...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            marginBottom: '20px',
          }}
        >
          <p
            style={{
              margin: 0,
              color: '#16a34a',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.4px',
            }}
          >
            STORE SETTINGS
          </p>

          <h1
            style={{
              margin: '10px 0 8px 0',
              fontSize: '34px',
              color: '#111827',
            }}
          >
            Business Profile
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '16px',
              lineHeight: 1.6,
            }}
          >
            Update your seller information, contact details, and bank details here.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Store Name
              </label>
              <input
                value={storeName}
                onChange={(e) => handleStoreNameChange(e.target.value)}
                placeholder="e.g. Maiz Kitchen"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Store Slug
              </label>
              <input
                value={storeSlug}
                onChange={(e) => setStoreSlug(slugify(e.target.value))}
                placeholder="e.g. maiz-kitchen"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Contact Phone
              </label>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 60163352087"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Bank Name
              </label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Maybank / Ryt Bank"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Account Name
              </label>
              <input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g. Maizhakim Bin Mazlan"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#111827',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Account Number
              </label>
              <input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 60163352087"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '14px 18px',
                border: 'none',
                borderRadius: '12px',
                background: '#111827',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '14px 18px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                background: '#ffffff',
                color: '#111827',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

