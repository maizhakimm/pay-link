'use client'

import { Suspense } from 'react'
import BazarBottomNav from '../components/BazarBottomNav'
import { FormEvent, useState } from 'react'

export default function ExploreServicesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [serviceType, setServiceType] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const subject = 'BayarLink Services Request'
    const body = [
      'BayarLink Services Request',
      '',
      `Nama: ${name || '-'}`,
      `Email address: ${email || '-'}`,
      `No. WhatsApp: ${whatsapp || '-'}`,
      `Service apa yang nak disenaraikan: ${serviceType || '-'}`,
    ].join('\n')
    window.location.href = `mailto:bayarlink.hq@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <main className="min-h-screen bg-white p-6">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Coming Soon</h1>
        <p className="mt-2 text-sm text-slate-600">Buat masa ini BayarLink hanya menyenaraikan barangan masakan dan makanan. Jika anda berminat untuk menyertai dan menyenaraikan servis dan perkhidmatan anda sila isi borang di bawah. Jika ada permintaan yang tinggi kami akan mempercepatkan features kategori ini secepat mungkin.</p>
        <div className="mt-4 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="No. WhatsApp" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <textarea value={serviceType} onChange={(e) => setServiceType(e.target.value)} placeholder="Service apa yang nak disenaraikan" className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" rows={3} />
        </div>
        <button type="submit" className="mt-5 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Saya berminat</button>
      </form>
      <Suspense fallback={null}><BazarBottomNav /></Suspense>
    </main>
  )
}
