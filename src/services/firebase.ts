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
import { getDatabase, saveDatabase } from './db';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

const DOC_PATH = 'church_system';
const DOC_ID = 'main_database';

let isRemoteUpdate = false;
let listeners: Array<() => void> = [];

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
 */
export async function pushToFirestore(data: SystemDatabase): Promise<void> {
  if (isRemoteUpdate) return;
  try {
    const docRef = doc(firestore, DOC_PATH, DOC_ID);
    await setDoc(docRef, {
      ...data,
      _lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore push error:', err);
  }
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
      }
    })
    .catch((err) => {
      console.warn('Firestore initial check warning:', err);
    });

  // Listen to real-time changes
  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (remoteData) {
          // Remove internal metadata field before saving locally
          const { _lastUpdated, ...cleanDb } = remoteData;
          if (cleanDb && cleanDb.USERS && cleanDb.JEMAAT) {
            isRemoteUpdate = true;
            saveDatabase(cleanDb as SystemDatabase);
            isRemoteUpdate = false;
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
