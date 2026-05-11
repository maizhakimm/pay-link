'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotMessageSquare, ShoppingBag, Soup, Store, Wrench } from 'lucide-react'
import { useState } from 'react'

export default function ExploreBottomNav() {
  const pathname = usePathname()
  const [showSupport, setShowSupport] = useState(false)

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 px-0 pb-0 pt-0 md:px-2 md:py-2">
        <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-none border-t border-slate-200 bg-white/95 p-1 text-[10px] font-semibold text-slate-600 shadow-lg backdrop-blur md:max-w-lg md:rounded-2xl md:border md:p-1">
          <Link href="/explore" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/explore' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Soup className="h-6 w-6" strokeWidth={2} />
            <span>Food</span>
          </Link>
          <Link href="/explore/services" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/explore/services' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Wrench className="h-6 w-6" strokeWidth={2} />
            <span>Services</span>
          </Link>
          <Link href="/explore/shop" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/explore/shop' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
            <span>Shop</span>
          </Link>
          <Link href="/explore/seller" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/explore/seller' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Store className="h-6 w-6" strokeWidth={2} />
            <span>Seller</span>
          </Link>
          <button onClick={() => setShowSupport(true)} className="flex flex-col items-center rounded-xl px-2 py-1">
            <BotMessageSquare className="h-6 w-6" strokeWidth={2} />
            <span>Support</span>
          </button>
        </div>
      </nav>

      {showSupport ? (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setShowSupport(false)}>
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-slate-900">Ada sebarang aduan?</h3>
            <p className="mt-1 text-sm text-slate-600">Laporkan sebarang isu kepada kami melalui WhatsApp.</p>
            <div className="mt-5 flex gap-2">
              <a href="https://wa.me/60163352087?text=Hai%20BayarLink%20Support!" target="_blank" rel="noreferrer" className="rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white">WhatsApp Kami</a>
              <button onClick={() => setShowSupport(false)} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Tutup</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
