import Link from "next/link";
import { Icon } from "@/app/_components/landing/icons";

export type PatientNotification = {
  id: number;
  doctor: string;
  clinic: string;
  visitDate: string;
};

export function PatientNotificationButton({
  notifications,
  hasError,
}: {
  notifications: PatientNotification[];
  hasError: boolean;
}) {
  return (
    <details className="relative">
      <summary
        aria-label={`Notifikasi (${notifications.length})`}
        className="relative flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
      >
        <Icon name="bell" className="h-5 w-5" />
        {notifications.length > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sunset px-1 text-[10px] font-bold text-white"
          >
            {notifications.length}
          </span>
        )}
      </summary>
      <div className="absolute right-0 z-20 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-lg">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="font-semibold text-navy">Notifikasi</h2>
        </div>
        {hasError ? (
          <p role="alert" className="p-4 text-sm text-rose-700">
            Notifikasi gagal dimuat. Muat ulang halaman untuk mencoba kembali.
          </p>
        ) : notifications.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">Belum ada notifikasi terbaru.</p>
        ) : (
          <>
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id} className="px-4 py-3">
                  <p className="text-sm font-semibold text-navy">Kunjungan dikonfirmasi</p>
                  <p className="mt-1 text-sm text-slate-700">
                    {notification.doctor} · {notification.clinic}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{notification.visitDate}</p>
                </li>
              ))}
            </ul>
            <Link
              href="/pasien/pendaftaran"
              className="block border-t border-slate-100 px-4 py-3 text-sm font-semibold text-brilliant hover:bg-slate-50"
            >
              Lihat semua pendaftaran
            </Link>
          </>
        )}
      </div>
    </details>
  );
}
