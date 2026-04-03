export default function HomePage() {
  return (
    <main className="bg-white text-gray-900">
      {/* HEADER */}
      <header className="border-b sticky top-0 bg-white z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">GoBayar</h1>

          <div className="flex gap-3">
            <a href="/login" className="text-sm text-gray-600">
              Login
            </a>
            <a
              href="/signup"
              className="bg-black text-white text-sm px-4 py-2 rounded-lg"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <span className="text-xs bg-indigo
