"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-center">Daftar Akun</h1>

        {state?.error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="nama_user" className="mb-1 block text-sm font-medium">
            Nama lengkap
          </label>
          <input id="nama_user" name="nama_user" required
            className="w-full rounded border border-gray-300 p-2" />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input id="email" name="email" type="email" required
            className="w-full rounded border border-gray-300 p-2" />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input id="password" name="password" type="password" required
            className="w-full rounded border border-gray-300 p-2" />
        </div>

        <button type="submit" disabled={pending}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          {pending ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-blue-600 underline">Masuk</Link>
        </p>
      </form>
    </main>
  );
}