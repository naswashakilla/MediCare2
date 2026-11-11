"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/utils/auth";
import { createClient } from "@/utils/supabase/server";

const profileSchema = z.object({
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
  redirect(`/pasien/profil?notice=${encodeURIComponent(message)}`);
}

export async function saveProfile(formData: FormData) {
  const account = await requireRole("pasien");

  const parsed = profileSchema.safeParse({
    nama_pasien: field(formData, "nama_pasien"),
    nik: field(formData, "nik") || null,
    tempatlahir: field(formData, "tempatlahir"),
    tgllahir: field(formData, "tgllahir") || null,
    jk: field(formData, "jk") || null,
    alamat: field(formData, "alamat"),
    no_hp: field(formData, "no_hp"),
  });
  if (!parsed.success) showNotice(parsed.error.issues[0]?.message ?? "Data profil tidak valid.");

  const supabase = await createClient();
  const { data: existing, error: fetchError } = await supabase
    .from("pasien")
    .select("id_pasien")
    .eq("id_user", account.id_user)
    .limit(1);
  if (fetchError) showNotice(`Gagal memeriksa profil: ${fetchError.message}`);
  const current = existing?.[0];

  const payload = { ...parsed.data, id_user: account.id_user };
  const result = current
    ? await supabase.from("pasien").update(payload).eq("id_pasien", current.id_pasien).select("id_pasien").maybeSingle()
    : await supabase.from("pasien").insert(payload).select("id_pasien").single();
  if (result.error?.code === "23505") showNotice("NIK tersebut sudah digunakan pasien lain.");
  if (result.error) showNotice(`Gagal menyimpan profil: ${result.error.message}`);
  if (!result.data) showNotice("Data profil tidak ditemukan.");

  revalidatePath("/pasien");
  revalidatePath("/pasien/profil");
  revalidatePath("/pasien/pendaftaran");
  revalidatePath("/admin/pasien");
  revalidatePath("/admin/pendaftaran");
  showNotice(current ? "Profil berhasil diperbarui." : "Profil berhasil dilengkapi.");
}
