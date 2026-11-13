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

  const stats: { title: string; value: number; icon: IconName }[] = [
    { title: "Total pendaftaran", value: totalResult.count ?? 0, icon: "calendar" },
    { title: "Menunggu konfirmasi", value: waitingResult.count ?? 0, icon: "clock" },
    { title: "Kunjungan mendatang", value: upcomingResult.count ?? 0, icon: "check" },
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
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section>
        <p className="text-sm font-medium text-brilliant">Dashboard pasien</p>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
          Selamat datang, {account.nama_user}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Daftarkan kunjungan Anda ke dokter yang tersedia dan pantau statusnya di satu tempat.
        </p>
      </section>

      {errors.length > 0 && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Sebagian data gagal dimuat. Muat ulang halaman untuk mencoba kembali.
        </p>
      )}

      {!patient && !patientResult.error && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-navy">Lengkapi profil Anda</h2>
              <p className="mt-1 text-sm leading-6 text-amber-900/80">
                Akun Anda belum terhubung dengan data pasien. Lengkapi profil agar dapat mendaftar kunjungan.
              </p>
            </div>
            <Link
              href="/pasien/profil"
              className="shrink-0 rounded-lg bg-brilliant px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy"
            >
              Lengkapi sekarang
            </Link>
          </div>
        </section>
      )}

      {patient && (
        <section aria-label="Ringkasan pendaftaran" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article key={stat.title} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-sm font-medium">{stat.title}</span>
                <Icon name={stat.icon} className="h-5 w-5 text-brilliant" />
              </div>
              <p className="mt-4 text-3xl font-bold text-navy">{stat.value}</p>
            </article>
          ))}
        </section>
      )}

      {patient && (
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-bold text-navy">Pendaftaran terakhir</h2>
            <Link href="/pasien/pendaftaran" className="text-sm text-navy hover:underline">
              Lihat semua
            </Link>
          </div>
          {latestRegistrations.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Belum ada pendaftaran.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200 bg-white px-4">
              {latestRegistrations.map((registration) => (
                <li
                  key={registration.id_daftar}
                  className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-navy">
                      {registration.dokter?.nama_dokter ?? "Dokter tidak diketahui"}
                    </p>
                    <p className="text-sm text-slate-600">
                      {registration.dokter?.poli?.nama_poli ?? "Poli"} ·{" "}
                      {formatDate(registration.tgl_kunjungan)}
                    </p>
                  </div>
                  <span className="text-sm text-slate-600">
                    {statusLabels[registration.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-navy">Poli yang tersedia</h2>
        <ul className="mt-3 space-y-2">
          {polis.length === 0 ? (
            <li className="text-sm text-slate-500">Daftar poli belum tersedia.</li>
          ) : (
            polis.map((poli) => (
              <li key={poli.id_poli} className="text-sm text-navy">
                {poli.nama_poli}
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}
