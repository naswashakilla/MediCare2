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
      <button className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50">
        Batalkan
      </button>
    </form>
  );
}
