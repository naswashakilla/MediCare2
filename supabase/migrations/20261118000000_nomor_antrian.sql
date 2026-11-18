-- Nomor antrian diberikan per dokter per hari kunjungan.
-- Disimpan di tabel pendaftaran agar nomor tidak berubah ketika kuota/status berubah.
alter table public.pendaftaran
  add column if not exists no_antrian integer;

-- Backfill data lama: nomor urut berdasarkan urutan pendaftaran untuk tiap dokter + tanggal.
with numbered as (
  select
    id_daftar,
    row_number() over (
      partition by id_dokter, tgl_kunjungan
      order by id_daftar
    ) as nomor
  from public.pendaftaran
)
update public.pendaftaran p
   set no_antrian = n.nomor
  from numbered n
 where p.id_daftar = n.id_daftar
   and p.no_antrian is null;

-- Fungsi penomoran otomatis. Menggunakan advisory lock yang sama dengan
-- pembatas kuota harian agar penomoran tetap aman saat ada pendaftaran bersamaan.
create or replace function public.assign_no_antrian()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_no integer;
begin
  -- Dokter dan tanggal tidak berubah: pertahankan nomor yang sudah ada.
  if tg_op = 'UPDATE'
     and new.id_dokter = old.id_dokter
     and new.tgl_kunjungan = old.tgl_kunjungan
     and new.no_antrian is not null
  then
    return new;
  end if;

  perform pg_advisory_xact_lock(new.id_dokter, new.tgl_kunjungan - date '2000-01-01');

  select coalesce(max(no_antrian), 0) + 1
    into next_no
    from public.pendaftaran
   where id_dokter = new.id_dokter
     and tgl_kunjungan = new.tgl_kunjungan
     and id_daftar is distinct from new.id_daftar;

  new.no_antrian := next_no;
  return new;
end;
$$;

drop trigger if exists assign_no_antrian on public.pendaftaran;
create trigger assign_no_antrian
  before insert or update on public.pendaftaran
  for each row
  execute function public.assign_no_antrian();

create index if not exists pendaftaran_dokter_tanggal_idx
  on public.pendaftaran (id_dokter, tgl_kunjungan);
create index if not exists pendaftaran_tanggal_aktif_idx
  on public.pendaftaran (tgl_kunjungan)
  where status <> 'dibatalkan';

-- View publik untuk landing page: hanya informasi antrian yang tidak sensitif.
-- Data pasien (nama, NIK, keluhan) sengaja tidak diekspos.
create or replace view public.antrian_hari_ini
with (security_invoker = false)
as
select
  p.id_daftar,
  p.no_antrian,
  p.status,
  d.id_dokter,
  d.nama_dokter,
  pol.nama_poli
from public.pendaftaran p
join public.dokter d on d.id_dokter = p.id_dokter
join public.poli pol on pol.id_poli = d.id_poli
where p.tgl_kunjungan = (now() at time zone 'Asia/Jakarta')::date
  and p.status <> 'dibatalkan';

grant select on public.antrian_hari_ini to anon, authenticated;
