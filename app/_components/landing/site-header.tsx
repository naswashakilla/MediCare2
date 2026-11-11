"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./icons";

const navigation = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Services" },
  { href: "#doctors", label: "Doctors" },
  { href: "#contact", label: "Contact" },
];

type SiteHeaderProps = {
  dashboardHref: string | null;
  appointmentHref: string;
};

export function SiteHeader({ dashboardHref, appointmentHref }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const accountLabel = dashboardHref ? "Dashboard" : "Login";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MediCare - kembali ke beranda" className="flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-iced-denim text-white shadow-lg shadow-iced-denim/25">
            <Icon name="plus" className="h-6 w-6" strokeWidth={2.4} />
          </span>
          <span>
            <span className="block text-xl font-bold tracking-tight text-slate-950">MediCare</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-iced-denim-dark">
              Hospital &amp; Clinic
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-frost hover:text-iced-denim-dark"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={appointmentHref}
            className="rounded-full border border-iced-denim/20 bg-frost px-4 py-2.5 text-sm font-semibold text-iced-denim-dark transition hover:border-iced-denim/40 hover:bg-white"
          >
            Book Appointment
          </Link>
          <Link
            href={dashboardHref ?? "/login"}
            className="rounded-full bg-iced-denim px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-iced-denim/30 transition hover:bg-iced-denim-dark"
          >
            {accountLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-iced-denim/30 hover:text-iced-denim-dark lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 lg:hidden">
          <nav aria-label="Navigasi seluler" className="grid gap-1">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-frost hover:text-iced-denim-dark"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <Link
              href={appointmentHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-pistachio px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#aab34a]"
            >
              Book Appointment <Icon name="arrow-right" className="h-4 w-4" />
            </Link>
            <Link
              href={dashboardHref ?? "/login"}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-iced-denim px-4 py-3 text-sm font-semibold text-white transition hover:bg-iced-denim-dark"
            >
              <Icon name={dashboardHref ? "users" : "shield"} className="h-4 w-4" />
              {accountLabel}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
