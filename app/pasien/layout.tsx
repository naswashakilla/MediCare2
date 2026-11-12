import Image from "next/image";
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
    <div className="min-h-screen bg-[#f6fafd]">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div>
            <Link href="/pasien" aria-label="MediCare - portal pasien" className="inline-flex">
              <Image
                src="/logo-medicare.png"
                alt="MediCare"
                width={1774}
                height={887}
                sizes="160px"
                className="h-8 w-auto"
              />
            </Link>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-iced-denim-dark">
              Portal pasien
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile.nama_user}</p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
            <span
              aria-hidden="true"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-iced-denim to-iced-denim-dark font-bold text-white shadow-sm shadow-iced-denim/25"
            >
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
    </div>
  );
}
