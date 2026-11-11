import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Icon, type IconName } from "./_components/landing/icons";
import { SiteHeader } from "./_components/landing/site-header";

export const metadata: Metadata = {
  title: "MediCare | Your Health, Our Priority",
  description:
    "MediCare menghadirkan layanan rumah sakit dan poliklinik yang modern, nyaman, dan terpercaya untuk Anda dan keluarga.",
};

type Poli = {
  id_poli: number;
  nama_poli: string;
  keterangan: string | null;
};

type Doctor = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  poli: { nama_poli: string } | null;
};

const facilities: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "building",
    title: "Ruang tunggu nyaman",
    description: "Area tunggu yang bersih, terang, dan nyaman untuk seluruh pengunjung.",
  },
  {
    icon: "flask",
    title: "Laboratorium",
    description: "Pemeriksaan laboratorium dengan proses cepat dan hasil yang akurat.",
  },
  {
    icon: "pill",
    title: "Farmasi",
    description: "Layanan obat dan konsultasi farmasi langsung di area rumah sakit.",
  },
  {
    icon: "scan",
    title: "Radiologi",
    description: "Pemeriksaan penunjang dengan peralatan diagnostik yang modern.",
  },
  {
    icon: "activity",
    title: "IGD 24 jam",
    description: "Tim medis siaga setiap saat untuk kebutuhan darurat Anda.",
  },
  {
    icon: "car",
    title: "Parkir luas",
    description: "Area parkir yang aman dan mudah diakses untuk kendaraan Anda.",
  },
];

const contact = {
  address: "Jl. Kesehatan No. 88, Jakarta Selatan, DKI Jakarta 12345",
  phone: "(021) 555-0123",
  whatsapp: "0812-3456-7890",
  email: "halo@medicare.co.id",
};

