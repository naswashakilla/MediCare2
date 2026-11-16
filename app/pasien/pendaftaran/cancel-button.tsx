"use client";

import { ConfirmAction } from "@/app/_components/confirm-action";
import { cancelPendaftaran } from "./actions";

export function CancelPendaftaranButton({ id }: { id: number }) {
  return (
    <ConfirmAction
      action={cancelPendaftaran}
      id={id}
      question="Yakin ingin membatalkan pendaftaran kunjungan ini?"
      triggerLabel="Batalkan"
      confirmLabel="Ya, batalkan"
      triggerClassName="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
    />
  );
}
