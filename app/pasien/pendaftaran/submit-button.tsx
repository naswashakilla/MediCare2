"use client";

import { useFormStatus } from "react-dom";

export function PendaftaranSubmitButton({ editing = false }: { editing?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-iced-denim px-4 py-2.5 font-semibold text-white shadow-sm shadow-iced-denim/25 transition hover:bg-iced-denim-dark disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
    >
      {pending ? "Menyimpan..." : editing ? "Simpan perubahan" : "Daftar kunjungan"}
    </button>
  );
}
