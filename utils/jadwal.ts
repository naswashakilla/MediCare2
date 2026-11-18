const NAMA_HARI_SINGKAT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const INDEX_HARI: Record<string, number> = {
  minggu: 0,
  ahad: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  "jum'at": 5,
  sabtu: 6,
};

export type WaktuJakarta = {
  /** 0 = Minggu, 1 = Senin, ..., 6 = Sabtu */
  indexHari: number;
  namaHari: string;
  menit: number;
  jamLabel: string;
  tanggalISO: string;
  tanggalLabel: string;
};

export type JadwalDokter = {
  hari_praktik: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
};

export type StatusPraktik = "praktik" | "akan-datang" | "tidak-praktik";

/** Waktu dan tanggal berdasarkan zona waktu klinik (Asia/Jakarta). */
export function waktuJakarta(now: Date = new Date()): WaktuJakarta {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const ambil = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const indexHari = NAMA_HARI_SINGKAT.indexOf(ambil("weekday"));
  const jam = Number(ambil("hour"));
  const menit = Number(ambil("minute"));

  return {
    indexHari: indexHari < 0 ? 0 : indexHari,
    namaHari: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][
      indexHari < 0 ? 0 : indexHari
    ],
    menit: jam * 60 + menit,
    jamLabel: `${String(jam).padStart(2, "0")}.${String(menit).padStart(2, "0")}`,
    tanggalISO: `${ambil("year")}-${ambil("month")}-${ambil("day")}`,
    tanggalLabel: new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now),
  };
}

/**
 * Mengurai teks hari praktik bebas menjadi indeks hari.
 * Mendukung "Senin, Rabu, Jumat", "Senin - Jumat", "Selasa s.d. Sabtu", dll.
 */
export function hariPraktikIndices(hariPraktik: string | null): Set<number> {
  const hasil = new Set<number>();
  if (!hariPraktik) return hasil;

  const teks = hariPraktik
    .toLowerCase()
    .replace(/\bs\.?\s*d\.?\b/g, "-")
    .replace(/\bsampai\b/g, "-")
    .replace(/\bto\b/g, "-");

  for (const bagian of teks.split(/[,;/&]|\bdan\b/)) {
    const rentang = bagian.match(/([a-z']+)\s*[-–—]\s*([a-z']+)/);
    if (rentang) {
      const awal = INDEX_HARI[rentang[1]];
      const akhir = INDEX_HARI[rentang[2]];
      if (awal !== undefined && akhir !== undefined) {
        let kuror = awal;
        for (let langkah = 0; langkah < 7; langkah += 1) {
          hasil.add(kuror);
          if (kuror === akhir) break;
          kuror = (kuror + 1) % 7;
        }
      }
      continue;
    }

    const kata = bagian.trim().replace(/[^a-z']/g, "");
    const indeks = INDEX_HARI[kata];
    if (indeks !== undefined) hasil.add(indeks);
  }

  return hasil;
}

function jamKeMenit(jam: string | null): number | null {
  if (!jam) return null;
  const [jamString, menitString = "0"] = jam.split(":");
  const jamAngka = Number(jamString);
  const menitAngka = Number(menitString);
  if (!Number.isFinite(jamAngka) || !Number.isFinite(menitAngka)) return null;
  return jamAngka * 60 + menitAngka;
}

/** Status praktik dokter pada waktu yang diberikan. */
export function statusPraktikDokter(
  dokter: JadwalDokter,
  waktu: WaktuJakarta,
): StatusPraktik {
  const hariPraktik = hariPraktikIndices(dokter.hari_praktik);
  if (!hariPraktik.has(waktu.indexHari)) return "tidak-praktik";

  const mulai = jamKeMenit(dokter.jam_mulai);
  const selesai = jamKeMenit(dokter.jam_selesai);
  if (mulai === null || selesai === null) return "praktik";

  if (waktu.menit >= mulai && waktu.menit < selesai) return "praktik";
  return waktu.menit < mulai ? "akan-datang" : "tidak-praktik";
}
