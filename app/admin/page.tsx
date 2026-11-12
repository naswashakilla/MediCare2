import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/landing/icons";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const modules: { href: string; title: string; description: string; icon: IconName }[] = [
  {
    href: "/admin/pasien",
    title: "Data pasien",
    description: "Kelola profil pasien",
    icon: "users",
  },
  {
    href: "/admin/dokter",
    title: "Data dokter",
    description: "Kelola dokter dan jadwal",
    icon: "stethoscope",
  },
  {
    href: "/admin/poli",
    title: "Data poli",
    description: "Atur layanan poliklinik",
    icon: "building",
  },
  {
    href: "/admin/pendaftaran",
    title: "Pendaftaran",
    description: "Kelola kunjungan pasien",
    icon: "calendar",
  },
  {
    href: "/admin/laporan",
    title: "Laporan",
    description: "Lihat dan cetak laporan",
    icon: "scan",
  },
];

export default async function AdminPage() {
  const profile = await requireRole("admin");
  const supabase = await createClient();

  const [patients, doctors, clinics, registrations] = await Promise.all([
    supabase.from("pasien").select("*", { count: "exact", head: true }),
    supabase.from("dokter").select("*", { count: "exact", head: true }),
    supabase.from("poli").select("*", { count: "exact", head: true }),
    supabase.from("pendaftaran").select("*", { count: "exact", head: true }),
  ]);

  const stats: { title: string; value: number | null; icon: IconName }[] = [
    { title: "Total pasien", value: patients.count, icon: "users" },
    { title: "Dokter", value: doctors.count, icon: "stethoscope" },
    { title: "Poli", value: clinics.count, icon: "building" },
    { title: "Pendaftaran", value: registrations.count, icon: "calendar" },
  ];

  const hasError = [patients.error, doctors.error, clinics.error, registrations.error].some(Boolean);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section>
        <p className="text-sm font-medium text-brilliant">Dashboard admin</p>
        <h1 className="mt-1 text-2xl font-bold text-navy sm:text-3xl">
          Selamat datang, {profile.nama_user}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Ringkasan data dan akses pengelolaan klinik.
        </p>
      </section>

      {hasError && (
        <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          Sebagian ringkasan gagal dimuat. Muat ulang halaman untuk mencoba kembali.
        </p>
      )}

      <section aria-label="Ringkasan data" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.title} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-slate-600">
              <span className="text-sm font-medium">{stat.title}</span>
              <Icon name={stat.icon} className="h-5 w-5 text-brilliant" />
            </div>
            <p className="mt-4 text-3xl font-bold text-navy">{stat.value ?? "—"}</p>
          </article>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy">Menu pengelolaan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              href={module.href}
              key={module.href}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brilliant/40 hover:bg-ocean/30"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean text-brilliant">
                <Icon name={module.icon} className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-navy">{module.title}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{module.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
