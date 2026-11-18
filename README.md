# MediCare — Sistem Informasi Poliklinik

MediCare adalah aplikasi web poliklinik yang saya buat untuk membantu mengelola data klinik dan pendaftaran kunjungan pasien. Aplikasi ini memiliki dua jenis akun, yaitu admin dan pasien.

## Fitur

### Admin

- Melihat ringkasan jumlah pasien, dokter, poli, dan pendaftaran.
- Mengelola data pasien, dokter, poli, dan pendaftaran.
- Mencari data dan berpindah halaman pada daftar.
- Mengatur status pendaftaran.
- Membuat laporan pendaftaran berdasarkan tanggal, status, dan dokter.
- Mencetak laporan atau menyimpannya sebagai PDF melalui browser, serta mengekspor laporan ke Word (`.doc`).

### Pasien

- Membuat akun dan mengelola profil.
- Melihat informasi dokter dan poli.
- Membuat pendaftaran kunjungan, melihat riwayat, mengubah pendaftaran yang masih menunggu, atau membatalkannya.
- Mendapat nomor antrean setelah admin mengonfirmasi pendaftaran.

## Teknologi

- Next.js 16, React 19, TypeScript, dan Tailwind CSS 4.
- Supabase untuk database PostgreSQL, autentikasi, dan Row Level Security (RLS).
- Zod untuk validasi input di server.

Password akun dikelola oleh Supabase Auth, termasuk proses hashing-nya. Aplikasi menggunakan Supabase client untuk mengakses data dan RLS untuk membatasi akses sesuai peran. Akun yang baru mendaftar mendapat peran pasien; pembuatan admin dilakukan secara manual oleh pemilik project.

## Menjalankan aplikasi

### Yang dibutuhkan

- Node.js dan npm.
- Project Supabase. Supabase lokal juga bisa digunakan, tetapi memerlukan Docker.

### 1. Pasang dependensi

Dari folder project, jalankan:

```bash
npm install
```

### 2. Siapkan database Supabase

Buat project di [supabase.com](https://supabase.com). Untuk project Supabase baru, migration dapat diterapkan menggunakan Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push
```

Ganti `<PROJECT_REF>` dengan project reference dari dashboard Supabase. Perintah `db push` menerapkan migration dari folder `supabase/migrations`.

**Jika tabel sudah pernah dibuat lewat SQL Editor, jangan langsung menjalankan `db push`**: migration awal bisa mencoba membuat tabel yang sudah ada. Terapkan hanya migration yang belum dijalankan, sesuai urutan nama file, atau sinkronkan riwayat migration CLI terlebih dahulu.

### 3. Atur environment variable

Buat file `.env.local` di folder utama project. Ambil Project URL dan anon/publishable key dari **Project Settings → API** di dashboard Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
```

Jangan gunakan atau membagikan `service_role` key di aplikasi.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Membuat akun admin

1. Daftarkan akun melalui halaman aplikasi dan pastikan akun tersebut sudah muncul di **Authentication → Users**.
2. Jalankan query berikut di Supabase **SQL Editor**, dengan mengganti alamat email contoh:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@example.com';
   ```

3. Login menggunakan email dan password akun yang didaftarkan tadi.

Jangan memberikan peran admin kepada akun yang tidak dipercaya.

## Perintah project

```bash
npm run dev    # Menjalankan aplikasi untuk pengembangan
npm run lint   # Memeriksa kode dengan ESLint
npm run build  # Membuat build produksi
npm run start  # Menjalankan build produksi
```

## Deploy ke Vercel

1. Impor repository project ke [Vercel](https://vercel.com/new).
2. Tambahkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` di **Project Settings → Environment Variables** pada Vercel.
3. Pastikan migration database sudah diterapkan ke project Supabase.
4. Di Supabase, buka **Authentication → URL Configuration**. Atur **Site URL** ke domain Vercel dan tambahkan URL tersebut ke **Redirect URLs**. Untuk pengembangan, tambahkan juga `http://localhost:3000/**`.
5. Deploy project dari Vercel.

Setelah repository terhubung, perubahan yang didorong ke branch deployment dapat memicu deploy baru secara otomatis.
