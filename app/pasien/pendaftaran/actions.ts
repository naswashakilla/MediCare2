"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { todayISO } from "@/utils/format";
import { MAX_VISITS_PER_DOCTOR_PER_DAY } from "@/utils/pendaftaran";

const registrationSchema = z.object({
  id_dokter: z.coerce.number().int().positive("Pilih dokter yang valid"),
  tgl_kunjungan: z.string().date("Tanggal kunjungan tidak valid"),
  keluhan: z.string().trim().max(200, "Keluhan maksimal 200 karakter").transform((value) => value || null),
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function showNotice(message: string): never {
  redirect(`/pasien/pendaftaran?notice=${encodeURIComponent(message)}`);
}

export async function savePendaftaran(formData: FormData) {
  const account = await requireRole("pasien");
  const id = field(formData, "id");
  if (id && !/^\d+$/.test(id)) showNotice("ID pendaftaran tidak valid.");

  const parsed = registrationSchema.safeParse({
    id_dokter: field(formData, "id_dokter"),
    tgl_kunjungan: field(formData, "tgl_kunjungan"),
    keluhan: field(formData, "keluhan"),
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.");

  if (parsed.data.tgl_kunjungan < todayISO()) showNotice("Tanggal kunjungan tidak boleh di masa lalu.");

  const supabase = await createClient();
  const { data: patientRows, error: patientError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_user", account.id_user)
    .limit(1);
  if (patientError) showNotice(`Gagal memeriksa profil: ${patientError.message}`);
  const patient = patientRows?.[0];
  if (!patient) showNotice("Lengkapi profil Anda terlebih dahulu sebelum mendaftar.");

  const { count: doctorCount, error: doctorError } = await supabase
    .from("dokter")
    .select("id_dokter", { count: "exact", head: true })
    .eq("id_dokter", parsed.data.id_dokter);
  if (doctorError) showNotice(`Gagal memeriksa dokter: ${doctorError.message}`);
  if (!doctorCount) showNotice("Dokter yang dipilih tidak ditemukan.");

  if (id) {
    const { data: existing, error: fetchError } = await supabase
      .from("pendaftaran")
      .select("id_daftar,status,id_pasien")
      .eq("id_daftar", Number(id))
      .maybeSingle();
    if (fetchError) showNotice(`Gagal memeriksa pendaftaran: ${fetchError.message}`);
    if (!existing || existing.id_pasien !== patient.id_pasien) showNotice("Pendaftaran tidak ditemukan.");
    if (existing.status !== "menunggu") showNotice("Hanya pendaftaran berstatus menunggu yang dapat diubah.");
  }

  if (id) {
    const { data, error } = await supabase
      .from("pendaftaran")
      .update({
        id_dokter: parsed.data.id_dokter,
        tgl_kunjungan: parsed.data.tgl_kunjungan,
        keluhan: parsed.data.keluhan,
      })
      .eq("id_daftar", Number(id))
      .select("id_daftar")
      .maybeSingle();
    if (error?.code === "P0001" && error.message.toLowerCase().includes("kuota dokter")) {
      showNotice(`Kuota dokter untuk tanggal tersebut sudah penuh (maksimal ${MAX_VISITS_PER_DOCTOR_PER_DAY} pasien).`);
    }
    if (error) showNotice(`Gagal menyimpan perubahan: ${error.message}`);
    if (!data) showNotice("Pendaftaran tidak ditemukan.");
  } else {
    const { error } = await supabase.from("pendaftaran").insert({
      id_pasien: patient.id_pasien,
      id_dokter: parsed.data.id_dokter,
      tgl_kunjungan: parsed.data.tgl_kunjungan,
      keluhan: parsed.data.keluhan,
      status: "menunggu",
    });
    if (error?.code === "P0001" && error.message.toLowerCase().includes("kuota dokter")) {
      showNotice(`Kuota dokter untuk tanggal tersebut sudah penuh (maksimal ${MAX_VISITS_PER_DOCTOR_PER_DAY} pasien).`);
    }
    if (error) showNotice(`Gagal menyimpan pendaftaran: ${error.message}`);
  }

  revalidatePath("/pasien");
  revalidatePath("/pasien/pendaftaran");
  revalidatePath("/admin");
  revalidatePath("/admin/pendaftaran");
  showNotice(id ? "Perubahan pendaftaran berhasil disimpan." : "Pendaftaran kunjungan berhasil dibuat.");
}

export async function cancelPendaftaran(formData: FormData) {
  const account = await requireRole("pasien");
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) showNotice("ID pendaftaran tidak valid.");

  const supabase = await createClient();
  const { data: patientRows, error: patientError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_user", account.id_user)
    .limit(1);
  if (patientError) showNotice(`Gagal memeriksa profil: ${patientError.message}`);
  const patient = patientRows?.[0];
  if (!patient) showNotice("Profil pasien tidak ditemukan.");

  const { data: existing, error: fetchError } = await supabase
    .from("pendaftaran")
    .select("id_daftar,status,id_pasien")
    .eq("id_daftar", Number(id))
    .maybeSingle();
  if (fetchError) showNotice(`Gagal memeriksa pendaftaran: ${fetchError.message}`);
  if (!existing || existing.id_pasien !== patient.id_pasien) showNotice("Pendaftaran tidak ditemukan.");
  if (existing.status !== "menunggu" && existing.status !== "dikonfirmasi") {
    showNotice("Pendaftaran yang sudah selesai atau dibatalkan tidak dapat dibatalkan lagi.");
  }

  const { data, error } = await supabase
    .from("pendaftaran")
    .update({ status: "dibatalkan" })
    .eq("id_daftar", Number(id))
    .select("id_daftar")
    .maybeSingle();
  if (error) showNotice(`Gagal membatalkan pendaftaran: ${error.message}`);
  if (!data) showNotice("Pendaftaran tidak ditemukan.");

  revalidatePath("/pasien");
  revalidatePath("/pasien/pendaftaran");
  revalidatePath("/admin");
  revalidatePath("/admin/pendaftaran");
  showNotice("Pendaftaran berhasil dibatalkan.");
}
