import { initializeApp, FirebaseApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

// Check if Firebase should be used
const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Lazy initialization - only initialize if Firebase is enabled
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

if (useFirebase) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = initializeFirestore(app, { localCache: persistentLocalCache() });
    storage = getStorage(app);
    auth = getAuth(app);

    // Log Firebase initialization in development
    if (import.meta.env.DEV) {
      console.log('🔥 Firebase initialized:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain
      });
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  console.log('📦 Running in localStorage mode (Firebase disabled)');
}

export { app, db, storage, auth };
