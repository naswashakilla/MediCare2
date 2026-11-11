"use client";

import type { FormEvent } from "react";
import { cancelPendaftaran } from "./actions";

export function CancelPendaftaranButton({ id }: { id: number }) {
  function confirmCancel(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Yakin ingin membatalkan pendaftaran kunjungan ini?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={cancelPendaftaran} onSubmit={confirmCancel}>
      <input type="hidden" name="id" value={id} />
      <button className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
        Batalkan
      </button>
    </form>
  );
}
