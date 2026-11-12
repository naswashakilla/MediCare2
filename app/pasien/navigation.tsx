"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/app/_components/landing/icons";

const navigation: { href: string; label: string; icon: IconName; exact: boolean }[] = [
  { href: "/pasien", label: "Beranda", icon: "activity", exact: true },
  { href: "/pasien/profil", label: "Profil saya", icon: "users", exact: false },
  { href: "/pasien/pendaftaran", label: "Pendaftaran saya", icon: "calendar", exact: false },
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
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-frost text-iced-denim-dark"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <Icon
              name={item.icon}
              className={`h-4 w-4 ${active ? "text-iced-denim-dark" : "text-slate-400"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
