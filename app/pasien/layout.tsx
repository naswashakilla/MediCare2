import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { requireRole } from "@/utils/auth";
import { PatientNavigation } from "./navigation";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("pasien");
  const initial = profile.nama_user.trim().charAt(0).toUpperCase() || "P";

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-base font-bold text-white shadow-sm shadow-teal-900/20">
              M
            </span>
            <span>
              <Link href="/pasien" className="block text-lg font-bold tracking-tight text-slate-900">
                MediCare
              </Link>
              <span className="block text-xs font-medium uppercase tracking-[0.16em] text-teal-700">
                Portal pasien
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile.nama_user}</p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-800">
              {initial}
            </span>
            <form action={logout}>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                Keluar
              </button>
            </form>
          </div>
        </div>
        <PatientNavigation />
      </header>
      {children}
    </>
  );
}
