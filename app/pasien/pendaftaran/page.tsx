import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { formatDate, formatDateTime, todayISO } from "@/utils/format";
import { savePendaftaran } from "./actions";
import { CancelPendaftaranButton } from "./cancel-button";
import { MAX_VISITS_PER_DOCTOR_PER_DAY } from "./constants";

type RegistrationStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";

type Registration = {
  id_daftar: number;
  id_dokter: number;
  tgl_daftar: string;
  tgl_kunjungan: string;
  keluhan: string | null;
  status: RegistrationStatus;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null } | null;
};

type DoctorOption = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  hari_praktik: string | null;
  poli: { nama_poli: string } | null;
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

const inputClass = "w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-3.5 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20";
const labelClass = "grid gap-1.5 text-sm font-medium text-slate-700";

export default async function PendaftaranPasienPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; notice?: string | string[] }>;
}) {
  const account = await requireRole("pasien");
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const parsedPage = Number(typeof params.page === "string" ? params.page : "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 5;
  const supabase = await createClient();

  const [patientResult, doctorResult] = await Promise.all([
    supabase
      .from("pasien")
      .select("id_pasien,nama_pasien")
      .eq("id_user", account.id_user)
      .limit(1),
    supabase
      .from("dokter")
      .select("id_dokter,nama_dokter,spesialis,hari_praktik,poli(nama_poli)")
      .order("nama_dokter"),
  ]);
  const patient = ((patientResult.data ?? [])[0] ?? null) as { id_pasien: number; nama_pasien: string } | null;
  const doctors = (doctorResult.data ?? []) as unknown as DoctorOption[];

  let registrations: Registration[] = [];
  let total = 0;
  let listError: string | null = null;
  if (patientResult.error) {
    listError = patientResult.error.message;
  } else if (patient) {
    let matchedDoctorIds: number[] | null = null;
    if (query) {
      const { data, error } = await supabase
        .from("dokter")
        .select("id_dokter")
        .ilike("nama_dokter", `%${query}%`);
      if (error) listError = error.message;
      else matchedDoctorIds = (data ?? []).map((row) => row.id_dokter);
    }
    const noDoctorMatch = Boolean(query) && matchedDoctorIds !== null && matchedDoctorIds.length === 0;

    if (!noDoctorMatch && !listError) {
      let registrationQuery = supabase
        .from("pendaftaran")
        .select("id_daftar,id_dokter,tgl_daftar,tgl_kunjungan,keluhan,status,dokter(nama_dokter,poli(nama_poli))", {
          count: "exact",
        })
        .eq("id_pasien", patient.id_pasien)
        .order("id_daftar", { ascending: false });
      if (query && matchedDoctorIds) registrationQuery = registrationQuery.in("id_dokter", matchedDoctorIds);
      const registrationResult = await registrationQuery.range((page - 1) * pageSize, page * pageSize - 1);
      registrations = (registrationResult.data ?? []) as unknown as Registration[];
      total = registrationResult.count ?? 0;
      listError = registrationResult.error?.message ?? null;
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    search.set("page", String(nextPage));
    return `/pasien/pendaftaran?${search.toString()}`;
  }

  function registrationForm(registration?: Registration) {
    return (
      <form action={savePendaftaran} className="grid gap-4 sm:grid-cols-2">
        {registration && <input type="hidden" name="id" value={registration.id_daftar} />}
        <label className={labelClass}>
          Dokter
          <select name="id_dokter" required defaultValue={registration?.id_dokter ?? ""} className={inputClass}>
            <option value="">Pilih dokter</option>
            {doctors.map((doctor) => (
              <option key={doctor.id_dokter} value={doctor.id_dokter}>
                {doctor.nama_dokter} — {doctor.poli?.nama_poli ?? "Poli"}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Tanggal kunjungan
          <input
            name="tgl_kunjungan"
            type="date"
            required
            min={todayISO()}
            defaultValue={registration?.tgl_kunjungan ?? ""}
            className={inputClass}
          />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Keluhan (opsional)
          <textarea
            name="keluhan"
            maxLength={200}
            rows={3}
            placeholder="Contoh: demam dan batuk sejak 2 hari"
            defaultValue={registration?.keluhan ?? ""}
            className={inputClass}
          />
        </label>
        <button className="rounded-xl bg-iced-denim px-4 py-2.5 font-semibold text-white shadow-sm shadow-iced-denim/25 transition hover:bg-iced-denim-dark sm:col-span-2">
          {registration ? "Simpan perubahan" : "Daftar kunjungan"}
        </button>
      </form>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Pendaftaran Saya</h1>
        <p className="mt-1 text-sm text-slate-500">Daftarkan kunjungan Anda dan pantau statusnya.</p>
      </div>

      {typeof params.notice === "string" && (
        <p role="status" className="break-words rounded-xl border border-iced-denim/20 bg-frost p-3 text-sm text-iced-denim-dark">
          {params.notice}
        </p>
      )}
      {doctorResult.error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Gagal memuat daftar dokter: {doctorResult.error.message}
        </p>
      )}

      {!patient && !patientResult.error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Anda belum memiliki data pasien.{" "}
          <Link href="/pasien/profil" className="font-semibold underline">
            Lengkapi profil Anda
          </Link>{" "}
          terlebih dahulu agar dapat mendaftar kunjungan.
        </p>
      )}

      {patient && !doctorResult.error && doctors.length > 0 && (
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Daftar kunjungan baru</h2>
          {registrationForm()}
          <p className="mt-3 text-xs text-slate-500">
            Pendaftaran baru berstatus <span className="font-medium text-amber-700">menunggu</span> sampai dikonfirmasi
            petugas klinik.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Setiap dokter menerima maksimal {MAX_VISITS_PER_DOCTOR_PER_DAY} pasien per tanggal. Kuota yang penuh tidak dapat
            didaftarkan.
          </p>
        </section>
      )}

      {patient && (
        <section className="space-y-4">
          <form action="/pasien/pendaftaran" className="flex flex-col gap-2 sm:flex-row">
            <input
              name="q"
              defaultValue={query}
              aria-label="Cari nama dokter"
              placeholder="Cari nama dokter..."
              className={`${inputClass} min-w-0 flex-1`}
            />
            <button className="rounded-xl border border-iced-denim/20 bg-frost px-4 py-2.5 font-semibold text-iced-denim-dark transition hover:border-iced-denim/40 hover:bg-white">
              Cari
            </button>
          </form>

          {listError ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Gagal memuat data pendaftaran: {listError}
            </p>
          ) : registrations.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-iced-denim/25 bg-white p-6 text-center text-sm text-slate-600">
              {query ? "Pendaftaran tidak ditemukan." : "Belum ada pendaftaran kunjungan."}
            </p>
          ) : (
            <div className="space-y-3">
              {registrations.map((registration) => (
                <article key={registration.id_daftar} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-slate-900">
                          {registration.dokter?.nama_dokter ?? "Dokter tidak diketahui"}
                        </h2>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[registration.status]}`}>
                          {statusLabels[registration.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        {registration.dokter?.poli?.nama_poli ?? "Poli tidak diketahui"} · Kunjungan:{" "}
                        {formatDate(registration.tgl_kunjungan)}
                      </p>
                      {registration.keluhan && (
                        <p className="mt-1 text-sm text-slate-600">Keluhan: {registration.keluhan}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">
                        Terdaftar: {formatDateTime(registration.tgl_daftar)}
                      </p>
                    </div>
                    {(registration.status === "menunggu" || registration.status === "dikonfirmasi") && (
                      <CancelPendaftaranButton id={registration.id_daftar} />
                    )}
                  </div>
                  {registration.status === "menunggu" && (
                    <details className="mt-3 border-t border-slate-100 pt-3">
                      <summary className="cursor-pointer text-sm font-medium text-iced-denim-dark">Ubah pendaftaran</summary>
                      <div className="mt-3">{registrationForm(registration)}</div>
                    </details>
                  )}
                </article>
              ))}
            </div>
          )}

          {total > 0 && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">
                Halaman {page} dari {totalPages} ({total} data)
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 transition hover:border-iced-denim/30 hover:bg-frost hover:text-iced-denim-dark">
                    Sebelumnya
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={pageHref(page + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 transition hover:border-iced-denim/30 hover:bg-frost hover:text-iced-denim-dark">
                    Berikutnya
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
