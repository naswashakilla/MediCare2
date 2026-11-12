"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { Icon } from "@/app/_components/landing/icons";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-4 sm:p-8">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-pistachio/20 blur-3xl" />
        <div className="absolute -right-28 bottom-10 h-96 w-96 rounded-full bg-iced-denim/15 blur-3xl" />
      </div>

      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-2xl shadow-slate-900/[0.08] md:min-h-[700px] md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-iced-denim-dark via-iced-denim to-[#2f5f91] p-10 text-white md:flex lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 top-24 h-72 w-72 rounded-full border-[42px] border-white/[0.08]" />
          <div aria-hidden="true" className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-pistachio/15 blur-2xl" />
          <div aria-hidden="true" className="absolute right-10 top-1/2 h-40 w-40 rounded-full bg-white/[0.04]" />

          <div className="relative inline-flex w-fit rounded-xl bg-white px-4 py-2.5">
            <Image
              src="/logo-medicare.png"
              alt="MediCare"
              width={1774}
              height={887}
              sizes="160px"
              className="h-8 w-auto"
            />
          </div>

          <div className="relative py-12">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-pistachio/40 bg-pistachio/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-pistachio" />
              Mulai perjalanan sehat Anda
            </span>
            <h1 className="max-w-md text-4xl font-bold leading-[1.1] tracking-tight lg:text-5xl">
              Satu akun untuk layanan yang lebih mudah.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/80 sm:text-base">
              Buat akun pasien untuk mengakses layanan poliklinik MediCare dengan lebih praktis.
            </p>

            <ul className="mt-9 space-y-3">
              {["Pendaftaran kunjungan online", "Pantau status pendaftaran", "Kelola profil pasien"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pistachio text-slate-950">
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} />
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          <p className="relative text-xs text-white/60">Data akun Anda dikelola dengan aman.</p>
        </section>

        <section className="flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12">
          <form action={formAction} className="w-full max-w-sm space-y-4">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-iced-denim-dark"
            >
              <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
              Kembali ke beranda
            </Link>

            <div className="mb-6 md:hidden">
              <Image
                src="/logo-medicare.png"
                alt="MediCare"
                width={1774}
                height={887}
                sizes="160px"
                className="h-9 w-auto"
              />
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-iced-denim-dark">
                Hospital &amp; Clinic
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-iced-denim-dark">Akun pasien</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Buat akun</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Isi data berikut untuk memulai menggunakan layanan MediCare.
              </p>
            </div>

            {state?.error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <label htmlFor="nama_user" className="block text-sm font-medium text-slate-700">
              Nama lengkap
              <input
                id="nama_user"
                name="nama_user"
                autoComplete="name"
                minLength={3}
                maxLength={50}
                required
                className="mt-2 w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20"
                placeholder="Nama sesuai identitas"
              />
            </label>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={100}
                required
                className="mt-2 w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20"
                placeholder="nama@email.com"
              />
            </label>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20"
                placeholder="Minimal 6 karakter"
              />
            </label>
            <label htmlFor="konfirmasi" className="block text-sm font-medium text-slate-700">
              Konfirmasi password
              <input
                id="konfirmasi"
                name="konfirmasi"
                type="password"
                autoComplete="new-password"
                minLength={6}
                required
                className="mt-2 w-full rounded-xl border border-iced-denim/15 bg-frost/60 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-iced-denim focus:bg-white focus:ring-4 focus:ring-iced-denim/20"
                placeholder="Ulangi password"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-iced-denim px-4 py-3 font-semibold text-white shadow-lg shadow-iced-denim/25 transition hover:bg-iced-denim-dark focus:outline-none focus:ring-4 focus:ring-iced-denim/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Daftar sebagai pasien"}
            </button>

            <p className="pt-1 text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-iced-denim-dark hover:text-[#284f78] hover:underline">
                Masuk
              </Link>
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
