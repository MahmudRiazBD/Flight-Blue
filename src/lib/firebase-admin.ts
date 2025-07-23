
/**
 * @fileoverview
 * This file initializes the Firebase Admin SDK for server-side operations.
 * It uses a singleton pattern to ensure that the app is initialized only once,
 * using explicit service account credentials for robust authentication.
 */
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuthSDK, Auth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestoreSDK, Firestore } from 'firebase-admin/firestore';

const ADMIN_APP_NAME = 'firebase-admin-app-singleton';

/**
 * Initializes and returns the Firebase Admin App instance using a service account.
 * Ensures that the app is initialized only once (Singleton pattern).
 * @returns {App} The Firebase Admin App instance.
 */
function getAdminApp(): App {
  const apps = getApps();
  const existingApp = apps.find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  // Check if the environment variable is set
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error(
      'The GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is not set.'
    );
  }

  // Parse the service account credentials from the environment variable
  const serviceAccount: ServiceAccount = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  );

  // Initialize the Firebase Admin App with the service account credentials
  return initializeApp(
    {
      credential: cert(serviceAccount),
    },
    ADMIN_APP_NAME
  );
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
