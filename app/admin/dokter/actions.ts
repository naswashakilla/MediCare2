"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const doctorSchema = z.object({
  nama_dokter: z.string().trim().min(2, "Nama dokter minimal 2 karakter").max(50),
  spesialis: z.string().trim().max(30).transform((value) => value || null),
  id_poli: z.coerce.number().int().positive("Pilih poli yang valid"),
  hari_praktik: z.string().trim().max(30).transform((value) => value || null),
  jam_mulai: z.string().regex(/^\d{2}:\d{2}$/, "Jam mulai tidak valid"),
  jam_selesai: z.string().regex(/^\d{2}:\d{2}$/, "Jam selesai tidak valid"),
}).refine((data) => data.jam_selesai > data.jam_mulai, {
  message: "Jam selesai harus setelah jam mulai.",
  path: ["jam_selesai"],
});

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function showNotice(message: string): never {
  redirect(`/admin/dokter?notice=${encodeURIComponent(message)}`);
}

export async function saveDokter(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (id && !/^\d+$/.test(id)) showNotice("ID dokter tidak valid.");

  const parsed = doctorSchema.safeParse({
    nama_dokter: field(formData, "nama_dokter"),
    spesialis: field(formData, "spesialis"),
    id_poli: field(formData, "id_poli"),
    hari_praktik: field(formData, "hari_praktik"),
    jam_mulai: field(formData, "jam_mulai"),
    jam_selesai: field(formData, "jam_selesai"),
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data dokter tidak valid.");

  const supabase = await createClient();
  const result = id
    ? await supabase.from("dokter").update(parsed.data).eq("id_dokter", Number(id)).select("id_dokter").maybeSingle()
    : await supabase.from("dokter").insert(parsed.data).select("id_dokter").single();
  if (result.error) showNotice(`Gagal menyimpan dokter: ${result.error.message}`);
  if (!result.data) showNotice("Data dokter tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/dokter");
  revalidatePath("/admin/poli");
  showNotice(id ? "Perubahan dokter berhasil disimpan." : "Dokter berhasil ditambahkan.");
}

export async function deleteDokter(formData: FormData) {
  await requireRole("admin");
  const id = field(formData, "id");
  if (!/^\d+$/.test(id)) showNotice("ID dokter tidak valid.");

  const supabase = await createClient();
  const { count, error: appointmentError } = await supabase
    .from("pendaftaran")
    .select("id_daftar", { count: "exact", head: true })
    .eq("id_dokter", Number(id));
  if (appointmentError) showNotice(`Gagal memeriksa pendaftaran dokter: ${appointmentError.message}`);
  if (count) showNotice("Dokter tidak dapat dihapus karena sudah memiliki pendaftaran.");

  const { data, error } = await supabase
    .from("dokter")
    .delete()
    .eq("id_dokter", Number(id))
    .select("id_dokter")
    .maybeSingle();
  if (error?.code === "23503") {
    showNotice("Dokter tidak dapat dihapus karena sudah memiliki pendaftaran.");
  }
  if (error) showNotice(`Gagal menghapus dokter: ${error.message}`);
  if (!data) showNotice("Data dokter tidak ditemukan.");

  revalidatePath("/admin");
  revalidatePath("/admin/dokter");
  showNotice("Dokter berhasil dihapus.");
}
