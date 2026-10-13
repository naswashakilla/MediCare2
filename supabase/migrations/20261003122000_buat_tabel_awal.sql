create table public.profiles (
  id_user   uuid primary key references auth.users(id) on delete cascade,
  nama_user varchar(50)  not null,
  email     varchar(100) not null,
  role      varchar(10)  not null default 'pasien'
            check (role in ('admin', 'pasien'))
);

create table public.poli (
  id_poli    int generated always as identity primary key,
  nama_poli  varchar(30) not null,
  keterangan varchar(100)
);

create table public.dokter (
  id_dokter    int generated always as identity primary key,
  nama_dokter  varchar(50) not null,
  spesialis    varchar(30),
  id_poli      int not null references public.poli(id_poli),
  hari_praktik varchar(30),
  jam_mulai    time,
  jam_selesai  time
);

create table public.pasien (
  id_pasien   int generated always as identity primary key,
  id_user     uuid references public.profiles(id_user) on delete set null,
  nama_pasien varchar(50) not null,
  nik         varchar(16) unique,
  tempatlahir varchar(30),
  tgllahir    date,
  jk          varchar(10) check (jk in ('Laki-laki', 'Perempuan')),
  alamat      varchar(100),
  no_hp       varchar(15)
);

create table public.pendaftaran (
  id_daftar     int generated always as identity primary key,
  id_pasien     int not null references public.pasien(id_pasien),
  id_dokter     int not null references public.dokter(id_dokter),
  tgl_daftar    timestamp not null default now(),
  tgl_kunjungan date not null,
  keluhan       varchar(200),
  status        varchar(15) not null default 'menunggu'
                check (status in ('menunggu', 'dikonfirmasi', 'selesai', 'dibatalkan'))
);