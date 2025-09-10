import type { User } from "firebase/auth";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider, createUserWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth";

// Config from env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth instance
export const auth = getAuth(app);

// Providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const twitterProvider = new TwitterAuthProvider();

// Sign up with email + password
export async function signup(email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await sendEmailVerification(userCredential.user);
  }
  return userCredential;
}

// ✅ Get current user (with details)
export function getCurrentUser(): User | null {
  return auth.currentUser; // might be null if not logged in
}

// ✅ Listen for auth state changes (login/logout)
export function onUserStateChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ✅ Example: Convert User -> JSON-friendly object
export function formatUser(user: User) {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providerId: user.providerData[0]?.providerId,
    accessToken: (user as any).accessToken, // only available after login
  };
}
