import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { saveDokter } from "./actions";
import { DeleteDokterButton } from "./delete-button";

type PoliOption = {
  id_poli: number;
  nama_poli: string;
};

type Dokter = {
  id_dokter: number;
  nama_dokter: string;
  spesialis: string | null;
  id_poli: number;
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  poli: { nama_poli: string } | null;
};

const inputClass = "w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-3.5 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20";
const labelClass = "grid gap-1.5 text-sm font-medium text-slate-700";

export default async function DokterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[]; notice?: string | string[] }>;
}) {
  await requireRole("admin");
  const params = await searchParams;
  const rawQuery = params.q;
  const query = (typeof rawQuery === "string" ? rawQuery : "").trim().slice(0, 100);
  const rawPage = params.page;
  const parsedPage = Number(typeof rawPage === "string" ? rawPage : "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;
  const supabase = await createClient();
  const [doctorResult, poliResult] = await Promise.all([
    supabase
      .from("dokter")
      .select("id_dokter,nama_dokter,spesialis,id_poli,hari_praktik,jam_mulai,jam_selesai,poli(nama_poli)", { count: "exact" })
      .ilike("nama_dokter", `%${query}%`)
      .order("nama_dokter")
      .range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("poli").select("id_poli,nama_poli").order("nama_poli"),
  ]);
  const doctors = (doctorResult.data ?? []) as unknown as Dokter[];
  const polis = (poliResult.data ?? []) as PoliOption[];
  const total = doctorResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const appointmentCounts = await Promise.all(
    doctors.map(async (doctor) => {
      const { count, error } = await supabase
        .from("pendaftaran")
        .select("id_daftar", { count: "exact", head: true })
        .eq("id_dokter", doctor.id_dokter);
      return {
        id: doctor.id_dokter,
        count: count ?? 0,
        error: error?.message,
      };
    })
  );
  const appointmentCountByDoctor = new Map(appointmentCounts.map(({ id, count }) => [id, count]));
  const appointmentCountErrors = appointmentCounts.filter((item) => item.error);

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    search.set("page", String(nextPage));
    return `/admin/dokter?${search.toString()}`;
  }

  function doctorForm(doctor?: Dokter) {
    return (
      <form action={saveDokter} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctor && <input type="hidden" name="id" value={doctor.id_dokter} />}
        <label className={labelClass}>
          Nama dokter
          <input name="nama_dokter" required minLength={2} maxLength={50} defaultValue={doctor?.nama_dokter ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Spesialis
          <input name="spesialis" maxLength={30} defaultValue={doctor?.spesialis ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Poli
          <select name="id_poli" required defaultValue={doctor?.id_poli ?? ""} className={inputClass}>
            <option value="">Pilih poli</option>
            {polis.map((poli) => <option key={poli.id_poli} value={poli.id_poli}>{poli.nama_poli}</option>)}
          </select>
        </label>
        <label className={labelClass}>
          Hari praktik
          <input name="hari_praktik" maxLength={30} placeholder="Contoh: Senin, Rabu, Jumat" defaultValue={doctor?.hari_praktik ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Jam mulai
          <input name="jam_mulai" type="time" required defaultValue={doctor?.jam_mulai?.slice(0, 5) ?? ""} className={inputClass} />
        </label>
        <label className={labelClass}>
          Jam selesai
          <input name="jam_selesai" type="time" required defaultValue={doctor?.jam_selesai?.slice(0, 5) ?? ""} className={inputClass} />
        </label>
        <button className="rounded-xl bg-iced-denim px-4 py-2.5 font-semibold text-white shadow-sm shadow-iced-denim/25 transition hover:bg-iced-denim-dark sm:col-span-2 lg:col-span-3">
          {doctor ? "Simpan perubahan" : "Simpan dokter"}
        </button>
      </form>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-iced-denim-dark">← Dashboard</Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Kelola Dokter</h1>
        <p className="mt-1 text-sm text-slate-500">Kelola poli dan jadwal praktik dokter.</p>
      </div>
      {params.notice && <p role="status" className="break-words rounded-xl border border-iced-denim/20 bg-frost p-3 text-sm text-iced-denim-dark">{params.notice}</p>}
      {appointmentCountErrors.length > 0 && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Gagal memeriksa pendaftaran beberapa dokter. Penghapusan dinonaktifkan sampai koneksi pulih.{" "}
          {appointmentCountErrors[0].error}
        </p>
      )}
      {poliResult.error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">Gagal memuat daftar poli: {poliResult.error.message}</p>
      )}
      {!poliResult.error && polis.length === 0 && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Tambahkan poli terlebih dahulu sebelum membuat data dokter.{" "}
          <Link href="/admin/poli" className="font-semibold underline">Kelola poli</Link>
        </p>
      )}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Tambah dokter</h2>
        {doctorForm()}
      </section>

      <section className="space-y-4">
        <form action="/admin/dokter" className="flex flex-col gap-2 sm:flex-row">
          <input name="q" defaultValue={query} aria-label="Cari nama dokter" placeholder="Cari nama dokter..." className={`${inputClass} min-w-0 flex-1`} />
          <button className="rounded-xl border border-iced-denim/20 bg-frost px-4 py-2.5 font-semibold text-iced-denim-dark transition hover:border-iced-denim/40 hover:bg-white">Cari</button>
        </form>
        {doctorResult.error ? (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">Gagal memuat data dokter: {doctorResult.error.message}</p>
        ) : doctors.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-iced-denim/25 bg-white p-6 text-center text-sm text-slate-600">
            {query ? "Dokter tidak ditemukan." : "Belum ada data dokter."}
          </p>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => {
              const appointmentCount = appointmentCountByDoctor.get(doctor.id_dokter) ?? 0;
              return (
                <article key={doctor.id_dokter} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-900">{doctor.nama_dokter}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {doctor.spesialis || "Dokter"} · {doctor.poli?.nama_poli ?? "Poli"} · {doctor.hari_praktik || "Jadwal belum diatur"}
                      </p>
                      <p className="text-sm text-slate-600">
                        {doctor.jam_mulai?.slice(0, 5) ?? "--:--"}–{doctor.jam_selesai?.slice(0, 5) ?? "--:--"}
                      </p>
                    </div>
                    <DeleteDokterButton
                      id={doctor.id_dokter}
                      disabled={Boolean(appointmentCountErrors.find((entry) => entry.id === doctor.id_dokter)) || appointmentCount > 0}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{appointmentCount} pendaftaran tercatat</p>
                  <details className="mt-3 border-t border-slate-100 pt-3">
                    <summary className="cursor-pointer text-sm font-medium text-iced-denim-dark">Edit dokter</summary>
                    <div className="mt-3">{doctorForm(doctor)}</div>
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
              {page > 1 && <Link href={pageHref(page - 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 transition hover:border-iced-denim/30 hover:bg-frost hover:text-iced-denim-dark">Sebelumnya</Link>}
              {page < totalPages && <Link href={pageHref(page + 1)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 transition hover:border-iced-denim/30 hover:bg-frost hover:text-iced-denim-dark">Berikutnya</Link>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
