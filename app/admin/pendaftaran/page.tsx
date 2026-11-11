import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { formatDate, formatDateTime, todayISO } from "@/utils/format";
import { savePendaftaran } from "./actions";
import { DeletePendaftaranButton } from "./delete-button";

type RegistrationStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";

type Registration = {
  id_daftar: number;
  id_pasien: number;
  id_dokter: number;
  tgl_daftar: string;
  tgl_kunjungan: string;
  keluhan: string | null;
  status: RegistrationStatus;
  pasien: { nama_pasien: string } | null;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null } | null;
};

type PatientOption = {
  id_pasien: number;
  nama_pasien: string;
};

type DoctorOption = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  poli: { nama_poli: string } | null;
};

const statuses: readonly RegistrationStatus[] = ["menunggu", "dikonfirmasi", "selesai", "dibatalkan"];

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

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
const labelClass = "grid gap-1 text-sm font-medium text-slate-700";

export default async function PendaftaranAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    page?: string | string[];
    notice?: string | string[];
  }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const rawStatus = typeof params.status === "string" ? params.status : "";
  const status = statuses.includes(rawStatus as RegistrationStatus) ? (rawStatus as RegistrationStatus) : undefined;
  const parsedPage = Number(typeof params.page === "string" ? params.page : "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;
  const supabase = await createClient();

  const [patientOptionsResult, doctorOptionsResult] = await Promise.all([
    supabase.from("pasien").select("id_pasien,nama_pasien").order("nama_pasien"),
    supabase.from("dokter").select("id_dokter,nama_dokter,spesialis,poli(nama_poli)").order("nama_dokter"),
  ]);
  const patients = (patientOptionsResult.data ?? []) as PatientOption[];
  const doctors = (doctorOptionsResult.data ?? []) as unknown as DoctorOption[];

  let patientSearchError: string | null = null;
  let matchedPatientIds: number[] | null = null;
  if (query) {
    const { data, error } = await supabase
      .from("pasien")
      .select("id_pasien")
      .ilike("nama_pasien", `%${query}%`);
    if (error) patientSearchError = error.message;
    else matchedPatientIds = (data ?? []).map((row) => row.id_pasien);
  }
  const noPatientMatch = Boolean(query) && matchedPatientIds !== null && matchedPatientIds.length === 0;

  let registrations: Registration[] = [];
  let total = 0;
  let listError: string | null = patientSearchError;
  if (!noPatientMatch && !patientSearchError) {
    let registrationQuery = supabase
      .from("pendaftaran")
      .select(
        "id_daftar,id_pasien,id_dokter,tgl_daftar,tgl_kunjungan,keluhan,status,pasien(nama_pasien),dokter(nama_dokter,poli(nama_poli))",
        { count: "exact" }
      )
      .order("id_daftar", { ascending: false });
    if (status) registrationQuery = registrationQuery.eq("status", status);
    if (query && matchedPatientIds) registrationQuery = registrationQuery.in("id_pasien", matchedPatientIds);
    const registrationResult = await registrationQuery.range((page - 1) * pageSize, page * pageSize - 1);
    registrations = (registrationResult.data ?? []) as unknown as Registration[];
    total = registrationResult.count ?? 0;
    listError = registrationResult.error?.message ?? null;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    if (status) search.set("status", status);
    search.set("page", String(nextPage));
    return `/admin/pendaftaran?${search.toString()}`;
  }

  function registrationForm(registration?: Registration) {
    return (
      <form action={savePendaftaran} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {registration && <input type="hidden" name="id" value={registration.id_daftar} />}
        <label className={labelClass}>
          Pasien
          <select name="id_pasien" required defaultValue={registration?.id_pasien ?? ""} className={inputClass}>
            <option value="">Pilih pasien</option>
            {patients.map((patient) => (
              <option key={patient.id_pasien} value={patient.id_pasien}>
                {patient.nama_pasien}
              </option>
            ))}
          </select>
        </label>
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
            min={registration ? undefined : todayISO()}
            defaultValue={registration?.tgl_kunjungan ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Status
          <select name="status" defaultValue={registration?.status ?? "menunggu"} className={inputClass}>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
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
        <button className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 sm:col-span-2 lg:col-span-3">
          {registration ? "Simpan perubahan" : "Simpan pendaftaran"}
        </button>
      </form>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Kelola Pendaftaran</h1>
        <p className="mt-1 text-slate-600">Catat dan perbarui pendaftaran kunjungan pasien.</p>
      </div>

      {typeof params.notice === "string" && (
        <p role="status" className="break-words rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          {params.notice}
        </p>
      )}
      {patientOptionsResult.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Gagal memuat daftar pasien: {patientOptionsResult.error.message}
        </p>
      )}
      {doctorOptionsResult.error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Gagal memuat daftar dokter: {doctorOptionsResult.error.message}
        </p>
      )}
      {!patientOptionsResult.error && patients.length === 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Tambahkan pasien terlebih dahulu sebelum membuat pendaftaran.{" "}
          <Link href="/admin/pasien" className="font-semibold underline">
            Kelola pasien
          </Link>
        </p>
      )}
      {!doctorOptionsResult.error && patients.length > 0 && doctors.length === 0 && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Tambahkan dokter terlebih dahulu sebelum membuat pendaftaran.{" "}
          <Link href="/admin/dokter" className="font-semibold underline">
            Kelola dokter
          </Link>
        </p>
      )}

      {patients.length > 0 && doctors.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Tambah pendaftaran</h2>
          {registrationForm()}
        </section>
      )}

      <section className="space-y-4">
        <form action="/admin/pendaftaran" className="flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            aria-label="Cari nama pasien"
            placeholder="Cari nama pasien..."
            className={`${inputClass} min-w-0 flex-1`}
          />
          <select
            name="status"
            defaultValue={status ?? ""}
            aria-label="Filter status"
            className={`${inputClass} sm:w-44`}
          >
            <option value="">Semua status</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50">
            Terapkan
          </button>
        </form>

        {listError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            Gagal memuat data pendaftaran: {listError}
          </p>
        ) : registrations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
            {query || status
              ? "Pendaftaran tidak ditemukan."
              : "Belum ada data pendaftaran."}
          </p>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <article key={registration.id_daftar} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {registration.pasien?.nama_pasien ?? "Pasien tidak diketahui"}
                      </h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[registration.status]}`}>
                        {statusLabels[registration.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {registration.dokter?.nama_dokter ?? "Dokter tidak diketahui"} ·{" "}
                      {registration.dokter?.poli?.nama_poli ?? "Poli tidak diketahui"}
                    </p>
                    <p className="text-sm text-slate-600">
                      Kunjungan: {formatDate(registration.tgl_kunjungan)}
                    </p>
                    {registration.keluhan && (
                      <p className="mt-1 text-sm text-slate-600">Keluhan: {registration.keluhan}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Terdaftar: {formatDateTime(registration.tgl_daftar)}
                    </p>
                  </div>
                  <DeletePendaftaranButton id={registration.id_daftar} />
                </div>
                <details className="mt-3 border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-teal-700">Edit pendaftaran</summary>
                  <div className="mt-3">{registrationForm(registration)}</div>
                </details>
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
                <Link href={pageHref(page - 1)} className="rounded-lg border bg-white px-3 py-2">
                  Sebelumnya
                </Link>
              )}
              {page < totalPages && (
                <Link href={pageHref(page + 1)} className="rounded-lg border bg-white px-3 py-2">
                  Berikutnya
                </Link>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
