import { auth } from '../config/firebase';
import {
  signInAnonymously as firebaseSignInAnonymously,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';

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
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed up with email:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Email sign-up failed:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error('Failed to create account. Please try again.');
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in with email:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Email sign-in failed:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please sign up first.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/invalid-credential') {
      throw new Error('Invalid email or password.');
    }
    throw new Error('Failed to sign in. Please try again.');
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    console.log('✅ Signed in with Google:', userCredential.user.uid);
    return userCredential.user;
  } catch (error: any) {
    console.error('❌ Google sign-in failed:', error);
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup blocked by browser. Please allow popups and try again.');
    }
    throw new Error('Failed to sign in with Google. Please try again.');
  }
};

/**
 * Sign out current user
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign-out failed:', error);
    throw new Error('Failed to sign out');
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
