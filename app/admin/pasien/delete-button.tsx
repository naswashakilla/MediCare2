"use client";

import { ConfirmAction } from "@/app/_components/confirm-action";
import { deletePasien } from "./actions";

export function DeletePasienButton({
  id,
  disabled,
}: {
  id: number;
  disabled: boolean;
}) {
  return (
    <div>
      <ConfirmAction
        action={deletePasien}
        id={id}
        question="Yakin ingin menghapus data pasien ini?"
        triggerLabel="Hapus"
        confirmLabel="Ya, hapus"
        disabled={disabled}
        disabledTitle={disabled ? "Pasien yang memiliki riwayat pendaftaran tidak dapat dihapus." : undefined}
        triggerClassName="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {disabled && (
        <p className="mt-1 max-w-48 text-xs text-slate-500">
          Pasien memiliki riwayat pendaftaran.
        </p>
      )}
    </div>
  );
}
