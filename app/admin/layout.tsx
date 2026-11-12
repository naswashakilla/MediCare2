import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { Icon } from "@/app/_components/landing/icons";
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
    <div className="min-h-screen bg-[#f6fafd] md:flex">
      <aside className="border-b border-slate-200/70 bg-white print:hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
        <div className="px-5 py-5">
          <Link href="/admin" aria-label="MediCare - panel admin" className="inline-flex">
            <Image
              src="/logo-medicare.png"
              alt="MediCare"
              width={1774}
              height={887}
              sizes="160px"
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="hidden px-5 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 md:block">
          Menu utama
        </div>
        <AdminNavigation />

        <div className="hidden p-4 md:block">
          <div className="relative overflow-hidden rounded-2xl border border-iced-denim/15 bg-frost/70 p-4">
            <div aria-hidden="true" className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-pistachio/30 blur-xl" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white text-iced-denim-dark shadow-sm">
              <Icon name="shield" className="h-4 w-4" />
            </span>
            <p className="relative mt-3 text-sm font-semibold text-slate-900">Butuh bantuan?</p>
            <p className="relative mt-1 text-xs leading-5 text-slate-500">
              Hubungi pengelola sistem jika ada kendala mengatur data klinik.
            </p>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span className="md:hidden">
                <Image
                  src="/logo-medicare.png"
                  alt="MediCare"
                  width={1774}
                  height={887}
                  sizes="160px"
                  className="h-8 w-auto"
                />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Panel administrasi
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">Sistem Informasi Poliklinik</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">{profile.nama_user}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-iced-denim to-iced-denim-dark font-bold text-white shadow-sm shadow-iced-denim/25"
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
        </header>
        {children}
      </div>
    </div>
  );
}
