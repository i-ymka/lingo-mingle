import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import type { User, Language } from '../../types';

/**
 * Create a new user in Firestore
 */
export const createUser = async (
  authId: string,
  displayName: string,
  nativeLang: Language,
  partnerNativeLang: Language,
  pivotLang: Language
): Promise<User> => {
  const userRef = doc(db, 'users', authId);

  const newUser: User = {
    id: authId,
    displayName,
    nativeLang,
    partnerNativeLang,
    pivotLang,
    pairId: undefined,
    role: undefined,
  };

  try {
    await setDoc(userRef, {
      ...newUser,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

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
  const userRef = doc(db, 'users', userId);

  try {
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        id: userSnap.id,
        displayName: data.displayName,
        nativeLang: data.nativeLang,
        partnerNativeLang: data.partnerNativeLang,
        pivotLang: data.pivotLang,
        pairId: data.pairId,
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
  const userRef = doc(db, 'users', userId);

  try {
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });

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
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const user: User = {
          id: snapshot.id,
          displayName: data.displayName,
          nativeLang: data.nativeLang,
          partnerNativeLang: data.partnerNativeLang,
          pivotLang: data.pivotLang,
          pairId: data.pairId,
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
