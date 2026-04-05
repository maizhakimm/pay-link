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
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
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

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Jual dan promote perniagaan anda di mana2 platform dengan
              BayarLink. Lebih mudah nak jual dan lebih mudah customer nak
              bayar. Terima pelbagai jenis cara bayaran. Mulakan dengan ZERO
              kos!
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Start Free
              </a>
              <a
                href="/shop/maiz-kitchen"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Demo Shop
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
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

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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

              <div className="mt-6 space-y-2 text-sm text-slate-700">
                <p>✔ Semua dalam Pro</p>
                <p>✔ Multi staff</p>
                <p>✔ Advanced automation</p>
                <p>✔ Inventory tracking</p>
              </div>

              <button
                type="button"
                disabled
                className="mt-8 block w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-center font-semibold text-slate-600 opacity-80"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Tiada caj setup. Tiada kontrak. Hanya bayar bila anda dah berjaya
            menjual.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Soalan yang selalu ditanya
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Ini antara soalan paling biasa sebelum orang mula guna BayarLink.
            </p>
          </div>

          <div className="mt-12 grid gap-4">
            <FaqCard
              question="Perlu install app ke?"
              answer="Tak perlu. BayarLink ialah sistem berasaskan web, jadi anda boleh terus guna dari phone atau laptop."
            />
            <FaqCard
              question="Berapa lama nak setup shop?"
              answer="Setup asas boleh siap dengan sangat cepat. Seller hanya perlu masukkan produk dan share link shop."
            />
            <FaqCard
              question="Sesuai untuk bisnes kecil ke?"
              answer="Ya. Memang sesuai untuk home-based seller, agent, dropshipper, peniaga makanan, dan seller WhatsApp."
            />
            <FaqCard
              question="Customer order macam mana?"
              answer="Customer buka link shop anda, pilih produk yang aktif, kemudian terus buat order dan pembayaran dengan flow yang lebih kemas."
            />
            <FaqCard
              question="Kalau saya jual servis pun boleh?"
              answer="Boleh. BayarLink bukan untuk produk sahaja, malah sesuai juga untuk seller yang jual servis atau pakej."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(124,58,237,0.12),_transparent_35%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Tak payah pening lagi.
            <br />
            Start jual cara lebih bijak.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Buat shop link sendiri, share terus di WhatsApp, dan bagi customer
            order dengan cara yang lebih mudah.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={primaryCtaHref}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Sign Up Free
            </a>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Image
              src="/BayarLink-Logo-01.svg"
              alt="BayarLink Logo"
              width={150}
              height={40}
              className="h-8 w-auto opacity-90"
            />
          </div>

          <p className="mt-5 text-[11px] text-slate-400">
            Copyright Reserved @2026 BayarLink by Neugens Solution
            (202503301282 (AS0504872-V))
          </p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/60163352087"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition hover:scale-105"
      >
        <WhatsAppIcon />
      </a>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function SolutionCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

function MiniPill({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      {text}
    </div>
  );
}

function DarkStat({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
      <p className="text-lg font-bold">{title}</p>
      <p className="mt-1 text-xs text-white/65">{subtitle}</p>
    </div>
  );
}

function FaqCard({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">{question}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.414 0l-3.6-3.6a1 1 0 111.414-1.42l2.893 2.894 6.493-6.494a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M20.52 3.48A11.86 11.86 0 0012.07 0C5.48 0 .12 5.36.12 11.95c0 2.1.55 4.16 1.6 5.98L0 24l6.24-1.63a11.9 11.9 0 005.83 1.49h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.5-8.43zm-8.45 18.36h-.01a9.9 9.9 0 01-5.04-1.38l-.36-.21-3.7.97.99-3.61-.24-.37a9.86 9.86 0 01-1.52-5.29c0-5.45 4.44-9.89 9.9-9.89 2.64 0 5.11 1.03 6.98 2.9a9.82 9.82 0 012.9 6.99c0 5.45-4.44 9.89-9.9 9.89zm5.43-7.42c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.22-.64.08-.3-.15-1.25-.46-2.38-1.46-.88-.78-1.48-1.74-1.65-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.08 4.5.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.03-1.41.25-.69.25-1.28.17-1.41-.08-.12-.27-.2-.57-.35z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M8 10h8M8 14h5m7-2a8 8 0 11-3.03-6.27A8 8 0 0119 12z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M3 8.5A2.5 2.5 0 015.5 6H18a3 3 0 013 3v7a2 2 0 01-2 2H5.5A2.5 2.5 0 013 15.5v-7zm0 1.5h18M16.5 13h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v18m8-13.5l-8 4.5-8-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M10 13a5 5 0 007.07 0l2.83-2.83a5 5 0 10-7.07-7.07L11.5 4.43M14 11a5 5 0 01-7.07 0L4.1 8.17A5 5 0 1111.17 1.1L12.5 2.43"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FormIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M8 6h12M8 12h12M8 18h12M3 6h.01M3 12h.01M3 18h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9zm0 3.5h18M7 15h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 19V5m5 14V9m5 10v-6m5 6V7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M8 3h8a2 2 0 012 2v14a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2zm4 15h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
      <path
        d="M4 5h16v6H4V5zm0 8h7v6H4v-6zm9 0h7v6h-7v-6z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
