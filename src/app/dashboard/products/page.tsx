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
  track_stock: boolean
  stock_quantity: number
  sold_out: boolean
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
  const [trackStock, setTrackStock] = useState(true)
  const [stockQuantity, setStockQuantity] = useState('0')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  const [editingIsActive, setEditingIsActive] = useState(true)
  const [editingTrackStock, setEditingTrackStock] = useState(true)
  const [editingStockQuantity, setEditingStockQuantity] = useState('0')
  const [editingExistingImages, setEditingExistingImages] = useState<string[]>([])
  const [editingNewImages, setEditingNewImages] = useState<File[]>([])

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

  function appendCreateImages(files: FileList | null) {
    if (!files) return

    const incoming = Array.from(files)
    const combined = [...productImages, ...incoming].slice(0, 5)
    setProductImages(combined)

    if (productImages.length + incoming.length > 5) {
      alert('Maximum 5 images only.')
    }
  }

  function removeCreateImage(index: number) {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  function appendEditImages(files: FileList | null) {
    if (!files) return

    const incoming = Array.from(files)
    const totalCount = editingExistingImages.length + editingNewImages.length + incoming.length

    if (totalCount > 5) {
      const allowed = Math.max(0, 5 - editingExistingImages.length - editingNewImages.length)
      const limited = [...editingNewImages, ...incoming.slice(0, allowed)]
      setEditingNewImages(limited)
      alert('Maximum 5 images only.')
      return
    }

    setEditingNewImages((prev) => [...prev, ...incoming])
  }

  function removeEditExistingImage(index: number) {
    setEditingExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  function removeEditNewImage(index: number) {
    setEditingNewImages((prev) => prev.filter((_, i) => i !== index))
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

      const safeStock = trackStock ? Math.max(0, Number(stockQuantity || 0)) : 0
      const computedSoldOut = trackStock ? safeStock <= 0 : false

      const { error } = await supabase.from('products').insert({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        price: Number(price),
        is_active: true,
        track_stock: trackStock,
        stock_quantity: safeStock,
        sold_out: computedSoldOut,
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
      setTrackStock(true)
      setStockQuantity('0')
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
    setEditingTrackStock(product.track_stock ?? true)
    setEditingStockQuantity(String(product.stock_quantity ?? 0))
    setEditingExistingImages(getProductImages(product))
    setEditingNewImages([])
  }

  function cancelEdit() {
    setEditingId(null)
    setEditingName('')
    setEditingDescription('')
    setEditingPrice('')
    setEditingIsActive(true)
    setEditingTrackStock(true)
    setEditingStockQuantity('0')
    setEditingExistingImages([])
    setEditingNewImages([])
  }

  async function saveEdit(product: ProductRow) {
    if (!editingName.trim() || !editingPrice.trim()) {
      alert('Please fill in product name and price.')
      return
    }

    try {
      let newUploadedUrls: string[] = []

      if (editingNewImages.length > 0) {
        newUploadedUrls = await uploadProductImages(editingNewImages, product.slug)
      }

      const finalImages = [...editingExistingImages, ...newUploadedUrls].slice(0, 5)
      const safeStock = editingTrackStock ? Math.max(0, Number(editingStockQuantity || 0)) : 0
      const computedSoldOut = editingTrackStock ? safeStock <= 0 : false

      const { error } = await supabase
        .from('products')
        .update({
          name: editingName.trim(),
          description: editingDescription.trim() || null,
          price: Number(editingPrice),
          is_active: editingIsActive,
          track_stock: editingTrackStock,
          stock_quantity: safeStock,
          sold_out: computedSoldOut,
          image_1: finalImages[0] || null,
          image_2: finalImages[1] || null,
          image_3: finalImages[2] || null,
          image_4: finalImages[3] || null,
          image_5: finalImages[4] || null,
        })
        .eq('id', product.id)

      if (error) {
        alert(error.message)
        return
      }

      cancelEdit()
      await loadProductsPage()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to save product'
      alert(message)
    }
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
    <main style={pageWrap}>
      <header style={headerStyle}>
        <div style={headerInner}>
          <div style={brandWrap}>
            <img
              src="/GoBayar%20Logo%2001%20800px.svg"
              alt="GoBayar"
              style={brandLogo}
            />
          </div>

          <nav style={mobileNavWrap}>
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

      <div style={contentWrap}>
        <div style={contentInner}>
          <div style={pageTitleWrap}>
            <h1 style={pageTitle}>Products</h1>
            <p style={pageSubTitle}>
              Add, edit, and manage products easily from your phone.
            </p>
          </div>

          <div style={mobileStackLayout}>
            <section style={sectionCard}>
              <h2 style={sectionTitle}>Create Product</h2>

              <div style={formGrid}>
                <label style={labelStyle}>Product Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Example: Nasi Lemak Ayam"
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

                <label style={switchLabel}>
                  <input
                    type="checkbox"
                    checked={trackStock}
                    onChange={(e) => setTrackStock(e.target.checked)}
                  />
                  <span>Track Stock Quantity</span>
                </label>

                <label style={labelStyle}>Stock Quantity</label>
                <input
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value.replace(/[^\d]/g, ''))}
                  placeholder="0"
                  disabled={!trackStock}
                  style={{
                    ...inputStyle,
                    background: trackStock ? '#fff' : '#f1f5f9',
                    color: trackStock ? '#0f172a' : '#94a3b8',
                  }}
                />

                <div style={infoBox}>
                  <strong style={{ color: '#0f172a' }}>Stock note:</strong>
                  <div style={{ marginTop: 6 }}>
                    If stock tracking is on and quantity is 0, the product will become sold out automatically.
                  </div>
                </div>

                <label style={labelStyle}>Upload Product Images (Max 5)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => appendCreateImages(e.target.files)}
                  style={inputStyle}
                />

                {productImages.length > 0 && (
                  <div style={thumbGrid}>
                    {productImages.map((file, index) => (
                      <div key={index} style={thumbItem}>
                        <div style={thumbName}>{file.name}</div>
                        <button
                          type="button"
                          onClick={() => removeCreateImage(index)}
                          style={miniDangerButton}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={infoBox}>
                  <strong style={{ color: '#0f172a' }}>Preview link:</strong>
                  <div style={{ marginTop: 6, wordBreak: 'break-all' }}>
                    {generatedSlug
                      ? `${appUrl}/pay-link/${generatedSlug}`
                      : 'Enter product name to generate pay link'}
                  </div>
                </div>

                <button
                  onClick={handleCreateProduct}
                  disabled={saving}
                  style={{
                    ...primaryButton,
                    opacity: saving ? 0.7 : 1,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : 'Create Product'}
                </button>
              </div>
            </section>

            <section style={sectionCard}>
              <h2 style={sectionTitle}>Your Products</h2>

              {loading ? (
                <p style={mutedText}>Loading products...</p>
              ) : error ? (
                <p style={errorText}>{error}</p>
              ) : products.length === 0 ? (
                <p style={mutedText}>No products yet.</p>
              ) : (
                <div style={productListWrap}>
                  {products.map((product) => {
                    const link = `${appUrl}/pay-link/${product.slug}`
                    const images = getProductImages(product)
                    const thumb = images[0]

                    return (
                      <div key={product.id} style={productCard}>
                        {editingId === product.id ? (
                          <div style={formGrid}>
                            <input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              style={inputStyle}
                              placeholder="Product name"
                            />

                            <textarea
                              value={editingDescription}
                              onChange={(e) => setEditingDescription(e.target.value)}
                              rows={3}
                              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                              placeholder="Description"
                            />

                            <input
                              value={editingPrice}
                              onChange={(e) =>
                                setEditingPrice(e.target.value.replace(/[^\d.]/g, ''))
                              }
                              style={inputStyle}
                              placeholder="Price"
                            />

                            <label style={switchLabel}>
                              <input
                                type="checkbox"
                                checked={editingIsActive}
                                onChange={(e) => setEditingIsActive(e.target.checked)}
                              />
                              <span>Active</span>
                            </label>

                            <label style={switchLabel}>
                              <input
                                type="checkbox"
                                checked={editingTrackStock}
                                onChange={(e) => setEditingTrackStock(e.target.checked)}
                              />
                              <span>Track Stock Quantity</span>
                            </label>

                            <input
                              value={editingStockQuantity}
                              onChange={(e) =>
                                setEditingStockQuantity(e.target.value.replace(/[^\d]/g, ''))
                              }
                              placeholder="Stock quantity"
                              disabled={!editingTrackStock}
                              style={{
                                ...inputStyle,
                                background: editingTrackStock ? '#fff' : '#f1f5f9',
                                color: editingTrackStock ? '#0f172a' : '#94a3b8',
                              }}
                            />

                            <label style={labelStyle}>Existing Images</label>
                            {editingExistingImages.length > 0 ? (
                              <div style={thumbGrid}>
                                {editingExistingImages.map((image, index) => (
                                  <div key={index} style={thumbItem}>
                                    <img
                                      src={image}
                                      alt={`Existing ${index + 1}`}
                                      style={thumbPreview}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeEditExistingImage(index)}
                                      style={miniDangerButton}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={mutedSmall}>No existing images</p>
                            )}

                            <label style={labelStyle}>Add More Images (Max total 5)</label>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => appendEditImages(e.target.files)}
                              style={inputStyle}
                            />

                            {editingNewImages.length > 0 && (
                              <div style={thumbGrid}>
                                {editingNewImages.map((file, index) => (
                                  <div key={index} style={thumbItem}>
                                    <div style={thumbName}>{file.name}</div>
                                    <button
                                      type="button"
                                      onClick={() => removeEditNewImage(index)}
                                      style={miniDangerButton}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div style={actionRowStack}>
                              <button onClick={() => saveEdit(product)} style={primaryHalfButton}>
                                Save
                              </button>
                              <button onClick={cancelEdit} style={secondaryHalfButton}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={productTopRow}>
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={product.name}
                                  style={productThumb}
                                />
                              ) : (
                                <div style={productThumbPlaceholder}>No image</div>
                              )}

                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={badgeRow}>
                                  <span
                                    style={{
                                      ...statusBadge,
                                      background: product.is_active ? '#dcfce7' : '#f3f4f6',
                                      color: product.is_active ? '#166534' : '#374151',
                                    }}
                                  >
                                    {product.is_active ? 'Active' : 'Inactive'}
                                  </span>

                                  {product.sold_out ? (
                                    <span
                                      style={{
                                        ...statusBadge,
                                        background: '#fee2e2',
                                        color: '#b91c1c',
                                      }}
                                    >
                                      Sold Out
                                    </span>
                                  ) : null}
                                </div>

                                <h3 style={productTitle}>{product.name}</h3>
                                <p style={productPrice}>RM {Number(product.price).toFixed(2)}</p>

                                <div style={tagRow}>
                                  <span style={tagStyle}>
                                    {product.track_stock
                                      ? `Stock: ${product.stock_quantity ?? 0}`
                                      : 'Stock tracking off'}
                                  </span>
                                </div>

                                {product.description && (
                                  <p style={productDescription}>{product.description}</p>
                                )}
                              </div>
                            </div>

                            <div style={linkBox}>{link}</div>

                            <div style={actionRowStack}>
                              <button onClick={() => copyLink(product.slug)} style={secondaryActionButton}>
                                📋 Copy
                              </button>
                              <button onClick={() => shareLink(product.slug)} style={secondaryActionButton}>
                                🔗 Share
                              </button>
                              <button onClick={() => startEdit(product)} style={secondaryActionButton}>
                                ✏️ Edit
                              </button>
                            </div>

                            <div style={bottomRow}>
                              <div style={mutedSmall}>
                                Public visibility:{' '}
                                <strong>{product.is_active ? 'Visible' : 'Hidden'}</strong>
                              </div>

                              <div style={actionRowStack}>
                                <button onClick={() => toggleActive(product)} style={secondaryActionButton}>
                                  {product.is_active ? 'Set Inactive' : 'Set Active'}
                                </button>
                                <button onClick={() => deleteProduct(product.id)} style={dangerActionButton}>
                                  Delete
                                </button>
                              </div>
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

      <footer style={footerStyle}>
        <div style={footerInner}>© 2026 All rights reserved. Neugens Solution.</div>
      </footer>
    </main>
  )
}

const pageWrap = {
  minHeight: '100vh',
  background: '#f8fafc',
  display: 'flex',
  flexDirection: 'column' as const,
} as const

const headerStyle = {
  background: '#ffffff',
  borderBottom: '1px solid #e5e7eb',
  padding: '14px 16px',
} as const

const headerInner = {
  maxWidth: '1100px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '12px',
} as const

const brandWrap = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const

const brandLogo = {
  height: '38px',
  width: 'auto',
  display: 'block',
} as const

const mobileNavWrap = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '8px',
} as const

const contentWrap = {
  flex: 1,
  padding: '16px',
} as const

const contentInner = {
  maxWidth: '1100px',
  margin: '0 auto',
} as const

const pageTitleWrap = {
  marginBottom: '16px',
} as const

const pageTitle = {
  margin: '0 0 6px 0',
  fontSize: '28px',
  color: '#0f172a',
  fontWeight: 800,
} as const

const pageSubTitle = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.6,
} as const

const mobileStackLayout = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '16px',
} as const

const sectionCard = {
  background: '#ffffff',
  borderRadius: '20px',
  padding: '16px',
  border: '1px solid #e5e7eb',
  boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
} as const

const sectionTitle = {
  margin: '0 0 14px 0',
  fontSize: '20px',
  color: '#0f172a',
  fontWeight: 800,
} as const

const formGrid = {
  display: 'grid',
  gap: '12px',
} as const

const labelStyle = {
  fontSize: '13px',
  color: '#475569',
  fontWeight: 700,
} as const

const inputStyle = {
  width: '100%',
  padding: '13px 14px',
  borderRadius: '12px',
  border: '1px solid #dbe2ea',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box' as const,
} as const

const switchLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: '#334155',
  fontWeight: 600,
} as const

const infoBox = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '13px',
  lineHeight: 1.6,
} as const

const thumbGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px',
} as const

const thumbItem = {
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '8px',
  background: '#f8fafc',
} as const

const thumbName = {
  fontSize: '11px',
  color: '#475569',
  marginBottom: '6px',
  textAlign: 'center' as const,
  wordBreak: 'break-word' as const,
} as const

const thumbPreview = {
  width: '100%',
  height: '78px',
  objectFit: 'cover' as const,
  borderRadius: '10px',
  marginBottom: '6px',
} as const

const primaryButton = {
  width: '100%',
  padding: '15px 18px',
  borderRadius: '14px',
  background: '#0f172a',
  color: '#ffffff',
  border: 'none',
  fontSize: '15px',
  fontWeight: 800,
  boxShadow: '0 12px 24px rgba(15,23,42,0.12)',
} as const

const primaryHalfButton = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: 'none',
  background: '#0f172a',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const secondaryHalfButton = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
} as const

const miniDangerButton = {
  width: '100%',
  padding: '8px 10px',
  borderRadius: '10px',
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#b91c1c',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '12px',
} as const

const mutedText = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
} as const

const mutedSmall = {
  margin: 0,
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.5,
} as const

const errorText = {
  margin: 0,
  color: '#b91c1c',
  fontSize: '14px',
} as const

const productListWrap = {
  display: 'grid',
  gap: '14px',
} as const

const productCard = {
  border: '1px solid #e5e7eb',
  borderRadius: '18px',
  padding: '14px',
  background: '#ffffff',
  display: 'grid',
  gap: '12px',
} as const

const productTopRow = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
} as const

const productThumb = {
  width: '84px',
  height: '84px',
  objectFit: 'cover' as const,
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  flexShrink: 0,
} as const

const productThumbPlaceholder = {
  width: '84px',
  height: '84px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9',
  color: '#94a3b8',
  fontSize: '12px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  flexShrink: 0,
} as const

const badgeRow = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap' as const,
  marginBottom: '8px',
} as const

const statusBadge = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
} as const

const productTitle = {
  margin: '0 0 6px 0',
  fontSize: '18px',
  color: '#0f172a',
  fontWeight: 800,
  lineHeight: 1.4,
} as const

const productPrice = {
  margin: '0 0 8px 0',
  color: '#1d4ed8',
  fontSize: '17px',
  fontWeight: 800,
} as const

const tagRow = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap' as const,
  marginBottom: '8px',
} as const

const tagStyle = {
  display: 'inline-block',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#334155',
  fontSize: '12px',
  fontWeight: 700,
} as const

const productDescription = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.7,
} as const

const linkBox = {
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  fontSize: '13px',
  color: '#475569',
  wordBreak: 'break-all' as const,
} as const

const actionRowStack = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '8px',
} as const

const secondaryActionButton = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '12px',
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '13px',
} as const

const dangerActionButton = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: '12px',
  border: '1px solid #fecaca',
  background: '#fff1f2',
  color: '#b91c1c',
  fontWeight: 700,
  cursor: 'pointer',
  fontSize: '13px',
} as const

const bottomRow = {
  display: 'grid',
  gap: '10px',
  borderTop: '1px solid #f1f5f9',
  paddingTop: '12px',
} as const

const navLinkStyle = {
  display: 'inline-block',
  padding: '11px 12px',
  borderRadius: '12px',
  textDecoration: 'none',
  textAlign: 'center' as const,
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

const footerStyle = {
  marginTop: '20px',
  borderTop: '1px solid #e5e7eb',
  background: '#ffffff',
  padding: '16px',
} as const

const footerInner = {
  maxWidth: '1100px',
  margin: '0 auto',
  textAlign: 'center' as const,
  color: '#64748b',
  fontSize: '13px',
} as const
