/**
 * Firebase Firestore Cloud Realtime Database Integration
 * Enables instant multi-user, multi-device, multi-location synchronization for CMS Gereja.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SystemDatabase } from '../types';
import { getDatabase, saveDatabaseLocalOnly } from './db';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

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
      const docRef = doc(firestore, DOC_PATH, DOC_ID);
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
  const docRef = doc(firestore, DOC_PATH, DOC_ID);

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

