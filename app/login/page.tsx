"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow"
      >
        <h1 className="text-2xl font-bold text-center">MediCare</h1>
        <p className="text-center text-sm text-gray-500">
          Masuk ke Sistem Informasi Poliklinik
        </p>

        {state?.error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-600">
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-gray-300 p-2"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-blue-600 p-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {pending ? "Memproses..." : "Masuk"}
        </button>

        <p className="text-center text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-blue-600 underline">
            Daftar
          </Link>
        </p>
      </form>
    </main>
  );
}