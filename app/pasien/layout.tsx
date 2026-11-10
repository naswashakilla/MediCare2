import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { requireRole } from "@/utils/auth";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("pasien");

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <Link href="/pasien" className="text-xl font-bold text-blue-800">
              MediCare
            </Link>
            <p className="text-sm text-slate-600">Halo, {profile.nama_user}</p>
          </div>
          <form action={logout}>
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50">
              Keluar
            </button>
          </form>
        </div>
      </header>
      {children}
    </>
  );
}