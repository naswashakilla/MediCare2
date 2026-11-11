import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { requireRole } from "@/utils/auth";
import { AdminNavigation } from "./navigation";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("admin");
  const initial = profile.nama_user.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="min-h-screen bg-[#f4f8f8] md:flex">
      <aside className="border-b border-slate-200 bg-white print:hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-700 text-lg font-bold text-white shadow-sm shadow-teal-900/20">
            M
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-900">MediCare</span>
            <span className="block text-xs font-medium uppercase tracking-[0.16em] text-teal-700">Poliklinik</span>
          </span>
        </div>

        <div className="hidden px-5 pb-2 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:block">
          Menu utama
        </div>
        <AdminNavigation />

        <div className="hidden p-4 md:block">
          <div className="rounded-2xl bg-[#f4f8f8] p-4">
            <p className="text-sm font-semibold text-slate-800">Butuh bantuan?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Hubungi pengelola sistem jika ada kendala mengatur data klinik.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Panel administrasi</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">Sistem Informasi Poliklinik</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">{profile.nama_user}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">
                {initial}
              </span>
              <form action={logout}>
                <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
