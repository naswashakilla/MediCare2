# MediCare — Sistem Informasi Poliklinik

Aplikasi web untuk mengelola data poliklinik dan pendaftaran kunjungan pasien. Dibangun dengan Next.js App Router, Supabase, dan Tailwind CSS.

## Fitur

### Admin

- Ringkasan jumlah pasien, dokter, poli, dan pendaftaran.
- Mengelola data pasien, dokter, poli, dan pendaftaran kunjungan.
- Mendaftarkan pasien ke dokter melalui formulir pendaftaran di panel admin.
- Membatasi pendaftaran hingga **15 pasien per dokter per tanggal** dan mencegah pasien membuat pendaftaran aktif ganda pada dokter dan tanggal yang sama. Pendaftaran yang dibatalkan tidak dihitung dalam kuota.
- Mencari dan memfilter data pendaftaran.
- Membuat laporan berdasarkan periode, status, dan dokter; laporan dapat dicetak atau disimpan sebagai PDF, serta diekspor ke Word (`.doc`).

### Pasien

- Membuat akun, melengkapi, dan mengubah profil pasien.
- Mendaftar kunjungan, melihat riwayat pendaftaran, mengubah pendaftaran berstatus *menunggu*, atau membatalkannya.
- Melihat informasi dokter dan layanan klinik.

### Teknologi dan keamanan

- Next.js 16, React 19, TypeScript, dan Tailwind CSS 4.
- Supabase untuk PostgreSQL, autentikasi, dan Row Level Security (RLS).
- Validasi data pada server menggunakan Zod.
- Pemeriksaan sesi melalui `proxy.ts`; akses data juga dibatasi dengan RLS.

## Persyaratan

- Node.js dan npm.
- Project Supabase, atau Docker jika ingin menjalankan Supabase secara lokal.

## Menjalankan secara lokal

1. Pasang dependensi:

   ```bash
   npm install
   ```

2. Siapkan Supabase dengan salah satu cara berikut.

   **Supabase hosted:** buat project di [supabase.com](https://supabase.com), lalu tautkan dan terapkan migrasi:

   ```bash
   npx supabase login
   npx supabase link --project-ref <PROJECT_REF>
   npx supabase db push
   ```

   **Supabase lokal:** jalankan perintah berikut (Docker harus aktif):

   ```bash
   npx supabase start
   ```

   Supabase lokal menerapkan migrasi saat database dimulai. Perintah tersebut juga menampilkan URL dan anon key untuk konfigurasi aplikasi.

3. Buat file `.env.local` di root project:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
   ```

   Untuk Supabase lokal, gunakan URL dan anon key yang ditampilkan oleh `npx supabase start`. Pada Supabase hosted, nilai tersebut tersedia di **Project Settings → API**.

4. Jalankan aplikasi:

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

### Menjadikan akun sebagai admin

Akun baru otomatis mendapat peran pasien. Daftarkan akun terlebih dahulu, lalu ubah peran hanya untuk akun tepercaya melalui SQL Editor Supabase:

```sql
update public.profiles
set role = 'admin'
where email = 'email-admin-anda';
```

Jangan memberikan peran admin kepada akun yang tidak tepercaya.

## Perintah yang tersedia

```bash
npm run dev    # Menjalankan server pengembangan
npm run lint   # Menjalankan ESLint
npm run build  # Membuat build produksi
npm run start  # Menjalankan build produksi
```

## Deploy ke Vercel

1. Impor repository ini ke [Vercel](https://vercel.com/new).
2. Tambahkan environment variable `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` pada pengaturan project Vercel.
3. Deploy aplikasi.
4. Di Supabase, buka **Authentication → URL Configuration**:
   - Atur **Site URL** ke domain produksi.
   - Tambahkan domain produksi dan `http://localhost:3000/**` ke **Redirect URLs** untuk kebutuhan pengembangan.
5. Pastikan semua migrasi database telah diterapkan ke project Supabase menggunakan `npx supabase db push`.

Vercel dapat menjalankan deploy baru secara otomatis setiap kali perubahan didorong ke branch yang terhubung.
