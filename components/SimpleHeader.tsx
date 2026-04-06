import Link from "next/link"
import Image from "next/image"

export default function SimpleHeader() {
  return (
    <header className="w-full border-b bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/BayarLink Logo 01.svg"
            alt="BayarLink"
            width={32}
            height={32}
          />
          <span className="font-semibold text-slate-900">
            BayarLink
          </span>
        </Link>

        {/* Right Button */}
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          ← Back to Home
        </Link>

      </div>
    </header>
  )
}
