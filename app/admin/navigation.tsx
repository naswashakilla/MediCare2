"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/app/_components/landing/icons";

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Ringkasan", icon: "activity" },
  { href: "/admin/pasien", label: "Data pasien", icon: "users" },
  { href: "/admin/dokter", label: "Data dokter", icon: "stethoscope" },
  { href: "/admin/poli", label: "Data poli", icon: "building" },
  { href: "/admin/pendaftaran", label: "Pendaftaran", icon: "calendar" },
  { href: "/admin/laporan", label: "Laporan", icon: "scan" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi admin"
      className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-1 md:flex-col md:overflow-visible"
    >
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:w-full ${
              active
                ? "bg-frost text-iced-denim-dark"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                active ? "bg-iced-denim text-white shadow-sm shadow-iced-denim/25" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Icon name={item.icon} className="h-4 w-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
