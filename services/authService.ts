import { auth } from '../config/firebase';
import { signInAnonymously as firebaseSignInAnonymously, onAuthStateChanged as firebaseOnAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

/**
 * Sign in anonymously to Firebase
 * Creates a new anonymous user or retrieves existing one
 */
export const signInAnonymously = async (): Promise<FirebaseUser> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    console.log('✅ Signed in anonymously:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('❌ Anonymous sign-in failed:', error);
    throw new Error('Failed to sign in anonymously');
  }
};

/**
 * Get current authenticated user
 * Returns null if no user is signed in
 */
export const getCurrentAuthUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

/**
 * Listen to authentication state changes
 * Callback is called whenever user signs in or out
 */
export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Get current user's UID
 * Returns null if no user is authenticated
 */
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};
