-- =====================================================================
-- LPEK SEED DATA — lpek.pages.dev
-- Lembaga Pariwisata dan Ekonomi Kreatif Muhammadiyah
--
-- Cara pakai:
--   1. Jalankan: npx wrangler d1 execute lpek-db --file=lpek-seed.sql
--   2. Atau via admin: /sys/install (untuk schema), lalu jalankan file ini
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. SETTINGS SITE
-- ---------------------------------------------------------------------
INSERT OR REPLACE INTO settings (key, value) VALUES
  ('site_title',        'LPEK Muhammadiyah'),
  ('site_desc',         'Lembaga Pariwisata dan Ekonomi Kreatif'),
  ('site_url',          'https://lpek.pages.dev'),
  ('site_email',        'info@lpek.muhammadiyah.or.id'),
  ('site_phone',        '+62 21 xxxx xxxx'),
  ('site_address',      'Gedung Pusat Dakwah Muhammadiyah, Jl. Menteng Raya No.62, Jakarta Pusat 10340'),
  ('site_homepage_slug','home'),
  ('social_wa',         '628xxxxxxxxxx'),
  ('social_fb',         'https://facebook.com/lpek.muhammadiyah'),
  ('social_ig',         'https://instagram.com/lpek.muhammadiyah'),
  ('social_yt',         'https://youtube.com/@lpekmuhammadiyah'),
  ('hero_title',        'Memajukan Pariwisata dan Ekonomi Kreatif Berkemajuan'),
  ('hero_desc',         'LPEK Muhammadiyah hadir sebagai lembaga strategis untuk mendorong kemajuan pariwisata halal, ekonomi kreatif, dan kesejahteraan umat melalui program berkelanjutan berbasis nilai Islam berkemajuan.'),
  ('theme_primary',     '#1e56b0'),
  ('theme_primary_dark','#0f2d5c');

-- ---------------------------------------------------------------------
-- 2. USERS (admin awal)
-- Password: admin123 (GANTI SEGERA setelah install!)
-- Hash bcrypt dari "admin123"
-- ---------------------------------------------------------------------
INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES
  ('admin', 'admin@lpek.muhammadiyah.or.id', '$2b$10$rQZ9uAVQKgMjqmMjrGBFGOJaK9UzfOdUJqJvGqGaHVBzb5x4tCXaK', 'admin');

-- ---------------------------------------------------------------------
-- 3. THEMES — Aktifkan tema LPEK
-- ---------------------------------------------------------------------
INSERT OR IGNORE INTO themes (id, name, description, active) VALUES
  ('lpek', 'LPEK Theme', 'Tema resmi Lembaga Pariwisata dan Ekonomi Kreatif Muhammadiyah', 1);

-- Non-aktifkan tema lain (opsional, uncomment jika perlu)
-- UPDATE themes SET active = 0 WHERE id != 'lpek';

-- ---------------------------------------------------------------------
-- 4. MENUS NAVIGASI
-- ---------------------------------------------------------------------
DELETE FROM menus;

INSERT INTO menus (label, url, order_num, parent_id) VALUES
  ('Beranda',                    '/',                                    1,  NULL),
  ('Tentang Kami',               '/tentang',                             2,  NULL),
  ('Profil',                     '/profil',                              3,  2),
  ('Visi & Misi',                '/visi-misi',                           4,  2),
  ('Struktur Organisasi',        '/struktur-organisasi',                 5,  2),
  ('Amanah PP Muhammadiyah',     '/amanah-pp-muhammadiyah',              6,  2),
  ('Program',                    '/program',                             9,  NULL),
  ('Pariwisata Berkemajuan',     '/program/pariwisata-berkemajuan',      10, 9),
  ('Ekonomi Kreatif Berkemajuan','/program/ekonomi-kreatif-berkemajuan', 11, 9),
  ('Desa Wisata Berkemajuan',    '/program/desa-wisata-berkemajuan',     12, 9),
  ('UMKM Berkemajuan',           '/program/umkm-berkemajuan',           13, 9),
  ('Wellness Heritage Berkemajuan','/program/wellness-heritage-berkemajuan', 14, 9),
  ('Direktori',                  '/direktori',                           15, NULL),
  ('Destinasi',                  '/direktori/destinasi',                 16, 15),
  ('UMKM',                       '/direktori/umkm',                     17, 15),
  ('Restoran',                   '/direktori/restoran',                  18, 15),
  ('Mitra',                      '/direktori/mitra',                     19, 15),
  ('Akademi',                    '/akademi',                             20, NULL),
  ('Pelatihan',                  '/akademi/pelatihan',                   21, 20),
  ('Webinar',                    '/akademi/webinar',                     22, 20),
  ('Sertifikasi',                '/akademi/sertifikasi',                 23, 20),
  ('Modul',                      '/akademi/modul',                       24, 20),
  ('Berita',                     '/berita',                              26, NULL),
  ('Kontak',                     '/kontak',                              28, NULL);

