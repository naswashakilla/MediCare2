"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/pasien", label: "Beranda", exact: true },
  { href: "/pasien/profil", label: "Profil saya", exact: false },
  { href: "/pasien/pendaftaran", label: "Pendaftaran saya", exact: false },
];

export function PatientNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi pasien"
      className="mx-auto flex w-full max-w-5xl gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2.5 sm:px-6"
    >
      {navigation.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(`${item.href}/`) || pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-teal-50 text-teal-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
