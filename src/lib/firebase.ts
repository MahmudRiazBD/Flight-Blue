
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

// Initialize Firebase on-demand
function getFirebaseApp(): FirebaseApp {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Add a check for the API key to provide a clearer error message
    // This check will only run on the client-side
    if (!firebaseConfig.apiKey && typeof window !== 'undefined') {
      throw new Error("Firebase API key is missing. Please check your .env.local file and ensure NEXT_PUBLIC_FIREBASE_API_KEY is set.");
    }
    
    if (getApps().length) {
        return getApp();
    }
    
    return initializeApp(firebaseConfig);
}

export { getFirebaseApp };
