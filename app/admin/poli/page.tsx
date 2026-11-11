import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { savePoli } from "./actions";
import { DeletePoliButton } from "./delete-button";

type Poli = {
  id_poli: number;
  nama_poli: string;
  keterangan: string | null;
};

type DoctorCount = {
  id: number;
  count: number;
  error?: string;
};

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";

export default async function PoliPage({
  searchParams,
}: PageProps<"/admin/poli">) {
  await requireRole("admin");
  const params = await searchParams;
  const rawQuery = params.q;
  const query = (typeof rawQuery === "string" ? rawQuery : "").trim().slice(0, 100);
  const rawPage = params.page;
  const parsedPage = Number(typeof rawPage === "string" ? rawPage : "1");
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("poli")
    .select("id_poli,nama_poli,keterangan", { count: "exact" })
    .ilike("nama_poli", `%${query}%`)
    .order("nama_poli")
    .range((page - 1) * pageSize, page * pageSize - 1);
  const poli = (data ?? []) as Poli[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const doctorCounts = await Promise.all(
    poli.map(async (item): Promise<DoctorCount> => {
      const { count: doctorCount, error: doctorError } = await supabase
        .from("dokter")
        .select("id_dokter", { count: "exact", head: true })
        .eq("id_poli", item.id_poli);
      return {
        id: item.id_poli,
        count: doctorCount ?? 0,
        error: doctorError?.message,
      };
    })
  );
  const doctorCountByPoli = new Map(doctorCounts.map(({ id, count }) => [id, count]));
  const doctorCountErrors = doctorCounts.filter((item) => item.error);

  function pageHref(nextPage: number) {
    const search = new URLSearchParams();
    if (query) search.set("q", query);
    search.set("page", String(nextPage));
    return `/admin/poli?${search.toString()}`;
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">← Dashboard</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Kelola Poli</h1>
        <p className="mt-1 text-slate-600">Tambah, cari, ubah, dan hapus data poli.</p>
      </div>

      {params.notice && (
        <p role="status" className="break-words rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{params.notice}</p>
      )}
      {doctorCountErrors.length > 0 && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Gagal memeriksa dokter pada beberapa poli. Penghapusan dinonaktifkan sampai koneksi pulih.{" "}
          {doctorCountErrors[0].error}
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="font-semibold text-slate-900">Tambah poli</h2>
        <form action={savePoli} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Nama poli
            <input name="nama_poli" required minLength={2} maxLength={30} className={inputClass} />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Keterangan
            <input name="keterangan" maxLength={100} className={inputClass} />
          </label>
          <button className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 sm:col-span-2">
            Simpan poli
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <form action="/admin/poli" className="flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            defaultValue={query}
            aria-label="Cari nama poli"
            placeholder="Cari nama poli..."
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium hover:bg-slate-50">Cari</button>
        </form>

        {error ? (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
            Gagal memuat data poli: {error.message}
          </p>
        ) : poli.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
            {query ? "Poli tidak ditemukan." : "Belum ada data poli."}
          </p>
        ) : (
          <div className="space-y-3">
            {poli.map((item) => (
              <article key={item.id_poli} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">{item.nama_poli}</h2>
                    <p className="mt-1 text-sm text-slate-600">{item.keterangan || "Tidak ada keterangan"}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {doctorCountByPoli.get(item.id_poli) ?? 0} dokter menggunakan poli ini
                    </p>
                  </div>
                  <DeletePoliButton
                    id={item.id_poli}
                    disabled={Boolean(doctorCountErrors.find((entry) => entry.id === item.id_poli)) ||
                      (doctorCountByPoli.get(item.id_poli) ?? 0) > 0}
                  />
                </div>
                <details className="mt-3 border-t border-slate-100 pt-3">
                  <summary className="cursor-pointer text-sm font-medium text-teal-700">Edit poli</summary>
                  <form action={savePoli} className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input type="hidden" name="id" value={item.id_poli} />
                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                      Nama poli
                      <input name="nama_poli" required minLength={2} maxLength={30} defaultValue={item.nama_poli} className={inputClass} />
                    </label>
                    <label className="grid gap-1 text-sm font-medium text-slate-700">
                      Keterangan
                      <input name="keterangan" maxLength={100} defaultValue={item.keterangan ?? ""} className={inputClass} />
                    </label>
                    <button className="rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 sm:col-span-2">
                      Simpan perubahan
                    </button>
                  </form>
                </details>
              </article>
            ))}
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
