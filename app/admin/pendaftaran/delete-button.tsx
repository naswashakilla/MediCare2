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
      <button className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
        Hapus
      </button>
    </form>
  );
}
