create or replace function public.enforce_dokter_daily_pendaftaran_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  active_count integer;
begin
  if new.status = 'dibatalkan' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and new.id_dokter = old.id_dokter
    and new.tgl_kunjungan = old.tgl_kunjungan
    and new.status = old.status
  then
    return new;
  end if;

  perform pg_advisory_xact_lock(new.id_dokter, new.tgl_kunjungan - date '2000-01-01');

  select count(*)
    into active_count
    from public.pendaftaran
   where id_dokter = new.id_dokter
     and tgl_kunjungan = new.tgl_kunjungan
     and status <> 'dibatalkan'
     and id_daftar is distinct from new.id_daftar;

  if active_count >= 15 then
    raise exception 'Kuota dokter untuk tanggal tersebut sudah penuh (maksimal 15 pasien).'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;
