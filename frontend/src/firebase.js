/**
 * Firebase Configuration
 * Initializes Firebase services for the application
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration object with environment variables
 */
const firebaseConfig = getFirebaseConfig();

/**
 * Initialize Firebase application instance
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase authentication
 */
const auth = getAuth(app);

/**
 * Gets Firebase configuration from environment variables
 * @returns {Object} Firebase configuration object
 */
function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
}

export { app, auth };