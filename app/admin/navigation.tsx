"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/admin", label: "Ringkasan", abbreviation: "DB" },
  { href: "/admin/pasien", label: "Data pasien", abbreviation: "PS" },
  { href: "/admin/dokter", label: "Data dokter", abbreviation: "DR" },
  { href: "/admin/poli", label: "Data poli", abbreviation: "PL" },
  { href: "/admin/pendaftaran", label: "Pendaftaran", abbreviation: "DF" },
];

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi admin" className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-1 md:flex-col md:overflow-visible">
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition md:w-full ${
              active
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${
              active ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-500"
            }`}>
              {item.abbreviation}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
