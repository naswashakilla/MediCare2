import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { saveProfile } from "./actions";

type Patient = {
  id_pasien: number;
  nama_pasien: string;
  nik: string | null;
  tempatlahir: string | null;
  tgllahir: string | null;
  jk: "Laki-laki" | "Perempuan" | null;
  alamat: string | null;
  no_hp: string | null;
};

const inputClass = "w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-3.5 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20";
const labelClass = "grid gap-1.5 text-sm font-medium text-slate-700";

export default async function ProfilPasienPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string | string[] }>;
}) {
  const account = await requireRole("pasien");
  const params = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pasien")
    .select("id_pasien,nama_pasien,nik,tempatlahir,tgllahir,jk,alamat,no_hp")
    .eq("id_user", account.id_user)
    .limit(1);
  const patient = ((data ?? [])[0] ?? null) as Patient | null;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">
          Data ini digunakan oleh petugas klinik saat Anda mendaftar kunjungan.
        </p>
      </div>

      {typeof params.notice === "string" && (
        <p role="status" className="break-words rounded-xl border border-iced-denim/20 bg-frost p-3 text-sm text-iced-denim-dark">
          {params.notice}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Gagal memuat profil: {error.message}
        </p>
      )}

      {!patient && !error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Akun Anda belum memiliki data pasien. Lengkapi formulir di bawah agar dapat mendaftar kunjungan.
        </p>
      )}

      <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
        <div className="mb-4 grid gap-1 rounded-xl border border-iced-denim/15 bg-frost/60 p-3 text-sm text-slate-600">
          <span>
            Nama akun: <span className="font-medium text-slate-800">{account.nama_user}</span>
          </span>
          <span>
            Email: <span className="font-medium text-slate-800">{account.email}</span>
          </span>
        </div>

        <form action={saveProfile} className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Nama lengkap
            <input
              name="nama_pasien"
              required
              minLength={2}
              maxLength={50}
              defaultValue={patient?.nama_pasien ?? account.nama_user}
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
          <label className={`${labelClass} sm:col-span-2`}>
            Alamat
            <textarea name="alamat" maxLength={100} rows={3} defaultValue={patient?.alamat ?? ""} className={inputClass} />
          </label>
          <button className="rounded-xl bg-iced-denim px-4 py-2.5 font-semibold text-white shadow-sm shadow-iced-denim/25 transition hover:bg-iced-denim-dark sm:col-span-2">
            {patient ? "Simpan perubahan" : "Simpan profil"}
          </button>
        </form>
      </section>

      <p className="text-sm text-slate-500">
        Butuh mengubah data lain? <Link href="/pasien/pendaftaran" className="font-medium text-iced-denim-dark hover:underline">Lihat pendaftaran saya</Link>
      </p>
    </main>
  );
}
