'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type ProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  is_active: boolean
  store_name: string | null
  seller_profile_id: string | null
  created_at?: string
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
}

type SellerProfileRow = {
  id: string
  store_name: string | null
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function getProductImages(product: ProductRow) {
  return [
    product.image_1,
    product.image_2,
    product.image_3,
    product.image_4,
    product.image_5,
  ].filter(Boolean) as string[]
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [productImages, setProductImages] = useState<File[]>([])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  const [editingIsActive, setEditingIsActive] = useState(true)

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || ''

  const generatedSlug = useMemo(() => {
    if (customSlug.trim()) return createSlug(customSlug)
    return createSlug(name)
  }, [customSlug, name])

  const loadProductsPage = useCallback(async () => {
    setLoading(true)
    setError('')

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Unable to load user session.')
      setLoading(false)
      return
    }

    const { data: sellerData, error: sellerError } = await supabase
      .from('seller_profiles')
      .select('id, store_name')
      .eq('user_id', user.id)
      .maybeSingle()

    if (sellerError || !sellerData) {
      setError('Seller profile not found. Please complete your settings first.')
      setLoading(false)
      return
    }

    setSellerProfile(sellerData as SellerProfileRow)

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('seller_profile_id', sellerData.id)
      .order('created_at', { ascending: false })

    if (productError) {
      setError(productError.message)
      setLoading(false)
      return
    }

    setProducts((productData || []) as ProductRow[])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProductsPage()
  }, [loadProductsPage])

  function handleImageSelect(files: FileList | null) {
    if (!files) return

    const selectedFiles = Array.from(files).slice(0, 5)

    if (selectedFiles.length > 5) {
      alert('Maximum 5 images only.')
      return
    }

    setProductImages(selectedFiles)
  }

  async function uploadProductImages(files: File[], slug: string) {
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i]
      const ext = file.name.split('.').pop() || 'jpg'
      const filePath = `${slug}/${Date.now()}-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          upsert: true,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      uploadedUrls.push(data.publicUrl)
    }

    return uploadedUrls
  }

  async function handleCreateProduct() {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }

    if (!name.trim() || !price.trim()) {
      alert('Please fill in product name and price.')
      return
    }

    const finalSlug = generatedSlug
    if (!finalSlug) {
      alert('Please enter a valid product name or slug.')
      return
    }

    setSaving(true)

    try {
      let uploadedUrls: string[] = []

      if (productImages.length > 0) {
        uploadedUrls = await uploadProductImages(productImages, finalSlug)
      }

      const { error } = await supabase.from('products').insert({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        price: Number(price),
        is_active: true,
        store_name: sellerProfile.store_name || null,
        seller_profile_id: sellerProfile.id,
        image_1: uploadedUrls[0] || null,
        image_2: uploadedUrls[1] || null,
        image_3: uploadedUrls[2] || null,
        image_4: uploadedUrls[3] || null,
        image_5: uploadedUrls[4] || null,
      })

      if (error) {
        alert(error.message)
        setSaving(false)
        return
      }

      setName('')
      setDescription('')
      setPrice('')
      setCustomSlug('')
      setProductImages([])
      await loadProductsPage()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      alert(message)
    }

    setSaving(false)
  }

  function startEdit(product: ProductRow) {
    setEditingId(product.id)
    setEditingName(product.name)
    setEditingDescription(product.description || '')
    setEditingPrice(String(product.price))
    setEditingIsActive(product.is_active)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
    setEditingPrice('')
    setEditingIsActive(true)
  }

  async function saveEdit(productId: string) {
    if (!editingName.trim() || !editingPrice.trim()) {
      alert('Please fill in product name and price.')
      return
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: editingName.trim(),
        description: editingDescription.trim() || null,
        price: Number(editingPrice),
        is_active: editingIsActive,
      })
      .eq('id', productId)

    if (error) {
      alert(error.message)
      return
    }

    cancelEdit()
    await loadProductsPage()
  }

  async function deleteProduct(productId: string) {
    const confirmed = window.confirm('Delete this product?')
    if (!confirmed) return

    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      alert(error.message)
      return
    }

    await loadProductsPage()
  }

  async function toggleActive(product: ProductRow) {
    const { error } = await supabase
      .from('products')
      .update({
        is_active: !product.is_active,
      })
      .eq('id', product.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadProductsPage()
  }

  async function copyLink(slug: string) {
    try {
      await navigator.clipboard.writeText(`${appUrl}/pay-link/${slug}`)
      alert('Payment link copied')
    } catch {
      alert('Unable to copy link')
    }
  }

  async function shareLink(slug: string) {
    const shareUrl = `${appUrl}/pay-link/${slug}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Payment Link',
          text: 'Here is your payment link',
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Share not supported. Link copied instead.')
      }
    } catch {
      alert('Unable to share link')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '14px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/GoBayar%20Logo%2001%20800px.svg"
              alt="GoBayar"
              style={{ height: '40px', width: 'auto', display: 'block' }}
            />
          </div>

          <nav
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <a href="/dashboard" style={navLinkStyle}>
              Dashboard
            </a>
            <a href="/dashboard/products" style={navLinkActiveStyle}>
              Products
            </a>
            <a href="/dashboard/orders" style={navLinkStyle}>
              Orders
            </a>
            <a href="/dashboard/settings" style={navLinkStyle}>
              Settings
            </a>
          </nav>
        </div>
      </header>

      <div
        style={{
          flex: 1,
          padding: '24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h1
              style={{
                margin: '0 0 8px 0',
                fontSize: '32px',
                color: '#0f172a',
                fontWeight: 800,
              }}
            >
              Products
            </h1>

            <p
              style={{
                margin: 0,
                color: '#64748b',
                fontSize: '15px',
              }}
            >
              Create and manage your payment link products.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              gap: '18px',
            }}
          >
            <section
              style={{
                background: '#ffffff',
                borderRadius: '22px',
                padding: '22px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '22px',
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                Create Product
              </h2>

              <div
                style={{
                  display: 'grid',
                  gap: '12px',
                }}
              >
                <label style={labelStyle}>Product Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Lolipop"
                  style={inputStyle}
                />

                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short product description"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />

                <label style={labelStyle}>Price (RM)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder="0.00"
                  style={inputStyle}
                />

                <label style={labelStyle}>Custom Slug (optional)</label>
                <input
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="leave blank to auto-generate"
                  style={inputStyle}
                />

                <label style={labelStyle}>Upload Product Images (Max 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImageSelect(e.target.files)}
                  style={inputStyle}
                />

                {productImages.length > 0 && (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, 1fr)',
                      gap: '8px',
                    }}
                  >
                    {productImages.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '8px',
                          background: '#f8fafc',
                          fontSize: '12px',
                          color: '#475569',
                          textAlign: 'center',
                        }}
                      >
                        {file.name}
                      </div>
                    ))}
                  </div>
                )}

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '13px',
                  }}
                >
                  <strong style={{ color: '#0f172a' }}>Preview link:</strong>
                  <div style={{ marginTop: '6px', wordBreak: 'break-all' }}>
                    {generatedSlug
                      ? `${appUrl}/pay-link/${generatedSlug}`
                      : 'Enter product name to generate pay link'}
                  </div>
                </div>

                <button
                  onClick={handleCreateProduct}
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '15px 18px',
                    borderRadius: '14px',
                    background: saving ? '#93c5fd' : '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 12px 24px rgba(15,23,42,0.16)',
                  }}
                >
                  {saving ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </section>

            <section
              style={{
                background: '#ffffff',
                borderRadius: '22px',
                padding: '22px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 12px 32px rgba(15,23,42,0.06)',
              }}
            >
              <h2
                style={{
                  margin: '0 0 16px 0',
                  fontSize: '22px',
                  color: '#0f172a',
                  fontWeight: 800,
                }}
              >
                Your Products
              </h2>

              {loading ? (
                <p style={{ margin: 0, color: '#64748b' }}>Loading products...</p>
              ) : error ? (
                <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
              ) : products.length === 0 ? (
                <p style={{ margin: 0, color: '#64748b' }}>No products yet.</p>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: '14px',
                  }}
                >
                  {products.map((product) => {
                    const link = `${appUrl}/pay-link/${product.slug}`
                    const images = getProductImages(product)

                    return (
                      <div
                        key={product.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '18px',
                          padding: '16px',
                          background: '#ffffff',
                        }}
                      >
                        {editingId === product.id ? (
                          <div style={{ display: 'grid', gap: '10px' }}>
                            <input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              style={inputStyle}
                            />

                            <textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              rows={3}
                              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            />

                            <input
                              value={editingPrice}
                              onChange={(e) =>
                                setEditingPrice(e.target.value.replace(/[^\d.]/g, ''))
                              }
                              style={inputStyle}
                            />

                            <label
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontSize: '14px',
                                color: '#334155',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={editingIsActive}
                                onChange={(e) => setEditingIsActive(e.target.checked)}
                              />
                              Active
                            </label>

                            <div
                              style={{
                                display: 'flex',
                                gap: '10px',
                                flexWrap: 'wrap',
                              }}
                            >
                              <button onClick={() => saveEdit(product.id)} style={darkButton}>
                                Save
                              </button>
                              <button onClick={cancelEdit} style={lightButton}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                gap: '12px',
                                flexWrap: 'wrap',
                                marginBottom: '10px',
                              }}
                            >
                              <div>
                                <h3
                                  style={{
                                    margin: '0 0 6px 0',
                                    fontSize: '20px',
                                    color: '#0f172a',
                                    fontWeight: 800,
                                  }}
                                >
                                  {product.name}
                                </h3>

                                <p
                                  style={{
                                    margin: '0 0 6px 0',
                                    color: '#1d4ed8',
                                    fontSize: '18px',
                                    fontWeight: 800,
                                  }}
                                >
                                  RM {Number(product.price).toFixed(2)}
                                </p>

                                <span
                                  style={{
                                    display: 'inline-block',
                                    padding: '6px 10px',
                                    borderRadius: '999px',
                                    background: product.is_active ? '#dcfce7' : '#f3f4f6',
                                    color: product.is_active ? '#166534' : '#374151',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                  }}
                                >
                                  {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  gap: '8px',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <button onClick={() => copyLink(product.slug)} style={lightButton}>
                                  📋 Copy Link
                                </button>
                                <button onClick={() => shareLink(product.slug)} style={lightButton}>
                                  🔗 Share
                                </button>
                                <button onClick={() => toggleActive(product)} style={lightButton}>
                                  {product.is_active ? 'Set Inactive' : 'Set Active'}
                                </button>
                                <button onClick={() => startEdit(product)} style={lightButton}>
                                  Edit
                                </button>
                                <button onClick={() => deleteProduct(product.id)} style={dangerButton}>
                                  Delete
                                </button>
                              </div>
                            </div>

                            {images.length > 0 && (
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(5, 1fr)',
                                  gap: '8px',
                                  marginBottom: '10px',
                                }}
                              >
                                {images.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`Product ${index + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '70px',
                                      objectFit: 'cover',
                                      borderRadius: '12px',
                                      border: '1px solid #e2e8f0',
                                    }}
                                  />
                                ))}
                              </div>
                            )}

                            {product.description && (
                              <p
                                style={{
                                  margin: '0 0 10px 0',
                                  color: '#64748b',
                                  fontSize: '14px',
                                  lineHeight: 1.7,
                                }}
                              >
                                {product.description}
                              </p>
                            )}

                            <div
                              style={{
                                padding: '12px 14px',
                                borderRadius: '14px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                fontSize: '13px',
                                color: '#475569',
                                wordBreak: 'break-all',
                              }}
                            >
                              {link}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <footer
        style={{
          marginTop: '20px',
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
          padding: '16px 24px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '13px',
          }}
        >
          © 2026 All rights reserved. Neugens Solution.
        </div>
      </footer>
    </main>
  )
}

const labelStyle = {
  fontSize: '13px',
  color: '#475569',
  fontWeight: 700,
}

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid #dbe2ea',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
} as const

const darkButton = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const lightButton = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const dangerButton = {
  padding: '10px 14px',
  borderRadius: '12px',
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#b91c1c',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const navLinkStyle = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: '12px',
  textDecoration: 'none',
  color: '#334155',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  fontSize: '14px',
  fontWeight: 700,
} as const

const navLinkActiveStyle = {
  ...navLinkStyle,
  background: '#0f172a',
  color: '#ffffff',
  border: '1px solid #0f172a',
} as const
