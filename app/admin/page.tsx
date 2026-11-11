import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const modules = [
  {
    href: "/admin/pasien",
    abbreviation: "PS",
    title: "Data pasien",
    description: "Kelola profil dan akun pasien",
    color: "bg-sky-50 text-sky-700",
  },
  {
    href: "/admin/dokter",
    abbreviation: "DR",
    title: "Data dokter",
    description: "Kelola dokter dan jadwal praktik",
    color: "bg-violet-50 text-violet-700",
  },
  {
    href: "/admin/poli",
    abbreviation: "PL",
    title: "Data poli",
    description: "Atur layanan poliklinik",
    color: "bg-amber-50 text-amber-700",
  },
  {
    href: "/admin/pendaftaran",
    abbreviation: "DF",
    title: "Pendaftaran",
    description: "Kelola pendaftaran kunjungan pasien",
    color: "bg-emerald-50 text-emerald-700",
  },
];

export default async function AdminPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();
  const [patientCount, doctorCount, clinicCount, registrationCount] = await Promise.all([
    supabase.from("pasien").select("*", { count: "exact", head: true }),
    supabase.from("dokter").select("*", { count: "exact", head: true }),
    supabase.from("poli").select("*", { count: "exact", head: true }),
    supabase.from("pendaftaran").select("*", { count: "exact", head: true }),
  ]);
  const stats = [
    { title: "Total pasien", value: patientCount.count, abbreviation: "PS", tint: "bg-sky-50 text-sky-700" },
    { title: "Dokter aktif", value: doctorCount.count, abbreviation: "DR", tint: "bg-violet-50 text-violet-700" },
    { title: "Layanan poli", value: clinicCount.count, abbreviation: "PL", tint: "bg-amber-50 text-amber-700" },
    { title: "Pendaftaran", value: registrationCount.count, abbreviation: "DF", tint: "bg-emerald-50 text-emerald-700" },
  ];
  const errors = [patientCount.error, doctorCount.error, clinicCount.error, registrationCount.error].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-teal-800 via-teal-700 to-cyan-800 px-6 py-8 text-white shadow-lg shadow-teal-900/10 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[34px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-28 right-40 -z-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
        <p className="text-sm font-medium text-teal-100">Dashboard poliklinik</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Selamat datang, {profile.nama_user}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50 sm:text-base">
          Pantau ringkasan klinik dan kelola informasi layanan kesehatan dari satu tempat.
        </p>
        <Link
          href="/admin/pasien"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition hover:bg-teal-50"
        >
          Kelola data pasien <span aria-hidden="true">→</span>
        </Link>
      </section>

      {errors.length > 0 && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Sebagian ringkasan gagal dimuat. Muat ulang halaman untuk mencoba kembali.
        </p>
      )}

      <section aria-label="Ringkasan data" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{stat.title}</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${stat.tint}`}>
                {stat.abbreviation}
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {stat.value ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Data terdaftar di sistem</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Akses cepat</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Kelola data klinik</h2>
          </div>
          <p className="text-sm text-slate-500">Pilih modul yang ingin dikelola</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Link
              href={module.href}
              key={module.href}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xs font-bold ${module.color}`}>
                {module.abbreviation}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{module.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{module.description}</span>
              </span>
              <span aria-hidden="true" className="pt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
