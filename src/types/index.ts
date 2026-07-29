/**
 * Church Management System (CMS) Data Types & Interfaces
 * Compatible with 17 Google Sheets tables
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'JEMAAT';

export type AccountStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE';

export interface User {
  UserID: string;
  Username: string;
  PasswordHash: string;
  Role: UserRole;
  Nama: string;
  Email: string;
  HP: string;
  Status: AccountStatus;
  LastLogin: string;
}

export interface Jemaat {
  JemaatID: string;
  UserID: string;
  Nama: string;
  NIK: string;
  KK: string;
  Gender: 'L' | 'P';
  TempatLahir: string;
  TanggalLahir: string;
  Alamat: string;
  Wilayah: string;
  HP: string;
  Email: string;
  Baptis: 'Ya' | 'Belum';
  TanggalBaptis?: string;
  Sidi: 'Ya' | 'Belum';
  TanggalSidi?: string;
  Status: 'Aktif' | 'Pindah' | 'Meninggal' | 'Pending';
  Foto?: string;
}

export interface Keluarga {
  FamilyID: string;
  NoKK: string;
  KepalaKeluarga: string;
  Alamat: string;
  Wilayah: string;
  AnggotaCount?: number;
}

export interface Pelayanan {
  PelayananID: string;
  NamaPelayanan: string;
  Kategori: string;
  Deskripsi: string;
}

export interface Jadwal {
  JadwalID: string;
  Tanggal: string;
  Jam: string;
  Ibadah: string;
  Pelayanan: string;
  Jemaat: string; // Assigned server or minister name
  Status: 'Jadwal' | 'Selesai' | 'Batal';
  Lokasi?: string;
}

export interface Absensi {
  AbsensiID: string;
  UserID: string;
  JadwalID: string;
  Hadir: 'Ya' | 'Tidak';
  Jam: string;
  Tipe: 'Jemaat' | 'Pelayan';
  Nama?: string;
}

export type JenisPersembahan = 'Perpuluhan' | 'Diakonia' | 'Misi' | 'Pembangunan' | 'Persembahan Umum' | 'Kasih';

export interface Persembahan {
  PersembahanID: string;
  UserID: string;
  Jenis: JenisPersembahan;
  Nominal: number;
  Tanggal: string;
  Metode: 'QRIS' | 'Transfer Bank' | 'Tunai' | 'Debit';
  Catatan?: string;
  NamaJemaat?: string;
}

export interface Keuangan {
  TransaksiID: string;
  Jenis: 'Pemasukan' | 'Pengeluaran';
  Kategori: string;
  Nominal: number;
  Tanggal: string;
  Keterangan: string;
  Bukti?: string;
}

export interface EventGereja {
  EventID: string;
  Nama: string;
  Tanggal: string;
  Jam?: string;
  Lokasi: string;
  Deskripsi: string;
  Kategori: 'Seminar' | 'Natal' | 'Paskah' | 'Retreat' | 'Camp' | 'Ibadah Khusus' | 'Lainnya';
  Kapasitas?: number;
  Gambar?: string;
  PesertaCount?: number;
}

export interface EventRegistrasi {
  RegID: string;
  EventID: string;
  UserID: string;
  Nama: string;
  Email: string;
  HP: string;
  TanggalReg: string;
  Status: 'Terdaftar' | 'Hadir' | 'Batal';
}

export interface Pengumuman {
  PengumumanID: string;
  Judul: string;
  Isi: string;
  Publish: boolean;
  Target: 'Semua' | 'Super Admin' | 'Admin' | 'Jemaat';
  Tanggal: string;
  Lampiran?: string;
}

export interface Doa {
  DoaID: string;
  UserID: string;
  NamaPemohon?: string;
  Isi: string;
  Kategori: 'Kesehatan' | 'Keluarga' | 'Pekerjaan' | 'Pendidikan' | 'Syukur' | 'Lainnya';
  Status: 'Pending' | 'Dalam Doa' | 'Terjawab';
  Tanggal: string;
  TanggapanAdmin?: string;
}

export interface Inventaris {
  BarangID: string;
  NamaBarang: string;
  Kategori: string;
  Lokasi: string;
  Kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  Jumlah: number;
  TanggalPengadaan: string;
}

export interface Komisi {
  KomisiID: string;
  NamaKomisi: string;
  Ketua: string;
  Deskripsi: string;
  AnggotaCount?: number;
}

export interface Wilayah {
  WilayahID: string;
  NamaWilayah: string;
  KetuaWilayah: string;
  AlamatSekretariat?: string;
}

export interface Notifikasi {
  NotifID: string;
  UserID: string;
  Judul: string;
  Pesan: string;
  Dibaca: boolean;
  Tanggal: string;
  Tipe?: 'Jadwal' | 'Pengumuman' | 'Event' | 'Doa' | 'Registrasi' | 'Sistem';
}

export interface LogAktivitas {
  LogID: string;
  UserID: string;
  NamaUser?: string;
  Aktivitas: string;
  Waktu: string;
  IPAddress: string;
}

export interface Pengaturan {
  NamaGereja: string;
  Logo: string;
  Alamat: string;
  Telepon: string;
  Email: string;
  Website: string;
  Tema: 'Light' | 'Dark' | 'System';
  WarnaUtama: string;
  GoogleSheetID?: string;
  GoogleSpreadsheetId?: string;
  GasWebAppUrl?: string;
  RealtimeSyncInterval?: number; // seconds
  LastSyncTimestamp?: string;
}

export interface Kunjungan {
  KunjunganID: string;
  JemaatID: string;
  NamaJemaat: string;
  Tanggal: string;
  Petugas: string;
  Tujuan: 'Pastoral' | 'Sakit' | 'Duka' | 'Suka Cita' | 'Penguatan';
  Catatan: string;
  Status: 'Rencana' | 'Selesai' | 'Batal';
}

export interface Renungan {
  RenunganID: string;
  Judul: string;
  AyatAlkitab: string;
  Isi: string;
  Penulis: string;
  Tanggal: string;
  Kategori: 'Harian' | 'Mingguan' | 'Pemuda' | 'Keluarga';
}

export interface SystemDatabase {
  USERS: User[];
  JEMAAT: Jemaat[];
  KELUARGA: Keluarga[];
  PELAYANAN: Pelayanan[];
  JADWAL: Jadwal[];
  ABSENSI: Absensi[];
  PERSEMBAHAN: Persembahan[];
  KEUANGAN: Keuangan[];
  EVENT: EventGereja[];
  PENGUMUMAN: Pengumuman[];
  DOA: Doa[];
  INVENTARIS: Inventaris[];
  KOMISI: Komisi[];
  WILAYAH: Wilayah[];
  NOTIFIKASI: Notifikasi[];
  LOG_AKTIVITAS: LogAktivitas[];
  PENGATURAN: Pengaturan;
  EVENT_REGISTRASI?: EventRegistrasi[];
  KUNJUNGAN?: Kunjungan[];
  RENUNGAN?: Renungan[];
}
