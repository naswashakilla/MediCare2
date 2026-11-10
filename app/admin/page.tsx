import Link from "next/link";
import { requireRole } from "@/utils/auth";
import { logout } from "@/app/actions/auth";

export default async function AdminPage() {
  const profile = await requireRole("admin");

  return (
    <main className="mx-auto max-w-5xl space-y-5 p-6">
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p>Halo, {profile.nama_user}!</p>
      <Link
        href="/admin/poli"
        className="inline-flex rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
      >
        Kelola data poli
      </Link>
      <Link
        href="/admin/dokter"
        className="ml-3 inline-flex rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
      >
        Kelola data dokter
      </Link>
      <form action={logout}>
        <button className="rounded bg-gray-800 px-4 py-2 text-white">Keluar</button>
      </form>
    </main>
  );
}
