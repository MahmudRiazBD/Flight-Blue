
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

  // Directly use environment variables for service account details
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace newline characters in the private key
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };
  
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
     throw new Error(
      'Firebase Admin SDK credentials are not set in environment variables.'
    );
  }

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
