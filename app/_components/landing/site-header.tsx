"use client";

import Image from "next/image";
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
  const accountHref = dashboardHref ?? "/login";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ocean bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="MediCare - beranda">
          <Image
            src="/logo-medicare.png"
            alt="MediCare"
            width={1774}
            height={887}
            priority
            sizes="160px"
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden items-center gap-6 lg:flex">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-base font-medium text-navy transition-colors hover:text-sunset"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <Link
            href={accountHref}
            className="rounded-lg border-2 border-brilliant px-4 py-2.5 text-sm font-bold text-brilliant transition-colors hover:bg-ocean"
          >
            {accountLabel}
          </Link>
          <Link
            href={appointmentHref}
            className="inline-flex items-center gap-2 rounded-lg bg-brilliant px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy"
          >
            <Icon name="calendar" className="h-4 w-4" />
            Book Appointment
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="flex h-11 w-11 items-center justify-center rounded-lg border-2 border-navy/15 text-navy transition-colors hover:border-brilliant hover:text-brilliant lg:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t-2 border-ocean bg-white px-4 pb-5 pt-2 lg:hidden">
          <nav aria-label="Navigasi seluler" className="grid">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-navy transition-colors hover:bg-ocean hover:text-brilliant"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t-2 border-ocean pt-3">
            <Link
              href={accountHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg border-2 border-brilliant px-4 py-3 text-base font-bold text-brilliant transition-colors hover:bg-ocean"
            >
              {accountLabel}
            </Link>
            <Link
              href={appointmentHref}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-lg bg-brilliant px-4 py-3 text-base font-bold text-white transition-colors hover:bg-navy"
            >
              <Icon name="calendar" className="h-5 w-5" />
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
