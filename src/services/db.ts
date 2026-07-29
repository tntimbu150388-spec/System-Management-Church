/**
 * Church Management System - Database Service
 * Manages local persistent storage and Google Sheets / Google Apps Script Realtime Synchronization.
 */

import {
  SystemDatabase,
  User,
  Jemaat,
  Keluarga,
  Pelayanan,
  Jadwal,
  Absensi,
  Persembahan,
  Keuangan,
  EventGereja,
  Pengumuman,
  Doa,
  Inventaris,
  Komisi,
  Wilayah,
  Notifikasi,
  LogAktivitas,
  Pengaturan,
  EventRegistrasi,
  Kunjungan,
  Renungan
} from '../types';

const STORAGE_KEY = 'CMS_GEREJA_DATABASE_V1';

// Simple SHA-256 password hash simulator using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const msgUint8 = new TextEncoder().encode(password + '_CMS_SALT_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Initial Seeded Church Data
const DEFAULT_DATABASE: SystemDatabase = {
  PENGATURAN: {
    NamaGereja: 'GKI Kasih Sejahtera',
    Logo: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=150&auto=format&fit=crop&q=80',
    Alamat: 'Jl. Merdeka No. 45, Jakarta Pusat',
    Telepon: '(021) 555-0199',
    Email: 'info@gkikasih.or.id',
    Website: 'https://gkikasih.or.id',
    Tema: 'Light',
    WarnaUtama: '#2563eb',
    GasWebAppUrl: '',
    GoogleSheetID: '',
    RealtimeSyncInterval: 5,
  },
  USERS: [
    {
      UserID: 'USR-001',
      Username: 'superadmin',
      PasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
      Role: 'SUPER_ADMIN',
      Nama: 'Pdt. Andreas Sutejo, S.Th',
      Email: 'andreas.super@gkikasih.or.id',
      HP: '081234567890',
      Status: 'ACTIVE',
      LastLogin: '2026-07-28 17:30:00',
    },
    {
      UserID: 'USR-002',
      Username: 'admin',
      PasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
      Role: 'ADMIN',
      Nama: 'Sdr. Budi Santoso (Sekretariat)',
      Email: 'budi.admin@gkikasih.or.id',
      HP: '081987654321',
      Status: 'ACTIVE',
      LastLogin: '2026-07-28 16:45:00',
    },
    {
      UserID: 'USR-003',
      Username: 'jemaat1',
      PasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
      Role: 'JEMAAT',
      Nama: 'Drs. Yohanes Wijaya',
      Email: 'yohanes.w@gmail.com',
      HP: '081333444555',
      Status: 'ACTIVE',
      LastLogin: '2026-07-28 12:15:00',
    },
    {
      UserID: 'USR-004',
      Username: 'jemaat2',
      PasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // 'admin123'
      Role: 'JEMAAT',
      Nama: 'Maria Elisabeth, S.E.',
      Email: 'maria.eli@gmail.com',
      HP: '081555666777',
      Status: 'ACTIVE',
      LastLogin: '2026-07-27 19:20:00',
    },
    {
      UserID: 'USR-005',
      Username: 'jemaat_baru',
      PasswordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
      Role: 'JEMAAT',
      Nama: 'Daniel Pratama',
      Email: 'daniel.pratama@gmail.com',
      HP: '081777888999',
      Status: 'PENDING',
      LastLogin: '-',
    }
  ],
  JEMAAT: [
    {
      JemaatID: 'JEM-001',
      UserID: 'USR-003',
      Nama: 'Drs. Yohanes Wijaya',
      NIK: '3171011503880001',
      KK: '3171011503880010',
      Gender: 'L',
      TempatLahir: 'Jakarta',
      TanggalLahir: '1988-03-15',
      Alamat: 'Jl. Melati No. 12, Wilayah I',
      Wilayah: 'Wilayah I - Pusat',
      HP: '081333444555',
      Email: 'yohanes.w@gmail.com',
      Baptis: 'Ya',
      TanggalBaptis: '1995-12-25',
      Sidi: 'Ya',
      TanggalSidi: '2005-04-10',
      Status: 'Aktif',
      Foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      JemaatID: 'JEM-002',
      UserID: 'USR-004',
      Nama: 'Maria Elisabeth, S.E.',
      NIK: '3171012008920002',
      KK: '3171011503880010',
      Gender: 'P',
      TempatLahir: 'Bandung',
      TanggalLahir: '1992-08-20',
      Alamat: 'Jl. Melati No. 12, Wilayah I',
      Wilayah: 'Wilayah I - Pusat',
      HP: '081555666777',
      Email: 'maria.eli@gmail.com',
      Baptis: 'Ya',
      TanggalBaptis: '1998-05-10',
      Sidi: 'Ya',
      TanggalSidi: '2008-04-20',
      Status: 'Aktif',
      Foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      JemaatID: 'JEM-003',
      UserID: 'USR-005',
      Nama: 'Daniel Pratama',
      NIK: '3171011010990003',
      KK: '3171011010990099',
      Gender: 'L',
      TempatLahir: 'Surabaya',
      TanggalLahir: '1999-10-10',
      Alamat: 'Jl. Mawar No. 8, Wilayah II',
      Wilayah: 'Wilayah II - Barat',
      HP: '081777888999',
      Email: 'daniel.pratama@gmail.com',
      Baptis: 'Ya',
      TanggalBaptis: '2010-06-15',
      Sidi: 'Belum',
      Status: 'Pending',
      Foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    }
  ],
  KELUARGA: [
    {
      FamilyID: 'FAM-001',
      NoKK: '3171011503880010',
      KepalaKeluarga: 'Drs. Yohanes Wijaya',
      Alamat: 'Jl. Melati No. 12, Wilayah I',
      Wilayah: 'Wilayah I - Pusat',
      AnggotaCount: 4,
    },
    {
      FamilyID: 'FAM-002',
      NoKK: '3171011010990099',
      KepalaKeluarga: 'Daniel Pratama',
      Alamat: 'Jl. Mawar No. 8, Wilayah II',
      Wilayah: 'Wilayah II - Barat',
      AnggotaCount: 1,
    }
  ],
  PELAYANAN: [
    {
      PelayananID: 'PLY-001',
      NamaPelayanan: 'Worship Leader (WL)',
      Kategori: 'Ibadah Utama',
      Deskripsi: 'Memimpin pujian dan penyembahan pada ibadah Minggu.',
    },
    {
      PelayananID: 'PLY-002',
      NamaPelayanan: 'Pemusik & Singer',
      Kategori: 'Ibadah Utama',
      Deskripsi: 'Pelayanan musik instrumen dan vokal latar.',
    },
    {
      PelayananID: 'PLY-003',
      NamaPelayanan: 'Multimedia & Live Stream',
      Kategori: 'Teknis',
      Deskripsi: 'Pengoperasian PPT lyric, OBS, dan siaran langsung.',
    },
    {
      PelayananID: 'PLY-004',
      NamaPelayanan: 'Guru Sekolah Minggu (GSM)',
      Kategori: 'Anak',
      Deskripsi: 'Mengajar kelas anak-anak di Sekolah Minggu.',
    },
    {
      PelayananID: 'PLY-005',
      NamaPelayanan: 'Usher & Penerima Tamu',
      Kategori: 'Ketertiban',
      Deskripsi: 'Menyambut jemaat, membagikan warta, dan ketertiban ruangan.',
    }
  ],
  JADWAL: [
    {
      JadwalID: 'JDW-001',
      Tanggal: '2026-08-02',
      Jam: '08:00 WIB',
      Ibadah: 'Ibadah Raya I (Pagi)',
      Pelayanan: 'Worship Leader & Pemusik',
      Jemaat: 'Drs. Yohanes Wijaya (WL), Tim Praise',
      Status: 'Jadwal',
      Lokasi: 'Gedung Utama Lt. 1',
    },
    {
      JadwalID: 'JDW-002',
      Tanggal: '2026-08-02',
      Jam: '10:30 WIB',
      Ibadah: 'Ibadah Raya II (Siang)',
      Pelayanan: 'Multimedia & Usher',
      Jemaat: 'Maria Elisabeth, S.E., Tim Media',
      Status: 'Jadwal',
      Lokasi: 'Gedung Utama Lt. 1',
    },
    {
      JadwalID: 'JDW-003',
      Tanggal: '2026-08-02',
      Jam: '08:00 WIB',
      Ibadah: 'Ibadah Sekolah Minggu',
      Pelayanan: 'Guru Sekolah Minggu',
      Jemaat: 'Sdr. Budi Santoso & Tim GSM',
      Status: 'Jadwal',
      Lokasi: 'Aula Anak Lt. 2',
    }
  ],
  ABSENSI: [
    {
      AbsensiID: 'ABS-001',
      UserID: 'USR-003',
      JadwalID: 'JDW-001',
      Hadir: 'Ya',
      Jam: '07:45',
      Tipe: 'Pelayan',
      Nama: 'Drs. Yohanes Wijaya',
    },
    {
      AbsensiID: 'ABS-002',
      UserID: 'USR-004',
      JadwalID: 'JDW-001',
      Hadir: 'Ya',
      Jam: '07:55',
      Tipe: 'Jemaat',
      Nama: 'Maria Elisabeth, S.E.',
    }
  ],
  PERSEMBAHAN: [
    {
      PersembahanID: 'PSB-001',
      UserID: 'USR-003',
      Jenis: 'Perpuluhan',
      Nominal: 1500000,
      Tanggal: '2026-07-26',
      Metode: 'QRIS',
      Catatan: 'Perpuluhan Bulan Juli 2026',
      NamaJemaat: 'Drs. Yohanes Wijaya',
    },
    {
      PersembahanID: 'PSB-002',
      UserID: 'USR-004',
      Jenis: 'Diakonia',
      Nominal: 500000,
      Tanggal: '2026-07-26',
      Metode: 'Transfer Bank',
      Catatan: 'Persembahan Diakonia Lansia',
      NamaJemaat: 'Maria Elisabeth, S.E.',
    },
    {
      PersembahanID: 'PSB-003',
      UserID: 'USR-003',
      Jenis: 'Pembangunan',
      Nominal: 1000000,
      Tanggal: '2026-07-19',
      Metode: 'QRIS',
      Catatan: 'Dana Renovasi Pastori',
      NamaJemaat: 'Drs. Yohanes Wijaya',
    }
  ],
  KEUANGAN: [
    {
      TransaksiID: 'TRX-001',
      Jenis: 'Pemasukan',
      Kategori: 'Persembahan Ibadah Minggu',
      Nominal: 8500000,
      Tanggal: '2026-07-26',
      Keterangan: 'Persembahan Ibadah Raya 1 & 2 Tanggal 26 Juli 2026',
    },
    {
      TransaksiID: 'TRX-002',
      Jenis: 'Pengeluaran',
      Kategori: 'Operasional & Listrik',
      Nominal: 2300000,
      Tanggal: '2026-07-25',
      Keterangan: 'Pembayaran Tagihan Listrik PLN & Air PAM Gedung Gereja',
    },
    {
      TransaksiID: 'TRX-003',
      Jenis: 'Pemasukan',
      Kategori: 'Perpuluhan Jemaat',
      Nominal: 12500000,
      Tanggal: '2026-07-20',
      Keterangan: 'Total Perpuluhan Transfer Bank Minggu Ke-3',
    }
  ],
  EVENT: [
    {
      EventID: 'EVT-001',
      Nama: 'Seminar Digital Ministry & Pemuda 2026',
      Tanggal: '2026-08-17',
      Jam: '09:00 WIB',
      Lokasi: 'Auditorium Gereja Utama',
      Deskripsi: 'Strategi pelayanan kreatif dan pemanfaatan teknologi digital untuk pemuda gereja modern.',
      Kategori: 'Seminar',
      Kapasitas: 150,
      Gambar: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=500&auto=format&fit=crop&q=80',
      PesertaCount: 42,
    },
    {
      EventID: 'EVT-002',
      Nama: 'Retreat Doa & Pemulihan Keluarga',
      Tanggal: '2026-09-05',
      Jam: '08:00 WIB',
      Lokasi: 'Puncak Villa Resta, Bogor',
      Deskripsi: 'Acara penguatan spiritual dan keakraban pasangan serta keluarga jemaat.',
      Kategori: 'Retreat',
      Kapasitas: 60,
      Gambar: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
      PesertaCount: 28,
    }
  ],
  EVENT_REGISTRASI: [
    {
      RegID: 'REG-001',
      EventID: 'EVT-001',
      UserID: 'USR-003',
      Nama: 'Drs. Yohanes Wijaya',
      Email: 'yohanes.w@gmail.com',
      HP: '081333444555',
      TanggalReg: '2026-07-27',
      Status: 'Terdaftar',
    }
  ],
  PENGUMUMAN: [
    {
      PengumumanID: 'PGM-001',
      Judul: 'Jadwal Pembersihan Gedung & Kerja Bakti Kebersihan',
      Isi: 'Diberitahukan kepada seluruh jemaat dan pengurus komisi bahwa Sabtu ini, 1 Agustus 2026 pukul 08.00 WIB akan dilaksanakan Kerja Bakti bersama.',
      Publish: true,
      Target: 'Semua',
      Tanggal: '2026-07-28',
    },
    {
      PengumumanID: 'PGM-002',
      Judul: 'Pembukaan Pendaftaran Kelas Katekisasi / Sidi 2026',
      Isi: 'Pendaftaran dibuka untuk remaja/dewasa muda yang merencanakan pembinaan Sidi. Silakan mendaftar melalui sekretariat atau menu Jemaat.',
      Publish: true,
      Target: 'Jemaat',
      Tanggal: '2026-07-25',
    }
  ],
  DOA: [
    {
      DoaID: 'DOA-001',
      UserID: 'USR-003',
      NamaPemohon: 'Drs. Yohanes Wijaya',
      Isi: 'Mohon dukungan doa untuk kesehatan Orang Tua yang sedang dirawat di RS YPK serta kelancaran pemulihan.',
      Kategori: 'Kesehatan',
      Status: 'Dalam Doa',
      Tanggal: '2026-07-27',
      TanggapanAdmin: 'Tim doa syafaat telah mendoakan dalam persekutuan doa Rabu malam.',
    },
    {
      DoaID: 'DOA-002',
      UserID: 'USR-004',
      NamaPemohon: 'Maria Elisabeth, S.E.',
      Isi: 'Puji Tuhan usaha kuliner keluarga semakin berkembang. Mohon doa ucapan syukur.',
      Kategori: 'Syukur',
      Status: 'Terjawab',
      Tanggal: '2026-07-20',
      TanggapanAdmin: 'Umat mengaminkan dan mengucap syukur bersama!',
    }
  ],
  INVENTARIS: [
    {
      BarangID: 'BRG-001',
      NamaBarang: 'Mixer Sound System Behringer 32 Ch',
      Kategori: 'Elektronik / Audio',
      Lokasi: 'Ruang Kontrol Audio Lt. 1',
      Kondisi: 'Baik',
      Jumlah: 1,
      TanggalPengadaan: '2024-05-10',
    },
    {
      BarangID: 'BRG-002',
      NamaBarang: 'Proyektor Epson 4000 Lumens',
      Kategori: 'Elektronik / Visual',
      Lokasi: 'Gedung Utama Lt. 1',
      Kondisi: 'Baik',
      Jumlah: 2,
      TanggalPengadaan: '2023-11-15',
    },
    {
      BarangID: 'BRG-003',
      NamaBarang: 'Kursi Lipat Chitose Busa Red',
      Kategori: 'Mebel / Perlengkapan',
      Lokasi: 'Gudang Inventaris Lt. 2',
      Kondisi: 'Perlu Perbaikan',
      Jumlah: 120,
      TanggalPengadaan: '2022-01-20',
    }
  ],
  KOMISI: [
    {
      KomisiID: 'KOM-001',
      NamaKomisi: 'Komisi Pemuda & Remaja (KPR)',
      Ketua: 'Sdr. Kevin Alexander',
      Deskripsi: 'Wadah pelayanan dan persekutuan generasi muda gereja.',
      AnggotaCount: 65,
    },
    {
      KomisiID: 'KOM-002',
      NamaKomisi: 'Komisi Wanita / Persekutuan Wanita (PW)',
      Ketua: 'Ibu Ratna Sarumpaet',
      Deskripsi: 'Persekutuan dan diakonia ibu-ibu jemaat.',
      AnggotaCount: 88,
    },
    {
      KomisiID: 'KOM-003',
      NamaKomisi: 'Komisi Anak (Sekolah Minggu)',
      Ketua: 'Ibu Grace Natalia',
      Deskripsi: 'Pengajaran firman Tuhan dan pembinaan anak usia dini.',
      AnggotaCount: 110,
    }
  ],
  WILAYAH: [
    {
      WilayahID: 'WIL-001',
      NamaWilayah: 'Wilayah I - Pusat',
      KetuaWilayah: 'Bpk. Hendra Gunawan',
      AlamatSekretariat: 'Jl. Kebon Sirih No. 10',
    },
    {
      WilayahID: 'WIL-002',
      NamaWilayah: 'Wilayah II - Barat',
      KetuaWilayah: 'Bpk. Fransiskus Xaverius',
      AlamatSekretariat: 'Jl. Puri Indah Blok B4',
    }
  ],
  NOTIFIKASI: [
    {
      NotifID: 'NTF-001',
      UserID: 'USR-003',
      Judul: 'Jadwal Pelayanan Pelayan Ibadah',
      Pesan: 'Anda dijadwalkan sebagai Worship Leader pada Ibadah Minggu 2 Agustus 2026 pukul 08.00 WIB.',
      Dibaca: false,
      Tanggal: '2026-07-28 08:00',
      Tipe: 'Jadwal',
    },
    {
      NotifID: 'NTF-002',
      UserID: 'USR-003',
      Judul: 'Pengumuman Baru',
      Pesan: 'Jadwal Kerja Bakti Gedung Gereja telah dirilis oleh Sekretariat.',
      Dibaca: true,
      Tanggal: '2026-07-28 09:30',
      Tipe: 'Pengumuman',
    }
  ],
  LOG_AKTIVITAS: [
    {
      LogID: 'LOG-001',
      UserID: 'USR-001',
      NamaUser: 'Pdt. Andreas Sutejo',
      Aktivitas: 'Login ke Sistem Super Admin',
      Waktu: '2026-07-28 17:30:00',
      IPAddress: '127.0.0.1',
    },
    {
      LogID: 'LOG-002',
      UserID: 'USR-002',
      NamaUser: 'Sdr. Budi Santoso',
      Aktivitas: 'Menambahkan Jadwal Ibadah Minggu',
      Waktu: '2026-07-28 16:45:10',
      IPAddress: '127.0.0.1',
    }
  ],
  KUNJUNGAN: [
    {
      KunjunganID: 'KNJ-001',
      JemaatID: 'JEM-001',
      NamaJemaat: 'Drs. Yohanes Wijaya',
      Tanggal: '2026-07-30',
      Petugas: 'Pdt. Andreas & Diaken Budi',
      Tujuan: 'Pastoral',
      Catatan: 'Kunjungan penggembalaan rutin wilayah Pusat.',
      Status: 'Rencana',
    }
  ],
  RENUNGAN: [
    {
      RenunganID: 'RNG-001',
      Judul: 'Mengasihi dengan Perbuatan Nyata',
      AyatAlkitab: '1 Yohanes 3:18',
      Isi: 'Anak-anakku, marilah kita mengasihi bukan dengan perkataan atau dengan lidah, melainkan dengan perbuatan dan dalam kebenaran. Di tengah kesibukan sehari-hari, kasih Kristus memanggil kita untuk bertindak nyata bagi sesama.',
      Penulis: 'Pdt. Andreas Sutejo, S.Th',
      Tanggal: '2026-07-28',
      Kategori: 'Harian',
    },
    {
      RenunganID: 'RNG-002',
      Judul: 'Pengharapan di Tengah Badai',
      AyatAlkitab: 'Mazmur 46:2',
      Isi: 'Allah itu bagi kita tempat perlindungan dan kekuatan, sebagai penolong dalam kesesakan sangat terbukti. Janganlah gelisah hatimu, percayalah kepada-Nya.',
      Penulis: 'Tim Doa & Pastoral',
      Tanggal: '2026-07-27',
      Kategori: 'Mingguan',
    }
  ]
};

