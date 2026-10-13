insert into public.poli (nama_poli, keterangan) values
    ('Poli Umum', 'Pemeriksaan kesehatan umum'),
    ('Poli Gigi', 'Perawatan gigi dan mulut'),
    ('Poli Anak', 'Perawatan kesehatan anak'),
    ('Poli KIA', 'Kesehatan ibu dan anak'),
    ('Poli Penyakit Dalam', 'Penyakit dalam dan konsultasi spesialis'),
    ('Poli Bedah', 'Tindakan bedah dan operasi'),
    ('Poli THT', 'Telinga, Hidung, Tenggorokan'),
    ('Poli Mata', 'Pemeriksaan mata dan kacamata'),
    ('Poli Kulit & Kelamin', 'Penyakit kulit dan kelamin'),
    ('Poli Jantung', 'Konsultasi penyakit jantung');

insert into public.dokter (nama_dokter, spesialis, id_poli, hari_praktik, jam_mulai, jam_selesai) values
    ('Dr. Andi Santoso', 'Umum', 1, 'Senin, Rabu, Jumat', '08:00', '12:00'),
    ('Dr. Budi Hartono', 'Gigi', 2, 'Selasa, Kamis', '09:00', '13:00'),
    ('Dr. Citra Dewi', 'Anak', 3, 'Senin - Jumat', '10:00', '14:00'),
    ('Dr. Dedi Prasetyo', 'KIA', 4, 'Senin - Kamis', '08:30', '12:30'),
    ('Dr. Eko Nugroho', 'Penyakit Dalam', 5, 'Selasa - Jumat', '09:30', '13:30'),
    ('Dr. Fajar Hidayat', 'Bedah', 6, 'Senin - Rabu', '10:00', '14:00'),
    ('Dr. Gita Lestari', 'THT', 7, 'Kamis - Jumat', '08:00', '12:00'),
    ('Dr. Hendra Wijaya', 'Mata', 8, 'Senin - Kamis', '09:00', '13:00'),
    ('Dr. Indah Permatasari', 'Kulit & Kelamin', 9, 'Selasa - Jumat', '10:30', '14:30'),
    ('Dr. Joko Susanto', 'Jantung', 10, 'Senin - Rabu', '08:30', '12:30');

insert into public.pasien (id_user, nama_pasien, nik, tempatlahir, tgllahir, jk, alamat, no_hp) values
    ('00000000-0000-0000-0000-000000000001', 'Ahmad Fauzi', '1234567890123456', 'Jakarta','2005-03-14','Laki-laki', 'Jl. Merdeka No. 123', '081234567890'),
    ('00000000-0000-0000-0000-000000000002', 'Siti Aminah', '2345678901234567', 'Bandung','2006-07-22','Perempuan', 'Jl. Sudirman No. 456', '081987654321');

insert into public.pendaftaran (id_pasien, id_dokter, tgl_kunjungan, keluhan, status) values
    (1, 1, current_date + 2, 'Demam dan batuk', 'menunggu'),
    (2, 2, current_date + 1, 'Sakit gigi', 'dikonfirmasi');