const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("Jl. Kesehatan No. 88 Jakarta Selatan")}`;

function formatSchedule(doctor: Doctor) {
  const start = doctor.jam_mulai?.slice(0, 5);
  const end = doctor.jam_selesai?.slice(0, 5);

  if (!start || !end) return "Jadwal menyusul";
  return `${start} – ${end} WIB`;
}

function doctorInitials(name: string) {
  return (
    name
      .replace(/^(dr\.?|drg\.?|prof\.?)\s+/i, "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "DR"
  );
}

function serviceIcon(name: string): IconName {
  const normalized = name.toLowerCase();

  if (normalized.includes("gigi")) return "tooth";
  if (normalized.includes("anak")) return "baby";
  if (normalized.includes("kia")) return "users";
  if (normalized.includes("dalam")) return "activity";
  if (normalized.includes("bedah")) return "plus";
  if (normalized.includes("tht")) return "ear";
  if (normalized.includes("mata")) return "eye";
  if (normalized.includes("kulit")) return "sparkles";
  if (normalized.includes("jantung")) return "heart-pulse";
  if (normalized.includes("umum")) return "stethoscope";

  return "plus";
}

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div>
      <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-pistachio" : "text-iced-denim-dark"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${light ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      {description && (
        <p className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${light ? "text-white/75" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </div>
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  const [poliResult, doctorResult] = await Promise.all([
    supabase.from("poli").select("id_poli,nama_poli,keterangan").order("nama_poli"),
    supabase
      .from("dokter")
      .select("id_dokter,nama_dokter,spesialis,hari_praktik,jam_mulai,jam_selesai,poli(nama_poli)")
      .order("nama_dokter"),
  ]);

  let dashboardHref: string | null = null;
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id_user", userId)
      .single();

    if (profile) {
      dashboardHref = profile.role === "admin" ? "/admin" : "/pasien";
    }
  }

  const polis = (poliResult.data ?? []) as Poli[];
  const doctors = (doctorResult.data ?? []) as unknown as Doctor[];
  const hasDataError = Boolean(poliResult.error || doctorResult.error);
  const doctorCountLabel = doctors.length > 0 ? `${doctors.length}+` : "—";
  const poliCountLabel = polis.length > 0 ? `${polis.length}` : "—";

  const appointmentHref =
    dashboardHref === "/pasien"
      ? "/pasien/pendaftaran"
      : dashboardHref === "/admin"
        ? "/admin/pendaftaran"
        : "/login";
  const accountHref = dashboardHref ?? "/login";
  const accountLabel = dashboardHref ? "Buka Dashboard" : "Login";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader dashboardHref={dashboardHref} appointmentHref={appointmentHref} />

      <main className="flex-1">
        <section id="home" className="relative scroll-mt-24 overflow-hidden bg-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-pistachio/20 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-28 top-10 h-96 w-96 rounded-full bg-iced-denim/15 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-20">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-pistachio/40 bg-pistachio/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-800">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pistachio" />
                Poliklinik MediCare · Melayani dengan sepenuh hati
              </span>

              <h1 className="mt-6 max-w-2xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Your Health,{" "}
                <span className="text-iced-denim-dark">Our Priority</span>
              </h1>

              <div aria-hidden="true" className="mt-6 h-1.5 w-24 rounded-full bg-pistachio" />

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
                MediCare menghadirkan layanan kesehatan yang hangat, cepat, dan terpercaya untuk Anda dan
                keluarga. Dari konsultasi umum hingga perawatan spesialis, semuanya dalam satu tempat.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={appointmentHref}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-pistachio px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#aab34a]"
                >
                  <Icon name="calendar" className="h-5 w-5" />
                  Book Appointment
                  <Icon
                    name="arrow-right"
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href={accountHref}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-iced-denim/30 hover:bg-frost hover:text-iced-denim-dark"
                >
                  <Icon name={dashboardHref ? "users" : "shield"} className="h-5 w-5" />
                  {accountLabel}
                </Link>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-6">
                <div>
                  <dd className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {doctorCountLabel}
                  </dd>
                  <dt className="mt-1 text-xs font-medium text-slate-500">Dokter spesialis</dt>
                </div>
                <div>
                  <dd className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                    {poliCountLabel}
                  </dd>
                  <dt className="mt-1 text-xs font-medium text-slate-500">Layanan poli</dt>
                </div>
                <div>
                  <dd className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">24/7</dd>
                  <dt className="mt-1 text-xs font-medium text-slate-500">IGD siaga</dt>
                </div>
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute -right-4 -top-8 h-40 w-40 rounded-full bg-pistachio/40 blur-2xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-10 -left-6 h-48 w-48 rounded-full bg-iced-denim/20 blur-2xl"
              />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-gradient-to-br from-frost via-white to-frost p-5 shadow-2xl shadow-slate-900/10 sm:p-8">
                <div
                  aria-hidden="true"
                  className="absolute right-6 top-6 h-24 w-24 rounded-full border-[14px] border-iced-denim/10"
                />

                <div className="relative rounded-[1.75rem] bg-gradient-to-br from-iced-denim-dark via-iced-denim to-[#6aa8e2] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
                      MediCare Care
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                      <Icon name="heart-pulse" className="h-5 w-5 text-pistachio" />
                    </span>
                  </div>

                  <p className="mt-6 text-2xl font-bold leading-snug sm:text-3xl">
                    Kesehatan Anda,
                    <br />
                    prioritas kami.
                  </p>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
                    Dokter berpengalaman dan fasilitas modern untuk perawatan yang lebih tenang.
                  </p>

                  <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pistachio font-bold text-slate-950">
                      M
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">Jadwal konsultasi</span>
                      <span className="mt-0.5 block text-xs text-white/70">
                        Senin–Sabtu, 08.00–20.00 WIB
                      </span>
                    </span>
                  </div>
                </div>

                <div className="relative mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-frost text-iced-denim-dark">
                      <Icon name="users" className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-2xl font-bold text-slate-950">{doctorCountLabel}</p>
                    <p className="text-xs text-slate-500">Dokter spesialis</p>
                  </div>
                  <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-pistachio/20 text-slate-800">
                      <Icon name="stethoscope" className="h-4 w-4" />
                    </span>
                    <p className="mt-3 text-2xl font-bold text-slate-950">{poliCountLabel}</p>
                    <p className="text-xs text-slate-500">Layanan poli</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 left-4 hidden items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:flex">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pistachio/20 text-slate-800">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold text-slate-700">Pendaftaran online mudah</span>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-24 border-y border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
            <div className="relative mx-auto w-full max-w-lg lg:mx-0">
              <div
                aria-hidden="true"
                className="absolute -left-6 -top-6 h-36 w-36 rounded-full bg-pistachio/30 blur-2xl"
              />
              <div className="relative overflow-hidden rounded-[2rem] bg-frost p-5 sm:p-7">
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-iced-denim/10"
                />
                <div className="relative grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-2xl bg-white p-5 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-pistachio/20 text-slate-900">
                      <Icon name="heart-pulse" className="h-5 w-5" />
                    </span>
                    <p className="mt-4 text-sm font-bold text-slate-950">Perawatan dengan sepenuh hati</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Setiap pasien didampingi oleh tim yang ramah dan profesional.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-iced-denim p-5 text-white shadow-sm">
                    <p className="text-3xl font-bold">15+</p>
                    <p className="mt-1 text-xs text-white/80">Tahun melayani</p>
                  </div>
                  <div className="rounded-2xl bg-pistachio p-5 text-slate-950 shadow-sm">
                    <p className="text-3xl font-bold">24/7</p>
                    <p className="mt-1 text-xs text-slate-800">IGD siaga</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-iced-denim/15 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-frost text-iced-denim-dark">
                        <Icon name="shield" className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">Aman dan terpercaya</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Data pasien dikelola dengan aman melalui sistem autentikasi MediCare.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="About Us"
                title="Rumah sakit yang tumbuh bersama masyarakat"
                description="MediCare hadir sebagai mitra kesehatan keluarga dengan pelayanan yang manusiawi, fasilitas yang lengkap, dan tenaga medis yang berdedikasi."
              />
              <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
                Kami percaya bahwa pengalaman berobat yang baik dimulai dari rasa nyaman. Karena itu,
                MediCare memadukan pelayanan medis profesional dengan suasana yang hangat, proses
                pendaftaran yang mudah, dan komunikasi yang jelas untuk setiap pasien.
              </p>
              <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "Dokter berpengalaman",
                  "Pendaftaran online",
                  "Fasilitas modern",
                  "Layanan ramah",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pistachio/20 text-slate-800">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="#doctors"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-iced-denim-dark transition hover:gap-3"
              >
                Kenali dokter kami
                <Icon name="arrow-right" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section id="services" className="scroll-mt-24 bg-frost/70 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Services"
              title="Layanan medis untuk seluruh keluarga"
              description="Pilih layanan yang sesuai dengan kebutuhan Anda. Setiap poli didukung oleh dokter dan tenaga medis yang kompeten di bidangnya."
            />

            {polis.length > 0 ? (
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {polis.map((poli) => (
                  <article
                    key={poli.id_poli}
                    className="group flex flex-col rounded-2xl border border-white bg-white p-6 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-1 hover:border-iced-denim/20 hover:shadow-lg hover:shadow-slate-900/[0.06]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-frost text-iced-denim-dark transition group-hover:bg-iced-denim group-hover:text-white">
                        <Icon name={serviceIcon(poli.nama_poli)} className="h-6 w-6" />
                      </span>
                      <span className="rounded-full bg-pistachio/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
                        Poli
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-950">{poli.nama_poli}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                      {poli.keterangan || "Layanan pemeriksaan dan konsultasi kesehatan."}
                    </p>
                    <a
                      href="#doctors"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-iced-denim-dark transition-all hover:gap-3"
                    >
                      Lihat dokter
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </a>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-12 rounded-2xl border border-dashed border-iced-denim/30 bg-white/70 p-8 text-center text-sm text-slate-600">
                {hasDataError
                  ? "Data layanan belum dapat dimuat. Silakan muat ulang halaman."
                  : "Belum ada layanan yang ditambahkan admin."}
              </p>
            )}
          </div>
        </section>

        <section id="doctors" className="scroll-mt-24 bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Doctors"
                title="Dokter dan spesialisasi"
                description="Kenali dokter yang siap membantu Anda. Jadwal praktik dapat berubah, silakan konfirmasi melalui pendaftaran kunjungan."
              />
              <Link
                href={appointmentHref}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-iced-denim px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-iced-denim-dark"
              >
                <Icon name="calendar" className="h-4 w-4" />
                Book Appointment
              </Link>
            </div>

            {doctors.length > 0 ? (
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor) => (
                  <article
                    key={doctor.id_dokter}
                    className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-1 hover:border-iced-denim/30 hover:shadow-lg hover:shadow-slate-900/[0.06]"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-frost to-iced-denim/20 text-lg font-bold text-iced-denim-dark">
                        {doctorInitials(doctor.nama_dokter)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950">{doctor.nama_dokter}</h3>
                        <p className="mt-1 text-sm font-semibold text-iced-denim-dark">
                          {doctor.spesialis || "Dokter umum"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {doctor.poli?.nama_poli ?? "Poli MediCare"}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Icon name="calendar" className="h-4 w-4 shrink-0 text-iced-denim" />
                        <dt className="sr-only">Hari praktik</dt>
                        <dd>{doctor.hari_praktik || "Jadwal menyusul"}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="clock" className="h-4 w-4 shrink-0 text-iced-denim" />
                        <dt className="sr-only">Jam praktik</dt>
                        <dd>{formatSchedule(doctor)}</dd>
                      </div>
                    </dl>

                    <Link
                      href={appointmentHref}
                      className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-iced-denim/20 bg-frost/60 px-4 py-2.5 text-sm font-semibold text-iced-denim-dark transition hover:border-iced-denim hover:bg-iced-denim hover:text-white"
                    >
                      Buat janji
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-12 rounded-2xl border border-dashed border-iced-denim/30 bg-frost/40 p-8 text-center text-sm text-slate-600">
                {hasDataError
                  ? "Data dokter belum dapat dimuat. Silakan muat ulang halaman."
                  : "Belum ada dokter yang ditambahkan admin."}
              </p>
            )}
          </div>
        </section>

        <section id="facilities" className="scroll-mt-24 bg-white pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2rem] bg-frost p-6 sm:p-10 lg:p-12">
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
                <SectionHeading
                  eyebrow="Facilities"
                  title="Fasilitas yang mendukung kenyamanan Anda"
                  description="Mulai dari ruang tunggu hingga layanan penunjang medis, MediCare menyiapkan fasilitas yang membuat setiap kunjungan terasa lebih mudah."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {facilities.map((facility) => (
                    <article key={facility.title} className="rounded-2xl bg-white p-5 shadow-sm">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pistachio/20 text-slate-900">
                        <Icon name={facility.icon} className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 font-bold text-slate-950">{facility.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{facility.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white pb-20 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-iced-denim-dark via-iced-denim to-[#2f5f91] px-6 py-12 text-white shadow-2xl shadow-slate-900/15 sm:px-10 lg:px-14">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[42px] border-white/10"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-pistachio/20 blur-3xl"
              />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-pistachio">
                    Book Appointment
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    Siap memulai kunjungan Anda?
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                    Masuk ke akun MediCare untuk mendaftar kunjungan, memilih dokter, dan memantau
                    status pendaftaran Anda dengan mudah.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href={appointmentHref}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-pistachio px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-[#aab34a]"
                  >
                    Book Appointment
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </Link>
                  <Link
                    href={accountHref}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    {accountLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 border-t border-slate-100 bg-white py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Kami siap membantu Anda"
                description="Punya pertanyaan tentang layanan, jadwal dokter, atau pendaftaran? Hubungi tim MediCare melalui salah satu kanal berikut."
              />

              <div className="mt-8 space-y-3">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-iced-denim/30 hover:bg-frost/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-frost text-iced-denim-dark">
                    <Icon name="map-pin" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">Alamat</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-500">{contact.address}</span>
                  </span>
                </a>

                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-iced-denim/30 hover:bg-frost/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-frost text-iced-denim-dark">
                    <Icon name="phone" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">Telepon</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {contact.phone} · WhatsApp {contact.whatsapp}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-iced-denim/30 hover:bg-frost/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-frost text-iced-denim-dark">
                    <Icon name="mail" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">Email</span>
                    <span className="mt-1 block text-sm text-slate-500">{contact.email}</span>
                  </span>
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-frost p-2">
              <div className="relative overflow-hidden rounded-[1.5rem] bg-[#dfeef9] p-6 sm:p-8">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(#5798d7 1px, transparent 1px), linear-gradient(90deg, #5798d7 1px, transparent 1px)",
                    backgroundSize: "36px 36px",
                  }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-iced-denim-dark">
                        Kunjungi kami
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-slate-950">MediCare Hospital &amp; Clinic</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{contact.address}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-iced-denim text-white shadow-lg shadow-slate-900/10">
                      <Icon name="map-pin" className="h-6 w-6" />
                    </span>
                  </div>

                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-iced-denim-dark shadow-sm transition hover:bg-iced-denim hover:text-white"
                  >
                    Buka di Google Maps
                    <Icon name="arrow-right" className="h-4 w-4" />
                  </a>

                  <div className="mt-8 rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur">
                    <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                      <Icon name="clock" className="h-4 w-4 text-iced-denim-dark" />
                      Jam operasional
                    </p>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Senin – Jumat</dt>
                        <dd className="font-semibold text-slate-800">08.00 – 20.00</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">Sabtu</dt>
                        <dd className="font-semibold text-slate-800">08.00 – 14.00</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <dt className="text-slate-500">IGD</dt>
                        <dd className="font-semibold text-iced-denim-dark">Buka 24 jam</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0f2a3d] text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-3" aria-label="MediCare - kembali ke beranda">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-iced-denim text-white">
                  <Icon name="plus" className="h-6 w-6" strokeWidth={2.4} />
                </span>
                <span>
                  <span className="block text-xl font-bold tracking-tight text-white">MediCare</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-pistachio">
                    Hospital &amp; Clinic
                  </span>
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-6 text-slate-400">
                Layanan kesehatan yang hangat, cepat, dan terpercaya untuk Anda dan keluarga.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Navigasi</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#about", label: "About Us" },
                  { href: "#services", label: "Services" },
                  { href: "#doctors", label: "Doctors" },
                  { href: "#contact", label: "Contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="transition hover:text-pistachio">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Layanan</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {polis.length > 0 ? (
                  polis.slice(0, 5).map((poli) => (
                    <li key={poli.id_poli}>
                      <a href="#services" className="transition hover:text-pistachio">
                        {poli.nama_poli}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500">Belum ada layanan</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">Kontak</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-pistachio" />
                  <span className="text-slate-400">{contact.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name="phone" className="h-4 w-4 shrink-0 text-pistachio" />
                  <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="transition hover:text-white">
                    {contact.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name="mail" className="h-4 w-4 shrink-0 text-pistachio" />
                  <a href={`mailto:${contact.email}`} className="transition hover:text-white">
                    {contact.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icon name="clock" className="h-4 w-4 shrink-0 text-pistachio" />
                  <span className="text-slate-400">Senin–Sabtu · IGD 24 jam</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} MediCare. Seluruh hak cipta dilindungi.</p>
            <p className="font-medium text-slate-400">Your Health, Our Priority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