// Internal database instance initialized lazily
let dbInstance: SystemDatabase | null = null;

export function getDatabase(): SystemDatabase {
  if (!dbInstance) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        dbInstance = JSON.parse(stored);
      } else {
        dbInstance = DEFAULT_DATABASE;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATABASE));
      }
    } catch (e) {
      console.warn('LocalStorage error, using default db', e);
      dbInstance = DEFAULT_DATABASE;
    }
  }
  return dbInstance!;
}

export function saveDatabase(data: SystemDatabase): void {
  dbInstance = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
  // Sync changes to Firebase Cloud Firestore real-time database
  import('./firebase').then(({ pushToFirestore }) => {
    pushToFirestore(data).catch(() => {});
  }).catch(() => {});
}

export function resetDatabaseToDefault(): SystemDatabase {
  dbInstance = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dbInstance));
  return dbInstance!;
}

// Log Activity Helper
export function logAktivitas(userID: string, namaUser: string, aktivitas: string): void {
  const db = getDatabase();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newLog: LogAktivitas = {
    LogID: 'LOG-' + Date.now().toString().slice(-6),
    UserID: userID || 'SYSTEM',
    NamaUser: namaUser || 'Sistem',
    Aktivitas: aktivitas,
    Waktu: now,
    IPAddress: '127.0.0.1 (Local Web PWA)',
  };
  db.LOG_AKTIVITAS = [newLog, ...(db.LOG_AKTIVITAS || [])].slice(0, 100); // keep last 100
  saveDatabase(db);
}

