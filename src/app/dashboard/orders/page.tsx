'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

type OrderRow = {
  id: string
  order_number: string
  product_name: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  amount: number
  status: string
  created_at: string
}

function getStatusStyle(status: string) {
  if (status === 'paid') {
    return {
      background: '#dcfce7',
      color: '#166534',
    }
  }

  if (status === 'failed') {
    return {
      background: '#fee2e2',
      color: '#991b1b',
    }
  }

  if (status === 'cancelled') {
    return {
      background: '#f3f4f6',
      color: '#374151',
    }
  }

  return {
    background: '#fef3c7',
    color: '#92400e',
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      setLoading(true)
      setError('')

      const { data, error } = await supabase
        .from('orders')
        .select(
          'id, order_number, product_name, buyer_name, buyer_email, buyer_phone, amount, status, created_at'
        )
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setOrders((data || []) as OrderRow[])
      setLoading(false)
    }

    loadOrders()
  }, [])

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            marginBottom: '20px',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: '32px',
              color: '#111827',
              fontWeight: 800,
            }}
          >
            Orders
          </h1>

          <p
            style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '15px',
            }}
          >
            View and monitor all customer payment orders.
          </p>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
            overflowX: 'auto',
          }}
        >
          {loading ? (
            <p style={{ margin: 0, color: '#6b7280' }}>Loading orders...</p>
          ) : error ? (
            <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p>
          ) : orders.length === 0 ? (
            <p style={{ margin: 0, color: '#6b7280' }}>No orders yet.</p>
          ) : (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '900px',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    textAlign: 'left',
                  }}
                >
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Order No.
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Product
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Buyer
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Email
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Phone
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Amount
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Status
                  </th>
                  <th style={{ padding: '14px 10px', fontSize: '14px', color: '#374151' }}>
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const statusStyle = getStatusStyle(order.status)

                  return (
                    <tr
                      key={order.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      <td style={{ padding: '14px 10px', color: '#111827', fontWeight: 600 }}>
                        {order.order_number}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#111827' }}>
                        {order.product_name}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#111827' }}>
                        {order.buyer_name}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#111827' }}>
                        {order.buyer_email}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#111827' }}>
                        {order.buyer_phone || '-'}
                      </td>
                      <td style={{ padding: '14px 10px', color: '#111827', fontWeight: 700 }}>
                        RM {Number(order.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: '14px 10px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '6px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            ...statusStyle,
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 10px', color: '#6b7280' }}>
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}
