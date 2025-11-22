import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { User, Language } from '../../types';

/**
 * Ensure Firestore is initialized
 */
const ensureDb = () => {
  if (!db) {
    throw new Error('Firestore is not initialized. Make sure VITE_USE_FIREBASE=true is set.');
  }
  return db;
};

/**
 * Create a new user in Firestore
 */
export const createUser = async (
  authId: string,
  displayName: string,
  nativeLang: Language,
  pivotLang: Language
): Promise<User> => {
  const userRef = doc(ensureDb(), 'users', authId);

  const newUser: User = {
    id: authId,
    displayName,
    nativeLang,
    pivotLang,
  };

  try {
    const firestoreData: any = {
      displayName,
      nativeLang,
      pivotLang,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await setDoc(userRef, firestoreData);

    console.log('✅ User created:', authId);
    return newUser;
  } catch (error) {
    console.error('❌ Failed to create user:', error);
    throw new Error('Failed to create user');
  }
};

/**
 * Get user by ID
 */
export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(ensureDb(), 'users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        displayName: data.displayName,
        nativeLang: data.nativeLang,
        pivotLang: data.pivotLang,
        activePairId: data.activePairId,
        role: data.role,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    return null;
  }
};

/**
 * Update user data
 */
export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  const userRef = doc(ensureDb(), 'users', userId);

  try {
    // Filter out undefined values as Firestore doesn't support them
    const firestoreUpdates: any = { updatedAt: Timestamp.now() };

    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key];
      if (value !== undefined) {
        firestoreUpdates[key] = value;
      }
    });

    await updateDoc(userRef, firestoreUpdates);

    console.log('✅ User updated:', userId);
  } catch (error) {
    console.error('❌ Failed to update user:', error);
    throw new Error('Failed to update user');
  }
};

/**
 * Listen to user changes in real-time
 */
export const listenToUser = (
  userId: string,
  callback: (user: User | null) => void
): (() => void) => {
  const database = ensureDb();
  const userRef = doc(database, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const user: User = {
          id: snapshot.id,
          displayName: data.displayName,
          nativeLang: data.nativeLang,
          pivotLang: data.pivotLang,
          activePairId: data.activePairId,
          role: data.role,
        };
        callback(user);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ User listener error:', error);
      callback(null);
    }
  );
};
