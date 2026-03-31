'use client'

import { useState } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const generateLink = () => {
    if (!amount) return

    const base = `${window.location.origin}/pay/${amount}`
    const generated = description
      ? `${base}?desc=${encodeURIComponent(description)}`
      : base

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
          maxWidth: '560px',
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
          SELLER PAGE
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
          Create Payment Link
        </h1>

        <p
          style={{
            marginTop: 0,
            marginBottom: '24px',
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: 1.6,
          }}
        >
          Fill in the payment details below and generate a shareable payment link for your customer.
        </p>

        <div
          style={{
            textAlign: 'left',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '22px',
          }}
        >
          <p
            style={{
              margin: '0 0 10px 0',
              color: '#111827',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            Step 1: Enter the amount and description.
          </p>

          <p
            style={{
              margin: 0,
              color: '#111827',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            Step 2: Generate and share the payment link with your customer.
          </p>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '8px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#111827',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Payment Amount (RM)
          </label>

          <input
            type="number"
            placeholder="e.g. 39"
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
        </div>

        <div style={{ textAlign: 'left', marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#111827',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Payment Description
          </label>

          <input
            type="text"
            placeholder="e.g. Kuih Koci / Deposit Website"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            marginBottom: '24px',
          }}
        >
          Generate Payment Link
        </button>

        {link && (
          <div
            style={{
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
              Generated Link
            </p>

            <p
              style={{
                margin: '0 0 16px 0',
                wordBreak: 'break-all',
                color: '#111827',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              {link}
            </p>

            <div
              style={{
                display: 'grid',
                gap: '12px',
              }}
            >
              <a
                href={link}
                target="_blank"
                style={{
                  display: 'block',
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: '#16a34a',
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  textAlign: 'center',
                }}
              >
                Open Payment Link
              </a>

              <button
                onClick={copyLink}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#f3f4f6',
                  color: '#111827',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy Payment Link'}
              </button>
            </div>
          </div>
        )}

        <p
          style={{
            marginTop: '22px',
            color: '#9ca3af',
            fontSize: '14px',
            lineHeight: 1.6,
          }}
        >
          Share the generated payment link with your customer to start collecting payments.
        </p>
      </div>
    </main>
  )
}
