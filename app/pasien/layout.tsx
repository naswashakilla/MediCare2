import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { logout } from "@/app/actions/auth";
import { requireRole } from "@/utils/auth";
import { formatDate } from "@/utils/format";
import { createClient } from "@/utils/supabase/server";
import { PatientNotificationButton, type PatientNotification } from "./notification-button";
import { PatientNavigation } from "./navigation";

export default async function PatientLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireRole("pasien");
  const initial = profile.nama_user.trim().charAt(0).toUpperCase() || "P";
  const supabase = await createClient();
  const { data: patientRows, error: patientError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_user", profile.id_user)
    .limit(1);

  let notifications: PatientNotification[] = [];
  let notificationError = Boolean(patientError);

  if (!patientError && patientRows?.[0]) {
    const { data, error } = await supabase
      .from("pendaftaran")
      .select("id_daftar,tgl_kunjungan,dokter(nama_dokter,poli(nama_poli))")
      .eq("id_pasien", patientRows[0].id_pasien)
      .eq("status", "dikonfirmasi")
      .order("id_daftar", { ascending: false })
      .limit(5);

    notificationError = Boolean(error);
    notifications = ((data ?? []) as unknown as {
      id_daftar: number;
      tgl_kunjungan: string;
      dokter: { nama_dokter: string; poli: { nama_poli: string } | null } | null;
    }[]).map((registration) => ({
      id: registration.id_daftar,
      doctor: registration.dokter?.nama_dokter ?? "Dokter tidak diketahui",
      clinic: registration.dokter?.poli?.nama_poli ?? "Poli",
      visitDate: formatDate(registration.tgl_kunjungan),
    }));
  }

  return (
    <div className="min-h-screen bg-[#f6fafd]">
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl print:hidden">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center md:w-64 md:shrink-0">
            <Link
              href="/pasien"
              aria-label="MediCare - portal pasien"
              className="inline-flex rounded-lg bg-white px-2 py-1"
            >
              <Image
                src="/logo-medicare.png"
                alt="MediCare"
                width={1774}
                height={887}
                sizes="96px"
                className="h-12 w-auto"
              />
            </Link>
          </div>
          <p className="hidden text-sm font-semibold text-slate-800 md:block">
            Portal Pasien
          </p>
          <div className="ml-auto flex items-center gap-3">
            <PatientNotificationButton
              notifications={notifications}
              hasError={notificationError}
              userId={profile.id_user}
            />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">{profile.nama_user}</p>
              <p className="text-xs text-slate-500">{profile.email}</p>
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
      <div className="md:flex">
        <aside className="border-b border-white/10 bg-brilliant print:hidden md:sticky md:top-16 md:flex md:h-[calc(100vh-4rem)] md:w-64 md:shrink-0 md:flex-col md:border-b-0 md:border-r">
          <div className="hidden px-6 pb-2 pt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-200 md:block lg:pt-14">
            Menu utama
          </div>
          <PatientNavigation />
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
