"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import type { FormState } from "../login/actions";

const registerSchema = z.object({
  nama_user: z.string().min(3, "Nama minimal 3 karakter").max(50, "Nama maksimal 50 karakter"),
  email: z.string().email("Format email tidak valid").max(100),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function register(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    nama_user: formData.get("nama_user"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    // nama_user dibaca oleh trigger handle_new_user untuk mengisi tabel profiles
    options: { data: { nama_user: parsed.data.nama_user } },
  });

  if (error) return { error: error.message };

 
  if (!data.session) {
    return { error: "Pendaftaran berhasil. Silakan cek email untuk konfirmasi, lalu login." };
  }

  redirect("/pasien");
}