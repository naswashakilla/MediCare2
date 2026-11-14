"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";
import { MAX_VISITS_PER_DOCTOR_PER_DAY } from "@/utils/pendaftaran";

const registrationSchema = z.object({
  id_pasien: z.coerce.number().int().positive("Pilih pasien yang valid"),
  id_dokter: z.coerce.number().int().positive("Pilih dokter yang valid"),
  tgl_kunjungan: z.string().date("Tanggal kunjungan tidak valid"),
  keluhan: z.string().trim().max(200, "Keluhan maksimal 200 karakter").transform((value) => value || null),
  status: z.enum(["menunggu", "dikonfirmasi", "selesai", "dibatalkan"]),
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function showNotice(message: string): never {
  redirect(`/admin/pendaftaran?notice=${encodeURIComponent(message)}`);
}

export async function savePendaftaran(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (id && !/^\d+$/.test(id)) showNotice("ID pendaftaran tidak valid.");

  const parsed = registrationSchema.safeParse({
    id_pasien: field(formData, "id_pasien"),
    id_dokter: field(formData, "id_dokter"),
    tgl_kunjungan: field(formData, "tgl_kunjungan"),
    keluhan: field(formData, "keluhan"),
    status: field(formData, "status") || "menunggu",
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data pendaftaran tidak valid.");

  const supabase = await createClient();
  const { count: patientCount, error: patientError } = await supabase
    .from("pasien")
    .select("id_pasien", { count: "exact", head: true })
    .eq("id_pasien", parsed.data.id_pasien);
  if (patientError) showNotice(`Gagal memeriksa pasien: ${patientError.message}`);
  if (!patientCount) showNotice("Pasien yang dipilih tidak ditemukan.");

  const { count: doctorCount, error: doctorError } = await supabase
    .from("dokter")
    .select("id_dokter", { count: "exact", head: true })
    .eq("id_dokter", parsed.data.id_dokter);
  if (doctorError) showNotice(`Gagal memeriksa dokter: ${doctorError.message}`);
  if (!doctorCount) showNotice("Dokter yang dipilih tidak ditemukan.");

  const registrationId = id ? Number(id) : null;
  let existingRegistration: {
    id_dokter: number;
    tgl_kunjungan: string;
    status: "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";
  } | null = null;
  if (registrationId !== null) {
    const { data, error } = await supabase
      .from("pendaftaran")
      .select("id_dokter,tgl_kunjungan,status")
      .eq("id_daftar", registrationId)
      .maybeSingle();
    if (error) showNotice(`Gagal memeriksa pendaftaran: ${error.message}`);
    existingRegistration = data;
  }

  const increasesCapacity = parsed.data.status !== "dibatalkan" && (
    registrationId === null ||
    !existingRegistration ||
    existingRegistration.status === "dibatalkan" ||
    existingRegistration.id_dokter !== parsed.data.id_dokter ||
    existingRegistration.tgl_kunjungan !== parsed.data.tgl_kunjungan
  );
  if (increasesCapacity) {
    let capacityQuery = supabase
      .from("pendaftaran")
      .select("id_daftar", { count: "exact", head: true })
      .eq("id_dokter", parsed.data.id_dokter)
      .eq("tgl_kunjungan", parsed.data.tgl_kunjungan)
      .neq("status", "dibatalkan");
    if (registrationId !== null) capacityQuery = capacityQuery.neq("id_daftar", registrationId);
    const { count, error } = await capacityQuery;
    if (error) showNotice(`Gagal memeriksa kuota dokter: ${error.message}`);
    if (count === null) showNotice("Gagal memeriksa kuota dokter.");
    if (count >= MAX_VISITS_PER_DOCTOR_PER_DAY) {
      showNotice(`Kuota dokter untuk tanggal tersebut sudah penuh (maksimal ${MAX_VISITS_PER_DOCTOR_PER_DAY} pasien).`);
    }
  }

  const payload = {
    id_pasien: parsed.data.id_pasien,
    id_dokter: parsed.data.id_dokter,
    tgl_kunjungan: parsed.data.tgl_kunjungan,
    keluhan: parsed.data.keluhan,
    status: parsed.data.status,
  };

  const result = id
    ? await supabase.from("pendaftaran").update(payload).eq("id_daftar", Number(id)).select("id_daftar").maybeSingle()
    : await supabase.from("pendaftaran").insert(payload).select("id_daftar").single();
  if (result.error?.code === "P0001" && result.error.message.toLowerCase().includes("kuota dokter")) {
    showNotice(`Kuota dokter untuk tanggal tersebut sudah penuh (maksimal ${MAX_VISITS_PER_DOCTOR_PER_DAY} pasien).`);
  }
  if (result.error) showNotice(`Gagal menyimpan pendaftaran: ${result.error.message}`);
  if (!result.data) showNotice("Data pendaftaran tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/pendaftaran");
  revalidatePath("/pasien");
  showNotice(id ? "Perubahan pendaftaran berhasil disimpan." : "Pendaftaran berhasil ditambahkan.");
}

export async function deletePendaftaran(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) showNotice("ID pendaftaran tidak valid.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pendaftaran")
    .delete()
    .eq("id_daftar", Number(id))
    .select("id_daftar")
    .maybeSingle();
  if (error) showNotice(`Gagal menghapus pendaftaran: ${error.message}`);
  if (!data) showNotice("Data pendaftaran tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/pendaftaran");
  revalidatePath("/pasien");
  showNotice("Pendaftaran berhasil dihapus.");
}
