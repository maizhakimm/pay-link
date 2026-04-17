export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-60 border-r bg-white p-4">
        <h2 className="mb-4 text-lg font-bold">Admin</h2>

        <a
          href="/admin/payout"
          className="block mb-2 rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
        >
          Payout
        </a>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1">
        {/* HEADER */}
        <div className="border-b bg-white px-6 py-4 shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">
            Admin Panel
          </h1>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
