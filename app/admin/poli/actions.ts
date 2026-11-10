"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const poliSchema = z.object({
  nama_poli: z.string().trim().min(2, "Nama poli minimal 2 karakter").max(30),
  keterangan: z.string().trim().max(100).transform((value) => value || null),
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function showNotice(message: string): never {
  redirect(`/admin/poli?notice=${encodeURIComponent(message)}`);
}

export async function savePoli(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (id && !/^\d+$/.test(id)) showNotice("ID poli tidak valid.");

  const parsed = poliSchema.safeParse({
    nama_poli: field(formData, "nama_poli"),
    keterangan: field(formData, "keterangan"),
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data poli tidak valid.");

  const supabase = await createClient();
  const result = id
    ? await supabase.from("poli").update(parsed.data).eq("id_poli", Number(id)).select("id_poli").maybeSingle()
    : await supabase.from("poli").insert(parsed.data).select("id_poli").single();
  if (result.error) showNotice(`Gagal menyimpan poli: ${result.error.message}`);
  if (!result.data) showNotice("Data poli tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/poli");
  showNotice(id ? "Perubahan poli berhasil disimpan." : "Poli berhasil ditambahkan.");
}

export async function deletePoli(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) showNotice("ID poli tidak valid.");

  const supabase = await createClient();
  const { count, error: doctorError } = await supabase
    .from("dokter")
    .select("id_dokter", { count: "exact", head: true })
    .eq("id_poli", Number(id));
  if (doctorError) showNotice(`Gagal memeriksa dokter pada poli: ${doctorError.message}`);
  if (count) showNotice("Poli tidak dapat dihapus karena masih digunakan dokter. Pindahkan dokter ke poli lain terlebih dahulu.");

  const { data, error } = await supabase
    .from("poli")
    .delete()
    .eq("id_poli", Number(id))
    .select("id_poli")
    .maybeSingle();
  if (error?.code === "23503") {
    showNotice("Poli tidak dapat dihapus karena masih digunakan dokter. Pindahkan dokter ke poli lain terlebih dahulu.");
  }
  if (error) showNotice(`Gagal menghapus poli: ${error.message}`);
  if (!data) showNotice("Data poli tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/poli");
  showNotice("Poli berhasil dihapus.");
}
