'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type Product = {
  id: string
  name: string
  price: number
  is_active: boolean
  stock_quantity: number | null
  sold_out: boolean | null
  image_1?: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts((data || []) as Product[])
  }

  async function deleteProduct(id: string) {
    const confirmDelete = window.confirm('Delete this product?')
    if (!confirmDelete) return

    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  async function toggleActive(product: Product) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    loadProducts()
  }

  return (
    <main style={pageWrap}>
      <header style={header}>
        <img src="/logo.svg" alt="logo" style={{ height: 34 }} />

        <div style={navRow}>
          <a href="/dashboard" style={nav}>Dashboard</a>
          <a href="/dashboard/products" style={navActive}>Products</a>
          <a href="/dashboard/orders" style={nav}>Orders</a>
          <a href="/dashboard/settings" style={nav}>Settings</a>
        </div>
      </header>

      <div style={container}>
        <h1 style={title}>Products</h1>

        {products.map((p) => (
          <div key={p.id} style={card}>
            <div style={top}>
              <div style={thumb}>
                {p.image_1 ? (
                  <img src={p.image_1} alt={p.name} style={img} />
                ) : (
                  'No image'
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={rowSmall}>
                  <span style={badge}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {p.sold_out && (
                    <span style={sold}>Sold Out</span>
                  )}
                </div>

                <div style={name}>{p.name}</div>
                <div style={price}>RM {p.price}</div>
                <div style={stock}>
                  Stock: {p.stock_quantity ?? 0}
                </div>
              </div>
            </div>

            <div style={row}>
              <button style={btn}>Copy</button>
              <button style={btn}>Share</button>
              <button style={btn}>Edit</button>
            </div>

            <div style={row}>
              <button onClick={() => toggleActive(p)} style={btn}>
                {p.is_active ? 'Inactive' : 'Active'}
              </button>

              <button
                style={danger}
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProduct(p.id)
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

/* STYLE */

const pageWrap = { background: '#f8fafc', minHeight: '100vh' }

const header = {
  padding: 12,
  background: '#fff',
  borderBottom: '1px solid #eee',
}

const navRow = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  marginTop: 10,
}

const nav = {
  padding: '8px 10px',
  background: '#eee',
  borderRadius: 10,
  fontSize: 13,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  color: '#000',
}

const navActive = {
  ...nav,
  background: '#000',
  color: '#fff',
}

const container = {
  maxWidth: 700,
  margin: '0 auto',
  padding: 16,
}

const title = { fontSize: 22, marginBottom: 16 }

const card = {
  background: '#fff',
  padding: 14,
  borderRadius: 14,
  marginBottom: 12,
}

const top = { display: 'flex', gap: 10 }

const thumb = {
  width: 80,
  height: 80,
  background: '#eee',
  borderRadius: 12,
}

const img = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  borderRadius: 12,
}

const rowSmall = { display: 'flex', gap: 6, marginBottom: 6 }

const badge = {
  background: '#dcfce7',
  padding: '3px 7px',
  borderRadius: 20,
  fontSize: 11,
}

const sold = {
  background: '#fee2e2',
  padding: '3px 7px',
  borderRadius: 20,
  fontSize: 11,
  color: 'red',
}

const name = { fontWeight: 700 }

const price = { color: 'blue', fontWeight: 700 }

const stock = { fontSize: 12, color: '#666' }

const row = { display: 'flex', gap: 8, marginTop: 10 }

const btn = {
  flex: 1,
  padding: 8,
  borderRadius: 10,
  border: '1px solid #ddd',
  background: '#fff',
}

const danger = {
  ...btn,
  color: 'red',
  border: '1px solid #fca5a5',
}
