import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Validate Firebase configuration (only used for error messages)
const validateFirebaseConfig = () => {
  const requiredVars = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName] === ""
  );

  return missingVars.length === 0;
};

// Firebase configuration
// These should be set via environment variables
const getFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "student-budi",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Validate that required fields are present and not empty
  if (!config.apiKey || config.apiKey === "your-api-key-here") {
    return null;
  }
  if (!config.authDomain || config.authDomain === "your-project-id.firebaseapp.com") {
    return null;
  }

  return config;
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let initializationAttempted = false;

// Lazy initialization function
const initializeFirebase = () => {
  if (initializationAttempted) {
    return { app, auth: authInstance };
  }

  initializationAttempted = true;

  // Only initialize on client side
  if (typeof window === "undefined") {
    return { app: null, auth: null };
  }

  try {
    // Get config first to check if it exists
    const firebaseConfig = getFirebaseConfig();
    
    if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.authDomain) {
      // Skip validation during initialization - just try to initialize
      // Validation will happen when auth functions are called
      try {
        if (getApps().length === 0) {
          app = initializeApp(firebaseConfig);
        } else {
          app = getApps()[0];
        }

        // Initialize Auth
        authInstance = getAuth(app);
      } catch (initError) {
        console.error("Firebase initialization error:", initError);
        app = null;
        authInstance = null;
      }
    } else {
      // Config is missing or invalid
      console.warn(
        "Firebase configuration is missing or invalid. Please check your .env.local file and restart the dev server."
      );
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }

  return { app, auth: authInstance };
};

// Export getter functions that initialize if needed
export const getAuthInstance = (): Auth | null => {
  if (typeof window === "undefined") return null;
  const { auth } = initializeFirebase();
  return auth;
};

// Don't initialize at module load - only when getAuthInstance is called
export const auth: Auth | null = null; // Will be initialized lazily

export const getApp = (): FirebaseApp | null => {
  if (typeof window === "undefined") return null;
  const { app } = initializeFirebase();
  return app;
};

export default null; // Will be initialized lazily

