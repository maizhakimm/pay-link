'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*')
    setProducts(data || [])
  }

  async function deleteProduct(id: string) {
    const confirmDelete = window.confirm('Delete this product?')
    if (!confirmDelete) return

    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  async function toggleActive(product: any) {
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)

    loadProducts()
  }

  return (
    <main style={pageWrap}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={headerInner}>
          <img
            src="/GoBayar%20Logo%2001%20800px.svg"
            style={{ height: 36 }}
          />

          {/* NAV 1 ROW */}
          <div style={navRow}>
            <a href="/dashboard" style={navBtn}>Dashboard</a>
            <a href="/dashboard/products" style={navActive}>Products</a>
            <a href="/dashboard/orders" style={navBtn}>Orders</a>
            <a href="/dashboard/settings" style={navBtn}>Settings</a>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={content}>
        <h1 style={title}>Your Products</h1>

        {products.map((p) => (
          <div key={p.id} style={card}>
            
            {/* TOP */}
            <div style={topRow}>
              <div style={thumb}>
                {p.image_1 ? (
                  <img src={p.image_1} style={thumbImg} />
                ) : (
                  'No image'
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={badgeRow}>
                  <span style={badge}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {p.sold_out && (
                    <span style={soldBadge}>Sold Out</span>
                  )}
                </div>

                <div style={name}>{p.name}</div>
                <div style={price}>RM {p.price}</div>
                <div style={stock}>
                  Stock: {p.stock_quantity ?? 0}
                </div>
              </div>
            </div>

            {/* ACTION ROW 1 */}
            <div style={row}>
              <button style={btn}>📋 Copy</button>
              <button style={btn}>🔗 Share</button>
              <button style={btn}>✏️ Edit</button>
            </div>

            {/* ACTION ROW 2 */}
            <div style={row}>
              <button
                style={btn}
                onClick={() => toggleActive(p)}
              >
                {p.is_active ? 'Set Inactive' : 'Set Active'}
              </button>

              <button
                style={dangerBtn}
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

/* STYLES */

const pageWrap = {
  background: '#f8fafc',
  minHeight: '100vh',
}

const headerStyle = {
  background: '#fff',
  padding: 12,
  borderBottom: '1px solid #eee',
}

const headerInner = {
  maxWidth: 700,
  margin: '0 auto',
}

const navRow = {
  display: 'flex',
  gap: 8,
  overflowX: 'auto',
  marginTop: 10,
}

const navBtn = {
  padding: '8px 10px',
  background: '#eee',
  borderRadius: 10,
  fontSize: 13,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  color: '#000',
}

const navActive = {
  ...navBtn,
  background: '#000',
  color: '#fff',
}

const content = {
  maxWidth: 700,
  margin: '0 auto',
  padding: 16,
}

const title = {
  fontSize: 24,
  marginBottom: 16,
}

const card = {
  background: '#fff',
  padding: 14,
  borderRadius: 14,
  marginBottom: 12,
}

const topRow = {
  display: 'flex',
  gap: 12,
}

const thumb = {
  width: 80,
  height: 80,
  background: '#eee',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const thumbImg = {
  width: '100%',
  height: '100%',
  objectFit: 'cover' as const,
  borderRadius: 12,
}

const badgeRow = {
  display: 'flex',
  gap: 6,
  marginBottom: 6,
}

const badge = {
  background: '#dcfce7',
  padding: '4px 8px',
  borderRadius: 20,
  fontSize: 12,
}

const soldBadge = {
  background: '#fee2e2',
  padding: '4px 8px',
  borderRadius: 20,
  fontSize: 12,
  color: 'red',
}

const name = {
  fontWeight: 700,
}

const price = {
  color: 'blue',
  fontWeight: 700,
}

const stock = {
  fontSize: 13,
  color: '#666',
}

const row = {
  display: 'flex',
  gap: 8,
  marginTop: 10,
}

const btn = {
  flex: 1,
  padding: '8px',
  borderRadius: 10,
  border: '1px solid #ddd',
  background: '#fff',
}

const dangerBtn = {
  ...btn,
  color: 'red',
  border: '1px solid #fca5a5',
}
