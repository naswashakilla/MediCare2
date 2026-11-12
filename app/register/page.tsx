"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/app/_components/landing/icons";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-ocean/50 via-white to-ocean/30">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" aria-label="MediCare - beranda">
          <Image
            src="/logo-medicare.png"
            alt="MediCare"
            width={1774}
            height={887}
            priority
            sizes="160px"
            className="h-10 w-auto"
          />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-sunset"
        >
          <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
          Kembali ke beranda
        </Link>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <form
          action={formAction}
          className="w-full max-w-md space-y-5 rounded-2xl border border-navy/10 bg-white p-6 shadow-xl shadow-navy/5 sm:p-9"
        >
          <div>
            <p className="text-sm font-semibold text-brilliant">Akun pasien</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-navy">Buat akun</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Isi data berikut untuk mulai menggunakan layanan MediCare.
            </p>
          </div>

          {state?.error && (
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {state.error}
            </p>
          )}

          <label htmlFor="nama_user" className="block text-sm font-medium text-navy">
            Nama lengkap
            <input
              id="nama_user"
              name="nama_user"
              autoComplete="name"
              minLength={3}
              maxLength={50}
              required
              className="mt-2 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-navy outline-none transition placeholder:text-slate-400 focus:border-brilliant focus:ring-4 focus:ring-brilliant/15"
              placeholder="Nama sesuai identitas"
            />
          </label>

          <label htmlFor="email" className="block text-sm font-medium text-navy">
            Email
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={100}
              required
              className="mt-2 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-navy outline-none transition placeholder:text-slate-400 focus:border-brilliant focus:ring-4 focus:ring-brilliant/15"
              placeholder="nama@email.com"
            />
          </label>

          <label htmlFor="password" className="block text-sm font-medium text-navy">
            Password
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="mt-2 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-navy outline-none transition placeholder:text-slate-400 focus:border-brilliant focus:ring-4 focus:ring-brilliant/15"
              placeholder="Minimal 6 karakter"
            />
          </label>

          <label htmlFor="konfirmasi" className="block text-sm font-medium text-navy">
            Konfirmasi password
            <input
              id="konfirmasi"
              name="konfirmasi"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              className="mt-2 w-full rounded-lg border border-navy/20 bg-white px-4 py-3 text-navy outline-none transition placeholder:text-slate-400 focus:border-brilliant focus:ring-4 focus:ring-brilliant/15"
              placeholder="Ulangi password"
            />
          </label>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brilliant px-4 py-3 font-semibold text-white transition-colors hover:bg-navy focus:outline-none focus:ring-4 focus:ring-brilliant/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Memproses..." : "Daftar sebagai pasien"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold text-brilliant hover:text-sunset hover:underline">
              Masuk
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
