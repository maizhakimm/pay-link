<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GoBayar</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body class="bg-white text-gray-800">

<!-- HEADER -->
<header class="flex items-center justify-between px-6 py-4 border-b">
  <div class="flex items-center gap-2">
    <div class="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg font-bold">
      G
    </div>
    <span class="font-semibold text-lg">GoBayar</span>
  </div>

  <div class="flex gap-3">
    <button class="text-sm">Login</button>
    <button class="bg-black text-white px-4 py-2 rounded-lg text-sm">Sign Up</button>
  </div>
</header>

<!-- HERO -->
<section class="text-center px-6 py-16">
  <span class="text-xs bg-purple-100 text-purple-600 px-3 py-1 rounded-full">Beta</span>

  <h1 class="text-3xl md:text-5xl font-bold mt-4 leading-tight">
    Jual di WhatsApp <br>
    <span class="text-purple-600">hanya dengan 1 link</span>
  </h1>

  <p class="mt-4 text-gray-500 max-w-xl mx-auto">
    Mudah untuk anda, mudah untuk customer. Tak perlu pening urus PM, payment dan order lagi.
  </p>

  <div class="flex justify-center gap-3 mt-6">
    <button class="bg-black text-white px-6 py-3 rounded-lg">Start Free</button>
    <button class="border px-6 py-3 rounded-lg">View Demo Shop</button>
  </div>

  <!-- FEATURES -->
  <div class="flex justify-center gap-6 mt-6 text-sm text-gray-500">
    <div>✔ Setup kurang 5 minit</div>
    <div>✔ Mobile friendly</div>
    <div>✔ Terus boleh jual</div>
  </div>

  <!-- PHONE MOCKUP -->
  <div class="mt-12 flex justify-center">
    <div class="w-64 h-[500px] bg-gray-900 rounded-3xl p-3 shadow-2xl">
      <div class="bg-white rounded-2xl h-full flex flex-col p-4 text-left">
        <h2 class="font-bold">Maiz Kitchen</h2>
        <p class="text-xs text-gray-500 mb-2">Order sekarang</p>

        <div class="border rounded-lg p-2 mb-2">
          <p class="font-semibold text-sm">Nasi Ayam</p>
          <p class="text-xs text-gray-500">RM8.00</p>
        </div>

        <div class="border rounded-lg p-2">
          <p class="font-semibold text-sm">Air Teh Ais</p>
          <p class="text-xs text-gray-500">RM2.50</p>
        </div>

        <button class="mt-auto bg-green-500 text-white py-2 rounded-lg text-sm">
          Order via WhatsApp
        </button>
      </div>
    </div>
  </div>
</section>

<!-- PROBLEM -->
<section class="px-6 py-16 bg-gray-50 text-center">
  <h2 class="text-2xl font-bold mb-8">Masalah biasa seller</h2>

  <div class="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
    <div class="p-4 bg-white rounded-lg shadow">
      📩 Customer PM satu-satu  
      <p class="text-sm text-gray-500">Order bercampur dengan chat, susah nak urus.</p>
    </div>

    <div class="p-4 bg-white rounded-lg shadow">
      💸 Susah check payment  
      <p class="text-sm text-gray-500">Kena buka bank satu-satu.</p>
    </div>

    <div class="p-4 bg-white rounded-lg shadow">
      📦 Track order serabut  
      <p class="text-sm text-gray-500">PM bersepah, susah cari.</p>
    </div>

    <div class="p-4 bg-white rounded-lg shadow">
      ⚠️ Double order  
      <p class="text-sm text-gray-500">Stock tak update.</p>
    </div>
  </div>
</section>

<!-- SOLUTION -->
<section class="px-6 py-16 text-center">
  <h2 class="text-2xl font-bold mb-8">GoBayar selesaikan semua</h2>

  <div class="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto text-left">
    <div class="p-4 border rounded-lg">🔗 1 link semua produk</div>
    <div class="p-4 border rounded-lg">📥 Auto collect order</div>
    <div class="p-4 border rounded-lg">💳 Payment auto track</div>
    <div class="p-4 border rounded-lg">📊 Stock auto update</div>
    <div class="p-4 border rounded-lg">💰 Multi payment</div>
    <div class="p-4 border rounded-lg">⚙️ Semua dalam 1 system</div>
  </div>
</section>

<!-- PRICING -->
<section class="px-6 py-16 bg-gray-50 text-center">
  <h2 class="text-2xl font-bold mb-8">Pricing</h2>

  <div class="max-w-md mx-auto border rounded-xl p-6 bg-white shadow">
    <h3 class="text-xl font-bold mb-2">Starter</h3>
    <p class="text-3xl font-bold mb-4">FREE</p>

    <ul class="text-sm text-gray-500 space-y-2 mb-6">
      <li>✔ Unlimited products</li>
      <li>✔ WhatsApp order</li>
      <li>✔ Basic dashboard</li>
    </ul>

    <button class="bg-black text-white px-6 py-2 rounded-lg">
      Start Free
    </button>
  </div>
</section>

<!-- FAQ -->
<section class="px-6 py-16 text-center">
  <h2 class="text-2xl font-bold mb-8">FAQ</h2>

  <div class="max-w-3xl mx-auto text-left space-y-4">
    <div>
      <p class="font-semibold">Perlu install app?</p>
      <p class="text-sm text-gray-500">Tak perlu, semua web based.</p>
    </div>

    <div>
      <p class="font-semibold">Boleh guna terus WhatsApp?</p>
      <p class="text-sm text-gray-500">Ya, terus integrate.</p>
    </div>

    <div>
      <p class="font-semibold">Berapa lama setup?</p>
      <p class="text-sm text-gray-500">Kurang 5 minit sahaja.</p>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="text-center py-16">
  <h2 class="text-2xl font-bold mb-4">
    Tak payah pening lagi. Start jual cara lebih smart.
  </h2>

  <button class="bg-black text-white px-6 py-3 rounded-lg">
    Sign Up Free
  </button>
</section>

<!-- FOOTER -->
<footer class="text-center text-xs text-gray-400 py-10 border-t">
  <p>GoBayar</p>
  <p>NEUGENS SOLUTION</p>
  <p>No Reg : 202503301282 (AS0504872-V)</p>

  <p class="mt-4">
    Copyright Reserved @2026 GoBayar by Neugens Solution 
    (202503301282 (AS0504872-V))
  </p>
</footer>

<!-- WHATSAPP FLOAT -->
<a href="https://wa.me/60163352087"
   class="fixed bottom-5 right-5 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-xl">
   💬
</a>

</body>
</html>
