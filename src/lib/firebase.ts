// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyMBjo9WoRCCHxhx9bLeGRGNl2OpcPMFM",
  authDomain: "global-roam-elasz.firebaseapp.com",
  projectId: "global-roam-elasz",
  storageBucket: "global-roam-elasz.appspot.com",
  messagingSenderId: "398365154934",
  appId: "1:398365154934:web:a841c7570aa30ffe54c957"
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const getFirebaseApp = () => app;

export { getFirebaseApp };
