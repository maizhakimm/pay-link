import Image from "next/image";

export default function HomePage() {
  const primaryCtaHref = "/login";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <Image
              src="/BayarLink-Logo-01.svg"
              alt="BayarLink Logo"
              width={160}
              height={40}
              priority
              className="h-9 w-auto"
            />
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Login
            </a>
            <a
              href={primaryCtaHref}
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.14),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.10),_transparent_28%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="relative text-center lg:text-left">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 lg:mx-0">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
              Beta
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Mudah Jual,
              <br />
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Mudah Bayar!
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg lg:mx-0">
              Jual dan promote perniagaan anda di mana2 platform dengan
              BayarLink. Lebih mudah nak jual dan lebih mudah customer nak
              bayar. Terima pelbagai jenis cara bayaran. Mulakan dengan ZERO
              kos!
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href={primaryCtaHref}
                className="inline-flex w-auto items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Start Free
              </a>
              <a
                href="/s/dana-store"
                className="inline-flex w-auto items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Demo Shop
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-slate-500 lg:justify-start">
              <div className="inline-flex items-center gap-2">
                <CheckIcon />
                WhatsApp
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckIcon />
                TikTok
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckIcon />
                Telegram
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckIcon />
                Facebook
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckIcon />
                Instagram
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-10 right-10 h-32 w-32 rounded-full bg-violet-300/30 blur-3xl" />
            <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-blue-300/30 blur-3xl" />

            <div className="relative">
              <Image
                src="/Hero Image 01.png"
                alt="BayarLink Preview"
                width={700}
                height={1400}
                priority
                className="mx-auto w-[240px] object-contain drop-shadow-[0_30px_80px_rgba(0,0,0,0.25)] scale-[1.08] md:w-[280px] lg:w-[320px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="border-t border-slate-200 bg-slate-50/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Masalah
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Makin banyak order makin pening?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Bila dah banyak order memang akan pening kalau masih lagi guna
              cara manual..
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              icon={<ChatIcon />}
              title="Customer PM satu-satu"
              description="Order bercampur dengan chat. Susah nak urus customer, item, dan confirmation dengan kemas."
            />
            <FeatureCard
              icon={<WalletIcon />}
              title="Susah check payment"
              description="Setiap kali customer bayar, kena semak bank satu-satu. Lambat dan mudah terlepas pandang."
            />
            <FeatureCard
              icon={<BoxIcon />}
              title="Track order serabut"
              description="Bila order dah banyak, susah nak tahu siapa dah order, siapa belum bayar, dan siapa dah confirm."
            />
            <FeatureCard
              icon={<AlertIcon />}
              title="Risau double order"
              description="Bila stok tak update dengan betul, seller boleh terjual lebih tanpa sedar."
            />
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Penyelesaian
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Share 1 link BayarLink!
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Satu tempat untuk susun produk/menu, kumpul order, dan bagi
              customer order dengan lebih mudah, serta banyak pilihan cara
              bayaran.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <SolutionCard
              icon={<LinkIcon />}
              title="1 link semua produk"
              description="Share satu link sahaja untuk customer tengok semua produk aktif anda."
            />
            <SolutionCard
              icon={<FormIcon />}
              title="Auto collect order"
              description="Order masuk dengan flow lebih kemas tanpa perlu check PM satu-satu."
            />
            <SolutionCard
              icon={<PaymentIcon />}
              title="Payment lebih jelas"
              description="Mudahkan seller urus langkah pembayaran dan kurangkan kerja manual."
            />
            <SolutionCard
              icon={<StockIcon />}
              title="Stock auto update"
              description="Bantu elak oversell dan bagi seller lebih yakin urus produk yang aktif."
            />
            <SolutionCard
              icon={<PhoneIcon />}
              title="Tak perlu laptop atau PC"
              description="Sesuai untuk seller yang urus bisnes sepenuhnya dari phone."
            />
            <SolutionCard
              icon={<SystemIcon />}
              title="Semua dalam 1 sistem"
              description="Produk, order, dan aliran jualan disusun dalam satu tempat yang lebih kemas."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Semua dalam satu sistem
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Bukan sekadar link. BayarLink bantu anda urus bisnes dengan lebih tersusun dan profesional.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              icon={<SystemIcon />}
              title="Dashboard Analytics"
              description="Lihat total order, paid, pending dan revenue dalam satu dashboard."
            />

            <FeatureCard
              icon={<ChatIcon />}
              title="Auto WhatsApp Message"
              description="Message customer terus siap dengan order details. Tak perlu copy paste."
            />

            <FeatureCard
              icon={<FormIcon />}
              title="Auto Order Tracking"
              description="Tahu siapa dah bayar, siapa pending, dan siapa dah complete."
            />

            <FeatureCard
              icon={<StockIcon />}
              title="Stock Control"
              description="Auto update stock untuk elak oversell dan double order."
            />

            <FeatureCard
              icon={<PhoneIcon />}
              title="Mobile First System"
              description="Urus semua dari phone tanpa perlu laptop."
            />

            <FeatureCard
              icon={<LinkIcon />}
              title="Smart Shop Link"
              description="Satu link untuk semua produk — nampak lebih professional."
            />
          </div>
        </div>
      </section>

      {/* Who is it for */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              Sesuai untuk
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              BayarLink ni untuk siapa?
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Sangat sesuai untuk peniaga online kecil dan sederhana yang nak
              urus order dengan lebih mudah, jimat masa, nampak lebih gempak,
              dan mudahkan urusan customer.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MiniPill text="Home-based seller" />
              <MiniPill text="Penjual makanan" />
              <MiniPill text="Agent / dropshipper" />
              <MiniPill text="Jual servis dan perkhidmatan" />
              <MiniPill text="Online seller" />
              <MiniPill text="Seller part-time" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-8 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">
              Perlu ke?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Bila dapat urus order dengan baik,
              <br />
              customer lebih yakin.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
              Dengan 1 link shop yang lebih tersusun, customer lebih senang nak
              pilih dan order, dan lebih mudah nak bayar dengan pelbagai pilihan
              bayaran.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <DarkStat title="Lebih terurus" subtitle="berbanding PM manual" />
              <DarkStat title="Lebih mudah" subtitle="untuk customer order" />
              <DarkStat title="Lebih cepat" subtitle="untuk seller urus order" />
              <DarkStat title="Lebih yakin" subtitle="untuk scale bisnes" />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-t border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-600">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
              Tiada bayaran. Mula dengan ZERO Kos!
            </h2>
            <p className="mt-4 text-slate-600">
              Pilih plan yang sesuai dengan tahap bisnes anda.
              (Buat masa ini hanya ada pakej Basic)
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Basic (Beta)</h3>
              <p className="mt-2 text-sm text-slate-500">
                Sesuai untuk peniaga baru, kecil dan sederhana
              </p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold">RM0</span>
                <span className="text-slate-500">/month</span>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Transaction fee standard:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>• FPX: RM1.50</li>
                <li>• QR: 2.5%</li>
                <li>• Card: RM1 + 2.5%</li>
                <li>•T+1 payout to merchant account</li>
              </ul>

              <div className="mt-6 space-y-2 text-sm text-slate-700">
                <p>✔ Shop link sendiri</p>
                <p>✔ Unlimited produk</p>
                <p>✔ WhatsApp order flow</p>
              </div>

              <a
                href={primaryCtaHref}
                className="mt-8 block rounded-xl bg-slate-900 py-3 text-center font-semibold text-white transition hover:bg-slate-800"
              >
                Get Started
              </a>
            </div>

            <div className="relative scale-[1.03] rounded-3xl border-2 border-violet-600 bg-white p-6 shadow-xl">
              <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-3xl bg-violet-600 px-3 py-1 text-xs text-white">
                Popular
              </div>

              <h3 className="text-xl font-bold text-slate-900">Pro</h3>
              <p className="mt-2 text-sm text-slate-500">
                Sesuai untuk peniaga aktif dan nak scale up
              </p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold">RM19</span>
                <span className="text-slate-500">/month</span>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Lower transaction fee:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>• FPX: RM1.30</li>
                <li>• QR: 2.2%</li>
                <li>• Card: RM1 + 2.2%</li>
              </ul>

              <div className="mt-6 space-y-2 text-sm text-slate-700">
                <p>✔ Semua dalam Free</p>
                <p>✔ Remove watermark</p>
                <p>✔ Analytics asas</p>
                <p>✔ Auto WhatsApp summary</p>
              </div>

              <button
                type="button"
                disabled
                className="mt-8 block w-full cursor-not-allowed rounded-xl bg-violet-200 py-3 text-center font-semibold text-violet-700 opacity-80"
              >
                Coming Soon
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Growth</h3>
              <p className="mt-2 text-sm text-slate-500">
                Sesuai untuk nak scale up bisnes
              </p>

              <div className="mt-6">
                <span className="text-4xl font-extrabold">RM49</span>
                <span className="text-slate-500">/month</span>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Lowest transaction fee:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                <li>• FPX: RM1.10</li>
                <li>• QR: 1.9%</li>
                <li>• Card: RM1 + 1.9%</li>
              </ul>

              <div className="mt-6 space-y-2
