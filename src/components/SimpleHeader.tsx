import Link from "next/link"
import Image from "next/image"

export default function SimpleHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/BayarLink-Logo-01.svg"
            alt="BayarLink"
            width={34}
            height={34}
            className="h-8 w-auto"
            priority
          />
          <span className="text-base font-semibold text-slate-900">BayarLink</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  )
}
