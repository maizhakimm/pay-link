export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HEADER */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">GoBayar</h1>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm text-gray-600 hover:text-black">
              Login
            </a>
            <a
              href="/signup"
              className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:opacity-90"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <div className="inline-block bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-full mb-4">
            Beta
          </div>

          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Jual di WhatsApp <br />
            <span className="text-indigo-600">hanya dengan 1 link</span>
          </h1>

          <p className="text-gray-600 mb-6">
            Mudah untuk anda, mudah untuk customer.  
            Tak perlu pening urus PM, payment dan order lagi.
          </p>

          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href="/signup"
              className="bg-black text-white px-5 py-3 rounded-lg font-medium"
            >
              Start Free
            </a>

            <a
              href="/shop/maiz-kitchen"
              target="_blank"
              className="border px-5 py-3 rounded-lg font-medium"
            >
              View Demo Shop
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            ✔ Setup kurang 5 minit &nbsp; ✔ Mobile friendly &nbsp; ✔ Terus boleh jual
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 border-t">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            Masalah biasa seller
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <Card
              title="Customer PM satu-satu"
              text="Order bercampur dengan chat, susah nak urus dengan kemas."
            />
            <Card
              title="Susah check payment"
              text="Setiap kali bayar, kena buka bank dan semak satu-satu."
            />
            <Card
              title="Track order serabut"
              text="Order bersepah dalam PM, susah nak cari semula."
            />
            <Card
              title="Risau double order"
              text="Stock tak update, mudah terlebih jual tanpa sedar."
            />
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">
            GoBayar selesaikan semua
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            <Card title="1 link semua produk" text="Share sekali, terus boleh order." />
            <Card title="Auto collect order" text="Tak perlu check PM satu-satu." />
            <Card title="Payment auto track" text="Tak perlu check bank manual." />
            <Card title="Stock auto update" text="Elak oversell dan double order." />
            <Card title="Multi payment" text="FPX, Kad & PayLater tersedia." />
            <Card title="Semua dalam 1 sistem" text="Order, payment & stock semua sync." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-lg mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">
            Tak payah pening lagi.
            <br />
            Start jual cara lebih smart.
          </h2>

          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            <a
              href="/signup"
              className="bg-black text-white px-6 py-3 rounded-lg font-medium"
            >
              Sign Up Free
            </a>

            <a
              href="/login"
              className="border px-6 py-3 rounded-lg font-medium"
            >
              Login
            </a>
          </div>
        </div>
      </section>

      {/* TARGET */}
      <section className="py-16 border-t text-center">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-xl font-bold mb-3">GoBayar ni untuk siapa?</h2>
          <p className="text-gray-600">
            Sesuai untuk peniaga online kecil dan sederhana.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 border-t text-center text-sm text-gray-500">
        <p>GoBayar</p>
        <p>NEUGENS SOLUTION</p>
        <p>SSM: [MASUKKAN NO PENDAFTARAN]</p>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a
        href="https://wa.me/60163352087"
        target="_blank"
        className="fixed bottom-5 right-5 bg-green-500 text-white w-14 h-14 flex items-center justify-center rounded-full shadow-lg text-xl"
      >
        💬
      </a>
    </main>
  )
}

/* CARD COMPONENT */
function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-5 border rounded-xl bg-white hover:shadow-sm transition">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{text}</p>
    </div>
  )
}
