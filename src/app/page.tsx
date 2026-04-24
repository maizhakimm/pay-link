export default function LandingPage() {
  const problems = [
    "Ramai PM… tapi order tak jadi",
    "Customer nak order… tapi tak bayar-bayar",
    "Setiap order kena layan satu-satu",
    "Order masuk… tapi susah nak track",
  ]

  const solutions = [
    {
      title: "Customer pilih menu sendiri",
      desc: "Kurang soalan berulang dan kurang chat yang memenatkan.",
    },
    {
      title: "Customer terus bayar ikut cara dia suka",
      desc: "Lagi mudah checkout bila pilihan bayaran lebih mesra pelanggan.",
    },
    {
      title: "Order masuk tanpa perlu layan satu-satu",
      desc: "Seller boleh fokus pada produk, delivery, dan jualan.",
    },
  ];

  const audience = [
    "Peniaga makanan dari rumah",
    "Jual melalui WhatsApp / IG / TikTok / Facebook",
    "Masih ambil order secara manual",
    "Nak nampak lebih tersusun dan yakin",
  ];

  const suitability = [
    "Delivery ikut jarak",
    "Time slot delivery / pickup",
    "Boleh pre-order",
    "Pelbagai pilihan bayaran",
    "Sesuai untuk seller kecil & home-based",
  ];

  const shifts = [
    "Customer lebih suka proses order yang cepat dan terus jalan",
    "Customer lebih yakin bila ada banyak pilihan bayaran",
    "Customer kurang sabar tunggu reply manual terlalu lama",
    "Order online sekarang dah jadi kebiasaan, bukan lagi luar biasa",
  ];

  const steps = [
    {
      no: "01",
      title: "Daftar",
      desc: "Buka akaun anda dengan cepat dan mudah.",
    },
    {
      no: "02",
      title: "Setup Produk",
      desc: "Masukkan menu, gambar, harga, dan info asas kedai.",
    },
    {
      no: "03",
      title: "Share Link",
      desc: "WhatsApp, Telegram, IG, FB, atau TikTok.",
    },
    {
      no: "04",
      title: "Customer Order",
      desc: "Mereka pilih, isi maklumat, dan buat bayaran.",
    },
  ];

  const features = [
    "Secure Payment",
    "Dashboard Seller",
    "Order Tracking",
    "Time Slot",
    "Add-On Product",
    "Delivery by Distance",
    "Fixed Delivery Rate",
    "Free Delivery",
    "Pay Rider Separately",
    "Opening Hours",
    "Temporary Close Notice",
    "Customer Notes",
    "Promo Note",
    "Product Images",
    "Share Store Link",
    "Mobile Friendly",
    "Multi Payment Options",
    "Simple Product Setup",
    "Pre-order Support",
    "Delivery / Pickup Flow",
  ];

  const testimonials = [
    {
      name: "Aina",
      role: "Dessert Homemade",
      quote:
        "Dulu saya pening nak track order dalam WhatsApp. Sekarang semuanya nampak lebih kemas dan jelas.",
    },
    {
      name: "Farah",
      role: "Lunch Delivery",
      quote:
        "Customer lebih senang order dan bayar. Saya pun tak perlu layan PM satu-satu sepanjang masa.",
    },
    {
      name: "Lina",
      role: "Kek & Preorder Box",
      quote:
        "Saya suka sebab nampak lebih tersusun dan lebih professional walaupun saya jual dari rumah saja.",
    },
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HERO */}
<section className="relative min-h-screen overflow-hidden">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/seller-hero.png')" }}
  />

  {/* Dark overlay (soft) */}
  <div className="absolute inset-0 bg-black/10" />

  {/* Left faded white overlay */}
  <div className="absolute inset-y-0 left-0 w-full md:w-[65%] bg-gradient-to-r from-white/95 via-white/85 to-white/0" />

  {/* Content */}
  <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-8">
    <div className="max-w-xl">
      
      {/* Badge (remain) */}
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Untuk seller makanan dari rumah
        </span>
        <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
          Mudah guna • Mesra mobile
        </span>
      </div>

      {/* Headline */}
      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
        Tak Perlu Buka Kedai, Dari Rumah Pun Boleh Berjaya!
      </h1>

      {/* Whisper line */}
      <p className="mt-2 text-sm italic text-slate-500">
        bisik Aishah Bakery dalam hati
      </p>

      {/* Main copy */}
      <p className="mt-6 text-lg leading-8 text-slate-700 md:text-xl">
        Bukan anda tak pandai berniaga.
        <br />
        Anda cuma perlukan cara yang betul!
      </p>

      {/* Supporting */}
      <p className="mt-4 text-base leading-7 text-slate-600">
        Jual kek, nasi lemak, spaghetti, kuih muih, kopi semua boleh.
        Customer sekarang dah biasa tekan dan bayar. Masih nak suruh mereka PM dulu baru order?
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Setup Kedai Saya
        </a>

        <a
          href="https://wa.me/"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-6 font-semibold text-slate-800 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white"
        >
          Saya Nak Bantuan Setup
        </a>
      </div>

      {/* Bottom points */}
      <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Sesuai untuk preorder
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Pelbagai pilihan bayaran
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Boleh urus delivery
        </div>
      </div>

    </div>
  </div>
{/* HERO */}
<section className="relative min-h-screen overflow-hidden">
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/seller-hero.png')" }}
  />

  <div className="absolute inset-0 bg-black/10" />
  <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/95 via-white/85 to-white/0 md:w-[65%]" />

  <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-8">
    <div className="max-w-xl">
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Untuk seller makanan dari rumah
        </span>
        <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm">
          Mudah guna • Mesra mobile
        </span>
      </div>

      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl">
        Tak Perlu Buka Kedai, Dari Rumah Pun Boleh Berjaya!
      </h1>

      <p className="mt-2 text-sm italic text-slate-500">
        bisik Aishah Bakery dalam hati
      </p>

      <p className="mt-6 text-lg leading-8 text-slate-700 md:text-xl">
        Bukan anda tak pandai berniaga.
        <br />
        Anda cuma perlukan cara yang betul!
      </p>

      <p className="mt-4 text-base leading-7 text-slate-600">
        Jual kek, nasi lemak, spaghetti, kuih muih, kopi semua boleh. Customer
        sekarang dah biasa tekan dan bayar. Masih nak suruh mereka PM dulu baru
        order?
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Setup Kedai Saya
        </a>

        <a
          href="https://wa.me/"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-6 font-semibold text-slate-800 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white"
        >
          Saya Nak Bantuan Setup
        </a>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Sesuai untuk preorder
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Pelbagai pilihan bayaran
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Boleh urus delivery
        </div>
      </div>
    </div>
  </div>
</section>

{/* PROBLEM */}
<section className="bg-slate-50 py-20">
  <div className="mx-auto max-w-7xl px-6 md:px-8">
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
        Masalah utama
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Order banyak, Tapi Untung Tak Nampak?
      </h2>

      <p className="mt-4 text-lg leading-8 text-slate-600">
        Penat tak hadap hari-hari? Sampai bila nak layan?
      </p>
    </div>

    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {[
        "Ramai PM… tapi order tak jadi",
        "Customer nak order… tapi tak bayar-bayar",
        "Setiap order kena layan satu-satu",
        "Order masuk… tapi susah nak track",
      ].map((item, i) => (
        <div
          key={i}
          className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-700">
            {i + 1}
          </div>

          <h3 className="text-lg font-semibold leading-7 text-slate-900">
            {item}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Ini yang selalu buat seller penat, lambat respon, dan susah nak
            nampak untung sebenar.
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* SOLUTION */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-8">
          <div className="relative">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    1. Customer pilih menu
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Tak perlu tanya satu-satu dalam chat.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="h-10 w-px bg-slate-200" />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    2. Customer terus buat bayaran
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Lebih mudah checkout ikut cara yang dia suka.
                  </p>
                </div>

                <div className="flex justify-center">
                  <div className="h-10 w-px bg-slate-200" />
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    3. Order masuk dengan lebih kemas
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    Seller boleh fokus pada jualan, bukan chat yang bersepah.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Penyelesaian
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              BayarLink bantu susun semua — dari order sampai bayaran
            </h2>
            <p className="mt-4 max-w-xl text-slate-600">
              Bukan sekadar link. BayarLink bantu jadikan proses jualan lebih
              mudah difahami, lebih kemas, dan lebih meyakinkan untuk seller dan
              customer.
            </p>

            <div className="mt-8 space-y-4">
              {solutions.map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-lg font-semibold text-slate-900">
              Anda fokus jual. BayarLink bantu urus.
            </p>
          </div>
        </div>
      </section>

      {/* AUDIENCE */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
                Siapa sesuai
              </p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Siapa sesuai guna BayarLink?
              </h2>
              <p className="mt-4 text-slate-600">
                Untuk peniaga makanan dari rumah yang mahu urus tempahan dengan
                lebih kemas dan lebih yakin.
              </p>

              <div className="mt-6 space-y-3">
                {audience.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <p className="text-sm text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {["Nasi Lemak", "Kek", "Kuih", "Dessert", "Kopi", "Preorder"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-8 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
                Practical fit
              </p>
              <h2 className="mt-3 text-2xl font-bold md:text-3xl">
                Sesuai ke dengan bisnes saya?
              </h2>
              <p className="mt-4 text-slate-300">
                Direka supaya seller kecil pun boleh mula dengan cara yang lebih
                praktikal.
              </p>

              <div className="mt-6 space-y-3">
                {suitability.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <p className="text-sm text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARKET SHIFT */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Kenapa sekarang
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Customer sekarang dah berubah cara beli
            </h2>
            <p className="mt-4 text-slate-600">
              Mereka nak proses yang cepat, mudah, dan terus jalan — bukan tunggu
              reply manual terlalu lama.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {shifts.map((item, i) => (
              <div
                key={i}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-4 h-10 w-10 rounded-2xl bg-blue-50" />
                <p className="text-base font-semibold leading-7 text-slate-900">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Cara guna
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Macam mana nak guna BayarLink?
            </h2>
            <p className="mt-4 text-slate-600">
              Simple, cepat, dan sesuai untuk seller yang tak mahu pening dengan
              benda teknikal.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.no}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-semibold tracking-[0.18em] text-blue-600">
                  {step.no}
                </p>
                <h3 className="mt-3 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE CTA */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-blue-200 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#ecfeff_100%)] p-8 shadow-[0_20px_60px_rgba(37,99,235,0.08)] md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Mula sekarang
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
              ZERO Kos untuk mula.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
              Tak perlu fikir pakej yang memeningkan. Mulakan dulu dengan cara
              yang lebih mudah dan lebih mesra seller kecil.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Cuba Free Sekarang
              </a>
              <a
                href="https://wa.me/"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                WhatsApp Kami
              </a>
            </div>

            <p className="mt-5 text-sm text-slate-500">
              Tak perlu fikir macam platform besar lain. BayarLink direka untuk
              seller kecil mula dengan lebih yakin.
            </p>
          </div>
        </div>
      </section>

      {/* SETUP HELP */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Bantuan setup
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Tak pandai setup? Roger je team kami.
            </h2>
            <p className="mt-4 max-w-xl text-slate-600">
              Kalau anda tak biasa guna sistem atau rasa susah nak mula, jangan
              risau. Team kami boleh bantu setup kedai anda dari A sampai Z.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Bantu setup kedai anda",
                "Bantu masukkan produk jika perlu",
                "Tunjuk cara guna langkah demi langkah",
                "Bantu sampai anda rasa yakin",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/?text=BANTU%20SAYA%20SETUP%20BAYARLINK"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-emerald-600 px-6 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              WhatsApp “BANTU SAYA SETUP BAYARLINK”
            </a>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] md:p-6">
            <div className="overflow-hidden rounded-2xl bg-slate-100">
              <img
                src="/support.png"
                alt="Bantuan setup BayarLink"
                className="h-[360px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Features
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Semua yang anda perlukan untuk mula dengan lebih kemas
            </h2>
            <p className="mt-4 text-slate-600">
              Direka untuk seller kecil yang mahu urus jualan dengan lebih mudah.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center text-sm font-medium text-slate-700 shadow-sm"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Testimoni
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Apa kata seller yang guna BayarLink
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                </div>

                <p className="mt-6 text-base leading-7 text-slate-600">
                  “{item.quote}”
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMOTIONAL CTA */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] bg-slate-900 px-8 py-14 text-center text-white md:px-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">
            Mindset shift
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Tak perlu tunggu bisnes besar baru nak guna sistem
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
            Berniaga dari rumah pun boleh berjaya. Yang penting, cara urus order
            dan bayaran kena lebih kemas dari awal.
          </p>

          <a
            href="/register"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            Mulakan Dengan BayarLink Hari Ini
          </a>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 md:grid-cols-2 md:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Ready nak mula?
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Daftar akaun anda dan mula urus tempahan dengan lebih tersusun
            </h2>
            <p className="mt-4 max-w-xl text-slate-600">
              Kalau perlukan bantuan, team kami sedia bantu. Pilih sahaja cara
              yang paling mudah untuk anda mula.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-3">
              <a
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700"
              >
                Daftar Sekarang
              </a>
              <a
                href="https://wa.me/"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                WhatsApp Kami
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Mesra mobile. Mudah digunakan. Sesuai untuk seller kecil dan
              bisnes dari rumah.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="max-w-sm">
            <div className="text-lg font-bold">BayarLink</div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              BayarLink membantu seller kecil urus tempahan dan bayaran dengan
              lebih mudah.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 md:grid-cols-5">
            <a href="#" className="hover:text-slate-900">
              Tentang
            </a>
            <a href="#" className="hover:text-slate-900">
              Cara Guna
            </a>
            <a href="#" className="hover:text-slate-900">
              Features
            </a>
            <a href="#" className="hover:text-slate-900">
              Hubungi Kami
            </a>
            <a href="/register" className="hover:text-slate-900">
              Daftar
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
