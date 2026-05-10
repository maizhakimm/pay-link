import ExploreBottomNav from '../components/ExploreBottomNav'
import Link from 'next/link'

export default function ExploreSellerPage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Nak daftar sebagai Seller?</h1>
        <p className="mt-2 text-sm text-slate-600">Daftar dan jual menggunakan BayarLink dan senaraikan produk dan servis anda di marketplace.</p>
        <Link href="https://www.bayarlink.my/login" className="mt-5 inline-flex w-full justify-center rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">Daftar Seller</Link>
        <Link href="/explore" className="mt-3 inline-flex text-sm font-semibold text-slate-600">Kembali ke Explore</Link>
      </div>
      <ExploreBottomNav />
    </main>
  )
}
