'use client'

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Users
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
          Senarai pengguna platform akan dipaparkan di sini.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-base font-semibold text-slate-700">
            Users module coming soon
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Nanti page ini boleh tunjuk jumlah pengguna, role, status akaun,
            dan carian pengguna.
          </p>
        </div>
      </section>
    </div>
  )
}
