'use client'

import { useState } from 'react'

export default function Home() {
  const [amount, setAmount] = useState('')
  const [link, setLink] = useState('')

  const generateLink = () => {
    if (!amount) return
    const generated = `${window.location.origin}/pay/${amount}`
    setLink(generated)
  }

  return (
    <main style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Pay Link Generator</h1>

      <input
        type="number"
        placeholder="Enter amount (RM)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ padding: '10px', marginTop: '20px' }}
      />

      <br /><br />

      <button onClick={generateLink} style={{ padding: '10px 20px' }}>
        Generate Link
      </button>

      {link && (
        <div style={{ marginTop: '20px' }}>
          <p>Your Link:</p>
          <a href={link} target="_blank">{link}</a>
        </div>
      )}
    </main>
  )
}
