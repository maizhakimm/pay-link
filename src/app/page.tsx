'use client'

import { useState } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLink = () => {
    if (!amount) return
    const generated = `${window.location.origin}/pay/${amount}`
    setLink(generated)
    setCopied(false)
  }

  const copyLink = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fb',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          textAlign: 'center',
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
          SIMPLE PAYMENT LINK
        </p>

        <h1
          style={{
            marginTop: '10px',
            marginBottom: '10px',
            fontSize: '36px',
            lineHeight: 1.1,
            color: '#111827',
          }}
        >
          Pay Link Generator
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: '28px',
            color: '#6b7280',
            fontSize: '16px',
          }}
        >
          Generate a simple payment link and share it instantly with your customer.
        </p>

        <input
          type="number"
          placeholder="Enter amount (RM)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '18px',
            borderRadius: '12px',
            border: '1px solid #d1d5db',
            outline: 'none',
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={generateLink}
          style={{
            width: '100%',
            padding: '14px 18px',
            border: 'none',
            borderRadius: '12px',
            background: '#111827',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Generate Link
        </button>

        {link && (
          <div
            style={{
              marginTop: '24px',
              textAlign: 'left',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: 600,
              }}
            >
              Your Link
            </p>

            <p
              style={{
                margin: '0 0 16px 0',
                wordBreak: 'break-all',
                color: '#111827',
                fontSize: '15px',
              }}
            >
              {link}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={link}
                target="_blank"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: '#16a34a',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Open Link
              </a>

              <button
                onClick={copyLink}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#111827',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
