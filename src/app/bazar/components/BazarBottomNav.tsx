'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ShoppingBag, Soup, Store, Wrench } from 'lucide-react'

export default function BazarBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

  const isHomeActive = pathname === '/bazar' && (!tab || tab === 'home')
  const isFoodActive = pathname === '/bazar' && tab === 'food'
  const isNearbyActive = pathname === '/bazar' && tab === 'nearby'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-0 pb-0 pt-0 md:px-2 md:py-2">
      <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-none border-t border-slate-200 bg-white/95 p-1 text-[10px] font-semibold text-slate-600 shadow-lg backdrop-blur md:max-w-lg md:rounded-2xl md:border md:p-1">
        <Link href="/bazar?tab=food" className={`flex flex-col items-center rounded-xl px-2 py-1 ${isFoodActive ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
          <Soup className="h-6 w-6" strokeWidth={2} />
          <span>Food</span>
        </Link>
        <Link href="/bazar/services" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/bazar/services' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
          <Wrench className="h-6 w-6" strokeWidth={2} />
          <span>Services</span>
        </Link>
        <Link href="/bazar?tab=home" className={`flex flex-col items-center rounded-xl px-2 py-1 ${isHomeActive ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
          <img src="/Home-Logo-BazarLink.svg" alt="Home BazarLink" className={`h-6 w-6 ${isHomeActive ? 'brightness-0 invert' : ''}`} />
          <span>Home</span>
        </Link>
        <Link href="/bazar/shop" className={`flex flex-col items-center rounded-xl px-2 py-1 ${pathname === '/bazar/shop' ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
          <ShoppingBag className="h-6 w-6" strokeWidth={2} />
          <span>Shop</span>
        </Link>
        <Link href="/bazar?tab=nearby" className={`flex flex-col items-center rounded-xl px-2 py-1 ${isNearbyActive ? 'bg-[#2563EB] text-white shadow-sm' : ''}`}>
          <Store className="h-6 w-6" strokeWidth={2} />
          <span>Nearby</span>
        </Link>
      </div>
    </nav>
  )
}
