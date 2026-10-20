import { requireRole } from "@/utils/auth";
import { logout } from "@/app/actions/auth";

export default async function PasienPage() {
  const profile = await requireRole("pasien");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Dashboard Pasien</h1>
      <p className="mb-4">Halo, {profile.nama_user}!</p>
      <form action={logout}>
        <button className="rounded bg-gray-800 px-4 py-2 text-white">Keluar</button>
      </form>
    </main>
  );
}