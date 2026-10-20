import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function requireRole(role: "admin" | "pasien") {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nama_user, role")
    .eq("id_user", userId)
    .single();

  if (!profile) redirect("/login");

  if (profile.role !== role) {
    redirect(profile.role === "admin" ? "/admin" : "/pasien");
  }

  return profile;
}