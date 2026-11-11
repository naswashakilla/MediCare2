import Link from "next/link";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { formatDate, formatDateLong, formatDateTime, todayISO } from "@/utils/format";
import { PrintButton } from "./print-button";
import { ExportWordButton } from "./export-word-button";

type RegistrationStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";

type RegistrationRow = {
  id_daftar: number;
  tgl_daftar: string;
  tgl_kunjungan: string;
  keluhan: string | null;
  status: RegistrationStatus;
  pasien: { nama_pasien: string } | null;
  dokter: { nama_dokter: string; poli: { nama_poli: string } | null } | null;
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

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal tidak valid");

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2";
const labelClass = "grid gap-1 text-sm font-medium text-slate-700";

export default async function LaporanAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[]; to?: string | string[]; status?: string | string[] }>;
}) {
  const profile = await requireRole("admin");
  const params = await searchParams;

  const rawFrom = typeof params.from === "string" ? params.from : "";
  const rawTo = typeof params.to === "string" ? params.to : "";
  const from = dateSchema.safeParse(rawFrom).success ? rawFrom : "";
  const to = dateSchema.safeParse(rawTo).success ? rawTo : "";
  const rawStatus = typeof params.status === "string" ? params.status : "";
  const status = statuses.includes(rawStatus as RegistrationStatus) ? (rawStatus as RegistrationStatus) : "";
  const invalidRange = Boolean(from && to && from > to);

  let rows: RegistrationRow[] = [];
  let total = 0;
  let error: string | null = null;
  if (!invalidRange) {
    const supabase = await createClient();
    let query = supabase
      .from("pendaftaran")
      .select(
        "id_daftar,tgl_daftar,tgl_kunjungan,keluhan,status,pasien(nama_pasien),dokter(nama_dokter,poli(nama_poli))",
        { count: "exact" }
      );
    if (from) query = query.gte("tgl_kunjungan", from);
    if (to) query = query.lte("tgl_kunjungan", to);
    if (status) query = query.eq("status", status);
    const result = await query.order("tgl_kunjungan").order("id_daftar").limit(500);
    rows = (result.data ?? []) as unknown as RegistrationRow[];
    total = result.count ?? 0;
    error = result.error?.message ?? null;
  }

  const statusTotals = new Map<RegistrationStatus, number>();
  const poliTotals = new Map<string, number>();
  for (const row of rows) {
    statusTotals.set(row.status, (statusTotals.get(row.status) ?? 0) + 1);
    const poli = row.dokter?.poli?.nama_poli ?? "Tanpa poli";
    poliTotals.set(poli, (poliTotals.get(poli) ?? 0) + 1);
  }

  const periodeLabel = from && to
    ? `Periode kunjungan: ${formatDateLong(from)} s.d. ${formatDateLong(to)}`
    : from
      ? `Periode kunjungan: mulai ${formatDateLong(from)}`
      : to
        ? `Periode kunjungan: sampai ${formatDateLong(to)}`
        : "Periode kunjungan: semua tanggal";
  const statusLabel = status ? `Status: ${statusLabels[status]}` : "Status: semua";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 print:max-w-none print:p-0">
      <div className="print:hidden">
        <Link href="/admin" className="text-sm font-medium text-teal-700 hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Laporan Pendaftaran</h1>
        <p className="mt-1 text-slate-600">
          Cetak atau ekspor laporan pendaftaran pasien sesuai periode dan status.
        </p>
      </div>

      {invalidRange && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 print:hidden">
          Tanggal mulai harus lebih kecil atau sama dengan tanggal akhir.
        </p>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 print:hidden">
        <h2 className="mb-4 font-semibold text-slate-900">Filter laporan</h2>
        <form action="/admin/laporan" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className={labelClass}>
            Tanggal mulai
            <input type="date" name="from" defaultValue={from} className={inputClass} />
          </label>
          <label className={labelClass}>
            Tanggal akhir
            <input type="date" name="to" defaultValue={to} className={inputClass} />
          </label>
          <label className={labelClass}>
            Status
            <select name="status" defaultValue={status} className={inputClass}>
              <option value="">Semua status</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {statusLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className="w-full rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800">
              Terapkan filter
            </button>
          </div>
        </form>
      </section>

      <div className="flex flex-wrap gap-2 print:hidden">
        <PrintButton />
        <ExportWordButton fileName={`laporan-pendaftaran-${todayISO()}`} />
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800 print:hidden">
          Gagal memuat data laporan: {error}
        </p>
      )}

      <section id="area-laporan" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-slate-300 pb-4 text-center">
          <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">Poliklinik MediCare</h2>
          <h3 className="text-base font-semibold text-slate-800">Laporan Data Pendaftaran Pasien</h3>
          <p className="muted text-xs text-slate-500">{periodeLabel}</p>
          <p className="muted text-xs text-slate-500">{statusLabel}</p>
        </header>

        <div className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
          <p>
            Total data: <span className="font-semibold">{total}</span>
            {total > rows.length && (
              <span className="text-slate-500"> (menampilkan {rows.length} teratas, persempit filter)</span>
            )}
          </p>
          {statuses.map((item) => (
            <p key={item}>
              {statusLabels[item]}: <span className="font-semibold">{statusTotals.get(item) ?? 0}</span>
            </p>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-600">
            Tidak ada data pendaftaran pada periode dan status yang dipilih.
          </p>
        ) : (
          <div className="mt-4">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-300 px-2 py-2 font-semibold">No</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Nama Pasien</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Dokter</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Poli</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Tgl Daftar</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Tgl Kunjungan</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Keluhan</th>
                  <th className="border border-slate-300 px-2 py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id_daftar} className={index % 2 === 1 ? "bg-slate-50" : undefined}>
                    <td className="border border-slate-300 px-2 py-1.5">{index + 1}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{row.pasien?.nama_pasien ?? "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{row.dokter?.nama_dokter ?? "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{row.dokter?.poli?.nama_poli ?? "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{formatDateTime(row.tgl_daftar)}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{formatDate(row.tgl_kunjungan)}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{row.keluhan ?? "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusStyles[row.status]}`}>
                        {statusLabels[row.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {poliTotals.size > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-800">Rekapitulasi per poli</h4>
                <table className="mt-2 w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 px-2 py-2 font-semibold">Poli</th>
                      <th className="border border-slate-300 px-2 py-2 font-semibold">Jumlah Pendaftaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(poliTotals.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([poli, count]) => (
                        <tr key={poli}>
                          <td className="border border-slate-300 px-2 py-1.5">{poli}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 flex flex-col items-end gap-1 text-sm text-slate-700">
          <p className="muted text-xs text-slate-500">
            Dicetak pada {formatDateTime(new Date().toISOString())} oleh {profile.nama_user}
          </p>
          <div className="mt-6 text-center">
            <p>Mengetahui,</p>
            <p className="font-semibold">Admin Poliklinik MediCare</p>
            <div className="h-16" />
            <p className="font-semibold underline">{profile.nama_user}</p>
          </div>
        </footer>
      </section>
    </main>
  );
}
