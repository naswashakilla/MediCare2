import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { savePasien } from "./actions";
import { DeletePasienButton } from "./delete-button";

type Patient = {
  id_pasien: number;
  id_user: string | null;
  nama_pasien: string;
  nik: string | null;
  tempatlahir: string | null;
  tgllahir: string | null;
  jk: "Laki-laki" | "Perempuan" | null;
  alamat: string | null;
  no_hp: string | null;
};

type PatientAccount = {
  id_user: string;
  email: string;
};

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
const labelClass = "grid gap-1 text-sm font-medium text-slate-700";

export default async function PasienAdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    page?: string | string[];
    notice?: string | string[];
  }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 100);
  const parsedPage = Number(typeof params.page === "string" ? params.page : "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;
  const supabase = await createClient();
  const [patientResult, accountResult] = await Promise.all([
    supabase
      .from("pasien")
      .select("id_pasien,id_user,nama_pasien,nik,tempatlahir,tgllahir,jk,alamat,no_hp", { count: "exact" })
      .ilike("nama_pasien", `%${query}%`)
      .order("nama_pasien")
      .range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("profiles").select("id_user,email").eq("role", "pasien").order("email"),
  ]);
  const patients = (patientResult.data ?? []) as Patient[];
  const accounts = (accountResult.data ?? []) as PatientAccount[];
  const total = patientResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const linkedAccountIds = new Set(
    patients.flatMap((patient) =>
      patient.id_user ? [patient.id_user] : []
    )
  );
  const doctorCounts = await Promise.all(
    patients.map(async (patient) => {
      const { count, error } = await supabase
        .from("pendaftaran")
        .select("id_daftar", { count: "exact", head: true })
        .eq("id_pasien", patient.id_pasien);
      return { id: patient.id_pasien, count: count ?? 0, error: error?.message };
    })
  );
  const appointmentCountByPatient = new Map(
    doctorCounts.map(({ id, count }) => [id, count])
  );
  const appointmentErrors = doctorCounts.filter((item) => item.error);
  const accountError = accountResult.error;
  const patientError = patientResult.error;

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    search.set("page", String(nextPage));
    return `/admin/pasien?${search.toString()}`;
  }

  function patientForm(patient?: Patient) {
    return (
      <form action={savePasien} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {patient && <input type="hidden" name="id" value={patient.id_pasien} />}
        <label className={labelClass}>
          Nama lengkap
          <input
            name="nama_pasien"
            required
            minLength={2}
            maxLength={50}
            defaultValue={patient?.nama_pasien ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          NIK (16 digit)
          <input
            name="nik"
            inputMode="numeric"
            pattern="[0-9]{16}"
            maxLength={16}
            defaultValue={patient?.nik ?? ""}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Akun pasien (opsional)
          <select name="id_user" defaultValue={patient?.id_user ?? ""} className={inputClass}>
            <option value="">Tidak ditautkan</option>
            {accounts.map((account) => (
              <option
                key={account.id_user}
                value={account.id_user}
                disabled={linkedAccountIds.has(account.id_user) && account.id_user !== patient?.id_user}
              >
                {account.email}
                {linkedAccountIds.has(account.id_user) && account.id_user !== patient?.id_user
                  ? " (sudah tertaut)"
                  : ""}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Tempat lahir
          <input name="tempatlahir" maxLength={30} defaultValue={patient?.tempatlahir ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Tanggal lahir
          <input name="tgllahir" type="date" defaultValue={patient?.tgllahir ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Jenis kelamin
          <select name="jk" defaultValue={patient?.jk ?? ""} className={inputClass}>
            <option value="">Pilih</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
        </label>
        <label className={labelClass}>
          Nomor telepon
          <input name="no_hp" type="tel" maxLength={15} defaultValue={patient?.no_hp ?? ""} className={inputClass} />
        </label>
        <label className={`${labelClass} sm:col-span-2 lg:col-span-2`}>
          Alamat
          <textarea name="alamat" maxLength={100} defaultValue={patient?.alamat ?? ""} className={inputClass} />
        </label>
        <button className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 sm:col-span-2 lg:col-span-3">
          {patient ? "Simpan perubahan" : "Simpan pasien"}
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
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Kelola Pasien</h1>
        <p className="mt-1 text-slate-600">Kelola data pasien dan tautan akun login.</p>
      </div>
      {typeof params.notice === "string" && (
        <p role="status" className="break-words rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
          {params.notice}
        </p>
      )}
      {accountError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Gagal memuat akun pasien: {accountError.message}
        </p>
      )}
      {appointmentErrors.length > 0 && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Gagal memeriksa riwayat beberapa pasien. Penghapusan dinonaktifkan sampai koneksi pulih.{" "}
          {appointmentErrors[0].error}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Tambah pasien</h2>
        {patientForm()}
      </section>

      <section className="space-y-4">
        <form action="/admin/pasien" className="flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            aria-label="Cari nama pasien"
            placeholder="Cari nama pasien..."
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50">
            Cari
          </button>
        </form>

        {patientError ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            Gagal memuat data pasien: {patientError.message}
          </p>
        ) : patients.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
            {query ? "Pasien tidak ditemukan." : "Belum ada data pasien."}
          </p>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => {
              const appointmentCount = appointmentCountByPatient.get(patient.id_pasien) ?? 0;
              const account = accounts.find((item) => item.id_user === patient.id_user);
              return (
                <article key={patient.id_pasien} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-semibold text-slate-900">{patient.nama_pasien}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        NIK: {patient.nik || "—"} · Telepon: {patient.no_hp || "—"}
                      </p>
                      <p className="text-sm text-slate-600">Akun: {account?.email ?? "Belum ditautkan"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {appointmentCount} pendaftaran tercatat
                      </p>
                    </div>
                    <DeletePasienButton
                      id={patient.id_pasien}
                      disabled={
                        Boolean(appointmentErrors.find((entry) => entry.id === patient.id_pasien)) ||
                        appointmentCount > 0
                      }
                    />
                  </div>
                  <details className="mt-3 border-t border-slate-100 pt-3">
                    <summary className="cursor-pointer text-sm font-medium text-teal-700">Edit pasien</summary>
                    <div className="mt-3">{patientForm(patient)}</div>
                  </details>
                </article>
              );
            })}
          </div>
        )}

        {total > 0 && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-600">Halaman {page} dari {totalPages} ({total} data)</span>
            <div className="flex gap-2">
              {page > 1 && <Link href={pageHref(page - 1)} className="rounded-lg border bg-white px-3 py-2">Sebelumnya</Link>}
              {page < totalPages && <Link href={pageHref(page + 1)} className="rounded-lg border bg-white px-3 py-2">Berikutnya</Link>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