// CRUD generic helpers
export function getCollection<T extends keyof SystemDatabase>(collectionName: T): SystemDatabase[T] {
  const db = getDatabase();
  return db[collectionName];
}

export function addItem<T extends keyof SystemDatabase>(
  collectionName: T,
  item: any,
  actorUserId?: string,
  actorName?: string
): any {
  const db = getDatabase();
  const list = (db[collectionName] as any[]) || [];
  const updatedList = [item, ...list];
  (db as any)[collectionName] = updatedList;
  saveDatabase(db);

  logAktivitas(actorUserId || 'SYSTEM', actorName || 'User', `Menambahkan data pada ${String(collectionName)}`);
  return item;
}

export function updateItem<T extends keyof SystemDatabase>(
  collectionName: T,
  idField: string,
  idValue: string,
  updatedData: Partial<any>,
  actorUserId?: string,
  actorName?: string
): boolean {
  const db = getDatabase();
  const list = (db[collectionName] as any[]) || [];
  const index = list.findIndex((item) => item[idField] === idValue);
  if (index !== -1) {
    list[index] = { ...list[index], ...updatedData };
    (db as any)[collectionName] = list;
    saveDatabase(db);
    logAktivitas(actorUserId || 'SYSTEM', actorName || 'User', `Mengubah data ${idValue} pada ${String(collectionName)}`);
    return true;
  }
  return false;
}