-- ---------------------------------------------------------------------
-- 5. PAGES — Halaman Statis
-- ---------------------------------------------------------------------

-- Home (custom hero text override)
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('home', 'Beranda', '<p>Selamat datang di LPEK Muhammadiyah.</p>', 'publish');

-- Tentang Kami
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('tentang', 'Tentang Kami', '<p>LPEK (Lembaga Pariwisata dan Ekonomi Kreatif) adalah lembaga resmi Muhammadiyah yang bertugas mengembangkan sektor pariwisata halal dan ekonomi kreatif berbasis nilai Islam berkemajuan.</p>', 'publish');

-- Profil
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('profil', 'Profil Lembaga', '<h2>Tentang LPEK Muhammadiyah</h2>
<p>Lembaga Pariwisata dan Ekonomi Kreatif (LPEK) Muhammadiyah adalah lembaga resmi yang dibentuk berdasarkan amanah Pimpinan Pusat Muhammadiyah untuk mengembangkan dan memajukan sektor pariwisata halal dan ekonomi kreatif di Indonesia.</p>
<h2>Latar Belakang</h2>
<p>Sektor pariwisata dan ekonomi kreatif merupakan salah satu sektor strategis yang memiliki potensi besar dalam meningkatkan kesejahteraan umat dan bangsa. Muhammadiyah sebagai organisasi Islam terbesar di Indonesia memiliki tanggung jawab untuk turut serta dalam mengembangkan sektor ini dengan berlandaskan nilai-nilai Islam yang berkemajuan.</p>
<h2>Dasar Hukum</h2>
<p>LPEK dibentuk berdasarkan Surat Keputusan Pimpinan Pusat Muhammadiyah dan bertanggung jawab langsung kepada Majelis Ekonomi dan Kewirausahaan PP Muhammadiyah.</p>', 'publish');

-- Visi Misi
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('visi-misi', 'Visi & Misi', '<h2>Visi</h2>
<blockquote>Menjadi lembaga terdepan dalam pengembangan pariwisata halal dan ekonomi kreatif berbasis nilai Islam berkemajuan untuk kesejahteraan umat dan bangsa Indonesia.</blockquote>
<h2>Misi</h2>
<ul>
<li>Mengembangkan ekosistem pariwisata halal yang komprehensif dan berkelanjutan</li>
<li>Memberdayakan pelaku ekonomi kreatif, UMKM, dan komunitas wisata berbasis nilai Islam</li>
<li>Menyelenggarakan pendidikan dan pelatihan SDM pariwisata dan ekonomi kreatif berkualitas</li>
<li>Membangun direktori dan jejaring destinasi wisata, UMKM, restoran halal, dan mitra strategis</li>
<li>Mendorong kolaborasi lintas sektor antara pemerintah, swasta, akademisi, dan masyarakat</li>
<li>Melestarikan dan mempromosikan warisan budaya (heritage) dalam bingkai pariwisata berkemajuan</li>
</ul>
<h2>Nilai-nilai</h2>
<ul>
<li><strong>Islam Berkemajuan</strong> — Bergerak dengan spirit Islam yang terbuka, inklusif, dan adaptif</li>
<li><strong>Profesional</strong> — Bekerja dengan standar tinggi dan kompeten</li>
<li><strong>Kolaboratif</strong> — Membangun sinergi dengan berbagai pihak</li>
<li><strong>Inovatif</strong> — Terus berinovasi dalam menjawab tantangan zaman</li>
<li><strong>Berkeadaban</strong> — Menjunjung tinggi nilai-nilai kemanusiaan dan etika</li>
</ul>', 'publish');

-- Struktur Organisasi
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('struktur-organisasi', 'Struktur Organisasi', '<h2>Struktur Organisasi LPEK Muhammadiyah</h2>
<p>Struktur organisasi LPEK terdiri dari:</p>
<ul>
<li><strong>Ketua</strong></li>
<li><strong>Sekretaris</strong></li>
<li><strong>Bendahara</strong></li>
<li><strong>Divisi Program &amp; Pengembangan</strong></li>
<li><strong>Divisi Direktori &amp; Kemitraan</strong></li>
<li><strong>Divisi Akademi &amp; SDM</strong></li>
<li><strong>Divisi Komunikasi &amp; Media</strong></li>
<li><strong>Divisi Riset &amp; Inovasi</strong></li>
</ul>
<p><em>Untuk informasi lengkap mengenai pengurus, silakan hubungi sekretariat LPEK.</em></p>', 'publish');

-- Amanah PP Muhammadiyah
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('amanah-pp-muhammadiyah', 'Amanah PP Muhammadiyah untuk LPEK', '<h2>Amanah Pimpinan Pusat Muhammadiyah</h2>
<p>Pimpinan Pusat Muhammadiyah memberikan amanah kepada LPEK untuk:</p>
<ul>
<li>Menjadi garda terdepan dalam pengembangan wisata halal dan ramah muslim Indonesia</li>
<li>Memfasilitasi dan memberdayakan amal usaha Muhammadiyah di bidang pariwisata dan ekonomi kreatif</li>
<li>Berkontribusi nyata dalam menyukseskan program-program Muhammadiyah di bidang ekonomi dan kesejahteraan umat</li>
<li>Menjadi representasi Muhammadiyah dalam forum-forum nasional dan internasional di bidang pariwisata dan ekonomi kreatif</li>
</ul>', 'publish');

-- Napak Tilas KH Ahmad Dahlan
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('napak-tilas-sejarah-kh-ahmad-dahlan', 'Napak Tilas Sejarah KH Ahmad Dahlan', '<h2>Mengenal KH Ahmad Dahlan, Pendiri Muhammadiyah</h2>
<p>KH Ahmad Dahlan (1868–1923) adalah ulama besar Yogyakarta yang mendirikan Muhammadiyah pada 18 November 1912. Beliau dikenal sebagai tokoh pembaharu Islam yang memadukan semangat keagamaan dengan kemajuan zaman.</p>
<h2>Jejak Perjuangan</h2>
<p>Program Napak Tilas KH Ahmad Dahlan merupakan program wisata sejarah-religi LPEK yang mengajak masyarakat untuk:</p>
<ul>
<li>Mengunjungi tempat-tempat bersejarah terkait KH Ahmad Dahlan dan Muhammadiyah</li>
<li>Mengenal lebih dalam pemikiran dan perjuangan pendiri Muhammadiyah</li>
<li>Menginspirasi generasi muda dengan semangat Islam berkemajuan</li>
</ul>
<h2>Destinasi Napak Tilas</h2>
<ul>
<li>Rumah Kelahiran KH Ahmad Dahlan, Kauman, Yogyakarta</li>
<li>Masjid Gedhe Kauman, Yogyakarta</li>
<li>Kantor PP Muhammadiyah, Yogyakarta</li>
<li>Museum Muhammadiyah, Yogyakarta</li>
<li>Makam KH Ahmad Dahlan, Karangkajen, Yogyakarta</li>
</ul>', 'publish');

-- Parekraf Muktamar ke-49 Medan
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('parekraf-muktamar-49-medan', 'Parekraf untuk Muktamar ke-49 Medan', '<h2>Kontribusi LPEK dalam Muktamar ke-49 Muhammadiyah</h2>
<p>Muktamar ke-49 Muhammadiyah yang diselenggarakan di Kota Medan merupakan momentum strategis bagi LPEK untuk menampilkan potensi pariwisata dan ekonomi kreatif Sumatera Utara kepada seluruh peserta muktamar dari penjuru Indonesia.</p>
<h2>Program LPEK di Muktamar ke-49</h2>
<ul>
<li><strong>Pameran Wisata Halal &amp; Ekraf Sumatera Utara</strong> — Menampilkan destinasi wisata, produk ekraf, dan kuliner halal unggulan</li>
<li><strong>Seminar Nasional Pariwisata Berkemajuan</strong> — Forum diskusi tentang arah pengembangan wisata halal Indonesia</li>
<li><strong>Wisata Kota Medan</strong> — Paket wisata untuk peserta muktamar menjelajahi keindahan Kota Medan</li>
<li><strong>Expo UMKM Muhammadiyah</strong> — Pameran produk UMKM dari seluruh Indonesia</li>
</ul>
<h2>Tentang Medan sebagai Tuan Rumah</h2>
<p>Kota Medan, ibu kota Provinsi Sumatera Utara, dipilih sebagai tuan rumah Muktamar ke-49 karena merupakan salah satu kota terbesar di Indonesia dengan kekayaan budaya, kuliner, dan destinasi wisata yang luar biasa.</p>', 'publish');

-- Kolaborasi
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('kolaborasi', 'Kolaborasi', NULL, 'publish');

-- Kontak
INSERT OR IGNORE INTO pages (slug, title, body, status) VALUES
('kontak', 'Kontak', NULL, 'publish');

-- ---------------------------------------------------------------------
-- 6. SAMPLE POSTS — Berita & Konten
-- ---------------------------------------------------------------------

-- Berita 1
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('lpek-luncurkan-program-wisata-halal-2026',
 'LPEK Luncurkan Program Wisata Halal Nasional 2026',
 '<p>Lembaga Pariwisata dan Ekonomi Kreatif (LPEK) Muhammadiyah secara resmi meluncurkan Program Wisata Halal Nasional 2026 dalam rangka mendorong pertumbuhan sektor pariwisata berbasis nilai Islam di seluruh Indonesia.</p>
 <p>Program ini mencakup pengembangan destinasi wisata halal, pemberdayaan UMKM lokal, dan pelatihan SDM pariwisata. Target utama program ini adalah menjangkau 500 destinasi wisata halal dan 5.000 pelaku UMKM di seluruh Indonesia pada akhir tahun 2026.</p>
 <blockquote>Program ini merupakan wujud nyata komitmen Muhammadiyah dalam memajukan sektor pariwisata halal Indonesia — Ketua LPEK</blockquote>',
 'Berita',
 'publish',
 datetime('now', '-1 day'));

-- Berita 2
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('workshop-desa-wisata-berkemajuan-yogyakarta',
 'Workshop Desa Wisata Berkemajuan Sukses Digelar di Yogyakarta',
 '<p>LPEK Muhammadiyah menyelenggarakan Workshop Desa Wisata Berkemajuan di Yogyakarta yang dihadiri oleh 200 pengelola desa wisata dari berbagai daerah di Jawa dan Bali.</p>
 <p>Workshop ini membahas strategi pengembangan desa wisata berbasis komunitas, manajemen homestay halal, dan pemasaran digital untuk destinasi wisata pedesaan.</p>',
 'Program',
 'publish',
 datetime('now', '-3 days'));

-- Berita 3
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('sertifikasi-pemandu-wisata-halal-batch-3',
 'Pembukaan Sertifikasi Pemandu Wisata Halal Batch 3',
 '<p>Akademi LPEK kembali membuka pendaftaran Sertifikasi Pemandu Wisata Halal Batch 3 yang akan diselenggarakan secara hybrid (online dan offline).</p>
 <p>Program sertifikasi ini bertujuan mencetak pemandu wisata yang kompeten, profesional, dan memahami nilai-nilai Islam berkemajuan dalam layanan wisata.</p>',
 'Akademi',
 'publish',
 datetime('now', '-5 days'));

-- Berita 4
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('pameran-ekraf-muhammadiyah-2026',
 'LPEK Hadirkan Pameran Ekonomi Kreatif Muhammadiyah 2026',
 '<p>LPEK Muhammadiyah akan menggelar Pameran Ekonomi Kreatif Muhammadiyah 2026 yang menampilkan ratusan produk kreatif dari pelaku UMKM binaan Muhammadiyah se-Indonesia.</p>
 <p>Pameran ini terbuka untuk umum dan gratis. Pengunjung dapat langsung berinteraksi dengan para pelaku kreatif dan membeli produk unggulan mereka.</p>',
 'Berita',
 'publish',
 datetime('now', '-7 days'));

-- Berita 5
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('wellness-heritage-kolaborasi-spa-tradisional',
 'LPEK Kolaborasikan Wellness Heritage dengan Pengusaha Spa Tradisional',
 '<p>Program Wellness Heritage Berkemajuan LPEK berhasil menjalin kolaborasi dengan 50 pengusaha spa dan wellness tradisional dari berbagai daerah untuk mengembangkan paket wisata kesehatan berbasis kearifan lokal.</p>',
 'Program',
 'publish',
 datetime('now', '-10 days'));

-- Kegiatan 1
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('webinar-strategi-pemasaran-digital-wisata',
 'Webinar: Strategi Pemasaran Digital untuk Destinasi Wisata',
 '<p>LPEK mengundang pengelola destinasi wisata dan pelaku ekraf untuk mengikuti Webinar Strategi Pemasaran Digital.</p>
 <p><strong>Waktu:</strong> 25 Agustus 2026, 13.00–15.30 WIB<br>
 <strong>Platform:</strong> Zoom Meeting<br>
 <strong>Narasumber:</strong> Praktisi Digital Marketing Pariwisata</p>
 <p>Daftarkan diri Anda sekarang melalui link registrasi yang tersedia.</p>',
 'kegiatan',
 'publish',
 datetime('now', '+5 days'));

-- Kegiatan 2
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('pelatihan-fotografi-destinasi-wisata',
 'Pelatihan Fotografi Destinasi Wisata untuk UMKM',
 '<p>Program Akademi LPEK menggelar Pelatihan Fotografi Destinasi Wisata untuk pelaku UMKM dan pengelola destinasi wisata.</p>
 <p><strong>Waktu:</strong> 1 September 2026<br>
 <strong>Tempat:</strong> Jakarta Pusat<br>
 <strong>Peserta:</strong> Terbatas 30 orang</p>',
 'kegiatan',
 'publish',
 datetime('now', '+12 days'));

-- Sample Direktori: Destinasi
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('pantai-iboih-sabang',
 'Pantai Iboih, Sabang — Surga Bawah Laut Aceh',
 '<p>Pantai Iboih di Pulau Weh, Sabang, Aceh adalah salah satu destinasi snorkeling dan diving terbaik di Indonesia. Air biru jernih dan terumbu karang yang masih alami menjadikannya surga para pecinta wisata bahari.</p>
 <p>Destinasi ini tersertifikasi sebagai kawasan wisata ramah muslim dengan fasilitas sholat yang memadai dan pilihan kuliner halal yang beragam.</p>',
 'destinasi',
 'publish',
 datetime('now', '-15 days'));

-- Sample Direktori: UMKM
INSERT OR IGNORE INTO posts (slug, title, body, category, status, created_at) VALUES
('batik-muhammadiyah-yogyakarta',
 'Batik Muhammadiyah Yogyakarta',
 '<p>Batik Muhammadiyah Yogyakarta adalah UMKM batik binaan LPEK yang menghasilkan batik berkualitas tinggi dengan motif-motif islami dan kontemporer.</p>
 <p>Produk tersedia dalam bentuk kain, kemeja, dan berbagai aksesori fashion. Harga terjangkau dengan kualitas premium.</p>',
 'umkm',
 'publish',
 datetime('now', '-8 days'));

-- ---------------------------------------------------------------------
-- SELESAI!
-- Jalankan query ini ke D1 database Anda.
-- Setelah itu, aktifkan tema LPEK melalui /admin > Themes
-- ---------------------------------------------------------------------
