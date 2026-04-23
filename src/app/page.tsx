export default function LandingPage() {
  return (
    <main className="w-full">

      {/* HERO */}
      <section className="px-6 py-20 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Tak Perlu Ada Kedai Pun — Dah Boleh Berniaga dari Rumah
          </h1>

          <p className="mt-4 text-gray-600">
            Customer sebenarnya dah ready nak order. Tapi kalau masih guna cara lama, memang susah nak nampak hasil.
          </p>

          <p className="mt-3 text-gray-500">
            Jual kek, nasi lemak, spaghetti, kuih, kopi — semua boleh.  
            Zaman sekarang… masih nak suruh customer PM untuk order?
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
              Cuba Free Sekarang
            </button>

            <button className="border px-6 py-3 rounded-xl font-semibold">
              Bantuan Setup
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <img
            src="/seller-hero.jpg"
            alt="Seller"
            className="rounded-2xl shadow-lg"
          />
        </div>
      </section>


      {/* PROBLEM */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Customer ramai… tapi duit tak nampak?
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mt-10">
            {[
              "Ramai PM… tapi order tak jadi",
              "Customer nak order… tapi tak bayar-bayar",
              "Setiap order kena layan satu-satu",
              "Order masuk… tapi susah nak track",
            ].map((text, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
                <p className="font-medium">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SOLUTION */}
      <section className="py-20 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <img src="/flow.png" className="rounded-xl" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold">
            BayarLink bantu susun semua — dari order sampai bayaran
          </h2>

          <div className="mt-6 space-y-4">
            <p>✔ Customer pilih menu sendiri</p>
            <p>✔ Customer terus bayar ikut cara dia suka</p>
            <p>✔ Order masuk tanpa perlu layan satu-satu</p>
          </div>

          <p className="mt-6 font-semibold">
            Anda fokus jual. Sistem bantu urus.
          </p>
        </div>
      </section>


      {/* WHO */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-xl">Siapa sesuai guna BayarLink?</h3>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>✔ Peniaga makanan dari rumah</li>
            <li>✔ Jual melalui WhatsApp / IG / TikTok</li>
            <li>✔ Ambil order manual</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-xl">Sesuai ke dengan bisnes saya?</h3>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>✔ Delivery ikut jarak</li>
            <li>✔ Time slot</li>
            <li>✔ Pre-order</li>
            <li>✔ Banyak pilihan bayaran</li>
          </ul>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Macam mana nak guna BayarLink?
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mt-10">
            {["Daftar", "Setup Produk", "Share Link", "Customer Order"].map((step, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FREE CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold">Mulakan Sekarang. ZERO Kos.</h2>
        <p className="mt-4 text-gray-600">
          Tak perlu fikir pakej. Mulakan dulu.
        </p>

        <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold">
          Cuba Free Sekarang
        </button>
      </section>


      {/* SETUP HELP */}
      <section className="bg-green-50 py-16 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold">
              Tak pandai setup? Kami bantu sampai siap.
            </h2>

            <p className="mt-4 text-gray-600">
              Team kami bantu setup kedai anda dari A sampai Z.
            </p>

            <button className="mt-6 bg-green-600 text-white px-6 py-3 rounded-xl">
              WhatsApp: BANTU SAYA
            </button>
          </div>

          <img src="/support.png" />
        </div>
      </section>


      {/* FEATURES */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center">
          Semua yang anda perlukan
        </h2>

        <div className="grid md:grid-cols-4 gap-4 mt-10 text-sm">
          {[
            "Secure Payment",
            "Dashboard",
            "Order Tracking",
            "Time Slot",
            "Add-On",
            "Delivery",
            "Opening Hours",
            "Preorder",
            "Multi Payment",
            "Mobile Friendly",
          ].map((f, i) => (
            <div key={i} className="border rounded-lg p-3 text-center">
              {f}
            </div>
          ))}
        </div>
      </section>


      {/* TESTIMONIAL */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-2xl font-bold">
            Apa kata seller
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              "Dulu pening track order. Sekarang semua nampak jelas.",
              "Customer lebih senang order dan bayar.",
              "Nampak lebih kemas walaupun jual dari rumah.",
            ].map((t, i) => (
              <div key={i} className="bg-white p-5 rounded-xl shadow-sm">
                <p>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold">
          Mulakan Kedai Anda Hari Ini
        </h2>

        <button className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-xl">
          Daftar Sekarang
        </button>
      </section>


      {/* FOOTER */}
      <footer className="bg-black text-white py-10 text-center text-sm">
        BayarLink © 2026 — Mudahkan seller kecil berniaga
      </footer>

    </main>
  )
}
