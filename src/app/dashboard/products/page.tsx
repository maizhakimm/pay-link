'use client'

import Layout from '../../../components/Layout'
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

      const { error: insertError } = await supabase.from('products').insert({
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

      if (insertError) {
        alert(insertError.message)
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

      const { error: updateError } = await supabase
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

      if (updateError) {
        alert(updateError.message)
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

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (deleteError) {
        alert(`Delete failed: ${deleteError.message}`)
        return
      }

      await loadProductsPage()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected delete error'
      alert(`Delete failed: ${message}`)
    }
  }

  async function toggleActive(product: ProductRow) {
    const { error: toggleError } = await supabase
      .from('products')
      .update({
        is_active: !product.is_active,
      })
      .eq('id', product.id)

    if (toggleError) {
      alert(toggleError.message)
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
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Products
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Add, edit, and manage products easily from your phone.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Create Product</h2>

          <div className="grid gap-3">
            <label className="text-sm font-bold text-slate-600">Product Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Example: Nasi Lemak Ayam"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            <label className="text-sm font-bold text-slate-600">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short product description"
              rows={4}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            <label className="text-sm font-bold text-slate-600">Price (RM)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0.00"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            <label className="text-sm font-bold text-slate-600">Custom Slug (optional)</label>
            <input
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="leave blank to auto-generate"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={trackStock}
                onChange={(e) => setTrackStock(e.target.checked)}
              />
              <span>Track Stock Quantity</span>
            </label>

            <label className="text-sm font-bold text-slate-600">Stock Quantity</label>
            <input
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="0"
              disabled={!trackStock}
              className={[
                'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition',
                trackStock
                  ? 'border-slate-200 bg-white text-slate-900 focus:border-slate-400'
                  : 'border-slate-200 bg-slate-100 text-slate-400',
              ].join(' ')}
            />

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">Stock note:</strong>
              <div className="mt-1">
                If stock tracking is on and quantity is 0, the product will become sold out automatically.
              </div>
            </div>

            <label className="text-sm font-bold text-slate-600">Upload Product Images (Max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => appendCreateImages(e.target.files)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
            />

            {productImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {productImages.map((file, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="mb-2 break-words text-center text-xs text-slate-600">
                      {file.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCreateImage(index)}
                      className="w-full rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <strong className="text-slate-900">Preview link:</strong>
              <div className="mt-1 break-all">
                {generatedSlug
                  ? `${appUrl}/pay-link/${generatedSlug}`
                  : 'Enter product name to generate pay link'}
              </div>
            </div>

            <button
              onClick={handleCreateProduct}
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Saving...' : 'Create Product'}
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Your Products</h2>

          {loading ? (
            <p className="text-sm text-slate-500">Loading products...</p>
          ) : error ? (
            <p className="text-sm text-red-700">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-sm text-slate-500">No products yet.</p>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const link = `${appUrl}/pay-link/${product.slug}`
                const images = getProductImages(product)
                const thumb = images[0]

                return (
                  <div
                    key={product.id}
                    className="relative grid gap-3 rounded-3xl border border-slate-200 bg-white p-4"
                  >
                    {editingId === product.id ? (
                      <div className="grid gap-3">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Product name"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />

                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          rows={3}
                          placeholder="Description"
                          className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />

                        <input
                          value={editingPrice}
                          onChange={(e) =>
                            setEditingPrice(e.target.value.replace(/[^\d.]/g, ''))
                          }
                          placeholder="Price"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />

                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={editingIsActive}
                            onChange={(e) => setEditingIsActive(e.target.checked)}
                          />
                          <span>Active</span>
                        </label>

                        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
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
                          className={[
                            'w-full rounded-2xl border px-4 py-3 text-sm outline-none transition',
                            editingTrackStock
                              ? 'border-slate-200 bg-white text-slate-900 focus:border-slate-400'
                              : 'border-slate-200 bg-slate-100 text-slate-400',
                          ].join(' ')}
                        />

                        <label className="text-sm font-bold text-slate-600">Existing Images</label>
                        {editingExistingImages.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {editingExistingImages.map((image, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <img
                                  src={image}
                                  alt={`Existing ${index + 1}`}
                                  className="mb-2 h-24 w-full rounded-xl object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeEditExistingImage(index)}
                                  className="w-full rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-rose-100"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No existing images</p>
                        )}

                        <label className="text-sm font-bold text-slate-600">Add More Images (Max total 5)</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => appendEditImages(e.target.files)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                        />

                        {editingNewImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-3">
                            {editingNewImages.map((file, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="mb-2 break-words text-center text-xs text-slate-600">
                                  {file.name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEditNewImage(index)}
                                  className="w-full rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-rose-100"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(product)}
                            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute right-4 top-4 flex max-w-[180px] flex-wrap justify-end gap-2">
                          <span
                            className={[
                              'inline-flex rounded-full px-3 py-1 text-xs font-bold',
                              product.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-slate-100 text-slate-700',
                            ].join(' ')}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>

                          {product.sold_out ? (
                            <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                              Sold Out
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-start gap-3 pt-8">
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={product.name}
                              className="h-20 w-20 shrink-0 rounded-2xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-xs text-slate-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0 flex-1 pr-2">
                            <h3 className="mb-1 text-lg font-extrabold leading-6 text-slate-900">
                              {product.name}
                            </h3>
                            <p className="mb-2 text-lg font-extrabold text-blue-700">
                              RM {Number(product.price).toFixed(2)}
                            </p>

                            <div className="mb-2 flex flex-wrap gap-2">
                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                {product.track_stock
                                  ? `Stock: ${product.stock_quantity ?? 0}`
                                  : 'Stock tracking off'}
                              </span>
                            </div>

                            {product.description && (
                              <p className="text-sm leading-6 text-slate-500">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          {link}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => copyLink(product.slug)}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                          >
                            📋 Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => shareLink(product.slug)}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                          >
                            🔗 Share
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                          >
                            ✏️ Edit
                          </button>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-sm text-slate-500">
                            Public visibility:{' '}
                            <strong className="text-slate-700">
                              {product.is_active ? 'Visible' : 'Hidden'}
                            </strong>
                          </div>

                          <div className="grid grid-cols-2 gap-2 sm:flex">
                            <button
                              type="button"
                              onClick={() => toggleActive(product)}
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                            >
                              {product.is_active ? 'Set Inactive' : 'Set Active'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteProduct(product.id)}
                              className="rounded-2xl border border-red-200 bg-rose-50 px-4 py-3 text-xs font-bold text-red-700 transition hover:bg-rose-100 sm:text-sm"
                            >
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
    </Layout>
  )
}
