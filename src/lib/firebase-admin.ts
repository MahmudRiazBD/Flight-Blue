
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
 * Initializes and returns the Firebase Admin App instance using a Base64 encoded
 * service account credential from environment variables.
 * This method is robust against formatting issues in .env files.
 * Ensures that the app is initialized only once (Singleton pattern).
 * @returns {App} The Firebase Admin App instance.
 * @throws {Error} If the required environment variable is not set or invalid.
 */
function getAdminApp(): App {
  const apps = getApps();
  const existingApp = apps.find(app => app.name === ADMIN_APP_NAME);
  if (existingApp) {
    return existingApp;
  }

  // Use a Base64 encoded credential to avoid parsing issues with .env files.
  const serviceAccountBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

  if (!serviceAccountBase64) {
    throw new Error('Firebase Admin initialization failed: The GOOGLE_APPLICATION_CREDENTIALS_BASE64 environment variable is not set. Please encode your service account JSON key to Base64 and add it to your environment variables.');
  }

  try {
    // Decode the Base64 string to get the original JSON string.
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf8');
    // Parse the decoded JSON string.
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    return initializeApp(
      {
        credential: cert(serviceAccount),
      },
      ADMIN_APP_NAME
    );
  } catch (error: any) {
     throw new Error(`Failed to parse the Base64 encoded service account credentials. Please ensure it's a valid Base64 string from your JSON key file. Error: ${error.message}`);
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
