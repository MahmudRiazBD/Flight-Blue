// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { NextResponse } from 'next/server';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyMBjo9WoRCCHxhx9bLeGRGNl2OpcPMFM",
  authDomain: "global-roam-elasz.firebaseapp.com",
  projectId: "global-roam-elasz",
  storageBucket: "global-roam-elasz.appspot.com",
  messagingSenderId: "398365154934",
  appId: "1:398365154934:web:a841c7570aa30ffe54c957"
};

// Initialize Firebase for client-side using a robust singleton pattern
function getFirebaseApp(): FirebaseApp {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

/**
 * Handles CORS pre-flight requests for API routes.
 * This should be called at the beginning of any API route handler that needs CORS.
 * @param {Request} request The incoming request object.
 * @returns {NextResponse | null} A NextResponse if it's a pre-flight request, otherwise null.
 */
export function handleCors(request: Request): NextResponse | null {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  return null;
}


export { getFirebaseApp };
