-- Landing page publik membutuhkan daftar poli dan dokter yang dapat dibaca
-- oleh pengunjung yang belum login. Kebijakan ini hanya menambah akses baca
-- (SELECT) untuk anon; hak akses tulis tetap khusus admin.
drop policy if exists "publik lihat poli" on public.poli;
drop policy if exists "publik lihat dokter" on public.dokter;

create policy "publik lihat poli" on public.poli
  for select to anon using (true);

create policy "publik lihat dokter" on public.dokter
  for select to anon using (true);
