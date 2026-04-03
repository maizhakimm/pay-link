export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* HEADER */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          
          <div className="font-bold text-lg">
            <span className="text-pink-500">Bayar</span>
            <span className="text-blue-600">Link</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2">
            <a className="nav-btn">Dashboard</a>
            <a className="nav-btn">Products</a>
            <a className="nav-btn">Orders</a>
            <a className="nav-btn">Settings</a>
          </div>

          {/* Mobile menu */}
          <button className="md:hidden">
            ☰
          </button>

        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

    </div>
  )
}
