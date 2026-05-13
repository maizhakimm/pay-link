'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { MapPin, ShoppingBag, Soup, Wrench } from 'lucide-react'

export default function BazarBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')
  const activeTab = pathname === '/bazar'
    ? (tab === 'food' || tab === 'services' || tab === 'shop' || tab === 'nearby' ? tab : 'home')
    : null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:px-2 md:py-2">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 border-t border-slate-200 bg-white p-1 text-[10px] font-semibold text-slate-600 shadow-lg md:max-w-lg md:rounded-2xl md:border">
          <Link href="/bazar?tab=food" className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'food' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Soup className="h-6 w-6" strokeWidth={2} />
            <span>Food</span>
          </Link>
          <Link href="/bazar?tab=services" className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'services' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <Wrench className="h-6 w-6" strokeWidth={2} />
            <span>Services</span>
          </Link>
          <Link href="/bazar" className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'home' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`} aria-label="Home">
            <img src="/Home-Logo-BazarLink.svg" alt="Bazar Home" className={`h-6 w-6 object-contain ${activeTab === 'home' ? 'brightness-0 invert' : ''}`} />
          </Link>
          <Link href="/bazar?tab=shop" className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'shop' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <ShoppingBag className="h-6 w-6" strokeWidth={2} />
            <span>Shop</span>
          </Link>
          <Link href="/bazar?tab=nearby" className={`flex min-h-[52px] w-full flex-col items-center justify-center rounded-xl px-2 py-1 ${activeTab === 'nearby' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
            <MapPin className="h-6 w-6" strokeWidth={2} />
            <span>Nearby</span>
          </Link>
        </div>
      </nav>
  )
}