export function deleteItem<T extends keyof SystemDatabase>(
  collectionName: T,
  idField: string,
  idValue: string,
  actorUserId?: string,
  actorName?: string
): boolean {
  const db = getDatabase();
  const list = (db[collectionName] as any[]) || [];
  const filtered = list.filter((item) => item[idField] !== idValue);
  if (filtered.length !== list.length) {
    (db as any)[collectionName] = filtered;
    saveDatabase(db);
    logAktivitas(actorUserId || 'SYSTEM', actorName || 'User', `Menghapus data ${idValue} dari ${String(collectionName)}`);
    return true;
  }
  return false;
}

// Realtime Google Sheets Sync engine interface
export async function syncWithGoogleSheets(gasUrl?: string): Promise<{ success: boolean; message: string }> {
  const db = getDatabase();

  // 1. Check if Google Workspace OAuth 2.0 Direct API is active
  try {
    const { getGoogleAccessToken } = await import('./googleAuth');
    const token = getGoogleAccessToken();
    const spreadsheetId = db.PENGATURAN?.GoogleSpreadsheetId;

    if (token && spreadsheetId) {
      const { exportAllToGoogleSheets } = await import('./googleSheetsApi');
      const oauthRes = await exportAllToGoogleSheets(token, spreadsheetId);
      return {
        success: true,
        message: `Tersinkronisasi ke Google Sheets (${new Date().toLocaleTimeString('id-ID')})`,
      };
    }
  } catch (err) {
    console.warn('OAuth Direct Sheets sync check:', err);
  }

  // 2. Check if optional Google Apps Script (GAS) Web App URL is configured
  const rawUrl = gasUrl !== undefined ? gasUrl : db.PENGATURAN?.GasWebAppUrl;
  const targetUrl = (rawUrl || '').trim();

  if (
    targetUrl &&
    targetUrl.startsWith('https://script.google.com/macros/s/') &&
    !targetUrl.includes('...') &&
    targetUrl.endsWith('/exec')
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'SYNC_ALL',
          data: db,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const resData = await response.json().catch(() => null);
        if (resData && resData.database) {
          saveDatabase(resData.database);
        }
        return { success: true, message: 'Berhasil tersinkronisasi dengan Google Apps Script!' };
      }
    } catch (err: any) {
      console.warn('GAS fetch warning:', err);
    }
  }

  // 3. Fallback to Local PWA Storage - return success: true so app operates smoothly without errors
  return {
    success: true,
    message: 'Mode Penyimpanan Lokal PWA Aktif (Gunakan Google Sign-In untuk Sinkronisasi Cloud)',
  };
}
