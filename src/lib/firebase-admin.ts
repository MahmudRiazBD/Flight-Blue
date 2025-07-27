
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
 * Initializes and returns the Firebase Admin App instance using service account credentials
 * from environment variables.
 * Ensures that the app is initialized only once (Singleton pattern).
 * @returns {App} The Firebase Admin App instance.
 * @throws {Error} If the required environment variables are not set.
 */
function getAdminApp(): App {
  const apps = getApps();
  const existingApp = apps.find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // The private key needs to have its escaped newlines replaced with actual newlines.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Required Firebase Admin credentials (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set in environment variables.');
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

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
