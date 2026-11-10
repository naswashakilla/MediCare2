"use client";

import type { FormEvent } from "react";
import { deleteDokter } from "./actions";

export function DeleteDokterButton({
  id,
  disabled,
}: {
  id: number;
  disabled: boolean;
}) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Yakin ingin menghapus dokter ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deleteDokter} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <button
        disabled={disabled}
        title={disabled ? "Dokter yang sudah memiliki pendaftaran tidak dapat dihapus." : undefined}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Hapus
      </button>
      {disabled && <p className="mt-1 max-w-48 text-xs text-slate-500">Dokter sudah memiliki pendaftaran.</p>}
    </form>
  );
}
