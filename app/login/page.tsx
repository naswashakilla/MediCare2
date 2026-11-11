"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f7f6] p-4 sm:p-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-xl shadow-slate-900/[0.08] md:min-h-[620px] md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-800 p-10 text-white md:flex lg:p-12">
          <div aria-hidden="true" className="absolute -right-20 top-24 h-72 w-72 rounded-full border-[42px] border-white/[0.08]" />
          <div aria-hidden="true" className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-teal-800">M</span>
            <span>
              <span className="block text-xl font-bold">MediCare</span>
              <span className="text-xs uppercase tracking-[0.2em] text-teal-100">Poliklinik</span>
            </span>
          </div>
          <div className="relative py-12">
            <span className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-teal-50">
              Layanan kesehatan lebih dekat
            </span>
            <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
              Kesehatan Anda, prioritas kami.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-teal-50/90">
              Akses informasi dan layanan poliklinik dalam satu ruang yang nyaman dan mudah digunakan.
            </p>
            <div className="mt-9 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.08] p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-300/15 text-lg text-emerald-100">+</span>
              <span>
                <span className="block text-sm font-semibold">Melayani dengan sepenuh hati</span>
                <span className="mt-1 block text-xs text-teal-100">Informasi poliklinik MediCare</span>
              </span>
            </div>
          </div>
          <p className="relative text-xs text-teal-100/70">Perawatan yang baik dimulai dari langkah yang tepat.</p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 lg:p-14">
          <form action={formAction} className="w-full max-w-sm space-y-5">
            <Link
              href="/"
              className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
            >
              <span aria-hidden="true">←</span> Kembali ke beranda
            </Link>
            <div className="mb-8 md:hidden">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-xl font-bold text-white">M</span>
              <p className="mt-3 text-lg font-bold text-slate-900">MediCare</p>
              <p className="text-xs uppercase tracking-[0.2em] text-teal-700">Poliklinik</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-teal-700">Selamat datang kembali</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Masuk akun</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Masuk untuk melanjutkan ke sistem informasi poliklinik.</p>
            </div>

            {state?.error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                placeholder="nama@email.com"
              />
            </label>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                placeholder="Masukkan password"
              />
            </label>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white shadow-sm shadow-teal-900/15 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Memproses..." : "Masuk"}
            </button>

            <p className="pt-2 text-center text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link href="/register" className="font-semibold text-teal-700 hover:text-teal-900 hover:underline">
                Daftar sekarang
              </Link>
            </p>
            <p className="text-center text-xs text-slate-400">Dengan masuk, Anda menggunakan akun MediCare yang terdaftar.</p>
          </form>
        </section>
      </div>
    </main>
  );
}