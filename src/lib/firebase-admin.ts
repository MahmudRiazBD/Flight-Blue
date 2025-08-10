
/**
 * @fileoverview
 * This file initializes the Firebase Admin SDK for server-side operations.
 * It uses a singleton pattern to ensure that the app is initialized only once,
 * using explicit service account credentials for robust authentication.
 */
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuthSDK, Auth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestoreSDK, Firestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'firebase-admin-app-singleton';

/**
 * Initializes and returns the Firebase Admin App instance using service account credentials
 * from environment variables.
 * Ensures that the app is initialized only once (Singleton pattern).
 * @returns {App} The Firebase Admin App instance.
 * @throws {Error} If the required environment variables are not set or invalid.
 */
function getAdminApp(): App {
  const apps = getApps();
  const existingApp = apps.find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  // This is the recommended and most robust way to handle credentials in various environments.
  // It relies on a single environment variable containing the entire service account JSON.
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!serviceAccountJson) {
    throw new Error('The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set. Please provide the full service account JSON in this variable.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    return initializeApp(
      {
        credential: cert(serviceAccount),
      },
      ADMIN_APP_NAME
    );
  } catch (error: any) {
     throw new Error(`Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Please ensure it's a valid, single-line JSON string. Error: ${error.message}`);
  }
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
