/**
 * @fileoverview
 * This file initializes the Firebase Admin SDK for server-side operations.
 * It uses a singleton pattern to ensure that the app is initialized only once.
 */
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth as getAdminAuthSDK, Auth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestoreSDK, Firestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'firebase-admin-app';

/**
 * Initializes and returns the Firebase Admin App instance.
 * Ensures that the app is initialized only once.
 * @returns {App} The Firebase Admin App instance.
 */
function getAdminApp(): App {
  const apps = getApps();
  const existingApp = apps.find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  // When no credentials are provided, the SDK attempts to use
  // Application Default Credentials (ADC). This is the recommended way
  // for Google Cloud environments like Cloud Run, Functions, etc.
  return initializeApp({}, ADMIN_APP_NAME);
}

/**
 * Returns an instance of the Firebase Admin Auth service.
 * @returns {Auth} The Firebase Admin Auth instance.
 */
export function getAdminAuth(): Auth {
  return getAdminAuthSDK(getAdminApp());
}

/**
 * Returns an instance of the Firebase Admin Firestore service.
 * @returns {Firestore} The Firebase Admin Firestore instance.
 */
export function getAdminFirestore(): Firestore {
  return getAdminFirestoreSDK(getAdminApp());
}
