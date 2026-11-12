import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/landing/icons";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

type ModuleItem = {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  tint: string;
};

const modules: ModuleItem[] = [
  {
    href: "/admin/pasien",
    title: "Data pasien",
    description: "Kelola profil dan akun pasien",
    icon: "users",
    tint: "bg-frost text-iced-denim-dark",
  },
  {
    href: "/admin/dokter",
    title: "Data dokter",
    description: "Kelola dokter dan jadwal praktik",
    icon: "stethoscope",
    tint: "bg-pistachio/25 text-slate-800",
  },
  {
    href: "/admin/poli",
    title: "Data poli",
    description: "Atur layanan poliklinik",
    icon: "building",
    tint: "bg-iced-denim/10 text-iced-denim-dark",
  },
  {
    href: "/admin/pendaftaran",
    title: "Pendaftaran",
    description: "Kelola pendaftaran kunjungan pasien",
    icon: "calendar",
    tint: "bg-frost text-iced-denim-dark",
  },
  {
    href: "/admin/laporan",
    title: "Laporan",
    description: "Cetak & ekspor laporan pendaftaran",
    icon: "scan",
    tint: "bg-pistachio/25 text-slate-800",
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
  const stats: { title: string; value: number | null; icon: IconName; tint: string }[] = [
    { title: "Total pasien", value: patientCount.count, icon: "users", tint: "bg-frost text-iced-denim-dark" },
    {
      title: "Dokter aktif",
      value: doctorCount.count,
      icon: "stethoscope",
      tint: "bg-pistachio/25 text-slate-800",
    },
    {
      title: "Layanan poli",
      value: clinicCount.count,
      icon: "building",
      tint: "bg-iced-denim/10 text-iced-denim-dark",
    },
    {
      title: "Pendaftaran",
      value: registrationCount.count,
      icon: "calendar",
      tint: "bg-frost text-iced-denim-dark",
    },
  ];
  const errors = [patientCount.error, doctorCount.error, clinicCount.error, registrationCount.error].filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-iced-denim-dark via-iced-denim to-[#2f5f91] px-6 py-8 text-white shadow-xl shadow-iced-denim/20 sm:px-9 sm:py-10">
        <div aria-hidden="true" className="absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[34px] border-white/10" />
        <div aria-hidden="true" className="absolute -bottom-28 right-40 -z-10 h-56 w-56 rounded-full bg-pistachio/20 blur-2xl" />

        <span className="inline-flex items-center gap-2 rounded-full border border-pistachio/40 bg-pistachio/15 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pistachio" />
          Dashboard poliklinik
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Selamat datang, {profile.nama_user}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
          Pantau ringkasan klinik dan kelola informasi layanan kesehatan dari satu tempat.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/pasien"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-iced-denim-dark shadow-sm transition hover:bg-frost"
          >
            <Icon name="users" className="h-4 w-4" />
            Kelola data pasien
          </Link>
          <Link
            href="/admin/pendaftaran"
            className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <Icon name="calendar" className="h-4 w-4" />
            Lihat pendaftaran
          </Link>
        </div>
      </section>

      {errors.length > 0 && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Sebagian ringkasan gagal dimuat. Muat ulang halaman untuk mencoba kembali.
        </p>
      )}

      <section aria-label="Ringkasan data" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{stat.title}</span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.tint}`}>
                <Icon name={stat.icon} className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
              {stat.value ?? "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Data terdaftar di sistem</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-iced-denim-dark">Akses cepat</p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Kelola data klinik</h2>
          </div>
          <p className="text-sm text-slate-500">Pilih modul yang ingin dikelola</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {modules.map((module) => (
            <Link
              href={module.href}
              key={module.href}
              className="group flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-1 hover:border-iced-denim/30 hover:shadow-lg hover:shadow-slate-900/[0.05]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${module.tint}`}>
                  <Icon name={module.icon} className="h-5 w-5" />
                </span>
                <span
                  aria-hidden="true"
                  className="pt-1 text-slate-300 transition group-hover:translate-x-1 group-hover:text-iced-denim-dark"
                >
                  <Icon name="arrow-right" className="h-4 w-4" />
                </span>
              </div>
              <span className="mt-4 block font-semibold text-slate-950">{module.title}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">{module.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
