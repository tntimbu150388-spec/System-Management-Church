import { getDatabase, saveDatabase, getCollection, logAktivitas } from './db';
import { SystemDatabase } from '../types';

const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export interface SheetDetails {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
  sheets: string[];
}

/**
 * Creates a new Google Spreadsheet on user's Google Drive with church tabs
 */
export async function createChurchSpreadsheet(
  accessToken: string,
  title: string = 'CMS Gereja - Database'
): Promise<SheetDetails> {
  const sheetNames = [
    'JEMAAT',
    'KEUANGAN',
    'JADWAL',
    'USERS',
    'LOG_AKTIVITAS',
    'PENGUMUMAN',
    'RENUNGAN',
    'DOA',
    'INVENTARIS',
    'PELAYANAN',
  ];

  const body = {
    properties: {
      title: title,
    },
    sheets: sheetNames.map((name) => ({
      properties: {
        title: name,
      },
    })),
  };

  const response = await fetch(SHEETS_API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gagal membuat Google Spreadsheet (Status ${response.status})`
    );
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Save spreadsheet ID in LocalStorage settings
  const db = getDatabase();
  db.PENGATURAN.GoogleSpreadsheetId = spreadsheetId;
  saveDatabase(db);

  logAktivitas('SYSTEM', 'Google Sheets API', `Spreadsheet baru dibuat: ${spreadsheetId}`);

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: data.properties?.title || title,
    sheets: sheetNames,
  };
}

/**
 * Export all CMS database collections to Google Sheets tabs
 */
export async function exportAllToGoogleSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<{ success: boolean; message: string }> {
  const collections: (keyof SystemDatabase)[] = [
    'JEMAAT',
    'KEUANGAN',
    'JADWAL',
    'USERS',
    'LOG_AKTIVITAS',
    'PENGUMUMAN',
    'RENUNGAN',
    'DOA',
    'INVENTARIS',
    'PELAYANAN',
  ];

  const valueData: any[] = [];

  for (const colName of collections) {
    const items = (getCollection(colName) as any[]) || [];
    let headers: string[] = [];
    let rows: any[][] = [];

    if (Array.isArray(items) && items.length > 0) {
      headers = Object.keys(items[0]);
      rows = items.map((item: any) =>
        headers.map((h) => {
          const val = item[h];
          if (val === null || val === undefined) return '';
          if (typeof val === 'object') return JSON.stringify(val);
          return String(val);
        })
      );
    }

    const sheetValues = [headers, ...rows];

    valueData.push({
      range: `'${colName}'!A1`,
      values: sheetValues,
    });
  }

  const batchUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchUpdate`;

  const response = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: valueData,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal mengekspor data ke Google Sheets (Status ${response.status})`
    );
  }

  const db = getDatabase();
  db.PENGATURAN.LastSyncTimestamp = new Date().toLocaleString('id-ID');
  saveDatabase(db);

  logAktivitas('SYSTEM', 'Google Sheets Direct', 'Ekspor seluruh data CMS ke Google Sheets berhasil.');

  return {
    success: true,
    message: `Berhasil mengekspor ${valueData.length} tabel ke Google Sheets!`,
  };
}

/**
 * Import database collections from Google Sheets into CMS LocalStorage
 */
export async function importAllFromGoogleSheets(
  accessToken: string,
  spreadsheetId: string
): Promise<{ success: boolean; message: string }> {
  const collections = [
    'JEMAAT',
    'KEUANGAN',
    'JADWAL',
    'USERS',
    'LOG_AKTIVITAS',
    'PENGUMUMAN',
    'RENUNGAN',
    'DOA',
    'INVENTARIS',
    'PELAYANAN',
  ];

  const rangesParam = collections.map((c) => `ranges='${c}'!A1:Z5000`).join('&');
  const getUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values:batchGet?${rangesParam}`;

  const response = await fetch(getUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Gagal membaca data dari Google Sheets (Status ${response.status})`
    );
  }

  const result = await response.json();
  const valueRanges = result.valueRanges || [];

  const db = getDatabase();
  let updatedCount = 0;

  for (let i = 0; i < collections.length; i++) {
    const colName = collections[i] as keyof typeof db;
    const valueRange = valueRanges[i];

    if (valueRange && valueRange.values && valueRange.values.length > 1) {
      const [headers, ...rows] = valueRange.values;
      const parsedItems = rows.map((row: any[]) => {
        const item: any = {};
        headers.forEach((h: string, idx: number) => {
          item[h] = row[idx] !== undefined ? row[idx] : '';
        });
        return item;
      });

      if (parsedItems.length > 0) {
        (db as any)[colName] = parsedItems;
        updatedCount += parsedItems.length;
      }
    }
  }

  db.PENGATURAN.LastSyncTimestamp = new Date().toLocaleString('id-ID');
  saveDatabase(db);

  logAktivitas('SYSTEM', 'Google Sheets Direct', `Impor ${updatedCount} baris data dari Google Sheets.`);

  return {
    success: true,
    message: `Berhasil mengimpor data dari Google Sheets (${updatedCount} rekam data).`,
  };
}

/**
 * Check details of existing Google Spreadsheet
 */
export async function fetchSpreadsheetInfo(
  accessToken: string,
  spreadsheetId: string
): Promise<SheetDetails> {
  const response = await fetch(`${SHEETS_API_BASE}/${spreadsheetId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      err.error?.message || `Spreadsheet ID tidak valid atau tidak diizinkan (Status ${response.status})`
    );
  }

  const data = await response.json();
  const sheetNames = (data.sheets || []).map((s: any) => s.properties?.title || '');

  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}`,
    title: data.properties?.title || 'Spreadsheet Tanpa Judul',
    sheets: sheetNames,
  };
}
