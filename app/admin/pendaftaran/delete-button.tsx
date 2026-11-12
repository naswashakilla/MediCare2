"use client";

import type { FormEvent } from "react";
import { deletePendaftaran } from "./actions";

export function DeletePendaftaranButton({ id }: { id: number }) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Yakin ingin menghapus pendaftaran ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deletePendaftaran} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50">
        Hapus
      </button>
    </form>
  );
}
