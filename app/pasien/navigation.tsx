"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation: { href: string; label: string }[] = [
  { href: "/pasien", label: "Beranda" },
  { href: "/pasien/profil", label: "Profil saya" },
  { href: "/pasien/pendaftaran", label: "Pendaftaran saya" },
];

export function PatientNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi pasien"
      className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-1 md:flex-col md:overflow-visible"
    >
      {navigation.map((item) => {
        const active = pathname === item.href || (item.href !== "/pasien" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2.5 text-sm transition md:w-full ${
              active
                ? "bg-white/15 font-semibold text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
