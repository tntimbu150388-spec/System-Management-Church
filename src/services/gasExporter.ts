/**
 * Google Apps Script (GAS) Code Generator
 * Generates the complete Code.gs script to deploy on Google Sheets as Web App Backend.
 */

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * ============================================================================
 * CHURCH MANAGEMENT SYSTEM (CMS) - GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * Salin dan tempel seluruh kode ini ke Google Sheets -> Extensions -> Apps Script
 * Lalu klik "Deploy" -> "New deployment" -> Select type "Web App":
 * - Execute as: "Me"
 * - Who has access: "Anyone"
 * ============================================================================
 */

const SHEET_NAMES = [
  "USERS",
  "JEMAAT",
  "KELUARGA",
  "PELAYANAN",
  "JADWAL",
  "ABSENSI",
  "PERSEMBAHAN",
  "KEUANGAN",
  "EVENT",
  "PENGUMUMAN",
  "DOA",
  "INVENTARIS",
  "KOMISI",
  "WILAYAH",
  "NOTIFIKASI",
  "LOG_AKTIVITAS",
  "PENGATURAN"
];

// Structural Headers for initial Sheet Creation
const HEADERS = {
  USERS: ["UserID", "Username", "PasswordHash", "Role", "Nama", "Email", "HP", "Status", "LastLogin"],
  JEMAAT: ["JemaatID", "UserID", "Nama", "NIK", "KK", "Gender", "TempatLahir", "TanggalLahir", "Alamat", "Wilayah", "HP", "Email", "Baptis", "TanggalBaptis", "Sidi", "TanggalSidi", "Status", "Foto"],
  KELUARGA: ["FamilyID", "NoKK", "KepalaKeluarga", "Alamat", "Wilayah", "AnggotaCount"],
  PELAYANAN: ["PelayananID", "NamaPelayanan", "Kategori", "Deskripsi"],
  JADWAL: ["JadwalID", "Tanggal", "Jam", "Ibadah", "Pelayanan", "Jemaat", "Status", "Lokasi"],
  ABSENSI: ["AbsensiID", "UserID", "JadwalID", "Hadir", "Jam", "Tipe", "Nama"],
  PERSEMBAHAN: ["PersembahanID", "UserID", "Jenis", "Nominal", "Tanggal", "Metode", "Catatan", "NamaJemaat"],
  KEUANGAN: ["TransaksiID", "Jenis", "Kategori", "Nominal", "Tanggal", "Keterangan"],
  EVENT: ["EventID", "Nama", "Tanggal", "Jam", "Lokasi", "Deskripsi", "Kategori", "Kapasitas", "Gambar", "PesertaCount"],
  PENGUMUMAN: ["PengumumanID", "Judul", "Isi", "Publish", "Target", "Tanggal"],
  DOA: ["DoaID", "UserID", "NamaPemohon", "Isi", "Kategori", "Status", "Tanggal", "TanggapanAdmin"],
  INVENTARIS: ["BarangID", "NamaBarang", "Kategori", "Lokasi", "Kondisi", "Jumlah", "TanggalPengadaan"],
  KOMISI: ["KomisiID", "NamaKomisi", "Ketua", "Deskripsi", "AnggotaCount"],
  WILAYAH: ["WilayahID", "NamaWilayah", "KetuaWilayah", "AlamatSekretariat"],
  NOTIFIKASI: ["NotifID", "UserID", "Judul", "Pesan", "Dibaca", "Tanggal", "Tipe"],
  LOG_AKTIVITAS: ["LogID", "UserID", "NamaUser", "Aktivitas", "Waktu", "IPAddress"],
  PENGATURAN: ["NamaGereja", "Logo", "Alamat", "Telepon", "Email", "Website", "Tema", "WarnaUtama", "GasWebAppUrl", "GoogleSheetID", "RealtimeSyncInterval"]
};

/**
 * Handle HTTP GET Requests (Realtime Fetch / Polling)
 */
function doGet(e) {
  setupDatabaseSheets();
  const db = getAllDatabaseData();
  return responseJSON({ status: "success", database: db });
}

/**
 * Handle HTTP POST Requests (Sync, Login, CRUD)
 */
function doPost(e) {
  try {
    setupDatabaseSheets();
    const contents = JSON.parse(e.postData.contents);
    const action = contents.action;

    if (action === "SYNC_ALL" && contents.data) {
      saveAllDatabaseData(contents.data);
      const updatedDb = getAllDatabaseData();
      return responseJSON({ status: "success", message: "Database synchronized", database: updatedDb });
    }

    if (action === "FETCH_ALL") {
      const db = getAllDatabaseData();
      return responseJSON({ status: "success", database: db });
    }

    return responseJSON({ status: "error", message: "Action not supported" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

/**
 * Ensures all 17 sheets exist with correct headers
 */
function setupDatabaseSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  SHEET_NAMES.forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (HEADERS[sheetName]) {
        sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setValues([HEADERS[sheetName]]);
        sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setFontWeight("bold").setBackground("#2563eb").setFontColor("#ffffff");
      }
    }
  });
}

/**
 * Read all data from all sheets into structured object
 */
function getAllDatabaseData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const db = {};

  SHEET_NAMES.forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      db[sheetName] = [];
      return;
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      db[sheetName] = sheetName === "PENGATURAN" ? {} : [];
      return;
    }

    const headers = data[0];
    const rows = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const obj = {};
      let hasData = false;
      for (let j = 0; j < headers.length; j++) {
        let val = row[j];
        if (val !== "" && val !== null && val !== undefined) hasData = true;
        obj[headers[j]] = val;
      }
      if (hasData) rows.push(obj);
    }

    if (sheetName === "PENGATURAN") {
      db[sheetName] = rows[0] || {};
    } else {
      db[sheetName] = rows;
    }
  });

  return db;
}

/**
 * Save complete object back to sheets
 */
function saveAllDatabaseData(db) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  SHEET_NAMES.forEach(function(sheetName) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    const headers = HEADERS[sheetName] || [];
    sheet.clearContents();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");

    let records = db[sheetName];
    if (sheetName === "PENGATURAN") {
      records = db[sheetName] ? [db[sheetName]] : [];
    }

    if (Array.isArray(records) && records.length > 0) {
      const rows = records.map(function(item) {
        return headers.map(function(h) {
          return item[h] !== undefined ? item[h] : "";
        });
      });
      sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }
  });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
}
