export const MAX_VISITS_PER_DOCTOR_PER_DAY = 15;

/** Nomor antrian disimpan sebagai angka, lalu ditampilkan dengan format A01, A02, ... */
export function formatNoAntrian(no: number | null | undefined): string {
  if (no == null || !Number.isFinite(no)) return "—";
  return `A${String(no).padStart(2, "0")}`;
}
