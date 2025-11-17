import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import type { Pair } from '../../types';

/**
 * Generate a random 6-digit invite code
 */
const generateInviteCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Create a new pair
 */
export const createPair = async (userId: string): Promise<Pair> => {
  const pairId = generateId();
  const inviteCode = generateInviteCode();
  const pairRef = doc(db, 'pairs', pairId);
  const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);

  const newPair: Pair = {
    id: pairId,
    createdAt: new Date().toISOString(),
    inviteCode,
    userIds: [userId, null],
  };

  try {
    // Create pair document
    await setDoc(pairRef, {
      inviteCode,
      userIds: [userId, null],
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    // Create invite code document for fast lookup
    await setDoc(inviteCodeRef, {
      pairId,
      createdAt: Timestamp.now(),
      used: false,
    });

    console.log('✅ Pair created:', pairId, 'Invite code:', inviteCode);
    return newPair;
  } catch (error) {
    console.error('❌ Failed to create pair:', error);
    throw new Error('Failed to create pair');
  }
};

/**
 * Join an existing pair using invite code
 */
export const joinPair = async (userId: string, inviteCode: string): Promise<Pair | null> => {
  try {
    // Find pair by invite code
    const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);
    const inviteCodeSnap = await getDoc(inviteCodeRef);

    if (!inviteCodeSnap.exists()) {
      console.log('❌ Invalid invite code:', inviteCode);
      return null;
    }

    const pairId = inviteCodeSnap.data().pairId;
    const pairRef = doc(db, 'pairs', pairId);
    const pairSnap = await getDoc(pairRef);

    if (!pairSnap.exists()) {
      console.log('❌ Pair not found:', pairId);
      return null;
    }

    const pairData = pairSnap.data();

    // Check if pair is already full
    if (pairData.userIds[1] !== null) {
      console.log('❌ Pair is full:', pairId);
      return null;
    }

    // Update pair with second user
    await updateDoc(pairRef, {
      userIds: [pairData.userIds[0], userId],
      status: 'active',
      updatedAt: Timestamp.now(),
    });

    // Mark invite code as used
    await updateDoc(inviteCodeRef, {
      used: true,
    });

    console.log('✅ Joined pair:', pairId);

    return {
      id: pairId,
      createdAt: pairData.createdAt.toDate().toISOString(),
      inviteCode: pairData.inviteCode,
      userIds: [pairData.userIds[0], userId],
    };
  } catch (error) {
    console.error('❌ Failed to join pair:', error);
    return null;
  }
};

/**
 * Get pair by ID
 */
export const getPair = async (pairId: string): Promise<Pair | null> => {
  const pairRef = doc(db, 'pairs', pairId);

  try {
    const pairSnap = await getDoc(pairRef);

    if (pairSnap.exists()) {
      const data = pairSnap.data();
      return {
        id: pairSnap.id,
        createdAt: data.createdAt.toDate().toISOString(),
        inviteCode: data.inviteCode,
        userIds: data.userIds,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Failed to get pair:', error);
    return null;
  }
};

/**
 * Get pair by invite code
 */
export const getPairByInviteCode = async (inviteCode: string): Promise<Pair | null> => {
  try {
    const inviteCodeRef = doc(db, 'inviteCodes', inviteCode);
    const inviteCodeSnap = await getDoc(inviteCodeRef);

    if (!inviteCodeSnap.exists()) {
      return null;
    }

    const pairId = inviteCodeSnap.data().pairId;
    return await getPair(pairId);
  } catch (error) {
    console.error('❌ Failed to get pair by invite code:', error);
    return null;
  }
};

/**
 * Listen to pair changes in real-time
 */
export const listenToPair = (
  pairId: string,
  callback: (pair: Pair | null) => void
): (() => void) => {
  const pairRef = doc(db, 'pairs', pairId);

  return onSnapshot(
    pairRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const pair: Pair = {
          id: snapshot.id,
          createdAt: data.createdAt.toDate().toISOString(),
          inviteCode: data.inviteCode,
          userIds: data.userIds,
        };
        callback(pair);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('❌ Pair listener error:', error);
      callback(null);
    }
  );
};
