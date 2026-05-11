'use client'

import BazarBottomNav from '../components/BazarBottomNav'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function BazarSellerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [area, setArea] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const subject = 'Permohonan Kawasan BAZAR BayarLink'
    const body = [
      'Permohonan Kawasan BAZAR BayarLink',
      '',
      `Nama: ${name || '-'}`,
      `Email: ${email || '-'}`,
      `No. WhatsApp: ${whatsapp || '-'}`,
      `Kawasan: ${area || '-'}`,
    ].join('\n')
    window.location.href = `mailto:bayarlink.hq@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Nak daftar sebagai Seller?</h1>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-600">Daftar dan jual menggunakan BayarLink secara PERCUMA. Dapatkan tapak anda di BAZAR BayarLink dan meriahkan lagi Bazar di kawasan anda.\n\nBAZAR kini dalam tempoh Beta / Percubaan dan TIADA sebarang sewa atau yuran dikenakan. BAZAR yang dibuka buat masa ini hanya untuk kawasan SHAH ALAM sahaja. Jika anda ingin mohon untuk kawasan selain Shah Alam sila mohon sekarang. Sekiranya ada permintaan yang tinggi kami akan mempercepatkan proses pembukaan Bazar di kawasan tersebut secepat mungkin.</p>
        <Link href="https://www.bayarlink.my/login" className="mt-5 inline-flex w-full justify-center rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Daftar Seller</Link>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="No. WhatsApp" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Kawasan" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <button type="submit" className="w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Mohon Kawasan</button>
        </form>
      </div>
      <BazarBottomNav />
    </main>
  )
}
