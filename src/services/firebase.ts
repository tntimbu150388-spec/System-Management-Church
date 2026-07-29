/**
 * Firebase Firestore Cloud Realtime Database Integration
 * Enables instant multi-user, multi-device, multi-location synchronization for CMS Gereja.
 * Supports both platform default Firebase and custom Superadmin Firebase projects.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigDefault from '../../firebase-applet-config.json';
import { SystemDatabase, FirebaseCustomConfig } from '../types';
import { getDatabase, saveDatabaseLocalOnly } from './db';

const DOC_PATH = 'church_system';
const DOC_ID = 'main_database';

let listeners: Array<() => void> = [];
let lastSerializedData = '';
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let pendingDataToPush: SystemDatabase | null = null;

export function subscribeDatabaseChanges(callback: () => void): () => void {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

export function notifySubscribers(): void {
  listeners.forEach((cb) => cb());
}

/**
 * Returns active Firebase configuration (Custom Superadmin Firebase or Default Platform Firebase).
 */
export function getActiveFirebaseConfig() {
  try {
    const db = getDatabase();
    const custom = db?.PENGATURAN?.FirebaseCustomConfig;
    if (custom && custom.enabled && custom.apiKey && custom.projectId) {
      return {
        apiKey: custom.apiKey.trim(),
        authDomain: custom.authDomain?.trim() || `${custom.projectId.trim()}.firebaseapp.com`,
        projectId: custom.projectId.trim(),
        storageBucket: custom.storageBucket?.trim() || `${custom.projectId.trim()}.appspot.com`,
        messagingSenderId: custom.messagingSenderId?.trim() || '',
        appId: custom.appId?.trim() || '',
        databaseURL: custom.databaseURL?.trim() || '',
        firestoreDatabaseId: custom.firestoreDatabaseId?.trim() || '(default)',
        isCustom: true,
      };
    }
  } catch (err) {
    console.warn('Error reading custom Firebase config:', err);
  }

  return {
    ...firebaseConfigDefault,
    firestoreDatabaseId: firebaseConfigDefault.firestoreDatabaseId || '(default)',
    isCustom: false,
  };
}

/**
 * Gets active Firestore instance based on active configuration.
 */
export function getActiveFirestore(): Firestore {
  const config = getActiveFirebaseConfig();
  const appName = config.isCustom ? `custom-church-${config.projectId}` : '[DEFAULT]';

  const existingApp = getApps().find((a) => a.name === appName);
  const app =
    existingApp ||
    initializeApp(
      {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        databaseURL: config.databaseURL,
      },
      appName === '[DEFAULT]' ? undefined : appName
    );

  return getFirestore(app, config.firestoreDatabaseId || '(default)');
}

/**
 * Pushes local database updates to Firebase Firestore Cloud.
 * Uses a debounce timer to batch rapid changes and prevent Firestore queue exhaustion.
 */
export function pushToFirestore(data: SystemDatabase): void {
  pendingDataToPush = data;

  if (pushTimer) {
    clearTimeout(pushTimer);
  }

  pushTimer = setTimeout(async () => {
    if (!pendingDataToPush) return;
    const currentData = pendingDataToPush;
    pendingDataToPush = null;

    try {
      const serialized = JSON.stringify(currentData);
      // Skip redundant writes if data hasn't changed from what was last synced/received
      if (serialized === lastSerializedData) return;

      lastSerializedData = serialized;
      const fsDb = getActiveFirestore();
      const docRef = doc(fsDb, DOC_PATH, DOC_ID);
      await setDoc(docRef, {
        ...currentData,
        _lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore push warning:', err);
    }
  }, 1000); // 1-second debounce window
}

/**
 * Initializes real-time listener on Firestore.
 * Automatically receives live updates when any admin or user modifies data anywhere.
 */
export function initFirestoreRealtimeSync(): Unsubscribe {
  const fsDb = getActiveFirestore();
  const docRef = doc(fsDb, DOC_PATH, DOC_ID);

  // Seed remote Firestore database if it doesn't exist yet
  getDoc(docRef)
    .then((snap) => {
      if (!snap.exists()) {
        pushToFirestore(getDatabase());
      } else {
        const remoteData = snap.data();
        if (remoteData) {
          const { _lastUpdated, ...cleanDb } = remoteData;
          if (cleanDb && cleanDb.USERS && cleanDb.JEMAAT) {
            const serialized = JSON.stringify(cleanDb);
            lastSerializedData = serialized;
            saveDatabaseLocalOnly(cleanDb as SystemDatabase);
            notifySubscribers();
          }
        }
      }
    })
    .catch((err) => {
      console.warn('Firestore initial check warning:', err);
    });

  // Listen to real-time changes
  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (docSnap) => {
      // Ignore local pending writes to prevent echo loop
      if (docSnap.metadata.hasPendingWrites) {
        return;
      }

      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (remoteData) {
          // Remove internal metadata field before saving locally
          const { _lastUpdated, ...cleanDb } = remoteData;
          if (cleanDb && cleanDb.USERS && cleanDb.JEMAAT) {
            const serialized = JSON.stringify(cleanDb);
            // Skip redundant state updates if remote data matches local state
            if (serialized === lastSerializedData) return;

            lastSerializedData = serialized;
            saveDatabaseLocalOnly(cleanDb as SystemDatabase);
            notifySubscribers();
          }
        }
      }
    },
    (err) => {
      console.warn('Firestore realtime sync warning:', err);
    }
  );

  return unsubscribe;
}

/**
 * Tests connection to a custom Firebase project.
 */
export async function testFirebaseConnection(customConfig: FirebaseCustomConfig): Promise<{
  success: boolean;
  message: string;
}> {
  if (!customConfig.apiKey || !customConfig.projectId) {
    return {
      success: false,
      message: 'API Key dan Project ID wajib diisi untuk menguji koneksi Firebase.',
    };
  }

  try {
    const testAppName = `test-firebase-${Date.now()}`;
    const testApp = initializeApp(
      {
        apiKey: customConfig.apiKey.trim(),
        authDomain:
          customConfig.authDomain?.trim() || `${customConfig.projectId.trim()}.firebaseapp.com`,
        projectId: customConfig.projectId.trim(),
        storageBucket:
          customConfig.storageBucket?.trim() || `${customConfig.projectId.trim()}.appspot.com`,
        messagingSenderId: customConfig.messagingSenderId?.trim() || '',
        appId: customConfig.appId?.trim() || '',
        databaseURL: customConfig.databaseURL?.trim() || '',
      },
      testAppName
    );

    const testDb = getFirestore(testApp, customConfig.firestoreDatabaseId?.trim() || '(default)');
    const testDocRef = doc(testDb, 'church_system', 'connection_test');

    await setDoc(testDocRef, {
      testAt: new Date().toISOString(),
      status: 'OK',
      message: 'Uji koneksi Firebase Custom dari CMS Gereja berhasil!',
    });

    const snap = await getDoc(testDocRef);
    if (snap.exists()) {
      return {
        success: true,
        message: `Berhasil terhubung dan menulis data ke Project Firebase "${customConfig.projectId}"!`,
      };
    } else {
      return {
        success: false,
        message: 'Gagal verifikasi pembacaan ulang data dari Firestore.',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Gagal terhubung ke Firebase. Periksa API Key dan aturan Firestore.',
    };
  }
}


