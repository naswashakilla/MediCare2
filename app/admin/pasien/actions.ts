"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const patientSchema = z.object({
  id_user: z.string().uuid().nullable(),
  nama_pasien: z.string().trim().min(2, "Nama pasien minimal 2 karakter").max(50),
  nik: z.string().regex(/^\d{16}$/, "NIK harus tepat 16 digit").nullable(),
  tempatlahir: z.string().trim().max(30).transform((value) => value || null),
  tgllahir: z.string().date().nullable(),
  jk: z.enum(["Laki-laki", "Perempuan"]).nullable(),
  alamat: z.string().trim().max(100).transform((value) => value || null),
  no_hp: z.string().trim().max(15).transform((value) => value || null),
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function showNotice(message: string): never {
  redirect(`/admin/pasien?notice=${encodeURIComponent(message)}`);
}

export async function savePasien(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (id && !/^\d+$/.test(id)) showNotice("ID pasien tidak valid.");

  const parsed = patientSchema.safeParse({
    id_user: field(formData, "id_user") || null,
    nama_pasien: field(formData, "nama_pasien"),
    nik: field(formData, "nik") || null,
    tempatlahir: field(formData, "tempatlahir"),
    tgllahir: field(formData, "tgllahir") || null,
    jk: field(formData, "jk") || null,
    alamat: field(formData, "alamat"),
    no_hp: field(formData, "no_hp"),
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data pasien tidak valid.");

  const supabase = await createClient();
  if (parsed.data.id_user) {
    let accountQuery = supabase
      .from("pasien")
      .select("id_pasien")
      .eq("id_user", parsed.data.id_user);
    if (id) accountQuery = accountQuery.neq("id_pasien", Number(id));
    const { data: linkedPatient, error: accountError } = await accountQuery.maybeSingle();
    if (accountError) showNotice(`Gagal memeriksa tautan akun: ${accountError.message}`);
    if (linkedPatient) showNotice("Akun tersebut sudah terhubung ke data pasien lain.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id_user")
      .eq("id_user", parsed.data.id_user)
      .eq("role", "pasien")
      .maybeSingle();
    if (profileError) showNotice(`Gagal memeriksa akun pasien: ${profileError.message}`);
    if (!profile) showNotice("Akun yang dipilih tidak ditemukan atau bukan akun pasien.");
  }

  const result = id
    ? await supabase.from("pasien").update(parsed.data).eq("id_pasien", Number(id)).select("id_pasien").maybeSingle()
    : await supabase.from("pasien").insert(parsed.data).select("id_pasien").single();
  if (result.error?.code === "23505") showNotice("NIK tersebut sudah digunakan pasien lain.");
  if (result.error) showNotice(`Gagal menyimpan pasien: ${result.error.message}`);
  if (!result.data) showNotice("Data pasien tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/pasien");
  revalidatePath("/pasien");
  showNotice(id ? "Perubahan pasien berhasil disimpan." : "Pasien berhasil ditambahkan.");
}

export async function deletePasien(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) showNotice("ID pasien tidak valid.");

  const supabase = await createClient();
  const { count, error: appointmentError } = await supabase
    .from("pendaftaran")
    .select("id_daftar", { count: "exact", head: true })
    .eq("id_pasien", Number(id));
  if (appointmentError) showNotice(`Gagal memeriksa pendaftaran pasien: ${appointmentError.message}`);
  if (count) showNotice("Pasien tidak dapat dihapus karena sudah memiliki riwayat pendaftaran.");

  const { data, error } = await supabase
    .from("pasien")
    .delete()
    .eq("id_pasien", Number(id))
    .select("id_pasien")
    .maybeSingle();
  if (error?.code === "23503") {
    showNotice("Pasien tidak dapat dihapus karena sudah memiliki riwayat pendaftaran.");
  }
  if (error) showNotice(`Gagal menghapus pasien: ${error.message}`);
  if (!data) showNotice("Data pasien tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/pasien");
  revalidatePath("/pasien");
  showNotice("Pasien berhasil dihapus.");
}
