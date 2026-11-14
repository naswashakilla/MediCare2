import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Icon, type IconName } from "./_components/landing/icons";
import { SiteHeader } from "./_components/landing/site-header";

export const metadata: Metadata = {
  title: "MediCare | Your Health, Our Priority",
  description:
    "MediCare adalah klinik dengan layanan dokter umum dan spesialis untuk Anda dan keluarga.",
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

const contact = {
  address: "Jl. Ilmu No.45, Surakarta, Jawa Tengah",
  phone: "(021) 555-0123",
  whatsapp: "0812-3456-7890",
  email: "poliklinik@medicare.co.id",
};

const doctorAccents = [
  "border-t-sunset",
  "border-t-mango",
  "border-t-brilliant",
  "border-t-ocean",
];

const serviceTints = [
  "bg-sunset/10 text-sunset",
  "bg-brilliant/10 text-brilliant",
  "bg-mango/25 text-navy",
  "bg-ocean text-brilliant",
];

const steps = [
  "Masuk atau daftar akun MediCare.",
  "Pilih dokter dan tanggal kunjungan.",
  "Datang ke klinik sesuai jadwal.",
];

function formatSchedule(doctor: Doctor) {
  const start = doctor.jam_mulai?.slice(0, 5);
  const end = doctor.jam_selesai?.slice(0, 5);

  if (!start || !end) return "Jadwal menyusul";
  return `${start} - ${end} WIB`;
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
    <div className="max-w-2xl">
      <p
        className={`text-sm font-bold uppercase tracking-[0.14em] ${
          light ? "text-mango" : "text-brilliant"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
          light ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p className={`mt-3 text-base leading-7 ${light ? "text-white/80" : "text-navy/70"}`}>
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

  const doctorCount = doctors.length > 0 ? String(doctors.length) : "—";
  const poliCount = polis.length > 0 ? String(polis.length) : "—";

  const appointmentHref =
    dashboardHref === "/pasien"
      ? "/pasien/pendaftaran"
      : dashboardHref === "/admin"
        ? "/admin/pendaftaran"
        : "/login";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader dashboardHref={dashboardHref} appointmentHref={appointmentHref} />

      <main className="flex-1">
        {/* Hero */}
        <section id="home" className="relative isolate scroll-mt-24 overflow-hidden bg-[#e1e4ff]">
          <Image
            src="/Klinik MediCare Modern Berwarna Biru Oranye.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="z-0 object-cover object-[62%_center]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-gradient-to-r from-white from-0% via-white/70 via-40% to-transparent to-75%"
          />

          <div className="relative z-20 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
                Kesehatan Anda, prioritas kami.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-navy/80 sm:text-lg sm:leading-8">
                MediCare menghadirkan layanan dokter umum dan spesialis untuk Anda dan keluarga.
                Lihat jadwal dokter dan daftar kunjungan secara online dengan mudah.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#services"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brilliant px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-navy"
                >
                  Lihat layanan
                  <Icon name="arrow-right" className="h-5 w-5" />
                </Link>
                <Link
                  href={appointmentHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-brilliant bg-white/80 px-5 py-3 text-base font-semibold text-brilliant transition-colors hover:bg-white"
                >
                  Daftar kunjungan
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy/75">
                <span className="inline-flex items-center gap-2">
                  <Icon name="clock" className="h-4 w-4 text-brilliant" />
                  Senin–Sabtu, 08.00–20.00 WIB
                </span>
                <span className="inline-flex items-center gap-2">
                  <Icon name="shield" className="h-4 w-4 text-brilliant" />
                  IGD buka 24 jam
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section id="about" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8">
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border-4 border-ocean">
                <Image
                  src="/images/rumah-sakit.jpg"
                  alt="Ruang pelayanan MediCare"
                  width={1200}
                  height={800}
                  sizes="(min-width: 1024px) 560px, 100vw"
                  className="aspect-[3/2] w-full object-cover"
                />
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="About Us"
                title="Klinik yang dekat dengan keluarga"
                description="MediCare menyediakan layanan kesehatan untuk seluruh anggota keluarga. Kami memiliki dokter umum dan dokter spesialis yang siap membantu Anda."
              />
              <p className="mt-4 text-base leading-7 text-navy/70">
                Kami ingin proses berobat menjadi lebih mudah, mulai dari melihat jadwal dokter,
                mendaftar kunjungan secara online, sampai datang ke klinik sesuai jadwal.
              </p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Pendaftaran online",
                  "Dokter berpengalaman",
                  "Fasilitas memadai",
                  "Lokasi mudah dijangkau",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-navy sm:text-base">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ocean text-brilliant">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <dl className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-lg bg-brilliant p-4 text-white">
                  <dd className="text-2xl font-extrabold sm:text-3xl">{doctorCount}</dd>
                  <dt className="mt-1 text-xs font-medium text-white/80 sm:text-sm">Dokter</dt>
                </div>
                <div className="rounded-lg bg-mango p-4 text-navy">
                  <dd className="text-2xl font-extrabold sm:text-3xl">{poliCount}</dd>
                  <dt className="mt-1 text-xs font-medium text-navy/75 sm:text-sm">Layanan</dt>
                </div>
                <div className="rounded-lg bg-ocean p-4 text-navy">
                  <dd className="text-2xl font-extrabold sm:text-3xl">24/7</dd>
                  <dt className="mt-1 text-xs font-medium text-navy/75 sm:text-sm">IGD</dt>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* Our Doctors */}
        <section
          id="doctors"
          className="scroll-mt-24 bg-brilliant py-16 text-white sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                light
                eyebrow="Our Doctors"
                title="Dokter yang siap melayani"
                description="Berikut dokter yang terdaftar di MediCare. Jadwal praktik dapat berubah, silakan konfirmasi saat mendaftar."
              />
              <Link
                href={appointmentHref}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-mango px-5 py-3 text-base font-bold text-navy transition-colors hover:bg-white"
              >
                <Icon name="calendar" className="h-5 w-5" />
                Book Appointment
              </Link>
            </div>

            {doctors.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((doctor, index) => (
                  <article
                    key={doctor.id_dokter}
                    className={`rounded-lg border-t-4 bg-white p-5 text-navy ${
                      doctorAccents[index % doctorAccents.length]
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ocean text-lg font-extrabold text-brilliant">
                        {doctorInitials(doctor.nama_dokter)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-navy">
                          {doctor.nama_dokter}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-brilliant">
                          {doctor.spesialis || "Dokter umum"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t-2 border-ocean pt-4 text-sm text-navy/70">
                      <p className="flex items-start gap-2">
                        <Icon name="building" className="mt-0.5 h-4 w-4 shrink-0 text-brilliant" />
                        {doctor.poli?.nama_poli ?? "Poli MediCare"}
                      </p>
                      <p className="mt-2 flex items-start gap-2">
                        <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-brilliant" />
                        {doctor.hari_praktik || "Jadwal menyusul"}
                      </p>
                      <p className="mt-2 flex items-center gap-2">
                        <Icon name="clock" className="h-4 w-4 shrink-0 text-brilliant" />
                        {formatSchedule(doctor)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-10 rounded-lg border-2 border-dashed border-white/30 p-8 text-center text-base text-white/80">
                {hasDataError
                  ? "Data dokter belum dapat dimuat. Silakan muat ulang halaman."
                  : "Belum ada dokter yang ditambahkan admin."}
              </p>
            )}
          </div>
        </section>

        {/* Our Services */}
        <section id="services" className="scroll-mt-24 bg-ocean py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Our Services"
              title="Layanan yang tersedia"
              description="Layanan di MediCare disesuaikan dengan poli yang tersedia di klinik. Pilih layanan yang sesuai dengan kebutuhan Anda."
            />

            {polis.length > 0 ? (
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {polis.map((poli, index) => (
                  <article
                    key={poli.id_poli}
                    className="rounded-lg border-2 border-white bg-white p-5"
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        serviceTints[index % serviceTints.length]
                      }`}
                    >
                      <Icon name={serviceIcon(poli.nama_poli)} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-navy">{poli.nama_poli}</h3>
                    <p className="mt-2 text-sm leading-6 text-navy/70">
                      {poli.keterangan || "Layanan pemeriksaan dan konsultasi kesehatan."}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-10 rounded-lg border-2 border-dashed border-brilliant/25 bg-white p-8 text-center text-base text-navy/60">
                {hasDataError
                  ? "Data layanan belum dapat dimuat. Silakan muat ulang halaman."
                  : "Belum ada layanan yang ditambahkan admin."}
              </p>
            )}
          </div>
        </section>

        {/* Appointment */}
        <section id="appointment" className="scroll-mt-24 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-mango px-6 py-8 sm:px-9 sm:py-10 lg:px-12">
              <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12">
                <div>
                  <SectionHeading
                    eyebrow="Appointment"
                    title="Buat janji kunjungan"
                    description="Daftarkan kunjungan Anda secara online agar proses di klinik lebih cepat. Masuk ke akun MediCare, pilih dokter, lalu tentukan tanggal kunjungan."
                  />

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={dashboardHref ? appointmentHref : "/login"}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brilliant px-5 py-3.5 text-base font-bold text-white transition-colors hover:bg-navy"
                    >
                      {dashboardHref ? "Buka Pendaftaran" : "Book Appointment"}
                      <Icon name="arrow-right" className="h-5 w-5" />
                    </Link>
                    <Link
                      href={dashboardHref ?? "/register"}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3.5 text-base font-bold text-navy transition-colors hover:bg-ocean"
                    >
                      {dashboardHref ? "Dashboard" : "Buat Akun"}
                    </Link>
                  </div>
                </div>

                <ol className="space-y-3 rounded-xl bg-white p-5 sm:p-6">
                  {steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brilliant text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm leading-6 text-navy/75 sm:text-base">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-24 border-t-4 border-ocean bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Contact"
                title="Hubungi MediCare"
                description="Jika ada pertanyaan tentang layanan atau jadwal dokter, silakan hubungi kami melalui kontak di bawah ini."
              />

              <div className="mt-7 space-y-3">
                <div className="flex items-start gap-3 rounded-lg border-2 border-ocean p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean text-brilliant">
                    <Icon name="map-pin" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-navy">Alamat</span>
                    <span className="mt-1 block text-sm leading-6 text-navy/70">
                      {contact.address}
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3 rounded-lg border-2 border-ocean p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean text-brilliant">
                    <Icon name="phone" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-navy">Telepon</span>
                    <span className="mt-1 block text-sm text-navy/70">
                      {contact.phone} · WhatsApp {contact.whatsapp}
                    </span>
                  </span>
                </div>

                <div className="flex items-start gap-3 rounded-lg border-2 border-ocean p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ocean text-brilliant">
                    <Icon name="mail" className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-navy">Email</span>
                    <span className="mt-1 block text-sm text-navy/70">{contact.email}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-brilliant p-6 text-white sm:p-8">
              <div>
                <h3 className="text-xl font-bold">MediCare Klinik &amp; Poliklinik</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">{contact.address}</p>

                <div className="mt-6 border-t border-white/20 pt-5">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <Icon name="clock" className="h-4 w-4 text-mango" />
                    Jam operasional
                  </p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/70">Senin – Jumat</dt>
                      <dd className="font-medium">08.00 – 20.00</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/70">Sabtu</dt>
                      <dd className="font-medium">08.00 – 14.00</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <dt className="text-white/70">Minggu</dt>
                      <dd className="font-medium">IGD 24 jam</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 rounded-lg bg-white/10 p-3.5">
                  <p className="flex items-center gap-2 text-sm font-bold text-mango">
                    <Icon name="shield" className="h-4 w-4" />
                    IGD buka 24 jam
                  </p>
                  <p className="mt-1 text-sm text-white/75">
                    Untuk kondisi darurat, silakan langsung datang ke IGD MediCare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-4 border-mango bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link
                href="/"
                className="inline-flex rounded-lg bg-white px-3 py-2"
                aria-label="MediCare - kembali ke beranda"
              >
                <Image
                  src="/logo-medicare.png"
                  alt="MediCare"
                  width={1774}
                  height={887}
                  sizes="160px"
                  className="h-9 w-auto"
                />
              </Link>
              <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">
                Klinik dengan layanan dokter umum dan spesialis untuk Anda dan keluarga.
              </p>
              <p className="mt-4 text-sm font-semibold text-mango">Your Health, Our Priority.</p>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-mango">Navigasi</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#about", label: "About Us" },
                  { href: "#services", label: "Services" },
                  { href: "#doctors", label: "Doctors" },
                  { href: "#contact", label: "Contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="text-white/70 transition-colors hover:text-mango"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-mango">Layanan</h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                {polis.length > 0 ? (
                  polis.slice(0, 5).map((poli) => (
                    <li key={poli.id_poli}>
                      <a
                        href="#services"
                        className="text-white/70 transition-colors hover:text-mango"
                      >
                        {poli.nama_poli}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-white/50">Belum ada layanan</li>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-mango">Kontak</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-mango" />
                  <span>{contact.address}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="phone" className="h-4 w-4 shrink-0 text-mango" />
                  <span>{contact.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="mail" className="h-4 w-4 shrink-0 text-mango" />
                  <span>{contact.email}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="clock" className="h-4 w-4 shrink-0 text-mango" />
                  <span>IGD buka 24 jam</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} MediCare. Seluruh hak cipta dilindungi.</p>
            <p>MediCare · Your Health, Our Priority.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
