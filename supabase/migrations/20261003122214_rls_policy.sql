-- Fungsi bantu: apakah user yang sedang login adalah admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id_user = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles    enable row level security;
alter table public.poli        enable row level security;
alter table public.dokter      enable row level security;
alter table public.pasien      enable row level security;
alter table public.pendaftaran enable row level security;

-- POLI & DOKTER: semua user login boleh lihat, hanya admin boleh ubah
create policy "lihat poli" on public.poli
  for select to authenticated using (true);
create policy "admin kelola poli" on public.poli
  for all to authenticated using (is_admin()) with check (is_admin());

create policy "lihat dokter" on public.dokter
  for select to authenticated using (true);
create policy "admin kelola dokter" on public.dokter
  for all to authenticated using (is_admin()) with check (is_admin());

-- PROFILES: lihat/ubah milik sendiri, admin boleh semua
create policy "lihat profil" on public.profiles
  for select to authenticated using (id_user = auth.uid() or is_admin());
create policy "ubah profil" on public.profiles
  for update to authenticated using (id_user = auth.uid() or is_admin());

-- PASIEN: pasien hanya data miliknya, admin semua
create policy "akses pasien" on public.pasien
  for all to authenticated
  using (id_user = auth.uid() or is_admin())
  with check (id_user = auth.uid() or is_admin());

-- PENDAFTARAN: pasien hanya pendaftaran miliknya, admin semua
create policy "akses pendaftaran" on public.pendaftaran
  for all to authenticated
  using (
    is_admin() or id_pasien in (
      select id_pasien from public.pasien where id_user = auth.uid()
    )
  )
  with check (
    is_admin() or id_pasien in (
      select id_pasien from public.pasien where id_user = auth.uid()
    )
  );