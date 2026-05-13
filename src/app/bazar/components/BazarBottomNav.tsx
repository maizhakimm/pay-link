'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, ShoppingBag, Soup, Wrench } from 'lucide-react'

export default function BazarBottomNav() {
  const pathname = usePathname()
  const tab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null
  const activeTab = pathname === '/bazar'
    ? (tab === 'food' || tab === 'services' || tab === 'shop' || tab === 'nearby' ? tab : 'home')
    : null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-0 pb-0 pt-0 md:px-2 md:py-2">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-none border-t border-slate-200 bg-white/95 p-1 text-[10px] font-semibold text-slate-600 shadow-lg backdrop-blur md:max-w-lg md:rounded-2xl md:border md:p-1">
          <Link href="/bazar?tab=food" className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeTab === 'food' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Soup className="h-6 w-6" strokeWidth={2} />
            <span>Food</span>
          </Link>
          <Link href="/bazar?tab=services" className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeTab === 'services' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Wrench className="h-6 w-6" strokeWidth={2} />
            <span>Services</span>
          </Link>
          <Link href="/bazar" className={`flex flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'home' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`} aria-label="Home">
            <img src="/Home-Logo-BazarLink.svg" alt="Bazar Home" className={`h-6 w-6 object-contain ${activeTab === 'home' ? 'brightness-0 invert' : ''}`} />
          </Link>
          <Link href="/bazar?tab=shop" className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeTab === 'shop' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
            <span>Shop</span>
          </Link>
          <Link href="/bazar?tab=nearby" className={`flex flex-col items-center rounded-xl px-2 py-1 ${activeTab === 'nearby' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <MapPin className="h-6 w-6" strokeWidth={2} />
            <span>Nearby</span>
          </Link>
        </div>
      </nav>
  )
}
