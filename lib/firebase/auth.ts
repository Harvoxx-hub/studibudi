import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signInWithCustomToken,
  GoogleAuthProvider,
  User,
  getIdToken,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getAuthInstance } from "./config";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});


/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<string> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await getIdToken(userCredential.user);
    return idToken;
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<string> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const idToken = await getIdToken(userCredential.user);
    return idToken;
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google (popup)
 */
export const signInWithGoogle = async (): Promise<string> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await getIdToken(result.user);
    return idToken;
  } catch (error: any) {
    // If popup is blocked, try redirect
    if (error.code === "auth/popup-blocked" || error.code === "auth/popup-closed-by-user") {
      throw new Error("Popup was blocked. Please try again.");
    }
    // Handle Firebase config errors
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with Google (redirect)
 */
export const signInWithGoogleRedirect = async (): Promise<void> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};


/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error("No user is currently signed in.");
    }

    // Re-authenticate user
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Sign in with custom token (exchanges custom token for ID token)
 */
export const signInWithCustomTokenAuth = async (customToken: string): Promise<string> => {
  const auth = getAuthInstance();
  if (!auth) {
    const isProduction = typeof window !== "undefined" && window.location.hostname !== "localhost";
    const envHint = isProduction
      ? "Please configure Firebase environment variables in Vercel. See VERCEL_ENV_SETUP.md for setup instructions."
      : "Please set Firebase environment variables in your .env.local file. See FIREBASE_SETUP.md for setup instructions.";
    throw new Error(`Firebase authentication is not available. ${envHint}`);
  }
  try {
    const userCredential = await signInWithCustomToken(auth, customToken);
    const idToken = await getIdToken(userCredential.user);
    return idToken;
  } catch (error: any) {
    if (error.code === "auth/invalid-api-key" || error.code?.includes("config")) {
      throw new Error("Firebase configuration is invalid. Please check your environment variables.");
    }
    throw new Error(getAuthErrorMessage(error.code));
  }
};

/**
 * Get current user's ID token
 * @param forceRefresh - If true, forces a token refresh even if current token is valid
 */
export const getCurrentUserToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  const auth = getAuthInstance();
  if (!auth) {
    return null;
  }
  const user = auth.currentUser;
  if (!user) {
    return null;
  }
  try {
    return await getIdToken(user, forceRefresh);
  } catch (error) {
    console.error("Failed to get ID token:", error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const auth = getAuthInstance();
  if (!auth) {
    return null;
  }
  return auth.currentUser;
};

/**
 * Convert Firebase Auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/popup-blocked": "Popup was blocked. Please allow popups and try again.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/cancelled-popup-request": "Only one popup request is allowed at a time.",
    "auth/requires-recent-login": "Please sign in again to change your password.",
  };

  return errorMessages[errorCode] || "An authentication error occurred. Please try again.";
};

