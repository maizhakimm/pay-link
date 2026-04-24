export default function LandingPage() {
  const problems = [
    "Ramai PM… tapi order tak jadi",
    "Customer nak order… tapi tak bayar-bayar",
    "Setiap order kena layan satu-satu",
    "Order masuk… tapi susah nak track",
  ];

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

  {/* Desktop Image */}
  <div
    className="absolute inset-0 hidden bg-cover bg-center md:block"
    style={{
      backgroundImage: "url('/seller-hero.png')",
      backgroundPosition: "62% center",
    }}
  />

  {/* Mobile Image */}
  <div
    className="absolute inset-0 bg-cover bg-center md:hidden"
    style={{
      backgroundImage: "url('/Hero-Mobile.png')",
      backgroundPosition: "center top",
    }}
  />

  {/* Desktop white fade */}
  <div className="absolute inset-y-0 left-0 hidden w-[65%] bg-gradient-to-r from-white/95 via-white/85 to-white/0 md:block" />

  {/* Mobile top white fade */}
  <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-white via-white/95 to-white/0 md:hidden" />

  {/* Mobile bottom blue fade */}
  <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-transparent md:hidden" />

  {/* Desktop soft dark */}
  <div className="absolute inset-0 hidden bg-black/10 md:block" />

  {/* Header */}
  <header className="absolute left-0 right-0 top-0 z-20">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8">
      <img src="/logo.svg" className="h-8" />

      <div className="flex gap-2">
        <a
          href="/login"
          className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 backdrop-blur-sm"
        >
          Sign in
        </a>

        <a
          href="/register"
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          Sign up
        </a>
      </div>
    </div>
  </header>

  {/* Content */}
  <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pt-24 pb-6 md:justify-center md:px-8 md:py-20">
    
    {/* TEXT */}
    <div className="max-w-xl">
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
          Untuk seller makanan dari rumah
        </span>

        <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700">
          Tak Perlu Download App
        </span>
      </div>

      <h1 className="text-[34px] font-extrabold leading-[1.1] text-slate-950 md:text-6xl">
        Tak Perlu Buka Kedai, Dari Rumah Pun Boleh Berjaya!
      </h1>

      <p className="mt-2 text-xs italic text-slate-500">
        bisik Aishah Bakery dalam hati
      </p>

      <p className="mt-5 text-[15px] text-slate-700 md:text-xl">
        Bukan anda tak pandai berniaga.
        <br />
        Anda cuma perlukan cara yang betul!
      </p>

      <p className="mt-3 text-[14px] text-slate-600">
        <span className="hidden md:inline">
          Jual kek, nasi lemak, spaghetti, kuih muih, kopi semua boleh!
          <br />
        </span>
        Customer sekarang dah pandai tekan dan bayar.
        <br />
        Masih nak suruh mereka PM dulu baru order?
      </p>
    </div>

    {/* BOTTOM SECTION */}
    <div className="mt-auto pt-8 md:mt-8 md:max-w-xl">
      
      {/* FEATURES */}
      <div className="grid gap-2 text-sm text-white md:flex md:flex-wrap md:gap-4 md:text-slate-600">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 md:bg-emerald-500" />
          Boleh preorder
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-400 md:bg-blue-500" />
          Banyak pilihan bayaran
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 md:bg-amber-500" />
          Delivery ikut jarak
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-purple-400 md:bg-purple-500" />
          Boleh buat add-on
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-cyan-400 md:bg-cyan-500" />
          Boleh buka time-slot
        </div>
      </div>

      {/* BUTTON BELOW FEATURES */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg"
        >
          Daftar Sekarang
        </a>

        <a
          href="https://wa.me/"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/30 bg-white/90 px-6 font-semibold text-slate-800 md:border-slate-300"
        >
          Saya Nak Bantuan Setup
        </a>
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
        {
          image: "/problem-1.png",
          title: "Ramai PM… tapi order tak jadi",
          desc: "Customer tanya macam-macam, tapi akhirnya senyap dan tak proceed.",
        },
        {
          image: "/problem-2.png",
          title: "Customer nak order… tapi tak bayar-bayar",
          desc: "Order nampak macam jadi, tapi bayaran masih pending dan susah nak follow up.",
        },
        {
          image: "/problem-3.png",
          title: "Setiap order kena layan satu-satu",
          desc: "Penat ulang benda sama dalam chat, lagi-lagi bila order mula banyak.",
        },
        {
          image: "/problem-4.png",
          title: "Order masuk… tapi susah nak track",
          desc: "Semua bercampur dalam WhatsApp sampai susah nak semak semula.",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="group rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="relative mb-5 overflow-hidden rounded-2xl bg-blue-50/60">
            <img
              src={item.image}
              alt={item.title}
              className="h-44 w-full object-contain p-4 transition duration-300 group-hover:scale-105"
            />

            <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/20">
              {i + 1}
            </div>
          </div>

          <h3 className="text-lg font-bold leading-7 text-slate-900">
            {item.title}
          </h3>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

{/* SOLUTION */}
<section className="relative min-h-screen overflow-hidden">
  {/* Desktop Background */}
  <div
    className="absolute inset-0 hidden bg-cover bg-center md:block"
    style={{
      backgroundImage: "url('/Solution.png')",
      backgroundPosition: "center",
    }}
  />

  {/* Mobile Background */}
  <div
    className="absolute inset-0 bg-cover bg-center md:hidden"
    style={{
      backgroundImage: "url('/Solution-Mobile.png')",
      backgroundPosition: "center bottom",
    }}
  />

  {/* Desktop fade white from right to left */}
  <div className="absolute inset-y-0 right-0 hidden w-[62%] bg-gradient-to-l from-white/95 via-white/88 to-white/0 md:block" />

  {/* Mobile fade white from top to bottom */}
  <div className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-white via-white/95 to-white/0 md:hidden" />

  {/* Soft dark layer for image depth */}
  <div className="absolute inset-0 hidden bg-black/5 md:block" />

  <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl px-6 pb-10 pt-16 md:items-center md:justify-end md:px-8 md:py-20">
    <div className="max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 md:text-sm">
        Penyelesaian
      </p>

      <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
        BayarLink tolong urus Order sampai Payment!
      </h2>

  {/* Comparison badges */}
<div className="mt-5 flex flex-wrap gap-2 text-[11px] font-bold md:text-sm">
  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-white shadow-lg shadow-blue-600/20">
    ✓ BayarLink
  </span>

  <span className="inline-flex items-center gap-1.5 rounded-full bg-pink-100 px-3 py-1 text-pink-700">
    × PANDA
  </span>

  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-orange-700">
    × SHOPI
  </span>

  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-green-700">
    × GEREB
  </span>
</div>

     <div className="mt-6 space-y-2 md:mt-8 md:space-y-3">
  {[
    "Customer pilih menu sendiri",
    "Customer terus bayar ikut cara dia suka",
    "Order masuk tanpa perlu layan satu-satu",
  ].map((title, i) => (
    <div
      key={i}
      className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm backdrop-blur-sm md:px-5 md:py-3.5"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 md:h-8 md:w-8">
          ✓
        </div>

        <h3 className="text-[13px] font-semibold text-slate-900 md:text-base">
          {title}
        </h3>
      </div>
    </div>
  ))}
</div>
    </div>
  </div>
</section>

{/* AUDIENCE */}
<section className="bg-white py-24">
  <div className="mx-auto max-w-7xl px-6 md:px-8">
    <div className="grid items-center gap-12 md:grid-cols-2">
      
      {/* LEFT CONTENT */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Untuk siapa
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          BayarLink untuk siapa?
        </h2>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Dibina khas untuk usahawan yang nak grow!
        </p>

        {/* CLEAN LIST */}
        <div className="mt-10 space-y-6">
          {[
            "Peniaga makanan dari rumah",
            "Jual melalui WhatsApp / IG / TikTok / Facebook",
            "Masih ambil order secara manual",
            "Nak nampak lebih tersusun dan yakin",
            "Nak elak guna App Food Delivery yang cas komisen tinggi",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                ✓
              </div>

              <p className="text-[15px] font-medium leading-7 text-slate-800 md:text-base">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className="order-last md:order-none">
        
        {/* Desktop Image */}
        <img
          src="/Audience.png"
          alt="BayarLink Audience"
          className="hidden w-full object-contain md:block"
        />

        {/* Mobile Image */}
        <img
          src="/Audience-Mobile.png"
          alt="BayarLink Audience Mobile"
          className="mt-10 w-full object-contain md:hidden"
        />

      </div>

    </div>
  </div>
</section>

     {/* MARKET SHIFT */}
<section className="bg-slate-50 py-24">
  <div className="mx-auto max-w-7xl px-6 md:px-8">
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
        Kenapa sekarang
      </p>

      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Cara customer beli dah berubah.
      </h2>

      <p className="mt-5 text-lg leading-8 text-slate-600">
        Customer sekarang dah upgrade cara membeli.
        <br />
        Mereka nak yang cepat dan mudah. Pilih-pilih terus bayar!
      </p>
    </div>

    <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-4">
      {[
        {
          icon: "⚡",
          text: "Nak proses yang mudah",
        },
        {
          icon: "💳",
          text: "Suka banyak pilihan bayaran",
        },
        {
          icon: "⏱",
          text: "Beli tempat lain kalau lambat",
        },
        {
          icon: "🌐",
          text: "Order online dah jadi norma baru",
        },
      ].map((item, i) => (
        <div
          key={i}
          className="group rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl transition duration-300 group-hover:scale-110">
            {item.icon}
          </div>

          <div className="mx-auto mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
            ✓
          </div>

          <p className="text-base font-semibold leading-7 text-slate-800">
            {item.text}
          </p>
        </div>
      ))}
    </div>

    <div className="mx-auto mt-14 max-w-3xl rounded-[32px] bg-slate-900 px-6 py-8 text-center text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] md:px-10">
      <h3 className="text-2xl font-extrabold tracking-tight md:text-3xl">
        Jangan terus ketinggalan lagi.
        <br />
        Nak Maju kena Laju!
      </h3>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <a
          href="/register"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          Daftar Sekarang
        </a>

        <a
          href="https://wa.me/"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/15"
        >
          Saya Nak Bantuan Setup
        </a>
      </div>
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
              Direka untuk seller kecil yang mahu urus jualan dengan lebih
              mudah.
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
                    <p className="font-semibold text-slate-900">
                      {item.name}
                    </p>
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
  );
}
