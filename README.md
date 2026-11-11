# MediCare — Sistem Informasi Poliklinik

Aplikasi web poliklinik berbasis **Next.js 16 (App Router)**, **Supabase** (PostgreSQL + Auth), dan **Tailwind CSS 4**.

## Fitur

- **Autentikasi** — login & registrasi (password di-hash oleh Supabase Auth), proteksi halaman berdasarkan peran (admin/pasien) lewat middleware + Row Level Security (RLS) di database.
- **Panel Admin**
  - CRUD **poli**, **dokter**, **pasien**, dan **pendaftaran** — lengkap dengan pencarian, filter status, dan pagination.
  - **Laporan pendaftaran** dengan filter periode & status, dapat **dicetak/simpan PDF** (print dialog) dan **diekspor ke Word (.doc)**.
- **Portal Pasien**
  - Melengkapi & mengedit profil sendiri.
  - Mendaftar kunjungan, melihat riwayat (pencarian + pagination), mengubah pendaftaran (selama status *menunggu*), dan membatalkan pendaftaran.
- **Responsif** — tampilan menyesuaikan layar HP, tablet, dan desktop.
- **Keamanan dasar** — password hashing, semua query memakai Supabase client (prepared statement/parameterized), validasi input dengan Zod di server + atribut HTML di form.

## Struktur utama

```
app/
  admin/          # Panel admin (pasien, dokter, poli, pendaftaran, laporan)
  pasien/         # Portal pasien (profil, pendaftaran)
  login|register/ # Autentikasi
supabase/
  migrations/     # Skema tabel + trigger + kebijakan RLS
  seed.sql         # Data contoh
utils/            # Supabase client, helper auth & format tanggal
```

## Menjalankan secara lokal

1. **Buat project Supabase** di [supabase.com](https://supabase.com), lalu jalankan migration dan seed:
   ```bash
   supabase link --project-ref <PROJECT_REF>
   supabase db push            # menjalankan folder supabase/migrations
   # lalu jalankan isi supabase/seed.sql di SQL Editor (opsional, data contoh)
   ```
2. **Salin environment variable** ke `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
   ```
   Keduanya ada di *Project Settings → API* pada dashboard Supabase.
3. **Jalankan aplikasi**:
   ```bash
   npm install
   npm run dev
   ```
4. Login sebagai admin: ubah `role` menjadi `'admin'` pada baris profil Anda di tabel `profiles` (via SQL Editor) — atau jalankan:
   ```sql
   update public.profiles set role = 'admin' where email = 'email-anda';
   ```

## Deploy ke Vercel

1. **Push kode ke GitHub** (repo ini sudah terhubung ke remote `origin`).
2. Buka [vercel.com/new](https://vercel.com/new) → **Import** repository ini.
3. Tambahkan **Environment Variables** (sama seperti `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Klik **Deploy**.
5. **Penting — konfigurasi Supabase agar auth jalan di domain produksi:**
   - Buka dashboard Supabase → **Authentication → URL Configuration**.
   - Set **Site URL** ke domain Vercel Anda, mis. `https://medicare2.vercel.app`.
   - Tambahkan ke **Redirect URLs**: `https://<domain-vercel>/**` dan `http://localhost:3000/**` (untuk development).
6. (Opsional) Jika tidak ingin registrasi harus konfirmasi email: **Authentication → Providers → Email → matikan "Confirm email"**.

Setelah deploy, setiap push ke branch utama akan otomatis ter-deploy ulang.
