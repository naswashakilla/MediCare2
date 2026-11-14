import Link from "next/link";
import { Icon, type IconName } from "@/app/_components/landing/icons";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const modules: { href: string; title: string }[] = [
  {
    href: "/admin/pasien",
    title: "Data pasien",
  },
  {
    href: "/admin/dokter",
    title: "Data dokter",
  },
  {
    href: "/admin/poli",
    title: "Data poli",
  },
  {
    href: "/admin/pendaftaran",
    title: "Pendaftaran",
  },
  {
    href: "/admin/laporan",
    title: "Laporan",
  },
];

export default async function AdminPage() {
  await requireRole("admin");
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
        <h1 className="text-2xl font-bold text-navy">Dashboard admin</h1>
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

      <section aria-label="Aksi cepat">
        <Link
          href="/admin/pasien#tambah-pasien"
          className="inline-flex rounded-lg bg-brilliant px-4 py-2.5 font-semibold text-white transition hover:bg-navy"
        >
          Tambah pasien
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-bold text-navy">Menu utama</h2>
        <ul className="mt-3 space-y-2">
          {modules.map((module) => (
            <li key={module.href}>
              <Link href={module.href} className="text-navy hover:underline">
                {module.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
