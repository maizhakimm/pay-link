import Link from 'next/link'

export default function ExploreServicesPage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Servis kawasan akan datang</h1>
        <p className="mt-2 text-sm text-slate-600">Kami sedang membuka servis komuniti seperti runner, printing, laundry dan lain-lain.</p>
        <button className="mt-5 w-full rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Saya berminat</button>
        <Link href="/explore" className="mt-3 inline-flex text-sm font-semibold text-slate-600">Kembali ke Explore</Link>
      </div>
    </main>
  )
}
