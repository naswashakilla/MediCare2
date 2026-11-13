"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation: { href: string; label: string }[] = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pasien", label: "Data pasien" },
  { href: "/admin/dokter", label: "Data dokter" },
  { href: "/admin/poli", label: "Data poli" },
  { href: "/admin/pendaftaran", label: "Pendaftaran" },
  { href: "/admin/laporan", label: "Laporan" },
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
            className={`shrink-0 px-3 py-2.5 text-sm md:w-full ${
              active
                ? "font-semibold text-slate-900"
                : "text-slate-600"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
