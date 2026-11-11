import Link from "next/link";
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
  dikonfirmasi: "border-sky-200 bg-sky-50 text-sky-800",
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

  const stats = [
    { title: "Total pendaftaran", value: totalResult.count ?? 0, tint: "bg-sky-50 text-sky-700" },
    { title: "Menunggu konfirmasi", value: waitingResult.count ?? 0, tint: "bg-amber-50 text-amber-700" },
    { title: "Kunjungan mendatang", value: upcomingResult.count ?? 0, tint: "bg-emerald-50 text-emerald-700" },
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
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800 px-6 py-8 text-white shadow-lg shadow-teal-900/10 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[34px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-28 right-40 -z-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
        <p className="text-sm font-medium text-teal-100">Portal pasien MediCare</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Halo, {account.nama_user}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50 sm:text-base">
          Daftarkan kunjungan Anda ke dokter yang tersedia dan pantau statusnya di satu tempat.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pasien/pendaftaran"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
          >
            Daftar kunjungan <span aria-hidden="true">→</span>
          </Link>
          <Link
            href="/pasien/profil"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
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
              <article key={stat.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{stat.title}</span>
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${stat.tint}`}>
                    {stat.title.charAt(0)}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </article>
            ))}
          </section>

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Riwayat terbaru</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Pendaftaran terakhir Anda</h2>
              </div>
              <Link href="/pasien/pendaftaran" className="text-sm font-medium text-teal-700 hover:underline">
                Lihat semua →
              </Link>
            </div>
            {latestRegistrations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
                Belum ada pendaftaran.{" "}
                <Link href="/pasien/pendaftaran" className="font-medium text-teal-700 hover:underline">
                  Daftar kunjungan pertama Anda
                </Link>
              </p>
            ) : (
              <div className="grid gap-3 lg:grid-cols-3">
                {latestRegistrations.map((registration) => (
                  <article key={registration.id_daftar} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {registration.dokter?.nama_dokter ?? "Dokter tidak diketahui"}
                      </h3>
                      <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[registration.status]}`}>
                        {statusLabels[registration.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{registration.dokter?.poli?.nama_poli ?? "Poli"}</p>
                    <p className="mt-1 text-sm font-medium text-slate-700">Kunjungan: {formatDate(registration.tgl_kunjungan)}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Layanan kami</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Poli yang tersedia</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {polis.length === 0 ? (
            <p className="text-sm text-slate-500">Daftar poli belum tersedia.</p>
          ) : (
            polis.map((poli) => (
              <span key={poli.id_poli} className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-800">
                {poli.nama_poli}
              </span>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
