export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <div className="border-b bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
      </div>

      {/* CONTENT */}
      <div className="p-6">{children}</div>
    </div>
  )
}
