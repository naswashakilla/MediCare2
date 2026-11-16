"use client";

import { ConfirmAction } from "@/app/_components/confirm-action";
import { deletePendaftaran } from "./actions";

export function DeletePendaftaranButton({ id }: { id: number }) {
  return (
    <ConfirmAction
      action={deletePendaftaran}
      id={id}
      question="Yakin ingin menghapus pendaftaran ini?"
      triggerLabel="Hapus"
      confirmLabel="Ya, hapus"
      triggerClassName="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50"
    />
  );
}
