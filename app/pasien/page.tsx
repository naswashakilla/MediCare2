import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/landing/icons";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { formatDate, todayISO } from "@/utils/format";

type RegistrationStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";

type RegistrationSummary = {
  id_daftar: number;
  tgl_kunjungan: string;
  status: RegistrationStatus;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null } | null;
};

const statusLabels: Record<RegistrationStatus, string> = {
  menunggu: "Menunggu",
  dikonfirmasi: "Dikonfirmasi",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

const statusStyles: Record<RegistrationStatus, string> = {
  menunggu: "border-amber-200 bg-amber-50 text-amber-800",
  dikonfirmasi: "border-iced-denim/30 bg-frost text-iced-denim-dark",
  selesai: "border-emerald-200 bg-emerald-50 text-emerald-800",
  dibatalkan: "border-rose-200 bg-rose-50 text-rose-800",
};

export default async function PasienPage() {
  const account = await requireRole("pasien");
  const supabase = await createClient();
  const today = todayISO();

  const [patientResult, poliResult] = await Promise.all([
    supabase
      .from("pasien")
      .select("id_pasien,nama_pasien,nik")
      .eq("id_user", account.id_user)
      .limit(1),
    supabase.from("poli").select("id_poli,nama_poli").order("nama_poli"),
  ]);
  const patient = ((patientResult.data ?? [])[0] ?? null) as { id_pasien: number; nama_pasien: string; nik: string | null } | null;
  const polis = (poliResult.data ?? []) as { id_poli: number; nama_poli: string }[];

  const patientId = patient?.id_pasien ?? 0;
  const [totalResult, waitingResult, upcomingResult, latestResult] = await Promise.all([
    supabase.from("pendaftaran").select("id_daftar", { count: "exact", head: true }).eq("id_pasien", patientId),
    supabase
      .from("pendaftaran")
      .select("id_daftar", { count: "exact", head: true })
      .eq("id_pasien", patientId)
      .eq("status", "menunggu"),
    supabase
      .from("pendaftaran")
      .select("id_daftar", { count: "exact", head: true })
      .eq("id_pasien", patientId)
      .gte("tgl_kunjungan", today)
      .in("status", ["menunggu", "dikonfirmasi"]),
    supabase
      .from("pendaftaran")
      .select("id_daftar,tgl_kunjungan,status,dokter(nama_dokter,poli(nama_poli))")
      .eq("id_pasien", patientId)
      .order("id_daftar", { ascending: false })
      .limit(3),
  ]);
  const latestRegistrations = (latestResult.data ?? []) as unknown as RegistrationSummary[];

  const stats: { title: string; value: number; icon: IconName; tint: string }[] = [
    {
      title: "Total pendaftaran",
      value: totalResult.count ?? 0,
      icon: "calendar",
      tint: "bg-frost text-iced-denim-dark",
    },
    {
      title: "Menunggu konfirmasi",
      value: waitingResult.count ?? 0,
      icon: "clock",
      tint: "bg-pistachio/25 text-slate-800",
    },
    {
      title: "Kunjungan mendatang",
      value: upcomingResult.count ?? 0,
      icon: "check",
      tint: "bg-iced-denim/10 text-iced-denim-dark",
    },
  ];
  const errors = [
    patientResult.error,
    poliResult.error,
    totalResult.error,
    waitingResult.error,
    upcomingResult.error,
    latestResult.error,
  ].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-iced-denim-dark via-iced-denim to-[#2f5f91] px-6 py-8 text-white shadow-xl shadow-iced-denim/20 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[34px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-28 right-40 -z-10 h-56 w-56 rounded-full bg-pistachio/20 blur-2xl" />

        <span className="inline-flex items-center gap-2 rounded-full border border-pistachio/40 bg-pistachio/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pistachio" />
          Portal pasien MediCare
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Halo, {account.nama_user}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
          Daftarkan kunjungan Anda ke dokter yang tersedia dan pantau statusnya di satu tempat.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pasien/pendaftaran"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-iced-denim-dark shadow-sm transition hover:bg-frost"
          >
            <Icon name="calendar" className="h-4 w-4" />
            Daftar kunjungan
          </Link>
          <Link
            href="/pasien/profil"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <Icon name="users" className="h-4 w-4" />
            Lihat profil saya
          </Link>
        </div>
      </section>

      {errors.length > 0 && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Sebagian data gagal dimuat. Muat ulang halaman untuk mencoba kembali.
        </p>
      )}

      {!patient && !patientResult.error && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-amber-950">Lengkapi profil Anda</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                Akun Anda belum terhubung dengan data pasien. Lengkapi profil agar dapat mendaftar kunjungan.
              </p>
            </div>
            <Link
              href="/pasien/profil"
              className="shrink-0 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              Lengkapi sekarang
            </Link>
          </div>
        </section>
      )}

      {patient && (
        <>
          <section aria-label="Ringkasan pendaftaran" className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <article
                key={stat.title}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.tint}`}>
                    <Icon name={stat.icon} className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              </article>
            ))}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-iced-denim-dark">Riwayat terbaru</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Pendaftaran terakhir Anda</h2>
              </div>
              <Link
                href="/pasien/pendaftaran"
                className="inline-flex items-center gap-1 text-sm font-semibold text-iced-denim-dark transition hover:gap-2"
              >
                Lihat semua →
              </Link>
            </div>
            {latestRegistrations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-iced-denim/25 bg-white p-6 text-center text-sm text-slate-600">
                Belum ada pendaftaran.{" "}
                <Link href="/pasien/pendaftaran" className="font-medium text-iced-denim-dark hover:underline">
                  Daftar kunjungan pertama Anda
                </Link>
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-3">
                {latestRegistrations.map((registration) => (
                  <article
                    key={registration.id_daftar}
                    className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-iced-denim/25 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-950">
                        {registration.dokter?.nama_dokter ?? "Dokter tidak diketahui"}
                      </h3>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[registration.status]}`}>
                        {statusLabels[registration.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{registration.dokter?.poli?.nama_poli ?? "Poli"}</p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                      <Icon name="calendar" className="h-4 w-4 text-iced-denim" />
                      {formatDate(registration.tgl_kunjungan)}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-iced-denim-dark">Layanan kami</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Poli yang tersedia</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {polis.length === 0 ? (
            <p className="text-sm text-slate-500">Daftar poli belum tersedia.</p>
          ) : (
            polis.map((poli) => (
              <span
                key={poli.id_poli}
                className="inline-flex items-center gap-2 rounded-full border border-iced-denim/20 bg-frost px-3 py-1.5 text-sm font-medium text-iced-denim-dark"
              >
                <Icon name="building" className="h-3.5 w-3.5" />
                {poli.nama_poli}
              </span>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
