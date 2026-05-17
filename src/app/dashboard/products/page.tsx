'use client'

import Layout from '../../../components/Layout'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type PersistableListingType = 'food' | 'shop' | 'service' | 'advertisement'
type ListingSelectorType = PersistableListingType | 'advertisement'

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
  sort_order: number
  created_at?: string
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  menu_category_id?: string | null
  listing_type?: PersistableListingType | null
}

type SellerProfileRow = {
  id: string
  store_name: string | null
  shop_slug?: string | null
}

type MenuCategoryRow = {
  id: string
  seller_profile_id: string
  name: string
  sort_order: number
  is_active: boolean
  listing_type?: ListingSelectorType | null
  created_at?: string
  updated_at?: string
}

type ProductAddonGroupRow = {
  id: string
  product_id: string
  seller_profile_id: string
  name: string
  selection_type: 'single' | 'multiple'
  is_required: boolean
  min_select: number
  max_select: number | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

type ProductAddonOptionRow = {
  id: string
  addon_group_id: string
  product_id: string
  seller_profile_id: string
  name: string
  price_delta: number
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}


const SERVICE_CATEGORY_OPTIONS = ['Printing','Design','Catering','Repair','Aircond','Cleaning','Tailor / Jahit','Massage / Urut','Tutor','Runner','Event','Beauty','IT / Computer','Photography','Home Service']
const AD_CATEGORY_OPTIONS = ['Jawatan Kosong','Bilik / Rumah Sewa','Property','Vehicle','Preloved','Computer / Gadget','Business Promo','Event Komuniti','Lost & Found','Education','Others']
function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function getNormalizedListingType(value?: string | null): PersistableListingType {
  const v = String(value || '').trim().toLowerCase()
  if (v === 'shop' || v === 'service' || v === 'advertisement') return v
  return 'food'
}

async function generateUniqueProductSlug(
  base: string,
  sellerProfileId: string,
  productId?: string
) {
  const cleanBase = createSlug(base || 'product')
  let candidate = cleanBase || 'product'
  let counter = 1

  while (true) {
    let query = supabase
      .from('products')
      .select('id')
      .eq('seller_profile_id', sellerProfileId)
      .eq('slug', candidate)

    if (productId) {
      query = query.neq('id', productId)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    if (!data) {
      return candidate
    }

    counter += 1
    candidate = `${cleanBase}-${counter}`
  }
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

function formatMoney(value?: number | null) {
  return `RM ${Number(value || 0).toFixed(2)}`
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<MenuCategoryRow[]>([])
  const [addonGroups, setAddonGroups] = useState<ProductAddonGroupRow[]>([])
  const [addonOptions, setAddonOptions] = useState<ProductAddonOptionRow[]>([])
  const [sellerProfile, setSellerProfile] = useState<SellerProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadTimedOut, setLoadTimedOut] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [productImages, setProductImages] = useState<File[]>([])
  const [trackStock, setTrackStock] = useState(true)
  const [stockQuantity, setStockQuantity] = useState('0')
  const [shippingMethod, setShippingMethod] = useState<'courier' | 'self_pickup' | 'local_delivery'>('courier')
  const [shippingFee, setShippingFee] = useState('')
  const [serviceArea, setServiceArea] = useState('')
  const [serviceWhatsapp, setServiceWhatsapp] = useState('')
  const [adCategory, setAdCategory] = useState('Job Vacancy')
  const [adLocation, setAdLocation] = useState('')
  const [adContact, setAdContact] = useState('')
  const [adExpiryDate, setAdExpiryDate] = useState('')
  const [menuCategoryId, setMenuCategoryId] = useState('')
  const [selectedListingType, setSelectedListingType] =
    useState<ListingSelectorType>('food')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySortOrder, setNewCategorySortOrder] = useState('0')
  const [savingCategory, setSavingCategory] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [editingPrice, setEditingPrice] = useState('')
  const [editingIsActive, setEditingIsActive] = useState(true)
  const [editingTrackStock, setEditingTrackStock] = useState(true)
  const [editingStockQuantity, setEditingStockQuantity] = useState('0')
  const [editingExistingImages, setEditingExistingImages] = useState<string[]>([])
  const [editingNewImages, setEditingNewImages] = useState<File[]>([])
  const [editingMenuCategoryId, setEditingMenuCategoryId] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategorySortOrder, setEditingCategorySortOrder] = useState('0')

  const [savingAddonGroup, setSavingAddonGroup] = useState(false)
  const [editingAddonGroupId, setEditingAddonGroupId] = useState<string | null>(null)
  const [addonGroupName, setAddonGroupName] = useState('')
  const [addonGroupSelectionType, setAddonGroupSelectionType] = useState<
    'single' | 'multiple'
  >('single')
  const [addonGroupIsRequired, setAddonGroupIsRequired] = useState(false)
  const [addonGroupMinSelect, setAddonGroupMinSelect] = useState('0')
  const [addonGroupMaxSelect, setAddonGroupMaxSelect] = useState('')

  const [savingAddonOption, setSavingAddonOption] = useState(false)
  const [editingAddonOptionId, setEditingAddonOptionId] = useState<string | null>(
    null
  )
  const [addonOptionGroupId, setAddonOptionGroupId] = useState('')
  const [addonOptionName, setAddonOptionName] = useState('')
  const [addonOptionPrice, setAddonOptionPrice] = useState('0')
  const [addonOptionSortOrder, setAddonOptionSortOrder] = useState('0')

  const appUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || ''

  const generatedSlug = useMemo(() => {
    return createSlug(name)
  }, [name])

  const LISTING_META: Record<
    ListingSelectorType,
    { label: string; createLabel: string; yourLabel: string; desc: string; comingSoon?: boolean }
  > = {
    food: {
      label: 'Food',
      createLabel: 'Create Food Item',
      yourLabel: 'Your Food Items',
      desc: 'Cart + payment + add-ons',
    },
    shop: {
      label: 'Product / Item',
      createLabel: 'Create Product / Item',
      yourLabel: 'Your Products / Items',
      desc: 'Shop items & simple commerce',
    },
    service: {
      label: 'Services',
      createLabel: 'Create Service',
      yourLabel: 'Your Services',
      desc: 'Lead-based (WhatsApp / quote)',
    },
    advertisement: {
      label: 'Advertisement',
      createLabel: 'Create Advertisement',
      yourLabel: 'Your Advertisements',
      desc: 'Community classified listings',
    },
  }
  const isFood = selectedListingType === 'food'
  const isShop = selectedListingType === 'shop'
  const isService = selectedListingType === 'service'
  const isAd = selectedListingType === 'advertisement'

  const filteredProducts = useMemo(() => {
    return products.filter((product) => (product.listing_type || 'food') === selectedListingType)
  }, [products, selectedListingType])
  const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
      const categoryType = category.listing_type
      if (selectedListingType === 'food') {
        return !categoryType || categoryType === 'food'
      }
      return categoryType === selectedListingType
    })
  }, [categories, selectedListingType])

  const categoryMap = useMemo(() => {
    const map = new Map<string, MenuCategoryRow>()
    categories.forEach((category) => map.set(category.id, category))
    return map
  }, [categories])
  const categoriesByListingType = useMemo(() => {
    const grouped: Record<PersistableListingType, MenuCategoryRow[]> = {
      food: [],
      shop: [],
      service: [],
      advertisement: [],
    }
    categories.forEach((category) => {
      const type = getNormalizedListingType(category.listing_type)
      grouped[type].push(category)
    })
    return grouped
  }, [categories])

  const groupsByProductId = useMemo(() => {
    const map = new Map<string, ProductAddonGroupRow[]>()

    addonGroups.forEach((group) => {
      const current = map.get(group.product_id) || []
      current.push(group)
      map.set(group.product_id, current)
    })

    map.forEach((value) => {
      value.sort((a, b) => {
        const sortDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
        if (sortDiff !== 0) return sortDiff
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      })
    })

    return map
  }, [addonGroups])

  const optionsByGroupId = useMemo(() => {
    const map = new Map<string, ProductAddonOptionRow[]>()

    addonOptions.forEach((option) => {
      const current = map.get(option.addon_group_id) || []
      current.push(option)
      map.set(option.addon_group_id, current)
    })

    map.forEach((value) => {
      value.sort((a, b) => {
        const sortDiff = Number(a.sort_order || 0) - Number(b.sort_order || 0)
        if (sortDiff !== 0) return sortDiff
        return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      })
    })

    return map
  }, [addonOptions])

  const editingProductGroups = useMemo(() => {
    if (!editingId) return []
    return groupsByProductId.get(editingId) || []
  }, [editingId, groupsByProductId])

  const buildProductLink = useCallback(
    (productSlug: string) => {
      const sellerShopSlug = sellerProfile?.shop_slug?.trim()
      if (!sellerShopSlug) return ''
      return `${appUrl}/p/${sellerShopSlug}/${productSlug}`
    },
    [appUrl, sellerProfile?.shop_slug]
  )

  const loadProductsPage = useCallback(async () => {
    console.log('[dashboard/products] loading start')
    setLoading(true)
    setLoadTimedOut(false)
    setError('')
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        if (userError) console.error('[dashboard/products] getUser error:', userError)
        setError('Unable to load user session.')
        return
      }
      console.log('[dashboard/products] auth user:', user.id)

      const { data: sellerData, error: sellerError } = await supabase
        .from('seller_profiles')
        .select('id, store_name, shop_slug')
        .eq('user_id', user.id)
        .maybeSingle()

      if (sellerError || !sellerData) {
        if (sellerError) console.error('[dashboard/products] seller_profiles error:', sellerError)
        setError('Seller profile not found. Please complete your settings first.')
        return
      }
      console.log('[dashboard/products] seller profile result:', sellerData?.id || null)

      if (!sellerData.shop_slug) {
        setError('Shop URL not found. Please complete your settings first.')
        return
      }

      setSellerProfile(sellerData as SellerProfileRow)

      const { data: categoryData, error: categoryError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (categoryError) {
        console.error('[dashboard/products] menu_categories error:', categoryError)
        setError(categoryError.message)
        return
      }

      setCategories((categoryData || []) as MenuCategoryRow[])

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (productError) {
        console.error('[dashboard/products] products error:', productError)
        setError(productError.message)
        return
      }

      setProducts((productData || []) as ProductRow[])

      const { data: groupData, error: groupError } = await supabase
        .from('product_addon_groups')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (groupError) {
        console.error('[dashboard/products] product_addon_groups error:', groupError)
        setError(groupError.message)
        return
      }

      setAddonGroups((groupData || []) as ProductAddonGroupRow[])

      const { data: optionData, error: optionError } = await supabase
        .from('product_addon_options')
        .select('*')
        .eq('seller_profile_id', sellerData.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (optionError) {
        console.error('[dashboard/products] product_addon_options error:', optionError)
        setError(optionError.message)
        return
      }

      setAddonOptions((optionData || []) as ProductAddonOptionRow[])
    } catch (e) {
      console.error('[dashboard/products] unexpected load error:', e)
      setError(e instanceof Error ? e.message : 'Failed to load listings page.')
    } finally {
      console.log('[dashboard/products] loading end')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProductsPage()
  }, [loadProductsPage])

  useEffect(() => {
    if (!loading) return
    const timer = window.setTimeout(() => {
      setLoadTimedOut(true)
      setLoading(false)
      setError('Listings loading timeout (8s). Please retry. Database update required if issue persists.')
    }, 8000)
    return () => window.clearTimeout(timer)
  }, [loading])

  useEffect(() => {
    if (!newCategorySortOrder && filteredCategories.length > 0) {
      setNewCategorySortOrder(String(filteredCategories.length + 1))
    }
  }, [filteredCategories.length, newCategorySortOrder])

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
    const totalCount =
      editingExistingImages.length + editingNewImages.length + incoming.length

    if (totalCount > 5) {
      const allowed = Math.max(
        0,
        5 - editingExistingImages.length - editingNewImages.length
      )
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

  async function handleCreateCategory() {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }

    if (!newCategoryName.trim()) {
      alert('Please enter category name.')
      return
    }

    setSavingCategory(true)

    const trimmedSortOrder = newCategorySortOrder.trim()

    const nextSortOrder =
      filteredCategories.length > 0
        ? Math.max(...filteredCategories.map((item) => Number(item.sort_order || 0))) + 1
        : 1

    const safeSortOrder =
      trimmedSortOrder === ''
        ? nextSortOrder
        : Number.isFinite(Number(trimmedSortOrder))
          ? Number(trimmedSortOrder)
          : nextSortOrder

    const { data: insertedCategory, error: insertError } = await supabase
      .from('menu_categories')
      .insert({
        seller_profile_id: sellerProfile.id,
        name: newCategoryName.trim(),
        sort_order: safeSortOrder,
        is_active: true,
        listing_type: selectedListingType,
      })
      .select('*')
      .single()

    setSavingCategory(false)

    if (insertError) {
      alert(insertError.message)
      return
    }

    setNewCategoryName('')
    setNewCategorySortOrder('')

    await loadProductsPage()

    if (insertedCategory?.id) {
      setMenuCategoryId(insertedCategory.id)
    }
  }

  function startEditCategory(category: MenuCategoryRow) {
    setEditingCategoryId(category.id)
    setEditingCategoryName(category.name)
    setEditingCategorySortOrder(String(category.sort_order ?? 0))
  }

  function cancelEditCategory() {
    setEditingCategoryId(null)
    setEditingCategoryName('')
    setEditingCategorySortOrder('0')
  }

  async function saveCategoryEdit(categoryId: string) {
    if (!editingCategoryName.trim()) {
      alert('Please enter category name.')
      return
    }

    const safeSortOrder = Number.isFinite(Number(editingCategorySortOrder))
      ? Number(editingCategorySortOrder)
      : 0

    const { error } = await supabase
      .from('menu_categories')
      .update({
        name: editingCategoryName.trim(),
        sort_order: safeSortOrder,
      })
      .eq('id', categoryId)

    if (error) {
      alert(error.message)
      return
    }

    cancelEditCategory()
    await loadProductsPage()
  }

  async function deleteCategory(category: MenuCategoryRow) {
    const confirmed = window.confirm(`Delete category "${category.name}"?`)
    if (!confirmed) return

    const { error } = await supabase
      .from('menu_categories')
      .delete()
      .eq('id', category.id)

    if (error) {
      alert(error.message)
      return
    }

    await loadProductsPage()
  }

  async function handleCreateProduct() {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }
    const persistableListingType: PersistableListingType = selectedListingType

    if (!name.trim()) {
      alert(
        selectedListingType === 'service'
          ? 'Sila isi tajuk servis.'
          : 'Sila isi nama produk dan harga.'
      )
      return
    }

    if (selectedListingType !== 'service' && !price.trim()) {
      alert('Sila isi nama produk dan harga.')
      return
    }

    // OPTIONAL validation
    if (!description.trim()) {
      const confirmProceed = confirm(
        'Produk belum ada description. Nak teruskan?'
      )
      if (!confirmProceed) return
    }

    setSaving(true)

    try {
      const finalSlug = await generateUniqueProductSlug(name.trim(), sellerProfile.id)

      if (!finalSlug) {
        alert('Please enter a valid product name.')
        setSaving(false)
        return
      }

      let uploadedUrls: string[] = []

      if (productImages.length > 0) {
        uploadedUrls = await uploadProductImages(
          productImages,
          `${sellerProfile.id}/${finalSlug}`
        )
      }

      const safeStock = trackStock ? Math.max(0, Number(stockQuantity || 0)) : 0
      const computedSoldOut = trackStock ? safeStock <= 0 : false

// ambil max sort_order
const { data: maxData } = await supabase
  .from('products')
  .select('sort_order')
  .eq('seller_profile_id', sellerProfile.id)
  .order('sort_order', { ascending: false })
  .limit(1)
  .maybeSingle()

const nextSortOrder = (maxData?.sort_order || 0) + 1

      const { error: insertError } = await supabase.from('products').insert({
        name: name.trim(),
        slug: finalSlug,
        description:
          persistableListingType === 'advertisement'
            ? [
                description.trim(),
                `Ad Category: ${adCategory}`,
                adLocation.trim() ? `Location: ${adLocation.trim()}` : '',
                adContact.trim() ? `Contact: ${adContact.trim()}` : '',
                adExpiryDate ? `Expiry Date: ${adExpiryDate}` : '',
              ]
                .filter(Boolean)
                .join('\n')
            : description.trim() || null,
        price: Number(price || 0),
        is_active: true,
        track_stock: persistableListingType === 'advertisement' ? false : trackStock,
        stock_quantity: persistableListingType === 'advertisement' ? 0 : safeStock,
        sold_out: persistableListingType === 'advertisement' ? false : computedSoldOut,
        store_name: sellerProfile.store_name || null,
        seller_profile_id: sellerProfile.id,
        menu_category_id: menuCategoryId || null,
        listing_type: persistableListingType,
        sort_order: nextSortOrder, // ✅ TAMBAH NI
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
      setProductImages([])
      setTrackStock(true)
      setStockQuantity('0')
      setMenuCategoryId('')
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
    setEditingMenuCategoryId(product.menu_category_id || '')

    setEditingAddonGroupId(null)
    setAddonGroupName('')
    setAddonGroupSelectionType('single')
    setAddonGroupIsRequired(false)
    setAddonGroupMinSelect('0')
    setAddonGroupMaxSelect('')

    setEditingAddonOptionId(null)
    setAddonOptionGroupId('')
    setAddonOptionName('')
    setAddonOptionPrice('0')
    setAddonOptionSortOrder('0')
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
    setEditingMenuCategoryId('')

    setEditingAddonGroupId(null)
    setAddonGroupName('')
    setAddonGroupSelectionType('single')
    setAddonGroupIsRequired(false)
    setAddonGroupMinSelect('0')
    setAddonGroupMaxSelect('')

    setEditingAddonOptionId(null)
    setAddonOptionGroupId('')
    setAddonOptionName('')
    setAddonOptionPrice('0')
    setAddonOptionSortOrder('0')
  }

  async function saveEdit(product: ProductRow) {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }

    const persistableListingType: PersistableListingType = getNormalizedListingType(
      product.listing_type || selectedListingType
    )

    if (!editingName.trim() || !editingPrice.trim()) {
      alert('Please fill in product name and price.')
      return
    }

    try {
      const nextSlug =
        editingName.trim() === product.name.trim()
          ? product.slug
          : await generateUniqueProductSlug(
              editingName.trim(),
              sellerProfile.id,
              product.id
            )

      let newUploadedUrls: string[] = []

      if (editingNewImages.length > 0) {
        newUploadedUrls = await uploadProductImages(
          editingNewImages,
          `${sellerProfile.id}/${nextSlug}`
        )
      }

      const finalImages = [...editingExistingImages, ...newUploadedUrls].slice(0, 5)
      const safeStock = editingTrackStock
        ? Math.max(0, Number(editingStockQuantity || 0))
        : 0
      const computedSoldOut = editingTrackStock ? safeStock <= 0 : false

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: editingName.trim(),
          slug: nextSlug,
          description: editingDescription.trim() || null,
          price: Number(editingPrice),
          is_active: editingIsActive,
          track_stock: editingTrackStock,
          stock_quantity: safeStock,
          sold_out: computedSoldOut,
          menu_category_id: editingMenuCategoryId || null,
          listing_type: persistableListingType,
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
    const link = buildProductLink(slug)

    if (!link) {
      alert('Shop URL not ready yet.')
      return
    }

    try {
      await navigator.clipboard.writeText(link)
      alert('Payment link copied')
    } catch {
      alert('Unable to copy link')
    }
  }

  async function shareLink(slug: string) {
    const shareUrl = buildProductLink(slug)

    if (!shareUrl) {
      alert('Shop URL not ready yet.')
      return
    }

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

  function resetAddonGroupForm() {
    setEditingAddonGroupId(null)
    setAddonGroupName('')
    setAddonGroupSelectionType('single')
    setAddonGroupIsRequired(false)
    setAddonGroupMinSelect('0')
    setAddonGroupMaxSelect('')
  }

  function resetAddonOptionForm() {
    setEditingAddonOptionId(null)
    setAddonOptionGroupId('')
    setAddonOptionName('')
    setAddonOptionPrice('0')
    setAddonOptionSortOrder('0')
  }

  function startEditAddonGroup(group: ProductAddonGroupRow) {
    setEditingAddonGroupId(group.id)
    setAddonGroupName(group.name)
    setAddonGroupSelectionType(group.selection_type || 'single')
    setAddonGroupIsRequired(Boolean(group.is_required))
    setAddonGroupMinSelect(String(group.min_select ?? 0))
    setAddonGroupMaxSelect(
      group.max_select === null || group.max_select === undefined
        ? ''
        : String(group.max_select)
    )
  }

  function startEditAddonOption(option: ProductAddonOptionRow) {
    setEditingAddonOptionId(option.id)
    setAddonOptionGroupId(option.addon_group_id)
    setAddonOptionName(option.name)
    setAddonOptionPrice(String(option.price_delta ?? 0))
    setAddonOptionSortOrder(String(option.sort_order ?? 0))
  }

  async function saveAddonGroup(product: ProductRow) {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }

    if (!addonGroupName.trim()) {
      alert('Please enter add-on group name.')
      return
    }

    setSavingAddonGroup(true)

    const currentGroups = groupsByProductId.get(product.id) || []
    const nextSortOrder =
      currentGroups.length > 0
        ? Math.max(...currentGroups.map((group) => Number(group.sort_order || 0))) + 1
        : 1

    const payload = {
      product_id: product.id,
      seller_profile_id: sellerProfile.id,
      name: addonGroupName.trim(),
      selection_type: addonGroupSelectionType,
      is_required: addonGroupIsRequired,
      min_select: Number.isFinite(Number(addonGroupMinSelect))
        ? Number(addonGroupMinSelect)
        : 0,
      max_select:
        addonGroupMaxSelect.trim() === ''
          ? null
          : Number.isFinite(Number(addonGroupMaxSelect))
            ? Number(addonGroupMaxSelect)
            : null,
      sort_order:
        editingAddonGroupId && currentGroups.find((group) => group.id === editingAddonGroupId)
          ? currentGroups.find((group) => group.id === editingAddonGroupId)?.sort_order || 0
          : nextSortOrder,
      is_active: true,
    }

    let errorMessage = ''

    if (editingAddonGroupId) {
      const { error } = await supabase
        .from('product_addon_groups')
        .update(payload)
        .eq('id', editingAddonGroupId)

      errorMessage = error?.message || ''
    } else {
      const { error } = await supabase.from('product_addon_groups').insert(payload)
      errorMessage = error?.message || ''
    }

    setSavingAddonGroup(false)

    if (errorMessage) {
      alert(errorMessage)
      return
    }

    resetAddonGroupForm()
    await loadProductsPage()
  }

  async function deleteAddonGroup(group: ProductAddonGroupRow) {
    const confirmed = window.confirm(
      `Delete add-on group "${group.name}"? All options under this group will also be removed.`
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('product_addon_groups')
      .delete()
      .eq('id', group.id)

    if (error) {
      alert(error.message)
      return
    }

    if (editingAddonGroupId === group.id) {
      resetAddonGroupForm()
    }

    await loadProductsPage()
  }

  async function saveAddonOption(product: ProductRow) {
    if (!sellerProfile) {
      alert('Seller profile not ready yet.')
      return
    }

    if (!addonOptionGroupId) {
      alert('Please choose add-on group first.')
      return
    }

    if (!addonOptionName.trim()) {
      alert('Please enter add-on option name.')
      return
    }

    setSavingAddonOption(true)

    const currentOptions = addonOptions.filter(
      (option) => option.addon_group_id === addonOptionGroupId
    )

    const nextSortOrder =
      currentOptions.length > 0
        ? Math.max(...currentOptions.map((option) => Number(option.sort_order || 0))) + 1
        : 1

    const payload = {
      addon_group_id: addonOptionGroupId,
      product_id: product.id,
      seller_profile_id: sellerProfile.id,
      name: addonOptionName.trim(),
      price_delta: Number.isFinite(Number(addonOptionPrice))
        ? Number(addonOptionPrice)
        : 0,
      sort_order:
        editingAddonOptionId &&
        currentOptions.find((option) => option.id === editingAddonOptionId)
          ? currentOptions.find((option) => option.id === editingAddonOptionId)?.sort_order || 0
          : Number.isFinite(Number(addonOptionSortOrder))
            ? Number(addonOptionSortOrder)
            : nextSortOrder,
      is_active: true,
    }

    let errorMessage = ''

    if (editingAddonOptionId) {
      const { error } = await supabase
        .from('product_addon_options')
        .update(payload)
        .eq('id', editingAddonOptionId)

      errorMessage = error?.message || ''
    } else {
      const { error } = await supabase.from('product_addon_options').insert(payload)
      errorMessage = error?.message || ''
    }

    setSavingAddonOption(false)

    if (errorMessage) {
      alert(errorMessage)
      return
    }

    resetAddonOptionForm()
    await loadProductsPage()
  }

  async function deleteAddonOption(option: ProductAddonOptionRow) {
    const confirmed = window.confirm(`Delete add-on option "${option.name}"?`)
    if (!confirmed) return

    const { error } = await supabase
      .from('product_addon_options')
      .delete()
      .eq('id', option.id)

    if (error) {
      alert(error.message)
      return
    }

    if (editingAddonOptionId === option.id) {
      resetAddonOptionForm()
    }

    await loadProductsPage()
  }

  async function moveUp(product: ProductRow) {
    const currentIndex = products.findIndex((p) => p.id === product.id)
    if (currentIndex <= 0) return

    const above = products[currentIndex - 1]
    await swapSort(product, above)
  }

  async function moveDown(product: ProductRow) {
    const currentIndex = products.findIndex((p) => p.id === product.id)
    if (currentIndex === -1 || currentIndex >= products.length - 1) return

    const below = products[currentIndex + 1]
    await swapSort(product, below)
  }

  async function swapSort(a: ProductRow, b: ProductRow) {
    const aSort = Number(a.sort_order || 0)
    const bSort = Number(b.sort_order || 0)

    const { error: errorA } = await supabase
      .from('products')
      .update({ sort_order: bSort })
      .eq('id', a.id)

    if (errorA) {
      alert(errorA.message)
      return
    }

    const { error: errorB } = await supabase
      .from('products')
      .update({ sort_order: aSort })
      .eq('id', b.id)

    if (errorB) {
      alert(errorB.message)
      return
    }

    await loadProductsPage()
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Listings
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Add, edit, and manage your listings easily from your phone.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Listing Categories (Phase 1)
        </p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
          {(Object.keys(LISTING_META) as ListingSelectorType[]).map((type) => {
            const isActive = selectedListingType === type
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedListingType(type)}
                className={[
                  'min-w-[130px] rounded-xl border px-3 py-2 text-left transition sm:min-w-0',
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700',
                ].join(' ')}
              >
                <p className="text-xs font-extrabold sm:text-sm">{LISTING_META[type].label}</p>
                <p className={`mt-0.5 text-[11px] leading-4 ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  {LISTING_META[type].desc}
                </p>
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Current create/edit flow below remains stable for existing products while we roll out
          multi-listing behavior in phases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
            {isFood ? 'Menu Categories' : isShop ? 'Product Categories' : isService ? 'Service Categories' : 'Ad Categories'}
          </h2>

          <div className="grid gap-3">
            <>
              <label className="text-sm font-bold text-slate-600">
                New Category Name
              </label>
              {isService ? (
                <select
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  <option value="">Select service category</option>
                  {[...SERVICE_CATEGORY_OPTIONS, 'Others'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              ) : isAd ? (
                <select
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  <option value="">Select ad category</option>
                  {AD_CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={isFood ? 'Example: Burger' : 'Example: Fashion'}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                />
              )}
            </>

            <label className="text-sm font-bold text-slate-600">
              Sort Order
            </label>
            <input
              value={newCategorySortOrder}
              onChange={(e) =>
                setNewCategorySortOrder(e.target.value.replace(/[^\d-]/g, ''))
              }
              placeholder="Auto"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />

            <button
              onClick={handleCreateCategory}
              disabled={savingCategory}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-extrabold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingCategory ? 'Saving category...' : '+ Add Category'}
            </button>

            {filteredCategories.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 text-sm font-bold text-slate-700">
                  Existing Categories
                </div>
                <div className="grid gap-3">
                  {filteredCategories.map((category) => {
                    const isEditing = editingCategoryId === category.id

                    return (
                      <div
                        key={category.id}
                        className="rounded-2xl border border-slate-200 bg-white p-3"
                      >
                        {isEditing ? (
                          <div className="grid gap-2">
                            <input
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="w-full rounded-xl border px-3 py-2 text-sm"
                            />

                            <input
                              value={editingCategorySortOrder}
                              onChange={(e) =>
                                setEditingCategorySortOrder(
                                  e.target.value.replace(/[^\d-]/g, '')
                                )
                              }
                              className="w-full rounded-xl border px-3 py-2 text-sm"
                            />

                            <div className="flex gap-2">
                              <button
                                onClick={() => saveCategoryEdit(category.id)}
                                className="rounded-xl bg-black px-3 py-2 text-xs text-white"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditCategory}
                                className="rounded-xl border px-3 py-2 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold">
                              {category.name}
                            </span>

                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditCategory(category)}
                                className="text-xs"
                              >
                                ✏️
                              </button>

                              <button
                                onClick={() => deleteCategory(category)}
                                className="text-xs text-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
              {LISTING_META[selectedListingType].createLabel}
            </h2>

            <div className="grid gap-3">
              <label className="text-sm font-bold text-slate-600">
                {isService ? 'Service Title' : isAd ? 'Ad Title' : 'Product Name'}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isService
                    ? 'Example: Aircond Service Rumah'
                    : isShop
                      ? 'Example: Wireless Earbuds'
                      : isAd
                        ? 'Example: Room for Rent at Seksyen 7'
                      : 'Example: Nasi Lemak Ayam'
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />

              <label className="text-sm font-bold text-slate-600">
                {isFood ? 'Menu Category' : isShop ? 'Product Category' : isService ? 'Service Category' : 'Ad Category'}
              </label>
              {isAd ? (
                <select
                  value={adCategory}
                  onChange={(e) => setAdCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                >
                  {AD_CATEGORY_OPTIONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              ) : (
              <select
                value={menuCategoryId}
                onChange={(e) => setMenuCategoryId(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              >
                <option value="">No category</option>
                {filteredCategories
                  .filter((category) => category.is_active)
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              )}

              <label className="text-sm font-bold text-slate-600">
                {isService ? 'Service Description' : isAd ? 'Ad Description' : 'Description'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isService
                    ? 'Explain service scope, process, and what customer will get.'
                    : isAd
                      ? 'Describe the ad details clearly.'
                    : 'Short product description'
                }
                rows={4}
                className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />

              <label className="text-sm font-bold text-slate-600">
                {isService ? 'Starting Price (Optional)' : isAd ? 'Price / Salary / Rent (Optional)' : 'Price (RM)'}
              </label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder={isService || isAd ? 'Optional (e.g. 80.00)' : '0.00'}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />

              {!isService && !isAd ? (
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={trackStock}
                  onChange={(e) => setTrackStock(e.target.checked)}
                />
                <span>Track Stock Quantity</span>
              </label>
              ) : null}

              {!isService && !isAd ? (
              <label className="text-sm font-bold text-slate-600">Stock Quantity</label>
              ) : null}
              {!isService && !isAd ? (
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
              ) : null}

              {!isService && !isAd ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <strong className="text-slate-900">Stock note:</strong>
                <div className="mt-1">
                  If stock tracking is on and quantity is 0, the product will become sold out automatically.
                </div>
              </div>
              ) : null}

              {isShop ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="text-sm font-bold text-slate-700">Shipping Method (MVP)</label>
                  <select
                    value={shippingMethod}
                    onChange={(e) => setShippingMethod(e.target.value as 'courier' | 'self_pickup' | 'local_delivery')}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  >
                    <option value="courier">Courier</option>
                    <option value="self_pickup">Self Pickup</option>
                    <option value="local_delivery">Local Delivery</option>
                  </select>
                  <label className="text-sm font-bold text-slate-700">Shipping Fee (Optional)</label>
                  <input
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="e.g. 5.00"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Shipping fields are UI MVP for now. Full shipping persistence will be added in later phase.
                  </p>
                </div>
              ) : null}

              {isService ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="text-sm font-bold text-slate-700">Service Area / Location</label>
                  <input
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="Example: Shah Alam, Subang, Klang"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <label className="text-sm font-bold text-slate-700">WhatsApp CTA / Contact</label>
                  <input
                    value={serviceWhatsapp}
                    onChange={(e) => setServiceWhatsapp(e.target.value)}
                    placeholder="Example: 0123456789"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    Service leads are WhatsApp/quotation based. Advanced quotation fields will come in next phase.
                  </p>
                </div>
              ) : null}
              {isAd ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="text-sm font-bold text-slate-700">Location / Area</label>
                  <input value={adLocation} onChange={(e) => setAdLocation(e.target.value)} placeholder="Example: Shah Alam" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <label className="text-sm font-bold text-slate-700">WhatsApp / Contact Number</label>
                  <input value={adContact} onChange={(e) => setAdContact(e.target.value)} placeholder="Example: 0123456789" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <label className="text-sm font-bold text-slate-700">Expiry Date (Optional)</label>
                  <input type="date" value={adExpiryDate} onChange={(e) => setAdExpiryDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                  <p className="text-xs text-slate-500">Community ads are lead-based. Customers contact you via WhatsApp.</p>
                </div>
              ) : null}

              <label className="text-sm font-bold text-slate-600">
                Upload Product Images (Max 5)
              </label>
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
                  {generatedSlug && sellerProfile?.shop_slug
                    ? `${appUrl}/p/${sellerProfile.shop_slug}/${generatedSlug}`
                    : 'Enter product name to generate product link'}
                </div>
              </div>

              <button
                onClick={handleCreateProduct}
                disabled={saving}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving...' : LISTING_META[selectedListingType].createLabel}
              </button>

              {isFood ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <strong>Add-on tip:</strong>
                <div className="mt-1">
                  Create the product first, then tap <strong>Edit</strong> on that product to add add-on groups and options.
                </div>
              </div>
              ) : null}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-2xl font-extrabold text-slate-900">
            {LISTING_META[selectedListingType].yourLabel}
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">Loading products...</p>
          ) : error ? (
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={loadProductsPage} className="mt-2 rounded-xl border border-red-300 bg-white px-3 py-1.5 text-sm font-semibold text-red-700">Retry</button>
              {loadTimedOut ? <p className="mt-1 text-xs text-red-600">Tip: check listing_type/menu_categories migrations.</p> : null}
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-sm text-slate-500">
              {isFood
                ? 'No food items yet.'
                : isShop
                  ? 'No products/items yet.'
                  : isService
                    ? 'No services yet.'
                    : 'No advertisements yet.'}
            </p>
          ) : (
            <div className="grid gap-4">
              {filteredProducts.map((product) => {
                const productListingType = getNormalizedListingType(
                  product.listing_type || selectedListingType
                )
                const link = buildProductLink(product.slug)
                const images = getProductImages(product)
                const thumb = images[0]
                const categoryName = product.menu_category_id
                  ? categoryMap.get(product.menu_category_id)?.name || 'Unknown category'
                  : 'No category'
                const editCategories = categoriesByListingType[productListingType].filter(
                  (category) => category.is_active
                )
                const selectedEditCategory = editingMenuCategoryId
                  ? categoryMap.get(editingMenuCategoryId)
                  : null
                const selectedEditCategoryType = getNormalizedListingType(
                  selectedEditCategory?.listing_type
                )
                const invalidEditCategory =
                  Boolean(editingMenuCategoryId) &&
                  (!selectedEditCategory ||
                    selectedEditCategoryType !== productListingType)
                const productGroups = groupsByProductId.get(product.id) || []

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

                        <label className="text-sm font-bold text-slate-600">
                          {productListingType === 'food'
                            ? 'Menu Category'
                            : productListingType === 'shop'
                            ? 'Product Category'
                            : productListingType === 'service'
                            ? 'Service Category'
                            : 'Ad Category'}
                        </label>
                        <select
                          value={invalidEditCategory ? '' : editingMenuCategoryId}
                          onChange={(e) => setEditingMenuCategoryId(e.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                        >
                          <option value="">No category</option>
                          {editCategories
                            .map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                        </select>
                        {invalidEditCategory ? (
                          <p className="text-xs text-amber-700">
                            Current category does not match this listing type. Please choose a valid category.
                          </p>
                        ) : null}

                        <textarea
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          rows={3}
                          placeholder="Description"
                          className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                          Listing Type: {LISTING_META[productListingType].label}
                        </div>

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

                        <label className="text-sm font-bold text-slate-600">
                          Existing Images
                        </label>
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

                        <label className="text-sm font-bold text-slate-600">
                          Add More Images (Max total 5)
                        </label>
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

                        {productListingType === 'food' ? (
                        <div className="mt-2 rounded-3xl border border-violet-200 bg-violet-50 p-4">
                          <div className="mb-3 text-lg font-extrabold text-slate-900">
                            Add-on Groups
                          </div>

                          <div className="grid gap-3 rounded-2xl border border-violet-100 bg-white p-4">
                            <label className="text-sm font-bold text-slate-600">
                              Group Name
                            </label>
                            <input
                              value={addonGroupName}
                              onChange={(e) => setAddonGroupName(e.target.value)}
                              placeholder="Example: Extra, Size, Pilihan Kuah"
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                            />

                            <label className="text-sm font-bold text-slate-600">
                              Selection Type
                            </label>
                            <select
                              value={addonGroupSelectionType}
                              onChange={(e) =>
                                setAddonGroupSelectionType(
                                  e.target.value as 'single' | 'multiple'
                                )
                              }
                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                            >
                              <option value="single">Single choice</option>
                              <option value="multiple">Multiple choice</option>
                            </select>

                            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                              <input
                                type="checkbox"
                                checked={addonGroupIsRequired}
                                onChange={(e) => setAddonGroupIsRequired(e.target.checked)}
                              />
                              <span>Required group</span>
                            </label>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-sm font-bold text-slate-600">
                                  Min Select
                                </label>
                                <input
                                  value={addonGroupMinSelect}
                                  onChange={(e) =>
                                    setAddonGroupMinSelect(
                                      e.target.value.replace(/[^\d]/g, '')
                                    )
                                  }
                                  placeholder="0"
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                />
                              </div>

                              <div>
                                <label className="mb-1 block text-sm font-bold text-slate-600">
                                  Max Select
                                </label>
                                <input
                                  value={addonGroupMaxSelect}
                                  onChange={(e) =>
                                    setAddonGroupMaxSelect(
                                      e.target.value.replace(/[^\d]/g, '')
                                    )
                                  }
                                  placeholder="Optional"
                                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => saveAddonGroup(product)}
                                disabled={savingAddonGroup}
                                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {savingAddonGroup
                                  ? 'Saving...'
                                  : editingAddonGroupId
                                    ? 'Save Group'
                                    : '+ Add Group'}
                              </button>

                              <button
                                type="button"
                                onClick={resetAddonGroupForm}
                                className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                              >
                                Reset
                              </button>
                            </div>
                          </div>

                          {editingProductGroups.length > 0 ? (
                            <div className="mt-4 grid gap-3">
                              {editingProductGroups.map((group) => {
                                const groupOptions = optionsByGroupId.get(group.id) || []

                                return (
                                  <div
                                    key={group.id}
                                    className="rounded-2xl border border-violet-100 bg-white p-4"
                                  >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                      <div>
                                        <div className="text-base font-extrabold text-slate-900">
                                          {group.name}
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-2">
                                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                            {group.selection_type === 'single'
                                              ? 'Single choice'
                                              : 'Multiple choice'}
                                          </span>
                                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                            {group.is_required ? 'Required' : 'Optional'}
                                          </span>
                                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                            Min {Number(group.min_select || 0)}
                                          </span>
                                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                            Max {group.max_select ?? '—'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => startEditAddonGroup(group)}
                                          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-50"
                                        >
                                          Edit Group
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => deleteAddonGroup(group)}
                                          className="rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-rose-100"
                                        >
                                          Delete Group
                                        </button>
                                      </div>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                      <div className="mb-3 text-sm font-extrabold text-slate-900">
                                        Add-on Options
                                      </div>

                                      <div className="grid gap-3">
                                        <div>
                                          <label className="mb-1 block text-sm font-bold text-slate-600">
                                            Group
                                          </label>
                                          <select
                                            value={addonOptionGroupId}
                                            onChange={(e) => setAddonOptionGroupId(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                          >
                                            <option value="">Choose group</option>
                                            {editingProductGroups.map((groupItem) => (
                                              <option key={groupItem.id} value={groupItem.id}>
                                                {groupItem.name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                          <div className="sm:col-span-2">
                                            <label className="mb-1 block text-sm font-bold text-slate-600">
                                              Option Name
                                            </label>
                                            <input
                                              value={addonOptionName}
                                              onChange={(e) => setAddonOptionName(e.target.value)}
                                              placeholder="Example: Cheese"
                                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                            />
                                          </div>

                                          <div>
                                            <label className="mb-1 block text-sm font-bold text-slate-600">
                                              Price Delta
                                            </label>
                                            <input
                                              value={addonOptionPrice}
                                              onChange={(e) =>
                                                setAddonOptionPrice(
                                                  e.target.value.replace(/[^\d.]/g, '')
                                                )
                                              }
                                              placeholder="0.00"
                                              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <label className="mb-1 block text-sm font-bold text-slate-600">
                                            Sort Order
                                          </label>
                                          <input
                                            value={addonOptionSortOrder}
                                            onChange={(e) =>
                                              setAddonOptionSortOrder(
                                                e.target.value.replace(/[^\d]/g, '')
                                              )
                                            }
                                            placeholder="0"
                                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                                          />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (!addonOptionGroupId) {
                                                setAddonOptionGroupId(group.id)
                                              }
                                              saveAddonOption(product)
                                            }}
                                            disabled={savingAddonOption}
                                            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                                          >
                                            {savingAddonOption
                                              ? 'Saving...'
                                              : editingAddonOptionId
                                                ? 'Save Option'
                                                : '+ Add Option'}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={resetAddonOptionForm}
                                            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                                          >
                                            Reset
                                          </button>
                                        </div>
                                      </div>

                                      {groupOptions.length > 0 ? (
                                        <div className="mt-4 grid gap-2">
                                          {groupOptions.map((option) => (
                                            <div
                                              key={option.id}
                                              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                              <div>
                                                <div className="text-sm font-bold text-slate-900">
                                                  {option.name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                  {formatMoney(option.price_delta)} • Sort{' '}
                                                  {Number(option.sort_order || 0)}
                                                </div>
                                              </div>

                                              <div className="flex gap-2">
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    startEditAddonOption(option)
                                                    setAddonOptionGroupId(option.addon_group_id)
                                                  }}
                                                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-50"
                                                >
                                                  Edit
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => deleteAddonOption(option)}
                                                  className="rounded-xl border border-red-200 bg-rose-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-rose-100"
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="mt-4 text-sm text-slate-500">
                                          No options yet for this group.
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <div className="mt-4 rounded-2xl border border-dashed border-violet-200 bg-white p-4 text-sm text-slate-500">
                              No add-on groups yet. Create a group first, then add options under it.
                            </div>
                          )}
                        </div>
                        ) : null}

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

                              <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                                {categoryName}
                              </span>

                              <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                                {productGroups.length} add-on group
                                {productGroups.length === 1 ? '' : 's'}
                              </span>
                            </div>

                            {product.description && (
                              <p className="text-sm leading-6 text-slate-500">
                                {product.description}
                              </p>
                            )}

                            {productGroups.length > 0 ? (
                              <div className="mt-3 grid gap-2">
                                {productGroups.map((group) => {
                                  const groupOptions = optionsByGroupId.get(group.id) || []

                                  return (
                                    <div
                                      key={group.id}
                                      className="rounded-2xl border border-violet-100 bg-violet-50 p-3"
                                    >
                                      <div className="text-sm font-bold text-slate-900">
                                        {group.name}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        {group.selection_type === 'single'
                                          ? 'Single choice'
                                          : 'Multiple choice'}
                                        {' • '}
                                        {group.is_required ? 'Required' : 'Optional'}
                                      </div>

                                      {groupOptions.length > 0 ? (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          {groupOptions.map((option) => (
                                            <span
                                              key={option.id}
                                              className="inline-flex rounded-full border border-white bg-white px-3 py-1 text-xs font-bold text-violet-700"
                                            >
                                              {option.name} ({formatMoney(option.price_delta)})
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="mt-2 text-xs text-slate-500">
                                          No options yet
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="break-all rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          {link || 'Shop URL not ready yet'}
                        </div>

                        <div className="grid grid-cols-5 gap-2">
                        <button
                            type="button"
                            onClick={() => moveUp(product)}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                          >
                            ⬆️
                          </button>

                          <button
                            type="button"
                            onClick={() => moveDown(product)}
                            className="rounded-2xl border border-slate-300 bg-white px-3 py-3 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:text-sm"
                          >
                            ⬇️
                          </button>

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
