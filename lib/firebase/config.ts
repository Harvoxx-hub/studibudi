import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

// Default project ID
const DEFAULT_PROJECT_ID = "student-budi";

// Firebase configuration with sensible defaults
// Similar to how API client handles environment variables
const getFirebaseConfig = () => {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || DEFAULT_PROJECT_ID;
  
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId: projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };

  // Only return null if apiKey is completely missing (required for Firebase to work)
  // But allow initialization to proceed - Firebase will handle validation
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
    // Get config - will have defaults if env vars not set
    const firebaseConfig = getFirebaseConfig();
    
    // Firebase requires apiKey to initialize - check if we have it
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "") {
      const isProduction = process.env.NODE_ENV === "production";
      const envHint = isProduction 
        ? "Please add NEXT_PUBLIC_FIREBASE_API_KEY to your Vercel environment variables. See VERCEL_ENV_SETUP.md for instructions."
        : "Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file. See FIREBASE_SETUP.md for instructions.";
      console.error(
        "Firebase API key not found. Firebase features will not work.\n" +
        envHint
      );
      return { app: null, auth: null };
    }
    
    // Try to initialize Firebase - let Firebase SDK handle validation
    try {
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Initialize Auth
      authInstance = getAuth(app);
    } catch (initError: any) {
      // Log the actual Firebase error for debugging
      console.warn("Firebase initialization error:", initError?.message || initError);
      // Still try to get existing app if available
      const apps = getApps();
      if (apps.length > 0) {
        app = apps[0];
        authInstance = getAuth(app);
      }
    }
  } catch (error) {
    // Non-fatal error - Firebase will handle errors when actually used
    console.warn("Firebase initialization warning:", error);
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

