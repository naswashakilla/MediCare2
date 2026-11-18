create or replace function public.assign_no_antrian()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  next_no integer;
begin
  if new.status = 'selesai' then
    if tg_op = 'UPDATE'
      and old.status in ('dikonfirmasi', 'selesai')
      and old.no_antrian is not null
      and new.id_dokter = old.id_dokter
      and new.tgl_kunjungan = old.tgl_kunjungan
    then
      new.no_antrian := old.no_antrian;
    else
      new.no_antrian := null;
    end if;
    return new;
  end if;

  if new.status <> 'dikonfirmasi' then
    new.no_antrian := null;
    return new;
  end if;

  if tg_op = 'UPDATE'
    and old.status = 'dikonfirmasi'
    and old.no_antrian is not null
    and new.id_dokter = old.id_dokter
    and new.tgl_kunjungan = old.tgl_kunjungan
  then
    new.no_antrian := old.no_antrian;
    return new;
  end if;

  perform pg_advisory_xact_lock(new.id_dokter, new.tgl_kunjungan - date '2000-01-01');

  select coalesce(max(no_antrian), 0) + 1
    into next_no
    from public.pendaftaran
   where id_dokter = new.id_dokter
     and tgl_kunjungan = new.tgl_kunjungan
     and status in ('dikonfirmasi', 'selesai')
     and id_daftar is distinct from new.id_daftar;

  new.no_antrian := next_no;
  return new;
end;
$$;

-- Hapus nomor yang sebelumnya terlanjur diberikan ke pendaftaran belum dikonfirmasi.
update public.pendaftaran
   set no_antrian = null
 where status not in ('dikonfirmasi', 'selesai')
   and no_antrian is not null;

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
  and p.status in ('dikonfirmasi', 'selesai')
  and p.no_antrian is not null;

grant select on public.antrian_hari_ini to anon, authenticated;
