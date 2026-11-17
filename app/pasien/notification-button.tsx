"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Icon } from "@/app/_components/landing/icons";

const seenNotificationsEvent = "medicare:patient-notifications-seen";
const storageErrorValue = "__storage_error__";

function subscribeToSeenNotifications(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(seenNotificationsEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(seenNotificationsEvent, onChange);
  };
}

function parseSeenIds(value: string) {
  if (!value) return { ids: new Set<number>(), hasError: false };

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return { ids: new Set<number>(), hasError: true };

    return {
      ids: new Set(parsed.filter((id): id is number => typeof id === "number" && Number.isSafeInteger(id))),
      hasError: false,
    };
  } catch {
    return { ids: new Set<number>(), hasError: true };
  }
}

export type PatientNotification = {
  id: number;
  doctor: string;
  clinic: string;
  visitDate: string;
};

export function PatientNotificationButton({
  notifications,
  hasError,
  userId,
}: {
  notifications: PatientNotification[];
  hasError: boolean;
  userId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionSeenIds, setSessionSeenIds] = useState<Set<number>>(() => new Set());
  const [storageWriteError, setStorageWriteError] = useState(false);
  const storageKey = `medicare:patient-notifications:${userId}`;
  const getSnapshot = useCallback(() => {
    try {
      return window.localStorage.getItem(storageKey) ?? "";
    } catch {
      return storageErrorValue;
    }
  }, [storageKey]);
  const getServerSnapshot = useCallback(() => "", []);
  const storedValue = useSyncExternalStore(
    subscribeToSeenNotifications,
    getSnapshot,
    getServerSnapshot,
  );
  const storedState = parseSeenIds(storedValue === storageErrorValue ? "" : storedValue);
  const seenIds = new Set([...storedState.ids, ...sessionSeenIds]);
  const seenStateError = storedValue === storageErrorValue || storedState.hasError || storageWriteError;
  const unreadCount = notifications.filter((notification) => !seenIds.has(notification.id)).length;

  function toggleNotifications() {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    const updatedSeenIds = new Set(seenIds);
    notifications.forEach((notification) => updatedSeenIds.add(notification.id));
    setSessionSeenIds(updatedSeenIds);

    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...updatedSeenIds]));
      window.dispatchEvent(new Event(seenNotificationsEvent));
    } catch {
      setStorageWriteError(true);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifikasi (${unreadCount} belum dibaca)`}
        aria-expanded={isOpen}
        aria-controls="patient-notifications"
        onClick={toggleNotifications}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
      >
        <Icon name="bell" className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-sunset px-1 text-[10px] font-bold text-white"
          >
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          id="patient-notifications"
          className="absolute right-0 z-20 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-lg"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="font-semibold text-navy">Notifikasi</h2>
          </div>
          {seenStateError && (
            <p role="alert" className="border-b border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              Status telah dibaca tidak dapat disimpan. Tanda notifikasi mungkin muncul kembali setelah halaman dimuat ulang.
            </p>
          )}
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
      )}
    </div>
  );
}
