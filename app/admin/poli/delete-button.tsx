"use client";

import type { FormEvent } from "react";
import { deletePoli } from "./actions";

export function DeletePoliButton({
  id,
  disabled,
}: {
  id: number;
  disabled: boolean;
}) {
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Yakin ingin menghapus poli ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={deletePoli} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <button
        disabled={disabled}
        title={disabled ? "Pindahkan dokter dari poli ini sebelum menghapus." : undefined}
        className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Hapus
      </button>
      {disabled && (
        <p className="mt-1 max-w-48 text-xs text-slate-500">
          Pindahkan dokter ke poli lain sebelum menghapus.
        </p>
      )}
    </form>
  );
}
